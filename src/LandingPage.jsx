import { Box, Typography, Button, Stack, useTheme, Grid, Accordion, AccordionSummary, AccordionDetails, Avatar, Container, Chip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaHeartbeat, FaUserMd, FaLock, FaMobileAlt, FaSmile, FaRocket, FaStar, FaCamera, FaMicrophone, FaShieldAlt, FaBrain, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/inter/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

// Typewriter effect for headline
const useTypewriter = (text, speed = 60) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
};

const trustedLogos = [
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
  'https://upload.wikimedia.org/wikipedia/commons/9/96/Material_UI_logo.svg',
];

const features = [
  {
    icon: <FaBrain size={32} color="#667eea" />, 
    title: 'AI-Powered Analysis', 
    desc: 'Advanced machine learning models provide accurate health insights in seconds.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: <FaShieldAlt size={32} color="#667eea" />, 
    title: 'Privacy First', 
    desc: 'Your data never leaves your device. Complete privacy and security.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: <FaMobileAlt size={32} color="#667eea" />, 
    title: 'Cross-Platform', 
    desc: 'Works seamlessly on any device - mobile, tablet, or desktop.',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: <FaUserMd size={32} color="#667eea" />, 
    title: 'Medical Grade', 
    desc: 'Developed with healthcare professionals and validated accuracy.',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: <FaChartLine size={32} color="#667eea" />, 
    title: 'Comprehensive Insights', 
    desc: 'Get detailed analysis of multiple health indicators in one scan.',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    icon: <FaRocket size={32} color="#667eea" />, 
    title: 'Instant Results', 
    desc: 'No waiting time. Get your health report immediately after scanning.',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
];

const testimonials = [
  {
    name: 'Dr. Sarah Lee',
    role: 'Family Physician',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    quote: 'This app is a game-changer for early health screening. The AI is surprisingly accurate and easy to use!'
  },
  {
    name: 'Ahmed M.',
    role: 'User',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote: 'I checked my health in 2 minutes from my phone. The results were clear and helpful.'
  },
  {
    name: 'Dr. Emily Chan',
    role: 'Telemedicine Specialist',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    quote: 'A fantastic tool for remote consultations. The privacy-first approach is a big plus.'
  },
];

const pricing = [
  {
    icon: <FaSmile size={32} color="#667eea" />,
    title: 'Basic',
    price: 'Free',
    features: ['Quick scan', 'Basic results', 'No account needed'],
    highlight: false,
  },
  {
    icon: <FaStar size={32} color="#667eea" />,
    title: 'Pro',
    price: '$9.99',
    features: ['Full AI report', 'Doctor review', 'Priority support'],
    highlight: true,
  },
];

const faqs = [
  {
    q: 'Is my data private?',
    a: 'Yes! All processing is done on your device. No images or audio are uploaded to the cloud.'
  },
  {
    q: 'How accurate are the results?',
    a: 'Our AI models are trained on thousands of samples and reviewed by doctors, but results are informational only.'
  },
  {
    q: 'Can I use this for my family?',
    a: 'Absolutely! The app is designed for all ages and is easy to use for everyone.'
  },
  {
    q: 'Do I need to install anything?',
    a: 'No, it works directly in your browser on any device.'
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const headline = useTypewriter('AI Health Screening, Instantly.');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      {/* Modern Sticky Header */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(102,126,234,0.3)'
                }}>
                  <FaHeartbeat size={20} color="white" />
                </Box>
                <Typography sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.5rem',
                  letterSpacing: '-0.02em', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  WebHealth
                </Typography>
              </Stack>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Button 
                  variant="text" 
                  sx={{ 
                    color: '#374151', 
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { 
                      background: 'rgba(102,126,234,0.1)',
                      color: '#667eea'
                    }
                  }} 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Home
                </Button>
                <Button 
                  variant="text" 
                  sx={{ 
                    color: '#374151', 
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { 
                      background: 'rgba(102,126,234,0.1)',
                      color: '#667eea'
                    }
                  }} 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Features
                </Button>
                <Button 
                  variant="text" 
                  sx={{ 
                    color: '#374151', 
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { 
                      background: 'rgba(102,126,234,0.1)',
                      color: '#667eea'
                    }
                  }} 
                  onClick={() => document.getElementById('howitworks')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  How it works
                </Button>
                <Button 
                  variant="contained" 
                  size="medium" 
                  sx={{ 
                    ml: 2, 
                    borderRadius: 3, 
                    textTransform: 'none', 
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 40px rgba(102,126,234,0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }} 
                  onClick={() => navigate('/collect')}
                >
                  Start Free
                </Button>
              </Stack>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Modern Hero Section */}
      <Box
        sx={{
          width: '100%',
          minHeight: { xs: '85vh', md: '95vh' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Elements */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(102,126,234,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118,75,162,0.15) 0%, transparent 50%)',
          zIndex: 0
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, lg: 8 },
            py: { xs: 6, md: 8 }
          }}>
            {/* Hero Content */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', lg: 'left' } }}>
              <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8 }}
              >
                {/* Headline and subheadline */}
                <Typography
                  variant="h1"
                  fontWeight={700}
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: { xs: 36, md: 64 },
                    mb: 3,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {headline}
                  <span style={{ color: '#667eea' }}>|</span>
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#6b7280',
                    mb: 6,
                    fontWeight: 400,
                    fontSize: { xs: 18, md: 24 },
                    lineHeight: 1.5,
                  }}
                >
                  Get instant health insights from your face, eyes, tongue, skin, nails, and voice. All powered by AI. All from your browser.
                </Typography>
                
                {/* CTA Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', lg: 'flex-start' }} alignItems="center">
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: 18,
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 12px 40px rgba(102,126,234,0.4)',
                        transform: 'translateY(-2px)'
                      },
                      minWidth: 200,
                    }}
                    onClick={() => navigate('/collect')}
                  >
                    Start Health Check
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: 18,
                      fontWeight: 600,
                      borderRadius: 3,
                      borderColor: '#667eea',
                      color: '#667eea',
                      textTransform: 'none',
                      '&:hover': { 
                        borderColor: '#5a6fd8', 
                        color: '#5a6fd8',
                        background: 'rgba(102,126,234,0.05)'
                      },
                      minWidth: 200,
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </motion.div>
            </Box>

            {/* Hero Animation */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{ 
                  width: { xs: 280, md: 400 }, 
                  height: { xs: 280, md: 400 }, 
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(102,126,234,0.2)'
                }}>
                  <FaHeartbeat size={120} color="#667eea" />
                </Box>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Trusted by Section */}
      <Box sx={{ width: '100%', py: 8, background: 'rgba(255,255,255,0.8)' }}>
        <Container maxWidth="lg">
          <Typography variant="subtitle1" sx={{ color: '#6b7280', textAlign: 'center', mb: 4, fontWeight: 500 }}>
            Trusted and used by teams around the globe
          </Typography>
          <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" flexWrap="wrap">
            {trustedLogos.map((logo, idx) => (
              <Box key={idx} component="img" src={logo} alt="logo" sx={{ height: 40, mx: 3, opacity: 0.6, filter: 'grayscale(1)' }} />
            ))}
          </Stack>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box id="features" sx={{ width: '100%', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ color: '#1f2937', fontWeight: 700, mb: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center', fontSize: { xs: 32, md: 48 } }}>
            Why Choose Us?
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((f, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <motion.div 
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  whileHover={{ y: -8, scale: 1.02 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Box sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(102,126,234,0.1)',
                    borderRadius: 4,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(102,126,234,0.15)',
                      borderColor: 'rgba(102,126,234,0.3)',
                    }
                  }}>
                    <Box sx={{ 
                      mb: 3, 
                      p: 2, 
                      borderRadius: 3, 
                      background: f.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64
                    }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h5" sx={{ color: '#1f2937', fontWeight: 600, mb: 2, fontFamily: 'Inter, sans-serif' }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                      {f.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* How It Works Section */}
      <Box id="howitworks" sx={{ width: '100%', py: { xs: 8, md: 12 }, background: 'rgba(255,255,255,0.8)' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ color: '#1f2937', fontWeight: 700, mb: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center', fontSize: { xs: 32, md: 48 } }}>
            How It Works
          </Typography>
          <Typography variant="h5" sx={{ color: '#6b7280', mb: 8, textAlign: 'center', fontWeight: 400, maxWidth: 800, mx: 'auto' }}>
            Get your health insights in just 3 simple steps
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {[
              { step: 1, title: 'Capture', desc: 'Take photos of your face, eyes, tongue, skin, and nails. Record your voice for breathing analysis.', icon: <FaCamera size={32} color="#667eea" /> },
              { step: 2, title: 'Analyze', desc: 'Our AI processes your data using advanced machine learning models to detect health patterns and indicators.', icon: <FaBrain size={32} color="#667eea" /> },
              { step: 3, title: 'Get Results', desc: 'Receive detailed health insights, recommendations, and optional doctor review within seconds.', icon: <FaChartLine size={32} color="#667eea" /> }
            ].map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <motion.div 
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                >
                  <Box sx={{
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: 4,
                    border: '1px solid rgba(102,126,234,0.1)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': { 
                      transform: 'translateY(-8px)', 
                      boxShadow: '0 20px 40px rgba(102,126,234,0.15)',
                      transition: 'all 0.3s ease'
                    },
                  }}>
                    <Box sx={{
                      p: 4,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {/* Step Number */}
                      <Box sx={{
                        position: 'absolute',
                        top: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 24,
                        fontWeight: 700,
                        boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
                      }}>
                        {step.step}
                      </Box>
                      
                      {/* Icon */}
                      <Box sx={{ 
                        mt: 4, 
                        mb: 3, 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80
                      }}>
                        {step.icon}
                      </Box>
                      
                      <Typography variant="h4" sx={{ color: '#1f2937', fontWeight: 600, mb: 2, fontSize: { xs: 20, md: 24 } }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.6, fontSize: { xs: 14, md: 16 } }}>
                        {step.desc}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Pricing Section */}
      <Box sx={{ width: '100%', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ color: '#1f2937', fontWeight: 700, mb: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center', fontSize: { xs: 32, md: 48 } }}>
            Pricing
          </Typography>
          <Grid container spacing={4} justifyContent="center" maxWidth="800px" mx="auto">
            {pricing.map((p, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <motion.div 
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Box sx={{
                    background: p.highlight ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.9)',
                    borderRadius: 4,
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    border: p.highlight ? 'none' : '1px solid rgba(102,126,234,0.1)',
                    boxShadow: p.highlight ? '0 20px 40px rgba(102,126,234,0.3)' : '0 10px 30px rgba(0,0,0,0.06)',
                    color: p.highlight ? '#fff' : '#1f2937',
                    backdropFilter: 'blur(10px)',
                  }}>
                    {p.icon}
                    <Typography variant="h4" sx={{ fontWeight: 600, mt: 2 }}>{p.title}</Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, my: 2 }}>{p.price}</Typography>
                    <Stack spacing={2} mb={3} width="100%">
                      {p.features.map((f, i) => (
                        <Typography key={i} variant="body1" sx={{ opacity: 0.9 }}>
                          {f}
                        </Typography>
                      ))}
                    </Stack>
                    <Button 
                      variant={p.highlight ? 'contained' : 'outlined'} 
                      size="large" 
                      sx={{ 
                        mt: 2, 
                        fontWeight: 600, 
                        borderColor: p.highlight ? 'transparent' : '#667eea', 
                        color: p.highlight ? '#667eea' : '#667eea', 
                        background: p.highlight ? '#fff' : 'transparent',
                        '&:hover': { 
                          background: p.highlight ? '#f5f5f5' : '#667eea',
                          color: p.highlight ? '#667eea' : '#fff'
                        }
                      }}
                    >
                      {p.highlight ? 'Get Pro' : 'Start Free'}
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* FAQ Section */}
      <Box sx={{ width: '100%', py: { xs: 8, md: 12 }, background: 'rgba(255,255,255,0.8)' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ color: '#1f2937', fontWeight: 700, mb: 6, fontFamily: 'Inter, sans-serif', textAlign: 'center', fontSize: { xs: 32, md: 48 } }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Accordion sx={{ 
                background: 'rgba(255,255,255,0.9)', 
                mb: 2, 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(10px)',
                '&:before': { display: 'none' }
              }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.6 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Container>
      </Box>
      
      {/* Final CTA Section */}
      <Box sx={{ width: '100%', py: { xs: 8, md: 12 }, textAlign: 'center', background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}>
        <Container maxWidth="lg">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.7 }}
          >
            <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 700, mb: 4, fontFamily: 'Inter, sans-serif', fontSize: { xs: 32, md: 48 } }}>
              Ready to check your health?
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.8)', mb: 6, fontWeight: 400 }}>
              Join thousands of users who trust our AI-powered health screening.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: 20,
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  textTransform: 'none',
                  boxShadow: '0 12px 32px rgba(102,126,234,0.35)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 16px 40px rgba(102,126,234,0.4)',
                    transform: 'translateY(-2px)'
                  },
                }}
                onClick={() => navigate('/register')}
              >
                🌟 Start Your Health Journey
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: 16,
                  fontWeight: 500,
                  borderRadius: 3,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  textTransform: 'none',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  },
                }}
                onClick={() => navigate('/collect')}
              >
                Quick Check (No Registration)
              </Button>
            </Box>
          </motion.div>
          
          {/* Footer */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" mt={8} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <Typography variant="body2">© {new Date().getFullYear()} WebHealth. All rights reserved.</Typography>
            <Stack direction="row" spacing={3}>
              <Button variant="text" size="small" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none' }} onClick={() => navigate('/disclaimer')}>
                Disclaimer
              </Button>
              <Button variant="text" size="small" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none' }}>
                Privacy
              </Button>
              <Button variant="text" size="small" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none' }}>
                Terms
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
