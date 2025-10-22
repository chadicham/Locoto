// Rate limiter simple basé sur la mémoire
// Pour une solution en production, utiliser express-rate-limit avec Redis

const rateLimit = new Map();

const rateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes par défaut
        max = 100, // Limite de 100 requêtes par fenêtre
        message = 'Trop de requêtes, veuillez réessayer plus tard.'
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!rateLimit.has(key)) {
            rateLimit.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const record = rateLimit.get(key);

        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return next();
        }

        if (record.count >= max) {
            return res.status(429).json({
                error: message,
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            });
        }

        record.count++;
        next();
    };
};

// Nettoyer les anciennes entrées toutes les heures
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimit.entries()) {
        if (now > value.resetTime) {
            rateLimit.delete(key);
        }
    }
}, 60 * 60 * 1000);

module.exports = rateLimiter;
