/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { cvData } from "./cvData";
import { Message } from "./types";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  RotateCcw,
  Send,
  User,
  Sparkles,
  Phone,
  Mail,
  Linkedin,
  Clock,
  Terminal,
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  ChevronRight,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";

// Synthesize premium futuristic sound effects using Web Audio API
const playSoundEffect = (type: "click" | "activate" | "listening" | "success") => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "activate") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    } else if (type === "listening") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Audio synthesis not permitted or failed
  }
};

export default function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState<"en" | "fr">("en");
  
  // Audio state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [audioFeedbackText, setAudioFeedbackText] = useState("Agent Offline");
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState<number | null>(null);

  // UX Feedback states
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // References
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sphereAnimationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Voice list selection helper
  const getOptimalVoice = (lang: "en" | "fr") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Attempt specific premium local voices
    if (lang === "en") {
      const enVoice = voices.find(v => v.lang.startsWith("en-") && v.name.toLowerCase().includes("google")) ||
                      voices.find(v => v.lang.startsWith("en-") && v.name.toLowerCase().includes("natural")) ||
                      voices.find(v => v.lang.startsWith("en-"));
      return enVoice || voices[0] || null;
    } else {
      const frVoice = voices.find(v => v.lang.startsWith("fr-") && v.name.toLowerCase().includes("google")) ||
                      voices.find(v => v.lang.startsWith("fr-") && v.name.toLowerCase().includes("natural")) ||
                      voices.find(v => v.lang.startsWith("fr-"));
      return frVoice || voices[0] || null;
    }
  };

  // 2. Trigger text-to-speech engine
  const speakText = (text: string, voiceLang: "en" | "fr") => {
    if (!speechEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    // Discard current sounds
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    setAudioFeedbackText(voiceLang === "en" ? "Speaking..." : "Parle...");

    // Remove markdown symbols easily read incorrectly by synth
    let sanitizedText = text
      .replace(/[*#_`~]/g, "")
      .replace(/[-+•]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(sanitizedText);
    const selectedVoice = getOptimalVoice(voiceLang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Adapt rate slightly to sound clean and professional
    utterance.rate = voiceLang === "fr" ? 0.98 : 1.0;
    utterance.pitch = 1.05;
    utterance.lang = voiceLang === "fr" ? "fr-FR" : "en-US";

    utterance.onend = () => {
      setIsSpeaking(false);
      setAudioFeedbackText(voiceLang === "en" ? "Ready to hear you" : "Prêt à vous écouter");
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      setIsSpeaking(false);
      setAudioFeedbackText("Voice Idle");
    };

    synthesisUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // 3. Initiate Speech Recognition
  const startSpeechRecognition = () => {
    playSoundEffect("listening");
    
    // Cancel current reading outputs
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Speech recognition not supported in this browser environment.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === "en" ? "en-US" : "fr-FR";

      rec.onstart = () => {
        setIsListening(true);
        setAudioFeedbackText(language === "en" ? "Listening to recruiter..." : "À l'écoute du recruteur...");
        setRecognitionError(null);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          submitQuery(transcript);
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
        setAudioFeedbackText("Idle");
        if (err.error === "not-allowed") {
          setRecognitionError("Microphone access denied. You can still chat by typing below!");
        } else {
          setRecognitionError(`Voice error: ${err.error || "unavailable"}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.error(e);
      setRecognitionError("Initialization error with Web Speech API.");
    }
  };

  // Stop current operations
  const stopAllAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
    setAudioFeedbackText("Idle / Rest");
  };

  // Switch voice language
  const toggleLanguage = () => {
    playSoundEffect("click");
    const nextLang = language === "en" ? "fr" : "en";
    setLanguage(nextLang);
    
    // Greet immediately in the correct language
    const frenchGreeting = "Bonjour, je suis l'agent vocal de Camille Duroy, comment puis-je vous aider ?";
    const englishGreeting = "Hello i am Camille duroy voice agent, how can I help you ?";
    const greeting = nextLang === "en" ? englishGreeting : frenchGreeting;

    setMessages([
      {
        id: "greeter-" + Date.now(),
        role: "model",
        text: greeting,
        timestamp: new Date()
      }
    ]);

    if (sessionActive) {
      speakText(greeting, nextLang);
    }
  };

  // Triggered when clicking 'Activate Agent / Link'
  const startInteractiveVoiceAgent = () => {
    playSoundEffect("activate");
    setSessionActive(true);
    
    const startMsg: Message = {
      id: "greeter-init",
      role: "model",
      text: "Hello i am Camille duroy voice agent, how can I help you ?",
      timestamp: new Date()
    };
    
    setMessages([startMsg]);
    
    // Speak automatically
    setTimeout(() => {
      speakText("Hello i am Camille duroy voice agent, how can I help you ?", "en");
    }, 400);
  };

  // Submit query (either text typed or voice spoken)
  const submitQuery = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    playSoundEffect("click");
    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsGenerating(true);
    setAudioFeedbackText(language === "en" ? "Analyzing data pool..." : "Analyse du profil...");

    // Auto detect if recruiter typed or spoke in French to shift language setting
    const lowerText = text.toLowerCase();
    const frenchKeywords = ["bonjour", "salut", "french", "français", "cv", "experience", "stage", "éducation", "competence", "alternance", "colissimo", "téléphone", "mail", "contact"];
    const englishKeywords = ["english", "hello", "hi", "skills", "education", "experience", "work", "certification", "phone", "email"];
    
    let queryLanguage = language;
    const frenchScore = frenchKeywords.filter(kw => lowerText.includes(kw)).length;
    const englishScore = englishKeywords.filter(kw => lowerText.includes(kw)).length;
    
    if (frenchScore > englishScore && frenchScore > 0 && language !== "fr") {
      queryLanguage = "fr";
      setLanguage("fr");
    } else if (englishScore > frenchScore && englishScore > 0 && language !== "en") {
      queryLanguage = "en";
      setLanguage("en");
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          // Feed the last 6 responses for smart contextual depth
          history: messages.slice(-6).map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Server communication broken.");
      }

      const result = await response.json();
      
      const assistantMsg: Message = {
        id: "ai-" + Date.now(),
        role: "model",
        text: result.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsGenerating(false);
      
      // Synthesize Speech
      speakText(result.text, queryLanguage);
      playSoundEffect("success");

    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      setAudioFeedbackText("Error!");
      
      const errMsg: Message = {
        id: "err-" + Date.now(),
        role: "model",
        text: language === "en" 
          ? "I am temporarily offline. Let me review my databases. You can reach Camille directly at duroymacille@gmail.com!"
          : "Je subis un léger contretemps réseau. Vous pouvez toujours contacter Camille directement à duroycamille@gmail.com !",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  // Quick Preset Chips for Recruiters (French and English)
  const queryChips = language === "en" ? [
    { label: "Colissimo Experience 📦", query: "Can you detail Camille's product manager role at Colissimo?" },
    { label: "Technical Skills 📊", query: "What analytical tools and software is Camille certified in?" },
    { label: "Sopra Steria Stage 💻", query: "What achievements did she accomplish during her Sopra Steria stage?" },
    { label: "Languages & Education 🎓", query: "What languages does Camille speak and what is her academic degree?" },
    { label: "Hobbies & Piano 🎹", query: "Tell me about her private interests, tennis and piano!" },
    { label: "How to Contact? 📞", query: "What are the contact details and references for Camille?" }
  ] : [
    { label: "Expérience Colissimo 📦", query: "Détaille-moi son expérience d'alternance chez Colissimo." },
    { label: "Compétences Techniques 📊", query: "Quels sont les outils d'analyse et les logiciels maîtrisés ?" },
    { label: "Stage Sopra Steria 💻", query: "Quelles furent ses missions durant son stage chez Sopra Steria ?" },
    { label: "Éducation & Langues 🎓", query: "Quel diplôme prépare-t-elle et quel est son niveau d'anglais ?" },
    { label: "Loisirs & Piano 🎹", query: "Parle-moi de ses loisirs : tennis, psychologie et piano." },
    { label: "Contact & Tuteurs 📞", query: "Comment la contacter et qui sont ses tuteurs de référence ?" }
  ];

  // Helper: Copy string utility
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    playSoundEffect("success");
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Auto Scroll Chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  // Audio sphere visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 60;

      // Pulse scaling depending on the audio agent state
      let pulseMultiplier = 1.0;
      if (isSpeaking) {
        pulseMultiplier = 1.0 + Math.sin(time * 2.5) * 0.25;
      } else if (isListening) {
        pulseMultiplier = 1.0 + Math.sin(time * 5.0) * 0.12;
      } else if (isGenerating) {
        pulseMultiplier = 1.0 + Math.abs(Math.sin(time * 1.5)) * 0.08;
      }

      // Draw futuristic orbital lines
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * pulseMultiplier * 1.4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * pulseMultiplier * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer particle ring inside visualizer
      for (let i = 0; i < 30; i++) {
        const angle = (i * Math.PI * 2) / 30 + (time * 0.12);
        const radius = baseRadius * pulseMultiplier * 1.45;
        const px = centerX + Math.cos(angle) * radius;
        const py = centerY + Math.sin(angle) * radius;
        ctx.fillStyle = i % 5 === 0 ? "rgba(0, 240, 255, 0.82)" : "rgba(0, 240, 255, 0.35)";
        ctx.beginPath();
        ctx.arc(px, py, i % 5 === 0 ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dynamic frequency wave visualizer
      if (isSpeaking || isListening || isGenerating) {
        ctx.beginPath();
        for (let i = 0; i < 360; i += 5) {
          const angle = (i * Math.PI) / 180;
          // Calculate high-frequency distortion depending on active state
          let wave = 0;
          if (isSpeaking) {
            wave = Math.sin(angle * 8 + time * 3) * 15 * Math.cos(time);
          } else if (isListening) {
            wave = Math.sin(angle * 14 + time * 8) * 8;
          } else if (isGenerating) {
            wave = Math.sin(angle * 4 + time * 2) * 5;
          }

          const r = (baseRadius + wave) * pulseMultiplier;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = isListening ? "rgba(16, 185, 129, 0.85)" : "rgba(0, 240, 255, 0.85)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = isListening ? "rgba(16, 185, 129, 0.5)" : "rgba(0, 240, 255, 0.5)";
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // Inside core glowing hologram sphere
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        baseRadius * pulseMultiplier
      );
      if (isListening) {
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.95)");
        gradient.addColorStop(0.5, "rgba(6, 95, 70, 0.45)");
        gradient.addColorStop(1, "rgba(2, 44, 34, 0.05)");
      } else if (isSpeaking) {
        gradient.addColorStop(0, "rgba(0, 240, 255, 0.95)");
        gradient.addColorStop(0.5, "rgba(0, 50, 100, 0.45)");
        gradient.addColorStop(1, "rgba(0, 16, 32, 0.05)");
      } else if (isGenerating) {
        gradient.addColorStop(0, "rgba(236, 72, 153, 0.85)");
        gradient.addColorStop(0.6, "rgba(131, 24, 67, 0.35)");
        gradient.addColorStop(1, "rgba(4, 1, 10, 0.05)");
      } else {
        gradient.addColorStop(0, "rgba(0, 240, 255, 0.3)");
        gradient.addColorStop(0.8, "rgba(0, 30, 60, 0.1)");
        gradient.addColorStop(1, "rgba(0, 16, 32, 0)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * pulseMultiplier, 0, Math.PI * 2);
      ctx.fill();

      // Core visual pulse indicator
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = isListening ? "#10b981" : isGenerating ? "#ec4899" : "#00f0ff";
      ctx.fill();

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isSpeaking, isListening, isGenerating]);

  // Restart session / state clean
  const resetEntireSession = () => {
    playSoundEffect("activate");
    setMessages([]);
    setLanguage("en");
    setSessionActive(false);
    stopAllAudio();
  };

  return (
    <div id="voice-agent-app" className="min-h-screen bg-[#020813] text-gray-100 font-sans selection:bg-[#00f0ff] selection:text-[#001020] relative hologram-grid overflow-x-hidden md:py-8 py-3 px-3 md:px-8">
      
      {/* Absolute Decorative Glow Layers */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main container wrapper */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative z-10">

        {/* Global Nav Bar / Header */}
        <header id="header-hub" className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#05142a]/95 border border-[#00f0ff]/20 rounded-2xl p-5 md:p-6 shadow-glow-blue">
          
          <div className="flex items-center gap-4">
            {/* Pulsing Core icon */}
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#003055] to-[#00f0ff]/20 border border-[#00f0ff]/40">
              <Sparkles className="w-6 h-6 text-[#00f0ff] animate-pulse" />
              <div className="absolute -inset-1 rounded-xl bg-[#00f0ff]/20 blur opacity-60 animate-normal" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#00f0ff] tracking-[0.25em] font-semibold bg-[#003055] px-2 py-0.5 rounded-full uppercase border border-[#00f0ff]/30">
                  Interactive AI Voice Hub
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live v1.0
                </span>
              </div>
              <h1 className="text-2xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-blue-100 to-[#00f0ff] bg-clip-text text-transparent">
                CAMILLE DUROY <span className="font-light text-gray-400 text-lg">| Executive Voice concierge</span>
              </h1>
            </div>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center flex-wrap gap-2 md:gap-3">
            {/* Language toggle flag */}
            <button
              id="lang-switcher"
              onClick={toggleLanguage}
              title="Switch voice & parsing language"
              className="flex items-center gap-2 py-2 px-4 bg-[#002244] hover:bg-[#003366] active:scale-95 text-white font-mono text-xs font-semibold rounded-lg border border-[#00f0ff]/30 transition-all duration-200"
            >
              <Languages className="w-4 h-4 text-[#00f0ff]" />
              <span>Language:</span>
              <span className="text-[#00f0ff] uppercase">{language === "en" ? "EN 🇺🇸" : "FR 🇫🇷"}</span>
            </button>

            {/* Global Text to Speech Mode */}
            <button
              id="tts-toggle"
              onClick={() => {
                playSoundEffect("click"); 
                setSpeechEnabled(!speechEnabled);
                if (speechEnabled) window.speechSynthesis?.cancel();
              }}
              title="Toggle text-to-speech speaker output"
              className={`flex items-center gap-2 py-2 px-3 text-xs font-mono rounded-lg transition-all duration-200 border ${
                speechEnabled 
                  ? "bg-[#023340] border-[#00f0ff]/40 text-[#00f0ff]" 
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{speechEnabled ? "Voice Output ON" : "Voice Output MUTED"}</span>
            </button>

            {/* Clear session */}
            {sessionActive && (
              <button
                id="reset-hub"
                onClick={resetEntireSession}
                className="p-2 bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 text-red-400 hover:text-red-200 rounded-lg active:scale-95 transition-all"
                title="Restart Connection"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Intro Screen - Trigger Session Engagement safely */}
        {!sessionActive ? (
          <div id="intro-card" className="w-full bg-[#031024]/90 border border-[#00f0ff]/20 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-glow-blue mt-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-28 h-28 rounded-full mb-6 border-2 border-[#00f0ff]/40 p-1 bg-[#001c3d]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop"
                  alt="Camille Duroy"
                  className="w-full h-full object-cover rounded-full filter grayscale contrast-125"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#020813] animate-pulse" />
              </div>

              <h2 className="text-3xl font-display font-medium text-white mb-2">
                Camille Duroy AI Voice Agent
              </h2>
              <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
                Welcome, recruiter! Start a futuristic voice session to ask about Camille's marketing & data qualifications, Colissimo experience, and skills in French or English.
              </p>

              {/* Holographic Action Trigger Button */}
              <button
                id="btn-voice-activate"
                onClick={startInteractiveVoiceAgent}
                className="relative group flex items-center gap-3 py-4 px-8 bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:from-blue-500 hover:to-[#55f6ff] text-black font-semibold tracking-wide rounded-xl active:scale-95 transition-all shadow-glow-blue font-display"
              >
                <Mic className="w-5 h-5" />
                <span>CONNECT SECURE VOICE COM</span>
              </button>

              <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs font-mono text-gray-500">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400" /> Stereo Voice Synthesis
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400" /> Bilingual En/Fr
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400" /> Adaptive Gemini Backend
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Main Interactive Layout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT PANEL: Hologram core visualizer & Audio Console Controls (lg:col-span-5) */}
            <div id="control-console" className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Voice agent core visualization block */}
              <div className="bg-[#041126]/95 border border-[#00f0ff]/20 rounded-2xl p-6 shadow-glow-blue relative flex flex-col items-center justify-between text-center overflow-hidden">
                <div className="absolute top-2 left-3 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 uppercase">
                    <Terminal className="w-3 h-3 text-[#00f0ff]" /> 
                    <span>Hologram System</span>
                  </div>
                </div>

                <div className="absolute top-2 right-3 text-right">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    isListening ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" :
                    isGenerating ? "bg-pink-950 text-pink-400 border border-pink-500/20" :
                    isSpeaking ? "bg-[#0b3345] text-[#00f0ff] border border-[#00f0ff]/20" :
                    "bg-[#0a182b] text-gray-400"
                  }`}>
                    {isListening ? "Listening" : isGenerating ? "Processing" : isSpeaking ? "Speaking" : "Standby"}
                  </span>
                </div>

                {/* Animated Interactive HTML Canvas Area */}
                <div className="my-4 relative">
                  <canvas
                    ref={canvasRef}
                    width={220}
                    height={220}
                    className="mx-auto block"
                  />
                  {/* Backdrop photo centered nicely */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full overflow-hidden border border-[#00f0ff]/30 p-0.5 bg-black/60 pointer-events-none">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop"
                      alt="Avatar"
                      className="w-full h-full object-cover filter grayscale"
                    />
                  </div>
                </div>

                {/* Assistant Audio Status Indicators */}
                <div className="w-full mt-2">
                  <h3 className="text-lg font-display tracking-wide font-medium text-white mb-1">
                    AGENT: CAMILLE DUROY
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-400 mb-4 bg-[#010916] py-1.5 rounded-lg border border-[#00f0ff]/10">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isListening ? "bg-emerald-500 animate-pulse" :
                      isGenerating ? "bg-pink-500 animate-ping" :
                      isSpeaking ? "bg-blue-400 animate-pulse" :
                      "bg-gray-600"
                    }`} />
                    <span className="uppercase text-[11px] tracking-wider text-gray-300">
                      {audioFeedbackText}
                    </span>
                  </div>

                  {/* Recognition Error feedback line */}
                  {recognitionError && (
                    <div className="mb-4 text-xs bg-red-950/50 border border-red-500/40 p-2.5 rounded-lg text-red-300 font-mono text-left">
                      🚨 {recognitionError}
                    </div>
                  )}

                  {/* Trigger Recruiter Audio Mic Capture */}
                  <div className="flex flex-col gap-2">
                    <button
                      id="mic-listen-trigger"
                      onClick={startSpeechRecognition}
                      disabled={isGenerating}
                      className={`relative w-full py-4 px-4 font-display font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                        isListening 
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-green" 
                          : "bg-blue-600/90 text-white hover:bg-[#00e1f0] hover:text-black shadow-glow-blue border border-[#00f0ff]/30"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5 animate-bounce" />
                          <span>STOP VOICE PATTERN</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 text-current" />
                          <span>VOICE INPUT (SPEAK TO AGENT)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] font-mono text-gray-500 italic mt-1">
                      *Web Speech API uses browser permissions. Speak instantly, or select prompt chips below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Suggestion Box */}
              <div id="prompts-box" className="bg-[#041126]/95 border border-[#00f0ff]/20 rounded-2xl p-5 shadow-glow-blue flex flex-col">
                <h4 className="text-xs font-mono font-semibold tracking-wider text-[#00f0ff] uppercase border-b border-[#00f0ff]/20 pb-2 mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Prompt Suggestion Chips (Recruiter Shortcuts)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {queryChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        playSoundEffect("click");
                        setInputText(chip.query);
                      }}
                      className="text-xs text-slate-300 hover:text-white bg-[#022244]/60 col-span-1 rounded-lg px-3 py-2 border border-[#00f0ff]/10 text-left hover:border-[#00f0ff]/40 transition-all active:scale-[0.98]"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER PANEL: Realtime Chat Dialogue / Transcript Logs (lg:col-span-7) */}
            <div id="dialogue-station" className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Futuristic Chat Container */}
              <div className="flex-1 bg-[#041126]/95 border border-[#00f0ff]/20 rounded-2xl shadow-glow-blue flex flex-col p-4 md:p-6 min-h-[460px] max-h-[680px]">
                
                {/* Panel head metadata */}
                <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="text-[#00f0ff] w-4 h-4" />
                    <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-gray-300">
                      SECURE RECRUITER AUDIO DIALOGUE TRANSCRIPT
                    </h3>
                  </div>
                  <span className="text-[10px] bg-[#002244] px-2 py-0.5 border border-[#00f0ff]/20 rounded font-mono text-[#00f0ff]">
                    LOG_STREAM: LIVE
                  </span>
                </div>

                {/* Main Scrollable Chat Area */}
                <div id="chat-scroller" className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 max-w-[85%] ${
                        m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Interactive visual avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border uppercase font-mono text-xs ${
                        m.role === "user" 
                          ? "bg-slate-800 border-gray-600 text-gray-300"
                          : "bg-[#013555]/80 border-[#00f0ff]/40 text-[#00f0ff]"
                      }`}>
                        {m.role === "user" ? <User className="w-4 h-4" /> : "AI"}
                      </div>

                      {/* Speech bubbles */}
                      <div>
                        <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-[#002244]/80 border border-[#00f0ff]/30 text-white rounded-tr-none"
                            : "bg-[#001020]/90 border border-[#00f0ff]/20 text-gray-100 rounded-tl-none font-sans"
                        }`}>
                          <p className="whitespace-pre-line">{m.text}</p>
                        </div>
                        
                        {/* Interactive metadata footer of bubble */}
                        <div className={`flex items-center gap-2 mt-1 text-[10px] font-mono text-gray-500 ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          {m.role === "model" && (
                            <button
                              onClick={() => speakText(m.text, language)}
                              className="text-[#00f0ff]/80 hover:text-[#00f0ff] uppercase ml-1 flex items-center gap-0.5 active:scale-90 transition-all font-semibold"
                              title="Replay Voice Output"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Replay Voice</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* AI processing indicator wave effect */}
                  {isGenerating && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-lg bg-[#003055] border border-[#00f0ff]/40 text-[#00f0ff] flex items-center justify-center text-xs font-mono font-bold">
                        AI
                      </div>
                      <div className="bg-[#001020]/80 border border-[#00f0ff]/20 rounded-xl rounded-tl-none p-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#00f0ff] rounded-full animate-bounce delay-100" />
                        <span className="w-2.5 h-2.5 bg-[#00f0ff] rounded-full animate-bounce delay-200" />
                        <span className="w-2.5 h-2.5 bg-[#00f0ff] rounded-full animate-bounce delay-300" />
                        <span className="text-xs font-mono text-gray-400 ml-2">Accessing Camille's database...</span>
                      </div>
                    </div>
                  )}

                  {/* Anchor for automatic scroll */}
                  <div ref={chatEndRef} />
                </div>

                {/* Form Input for manual recruiter queries */}
                <form
                  id="query-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitQuery(inputText);
                  }}
                  className="mt-4 pt-4 border-t border-[#00f0ff]/20 flex gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      language === "en" 
                        ? "Ask about experiences, core certifications or languages..." 
                        : "Posez votre question sur son alternance, ses maîtrises, ou contact..."
                    }
                    disabled={isGenerating}
                    className="flex-1 bg-[#010a18] border border-[#00f0ff]/30 focus:border-[#00f0ff] outline-none text-white text-sm font-sans rounded-xl px-4 py-3 placeholder-gray-500 transition duration-150"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isGenerating}
                    className="p-3 bg-[#003055] border border-[#00f0ff]/40 hover:bg-[#00f0ff] hover:text-[#001020] text-[#00f0ff] rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:hover:bg-[#003055] disabled:hover:text-[#00f0ff]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* BOTTOM METRIC: Interactive Cyberpunk Curriculum Vitae Feed */}
        <section id="resume-station" className="w-full bg-[#041126]/95 border border-[#00f0ff]/20 rounded-2xl p-6 shadow-glow-blue">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#00f0ff]/20 pb-4 mb-6 gap-3">
            <div className="flex items-center gap-2">
              <Award className="text-[#00f0ff] w-5 h-5" />
              <div>
                <h2 className="text-lg font-display text-white font-medium">
                  CAMILLE DUROY - INTERACTIVE PROFILE DATA
                </h2>
                <p className="text-xs text-gray-400 font-mono">
                  Explore physical records parsed from Camille's official curriculum. Click items to query the voice agent!
                </p>
              </div>
            </div>

            {/* Selection tags */}
            <div className="flex flex-wrap gap-1.5 bg-[#002244]/50 border border-[#00f0ff]/10 p-1 rounded-lg">
              {["all", "experiences", "skills", "education", "hobbies_contacts"].map((sec) => (
                <button
                  key={sec}
                  onClick={() => { playSoundEffect("click"); setSelectedSection(sec); }}
                  className={`px-3 py-1 text-xs font-mono rounded capitalize transition-all duration-150 ${
                    selectedSection === sec 
                      ? "bg-[#00f0ff] text-black font-semibold shadow-glow-blue" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {sec.replace("_", " & ")}
                </button>
              ))}
            </div>
          </div>

          {/* Quick contact banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {/* Phone block */}
            <div
              onClick={() => handleCopy("06.47.57.01.61", "phone")}
              className="group cursor-pointer bg-[#001020]/90 border border-[#00f0ff]/20 hover:border-[#00f0ff] rounded-xl p-3.5 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#00f0ff] group-hover:scale-110" />
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Phone Call</span>
                  <p className="text-sm font-semibold text-white tracking-wide">{cvData.phone}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 group-hover:text-[#00f0ff]">
                {copiedText === "phone" ? "Copied! ✓" : "Copy"}
              </span>
            </div>

            {/* Email block */}
            <div
              onClick={() => handleCopy("duroycamille@gmail.com", "email")}
              className="group cursor-pointer bg-[#001020]/90 border border-[#00f0ff]/20 hover:border-[#00f0ff] rounded-xl p-3.5 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#00f0ff] group-hover:scale-110" />
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Email Contact</span>
                  <p className="text-sm font-semibold text-white truncate">{cvData.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 group-hover:text-[#00f0ff]">
                {copiedText === "email" ? "Copied! ✓" : "Copy"}
              </span>
            </div>

            {/* LinkedIn block */}
            <a
              href={cvData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSoundEffect("click")}
              className="group bg-[#001020]/90 border border-[#00f0ff]/20 hover:border-[#00f0ff]/80 rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mt-1">
                <Linkedin className="w-4 h-4 text-[#00f0ff] group-hover:scale-110" />
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">LinkedIn Profile</span>
                  <p className="text-sm font-semibold text-white tracking-wide">Camille Duroy</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-505 group-hover:text-[#00f0ff] transition-transform duration-200" />
            </a>
          </div>

          {/* Interactive filter display layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* COLUMN 1: EXPERIENCES */}
            {(selectedSection === "all" || selectedSection === "experiences") && (
              <div className="flex flex-col gap-6">
                <h3 className="text-sm font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-2 border-b border-[#00f0ff]/20 pb-2">
                  <Briefcase className="w-4 h-4" /> Professional Record & Milestones
                </h3>

                {cvData.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!sessionActive) { setSessionActive(true); }
                      const promptText = language === "en" 
                        ? `Tell me about Camille's role as ${exp.role} at ${exp.company}`
                        : `Présente-moi l'expérience de Camille en tant que ${exp.role} chez ${exp.company}`;
                      submitQuery(promptText);
                    }}
                    className="group bg-[#010e1f] border border-[#00f0ff]/10 hover:border-[#00f0ff]/40 rounded-xl p-5 cursor-pointer relative overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 p-1 text-[10px] font-mono bg-[#002244] text-[#00f0ff] border-bl rounded-bl-lg">
                      {exp.type}
                    </div>

                    <h4 className="text-base font-semibold text-white group-hover:text-[#00f0ff] transition duration-150">
                      {exp.role}
                    </h4>
                    <p className="text-sm text-cyan-200 mt-1">{exp.company}</p>
                    <span className="text-xs font-mono text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {exp.period}
                    </span>

                    <ul className="mt-3 space-y-2 text-xs text-gray-300 list-disc pl-4 leading-relaxed group-hover:text-gray-100 transition duration-150">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>

                    <div className="mt-4 pt-3 border-t border-dashed border-[#00f0ff]/10 flex justify-between items-center text-[10px] text-gray-400">
                      <span className="font-mono text-[#00f0ff]/60 group-hover:text-[#00f0ff]">
                        ✦ CLICK TO SPEAK ABOUT THIS EXPERIMENT
                      </span>
                      <span>{exp.company.includes("Poste") ? "Marketing & Data" : "Marketing & Com"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COLUMN 2: CERTIFICATIONS, SKILLS, EDUCATION */}
            <div className="flex flex-col gap-6">
              
              {/* SKILLS PANEL */}
              {(selectedSection === "all" || selectedSection === "skills") && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-2 border-b border-[#00f0ff]/20 pb-2">
                    <Award className="w-4 h-4" /> Certifications & Mastered Tools
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cvData.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!sessionActive) { setSessionActive(true); }
                          const promptText = language === "en" 
                            ? `Can you speak about her ${cert.category} certifications and tools like ${cert.skills.join(', ')}?`
                            : `Parle-moi de ses compétences en ${cert.category} et les outils associés : ${cert.skills.join(', ')}`;
                          submitQuery(promptText);
                        }}
                        className="bg-[#010e1f] border border-[#00f0ff]/10 hover:border-[#00f0ff]/40 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <h4 className="text-xs font-mono text-cyan-300 uppercase tracking-widest mb-2.5">
                          {cert.category}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {cert.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] bg-sky-950/40 text-sky-200 px-2 py-0.5 rounded border border-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition duration-150"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDUCATION PANEL */}
              {(selectedSection === "all" || selectedSection === "education") && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-2 border-b border-[#00f0ff]/20 pb-2">
                    <GraduationCap className="w-4 h-4" /> Academic Pathway
                  </h3>

                  <div className="space-y-3">
                    {cvData.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="bg-[#010e1f]/80 border border-[#00f0ff]/10 p-4 rounded-xl relative hover:border-[#00f0ff]/30 transition duration-150"
                      >
                        <span className="absolute top-4 right-4 text-xs font-mono text-gray-500">{edu.period}</span>
                        <h4 className="text-sm font-bold text-gray-100">{edu.degree}</h4>
                        <p className="text-xs text-[#00f0ff] mt-0.5">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOBBIES & REFERENCES */}
              {(selectedSection === "all" || selectedSection === "hobbies_contacts") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* HOBBIES */}
                  <div className="bg-[#010e1f]/80 border border-[#00f0ff]/10 p-4 rounded-xl">
                    <h4 className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> Core Interests
                    </h4>
                    <div className="space-y-2">
                      {cvData.interests.map((int, idx) => (
                        <div key={idx}>
                          <span className="text-xs font-semibold text-gray-200 block">{int.name}</span>
                          <span className="text-[11px] text-gray-400 block">{int.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REFERENCES */}
                  <div className="bg-[#010e1f]/80 border border-[#00f0ff]/10 p-4 rounded-xl">
                    <h4 className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider mb-2.5">
                      Professional References
                    </h4>
                    <div className="space-y-2">
                      {cvData.references.map((ref, idx) => (
                        <div key={idx} className="border-b border-gray-800 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-xs font-bold text-gray-200 block">{ref.name}</span>
                          <span className="text-[10px] text-gray-400 leading-tight block">{ref.title}</span>
                          <span className="text-[10px] text-gray-400 block">{ref.company}</span>
                        </div>
                      ))}
                      <p className="text-[9px] font-mono text-indigo-300 italic mt-1 leading-tight">
                        *Reference contact details transmissible in chat on request
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
