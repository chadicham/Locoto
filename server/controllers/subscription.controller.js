const { stripe, STRIPE_PLANS } = require('../config/stripe.config');
const User = require('../models/user.model');

// Création de session d'abonnement
exports.createSubscriptionSession = async (req, res) => {
  try {
    const { planId } = req.body;
    const user = req.user;

    let stripeCustomer = await getOrCreateStripeCustomer(user);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: STRIPE_PLANS[planId],
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: user.id
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur création session:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session' });
  }
};

// Récupération de l'abonnement actuel
exports.getCurrentSubscription = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripeCustomerId) {
      return res.json({ 
        planId: 'free',
        status: 'active'
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
    });

    if (!subscriptions.data.length) {
      return res.json({ 
        planId: 'free',
        status: 'active'
      });
    }

    const subscription = subscriptions.data[0];

    res.json({
      planId: getPlanIdFromStripePrice(subscription.items.data[0].price.id),
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end * 1000,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'abonnement' });
  }
};

// Gestion des webhooks Stripe
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(400).json({ error: error.message });
  }
};

// Annulation d'abonnement
exports.cancelSubscription = async (req, res) => {
  try {
    const user = req.user;

    if (!user.stripeCustomerId) {
      return res.status(400).json({ 
        error: 'Aucun abonnement actif trouvé' 
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
      status: 'active'
    });

    if (!subscriptions.data.length) {
      return res.status(400).json({ 
        error: 'Aucun abonnement actif trouvé' 
      });
    }

    const subscription = subscriptions.data[0];

    const canceledSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        cancel_at_period_end: true,
        metadata: {
          cancelReason: req.body.reason || 'Non spécifié'
        }
      }
    );

    await User.findByIdAndUpdate(user.id, {
      subscriptionCancelScheduled: true,
      subscriptionEndDate: new Date(canceledSubscription.current_period_end * 1000)
    });

    res.json({
      message: 'Abonnement annulé avec succès',
      effectiveDate: new Date(canceledSubscription.current_period_end * 1000)
    });

  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'annulation de l\'abonnement' 
    });
  }
};

// Réactivation d'abonnement
exports.reactivateSubscription = async (req, res) => {
  try {
    const user = req.user;

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
      status: 'active'
    });

    if (!subscriptions.data.length) {
      return res.status(400).json({ 
        error: 'Aucun abonnement trouvé' 
      });
    }

    const subscription = subscriptions.data[0];

    if (!subscription.cancel_at_period_end) {
      return res.status(400).json({ 
        error: 'L\'abonnement n\'est pas programmé pour être annulé' 
      });
    }

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false
    });

    await User.findByIdAndUpdate(user.id, {
      subscriptionCancelScheduled: false,
      subscriptionEndDate: null
    });

    res.json({
      message: 'Abonnement réactivé avec succès',
      subscription: {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });

  } catch (error) {
    console.error('Erreur réactivation abonnement:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la réactivation de l\'abonnement' 
    });
  }
};

// Fonctions utilitaires
async function getOrCreateStripeCustomer(user) {
  if (user.stripeCustomerId) {
    return await stripe.customers.retrieve(user.stripeCustomerId);
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      userId: user.id
    }
  });

  await User.findByIdAndUpdate(user.id, {
    stripeCustomerId: customer.id
  });

  return customer;
}

async function handleSubscriptionChange(subscription) {
  const userId = subscription.metadata.userId;
  
  await User.findByIdAndUpdate(userId, {
    subscriptionStatus: subscription.status,
    subscriptionPlan: getPlanIdFromStripePrice(subscription.items.data[0].price.id),
    subscriptionEnd: new Date(subscription.current_period_end * 1000)
  });
}

async function handleSubscriptionCancelled(subscription) {
  const userId = subscription.metadata.userId;
  
  await User.findByIdAndUpdate(userId, {
    subscriptionStatus: 'cancelled',
    subscriptionPlan: 'free',
    subscriptionEnd: new Date()
  });
}

async function handlePaymentSuccess(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;

  await User.findByIdAndUpdate(userId, {
    lastPaymentStatus: 'succeeded',
    lastPaymentDate: new Date()
  });
}

async function handlePaymentFailure(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;

  await User.findByIdAndUpdate(userId, {
    lastPaymentStatus: 'failed',
    paymentFailureCount: (user.paymentFailureCount || 0) + 1
  });
}

function getPlanIdFromStripePrice(stripePriceId) {
  return Object.entries(STRIPE_PLANS).find(
    ([key, value]) => value === stripePriceId
  )?.[0] || 'free';
}