import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  Star,
  LocalFireDepartment,
  MonitorHeart,
  SelfImprovement,
  WaterDrop,
  Hotel,
  Psychology,
  Timeline,
  Refresh,
  Settings,
  History,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';

const UserDashboard = ({ userId, onLogout }) => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState(30);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId, timeRange]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const userResponse = await axios.get(`/api/users/${userId}`);
      setUser(userResponse.data.user);
      
      // Load health history and trends
      const historyResponse = await axios.get(`/api/users/${userId}/history?days=${timeRange}`);
      setHistory(historyResponse.data.history);
      setTrends(historyResponse.data.trends);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScore = () => {
    if (!trends.overallHealth?.length) return 0;
    const latestScore = trends.overallHealth[trends.overallHealth.length - 1];
    return latestScore?.value || 0;
  };

  const getHealthTrend = (metric) => {
    const data = trends[metric];
    if (!data || data.length < 2) return 'stable';
    
    const recent = data.slice(-3);
    const trend = recent[recent.length - 1].value - recent[0].value;
    
    return trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp color="success" />;
      case 'declining':
        return <TrendingDown color="error" />;
      default:
        return <Timeline color="info" />;
    }
  };

  const formatChartData = (data) => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading your health dashboard...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: 'primary.main' }}>
                {user.personalInfo.avatar}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Welcome back, {user.personalInfo.name}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Level {user.gamificationData.level} Health Warrior
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Chip 
                  icon={<Star />} 
                  label={`${user.gamificationData.xp} XP`} 
                  color="primary" 
                />
                <Chip 
                  icon={<LocalFireDepartment />} 
                  label={`${user.gamificationData.streak} day streak`} 
                  color="warning" 
                />
                <Chip 
                  icon={<EmojiEvents />} 
                  label={`${user.achievements.length} achievements`} 
                  color="success"
                  onClick={() => setShowAchievements(true)}
                  clickable
                />
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={loadUserData}>
                  <Refresh />
                </IconButton>
                <IconButton onClick={onLogout}>
                  <Settings />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Time Range Selector */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Health Overview</Typography>
            <FormControl size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 3 months</MenuItem>
                <MenuItem value={365}>Last year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Health Score & Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>Overall Health Score</Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={getHealthScore()}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5, 
                    width: 120,
                    transform: 'rotate(90deg)',
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div" color="text.secondary">
                    {getHealthScore()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {getHealthScore() >= 80 ? 'Excellent' : 
                 getHealthScore() >= 60 ? 'Good' : 
                 getHealthScore() >= 40 ? 'Fair' : 'Needs Attention'}
              </Typography>
            </Card>
          </Grid>
          
          {/* Key Health Metrics */}
          {['stressLevel', 'sleepQuality', 'hydration'].map((metric) => (
            <Grid item xs={12} md={3} key={metric}>
              <Card elevation={3} sx={{ height: '100%', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {metric === 'stressLevel' && <Psychology color="primary" />}
                  {metric === 'sleepQuality' && <Hotel color="primary" />}
                  {metric === 'hydration' && <WaterDrop color="primary" />}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {metric === 'stressLevel' ? 'Stress Level' :
                     metric === 'sleepQuality' ? 'Sleep Quality' : 'Hydration'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTrendIcon(getHealthTrend(metric))}
                  <Typography variant="body2">
                    {getHealthTrend(metric) === 'improving' ? 'Improving' :
                     getHealthTrend(metric) === 'declining' ? 'Declining' : 'Stable'}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {trends[metric]?.length ? trends[metric][trends[metric].length - 1].value : 'N/A'}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Paper elevation={3} sx={{ borderRadius: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Trends" icon={<Timeline />} />
            <Tab label="Analysis History" icon={<History />} />
            <Tab label="Progress" icon={<Assessment />} />
          </Tabs>

          {/* Trends Tab */}
          {selectedTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Health Trends Over Time</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(trends.overallHealth || [])}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Stress & Sleep Patterns</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={formatChartData(trends.stressLevel || [])}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* History Tab */}
          {selectedTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Recent Health Checks</Typography>
              <List>
                {history.slice(0, 10).map((entry, index) => (
                  <ListItem key={entry.id} divider={index < 9}>
                    <ListItemIcon>
                      <MonitorHeart color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Health Check #${entry.id}`}
                      secondary={new Date(entry.timestamp).toLocaleString()}
                    />
                    <Chip 
                      label="+10 XP" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </ListItem>
                ))}
              </List>
              {history.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No health checks yet. Complete your first analysis to see history!
                </Typography>
              )}
            </Box>
          )}

          {/* Progress Tab */}
          {selectedTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Your Health Goals Progress</Typography>
              <Grid container spacing={3}>
                {user.goals.map((goal, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{goal}</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.random() * 100} // Placeholder progress
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {Math.floor(Math.random() * 100)}% Complete
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Achievements Dialog */}
        <Dialog 
          open={showAchievements} 
          onClose={() => setShowAchievements(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEvents sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Your Achievements</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {user.achievements.map((achievement, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmojiEvents color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">{achievement.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {new Date(achievement.timestamp).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default UserDashboard;
