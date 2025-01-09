import { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert
} from '@mui/material';
import { Clear, Save } from '@mui/icons-material';

const SignatureCanvas = ({ onSignatureCapture, label, error }) => {
  const signaturePadRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    signaturePadRef.current.clear();
    setIsEmpty(true);
    onSignatureCapture(null);
  };

  const handleSave = () => {
    if (!signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      onSignatureCapture(signatureData);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {label}
        </Typography>
        
        <Box 
          sx={{ 
            border: (theme) => `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
            borderRadius: 1,
            bgcolor: 'background.paper',
            mb: 2
          }}
        >
          <SignaturePad
            ref={signaturePadRef}
            canvasProps={{
              className: 'signature-canvas',
              style: {
                width: '100%',
                height: '200px'
              }
            }}
            onBegin={() => setIsEmpty(false)}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<Clear />}
            onClick={handleClear}
            variant="outlined"
            color="inherit"
          >
            Effacer
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSave}
            variant="contained"
            disabled={isEmpty}
          >
            Valider
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SignatureCanvas;