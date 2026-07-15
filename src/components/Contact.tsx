import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, CheckCircle, Navigation, FileText, Download, Car, RefreshCw, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [cvDownloading, setCvDownloading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setFormStatus('sending');
    // Simulate real database or email sending lag
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Auto reset success message after some seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
    }, 1200);
  };

  const handleCvDownload = () => {
    setCvDownloading(true);
    setTimeout(() => {
      setCvDownloading(false);
      
      // Create a simulated text resume with beautiful text formatting
      const resumeContent = `CURRICULUM VITAE - SVILUPPATORE & MAKER
==========================================

INFORMAZIONI PERSONALI
----------------------
Nome: L. Rossi
E-mail: f.lucarossi@gmail.com
Patente: B - Automunito
Disponibilità: Immediata per nuove sfide e posizioni tecnologiche.

PROFILO PROFESSIONALE
---------------------
Neodiplomato in Informatica con una forte passione per l'innovazione tecnologica. Ho consolidato le mie basi tecniche, nate dall'assemblaggio PC e dalla programmazione, attraverso un percorso di studi tecnico mirato. Appassionato di stampa 3D, ho acquisito ottime capacità nella modellazione e nella realizzazione di progetti in totale autonomia, gestendo il processo dall'idea al prodotto finito.
Sono una persona determinata, con spiccate doti di problem solving e un'elevata capacità di apprendimento. Mi adatto facilmente a nuovi contesti lavorativi, dove porto la mia propensione al lavoro di gruppo e la mia capacità di gestione autonoma dei compiti.

COMPETENZE PRINCIPALI
---------------------
- Informatica (HW/SW): Assemblaggio PC, diagnosi hardware, ottimizzazione TDP, installazione OS.
- Programmazione: C#, Java, C++, SQL, sviluppo desktop.
- Modellazione 3D: CAD parametrico, Blender (mesh organic modeling), Slicing (Cura/Prusa).
- Prototipazione: Stampa FDM, calibrazione calore/assi, finiture hardware, prototipi fisici.
- Sviluppo Videogiochi: Unity Engine, Godot Engine, cicli di gioco (Game Loop), collisioni e fisica.

STORIA PROFESSIONALE & PIETRE MILIARI
-------------------------------------
- 2023: Assemblaggio PC e manutentore hardware/software.
- 2024: Conseguimento del Diploma in Informatica.
- 2025: Gestione in autonomia di un business di stampa 3D e prototipazione per clienti.
- 2026: Sviluppatore di videogiochi interattivi 2D/3D (C# / Unity / Godot).

==========================================
Generato tramite Portfolio Sviluppatore & Maker v2.0.26
`;
      const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'CV_Rossi_Sviluppatore_Maker.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 px-4 md:px-8 bg-[#050505] relative overflow-hidden border-t border-white/10">
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center md:text-left mb-16 space-y-4">
          <div className="inline-flex items-center gap-4">
            <span className="text-[11px] font-mono text-brand-500 tracking-widest uppercase">// CONTATTI</span>
            <div className="h-[1px] w-24 bg-gradient-to-r from-brand-500 to-transparent"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none uppercase">
            METTIAMOCI IN CONTATTO
          </h2>
          <p className="text-white/60 text-xs md:text-sm max-w-xl font-mono tracking-wide">
            Collaboriamo per dare vita a nuove idee, prototipi fisici o software interattivi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Direct Info & CV */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-serif italic text-white">Informazioni di Contatto</h3>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              Sono disponibile per posizioni di lavoro, stage, collaborazioni nel campo della modellazione 3D e dello sviluppo software.
            </p>

            <div className="space-y-4 pt-4 font-mono text-xs">
              {/* Email item */}
              <div className="flex items-center gap-4 p-4 rounded-lg glass-card border border-white/5">
                <div className="p-2.5 rounded bg-white/5 text-brand-500">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Invia un'Email</p>
                  <a href="mailto:f.lucarossi@gmail.com" className="text-white hover:text-brand-500 transition-colors">
                    f.lucarossi@gmail.com
                  </a>
                </div>
              </div>

              {/* Driver's license item */}
              <div className="flex items-center gap-4 p-4 rounded-lg glass-card border border-white/5">
                <div className="p-2.5 rounded bg-white/5 text-white/80">
                  <Car size={16} />
                </div>
                <div>
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Patente & Mezzo</p>
                  <p className="text-white font-medium">B - Automunito</p>
                </div>
              </div>

              {/* Work availability status */}
              <div className="flex items-center gap-4 p-4 rounded-lg glass-card border border-white/5">
                <div className="p-2.5 rounded bg-white/5 text-white/80">
                  <Navigation size={16} className="text-brand-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Stato Attuale</p>
                  <p className="text-white font-medium">Neodiplomato, Propensione all'Innovazione</p>
                </div>
              </div>
            </div>

            {/* Curriculum Vitae Download Button Box */}
            <div className="p-5 rounded-lg glass-card border border-white/10 space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="text-brand-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-sm text-white tracking-tight">Scarica il mio Curriculum Vitae</h4>
                  <p className="text-xs text-white/60 leading-relaxed mt-0.5 font-light">
                    Ottieni una copia completa di tutte le informazioni, competenze ed esperienze descritte in questo portfolio.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCvDownload}
                disabled={cvDownloading}
                className="w-full py-2.5 rounded bg-white/5 hover:bg-white/10 disabled:bg-white/[0.01] disabled:text-white/20 border border-white/10 hover:border-white/20 text-white font-semibold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 uppercase tracking-widest"
              >
                {cvDownloading ? (
                  <>
                    <RefreshCw className="animate-spin text-brand-500" size={12} />
                    <span>GENERAZIONE DOCUMENTO...</span>
                  </>
                ) : (
                  <>
                    <Download size={12} className="text-brand-500" />
                    <span>SCARICA CV (TXT FORMAT)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 md:p-8 rounded-xl glass-card border border-white/10 backdrop-blur-md relative">
              <h3 className="text-xl font-serif italic text-white mb-6 flex items-center gap-2">
                <MessageSquare className="text-brand-500" size={18} />
                <span>Scrivimi un Messaggio</span>
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-mono">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-white/40 uppercase tracking-[0.2em] block font-bold">Nome Completo</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="es. Mario Rossi"
                      className="w-full p-3 rounded-sm bg-white/[0.02] border border-white/10 focus:border-brand-500 text-white outline-none placeholder-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-white/40 uppercase tracking-[0.2em] block font-bold">Indirizzo Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="es. mario@esempio.com"
                      className="w-full p-3 rounded-sm bg-white/[0.02] border border-white/10 focus:border-brand-500 text-white outline-none placeholder-white/10"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/40 uppercase tracking-[0.2em] block font-bold">Oggetto</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="es. Proposta di stage / Progetto 3D"
                    className="w-full p-3 rounded-sm bg-white/[0.02] border border-white/10 focus:border-brand-500 text-white outline-none placeholder-white/10"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/40 uppercase tracking-[0.2em] block font-bold">Messaggio</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Scrivi qui il tuo messaggio..."
                    className="w-full p-3 rounded-sm bg-white/[0.02] border border-white/10 focus:border-brand-500 text-white outline-none placeholder-white/10 resize-none"
                  />
                </div>

                {/* Button container */}
                <div className="pt-2">
                  <AnimatePresence mode="wait">
                    {formStatus === 'success' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 rounded bg-[#0b130e]/80 border border-emerald-500/20 text-emerald-400 flex items-center gap-2.5 font-sans"
                      >
                        <CheckCircle size={14} />
                        <span className="font-semibold text-xs leading-normal">Messaggio inviato con successo! Ti risponderò al più presto.</span>
                      </motion.div>
                    ) : (
                      <button
                        type="submit"
                        disabled={formStatus === 'sending'}
                        className="w-full py-3 rounded bg-white hover:bg-white/90 disabled:bg-white/[0.03] disabled:text-white/20 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 tracking-widest transition-all uppercase cursor-pointer"
                      >
                        {formStatus === 'sending' ? (
                          <>
                            <RefreshCw className="animate-spin text-black" size={12} />
                            <span>INVIO IN CORSO...</span>
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>INVIA MESSAGGIO</span>
                          </>
                        )}
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
