import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({ isOpen, onClose }) => {
  const {
    sendMessage,
    isStreaming,
    initialVoiceQuery,
    setInitialVoiceQuery,
    setActiveModule,
  } = useAppStore();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('Say your command or tap mic to speak...');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialVoiceQuery) {
      setTranscript(initialVoiceQuery);
      setStatusText(`Captured wake-word command: "${initialVoiceQuery}"`);
    } else {
      setStatusText('Listening to your voice command...');
    }
  }, [initialVoiceQuery]);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusText('Web Speech API not supported in this browser. You can type commands in chat.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);
      setStatusText('Listening to your household command...');
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.error('Speech recognition error:', e);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    startListening();

    return () => {
      if (rec) {
        try {
          rec.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [isOpen]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setStatusText('Listening for command...');
      } catch (e) {
        // Already started
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      setIsListening(false);
      setStatusText('Mic paused. Tap mic to resume or click Execute.');
    }
  };

  const handleClose = () => {
    stopListening();
    setInitialVoiceQuery('');
    setTranscript('');
    onClose();
  };

  const handleSendVoiceCommand = async () => {
    if (!transcript.trim()) return;
    const cmd = transcript.replace(/hey lina|hey lena/gi, '').trim() || transcript;
    setTranscript('');
    setInitialVoiceQuery('');
    stopListening();
    setStatusText('Executing voice command...');
    onClose();

    // Switch to chat module to view the AI execution response
    setActiveModule('chat');
    await sendMessage(cmd);

    // Speak aloud response confirmation using Web Speech Synthesis
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance('Command received. Processing for Lina Assistant.');
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      synth.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/90 border border-violet-500/30 p-8 text-center shadow-2xl shadow-violet-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center">
            {/* Animated glowing wave pulses */}
            <div
              className={`absolute w-32 h-32 rounded-full bg-violet-600/30 blur-2xl transition-all duration-700 ${
                isListening ? 'scale-125 opacity-100 animate-pulse' : 'scale-90 opacity-40'
              }`}
            />
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                isListening
                  ? 'bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-violet-500/50 scale-105'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {isListening ? <Mic className="w-10 h-10 animate-pulse" /> : <MicOff className="w-10 h-10" />}
            </button>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Hands-Free Voice Agent
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">"Hey Lina" Mode</h3>
        <p className="text-sm text-slate-300 mb-6">{statusText}</p>

        {/* Live Transcript Display */}
        <div className="min-h-[80px] p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm font-medium mb-6 flex items-center justify-center italic">
          {transcript ? `"${transcript}"` : <span className="text-slate-500">Listening to your voice...</span>}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleSendVoiceCommand}
            disabled={!transcript.trim() || isStreaming}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-violet-600/30 disabled:opacity-50 transition-all"
          >
            Execute Voice Command
          </button>
        </div>
      </div>
    </div>
  );
};
