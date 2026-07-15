import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'motion/react';
import { Cpu, FileJson, Printer, Gamepad2, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { TimelineItem } from '../types';

export default function Timeline() {
  const [activeYear, setActiveYear] = useState<number>(2023);
  const [isManual, setIsManual] = useState(false);
  const manualTimeoutRef = useRef<any>(null);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      if (isManual) return;
      if (latest < 0.25) {
        setActiveYear(2023);
      } else if (latest < 0.5) {
        setActiveYear(2024);
      } else if (latest < 0.75) {
        setActiveYear(2025);
      } else {
        setActiveYear(2026);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, isManual]);

  const handleYearClick = (year: number) => {
    setActiveYear(year);
    setIsManual(true);
    if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    manualTimeoutRef.current = setTimeout(() => {
      setIsManual(false);
    }, 1200);
  };

  const timelineData: TimelineItem[] = [
    {
      year: 2023,
      title: 'Assemblaggio PC & Manutentore',
      subtitle: 'La Genesi: Hardware & Sistemi',
      description: 'L\'inizio del percorso tecnologico. Consolidamento della comprensione profonda dell\'hardware informatico attraverso l\'assemblaggio di workstation personalizzate e diagnosi di sistemi.',
      details: [
        'Assemblaggio di computer desktop personalizzati (gaming, office, calcolo pesante).',
        'Diagnostica hardware avanzata, sostituzione componenti difettosi e troubleshooting di sistemi operativi.',
        'Ottimizzazione termica e gestione dei flussi d\'aria (airflow, liquid cooling, applicazione paste termiche).',
        'Configurazione BIOS/UEFI, partizionamento avanzato e ottimizzazione dei sistemi di storage.'
      ],
      tech: ['Hardware Diagnostica', 'Cable Management', 'BIOS Tuning', 'Sistemi Operativi', 'Ottimizzazione Termica'],
      category: 'hardware'
    },
    {
      year: 2024,
      title: 'Diploma in Informatica',
      subtitle: 'Strutturazione accademica delle basi di Ingegneria del Software',
      description: 'Conseguimento del diploma tecnico in Informatica. Acquisizione formale dei concetti di programmazione strutturata, orientata agli oggetti (OOP), basi di dati e networking.',
      details: [
        'Studio approfondito di algoritmi, strutture dati e complessità computazionale.',
        'Progettazione, normalizzazione e interrogazione di database relazionali (SQL).',
        'Sviluppo di applicazioni software desktop in C# e Java, con focus sui principi del clean code.',
        'Progettazione e simulazione di infrastrutture di rete (modello ISO/OSI, subnetting, protocolli di routing).'
      ],
      tech: ['C#', 'Java', 'SQL / MySQL', 'Algoritmi', 'OOP', 'Networking'],
      category: 'education'
    },
    {
      year: 2025,
      title: 'Business di Stampa 3D',
      subtitle: 'Imprenditorialità & Fabbricazione Digitale',
      description: 'Fondazione e gestione autonoma di un\'attività indipendente di stampa 3D. Trasformazione delle idee in prototipi fisici per clienti privati e aziende.',
      details: [
        'Modellazione 3D parametrica e organica utilizzando CAD e Blender.',
        'Gestione dell\'intero processo di stampa: preparazione file (slicing), calibrazione macchine FDM e post-elaborazione chimico/meccanica.',
        'Risoluzione in autonomia di guasti complessi a stampanti 3D (hardware, estrusori, calibrazione assi).',
        'Gestione ordini, marketing e interazione diretta con il cliente per identificare le specifiche tecniche necessarie.'
      ],
      tech: ['Modellazione 3D', 'CAD / Blender', 'Slicing (Cura/Prusa)', 'Stampanti FDM', 'Risoluzione Problemi Hardware'],
      category: 'maker'
    },
    {
      year: 2026,
      title: 'Developer di Videogiochi',
      subtitle: 'Interactive Software & Real-time Rendering',
      description: 'Unione di programmazione, modellazione 3D e creatività. Focalizzazione sullo sviluppo di videogiochi interattivi, logiche di gameplay complesse e game design.',
      details: [
        'Scrittura di script per logiche di gioco, intelligenza artificiale dei nemici e sistemi di fisica.',
        'Sviluppo di mondi tridimensionali e bidimensionali con integrazione di asset personalizzati.',
        'Ottimizzazione delle prestazioni di rendering, gestione della memoria e ottimizzazione dei cicli del Game Loop.',
        'Progettazione di interfacce utente dinamiche ed esperienze di gioco fluide e appaganti.'
      ],
      tech: ['C# Sviluppo', 'Unity Engine', 'Godot Engine', 'Game Loop Logic', 'Fisica e Collisioni', 'Blender Assets'],
      category: 'gaming'
    }
  ];

  const getIcon = (category: string) => {
    switch (category) {
      case 'hardware': return Cpu;
      case 'education': return FileJson;
      case 'maker': return Printer;
      case 'gaming': return Gamepad2;
      default: return Compass;
    }
  };

  const currentItem = timelineData.find(item => item.year === activeYear) || timelineData[timelineData.length - 1];

  return (
    <section id="timeline" ref={sectionRef} className="relative h-[250vh] bg-[#050505] border-t border-white/10">
      <div className="sticky top-[75px] h-[calc(100vh-75px)] w-full flex flex-col justify-center py-6 px-4 md:px-8 overflow-y-auto select-none">
        {/* Decorative vertical line container background */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/5 hidden md:block pointer-events-none"></div>

        <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-4">
            <span className="text-[11px] font-mono text-brand-500 tracking-widest uppercase">// IL MIO PERCORSO</span>
            <div className="h-[1px] w-24 bg-gradient-to-r from-brand-500 to-transparent"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none uppercase">
            EVOLUZIONE PROFESSIONALE
          </h2>
          <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto font-mono tracking-wide">
            La mia storia tecnologica anno per anno. Clicca sulle tappe per approfondire le mie esperienze.
          </p>
        </motion.div>

        {/* Timeline Navigation Selector */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 50 }}
          className="relative flex justify-between max-w-3xl mx-auto mb-12 md:mb-16"
        >
          {/* Horizontal connecting wire */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${((activeYear - 2023) / (2026 - 2023)) * 100}%`
            }}
          ></div>

          {timelineData.map((item, idx) => {
            const Icon = getIcon(item.category);
            const isActive = item.year === activeYear;
            return (
              <motion.button
                key={item.year}
                onClick={() => handleYearClick(item.year)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="relative z-10 flex flex-col items-center group focus:outline-none"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all border ${
                    isActive 
                      ? 'bg-white text-black border-white shadow-xl font-bold' 
                      : 'bg-white/[0.02] text-white/50 border-white/10 group-hover:text-white group-hover:border-white/20'
                  }`}
                >
                  <Icon size={isActive ? 22 : 18} />
                </motion.div>
                
                <span className={`mt-3 font-mono font-bold text-xs md:text-sm tracking-wide transition-colors ${
                  isActive ? 'text-white font-extrabold' : 'text-white/40 group-hover:text-white'
                }`}>
                  {item.year}
                </span>
                <span className="hidden md:block mt-1 font-mono text-[10px] text-white/20 group-hover:text-white/40 text-center max-w-[100px] truncate">
                  {item.title.split(' ')[0]}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Detailed Timeline Showcase Card */}
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeYear}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-10 rounded-xl glass-card border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Year indicator & High level stats */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                <div className="text-6xl md:text-8xl font-serif italic font-extrabold text-brand-500">
                  {currentItem.year}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-white tracking-tight">{currentItem.title}</h4>
                  <p className="text-brand-500 font-mono text-xs font-semibold uppercase tracking-wider">{currentItem.subtitle}</p>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 pt-2">
                  {currentItem.tech.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-sm bg-white/5 text-white/60 font-mono text-[9px] border border-white/5 uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed achievements list */}
              <div className="lg:col-span-8 space-y-5">
                <p className="text-white/85 text-sm md:text-base leading-relaxed italic border-l-2 border-brand-500 pl-4 bg-white/[0.02] py-2 rounded-r font-serif">
                  "{currentItem.description}"
                </p>

                <div className="space-y-3 pt-2">
                  <h5 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">Attività & Traguardi principali:</h5>
                  <div className="space-y-2.5">
                    {currentItem.details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-white/60 leading-relaxed font-light">
                        <CheckCircle2 size={14} className="text-brand-500 mt-1 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Core Outlook Callout */}
        <motion.div 
          className="mt-16 p-6 rounded-lg glass-card border border-white/10 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6 hover:bg-white/[0.04] transition-all"
          whileHover={{ scale: 1.01 }}
        >
          <div className="p-3.5 rounded bg-white/5 text-brand-500 shrink-0">
            <Compass size={22} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
          </div>
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="font-serif italic text-lg text-white">Mentalità Aperta e Propensione allo Sviluppo Tecnologico</h4>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Il mio percorso dimostra che non mi fermo alle nozioni di base. Ho una mentalità curiosa e dinamica, capace di spaziare rapidamente dall'hardware di un PC alla modellazione tridimensionale fisica, fino alla logica interattiva di un videogioco di ultima generazione.
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
