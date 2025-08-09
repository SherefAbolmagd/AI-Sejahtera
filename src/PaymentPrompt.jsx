import { Box, Typography, Card, CardContent, Button, Stack } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

function PaymentPrompt() {
  return (
    <Box py={8} display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Card sx={{ minWidth: 350, maxWidth: 420, mx: 'auto', boxShadow: 6, borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <MonetizationOnIcon sx={{ fontSize: 60, color: '#185a9d' }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Unlock Full Report
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Get a detailed health analysis and recommendations for just <b>$9.99</b>.
            </Typography>
            <Button variant="contained" size="large" color="secondary" sx={{ px: 6, py: 1.5, fontWeight: 'bold', fontSize: 20 }}>
              Pay Now
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PaymentPrompt;
