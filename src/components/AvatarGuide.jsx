import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Stack, Typography, IconButton, Select, MenuItem, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ReplayIcon from '@mui/icons-material/Replay';

// Language maps
const LANGS = [
  { code: 'en', label: 'English', voice: 'alloy' },
  { code: 'ms', label: 'Bahasa Melayu', voice: 'alloy' },
  { code: 'ta', label: 'தமிழ்', voice: 'alloy' },
  { code: 'zh', label: '中文', voice: 'alloy' },
];

const STEP_TEXT = {
  en: {
    face: 'Please take a clear picture of your face. Center your face and ensure good lighting.',
    eye: 'Please take a clear picture of one eye. Keep the camera steady and in focus.',
    tongue: 'Please take a picture of your tongue. Stick out your tongue and hold steady.',
    skin: 'Please take a picture of a clear skin area. Ensure it is well lit.',
    nail: 'Please take a picture of your nail. Focus on the nail bed.',
    audio: 'Please record your voice. Breathe normally and speak clearly.',
  },
  ms: {
    face: 'Sila ambil gambar muka yang jelas. Pusatkan wajah anda dan pastikan pencahayaan baik.',
    eye: 'Sila ambil gambar mata yang jelas. Pegang kamera dengan stabil dan fokus.',
    tongue: 'Sila ambil gambar lidah anda. Julurkan lidah dan kekal stabil.',
    skin: 'Sila ambil gambar kawasan kulit yang jelas. Pastikan pencahayaan baik.',
    nail: 'Sila ambil gambar kuku anda. Fokus pada katil kuku.',
    audio: 'Sila rakam suara anda. Bernafas seperti biasa dan bercakap dengan jelas.',
  },
  ta: {
    face: 'தயவு செய்து உங்கள் முகத்தின் தெளிவான புகைப்படத்தை எடுத்துக் கொள்ளவும். முகத்தை மையப்படுத்தி நல்ல வெளிச்சம் உறுதி செய்யவும்.',
    eye: 'தயவு செய்து ஒரு கண்ணின் தெளிவான புகைப்படத்தை எடுத்துக் கொள்ளவும். கேமராவை நிலையாகவும் தெளிவாகவும் வைத்திருங்கள்.',
    tongue: 'தயவு செய்து உங்கள் நாக்கின் புகைப்படத்தை எடுத்துக் கொள்ளவும். நாக்கை வெளியே நீட்டி அமைதியாக இருங்கள்.',
    skin: 'தயவு செய்து உங்கள் தோலின் தெளிவான பகுதியின் புகைப்படத்தை எடுத்துக் கொள்ளவும். போதிய வெளிச்சம் உறுதி செய்யவும்.',
    nail: 'தயவு செய்து உங்கள் நகத்தின் புகைப்படத்தை எடுத்துக் கொள்ளவும். நகத்தின் அடிப்பகுதியை கவனம் செலுத்தவும்.',
    audio: 'தயவு செய்து உங்கள் குரலை பதிவு செய்யவும். சாதாரணமாக மூச்செடுங்கள் மற்றும் தெளிவாகப் பேசுங்கள்.',
  },
  zh: {
    face: '请拍摄一张清晰的面部照片。让面部居中并确保光线充足。',
    eye: '请拍摄一只眼睛的清晰照片。保持相机稳定并对好焦。',
    tongue: '请拍摄舌头的照片。伸出舌头并保持不动。',
    skin: '请拍摄一处清晰的皮肤区域。确保光线良好。',
    nail: '请拍摄指甲的照片。聚焦在指甲根部。',
    audio: '请录制您的声音。正常呼吸并清晰说话。',
  },
};

export default function AvatarGuide({ stepKey }) {
  const [lang, setLang] = useState('en');
  const audioRef = useRef(null);
  const speakingRef = useRef(false);
  const [isTalking, setIsTalking] = useState(false);
  const avatarUrl = import.meta.env.VITE_AVATAR_URL || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
  const avatarVideo = import.meta.env.VITE_AVATAR_VIDEO_URL; // optional MP4/WebM of Malaysian male

  const text = useMemo(() => {
    const table = STEP_TEXT[lang] || STEP_TEXT.en;
    return table[stepKey] || '';
  }, [lang, stepKey]);

  const speakViaServer = async () => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: LANGS.find(l => l.code === lang)?.voice || 'alloy' }),
      });
      if (!res.ok) throw new Error('tts failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.onplay = () => setIsTalking(true);
      audio.onpause = () => setIsTalking(false);
      audio.onended = () => setIsTalking(false);
      await audio.play();
    } catch (e) {
      // fallback to browser speechSynthesis
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang =
          lang === 'ms' ? 'ms-MY' :
          lang === 'ta' ? 'ta-IN' :
          lang === 'zh' ? 'zh-CN' : 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch (_) {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (speakingRef.current) return;
    speakingRef.current = true;
    speakViaServer().finally(() => {
      setTimeout(() => {
        speakingRef.current = false;
      }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Box>
      {/* model-viewer script */}
      <script type="module" suppressHydrationWarning src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Assistant</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Select size="small" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGS.map(l => (
              <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>
            ))}
          </Select>
          <Tooltip title="Repeat">
            <IconButton onClick={speakViaServer}>
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0', mb: 1 }}>
        {avatarVideo ? (
          <video
            src={avatarVideo}
            style={{ width: '100%', height: 260, objectFit: 'cover', background: '#000' }}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <model-viewer
            style={{ width: '100%', height: 260, background: '#f9fbff' }}
            src={avatarUrl}
            camera-controls
            autoplay
            shadow-intensity="1"
            exposure="1.0"
            interaction-prompt="auto"
            animation-name={isTalking ? 'Talking' : 'Idle'}
          />
        )}
        {/* Simple mouth-talking indicator overlay if model lacks animation */}
        {isTalking && (
          <Box sx={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 24,
            height: 10,
            borderRadius: '0 0 12px 12px',
            background: '#c62828',
            animation: 'talk 0.25s infinite',
          }} />
        )}
        <style>{`@keyframes talk { 0%{transform: translateX(-50%) scaleY(0.8);} 50%{transform: translateX(-50%) scaleY(1.4);} 100%{transform: translateX(-50%) scaleY(0.8);} }`}</style>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <VolumeUpIcon color="primary" />
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      </Stack>
    </Box>
  );
}


