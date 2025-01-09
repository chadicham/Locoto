import { Box, TextField, Button, InputAdornment } from '@mui/material';

const MobileForm = ({ children, onSubmit, submitLabel = 'Enregistrer' }) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        '& .MuiTextField-root': {
          mb: 2,
          width: '100%',
        },
        '& .MuiInputBase-root': {
          borderRadius: 2,
          minHeight: 48,
        },
        '& .MuiButton-root': {
          minHeight: 48,
          width: '100%',
          mt: 2,
        },
      }}
    >
      {children}
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
      >
        {submitLabel}
      </Button>
    </Box>
  );
};

export const MobileTextField = ({ startIcon: Icon, ...props }) => (
  <TextField
    variant="outlined"
    fullWidth
    InputProps={{
      startAdornment: Icon && (
        <InputAdornment position="start">
          <Icon color="action" />
        </InputAdornment>
      ),
    }}
    {...props}
  />
);

export default MobileForm;