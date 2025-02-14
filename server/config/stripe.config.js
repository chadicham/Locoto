const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const STRIPE_PLANS = {
  'starter': 'price_1Qs9siDmgkPAsWEpdYRmXcz0',
  'pro': 'price_1QsPtxDmgkPAsWEpvjS0xOnJ',
  'business': 'price_1QsPudDmgkPAsWEpWCU9ud64',
  'unlimited': 'price_1QsPvkDmgkPAsWEpgTvhFkn3'
};

module.exports = {
  stripe,
  STRIPE_PLANS
};