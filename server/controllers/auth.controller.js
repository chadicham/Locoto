const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/emailService');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

exports.register = catchAsync(async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 400);
    }
  
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber
    });
  
    const token = user.generateAuthToken();
  
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber, 
          subscription: user.subscription
        }
      }
    });
  });

  exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Tentative de connexion pour:', email);
    
    if (!email || !password) {
      throw new AppError('Email et mot de passe requis', 400);
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      throw new AppError('Email ou mot de passe incorrect', 401);
    }
    
    console.log('👤 Utilisateur trouvé:', user.email);
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Mot de passe valide:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour:', email);
      throw new AppError('Email ou mot de passe incorrect', 401);
    }
  
    const token = user.generateAuthToken();
    console.log('✅ Token généré pour:', email);
    
    // Mettre à jour la date de dernière connexion de manière asynchrone (ne pas attendre)
    user.lastLogin = Date.now();
    User.findByIdAndUpdate(user._id, { lastLogin: user.lastLogin }).catch(err => 
      console.error('Erreur mise à jour lastLogin:', err)
    );
  
    // Répondre immédiatement sans attendre la mise à jour
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,  
          subscription: user.subscription
        }
      }
    });
    
    console.log('✅ Connexion réussie pour:', email);
  });

exports.forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError('Aucun compte trouvé avec cet email', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
        Vous recevez cet email car vous avez demandé la réinitialisation du mot de passe de votre compte Locoto.
        Cliquez sur le lien suivant pour définir un nouveau mot de passe : ${resetURL}
        Ce lien expirera dans 30 minutes.
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Réinitialisation de votre mot de passe Locoto',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Email de réinitialisation envoyé'
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        throw new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.', 500);
    }
});

exports.resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Le lien de réinitialisation est invalide ou a expiré', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);

    res.status(200).json({
        status: 'success',
        token: jwtToken
    });
});

exports.updatePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
        throw new AppError('Mot de passe actuel incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});
