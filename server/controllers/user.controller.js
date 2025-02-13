const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Conserver les fonctions existantes
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

// Ajouter la nouvelle fonction getProfile
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.status(200).json({
    status: 'success',
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

// Conserver la fonction updateProfile existante
exports.updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  if (updates.email) {
    const existingUser = await User.findOne({ 
      email: updates.email,
      _id: { $ne: req.user._id }
    });
    
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé par un autre compte', 400);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        subscription: updatedUser.subscription
      }
    }
  });
});

exports.updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Veuillez fournir le mot de passe actuel et le nouveau mot de passe', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Le mot de passe actuel est incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Mot de passe mis à jour avec succès'
  });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        subscription: user.subscription
      }))
    }
  });
});

exports.createUser = catchAsync(async (req, res) => {
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

  res.status(201).json({
    status: 'success',
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

exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new AppError('Aucun utilisateur trouvé avec cet ID', 404);
  }

  res.status(200).json({
    status: 'success',
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

exports.updateUser = catchAsync(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'subscription'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  if (updates.email) {
    const existingUser = await User.findOne({ 
      email: updates.email,
      _id: { $ne: req.params.id }
    });
    
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé par un autre compte', 400);
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new AppError('Aucun utilisateur trouvé avec cet ID', 404);
  }

  res.status(200).json({
    status: 'success',
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

exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError('Aucun utilisateur trouvé avec cet ID', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});