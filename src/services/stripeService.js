import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

class StripeService {
  async initiateSubscription(planId) {
    try {
      // Création de la session de paiement
      const response = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const session = await response.json();

      // Redirection vers la page de paiement Stripe
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error('Erreur lors de l'initialisation du paiement');
    }
  }

  async getCurrentSubscription() {
    try {
      const response = await fetch('/api/subscription/current');
      return await response.json();
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l'abonnement');
    }
  }

  async cancelSubscription() {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l'annulation');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Erreur lors de l'annulation de l'abonnement');
    }
  }
}

export default new StripeService();