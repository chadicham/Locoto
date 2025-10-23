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
      cancel_url: `${process.env.FRONTEND_URL}/subscription`,
      metadata: {
        userId: user.id,
        planId: planId
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId
        }
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
      case 'checkout.session.completed':
        const session = event.data.object;
        // Récupérer l'abonnement créé
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await handleSubscriptionChange(subscription);
        break;
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

exports.checkSession = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Si le paiement est réussi, on renvoie les détails du plan
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      res.json({
        success: true,
        planId: getPlanIdFromStripePrice(subscription.items.data[0].price.id),
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000
      });
    } else {
      res.json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Erreur vérification session:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de la session' });
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
  // Vérifier si le user a déjà un subscription.stripeCustomerId
  const stripeCustomerId = user.subscription?.stripeCustomerId || user.stripeCustomerId;
  
  if (stripeCustomerId) {
    try {
      return await stripe.customers.retrieve(stripeCustomerId);
    } catch (error) {
      console.log('Customer not found, creating new one');
    }
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      userId: user.id
    }
  });

  await User.findByIdAndUpdate(user.id, {
    'subscription.stripeCustomerId': customer.id
  });

  return customer;
}

async function handleSubscriptionChange(subscription) {
  const userId = subscription.metadata.userId;
  const planId = getPlanIdFromStripePrice(subscription.items.data[0].price.id);
  
  // Déterminer la limite de véhicules selon le plan
  const vehicleLimits = {
    'starter': 3,
    'pro': 10,
    'business': 25,
    'unlimited': 999999
  };
  
  await User.findByIdAndUpdate(userId, {
    'subscription.plan': planId,
    'subscription.subscriptionStatus': subscription.status,
    'subscription.stripeSubscriptionId': subscription.id,
    'subscription.vehicleLimit': vehicleLimits[planId] || 1,
    'subscription.expiresAt': new Date(subscription.current_period_end * 1000)
  });
  
  console.log(`✅ Abonnement mis à jour pour l'utilisateur ${userId}: plan=${planId}, status=${subscription.status}`);
}

async function handleSubscriptionCancelled(subscription) {
  const userId = subscription.metadata.userId;
  
  await User.findByIdAndUpdate(userId, {
    'subscription.subscriptionStatus': 'cancelled',
    'subscription.plan': 'gratuit',
    'subscription.vehicleLimit': 1,
    'subscription.expiresAt': new Date()
  });
  
  console.log(`❌ Abonnement annulé pour l'utilisateur ${userId}`);
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