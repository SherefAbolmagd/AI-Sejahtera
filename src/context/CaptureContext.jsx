import { createContext, useContext, useMemo, useState } from 'react';

const CaptureContext = createContext(null);

export function CaptureProvider({ children }) {
  const [images, setImages] = useState({
    face: null,
    eye: null,
    tongue: null,
    skin: null,
    nail: null,
  });
  const [audio, setAudio] = useState(null); // { blobUrl, durationMs }

  const value = useMemo(
    () => ({ images, setImages, audio, setAudio }),
    [images, audio]
  );

  return (
    <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>
  );
}

export function useCapture() {
  const ctx = useContext(CaptureContext);
  if (!ctx) throw new Error('useCapture must be used within CaptureProvider');
  return ctx;
}


