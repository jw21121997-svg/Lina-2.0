import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, Mic, Volume2 } from 'lucide-react';

// Web Audio API synthesized activation chime
function playWakeWordChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // Note 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Note 2: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.warn('Audio context chime error:', err);
  }
}

export const WakeWordListener: React.FC = () => {
  const {
    handsFreeEnabled,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    setInitialVoiceQuery,
    setIsWakeWordListening,
  } = useAppStore();

  const recognitionRef = useRef<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsWakeWordListening(false);
      return;
    }

    if (!handsFreeEnabled || isVoiceModalOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      setIsWakeWordListening(false);
      return;
    }

    let isComponentMounted = true;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      if (isComponentMounted) {
        setIsWakeWordListening(true);
      }
    };

    rec.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }

      const lower = fullTranscript.toLowerCase();

      // Wake-word triggers
      const wakeWords = [
        'hey lina',
        'hey lena',
        'hey leena',
        'hey linah',
        'ok lina',
        'okay lina',
        'hi lina',
        'lina',
      ];

      const matchedKeyword = wakeWords.find((ww) => lower.includes(ww));

      if (matchedKeyword) {
        // Play activation sound chime
        playWakeWordChime();

        // Extract command following wake word if present
        const index = lower.indexOf(matchedKeyword);
        const commandAfter = fullTranscript.substring(index + matchedKeyword.length).trim();

        if (commandAfter.length > 2) {
          setInitialVoiceQuery(commandAfter);
        } else {
          setInitialVoiceQuery('');
        }

        // Show toast notification
        setToastMessage(`✨ "Hey Lina" wake word detected!`);
        setTimeout(() => setToastMessage(null), 3000);

        // Open Voice Agent Modal
        setIsVoiceModalOpen(true);

        // Stop background recognition while modal is handling voice input
        try {
          rec.stop();
        } catch (e) {
          // Ignore
        }
      }
    };

    rec.onerror = (event: any) => {
      // Ignore non-fatal speech errors like 'no-speech' or 'aborted'
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Wake-word speech recognition error:', event.error);
      }
    };

    rec.onend = () => {
      if (isComponentMounted) {
        setIsWakeWordListening(false);
        // Auto-restart background listener if hands-free mode is enabled and modal is closed
        if (handsFreeEnabled && !isVoiceModalOpen) {
          setTimeout(() => {
            if (isComponentMounted && handsFreeEnabled && !isVoiceModalOpen) {
              try {
                rec.start();
              } catch (e) {
                // Ignore restart race condition
              }
            }
          }, 400);
        }
      }
    };

    recognitionRef.current = rec;

    try {
      rec.start();
    } catch (e) {
      console.warn('Error starting wake word listener:', e);
    }

    return () => {
      isComponentMounted = false;
      setIsWakeWordListening(false);
      if (rec) {
        try {
          rec.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [handsFreeEnabled, isVoiceModalOpen, setIsVoiceModalOpen, setInitialVoiceQuery, setIsWakeWordListening]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-900/90 to-indigo-900/90 border border-violet-500/50 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-2 rounded-xl bg-violet-600 text-white animate-pulse">
        <Mic className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold text-violet-200">{toastMessage}</div>
        <div className="text-[10px] text-slate-300">Opening voice command window...</div>
      </div>
    </div>
  );
};
