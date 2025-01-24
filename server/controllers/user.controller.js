const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

  if (!email || !password) {
    throw new AppError('Veuillez fournir un email et un mot de passe', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  const token = user.generateAuthToken();

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription
      }
    }
  });
});

// Autres méthodes du contrôleur...