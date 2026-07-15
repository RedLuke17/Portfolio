import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Terminal, ChevronDown, Cpu, Printer, Gamepad2, Sparkles, Code } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  const [terminalText, setTerminalText] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'welcome' | 'stack' | 'philosophy'>('welcome');
  const [terminalInput, setTerminalInput] = useState('');
  const [timeString, setTimeString] = useState('');

  // Floating background elements parallax effect
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 150]);
  const yContent = useTransform(scrollY, [0, 500], [0, -50]);
  const opacityHeader = useTransform(scrollY, [0, 300], [1, 0]);

  // Additional fine-tuned parallax movements for floating depth elements
  const y1 = useTransform(scrollY, [0, 1000], [0, -140]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -70]);

  useEffect(() => {
    // Current time update
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Terminal simulated typing
  useEffect(() => {
    const lines = [
      'Initializing developer_portfolio_v2.0.26...',
      'Loading core skills: [Hardware, Software, 3D_Modeling, Game_Dev]',
      'System status: ONLINE | Open-minded and technology driven.',
      'Ready to create innovative solutions.'
    ];

    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentLines: string[] = [];

    const typeEffect = setInterval(() => {
      if (currentLineIndex < lines.length) {
        const fullLine = lines[currentLineIndex];
        if (currentCharIndex <= fullLine.length) {
          const updatedLines = [...currentLines];
          updatedLines[currentLineIndex] = fullLine.substring(0, currentCharIndex);
          setTerminalText(updatedLines);
          currentCharIndex++;
        } else {
          currentLines.push(fullLine);
          currentLineIndex++;
          currentCharIndex = 0;
        }
      } else {
        clearInterval(typeEffect);
      }
    }, 25);

    return () => clearInterval(typeEffect);
  }, []);

  const executeCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    let response = '';

    if (cmd === 'help') {
      response = 'Disponibili: about | timeline | skills | clear';
    } else if (cmd === 'about') {
      response = 'Sviluppatore informatico, maker di stampa 3D e developer di videogiochi. Curioso ed entusiasta.';
    } else if (cmd === 'timeline') {
      response = '2023: PC Hardware -> 2024: Diploma Informatica -> 2025: Stampa 3D -> 2026: Sviluppo Videogiochi.';
    } else if (cmd === 'skills') {
      response = 'Java, C#, C++, SQL, Modellazione 3D (CAD/Blender), Game Engines (Unity/Godot).';
    } else if (cmd === 'clear') {
      setTerminalText([]);
      setTerminalInput('');
      return;
    } else {
      response = `Comando '${cmd}' non riconosciuto. Scrivi 'help' per aiuto.`;
    }

    setTerminalText(prev => [...prev, `> ${terminalInput}`, response]);
    setTerminalInput('');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 px-4 md:px-8 bg-[#050505] z-10">
      {/* Background Grid Pattern & Accents */}
      <div className="absolute inset-0 tech-grid opacity-15 pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Futuristic Editorial Top Status Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-white/40 tracking-widest pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
          <span>SYSTEM_STATUS // ACTIVE</span>
        </div>
        <div className="hidden sm:block">LOCAL_TIME: {timeString || '02:54:16'}</div>
        <div>BUILD_STABLE_V2.0.26</div>
      </div>

      {/* Floating Parallax Elements for Editorial Depth */}
      <motion.div
        style={{ y: y1 }}
        className="absolute right-[8%] top-[15%] w-52 h-44 rounded-xl border border-white/5 bg-white/[0.01] p-4 hidden xl:flex flex-col justify-between font-mono text-[9px] text-white/20 select-none pointer-events-none z-0"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span>[MATRIX_GRID_3D]</span>
          <span className="text-brand-500">v1.2</span>
        </div>
        <div className="space-y-1 py-1">
          <div>x_axis: 0.14298</div>
          <div>y_axis: -0.98214</div>
          <div>z_axis: 1.40231</div>
          <div className="h-[2px] w-full bg-brand-500/20 overflow-hidden relative mt-1">
            <div className="absolute top-0 bottom-0 left-0 w-2/3 bg-brand-500"></div>
          </div>
        </div>
        <div className="text-[8px] text-white/10 text-right">MODEL_LOADED // TRUE</div>
      </motion.div>

      <motion.div
        style={{ y: y2 }}
        className="absolute left-[5%] bottom-[15%] w-56 h-36 rounded-xl border border-white/5 bg-white/[0.01] p-4 hidden xl:flex flex-col justify-between font-mono text-[9px] text-white/20 select-none pointer-events-none z-0"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span>[HARDWARE_CORE]</span>
          <span className="text-brand-500 font-bold">STABLE</span>
        </div>
        <div className="space-y-1">
          <div>TEMP: 42°C</div>
          <div>VOLTAGE: 1.22V</div>
          <div>CLOCK: 4.80GHz</div>
        </div>
        <div className="flex items-center gap-1.5 text-brand-500/40 text-[8px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM_STATUS // RUNNING</span>
        </div>
      </motion.div>

      <motion.div
        style={{ y: y3 }}
        className="absolute right-[45%] top-[14%] hidden lg:flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full text-[9px] font-mono text-brand-400 tracking-wider uppercase select-none pointer-events-none z-0"
      >
        <Sparkles size={10} className="animate-pulse" />
        <span>PARALLAX_DEPTH_CONTAINER</span>
      </motion.div>

      <motion.div 
        style={{ y: yContent, opacity: opacityHeader }}
        className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
      >
        {/* Left Column: Editorial Title, Paragraph & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-8">
          <div className="inline-flex items-center gap-3">
            <span className="text-[10px] font-mono text-brand-500 tracking-[0.2em] uppercase">// EVOLUTION_START</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-brand-500 to-transparent"></div>
          </div>

          <h1 id="hero-title" className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] text-white">
            ROSSI_<br />
            <span className="text-brand-500 font-serif italic font-normal">SVILUPPATORE</span><br />
            & MAKER 3D
          </h1>

          <p className="text-white/60 text-sm md:text-base leading-relaxed font-light pr-12 max-w-xl">
            Trasformo idee astratte in software performanti, oggetti tridimensionali reali e mondi interattivi pronti da esplorare. Benvenuto nel mio spazio digitale.
          </p>

          {/* Quick Access Grid with Editorial Styles */}
          <div className="grid grid-cols-3 gap-4 py-2 max-w-md font-mono text-[10px]">
            <div className="glass-card p-3 rounded-lg flex items-center gap-3 border border-white/5">
              <Cpu className="text-brand-500" size={16} />
              <div>
                <p className="text-white/30 uppercase tracking-widest leading-none mb-1">Hardware</p>
                <p className="text-white font-bold text-xs">2023</p>
              </div>
            </div>
            <div className="glass-card p-3 rounded-lg flex items-center gap-3 border border-white/5">
              <Printer className="text-brand-500" size={16} />
              <div>
                <p className="text-white/30 uppercase tracking-widest leading-none mb-1">Stampa 3D</p>
                <p className="text-white font-bold text-xs">2025</p>
              </div>
            </div>
            <div className="glass-card p-3 rounded-lg flex items-center gap-3 border border-white/5">
              <Gamepad2 className="text-brand-500" size={16} />
              <div>
                <p className="text-white/30 uppercase tracking-widest leading-none mb-1">Gaming</p>
                <p className="text-white font-bold text-xs">2026</p>
              </div>
            </div>
          </div>

          {/* Call to Actions with clean shapes and subtle styling */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-md bg-white hover:bg-white/90 text-black font-semibold tracking-wide flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
            >
              <Code size={18} />
              <span>Esplora il Portfolio</span>
            </button>
            <a
              href="#contact"
              className="px-6 py-3 rounded-md bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all font-medium text-center text-sm"
            >
              Contattami
            </a>
          </div>
        </div>

        {/* Right Column: Developer Interactive Terminal Card using glass-card style */}
        <div className="lg:col-span-5 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl overflow-hidden font-mono"
          >
            {/* Window bar */}
            <div className="bg-white/[0.02] px-5 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-[10px] tracking-widest uppercase">
                <Terminal size={11} className="text-brand-500" />
                <span>TERMINAL_SESSION</span>
              </div>
              <div className="w-10"></div>
            </div>

            {/* Terminal Body */}
            <div className="p-5 space-y-4 min-h-[260px] max-h-[300px] overflow-y-auto text-xs text-white/80 leading-relaxed scrollbar-thin">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-white/30">
                <span>Console Sviluppatore</span>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-brand-500 font-bold uppercase tracking-wider">Scrivi 'help'</span>
              </div>

              {terminalText.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {line.startsWith('>') ? (
                    <span className="text-brand-500 font-bold">{line}</span>
                  ) : line.startsWith('Comando') ? (
                    <span className="text-red-400/90">{line}</span>
                  ) : line.includes('ONLINE') ? (
                    <span className="text-brand-500 font-bold">{line}</span>
                  ) : (
                    <span className="text-white/60">{line}</span>
                  )}
                </div>
              ))}

              <form onSubmit={executeCommand} className="flex items-center gap-2 text-white/90 pt-1">
                <span className="text-brand-500 font-bold">&gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  placeholder="Scrivi un comando..."
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white placeholder-white/20 caret-brand-500"
                  autoFocus={false}
                />
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/30 text-[10px] tracking-widest uppercase flex flex-col items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={onExploreClick}>
        <span>SCORRI</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown size={14} className="text-brand-500" />
        </motion.div>
      </div>
    </section>
  );
}
