import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const stepToVideoMap = {
  face: '/face.mp4',
  eye: '/eye.mp4',
  tongue: '/tongue.mp4',
  skin: '/skin.mp4',
  nail: '/nail.mp4',
  audio: '/audio.mp4',
};

function FloatingStepVideo({ stepKey }) {
  const videoRef = useRef(null);
  const [canShow, setCanShow] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const src = useMemo(() => stepToVideoMap[stepKey] || null, [stepKey]);

  useEffect(() => {
    setCanShow(false);
    setIsMuted(true);
  }, [src]);

  if (!src) return null;

  const videoUi = (
    <Box
      sx={{
        position: 'fixed',
        left: { xs: 12, md: 24 },
        top: { xs: 12, md: 24 },
        transform: 'none',
        zIndex: 2000,
        width: { xs: 260, md: 360 },
        aspectRatio: '16 / 9',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.4)',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,248,255,0.9) 100%)',
        backdropFilter: 'blur(8px)',
        display: canShow ? 'block' : 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* Mute/Unmute control (no native controls) */}
      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
        <IconButton
          size="small"
          onClick={async () => {
            try {
              setIsMuted((prev) => !prev);
              const v = videoRef.current;
              if (v) {
                v.muted = !isMuted;
                if (!v.paused) {
                  await v.play().catch(() => {});
                } else {
                  await v.play().catch(() => {});
                }
              }
            } catch {}
          }}
          sx={{
            bgcolor: 'rgba(0,0,0,0.4)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
          }}
        >
          {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
        </IconButton>
      </Box>
      <video
        key={src}
        ref={videoRef}
        src={src}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        controls={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onCanPlay={() => {
          setCanShow(true);
          try {
            const v = videoRef.current;
            if (v) {
              v.muted = isMuted;
              v.play?.();
            }
          } catch {}
        }}
        onError={() => setCanShow(false)}
      />
    </Box>
  );

  // Render in a portal attached to document.body so CSS transforms above don't affect fixed positioning
  if (typeof window === 'undefined') return null;
  return createPortal(videoUi, document.body);
}

export default FloatingStepVideo;


