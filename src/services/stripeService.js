import { loadStripe } from '@stripe/stripe-js';

const API_URL = import.meta.env.VITE_API_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

class StripeService {
  getPriceIdFromPlan(planId) {
    const planPriceMap = {
      'starter': 'price_1Qs9siDmgkPAsWEpdYRmXcz0',
      'pro': 'price_1QsPtxDmgkPAsWEpvjS0xOnJ',
      'business': 'price_1QsPudDmgkPAsWEpWCU9ud64',
      'unlimited': 'price_1QsPvkDmgkPAsWEpgTvhFkn3'
    };
    return planPriceMap[planId];
  }

  async checkSession(sessionId) {
    try {
      const response = await fetch(`${API_URL}/subscriptions/check-session?session_id=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification de la session');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Erreur vérification session:', error);
      throw new Error('Erreur lors de la vérification de la session');
    }
  }

  async initiateSubscription(planId) {
    try {
      const priceId = this.getPriceIdFromPlan(planId);
      
      const response = await fetch(`${API_URL}/subscriptions/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId // Envoyez seulement planId, pas priceId
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la session');
      }
  
      const session = await response.json();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.sessionId // Notez le changement ici : session.sessionId au lieu de session.id
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
      const response = await fetch(`${API_URL}/subscriptions/current`, {
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

  async cancelSubscription(data) {
    try {
      const response = await fetch(`${API_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
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