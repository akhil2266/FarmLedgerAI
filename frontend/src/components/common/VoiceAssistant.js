import React, { useState, useRef, useCallback } from 'react';
import { Fab, Tooltip, Snackbar, Alert, Zoom } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useNavigate } from 'react-router-dom';

const COMMAND_MAP = [
  { keywords: ['dashboard', 'home'], path: '/app/dashboard', response: 'Opening your dashboard.' },
  { keywords: ['farm'], path: '/app/farms', response: 'Opening farms.' },
  { keywords: ['crop'], path: '/app/crops', response: 'Opening crops.' },
  { keywords: ['expense', 'spending', 'cost'], path: '/app/expenses', response: 'Opening expenses.' },
  { keywords: ['sale', 'sell', 'revenue'], path: '/app/sales', response: 'Opening sales.' },
  { keywords: ['weather'], path: '/app/weather', response: 'Checking the weather.' },
  { keywords: ['scheme', 'subsidy', 'government'], path: '/app/schemes', response: 'Opening government schemes.' },
  { keywords: ['market', 'buyer'], path: '/app/marketplace', response: 'Opening the marketplace.' },
  { keywords: ['report'], path: '/app/reports', response: 'Opening reports.' },
  { keywords: ['ai', 'recommend', 'predict', 'disease', 'advisor'], path: '/app/ai', response: 'Opening AI tools.' },
];

const getSpeechRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const recognitionRef = useRef(null);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTranscript = useCallback((transcript) => {
    const lower = transcript.toLowerCase();
    const match = COMMAND_MAP.find((cmd) => cmd.keywords.some((kw) => lower.includes(kw)));

    if (match) {
      navigate(match.path);
      setSnack({ open: true, message: `"${transcript}" → ${match.response}`, severity: 'success' });
      speak(match.response);
    } else {
      setSnack({ open: true, message: `Didn't recognize: "${transcript}". Try "open dashboard" or "show weather".`, severity: 'warning' });
      speak("Sorry, I didn't understand that command.");
    }
  }, [navigate]);

  const toggleListening = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSnack({ open: true, message: 'Voice recognition is not supported in this browser. Try Chrome or Edge.', severity: 'error' });
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleTranscript(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      <Zoom in>
        <Tooltip title={listening ? 'Listening... click to stop' : 'Voice Assistant — try "open dashboard"'} placement="left">
          <Fab
            color={listening ? 'error' : 'primary'}
            className={listening ? 'pulse-glow' : ''}
            onClick={toggleListening}
            sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 1300 }}
          >
            {listening ? <MicOffIcon /> : <MicIcon />}
          </Fab>
        </Tooltip>
      </Zoom>
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VoiceAssistant;
