import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user) || {
    firstName: 'John',
    lastName: 'Bee',
    email: 'john.doe@example.com',
    phone: '+41 79 176 85 44'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ici, nous ajouterons la logique de mise à jour du profil
    setSuccessMessage('Profil mis à jour avec succès');
    setIsEditing(false);
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
            {formData.firstName[0]}{formData.lastName[0]}
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
              disabled={!isEditing}
              fullWidth
            />
            <TextField
              label="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              fullWidth
            />
            <TextField
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              fullWidth
            />
          </Box>

          {isEditing ? (
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              sx={{ mt: 3 }}
              fullWidth
            >
              Enregistrer les modifications
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
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;