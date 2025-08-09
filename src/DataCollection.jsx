import { Box, Typography, Stepper, Step, StepLabel, Button, Stack, Paper, Alert, Chip } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ImageIcon from '@mui/icons-material/Image';
import PanToolIcon from '@mui/icons-material/PanTool';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptureInput from './components/CaptureInput';
import { useCapture } from './context/CaptureContext';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarGuide from './components/AvatarGuide';
import FloatingStepVideo from './components/FloatingStepVideo';

const steps = [
  { label: 'Face Image', icon: <FaceIcon />, type: 'image', key: 'faceImage' },
  { label: 'Eye Image', icon: <VisibilityIcon />, type: 'image', key: 'eyeImage' },
  { label: 'Tongue Image', icon: <EmojiObjectsIcon />, type: 'image', key: 'tongueImage' },
  { label: 'Skin Image', icon: <ImageIcon />, type: 'image', key: 'skinImage' },
  { label: 'Nail Image', icon: <PanToolIcon />, type: 'image', key: 'nailImage' },
  { label: 'Voice/Audio', icon: <GraphicEqIcon />, type: 'audio', key: 'voiceAudio' },
];

function DataCollection() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const { images, setImages, audio, setAudio } = useCapture();
  const [error, setError] = useState('');

  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  
  // Check if current step has data
  const hasCurrentStepData = activeStep <= 4 
    ? images[['face','eye','tongue','skin','nail'][activeStep]]?.url
    : audio?.url;

  const handleNext = () => {
    if (isLastStep) {
      navigate('/results');
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleCapture = (file, url) => {
    if (activeStep <= 4) {
      const keys = ['face','eye','tongue','skin','nail'];
      const key = keys[activeStep];
      setImages((prev) => ({ ...prev, [key]: { file, url, ts: Date.now() } }));
    } else {
      setAudio({ blob: file, url });
    }
    setError('');
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < activeStep) return 'completed';
    if (stepIndex === activeStep) return 'active';
    return 'pending';
  };

  const getCompletedCount = () => {
    const imageCount = Object.values(images).filter(img => img?.url).length;
    const audioCount = audio?.url ? 1 : 0;
    return imageCount + audioCount;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
      px: 2
    }}>
      <Box maxWidth="1200px" mx="auto">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Health Data Collection
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Let's capture your health data step by step
          </Typography>
          
          {/* Progress indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Chip 
              label={`${getCompletedCount()}/${steps.length} completed`}
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </Box>

        {/* Stepper */}
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            sx={{ 
              '& .MuiStepLabel-root': {
                '&.Mui-completed': {
                  color: '#4caf50'
                },
                '&.Mui-active': {
                  color: '#1976d2'
                }
              }
            }}
          >
            {steps.map((step, idx) => (
              <Step key={step.label} completed={getStepStatus(idx) === 'completed'}>
                <StepLabel 
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-iconContainer': {
                      '&.Mui-completed': {
                        color: '#4caf50'
                      },
                      '&.Mui-active': {
                        color: '#1976d2'
                      }
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ 
              p: 6, 
              borderRadius: 3,
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {/* Avatar Guide */}
              <Box sx={{ mb: 4 }}>
                <AvatarGuide stepKey={activeStep <= 4 ? ['face','eye','tongue','skin','nail'][activeStep] : 'audio'} />
              </Box>
              {/* Floating step-specific video avatar (no controls) */}
              <FloatingStepVideo stepKey={activeStep <= 4 ? ['face','eye','tongue','skin','nail'][activeStep] : 'audio'} />
              {/* Step Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  Step {activeStep + 1}: {currentStep.label}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {activeStep <= 4 
                    ? `Capture a clear image of your ${currentStep.label.toLowerCase()} for analysis`
                    : 'Record your voice for breathing and heart rate analysis'
                  }
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Capture Component */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CaptureInput
                  label={currentStep.label}
                  initialUrl={activeStep <= 4 
                    ? images[['face','eye','tongue','skin','nail'][activeStep]]?.url
                    : audio?.url
                  }
                  onChange={handleCapture}
                  kind={currentStep.type}
                />
              </Box>

              {/* Navigation */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 6,
                pt: 4,
                borderTop: '1px solid #e0e0e0'
              }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3, 
                    px: 4,
                    py: 1.5,
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: 'rgba(25,118,210,0.04)'
                    }
                  }}
                >
                  Back
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {hasCurrentStepData && (
                    <Chip 
                      label="✓ Ready" 
                      color="success" 
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  )}
                  <Button
                    onClick={() => {
                      if (!hasCurrentStepData) {
                        setError(`Please add a ${currentStep.label.toLowerCase()} sample before continuing.`);
                        return;
                      }
                      setError('');
                      handleNext();
                    }}
                    variant="contained"
                    sx={{ 
                      borderRadius: 3, 
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                      boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(25,118,210,0.4)'
                      }
                    }}
                  >
                    {isLastStep ? 'Analyze Data' : 'Next Step'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* Help Section */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Each step includes guidance on how to capture the best quality data.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default DataCollection;
