import { loadStripe } from '@stripe/stripe-js';

// Utilisation de la variable d'environnement Vite
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

class StripeService {
  async initiateSubscription(planId) {
    try {
      const response = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajout de l'authentification
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la session');
      }

      const session = await response.json();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      throw new Error('Erreur lors de l\'initialisation du paiement');
    }
  }

  async getCurrentSubscription() {
    try {
      const response = await fetch('/api/subscription/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'abonnement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur abonnement:', error);
      throw new Error('Erreur lors de la récupération de l\'abonnement');
    }
  }

  async cancelSubscription() {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'annulation');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur annulation:', error);
      throw new Error('Erreur lors de l\'annulation de l\'abonnement');
    }
  }
}

export default new StripeService();