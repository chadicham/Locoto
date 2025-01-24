const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentification requise'
            });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token invalide ou expiré'
                });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Utilisateur non trouvé'
                });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erreur lors de l\'authentification'
        });
    }
};

const restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            status: 'error',
            message: 'Accès non autorisé'
        });
    }
    next();
};

module.exports = {
    protect,
    restrictTo
};