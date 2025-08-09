import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function Disclaimer() {
  return (
    <Box py={8} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Card sx={{ minWidth: 320, maxWidth: 420, mx: 'auto', boxShadow: 4, borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2} alignItems="center">
            <WarningAmberIcon sx={{ fontSize: 48, color: '#ff9800' }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Disclaimer
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              This app is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Disclaimer;
