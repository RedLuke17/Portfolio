import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Sliders, Printer, Layers, Clock, Settings, HelpCircle, Hammer } from 'lucide-react';

interface PrintModel {
  name: string;
  id: string;
  baseWeight: number; // in grams
  baseTime: number; // in minutes at standard settings
  complexity: number; // scale 1-10
  svgPath: string; // representational visual
}

export default function SlicerSimulator() {
  const models: PrintModel[] = [
    {
      name: '3D Calibration Benchy (Barchetta)',
      id: 'benchy',
      baseWeight: 14,
      baseTime: 45,
      complexity: 7,
      // Cute outline of benchy
      svgPath: 'M 30,130 L 170,130 L 150,160 L 50,160 Z M 70,130 L 70,90 L 120,90 L 120,130 M 80,90 L 95,50 L 105,50 L 105,90 M 110,75 L 115,75'
    },
    {
      name: 'Ingranaggio Elicoidale Meccanico',
      id: 'gear',
      baseWeight: 22,
      baseTime: 65,
      complexity: 9,
      // Gear shape
      svgPath: 'M 100,50 A 50,50 0 1,1 99.9,50 Z M 100,75 A 25,25 0 1,0 100.1,75 Z'
    },
    {
      name: 'Octopus Articolato Flessibile',
      id: 'octopus',
      baseWeight: 18,
      baseTime: 55,
      complexity: 8,
      // Octopus cute curves
      svgPath: 'M 100,70 Q 70,50 100,30 Q 130,50 100,70 M 70,95 Q 40,80 60,70 M 130,95 Q 160,80 140,70 M 100,70 L 100,105'
    },
    {
      name: 'Cubo di Calibrazione XYZ (20mm)',
      id: 'cube',
      baseWeight: 6,
      baseTime: 18,
      complexity: 2,
      // Standard isometric cube
      svgPath: 'M 100,40 L 150,65 L 150,125 L 100,150 L 50,125 L 50,65 Z M 100,40 L 100,150 M 50,65 L 100,90 L 150,65'
    }
  ];

  // Simulator config states
  const [selectedModel, setSelectedModel] = useState<string>('benchy');
  const [layerHeight, setLayerHeight] = useState<number>(0.2); // 0.12, 0.20, 0.28
  const [infill, setInfill] = useState<number>(20); // 10%, 20%, 50%, 80%
  const [speed, setSpeed] = useState<number>(150); // 50, 150, 300 mm/s
  const [material, setMaterial] = useState<string>('PLA'); // PLA, PETG, TPU
  
  // Simulation player states
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [isSliced, setIsSliced] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [sliceProgress, setSliceProgress] = useState<number>(0);
  const [printProgress, setPrintProgress] = useState<number>(0);

  // Stats calculation
  const model = models.find(m => m.id === selectedModel) || models[0];
  
  // Weight multiplier based on infill (10% infill is baseline 0.8, 80% is 1.6)
  const weightMultiplier = 0.7 + (infill / 100) * 1.1;
  const estimatedWeight = Math.round(model.baseWeight * weightMultiplier * 10) / 10;
  
  // Time factors: 
  // - Layer height: smaller layers mean more layers, so slower (0.12 layer = 1.6x time, 0.28 layer = 0.7x time)
  // - Speed: 50mm/s = 2x time, 150mm/s = 1x time, 300mm/s = 0.55x time
  // - Infill: more infill = more toolpaths (10% = 0.85x time, 80% = 1.6x time)
  const layerHeightFactor = layerHeight === 0.12 ? 1.5 : layerHeight === 0.28 ? 0.75 : 1.0;
  const speedFactor = speed === 50 ? 2.2 : speed === 300 ? 0.55 : 1.0;
  const infillFactor = 0.8 + (infill / 100) * 0.9;
  
  const estimatedTime = Math.round(model.baseTime * layerHeightFactor * speedFactor * infillFactor);
  
  // Materials stats
  const materialCostPerKg = material === 'PLA' ? 20 : material === 'PETG' ? 24 : 32; // TPU is more expensive
  const estimatedCost = Math.round(((estimatedWeight / 1000) * materialCostPerKg) * 100) / 100;
  const estimatedLayers = Math.round((model.complexity * 12) / layerHeight);

  // Slicing animation loop
  const sliceTimer = useRef<NodeJS.Timeout | null>(null);
  const runSlice = () => {
    setIsSlicing(true);
    setSliceProgress(0);
    setIsSliced(false);
    setIsPrinting(false);
    setPrintProgress(0);

    if (sliceTimer.current) clearInterval(sliceTimer.current);

    sliceTimer.current = setInterval(() => {
      setSliceProgress(prev => {
        if (prev >= 100) {
          if (sliceTimer.current) clearInterval(sliceTimer.current);
          setIsSlicing(false);
          setIsSliced(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Printing animation loop
  const printTimer = useRef<NodeJS.Timeout | null>(null);
  const togglePrint = () => {
    if (isPrinting) {
      setIsPrinting(false);
      if (printTimer.current) clearInterval(printTimer.current);
    } else {
      if (!isSliced) {
        // Auto slice first
        runSlice();
        return;
      }
      setIsPrinting(true);
      if (printTimer.current) clearInterval(printTimer.current);
      
      // Speed multiplier for simulation
      const simulationStep = Math.max(1, Math.round(speed / 50));
      printTimer.current = setInterval(() => {
        setPrintProgress(prev => {
          if (prev >= 100) {
            if (printTimer.current) clearInterval(printTimer.current);
            setIsPrinting(false);
            return 100;
          }
          return prev + simulationStep;
        });
      }, 100);
    }
  };

  const resetSimulation = () => {
    setIsPrinting(false);
    setIsSliced(false);
    setPrintProgress(0);
    setSliceProgress(0);
    if (sliceTimer.current) clearInterval(sliceTimer.current);
    if (printTimer.current) clearInterval(printTimer.current);
  };

  useEffect(() => {
    return () => {
      if (sliceTimer.current) clearInterval(sliceTimer.current);
      if (printTimer.current) clearInterval(printTimer.current);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-[80px] pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Slicing controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="border-b border-gray-800 pb-3">
            <h4 className="font-display font-bold text-lg text-white">Slicer & Prototipazione 3D</h4>
            <p className="text-xs font-mono text-gray-500">Configura la stampa FDM e osserva i parametri in tempo reale.</p>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Modello 3D STL</label>
            <div className="grid grid-cols-2 gap-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m.id);
                    resetSimulation();
                  }}
                  className={`p-2 rounded-lg text-xs text-left border transition-all ${
                    selectedModel === m.id
                      ? 'bg-gray-850 border-brand-500 text-white'
                      : 'bg-gray-950/50 border-gray-850 text-gray-400 hover:border-gray-800 hover:bg-gray-950'
                  }`}
                >
                  <div className="font-semibold">{m.name.split(' (')[0]}</div>
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5">Complessità: {m.complexity}/10</div>
                </button>
              ))}
            </div>
          </div>

          {/* Slicer Settings parameters */}
          <div className="space-y-4 pt-1 font-mono text-xs">
            {/* Layer height & Material row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 uppercase font-bold">Altezza Strato (Risoluzione)</label>
                <div className="flex gap-1.5">
                  {[0.12, 0.20, 0.28].map((h) => (
                    <button
                      key={h}
                      onClick={() => { setLayerHeight(h); resetSimulation(); }}
                      className={`flex-1 py-1 px-1.5 rounded text-[10px] text-center border font-bold cursor-pointer ${
                        layerHeight === h 
                          ? 'bg-brand-900/40 text-brand-400 border-brand-500/40' 
                          : 'bg-gray-950 text-gray-500 border-gray-850 hover:text-gray-300'
                      }`}
                    >
                      {h === 0.12 ? '0.12 Fine' : h === 0.2 ? '0.20 Std' : '0.28 Draft'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 uppercase font-bold">Filamento (Materiale)</label>
                <div className="flex gap-1.5">
                  {['PLA', 'PETG', 'TPU'].map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMaterial(m); resetSimulation(); }}
                      className={`flex-1 py-1 px-1.5 rounded text-[10px] text-center border font-bold cursor-pointer ${
                        material === m 
                          ? 'bg-brand-900/40 text-brand-400 border-brand-500/40' 
                          : 'bg-gray-950 text-gray-500 border-gray-850 hover:text-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Infill slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                <span>Densità di Riempimento (Infill)</span>
                <span className="text-white">{infill}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="10"
                value={infill}
                onChange={e => { setInfill(Number(e.target.value)); resetSimulation(); }}
                className="w-full accent-brand-500 h-1 bg-gray-950 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Speed selection */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 uppercase font-bold block">Velocità di Stampa</label>
              <div className="flex gap-2">
                {[50, 150, 300].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); resetSimulation(); }}
                    className={`flex-1 py-1.5 px-2 rounded text-[10px] border flex flex-col items-center gap-0.5 cursor-pointer ${
                      speed === s 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 font-bold' 
                        : 'bg-gray-950 text-gray-500 border-gray-850 hover:text-gray-300'
                    }`}
                  >
                    <span>{s} mm/s</span>
                    <span className="text-[8px] text-gray-600 font-normal">
                      {s === 50 ? 'Precisione' : s === 150 ? 'Standard' : 'Ultra Velocità'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slicing and Printing Primary CTA Actions */}
          <div className="flex gap-2 pt-2">
            {!isSliced ? (
              <button
                onClick={runSlice}
                disabled={isSlicing}
                className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-gray-800 disabled:text-gray-500 text-gray-950 font-semibold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 cursor-pointer"
              >
                {isSlicing ? (
                  <>
                    <RotateCcw className="animate-spin" size={14} />
                    <span>ELABORAZIONE G-CODE... {sliceProgress}%</span>
                  </>
                ) : (
                  <>
                    <Layers size={14} />
                    <span>GENERA G-CODE (SLICING)</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={togglePrint}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer ${
                    isPrinting 
                      ? 'bg-amber-500 hover:bg-amber-600 text-gray-950' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-gray-950 shadow-lg shadow-emerald-500/10'
                  }`}
                >
                  {isPrinting ? (
                    <>
                      <Pause size={14} />
                      <span>PAUSA STAMPA</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>{printProgress > 0 ? 'RIPRENDI STAMPA' : 'AVVIA STAMPA VIRTUALE'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-3 py-2.5 rounded-lg bg-gray-950 hover:bg-gray-850 border border-gray-850 text-gray-400 hover:text-white cursor-pointer"
                  title="Azzera Stampa"
                >
                  <RotateCcw size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right column: Graphic virtual view & Gcode telemetry */}
        <div className="lg:col-span-6 space-y-4">
          {/* Printing Bed Render */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-850 h-[240px] flex flex-col justify-between relative overflow-hidden">
            {/* Printer Grid plate */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

            {/* Simulated 3D bed layer representation */}
            <div className="relative w-full h-[180px] flex items-center justify-center">
              {/* Build Bed SVG */}
              <svg viewBox="0 0 200 150" className="w-full h-full">
                {/* Printing platform bed skew isometric perspective */}
                <polygon points="10,130 190,130 170,10 30,10" fill="none" stroke="#1e293b" strokeWidth="1" />
                <polygon points="10,130 190,130 170,10 30,10" fill="rgba(30,41,59,0.1)" />

                {/* Slicing laser line when slicing */}
                {isSlicing && (
                  <motion.line
                    initial={{ y1: 10, y2: 10 }}
                    animate={{ y1: 130, y2: 130 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    x1="20"
                    x2="180"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 0 4px #22c55e)' }}
                  />
                )}

                {/* Wireframe representation of selected model */}
                {(isSliced || isSlicing) && (
                  <g className="translate-y-5">
                    {/* Rendered static wireframe path for shadow structure */}
                    <path
                      d={model.svgPath}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2.5"
                      opacity="0.5"
                    />

                    {/* Live printable path based on progress */}
                    <motion.path
                      d={model.svgPath}
                      fill="none"
                      stroke={material === 'PLA' ? '#10b981' : material === 'PETG' ? '#06b6d4' : '#f43f5e'}
                      strokeWidth="2"
                      strokeDasharray="400"
                      strokeDashoffset={400 - (400 * (isSliced ? (printProgress / 100) : (sliceProgress / 100)))}
                      style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
                    />
                  </g>
                )}

                {/* Simulated Nozzle printhead movement */}
                {isPrinting && printProgress < 100 && (
                  <motion.g
                    animate={{
                      x: [20, -15, 30, -35, 10, -5, 20],
                      y: [0, 5, -10, 8, -5, 10, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="translate-x-[100px] translate-y-[60px]"
                  >
                    {/* Brass nozzle cone */}
                    <polygon points="0,0 -4,-10 4,-10" fill="#d97706" />
                    <rect x="-8" y="-18" width="16" height="8" fill="#4b5563" />
                    {/* Heat block element */}
                    <rect x="-10" y="-14" width="20" height="4" fill="#9ca3af" />
                    {/* Glowing point */}
                    <circle cx="0" cy="0" r="1.5" fill="#f59e0b" className="animate-ping" />
                  </motion.g>
                )}
              </svg>
            </div>

            {/* Telemetry info row */}
            <div className="flex items-center justify-between font-mono text-[10px] text-gray-500 pt-1 border-t border-gray-900">
              <div className="flex items-center gap-1.5">
                <Printer size={10} className={isPrinting ? 'text-emerald-500 animate-pulse' : ''} />
                <span>BED: 60°C | EXTRUDER: 215°C</span>
              </div>
              <div>STAMPANTE FDM ACTIVE</div>
            </div>
          </div>

          {/* Slicing statistics layout */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-850 grid grid-cols-3 gap-3 font-mono text-center">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 uppercase font-bold block">Tempo Estimato</span>
              <div className="text-white font-bold text-xs flex items-center justify-center gap-1">
                <Clock size={11} className="text-brand-500" />
                <span>
                  {estimatedTime >= 60 
                    ? `${Math.floor(estimatedTime / 60)}h ${estimatedTime % 60}m` 
                    : `${estimatedTime}m`}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 uppercase font-bold block">Peso e Costo</span>
              <div className="text-white font-bold text-xs">
                <span>{estimatedWeight}g ({estimatedCost.toFixed(2)}€)</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 uppercase font-bold block">Totale Layer</span>
              <div className="text-white font-bold text-xs flex items-center justify-center gap-1">
                <Layers size={11} className="text-blue-500" />
                <span>{estimatedLayers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
