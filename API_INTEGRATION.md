# Health Analysis API Integration

This document explains how to integrate third-party APIs for health data analysis in the WebHealth application.

## Overview

The application uses a modular API service system to analyze different types of health data:

- **Face Analysis**: Age, gender, skin conditions, facial features
- **Eye Analysis**: Eye health, vision indicators, fatigue detection
- **Tongue Analysis**: Traditional Chinese Medicine indicators
- **Skin Analysis**: Dermatological conditions, skin health
- **Nail Analysis**: Nail health, nutritional indicators
- **Audio Analysis**: Breathing patterns, heart rate, voice health

## API Service Structure

### File: `src/services/healthAnalysis.js`

The main service file contains:

1. **Generic API Call Function**: `makeApiCall()`
   - Handles authentication, headers, and error handling
   - Configurable base URL and API key

2. **Individual Analysis Functions**:
   - `analyzeFace(imageData)`
   - `analyzeEyes(imageData)`
   - `analyzeTongue(imageData)`
   - `analyzeSkin(imageData)`
   - `analyzeNails(imageData)`
   - `analyzeAudio(audioData)`

3. **Comprehensive Report Generation**:
   - `generateHealthReport(capturedData)`
   - Combines all analyses into a single report
   - Calculates overall health score
   - Generates personalized recommendations

## Environment Configuration

Create a `.env` file in the root directory:

```env
# Health Analysis API Configuration
VITE_API_BASE_URL=https://api.healthdemo.com
VITE_API_KEY=your_api_key_here

# Optional: Specific API endpoints
VITE_FACE_API_URL=https://api.face-analysis.com
VITE_EYE_API_URL=https://api.eye-health.com
VITE_TONGUE_API_URL=https://api.tcm-analysis.com
VITE_SKIN_API_URL=https://api.dermatology.com
VITE_NAIL_API_URL=https://api.nail-health.com
VITE_AUDIO_API_URL=https://api.audio-analysis.com

# Development settings
VITE_DEBUG_MODE=true
VITE_DEMO_MODE=true
```

## API Integration Examples

### 1. Face Analysis (Face++, Azure Face API, etc.)

```javascript
// Example integration with Face++ API
const analyzeFace = async (imageData) => {
  const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': import.meta.env.VITE_FACE_API_KEY,
      'API-Secret': import.meta.env.VITE_FACE_API_SECRET
    },
    body: JSON.stringify({
      image_base64: imageData,
      return_attributes: 'age,gender,beauty,emotion,facequality'
    })
  });
  
  return await response.json();
};
```

### 2. Eye Analysis (Custom ML Model)

```javascript
// Example integration with custom eye health API
const analyzeEyes = async (imageData) => {
  const response = await fetch(`${process.env.REACT_APP_EYE_API_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_EYE_API_KEY}`
    },
    body: JSON.stringify({
      image: imageData,
      features: ['redness', 'fatigue', 'dryness', 'pupil_size']
    })
  });
  
  return await response.json();
};
```

### 3. Audio Analysis (Heart Rate Detection)

```javascript
// Example integration with audio analysis API
const analyzeAudio = async (audioData) => {
  const response = await fetch(`${process.env.REACT_APP_AUDIO_API_URL}/heart-rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_AUDIO_API_KEY}`
    },
    body: JSON.stringify({
      audio: audioData,
      analysis_type: 'heart_rate_breathing'
    })
  });
  
  return await response.json();
};
```

## Response Format

Each analysis function should return data in this format:

```javascript
{
  success: true,
  analysis: {
    // Analysis-specific data
    healthIndicators: {
      hydration: 'good',
      stressLevel: 'moderate',
      sleepQuality: 'adequate'
    },
    conditions: [
      {
        type: 'acne',
        severity: 'mild',
        confidence: 0.85
      }
    ],
    recommendations: [
      'Use non-comedogenic skincare products',
      'Practice stress management techniques'
    ]
  }
}
```

## Error Handling

The service includes comprehensive error handling:

```javascript
try {
  const result = await makeApiCall('/analyze/face', { image: imageData });
  return { success: true, analysis: result };
} catch (error) {
  console.error('API call error:', error);
  return {
    success: false,
    error: 'Face analysis failed. Please try again.'
  };
}
```

## Demo Mode

For development and demo purposes, the service includes demo responses that simulate real API calls:

```javascript
// Demo response structure
return {
  success: true,
  analysis: {
    age: { value: 28, confidence: 0.95 },
    gender: { value: 'male', confidence: 0.98 },
    skinConditions: [
      { condition: 'acne', severity: 'mild', confidence: 0.85 }
    ]
  }
};
```

## Health Score Calculation

The system calculates an overall health score based on all analyses:

```javascript
const calculateOverallHealth = (analyses) => {
  let totalScore = 0;
  let factors = 0;
  
  // Score each analysis type
  if (analyses.face) {
    const faceScore = analyses.face.healthIndicators.hydration === 'good' ? 85 : 70;
    totalScore += faceScore;
    factors++;
  }
  
  const overallScore = factors > 0 ? Math.round(totalScore / factors) : 0;
  
  return {
    score: overallScore,
    level: overallScore >= 85 ? 'excellent' : 
           overallScore >= 75 ? 'good' : 
           overallScore >= 65 ? 'fair' : 'needs_attention',
    factors: factors
  };
};
```

## Recommendations Engine

The system generates personalized recommendations based on analysis results:

```javascript
const generateRecommendations = (analyses) => {
  const recommendations = [];
  
  if (analyses.face?.skinConditions.some(c => c.condition === 'acne')) {
    recommendations.push('Consider using non-comedogenic skincare products');
  }
  
  if (analyses.eyes?.fatigueDetection.level !== 'low') {
    recommendations.push('Take more frequent screen breaks');
  }
  
  // General health recommendations
  recommendations.push('Maintain regular exercise routine');
  recommendations.push('Get 7-9 hours of sleep nightly');
  
  return recommendations;
};
```

## Production Considerations

1. **API Rate Limiting**: Implement proper rate limiting and caching
2. **Data Privacy**: Ensure HIPAA/GDPR compliance for health data
3. **Error Recovery**: Implement retry logic for failed API calls
4. **Monitoring**: Add logging and monitoring for API performance
5. **Security**: Use secure API keys and implement proper authentication
6. **Scalability**: Consider using a queue system for large-scale processing

## Testing

Test the API integration with:

```javascript
// Test individual analysis
const testFaceAnalysis = async () => {
  const result = await analyzeFace(testImageData);
  console.log('Face analysis result:', result);
};

// Test comprehensive report
const testHealthReport = async () => {
  const report = await generateHealthReport(testCapturedData);
  console.log('Health report:', report);
};
```

## Troubleshooting

Common issues and solutions:

1. **API Key Issues**: Check environment variables and API key validity
2. **CORS Errors**: Ensure API endpoints allow requests from your domain
3. **Data Format**: Verify image/audio data is in the correct format
4. **Rate Limits**: Implement proper throttling for API calls
5. **Network Issues**: Add timeout handling and retry logic

## Future Enhancements

1. **Real-time Analysis**: Implement WebSocket connections for live analysis
2. **Batch Processing**: Add support for processing multiple images at once
3. **Machine Learning**: Integrate custom ML models for specialized analysis
4. **Telemedicine**: Add video consultation features
5. **Health Tracking**: Implement longitudinal health tracking over time
