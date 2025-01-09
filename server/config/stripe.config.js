const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const STRIPE_PLANS = {
  free: 'gratuit',
  starter: 'price_starter',
  pro: 'price_pro',
  business: 'price_business',
  unlimited: 'price_unlimited'
};

module.exports = {
  stripe,
  STRIPE_PLANS
};