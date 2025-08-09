import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  InputAdornment,
  Switch,
  Stack,
  Divider,
} from '@mui/material';
import {
  Person,
  HealthAndSafety,
  Flag,
  Settings,
  NavigateNext,
  NavigateBefore,
  Save,
  EmojiEvents,
  Star,
  LocalFireDepartment,
  FitnessCenter,
  MonitorHeart,
  WaterDrop,
  Hotel,
  SelfImprovement,
  Psychology,
  Favorite,
  Add,
  Remove,
  CheckCircle,
  Celebration,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const avatarOptions = ['👨‍⚕️', '👩‍⚕️', '🧑‍💼', '👨‍💻', '👩‍💻', '🧑‍🎨', '👨‍🏫', '👩‍🏫', '🧑‍🌾', '👨‍🍳', '👩‍🍳', '🧑‍🔧'];

const HealthRegistration = ({ onRegistrationComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form data
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    avatar: '👤'
  });

  const [healthMetrics, setHealthMetrics] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    bloodSugar: '',
    cholesterol: '',
    sleepHours: 7,
    exerciseFreq: 3,
    waterIntake: 8,
    stressLevel: 3
  });

  const [goals, setGoals] = useState([]);
  const [preferences, setPreferences] = useState({
    notifications: true,
    reminderTime: '09:00',
    language: 'en'
  });

  // Gamification state
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedSections, setCompletedSections] = useState([]);

  const steps = [
    {
      label: 'Personal Info',
      icon: <Person />,
      description: 'Tell us about yourself',
      xp: 25
    },
    {
      label: 'Health Metrics',
      icon: <MonitorHeart />,
      description: 'Current health status',
      xp: 35
    },
    {
      label: 'Goals & Lifestyle',
      icon: <Flag />,
      description: 'Your health objectives',
      xp: 25
    },
    {
      label: 'Preferences',
      icon: <Settings />,
      description: 'Customize your experience',
      xp: 15
    }
  ];

  const handleStepComplete = (stepIndex) => {
    if (!completedSections.includes(stepIndex)) {
      const stepXp = steps[stepIndex].xp;
      setXp(prev => prev + stepXp);
      setCompletedSections(prev => [...prev, stepIndex]);
      
      // Level up logic
      const newLevel = Math.floor((xp + stepXp) / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }
    }
  };

  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return personalInfo.name && personalInfo.email && personalInfo.age;
      case 1:
        return healthMetrics.heartRate || healthMetrics.bloodPressure.systolic;
      case 2:
        return goals.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      handleStepComplete(activeStep);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Calculate BMI if height and weight provided
      const bmi = personalInfo.height && personalInfo.weight 
        ? (personalInfo.weight / ((personalInfo.height / 100) ** 2)).toFixed(1)
        : null;

      const registrationData = {
        personalInfo: {
          ...personalInfo,
          age: parseInt(personalInfo.age)
        },
        healthMetrics: {
          ...healthMetrics,
          bmi,
          bloodPressure: `${healthMetrics.bloodPressure.systolic}/${healthMetrics.bloodPressure.diastolic}`,
          heartRate: parseInt(healthMetrics.heartRate) || null
        },
        goals,
        preferences
      };

      const response = await axios.post('/api/users/register', registrationData);
      
      if (response.data.success) {
        handleStepComplete(activeStep);
        setShowSuccess(true);
        
        // Store user ID in localStorage
        localStorage.setItem('healthUserId', response.data.userId);
        
        setTimeout(() => {
          onRegistrationComplete?.(response.data.user);
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = (goalText) => {
    if (goalText && !goals.includes(goalText)) {
      setGoals([...goals, goalText]);
    }
  };

  const removeGoal = (goalToRemove) => {
    setGoals(goals.filter(goal => goal !== goalToRemove));
  };

  const commonGoals = [
    'Lose weight',
    'Build muscle',
    'Improve sleep',
    'Reduce stress',
    'Eat healthier',
    'Exercise more',
    'Quit smoking',
    'Lower blood pressure',
    'Increase energy',
    'Better mental health'
  ];

  return (
    <Box sx={{ py: 4, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7ff 0%, #eaeefe 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Container maxWidth="md">
          {/* Header */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Health Journey Setup
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Let’s personalize your experience. It only takes a minute.
                </Typography>
              </Box>
              {/* Gamification Panel */}
              <Paper elevation={0} sx={{ textAlign: 'center', px: 2, py: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>
                <Avatar sx={{ width: 56, height: 56, fontSize: 24, bgcolor: 'rgba(255,255,255,0.85)', color: 'primary.main', mb: 1 }}>
                  {personalInfo.avatar}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Level {level}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <Star sx={{ color: '#ffd166' }} />
                  <Typography>{xp} XP</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(xp % 100)} sx={{ width: 140, mt: 1, height: 8, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.35)' }} />
              </Paper>
            </Box>
          </Paper>

          {/* Progress Overview */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#ffffff' }}>
            <Grid container spacing={2}>
              {steps.map((step, index) => (
                <Grid item xs={12} sm={3} key={index}>
                  <Card elevation={0}
                    sx={{ 
                      bgcolor: completedSections.includes(index) ? 'rgba(16,185,129,0.08)' : index === activeStep ? 'rgba(99,102,241,0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: completedSections.includes(index) ? 'success.light' : index === activeStep ? 'primary.light' : 'grey.200',
                      transition: 'all .2s ease',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {completedSections.includes(index) ? <CheckCircle color="success" /> : step.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{step.label}</Typography>
                      <Chip label={`+${step.xp} XP`} size="small" color={completedSections.includes(index) ? 'success' : 'default'} sx={{ mt: 0.5 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Main Form */}
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#ffffff', border: '1px solid', borderColor: 'grey.200' }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: Personal Info */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Personal Information</Typography>
              </StepLabel>
              <StepContent>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={personalInfo.name}
                            onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Age"
                            type="number"
                            value={personalInfo.age}
                            onChange={(e) => setPersonalInfo({...personalInfo, age: e.target.value})}
                            required
                            InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment> }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Gender</InputLabel>
                            <Select
                              value={personalInfo.gender}
                              onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})}
                            >
                              <MenuItem value="male">Male</MenuItem>
                              <MenuItem value="female">Female</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                              <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Height"
                            type="number"
                            value={personalInfo.height}
                            onChange={(e) => setPersonalInfo({...personalInfo, height: e.target.value})}
                            InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Weight"
                            type="number"
                            value={personalInfo.weight}
                            onChange={(e) => setPersonalInfo({...personalInfo, weight: e.target.value})}
                            InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" gutterBottom>Choose Your Avatar</Typography>
                      <Grid container spacing={1}>
                        {avatarOptions.map((avatar) => (
                          <Grid item xs={3} key={avatar}>
                            <IconButton
                              onClick={() => setPersonalInfo({...personalInfo, avatar})}
                              sx={{
                                border: personalInfo.avatar === avatar ? 2 : 1,
                                borderColor: personalInfo.avatar === avatar ? 'primary.main' : 'grey.300',
                                borderRadius: 2,
                                fontSize: 24,
                                width: 50,
                                height: 50
                              }}
                            >
                              {avatar}
                            </IconButton>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </motion.div>
              </StepContent>
            </Step>

            {/* Step 2: Health Metrics */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Health Metrics</Typography>
              </StepLabel>
              <StepContent>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Blood Pressure</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="Systolic"
                          type="number"
                          value={healthMetrics.bloodPressure.systolic}
                          onChange={(e) => setHealthMetrics({
                            ...healthMetrics,
                            bloodPressure: {...healthMetrics.bloodPressure, systolic: e.target.value}
                          })}
                        />
                        <TextField
                          label="Diastolic"
                          type="number"
                          value={healthMetrics.bloodPressure.diastolic}
                          onChange={(e) => setHealthMetrics({
                            ...healthMetrics,
                            bloodPressure: {...healthMetrics.bloodPressure, diastolic: e.target.value}
                          })}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Resting Heart Rate (BPM)"
                        type="number"
                        value={healthMetrics.heartRate}
                        onChange={(e) => setHealthMetrics({...healthMetrics, heartRate: e.target.value})}
                        InputProps={{ endAdornment: <InputAdornment position="end">bpm</InputAdornment> }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Blood Sugar (mg/dL)"
                        type="number"
                        value={healthMetrics.bloodSugar}
                        onChange={(e) => setHealthMetrics({...healthMetrics, bloodSugar: e.target.value})}
                        InputProps={{ endAdornment: <InputAdornment position="end">mg/dL</InputAdornment> }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Cholesterol (mg/dL)"
                        type="number"
                        value={healthMetrics.cholesterol}
                        onChange={(e) => setHealthMetrics({...healthMetrics, cholesterol: e.target.value})}
                        InputProps={{ endAdornment: <InputAdornment position="end">mg/dL</InputAdornment> }}
                      />
                    </Grid>

                    {/* Lifestyle Sliders */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Lifestyle Metrics</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Sleep Hours per Night: {healthMetrics.sleepHours}</Typography>
                      <Slider
                        value={healthMetrics.sleepHours}
                        onChange={(e, value) => setHealthMetrics({...healthMetrics, sleepHours: value})}
                        min={4}
                        max={12}
                        step={0.5}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Exercise Frequency (days/week): {healthMetrics.exerciseFreq}</Typography>
                      <Slider
                        value={healthMetrics.exerciseFreq}
                        onChange={(e, value) => setHealthMetrics({...healthMetrics, exerciseFreq: value})}
                        min={0}
                        max={7}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Water Intake (glasses/day): {healthMetrics.waterIntake}</Typography>
                      <Slider
                        value={healthMetrics.waterIntake}
                        onChange={(e, value) => setHealthMetrics({...healthMetrics, waterIntake: value})}
                        min={1}
                        max={15}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography gutterBottom>Stress Level (1-5): {healthMetrics.stressLevel}</Typography>
                      <Slider
                        value={healthMetrics.stressLevel}
                        onChange={(e, value) => setHealthMetrics({...healthMetrics, stressLevel: value})}
                        min={1}
                        max={5}
                        step={1}
                        marks={[
                          { value: 1, label: 'Low' },
                          { value: 3, label: 'Moderate' },
                          { value: 5, label: 'High' }
                        ]}
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>
                </motion.div>
              </StepContent>
            </Step>

            {/* Step 3: Goals */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Health Goals & Objectives</Typography>
              </StepLabel>
              <StepContent>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Typography variant="h6" gutterBottom>Select Your Health Goals</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose what you want to achieve on your health journey
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mb: 3 }}>
                    {commonGoals.map((goal) => (
                      <Grid item key={goal}>
                        <Chip
                          label={goal}
                          onClick={() => addGoal(goal)}
                          color={goals.includes(goal) ? 'primary' : 'default'}
                          variant={goals.includes(goal) ? 'filled' : 'outlined'}
                          icon={goals.includes(goal) ? <CheckCircle /> : <Add />}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {goals.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>Your Selected Goals</Typography>
                      <List>
                        {goals.map((goal, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Star color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={goal} />
                            <IconButton onClick={() => removeGoal(goal)}>
                              <Remove />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </motion.div>
              </StepContent>
            </Step>

            {/* Step 4: Preferences */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Preferences & Settings</Typography>
              </StepLabel>
              <StepContent>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={preferences.notifications}
                            onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                          />
                        }
                        label="Enable Health Reminders"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Preferred Reminder Time"
                        type="time"
                        value={preferences.reminderTime}
                        onChange={(e) => setPreferences({...preferences, reminderTime: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={preferences.language}
                          onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="ms">Bahasa Melayu</MenuItem>
                          <MenuItem value="ta">Tamil</MenuItem>
                          <MenuItem value="zh">Chinese</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </motion.div>
              </StepContent>
            </Step>
          </Stepper>

          {/* Sticky Navigation */}
          <Divider />
          <Box sx={{ p: 2, position: 'sticky', bottom: 0, bgcolor: '#fff', borderTop: '1px solid', borderColor: 'grey.200', display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<NavigateBefore />}
            >
              Back
            </Button>
            
            <Box sx={{ flex: '1 1 auto' }} />
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !isStepValid(activeStep)}
                startIcon={loading ? null : <Save />}
                size="large"
              >
                {loading ? 'Creating Profile...' : 'Complete Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
                endIcon={<NavigateNext />}
                size="large"
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
        </Container>
      </motion.div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Celebration sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Welcome to Your Health Journey! 🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your profile has been created successfully. You've earned {xp} XP and reached Level {level}!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Chip icon={<Star />} label={`${xp} XP Earned`} color="primary" />
            <Chip icon={<EmojiEvents />} label={`Level ${level}`} color="secondary" />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={6000} 
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HealthRegistration;
