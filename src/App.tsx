import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import Timeline from './components/Timeline';
import PcBuilder from './components/PcBuilder';
import SlicerSimulator from './components/SlicerSimulator';
import ArcadeGame from './components/ArcadeGame';
import Contact from './components/Contact';
import MiniGamesPage from './components/MiniGamesPage';
import TacticalDefensePage from './components/TacticalDefensePage';
import { Cpu, Printer, Gamepad2, Hammer, Layers, Github, Mail, Sparkles, Code, Terminal } from 'lucide-react';

export default function App() {
  const [activeLabTab, setActiveLabTab] = useState<'hardware' | 'slicing' | 'game'>('hardware');
  const [currentView, setCurrentView] = useState<'portfolio' | 'games' | 'tactical-defense'>('portfolio');
  
  // Building simulation states
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildingLabel, setBuildingLabel] = useState('SYSTEM_RESOURCES');

  const aboutRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const labRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  // Parallax effects for the Laboratorio section using scroll progress
  const { scrollYProgress } = useScroll({
    target: labRef,
    offset: ["start end", "end start"]
  });

  const yLabBg1 = useTransform(scrollYProgress, [0, 1], [-90, 90]);
  const yLabBg2 = useTransform(scrollYProgress, [0, 1], [90, -90]);

  const triggerBuilding = (onComplete: () => void, label: string = 'SYSTEM_MODULE') => {
    setBuildingLabel(label);
    setBuildProgress(0);
    setIsBuilding(true);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
          setIsBuilding(false);
        }, 150);
      }
      setBuildProgress(progress);
    }, 40);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigateToSection = (ref: React.RefObject<HTMLDivElement | null>, label: string) => {
    triggerBuilding(() => {
      if (currentView !== 'portfolio') {
        setCurrentView('portfolio');
        setTimeout(() => {
          scrollToSection(ref);
        }, 50);
      } else {
        scrollToSection(ref);
      }
    }, label);
  };

  const handleLabTabChange = (tab: 'hardware' | 'slicing' | 'game') => {
    const labels = {
      hardware: 'PC_BUILDER_SIMULATOR',
      slicing: '3D_SLICER_SIMULATOR',
      game: 'ARCADE_SPACE_SHOOTER'
    };
    triggerBuilding(() => {
      setActiveLabTab(tab);
    }, labels[tab]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans selection:bg-brand-500/20 selection:text-brand-400 relative">
      {/* Editorial Background Decorations */}
      <div className="absolute inset-0 tech-grid opacity-15 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/90 backdrop-blur-md px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
          triggerBuilding(() => {
            setCurrentView('portfolio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 'PORTFOLIO_HOME');
        }}>
          <div className="w-9 h-9 bg-white flex items-center justify-center rounded-sm transition-transform hover:scale-105">
            <span className="text-black font-extrabold text-lg">R</span>
          </div>
          <span className="font-semibold tracking-widest text-xs uppercase text-white hidden sm:block">
            Rossi_Core.log
          </span>
        </div>

        <nav className="flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-white/50">
          <button 
            onClick={() => navigateToSection(aboutRef, 'CHI_SONO_MODULE')} 
            className="hover:text-white transition-colors cursor-pointer text-left"
          >
            Chi Sono
          </button>
          <button 
            onClick={() => navigateToSection(timelineRef, 'LINEA_TEMPO_MODULE')} 
            className="hover:text-white transition-colors cursor-pointer text-left"
          >
            Storia
          </button>
          <button 
            onClick={() => navigateToSection(labRef, 'LABORATORIO_MODULE')} 
            className="hover:text-white transition-colors cursor-pointer text-left"
          >
            Laboratorio
          </button>
          <button 
            onClick={() => navigateToSection(contactRef, 'CONTATTI_MODULE')} 
            className="hover:text-white transition-colors cursor-pointer text-left"
          >
            Contatti
          </button>
          <button 
            onClick={() => {
              triggerBuilding(() => {
                setCurrentView('games');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 'MINI_GAMES_CORE');
            }} 
            className={`transition-colors cursor-pointer uppercase tracking-[0.2em] text-left ${currentView === 'games' ? 'text-brand-500 font-bold' : 'hover:text-white'}`}
          >
            Mini Giochi
          </button>
          <button 
            onClick={() => {
              triggerBuilding(() => {
                setCurrentView('tactical-defense');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 'TACTICAL_DEFENSE_CORE');
            }} 
            className={`transition-colors cursor-pointer uppercase tracking-[0.2em] text-left ${currentView === 'tactical-defense' ? 'text-red-500 font-bold' : 'hover:text-white'}`}
          >
            Difesa Tattica
          </button>
        </nav>

        <div className="hidden md:block text-[11px] font-mono text-brand-500 tracking-wider">
          STATUS: OPEN_MINDED // ACTIVE
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 z-10">
        {currentView === 'portfolio' ? (
          <>
            <Hero onExploreClick={() => navigateToSection(aboutRef, 'CHI_SONO_MODULE')} />

            {/* About Me narrative description */}
            <div ref={aboutRef}>
              <AboutMe />
            </div>

            {/* Career Timeline with milestones */}
            <div ref={timelineRef}>
              <Timeline />
            </div>

            {/* Interactive Lab Section */}
            <div ref={labRef} className="py-24 px-4 md:px-8 bg-[#050505] relative overflow-hidden border-t border-white/10">
              <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
              
              {/* Floating Parallax Schematic Badges */}
              <motion.div
                style={{ y: yLabBg1 }}
                className="absolute left-[3%] top-[10%] w-48 h-40 border border-white/5 bg-white/[0.01] p-4 hidden xl:flex flex-col justify-between font-mono text-[9px] text-white/25 select-none pointer-events-none z-0 rounded-lg"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span>[3D_RENDERER_SYSTEM]</span>
                  <span className="text-brand-500 font-bold">READY</span>
                </div>
                <div className="space-y-1">
                  <div>POLY_COUNT: 24,502</div>
                  <div>RENDER_TIME: 1.2ms</div>
                  <div>SHADING: PHONG_METAL</div>
                </div>
                <div className="text-[8px] text-white/10">COORDINATE_GRID // LOCK</div>
              </motion.div>

              <motion.div
                style={{ y: yLabBg2 }}
                className="absolute right-[3%] bottom-[15%] w-48 h-44 border border-white/5 bg-white/[0.01] p-4 hidden xl:flex flex-col justify-between font-mono text-[9px] text-white/25 select-none pointer-events-none z-0 rounded-lg"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span>[ARCADE_CORE_STATE]</span>
                  <span className="text-brand-500 font-bold">ACTIVE</span>
                </div>
                <div className="space-y-1">
                  <div>FPS: 60.00 / FIXED</div>
                  <div>PHYSICS: SAT_COLLISION</div>
                  <div>ENTITIES: 18_MAX</div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-500" 
                    animate={{ width: ["20%", "85%", "45%", "95%", "20%"] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />
                </div>
              </motion.div>

              <div className="w-full max-w-6xl mx-auto relative z-10">
                {/* Title block */}
                <div className="text-center mb-16 space-y-4">
                  <div className="inline-flex items-center gap-4">
                    <span className="text-[11px] font-mono text-brand-500 tracking-widest uppercase">// INTERACTIVE LAB</span>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-brand-500 to-transparent"></div>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">
                    LABORATORIO MAKER & DEV
                  </h2>
                  <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto font-mono tracking-wide">
                    Interagisci con le demo interattive che rappresentano le mie principali tappe evolutive.
                  </p>
                </div>

                {/* Navigation Tabs for each simulator */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12 max-w-3xl mx-auto font-mono text-xs">
                  <button
                    onClick={() => handleLabTabChange('hardware')}
                    className={`w-full md:w-auto flex-1 py-3 px-5 rounded-lg border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      activeLabTab === 'hardware'
                        ? 'bg-white/5 border-brand-500 text-white font-bold'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white/80 hover:border-white/10'
                    }`}
                  >
                    <Cpu size={14} className={activeLabTab === 'hardware' ? 'text-brand-500' : 'text-white/30'} />
                    <div className="text-left">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest leading-none mb-1">Hardware 2023</p>
                      <p className="text-white font-bold leading-none text-xs tracking-tight">PC Builder Simulator</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLabTabChange('slicing')}
                    className={`w-full md:w-auto flex-1 py-3 px-5 rounded-lg border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      activeLabTab === 'slicing'
                        ? 'bg-white/5 border-brand-500 text-white font-bold'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white/80 hover:border-white/10'
                    }`}
                  >
                    <Printer size={14} className={activeLabTab === 'slicing' ? 'text-brand-500' : 'text-white/30'} />
                    <div className="text-left">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest leading-none mb-1">Maker 2025</p>
                      <p className="text-white font-bold leading-none text-xs tracking-tight">3D Slicer Simulator</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLabTabChange('game')}
                    className={`w-full md:w-auto flex-1 py-3 px-5 rounded-lg border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      activeLabTab === 'game'
                        ? 'bg-white/5 border-brand-500 text-white font-bold'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white/80 hover:border-white/10'
                    }`}
                  >
                    <Gamepad2 size={14} className={activeLabTab === 'game' ? 'text-brand-500' : 'text-white/30'} />
                    <div className="text-left">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest leading-none mb-1">Game Dev 2026</p>
                      <p className="text-white font-bold leading-none text-xs tracking-tight">Playable Space Shooter</p>
                    </div>
                  </button>
                </div>

                {/* Selected Simulator Render */}
                <div className="w-full max-w-5xl mx-auto">
                  {activeLabTab === 'hardware' && <PcBuilder />}
                  {activeLabTab === 'slicing' && <SlicerSimulator />}
                  {activeLabTab === 'game' && <ArcadeGame />}
                </div>
              </div>
            </div>

            {/* Contact form and links */}
            <div ref={contactRef}>
              <Contact />
            </div>
          </>
        ) : currentView === 'games' ? (
          <MiniGamesPage onBackToPortfolio={() => {
            triggerBuilding(() => {
              setCurrentView('portfolio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 'PORTFOLIO_HOME');
          }} />
        ) : (
          <TacticalDefensePage onBack={() => {
            triggerBuilding(() => {
              setCurrentView('portfolio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 'PORTFOLIO_HOME');
          }} />
        )}
      </main>

      {/* Footer Bar */}
      <footer className="px-6 md:px-10 py-10 border-t border-white/10 bg-[#050505] flex flex-col md:flex-row justify-between items-center text-[11px] font-mono text-white/40 gap-6 z-10">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold tracking-widest uppercase">Rossi Portfolio</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40 font-light">BUILD_VERSION: 1.0.42_PROTOTYPE</span>
        </div>
        <div className="flex gap-8 uppercase tracking-widest text-[10px]">
          <a href="mailto:f.lucarossi@gmail.com" className="hover:text-white transition-colors">Email</a>
          <span className="text-white/10">/</span>
          <a href="https://github.com/RedLuke17" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white/60">Github</a>
        </div>
        <div>© 2026 DEVELOPER_RESERVED</div>
      </footer>

      {/* Dynamic Animated "Building..." Overlay */}
      <AnimatePresence>
        {isBuilding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-md select-none font-mono"
          >
            <div className="w-full max-w-md px-6 text-left space-y-6">
              {/* Header Title & Status */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
                  <span className="text-[10px] tracking-widest text-white/50 uppercase font-bold">COMPILER_CORE_ACTIVE</span>
                </div>
                <div className="text-[10px] text-brand-500 font-bold font-mono">BUILD_STABLE</div>
              </div>

              {/* Loader visual & label */}
              <div className="space-y-3">
                <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-white">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-brand-500" />
                    <span>BUILDING_SYSTEM...</span>
                  </div>
                  <span className="text-brand-500">{buildProgress}%</span>
                </div>

                {/* Progress bar container */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                  <motion.div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${buildProgress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Simulated build system logs */}
              <div className="bg-[#0c0c0c] border border-white/5 rounded-lg p-4 font-mono text-[9px] text-white/40 space-y-1.5 min-h-[95px] flex flex-col justify-end overflow-hidden">
                <div className="text-brand-500/50">&gt; TARGET: {buildingLabel}</div>
                {buildProgress >= 15 && <div className="text-white/30">&gt; [OK] RESOLVED DEPENDENCY SHADERS</div>}
                {buildProgress >= 40 && <div className="text-white/30">&gt; [OK] COMPILED REACT MODULES & COMPONENTS</div>}
                {buildProgress >= 70 && <div className="text-white/30">&gt; [OK] BUFFER_FLUSH & DOM_TREES_CONNECTED</div>}
                {buildProgress >= 90 && <div className="text-emerald-500">&gt; [SUCCESS] ENGINE_ONLINE // PORT_3000</div>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

