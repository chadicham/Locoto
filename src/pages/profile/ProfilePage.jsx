import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';
import { updateUserProfile } from '../../services/userService';
import { updateUser } from '../../store/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => {
    console.log('État Redux actuel:', state.auth); // Log pour le débogage
    return state.auth.user;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('Données utilisateur reçues:', user); // Log pour le débogage
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await updateUserProfile(formData);
      dispatch(updateUser(response.data.user));
      setSuccessMessage('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la mise à jour du profil'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Mon Profil
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mr: 2
            }}
          >
            {formData.firstName?.[0]}{formData.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.email}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
              fullWidth
              required
            />
            <TextField
              label="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
              fullWidth
              required
            />
            <TextField
              label="Téléphone"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
              fullWidth
            />
          </Box>

          {isEditing ? (
            <Button
              type="submit"
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
              sx={{ mt: 3 }}
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outlined"
              startIcon={<Edit />}
              sx={{ mt: 3 }}
              fullWidth
            >
              Modifier le profil
            </Button>
          )}
        </form>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
      >
        <Alert severity="success" onClose={handleCloseSuccess}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;