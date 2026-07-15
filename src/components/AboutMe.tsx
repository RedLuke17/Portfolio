import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Award, Cpu, Printer, FileCode, CheckCircle2, Navigation } from 'lucide-react';

export default function AboutMe() {
  const coreCompetencies = [
    {
      title: 'Informatica (HW/SW)',
      desc: 'Dall\'assemblaggio e manutenzione hardware fino alla programmazione software strutturata.',
      icon: Cpu,
      color: 'from-blue-500 to-indigo-500',
      tags: ['C#', 'C++', 'Java', 'SQL', 'OS Install', 'Troubleshooting']
    },
    {
      title: 'Modellazione 3D',
      desc: 'Progettazione tridimensionale di componenti complessi con totale controllo geometrico.',
      icon: Printer,
      color: 'from-emerald-500 to-brand-500',
      tags: ['CAD', 'Blender', 'Mesh Repair', 'Parametric Design']
    },
    {
      title: 'Prototipazione',
      desc: 'Realizzazione fisica e funzionale di progetti, gestendo l\'intero ciclo dall\'idea al prodotto.',
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      tags: ['Stampa FDM', 'Slicing', 'Materiali', 'Rifinitura HW']
    }
  ];

  const infoDetails = [
    { label: 'Formazione', value: 'Diploma in Informatica (2024)' },
    { label: 'Patente', value: 'B - Automunito' },
    { label: 'Attitudine', value: 'Problem Solving & Team Working' },
    { label: 'Mentalità', value: 'Open-minded, propenso all\'innovazione' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 70, damping: 14 }
    }
  };

  return (
    <section id="about" className="py-24 px-4 md:px-8 bg-[#050505] relative overflow-hidden border-t border-white/10">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-4">
            <span className="text-[11px] font-mono text-brand-500 tracking-widest uppercase">// CHI SONO</span>
            <div className="h-[1px] w-24 bg-gradient-to-r from-brand-500 to-transparent"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none uppercase">
            PRESENTAZIONE PERSONALE
          </h2>
          <p className="text-white/60 text-xs md:text-sm max-w-xl font-mono tracking-wide">
            Un connubio tra curiosità informatica, artigianato digitale 3D e codice interattivo.
          </p>
        </motion.div>

        {/* Main Layout Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          {/* Left Side: Avatar Card */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col items-center">
            <div 
              className="relative p-3 rounded-2xl glass-card border border-white/10 shadow-2xl overflow-hidden w-full max-w-md group"
            >
              {/* Image Container with Custom Generated Avatar */}
              <div className="aspect-square w-full rounded-xl overflow-hidden relative bg-white/[0.02]">
                <img 
                  src="/src/assets/images/developer_avatar_1784022947274.jpg" 
                  alt="Sviluppatore Avatar" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-75"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-[#050505]/95 backdrop-blur-md p-3 rounded border border-white/10 font-mono text-[10px] text-white/60 space-y-1 tracking-wider uppercase">
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className="text-brand-500 font-bold">DISPONIBILE AL LAVORO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MOBILITÀ:</span>
                    <span className="text-white">AUTO-MUNITO (PATENTE B)</span>
                  </div>
                </div>
              </div>

              {/* Bio Highlights / Info Details */}
              <div className="mt-6 space-y-3 font-mono text-[10px] text-white/50 uppercase tracking-widest">
                <h4 className="text-white font-bold tracking-wider text-[11px] border-b border-white/5 pb-2 uppercase">Informazioni Chiave</h4>
                {infoDetails.map((detail, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">{detail.label}:</span>
                    <span className="text-white text-right font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side: Narrative Biography & Skills */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-serif italic text-white flex items-center gap-3">
                <Navigation size={18} className="text-brand-500" />
                <span>Passione per l'Innovazione Tecnologica</span>
              </h3>
              
              <div className="text-white/70 text-sm md:text-base leading-relaxed font-light space-y-4">
                <p>
                  Neodiplomato in Informatica con una forte passione per l'innovazione tecnologica. Ho consolidato le mie basi tecniche, nate dall'assemblaggio PC e dalla programmazione, attraverso un percorso di studi tecnico mirato.
                </p>
                <p>
                  Appassionato di stampa 3D, ho acquisito ottime capacità nella modellazione e nella realizzazione di progetti in totale autonomia, gestendo il processo dall'idea al prodotto finito.
                </p>
                <p>
                  Sono una persona determinata, con spiccate doti di problem solving e un'elevata capacità di apprendimento. Mi adatto facilmente a nuovi contesti lavorativi, dove porto la mia propensione al lavoro di gruppo e la mia capacità di gestione autonoma dei compiti.
                </p>
              </div>
            </div>

            {/* Competencies Section */}
            <div className="space-y-4 pt-4">
              <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Competenze Principali</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coreCompetencies.map((comp, idx) => {
                  const Icon = comp.icon;
                  return (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                      transition={{ duration: 0.2 }}
                      className="p-5 rounded-lg glass-card border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="p-2.5 rounded bg-white/5 text-white/70 w-max group-hover:text-brand-500 group-hover:bg-white/10 transition-all">
                          <Icon size={18} />
                        </div>
                        <h5 className="font-bold text-white text-base tracking-tight">{comp.title}</h5>
                        <p className="text-white/60 text-xs leading-normal font-light">{comp.desc}</p>
                      </div>
                      
                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {comp.tags.map((tag, tIdx) => (
                          <span 
                            key={tIdx} 
                            className="px-2 py-0.5 rounded-sm text-[9px] font-mono bg-white/5 text-white/60 border border-white/5 uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
