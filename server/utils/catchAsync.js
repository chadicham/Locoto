/**
 * Fonction utilitaire pour capturer les erreurs asynchrones dans les contrôleurs
 * @param {Function} fn - Fonction asynchrone à envelopper
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => {
    if (typeof fn !== 'function') {
        throw new Error('catchAsync attend une fonction comme argument');
    }
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
};

// S'assurer que l'export est fait correctement
module.exports = catchAsync;