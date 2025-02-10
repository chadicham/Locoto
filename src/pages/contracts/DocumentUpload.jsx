import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
  Card,
  Grid
} from '@mui/material';
import {
  Upload,
  InsertDriveFile,
  Delete,
  CheckCircle,
  Error
} from '@mui/icons-material';

const DocumentUpload = ({ onDocumentChange, documents, errors }) => {
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileSelect = (documentType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.multiple = documentType === 'vehiclePhotos';

    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      processFiles(files, documentType);
    };

    input.click();
  };

  const processFiles = async (files, documentType) => {
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Le fichier ${file.name} dépasse la taille maximale autorisée (5MB)`);
        continue;
      }

      setUploadProgress(prev => ({
        ...prev,
        [documentType]: 0
      }));

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          setUploadProgress(prev => ({
            ...prev,
            [documentType]: 100
          }));

          onDocumentChange(documentType, {
            name: file.name,
            type: file.type,
            data: e.target.result
          });
        };

        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [documentType]: progress
            }));
          }
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erreur lors du chargement du fichier:', error);
        setUploadProgress(prev => ({
          ...prev,
          [documentType]: 0
        }));
      }
    }
  };

  const documentTypes = [
    {
      id: 'idCard',
      label: "Pièce d'identité",
      description: 'Carte d\'identité ou passeport (recto/verso)',
      required: true
    },
    {
      id: 'drivingLicense',
      label: 'Permis de conduire',
      description: 'Permis de conduire en cours de validité (recto/verso)',
      required: true
    },
    {
      id: 'vehiclePhotos',
      label: 'Photos du véhicule',
      description: 'Photos de l\'état du véhicule',
      required: true,
      multiple: true
    }
  ];

  return (
    <Grid container spacing={3}>
      {documentTypes.map((docType) => (
        <Grid item xs={12} md={6} key={docType.id}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="500">
              {docType.label}
              {docType.required && ' *'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {docType.description}
            </Typography>

            {!documents[docType.id] ? (
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => handleFileSelect(docType.id)}
                fullWidth
                sx={{ mt: 2 }}
              >
                Sélectionner un fichier
              </Button>
            ) : (
              <Box sx={{ mt: 2 }}>
                <List dense>
                  <ListItem
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => onDocumentChange(docType.id, null)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <InsertDriveFile />
                    </ListItemIcon>
                    <ListItemText 
                      primary={documents[docType.id].name}
                      secondary={
                        errors[docType.id] ? (
                          <Typography variant="caption" color="error">
                            {errors[docType.id]}
                          </Typography>
                        ) : 'Document chargé'
                      }
                    />
                  </ListItem>
                </List>
              </Box>
            )}

            {uploadProgress[docType.id] > 0 && uploadProgress[docType.id] < 100 && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress[docType.id]} 
                />
              </Box>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DocumentUpload;