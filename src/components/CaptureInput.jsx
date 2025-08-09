import { useRef, useState, useEffect } from 'react';
import { Box, Button, Stack, Typography, IconButton, Alert, Chip } from '@mui/material';
import { CameraAlt, PhotoCamera, Mic, Stop, PlayArrow, Delete, Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export default function CaptureInput({ label, accept = 'image/*', onChange, kind = 'image', initialUrl }) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl || null);
  const [recording, setRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Keep preview in sync when parent provides/changes an initial url
  if (initialUrl && previewUrl !== initialUrl) {
    setPreviewUrl(initialUrl);
  }

  const startCamera = async () => {
    try {
      setCameraError('');
      console.log('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      console.log('Camera access granted:', mediaStream);
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait a bit for the video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Add event listeners for debugging
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current.play().catch(e => console.error('Video play error:', e));
          };
          
          videoRef.current.onplay = () => {
            console.log('Video started playing');
          };
          
          videoRef.current.onerror = (e) => {
            console.error('Video error:', e);
            setCameraError('Video failed to load');
          };
          
          videoRef.current.oncanplay = () => {
            console.log('Video can play');
          };
          
          // Force play after a short delay
          setTimeout(() => {
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(e => console.error('Forced play error:', e));
            }
          }, 500);
        }
      }, 100);
      
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(`Camera access denied: ${err.message}`);
      alert('Please allow camera access to capture images. Make sure you\'re using HTTPS or localhost.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
    }
    setShowCamera(false);
    setCountdown(0);
    setCapturing(false);
    setCameraError('');
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setCapturing(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Take the photo
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          context.drawImage(video, 0, 0);
          
          // Convert to blob and create URL
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            onChange?.(blob, url);
            stopCamera();
          }, 'image/jpeg', 0.9);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onChange?.(file, url);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onChange?.(blob, url);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Audio record error', err);
      alert('Please allow microphone access to record audio');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const clearSample = () => {
    setPreviewUrl(null);
    onChange?.(null, null);
  };

  const handlePick = () => inputRef.current?.click();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Monitor video element and ensure it plays
  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      const video = videoRef.current;
      
      const checkAndPlay = () => {
        if (video.readyState >= 2 && video.paused) {
          console.log('Forcing video to play');
          video.play().catch(e => console.error('Play error:', e));
        }
      };
      
      // Check immediately
      checkAndPlay();
      
      // Check periodically
      const interval = setInterval(checkAndPlay, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showCamera, stream]);

  return (
    <Box sx={{ textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
        {label}
      </Typography>

      {kind === 'image' ? (
        <>
          {/* Camera Capture Interface */}
          {showCamera ? (
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Box sx={{ 
                position: 'relative', 
                width: 400,
                height: 300,
                mx: 'auto',
                borderRadius: 3,
                overflow: 'hidden',
                border: '2px solid #e0e0e0',
                background: '#000'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)', // Mirror the video
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {/* Camera error overlay */}
                {cameraError && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 30,
                  }}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Camera Error
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {cameraError}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={stopCamera}
                        sx={{ borderRadius: 2 }}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {/* Overlay with capture guide - properly positioned */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  border: '3px dashed rgba(25,118,210,0.8)',
                  pointerEvents: 'none',
                  animation: 'pulse 2s infinite',
                  zIndex: 10,
                }} />
                
                {/* Countdown overlay */}
                {countdown > 0 && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(25,118,210,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    zIndex: 20,
                  }}>
                    {countdown}
                  </Box>
                )}
              </Box>
              
              {/* Camera controls */}
              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PhotoCamera />}
                  onClick={captureImage}
                  disabled={capturing || !!cameraError}
                  sx={{ borderRadius: 3, px: 4 }}
                >
                  {capturing ? 'Capturing...' : 'Take Photo'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={stopCamera}
                  startIcon={<Close />}
                  sx={{ borderRadius: 3 }}
                >
                  Cancel
                </Button>
              </Stack>
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mt: 2, p: 2, background: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debug: Stream active: {stream ? 'Yes' : 'No'} | 
                    Video ready: {videoRef.current?.readyState === 4 ? 'Yes' : 'No'} |
                    Video playing: {videoRef.current?.paused === false ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            /* Image Preview or Upload Interface */
            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Box sx={{
                      width: 280,
                      height: 280,
                      borderRadius: 4,
                      overflow: 'hidden',
                      mx: 'auto',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '2px solid #e0e0e0'
                    }}>
                      <img 
                        src={previewUrl} 
                        alt="preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }} 
                      />
                    </Box>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(255,255,255,0.9)',
                        '&:hover': { background: 'rgba(255,255,255,1)' }
                      }}
                      onClick={clearSample}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Sample Image Guide */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      How to position your {label.toLowerCase()}
                    </Typography>
                    <Box sx={{
                      width: 280,
                      height: 280,
                      borderRadius: 4,
                      overflow: 'hidden',
                      mx: 'auto',
                      mb: 2,
                      border: '2px solid #e0e0e0',
                      position: 'relative',
                      background: '#f8f9fa'
                    }}>
                      {/* Sample image based on label */}
                      {label.toLowerCase().includes('face') && (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          position: 'relative'
                        }}>
                          {/* Face outline */}
                          <Box sx={{
                            width: 120,
                            height: 160,
                            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                            background: '#fff',
                            border: '3px solid #1976d2',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '30%',
                              left: '25%',
                              width: '20%',
                              height: '8%',
                              background: '#1976d2',
                              borderRadius: '50%',
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: '30%',
                              right: '25%',
                              width: '20%',
                              height: '8%',
                              background: '#1976d2',
                              borderRadius: '50%',
                            }
                          }} />
                          <Typography variant="caption" sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(25,118,210,0.9)',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem'
                          }}>
                            Position face in center
                          </Typography>
                        </Box>
                      )}
                      {label.toLowerCase().includes('eye') && (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          position: 'relative'
                        }}>
                          {/* Eye outline */}
                          <Box sx={{
                            width: 80,
                            height: 40,
                            borderRadius: '50%',
                            background: '#fff',
                            border: '3px solid #1976d2',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '60%',
                              height: '60%',
                              background: '#1976d2',
                              borderRadius: '50%',
                            }
                          }} />
                          <Typography variant="caption" sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(25,118,210,0.9)',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem'
                          }}>
                            Focus on one eye
                          </Typography>
                        </Box>
                      )}
                      {label.toLowerCase().includes('tongue') && (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          position: 'relative'
                        }}>
                          {/* Tongue outline */}
                          <Box sx={{
                            width: 60,
                            height: 80,
                            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                            background: '#ffcdd2',
                            border: '3px solid #d32f2f',
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: 0,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '40%',
                              height: '30%',
                              background: '#ffcdd2',
                              borderRadius: '0 0 50% 50%',
                            }
                          }} />
                          <Typography variant="caption" sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(25,118,210,0.9)',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem'
                          }}>
                            Stick out tongue
                          </Typography>
                        </Box>
                      )}
                      {label.toLowerCase().includes('skin') && (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          position: 'relative'
                        }}>
                          {/* Skin area */}
                          <Box sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: '#ffccbc',
                            border: '3px solid #ff5722',
                            position: 'relative',
                          }} />
                          <Typography variant="caption" sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(25,118,210,0.9)',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem'
                          }}>
                            Clear skin area
                          </Typography>
                        </Box>
                      )}
                      {label.toLowerCase().includes('nail') && (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                          position: 'relative'
                        }}>
                          {/* Nail outline */}
                          <Box sx={{
                            width: 40,
                            height: 60,
                            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                            background: '#fff',
                            border: '3px solid #1976d2',
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: '10%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '80%',
                              height: '20%',
                              background: '#ffeb3b',
                              borderRadius: '50%',
                            }
                          }} />
                          <Typography variant="caption" sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(25,118,210,0.9)',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem'
                          }}>
                            Focus on nail bed
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{
                    width: 280,
                    height: 280,
                    borderRadius: 4,
                    border: '2px dashed #e0e0e0',
                    mx: 'auto',
                    mb: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      background: '#f5f5f5'
                    }
                  }}>
                    <CameraAlt sx={{ fontSize: 48, color: '#999', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Capture or upload your {label.toLowerCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
                      Position your {label.toLowerCase()} in the center of the frame
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Action Buttons */}
          {!showCamera && (
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CameraAlt />}
                onClick={startCamera}
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
                Use Camera
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={handlePick}
                sx={{ borderRadius: 3, px: 4, py: 1.5 }}
              >
                Upload Image
              </Button>
              <input 
                ref={inputRef} 
                type="file" 
                accept={accept} 
                hidden 
                onChange={handleFile} 
                capture="environment" 
              />
            </Stack>
          )}
        </>
      ) : (
        /* Audio Recording Interface */
        <Box sx={{ textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {recording ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Box sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f44336, #ff5722)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  animation: 'pulse 1s infinite',
                  boxShadow: '0 8px 32px rgba(244,67,54,0.3)'
                }}>
                  <Mic sx={{ fontSize: 48, color: 'white' }} />
                </Box>
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                  Recording...
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={stopRecording}
                  sx={{ borderRadius: 3, px: 4 }}
                >
                  Stop Recording
                </Button>
              </motion.div>
            ) : previewUrl ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Box sx={{ mb: 3 }}>
                  <audio 
                    src={previewUrl} 
                    controls 
                    style={{ 
                      width: '100%', 
                      maxWidth: 400,
                      borderRadius: 8
                    }} 
                  />
                </Box>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    onClick={() => document.querySelector('audio')?.play()}
                    sx={{ borderRadius: 3 }}
                  >
                    Play
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={clearSample}
                    sx={{ borderRadius: 3 }}
                  >
                    Clear
                  </Button>
                </Stack>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Box sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid #1976d2'
                }}>
                  <Mic sx={{ fontSize: 48, color: '#1976d2' }} />
                </Box>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Record your voice for breathing and heart rate analysis
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Mic />}
                  onClick={startRecording}
                  sx={{ 
                    borderRadius: 3, 
                    px: 4,
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    boxShadow: '0 4px 16px rgba(25,118,210,0.3)'
                  }}
                >
                  Start Recording
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      )}

      {/* Help Text */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            {kind === 'image' 
              ? `Ensure good lighting and position your ${label.toLowerCase()} clearly in the center of the frame.`
              : 'Speak clearly and maintain a steady breathing pattern for accurate analysis.'
            }
          </Typography>
        </Alert>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Box>
  );
}


