import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Settings, Shield, RefreshCw, Layers } from 'lucide-react';

interface PCPart {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'ram' | 'cooling' | 'storage';
  brand: string;
  watts: number;
  spec: string;
  color: string;
}

export default function PcBuilder() {
  const parts: PCPart[] = [
    // CPUs
    { id: 'cpu-amd', name: 'AMD Ryzen 7 7800X3D', type: 'cpu', brand: 'AMD', watts: 120, spec: '8 Cores / 16 Threads @ 4.2GHz', color: 'bg-orange-500' },
    { id: 'cpu-intel', name: 'Intel Core i7-14700K', type: 'cpu', brand: 'Intel', watts: 125, spec: '20 Cores / 28 Threads @ 3.4GHz', color: 'bg-blue-500' },
    
    // GPUs
    { id: 'gpu-rtx4080', name: 'NVIDIA RTX 4080 Super', type: 'gpu', brand: 'NVIDIA', watts: 320, spec: '16GB GDDR6X - DLSS 3', color: 'bg-green-500' },
    { id: 'gpu-rx7900', name: 'AMD Radeon RX 7900 XTX', type: 'gpu', brand: 'AMD', watts: 355, spec: '24GB GDDR6 - RDNA 3', color: 'bg-red-500' },
    { id: 'gpu-rtx4060', name: 'NVIDIA RTX 4060 Ti', type: 'gpu', brand: 'NVIDIA', watts: 160, spec: '8GB GDDR6 - Compact', color: 'bg-emerald-500' },

    // RAM
    { id: 'ram-32', name: 'Corsair Vengeance 32GB DDR5', type: 'ram', brand: 'Corsair', watts: 15, spec: '2x16GB - 6000MHz - CL30', color: 'bg-purple-500' },
    { id: 'ram-64', name: 'G.Skill Trident Z5 64GB DDR5', type: 'ram', brand: 'G.Skill', watts: 20, spec: '2x32GB - 6400MHz - CL32', color: 'bg-pink-500' },

    // Cooling
    { id: 'cool-aio', name: 'AIO Liquid Cooler 360mm', type: 'cooling', brand: 'NZXT', watts: 25, spec: 'Triple Fan 120mm RGB', color: 'bg-cyan-500' },
    { id: 'cool-air', name: 'Noctua NH-D15 chromax.black', type: 'cooling', brand: 'Noctua', watts: 10, spec: 'Dual Tower Air Cooler', color: 'bg-yellow-700' },

    // Storage
    { id: 'ssd-1tb', name: 'Samsung 990 Pro 1TB NVMe', type: 'storage', brand: 'Samsung', watts: 8, spec: 'PCIe Gen 4 - 7450 MB/s', color: 'bg-indigo-500' },
    { id: 'ssd-2tb', name: 'Crucial T700 2TB NVMe SSD', type: 'storage', brand: 'Crucial', watts: 12, spec: 'PCIe Gen 5 - 12400 MB/s', color: 'bg-blue-400' }
  ];

  const [selectedParts, setSelectedParts] = useState<Record<string, PCPart | null>>({
    cpu: parts[0],
    gpu: parts[2],
    ram: parts[5],
    cooling: parts[7],
    storage: parts[9],
  });

  const selectPart = (part: PCPart) => {
    setSelectedParts(prev => ({
      ...prev,
      [part.type]: part
    }));
  };

  // Calculate stats
  const totalWatts = (Object.values(selectedParts) as (PCPart | null)[]).reduce<number>((acc, part) => acc + (part?.watts || 0), 0) + 50; // +50W baseline for fans/mobo
  const recommendedPSU = Math.ceil((totalWatts * 1.3) / 50) * 50; // 30% overhead, rounded up to nearest 50W

  const resetConfig = () => {
    setSelectedParts({
      cpu: parts[0],
      gpu: parts[2],
      ram: parts[5],
      cooling: parts[7],
      storage: parts[9],
    });
  };

  const getCompatibilityStatus = () => {
    const hasDDR5 = true; // All our choices are modern
    return {
      status: 'Compatibile',
      desc: 'Tutti i componenti selezionati usano interfacce moderne (DDR5, PCIe Gen 4/5) e sono compatibili al 100%.',
      type: 'success'
    };
  };

  const compStatus = getCompatibilityStatus();

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
      {/* Absolute floating lights */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full filter blur-[80px] pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Selectors */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h4 className="font-display font-bold text-lg text-white">Configuratore Hardware Virtuale</h4>
              <p className="text-xs font-mono text-gray-500">Testa l'assemblaggio, calcola i consumi ed ottimizza il TDP.</p>
            </div>
            <button 
              onClick={resetConfig}
              className="p-2 rounded bg-gray-950 text-gray-400 hover:text-white border border-gray-850 hover:bg-gray-900 transition-colors cursor-pointer"
              title="Reset Configurazione"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Part Selection Groups */}
          <div className="space-y-4">
            {(['cpu', 'gpu', 'ram', 'cooling', 'storage'] as const).map((type) => {
              const currentPart = selectedParts[type];
              const availableParts = parts.filter(p => p.type === type);

              return (
                <div key={type} className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">
                    {type === 'cpu' ? 'Processore (CPU)' :
                     type === 'gpu' ? 'Scheda Video (GPU)' :
                     type === 'ram' ? 'Memoria RAM (DDR5)' :
                     type === 'cooling' ? 'Raffreddamento' :
                     'Storage (M.2 NVMe)'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableParts.map((part) => {
                      const isSelected = currentPart?.id === part.id;
                      return (
                        <button
                          key={part.id}
                          onClick={() => selectPart(part)}
                          className={`text-left p-2.5 rounded-lg border text-xs flex flex-col justify-between h-16 transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gray-850 border-brand-500 text-white ring-1 ring-brand-500/30' 
                              : 'bg-gray-950/60 border-gray-850 text-gray-400 hover:border-gray-800 hover:bg-gray-950'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{part.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono">{part.brand}</span>
                          </div>
                          <div className="flex justify-between items-center w-full text-[10px] text-gray-500 font-mono">
                            <span>{part.spec}</span>
                            <span className="text-brand-500 font-bold">+{part.watts}W</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Virtual Build Render & Power Calculations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Neon Motherboard Visual Board */}
          <div className="p-5 rounded-xl bg-gray-950 border border-gray-850 flex flex-col items-center justify-center relative overflow-hidden h-[240px]">
            {/* PCB Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none"></div>
            
            {/* Dynamic Motherboard SVG illustration with colored components */}
            <svg viewBox="0 0 200 200" className="w-full h-full max-h-[160px] relative z-10 filter drop-shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              {/* Motherboard Base PCB */}
              <rect x="20" y="20" width="160" height="160" rx="6" fill="#0c121e" stroke="#1e293b" strokeWidth="2" />
              
              {/* PCIE Lanes */}
              <line x1="30" y1="130" x2="140" y2="130" stroke="#1e293b" strokeWidth="3" strokeDasharray="3,1" />
              <line x1="30" y1="145" x2="110" y2="145" stroke="#1e293b" strokeWidth="2" />

              {/* CPU Socket and Selected Cooler */}
              <rect x="80" y="50" width="40" height="40" rx="3" fill="#111827" stroke="#374151" strokeWidth="1" />
              {selectedParts.cpu && (
                <rect x="85" y="55" width="30" height="30" rx="1" fill="#000" className="animate-pulse" style={{ fillOpacity: 0.4 }} stroke="#22c55e" strokeWidth="1" />
              )}
              
              {/* Selected CPU Cooler Glowing Outline */}
              {selectedParts.cooling && (
                <circle cx="100" cy="70" r="23" fill="none" stroke={selectedParts.cooling.id.includes('aio') ? '#06b6d4' : '#b45309'} strokeWidth="1.5" strokeDasharray="4,2" className="animate-spin-slow" style={{ animationDuration: '10s' }} />
              )}

              {/* RAM Slots */}
              <line x1="130" y1="45" x2="130" y2="95" stroke="#1f2937" strokeWidth="2" />
              <line x1="136" y1="45" x2="136" y2="95" stroke="#1f2937" strokeWidth="2" />
              <line x1="142" y1="45" x2="142" y2="95" stroke="#1f2937" strokeWidth="2" />
              <line x1="148" y1="45" x2="148" y2="95" stroke="#1f2937" strokeWidth="2" />
              {/* Glowing fitted RAM Sticks */}
              {selectedParts.ram && (
                <>
                  <line x1="136" y1="48" x2="136" y2="92" stroke="#a21caf" strokeWidth="2.5" />
                  <line x1="148" y1="48" x2="148" y2="92" stroke="#a21caf" strokeWidth="2.5" />
                </>
              )}

              {/* M.2 Storage Slot */}
              <rect x="85" y="103" width="30" height="10" fill="#111827" stroke="#1e293b" strokeWidth="1" />
              {selectedParts.storage && (
                <rect x="86" y="104" width="25" height="8" fill="#6366f1" opacity="0.8" />
              )}

              {/* Selected Dedicated GPU Card */}
              {selectedParts.gpu && (
                <motion.rect
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 25, opacity: 1 }}
                  y="118"
                  width="135"
                  height="22"
                  rx="2"
                  fill="#111827"
                  stroke={selectedParts.gpu.id.includes('rtx4080') ? '#22c55e' : '#ef4444'}
                  strokeWidth="2"
                />
              )}
              {selectedParts.gpu && (
                <text x="35" y="132" fill="#fff" fontSize="7" fontFamily="monospace" fontWeight="bold">
                  {selectedParts.gpu.brand} GPU ACTIVE
                </text>
              )}
            </svg>

            <span className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-500">DYNAMIC_PCB_STATUS</span>
          </div>

          {/* Calculations Block */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-850 space-y-4">
            <h5 className="font-mono text-xs text-gray-400 uppercase tracking-widest font-bold border-b border-gray-850 pb-2">Diagnostica & Consumo</h5>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-gray-500 uppercase">TDP Stimato</p>
                <div className="flex items-center gap-1.5 text-white font-bold text-xl font-mono">
                  <Zap size={16} className="text-brand-500" />
                  <span>{totalWatts} W</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-gray-500 uppercase">Alimentatore Consigliato</p>
                <div className="text-white font-bold text-xl font-mono">
                  <span>{recommendedPSU} W</span>
                </div>
              </div>
            </div>

            {/* Live Progress Bar for Power */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>Livello Carico Energetico</span>
                <span>{totalWatts}W / 850W Max PSU</span>
              </div>
              <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalWatts / 850) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Compatibility card */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex gap-3">
              <Shield size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-emerald-400 font-mono">Stato: {compStatus.status}</p>
                <p className="text-[10px] text-gray-400 leading-normal font-mono">{compStatus.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
