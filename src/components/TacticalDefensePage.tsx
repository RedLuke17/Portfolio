import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, Shield, Zap, Flame, Snowflake, Coins, Heart, Trophy, 
  Play, Pause, RotateCcw, Volume2, VolumeX, Crosshair, Terminal,
  AlertTriangle, ChevronRight, Info, Lock, Unlock, Construction,
  Target, Radio, Eye, ArrowLeft, RefreshCw, Star, ZapOff, Check
} from 'lucide-react';

// ============================================================================
// GAME TYPES & INTERFACES
// ============================================================================

interface GridCell {
  x: number;
  y: number;
  type: 'floor' | 'path' | 'wall' | 'bunker' | 'spawn';
  hasOil?: boolean;
  hasNapalm?: number; // ticks remaining for burning napalm puddle
}

interface Zombie {
  id: string;
  type: 'orda' | 'sprinter' | 'hulk';
  name: string;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  x: number; // grid float position
  y: number;
  pathIndex: number;
  slowDuration: number; // Cryo slow ticks
  oilDuration: number; // Oil slow ticks
  burnDuration: number; // Fire burn ticks
  angle: number;
}

interface Tower {
  id: string;
  x: number;
  y: number;
  type: 'gun' | 'missile' | 'flame' | 'cryo' | 'oil' | 'shock';
  name: string;
  level: number;
  damage: number;
  range: number;
  cooldown: number; // current ticks left
  maxCooldown: number; // speed
  cost: number;
  angle: number; // rotating cannon angle towards target
  synergyActive?: boolean;
}

interface Obstacle {
  id: string;
  x: number;
  y: number;
  type: 'barricade' | 'wire';
  hp: number; // Barricades can have HP or be indestructible
}

interface Level {
  id: number;
  name: string;
  codename: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  gridCols: number;
  gridRows: number;
  startCell: [number, number];
  endCell: [number, number];
  initialCredits: number;
  initialMaterials: number;
  waveCount: number;
}

// ============================================================================
// LEVELS SPECIFICATION
// ============================================================================
const LEVELS: Level[] = [
  {
    id: 1,
    name: "Zona Sicura 4",
    codename: "SECURE_ZONE_ALPHA",
    description: "Un sentiero urbano protetto da fortificazioni. Perfetto per testare le prime installazioni tattiche di artiglieria.",
    difficulty: "EASY",
    gridCols: 12,
    gridRows: 8,
    startCell: [0, 2],
    endCell: [11, 5],
    initialCredits: 400,
    initialMaterials: 50,
    waveCount: 5,
  },
  {
    id: 2,
    name: "Il Canale di Scolo",
    codename: "DRAINAGE_BIVIO",
    description: "La strada si divide in due canali prima di congiungersi. Usa le barricate per sbarrare il passaggio superiore veloce e forzarli sul cammino lungo.",
    difficulty: "MEDIUM",
    gridCols: 14,
    gridRows: 10,
    startCell: [0, 4],
    endCell: [13, 4],
    initialCredits: 500,
    initialMaterials: 80,
    waveCount: 8,
  },
  {
    id: 3,
    name: "L'Ultimo Bastione",
    codename: "LAST_STAND_VALLEY",
    description: "Una pianura desertica completamente sgombra. Non c'è alcun sentiero predefinito: spetta a te costruire il labirinto di mura e mitragliatrici.",
    difficulty: "HARD",
    gridCols: 16,
    gridRows: 12,
    startCell: [0, 2],
    endCell: [15, 9],
    initialCredits: 650,
    initialMaterials: 120,
    waveCount: 10,
  }
];

// ============================================================================
// TOWERS CONSTANTS
// ============================================================================
const TOWER_PRESETS = {
  gun: {
    name: "Nido Mitragliatrice",
    cost: 100,
    damage: 15,
    range: 2.5,
    maxCooldown: 4, // ticks (fast fire)
    desc: "Postazione automatica standard. Alta frequenza di fuoco, raggio medio.",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-500/40"
  },
  missile: {
    name: "Lanciamissili",
    cost: 180,
    damage: 65,
    range: 4.5,
    maxCooldown: 15, // ticks (slow fire)
    desc: "Artiglieria esplosiva pesante. Danno devastante a lungo raggio in area.",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-500/40"
  },
  flame: {
    name: "Lanciafiamme",
    cost: 130,
    damage: 10,
    range: 1.8,
    maxCooldown: 2, // super fast tick
    desc: "Emette una scia di fiamme ad area. Brucia i bersagli nel tempo.",
    color: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-500/40"
  },
  cryo: {
    name: "Torretta Cryo",
    cost: 120,
    damage: 4,
    range: 2.2,
    maxCooldown: 6,
    desc: "Emette onde congelanti. Rallenta gli zombie colpiti del 60%.",
    color: "text-cyan-400",
    bg: "bg-cyan-950/40",
    border: "border-cyan-500/40"
  },
  oil: {
    name: "Torretta Olio",
    cost: 90,
    damage: 2,
    range: 2.0,
    maxCooldown: 8,
    desc: "Macchia la strada d'olio. Sinergia Lanciafiamme: crea l'Effetto Napalm!",
    color: "text-yellow-500",
    bg: "bg-yellow-950/40",
    border: "border-yellow-500/40"
  },
  shock: {
    name: "Torretta Shock",
    cost: 150,
    damage: 24,
    range: 2.4,
    maxCooldown: 8,
    desc: "Dardi elettrici concatenati. Sinergia Cryo: infligge 2x danni se rallentati.",
    color: "text-violet-400",
    bg: "bg-violet-950/40",
    border: "border-violet-500/40"
  }
};

const OBSTACLE_COSTS = {
  barricade: {
    name: "Barricata Sacchi",
    cost: 30,
    desc: "Muro protettivo impenetrabile. Blocca interamente la strada e costringe gli zombie a deviare.",
    color: "text-slate-400",
    bg: "bg-slate-900",
    border: "border-slate-500/50"
  },
  wire: {
    name: "Filo Spinato",
    cost: 15,
    desc: "Steso a terra. Rallenta gli zombie del 75% quando ci camminano sopra.",
    color: "text-red-400",
    bg: "bg-red-950/20",
    border: "border-red-500/30"
  }
};

// ============================================================================
// PATHFINDER HELPER (BFS ALGORITHM)
// ============================================================================
function computePath(
  gridCols: number,
  gridRows: number,
  start: [number, number],
  end: [number, number],
  blockedCells: Set<string> // "x,y" Format
): [number, number][] | null {
  const queue: [number, number][] = [start];
  const parentMap = new Map<string, string>();
  const visited = new Set<string>();
  visited.add(`${start[0]},${start[1]}`);

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  let found = false;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr[0] === end[0] && curr[1] === end[1]) {
      found = true;
      break;
    }

    for (const [dx, dy] of dirs) {
      const nx = curr[0] + dx;
      const ny = curr[1] + dy;
      const key = `${nx},${ny}`;

      if (
        nx >= 0 && nx < gridCols &&
        ny >= 0 && ny < gridRows &&
        !blockedCells.has(key) &&
        !visited.has(key)
      ) {
        visited.add(key);
        parentMap.set(key, `${curr[0]},${curr[1]}`);
        queue.push([nx, ny]);
      }
    }
  }

  if (!found) return null;

  const path: [number, number][] = [];
  let currKey = `${end[0]},${end[1]}`;
  const startKey = `${start[0]},${start[1]}`;

  while (currKey !== startKey) {
    const [cx, cy] = currKey.split(',').map(Number);
    path.push([cx, cy]);
    const nextKey = parentMap.get(currKey);
    if (!nextKey) break;
    currKey = nextKey;
  }
  path.push(start);
  return path.reverse();
}

export default function TacticalDefensePage({ onBack }: { onBack: () => void }) {
  // Game Setup States
  const [gameState, setGameState] = useState<'lobby' | 'briefing' | 'active' | 'victory' | 'defeat'>('lobby');
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVELS[0]);
  const [muted, setMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Core Game Stats
  const [bunkerHp, setBunkerHp] = useState(20);
  const [credits, setCredits] = useState(400);
  const [materials, setMaterials] = useState(50);
  const [score, setScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(1);
  const [waveRunning, setWaveRunning] = useState(false);
  const [waveSpawnComplete, setWaveSpawnComplete] = useState(false);
  const [waveZombies, setWaveZombies] = useState<Zombie[]>([]);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [gameSpeed, setGameSpeed] = useState<1 | 2 | 3>(1);

  // Grid / Path States
  const [blockedCells, setBlockedCells] = useState<Set<string>>(new Set());
  const [barricades, setBarricades] = useState<Obstacle[]>([]);
  const [wires, setWires] = useState<Obstacle[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Zombie[]>([]);
  const [calculatedPath, setCalculatedPath] = useState<[number, number][]>([]);

  // Selection / Build Tools
  const [selectedBuildType, setSelectedBuildType] = useState<'gun' | 'missile' | 'flame' | 'cryo' | 'oil' | 'shock'>('gun');
  const [selectedTool, setSelectedTool] = useState<'tower' | 'barricade' | 'wire'>('tower');
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

  // Terminal Logs
  const [logs, setLogs] = useState<string[]>([
    "SYS_INIT: Terminale tattico militare pronto.",
    "ATTESA: Seleziona settore operativo per iniziare il briefing."
  ]);

  // Audio Synth Helper
  const playSound = (freq: number, type: OscillatorType, duration: number, vol: number = 0.05) => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const playSiren = () => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  };

  const pushLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Pre-load layout path for Level 1 and 2
  const resetLevelData = (lvl: Level) => {
    const newBlocked = new Set<string>();
    
    // Preset static walls/obstacles based on level
    if (lvl.id === 1) {
      // Create S-path pre-blocked side walls to guide the tutorial feel
      for (let x = 0; x < lvl.gridCols; x++) {
        for (let y = 0; y < lvl.gridRows; y++) {
          // Define a simple S-like boundary
          if (y === 1 && x < 9) newBlocked.add(`${x},${y}`);
          if (y === 6 && x > 2) newBlocked.add(`${x},${y}`);
          if (y === 3 && x > 3 && x < 10) newBlocked.add(`${x},${y}`);
        }
      }
    } else if (lvl.id === 2) {
      // Split path setup. Add walls in the center to enforce top/bottom branch split
      for (let x = 3; x <= 10; x++) {
        newBlocked.add(`${x},4`);
        newBlocked.add(`${x},5`);
      }
    }

    setBlockedCells(newBlocked);
    setTowers([]);
    setBarricades([]);
    setWires([]);
    setEnemies([]);
    setBunkerHp(20);
    setCredits(lvl.initialCredits);
    setMaterials(lvl.initialMaterials);
    setCurrentWave(1);
    setScore(0);
    setIsPaused(false);
    setWaveRunning(false);
    setWaveSpawnComplete(false);
    setWaveZombies([]);
    setSpawnedCount(0);
    setGameSpeed(1);

    // Compute initial path
    const path = computePath(lvl.gridCols, lvl.gridRows, lvl.startCell, lvl.endCell, newBlocked);
    if (path) {
      setCalculatedPath(path);
    }
  };

  const startBriefing = (lvl: Level) => {
    setSelectedLevel(lvl);
    resetLevelData(lvl);
    setGameState('briefing');
    playSound(440, 'sine', 0.2, 0.08);
  };

  const startOperation = () => {
    setGameState('active');
    pushLog(`SETTORE ATTIVATO: ${selectedLevel.name}. Ingressi tracciati.`);
    playSound(587.33, 'triangle', 0.3, 0.08);
  };

  // Handle building placement
  const handleCellClick = (x: number, y: number) => {
    // Cannot build on start or bunker end cells
    if ((x === selectedLevel.startCell[0] && y === selectedLevel.startCell[1]) ||
        (x === selectedLevel.endCell[0] && y === selectedLevel.endCell[1])) {
      pushLog("ERRORE: Impossibile installare equipaggiamenti su nodi sensibili.");
      playSound(150, 'sawtooth', 0.25);
      return;
    }

    const key = `${x},${y}`;
    
    // Check if anything is already built here
    const hasTower = towers.find(t => t.x === x && t.y === y);
    const hasBarricade = barricades.find(b => b.x === x && b.y === y);
    const hasWire = wires.find(w => w.x === x && w.y === y);

    if (selectedTool === 'tower') {
      if (hasBarricade || hasWire) {
        pushLog("ERRORE: Terreno ostruito da barricate/filo spinato.");
        playSound(150, 'sawtooth', 0.25);
        return;
      }

      if (hasTower) {
        // Upgrade tower!
        const preset = TOWER_PRESETS[hasTower.type];
        const cost = Math.round(preset.cost * 0.8);
        if (credits >= cost) {
          if (hasTower.level >= 3) {
            pushLog("MAX: Torretta già al livello massimo di efficienza.");
            playSound(180, 'sine', 0.2);
            return;
          }
          setCredits(prev => prev - cost);
          setTowers(prev => prev.map(t => t.id === hasTower.id ? {
            ...t,
            level: t.level + 1,
            damage: Math.round(t.damage * 1.5),
            range: t.range + 0.4
          } : t));
          pushLog(`UPGRADE: ${hasTower.name} migliorata a Liv. ${hasTower.level + 1}`);
          playSound(523.25, 'triangle', 0.2, 0.06);
        } else {
          pushLog("FONDI INSUFFICIENTI: Servono crediti aggiuntivi.");
          playSound(150, 'sawtooth', 0.25);
        }
        return;
      }

      // Build new tower
      const preset = TOWER_PRESETS[selectedBuildType];
      if (credits >= preset.cost) {
        // Add to blocked cells if not already (towers act as blockages)
        const nextBlocked = new Set<string>(blockedCells);
        nextBlocked.add(key);

        // Verify if placing this blocks the path completely!
        const testPath = computePath(selectedLevel.gridCols, selectedLevel.gridRows, selectedLevel.startCell, selectedLevel.endCell, nextBlocked);
        if (!testPath) {
          pushLog("BLOCCATO: Impossibile ostacolare del tutto il passaggio degli zombie.");
          playSound(150, 'sawtooth', 0.3);
          return;
        }

        setCredits(prev => prev - preset.cost);
        setBlockedCells(nextBlocked);
        setCalculatedPath(testPath);

        const newTower: Tower = {
          id: Math.random().toString(),
          x,
          y,
          type: selectedBuildType,
          name: preset.name,
          level: 1,
          damage: preset.damage,
          range: preset.range,
          cooldown: 0,
          maxCooldown: preset.maxCooldown,
          cost: preset.cost,
          angle: 0
        };

        setTowers(prev => [...prev, newTower]);
        pushLog(`INSTALLAZIONE: ${preset.name} posizionata su coordinate [${x}, ${y}].`);
        playSound(440, 'triangle', 0.15, 0.06);
      } else {
        pushLog("FALSA_CONFIGURAZIONE: Crediti insufficienti per questa torretta.");
        playSound(150, 'sawtooth', 0.25);
      }
    } 
    
    else if (selectedTool === 'barricade') {
      if (hasTower || hasWire) {
        pushLog("ERRORE: Posizione già occupata da altri sistemi.");
        playSound(150, 'sawtooth', 0.25);
        return;
      }

      if (hasBarricade) {
        // Demolish and refund partial materials
        const refund = Math.round(OBSTACLE_COSTS.barricade.cost * 0.5);
        setMaterials(prev => prev + refund);
        setBarricades(prev => prev.filter(b => b.id !== hasBarricade.id));
        const nextBlocked = new Set<string>(blockedCells);
        nextBlocked.delete(key);
        setBlockedCells(nextBlocked);
        
        const path = computePath(selectedLevel.gridCols, selectedLevel.gridRows, selectedLevel.startCell, selectedLevel.endCell, nextBlocked);
        if (path) setCalculatedPath(path);

        pushLog(`SMANTELLAMENTO: Rimossa barricata. Recuperati ${refund} materiali.`);
        playSound(220, 'sine', 0.2);
        return;
      }

      const cost = OBSTACLE_COSTS.barricade.cost;
      if (materials >= cost) {
        const nextBlocked = new Set<string>(blockedCells);
        nextBlocked.add(key);

        const testPath = computePath(selectedLevel.gridCols, selectedLevel.gridRows, selectedLevel.startCell, selectedLevel.endCell, nextBlocked);
        if (!testPath) {
          pushLog("BLOCCATO: Impossibile chiudere del tutto la strada verso la base.");
          playSound(150, 'sawtooth', 0.3);
          return;
        }

        setMaterials(prev => prev - cost);
        setBlockedCells(nextBlocked);
        setCalculatedPath(testPath);
        
        const newObstacle: Obstacle = {
          id: Math.random().toString(),
          x,
          y,
          type: 'barricade',
          hp: 100
        };
        setBarricades(prev => [...prev, newObstacle]);
        pushLog(`FORTIFICAZIONE: Barricata di sabbia completata a [${x}, ${y}].`);
        playSound(293.66, 'sine', 0.25, 0.08);
      } else {
        pushLog("MATERIALE INSUFFICIENTE: Attendi la ricarica dei materiali.");
        playSound(150, 'sawtooth', 0.25);
      }
    } 
    
    else if (selectedTool === 'wire') {
      if (hasTower || hasBarricade) {
        pushLog("ERRORE: Nodo occupato da installazioni rigide.");
        playSound(150, 'sawtooth', 0.25);
        return;
      }

      if (hasWire) {
        setWires(prev => prev.filter(w => w.id !== hasWire.id));
        pushLog("RIMOZIONE: Filo spinato ripulito.");
        playSound(220, 'sine', 0.15);
        return;
      }

      const cost = OBSTACLE_COSTS.wire.cost;
      if (materials >= cost) {
        setMaterials(prev => prev - cost);
        const newWire: Obstacle = {
          id: Math.random().toString(),
          x,
          y,
          type: 'wire',
          hp: 50
        };
        setWires(prev => [...prev, newWire]);
        pushLog(`RALLENTAMENTO: Filo spinato posato a [${x}, ${y}].`);
        playSound(330, 'triangle', 0.18, 0.05);
      } else {
        pushLog("MATERIALE INSUFFICIENTE: Risorsa tattica scarica.");
        playSound(150, 'sawtooth', 0.25);
      }
    }
  };

  // Materials auto-recharge tick + ground napalm fading
  useEffect(() => {
    if (gameState !== 'active' || isPaused) return;

    const timer = setInterval(() => {
      // Accumulate materials slowly
      setMaterials(prev => Math.min(prev + 1, 100));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isPaused]);

  // Spawning system effect
  useEffect(() => {
    if (gameState !== 'active' || isPaused || !waveRunning || waveSpawnComplete) return;
    if (waveZombies.length === 0) return;

    const intervalTime = (1200 - Math.min(currentWave * 50, 600)) / gameSpeed;

    const timer = setInterval(() => {
      if (spawnedCount < waveZombies.length) {
        const nextZombie = waveZombies[spawnedCount];
        if (nextZombie) {
          setEnemies(prev => [...prev.filter(Boolean), nextZombie]);
        }
        setSpawnedCount(prev => prev + 1);
      } else {
        setWaveSpawnComplete(true);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [gameState, isPaused, waveRunning, waveSpawnComplete, waveZombies, spawnedCount, gameSpeed, currentWave]);

  // Wave spawn trigger
  const launchWave = () => {
    if (waveRunning) return;
    setWaveRunning(true);
    setWaveSpawnComplete(false);
    setSpawnedCount(0);
    playSiren();
    pushLog(`ALLARME: Rilevata Ondata ${currentWave}!`);

    // Define zombie wave counts & attributes
    const numZombies = 5 + currentWave * 3;
    const generatedZombies: Zombie[] = [];

    for (let i = 0; i < numZombies; i++) {
      // Alternate type based on wave difficulty
      let type: 'orda' | 'sprinter' | 'hulk' = 'orda';
      let name = "Zombie Orda";
      let hp = 30 + currentWave * 15;
      let speed = 0.08;
      let reward = 15;

      if (i % 3 === 1 && currentWave >= 2) {
        type = 'sprinter';
        name = "Zombie Sprinter";
        hp = 20 + currentWave * 8;
        speed = 0.16;
        reward = 20;
      } else if (i % 5 === 0 && currentWave >= 3) {
        type = 'hulk';
        name = "Zombie Hulk";
        hp = 110 + currentWave * 45;
        speed = 0.04;
        reward = 40;
      }

      generatedZombies.push({
        id: `zombie-${i}-${Math.random()}`,
        type,
        name,
        hp,
        maxHp: hp,
        speed,
        reward,
        x: selectedLevel.startCell[0],
        y: selectedLevel.startCell[1],
        pathIndex: 0,
        slowDuration: 0,
        oilDuration: 0,
        burnDuration: 0,
        angle: 0
      });
    }

    setWaveZombies(generatedZombies);
  };

  // Main game logic ticks (smooth 60fps-like motion using delta physics ticks)
  useEffect(() => {
    if (gameState !== 'active' || isPaused) return;

    const gameTick = setInterval(() => {
      // 1. Move active enemies along current calculated path
      setEnemies(prevEnemies => {
        if (prevEnemies.length === 0 && waveRunning) {
          // Verify if wave finished
          // Staggered spawning could still be running, so check timer or queue
        }

        const nextEnemies: Zombie[] = [];

        prevEnemies.forEach(zombie => {
          if (!zombie) return;
          let currentSpeed = zombie.speed;

          // Wire check (standing on barbed wire)
          const onWire = wires.some(w => Math.round(zombie.x) === w.x && Math.round(zombie.y) === w.y);
          if (onWire) currentSpeed *= 0.25;

          // Cryo & Oil debuffs
          if (zombie.slowDuration > 0) {
            currentSpeed *= 0.40;
          }
          if (zombie.oilDuration > 0) {
            currentSpeed *= 0.65;
          }

          // Move along calculatedPath
          const nextIndex = zombie.pathIndex + 1;
          if (nextIndex >= calculatedPath.length) {
            // Reached base bunker!
            setBunkerHp(hp => {
              const nextHp = hp - (zombie.type === 'hulk' ? 4 : 1);
              if (nextHp <= 0) {
                setGameState('defeat');
                playSound(80, 'sawtooth', 0.8, 0.15);
              } else {
                playSound(130, 'sawtooth', 0.3, 0.1);
              }
              return Math.max(nextHp, 0);
            });
            return; // Despawn
          }

          const targetNode = calculatedPath[nextIndex];
          const dx = targetNode[0] - zombie.x;
          const dy = targetNode[1] - zombie.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let nextX = zombie.x;
          let nextY = zombie.y;
          let newPathIndex = zombie.pathIndex;

          if (dist <= currentSpeed) {
            // Snap to next node
            nextX = targetNode[0];
            nextY = targetNode[1];
            newPathIndex = nextIndex;
          } else {
            nextX += (dx / dist) * currentSpeed;
            nextY += (dy / dist) * currentSpeed;
          }

          // Damage from burns (Fire DoT)
          let currentHp = zombie.hp;
          let burnTicks = zombie.burnDuration;
          if (burnTicks > 0) {
            currentHp -= 1.5; // Burn ticking damage
            burnTicks--;
          }

          if (currentHp <= 0) {
            // Defeated!
            setCredits(c => c + zombie.reward);
            setScore(s => s + zombie.reward * 10);
            playSound(400, 'sine', 0.05, 0.03);
            return; // Dead
          }

          // Angle computation
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          nextEnemies.push({
            ...zombie,
            x: nextX,
            y: nextY,
            pathIndex: newPathIndex,
            slowDuration: Math.max(zombie.slowDuration - 1, 0),
            oilDuration: Math.max(zombie.oilDuration - 1, 0),
            burnDuration: burnTicks,
            hp: currentHp,
            angle
          });
        });

        // If wave was active and all spawns died, wave cleared!
        if (nextEnemies.length === 0 && waveRunning && waveSpawnComplete) {
          setWaveRunning(false);
          setWaveSpawnComplete(false);
          setCredits(c => c + 100 + currentWave * 15);
          playSound(523.25, 'triangle', 0.4, 0.08);
          pushLog(`SETTORE SICURO: Ondata ${currentWave} neutralizzata!`);
          
          if (currentWave >= selectedLevel.waveCount) {
            setGameState('victory');
            pushLog(`VITTORIA ASSOLUTA! Area messa in sicurezza.`);
          } else {
            setCurrentWave(w => w + 1);
          }
        }

        return nextEnemies;
      });

      // 2. Towers Attack Mechanics & Synergy Detections
      setTowers(prevTowers => {
        return prevTowers.map(tower => {
          let currentCooldown = tower.cooldown;
          let isSynergizing = false;

          // Synergy combinations (adjacencies)
          // Look for adjacent towers within distance of 1.5 cells
          const neighbors = towers.filter(other => {
            if (other.id === tower.id) return false;
            const dist = Math.sqrt(Math.pow(other.x - tower.x, 2) + Math.pow(other.y - tower.y, 2));
            return dist <= 1.5;
          });

          if (currentCooldown > 0) {
            return { ...tower, cooldown: currentCooldown - 1 };
          }

          // Find first zombie in range
          let target: Zombie | null = null;
          let minDist = tower.range;

          enemies.forEach(enemy => {
            if (!enemy) return;
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= tower.range && dist < minDist) {
              target = enemy;
              minDist = dist;
            }
          });

          if (target) {
            const enemyRef = target;
            let finalDamage = tower.damage;

            // Apply special turret logic & synergies
            if (tower.type === 'shock') {
              // Synergy Cryo: Shock dealing 2x damage if slowed
              const hasCryoPartner = neighbors.some(n => n.type === 'cryo');
              const isSlowed = enemyRef.slowDuration > 0 || wires.some(w => Math.round(enemyRef.x) === w.x && Math.round(enemyRef.y) === w.y);
              if (hasCryoPartner && isSlowed) {
                finalDamage *= 2.0;
                isSynergizing = true;
              }
            }

            if (tower.type === 'flame') {
              // Synergy Oil: ignite oil puddle or dealing extra burn
              const hasOilPartner = neighbors.some(n => n.type === 'oil');
              const isOiled = enemyRef.oilDuration > 0;
              if (hasOilPartner || isOiled) {
                finalDamage *= 1.5;
                isSynergizing = true;
              }
            }

            // Deal damage
            setEnemies(prev => prev.map(e => {
              if (e.id === enemyRef.id) {
                let nextHp = e.hp - finalDamage;
                let nextSlow = e.slowDuration;
                let nextOil = e.oilDuration;
                let nextBurn = e.burnDuration;

                if (tower.type === 'cryo') {
                  nextSlow = 15; // Slow for 15 ticks
                } else if (tower.type === 'oil') {
                  nextOil = 20; // Drench in oil
                } else if (tower.type === 'flame') {
                  nextBurn = 12; // Blaze on fire
                }

                return {
                  ...e,
                  hp: nextHp,
                  slowDuration: nextSlow,
                  oilDuration: nextOil,
                  burnDuration: nextBurn
                };
              }
              return e;
            }));

            // Sound design per turret shot
            if (tower.type === 'gun') playSound(600, 'sine', 0.05, 0.01);
            else if (tower.type === 'missile') playSound(180, 'sawtooth', 0.25, 0.04);
            else if (tower.type === 'flame') playSound(300, 'sine', 0.06, 0.015);
            else if (tower.type === 'cryo') playSound(800, 'triangle', 0.1, 0.02);
            else if (tower.type === 'oil') playSound(400, 'sine', 0.08, 0.02);
            else if (tower.type === 'shock') playSound(950, 'sine', 0.04, 0.02);

            // Compute angle facing target
            const angle = Math.atan2(enemyRef.y - tower.y, enemyRef.x - tower.x) * (180 / Math.PI);

            return {
              ...tower,
              cooldown: tower.maxCooldown,
              angle,
              synergyActive: isSynergizing
            };
          }

          return tower;
        });
      });

    }, 150 / gameSpeed);

    return () => clearInterval(gameTick);
  }, [gameState, isPaused, enemies, towers, wires, calculatedPath, waveRunning, waveSpawnComplete, gameSpeed]);

  return (
    <div className="min-h-screen bg-[#07090e] text-[#a9b2c3] font-mono select-none relative overflow-hidden flex flex-col">
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] z-50 opacity-40"></div>
      
      {/* Dynamic top bar */}
      <header className="border-b-2 border-slate-800 bg-[#090d16] px-6 py-4 flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-all cursor-pointer flex items-center gap-2 text-xs uppercase"
          >
            <ArrowLeft size={14} />
            <span>HQ Generale</span>
          </button>
          
          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <Radio size={16} className="text-red-500 animate-pulse" />
            <span className="text-white font-extrabold text-xs tracking-wider uppercase">LINK COMANDO STRATEGICO</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 border border-slate-700 rounded bg-slate-900/60 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title={muted ? "Abilita Audio" : "Disattiva Audio"}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-red-500" />}
          </button>

          <div className="text-[10px] text-slate-500 tracking-widest hidden md:block">
            STATUS: SECURE_CHANNEL_ACTIVE
          </div>
        </div>
      </header>

      {/* LOBBY / LEVEL SELECTOR STATE */}
      {gameState === 'lobby' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-4xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-red-900/60 bg-[#090e18] rounded-xl p-8 shadow-2xl w-full border-dashed space-y-6 relative"
          >
            <div className="absolute top-4 right-4 text-[9px] text-red-500 font-extrabold tracking-widest px-2 py-0.5 border border-red-500/40 rounded bg-red-950/20 uppercase animate-pulse">
              LIVE_COURIER_COM_ALERT
            </div>

            <div className="space-y-2 border-b border-slate-800 pb-5">
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 tracking-tighter uppercase leading-none">
                TACTICAL DEFENSE: Z-DAY
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Seleziona il settore d'intervento tattico per dirigere le installazioni d'artiglieria pesante, coordinare il terraforming con barricate e impedire alle orde mutate di travolgere il bunker.
              </p>
            </div>

            {/* Level selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => startBriefing(level)}
                  className="p-5 rounded-lg border-2 border-slate-800 hover:border-red-500/50 bg-slate-950/50 hover:bg-red-950/10 text-left transition-all cursor-pointer group flex flex-col justify-between h-56 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] relative"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-500 tracking-wider font-mono">[{level.codename}]</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                        level.difficulty === 'EASY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                        level.difficulty === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                        'bg-red-950 text-red-400 border border-red-500/30'
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors uppercase">{level.name}</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{level.description}</p>
                  </div>

                  <div className="border-t border-slate-900 pt-3 flex justify-between items-center w-full font-mono text-[9px] text-slate-500">
                    <span>ONDE: {level.waveCount}</span>
                    <span className="flex items-center gap-1 text-white/80 group-hover:text-red-400 transition-colors uppercase font-bold">
                      INIZIA BRIEFING <ChevronRight size={10} />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[#0b1222] border border-slate-800 p-4 rounded-lg flex items-center gap-3 font-sans text-xs text-slate-400">
              <Info size={16} className="text-amber-500 shrink-0" />
              <span>
                <strong>Manuale Tattico:</strong> Le barricate cambiano attivamente il percorso dell'orda in tempo reale. Posizionale con furbizia per incanalare gli zombie in trappole mortali con torrette sinergiche.
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* BRIEFING / INTRO VIEW */}
      {gameState === 'briefing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-2xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-red-500/40 bg-[#090e18] rounded-xl p-8 shadow-2xl w-full space-y-6"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Terminal className="text-red-500" size={18} />
              <h2 className="text-xl font-bold text-white uppercase">BRIEFING OPERATIVO: {selectedLevel.name}</h2>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300 font-sans">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-400 space-y-2">
                <div><strong className="text-slate-200">CODICE SETTORE:</strong> {selectedLevel.codename}</div>
                <div><strong className="text-slate-200">COORDINATE SBARCO:</strong> INGRESSO [{selectedLevel.startCell[0]}, {selectedLevel.startCell[1]}] ➜ BUNKER [{selectedLevel.endCell[0]}, {selectedLevel.endCell[1]}]</div>
                <div><strong className="text-slate-200">DIMENSIONE MAPPA:</strong> {selectedLevel.gridCols} x {selectedLevel.gridRows} Tattici</div>
                <div><strong className="text-slate-200">BUDGET ASSEGNATO:</strong> {selectedLevel.initialCredits} G</div>
                <div><strong className="text-slate-200">RISERVA MATERIALI:</strong> {selectedLevel.initialMaterials} Costruzione</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-xs font-bold text-red-400 uppercase">OBIETTIVI CHIAVE:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Difendi l'entrata blindata del Bunker tattico. Impedisci l'accesso dei mutanti.</li>
                  <li>Sfrutta le <strong className="text-slate-200">Barricate</strong> per dirottare e incanalare gli zombie veloci.</li>
                  <li>Avvicina <strong className="text-slate-200">Torrette Cryo & Shock</strong> o <strong className="text-slate-200">Lanciafiamme & Olio</strong> per innescare combo ad altissimo rendimento.</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setGameState('lobby')}
                className="flex-1 py-3 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs uppercase cursor-pointer"
              >
                Indietro
              </button>
              <button
                onClick={startOperation}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-black text-xs uppercase cursor-pointer shadow-lg shadow-red-500/20"
              >
                Avvia Operazione Militare
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* GAMEPLAY VIEW */}
      {gameState === 'active' && (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 relative z-10 w-full max-w-7xl mx-auto">
          
          {/* Main Battlefield (Left 8 columns) */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            
            {/* Tactical HUD panel */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-[#0a0f1b] border-2 border-slate-800 rounded-xl font-mono text-[11px] shadow-lg">
              <div className="flex flex-col">
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Integrità Bunker</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex gap-0.5 text-red-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Heart 
                        key={i} 
                        size={12} 
                        fill={i < Math.ceil(bunkerHp / 4) ? "currentColor" : "none"} 
                        className={i < Math.ceil(bunkerHp / 4) ? "animate-pulse" : "text-slate-800"} 
                      />
                    ))}
                  </div>
                  <span className="font-extrabold text-white">({bunkerHp}/20 HP)</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Crediti Militari</span>
                <span className="text-yellow-400 font-extrabold text-sm mt-0.5">{credits} G</span>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Materiali di Costruzione</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-cyan-400 font-extrabold text-sm">{materials} / 100</span>
                  <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 border border-cyan-500/30 rounded font-black">+1s</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Ondata Attuale</span>
                <span className="text-white font-extrabold text-sm mt-0.5">{currentWave} / {selectedLevel.waveCount}</span>
              </div>

              <div className="flex flex-col justify-center col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-3">
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Punteggio</span>
                <span className="text-red-400 font-extrabold text-sm mt-0.5">{score} pts</span>
              </div>
            </div>

            {/* Grid Map Battlefield */}
            <div className="bg-[#05080f] rounded-2xl border-4 border-slate-800 p-4 relative overflow-x-auto select-none shadow-2xl flex items-center justify-center">
              
              {/* Overlay CRT scanlines */}
              <div className="absolute inset-0 bg-[#070b13] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-xl"></div>

              <div 
                className="grid gap-[3px] relative bg-slate-950/80 p-2 rounded-lg border border-slate-800"
                style={{
                  gridTemplateColumns: `repeat(${selectedLevel.gridCols}, minmax(40px, 1fr))`,
                  gridTemplateRows: `repeat(${selectedLevel.gridRows}, minmax(40px, 1fr))`
                }}
              >
                {/* Floor Render & Path indicator layer */}
                {Array.from({ length: selectedLevel.gridRows }).map((_, rIndex) => (
                  Array.from({ length: selectedLevel.gridCols }).map((_, cIndex) => {
                    const isStart = selectedLevel.startCell[0] === cIndex && selectedLevel.startCell[1] === rIndex;
                    const isEnd = selectedLevel.endCell[0] === cIndex && selectedLevel.endCell[1] === rIndex;
                    
                    // Check if cell is on computed path
                    const isOnPath = calculatedPath.some(pt => pt[0] === cIndex && pt[1] === rIndex);
                    
                    const key = `${cIndex},${rIndex}`;
                    const hasBlocked = blockedCells.has(key);
                    const hasTower = towers.find(t => t.x === cIndex && t.y === rIndex);
                    const hasBarricade = barricades.find(b => b.x === cIndex && b.y === rIndex);
                    const hasWire = wires.find(w => w.x === cIndex && w.y === rIndex);

                    const isHovered = hoveredCell?.x === cIndex && hoveredCell?.y === rIndex;
                    const isSelectedTypePreset = TOWER_PRESETS[selectedBuildType];

                    // Determine cell background styling
                    let cellClass = "bg-slate-900/60 border border-slate-800/50 hover:bg-slate-800/30";
                    if (isStart) cellClass = "bg-red-950/50 border-2 border-red-600/40 text-red-400";
                    else if (isEnd) cellClass = "bg-emerald-950/50 border-2 border-emerald-600/40 text-emerald-400";
                    else if (hasBlocked && !hasTower && !hasBarricade) cellClass = "bg-stone-900 border border-stone-800"; // Static wall
                    else if (isOnPath) cellClass = "bg-[#0b101c] border border-slate-800/30 text-slate-700";

                    // Show selected placement range preview on hover
                    let showRange = false;
                    let rangeValue = 0;
                    let rangeColor = "rgba(16, 185, 129, 0.25)";

                    if (isHovered && !isStart && !isEnd) {
                      if (selectedTool === 'tower' && !hasTower && !hasBarricade && !hasWire) {
                        showRange = true;
                        rangeValue = isSelectedTypePreset.range;
                        rangeColor = "rgba(14, 165, 233, 0.25)";
                      } else if (hasTower) {
                        showRange = true;
                        rangeValue = hasTower.range;
                        rangeColor = "rgba(245, 158, 11, 0.25)";
                      }
                    }

                    return (
                      <div
                        key={`${cIndex}-${rIndex}`}
                        onClick={() => handleCellClick(cIndex, rIndex)}
                        onMouseEnter={() => setHoveredCell({ x: cIndex, y: rIndex })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`aspect-square rounded-md flex flex-col items-center justify-center relative cursor-pointer transition-all ${cellClass}`}
                      >
                        {/* Start/End labels */}
                        {isStart && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/40 rounded-md">
                            <span className="text-[7px] font-black tracking-widest text-red-400 uppercase leading-none">SPAWN</span>
                            <Radio size={14} className="text-red-500 animate-pulse mt-0.5" />
                          </div>
                        )}
                        {isEnd && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/40 rounded-md">
                            <span className="text-[7px] font-black tracking-widest text-emerald-400 uppercase leading-none">BUNKER</span>
                            <Shield size={14} className="text-emerald-500 animate-pulse mt-0.5" />
                          </div>
                        )}

                        {/* Static Level Obstacles / Pre-built blocks */}
                        {hasBlocked && !hasTower && !hasBarricade && (
                          <div className="absolute inset-1 border border-stone-700/60 bg-stone-900 rounded flex flex-col items-center justify-center text-stone-600 pointer-events-none shadow-inner">
                            <Lock size={12} className="opacity-50" />
                          </div>
                        )}

                        {/* Path connection vector indicator dots */}
                        {isOnPath && !isStart && !isEnd && !hasTower && !hasBarricade && !hasWire && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></span>
                        )}

                        {/* BARRICADE (Stacked Sandbags/Mura) */}
                        {hasBarricade && (
                          <div className="absolute inset-1 rounded bg-[#2e261f] border-2 border-amber-800/80 flex flex-col items-center justify-center text-amber-500 shadow-md z-10 font-black">
                            <Construction size={14} />
                            <span className="text-[6px] text-amber-600 tracking-wider">MURA</span>
                          </div>
                        )}

                        {/* WIRE (Filo Spinato) */}
                        {hasWire && (
                          <div className="absolute inset-1 bg-red-950/20 border border-dashed border-red-500/35 rounded flex items-center justify-center text-red-400 z-10 pointer-events-none">
                            <Skull size={12} className="opacity-40" />
                          </div>
                        )}

                        {/* MILITARY TURRET TOWERS */}
                        {hasTower && (
                          <div 
                            className="absolute inset-1 rounded bg-[#131b2c] border-2 flex flex-col items-center justify-center z-20 shadow-lg relative"
                            style={{ 
                              borderColor: hasTower.type === 'gun' ? '#34d399' :
                                          hasTower.type === 'missile' ? '#fbbf24' :
                                          hasTower.type === 'flame' ? '#f87171' :
                                          hasTower.type === 'cryo' ? '#22d3ee' :
                                          hasTower.type === 'oil' ? '#eab308' : '#a78bfa'
                            }}
                          >
                            {/* Rotatable cannon weapon turret barrel */}
                            <div 
                              className="w-4 h-1 bg-white rounded-full absolute transition-transform ease-out origin-center"
                              style={{ 
                                transform: `rotate(${hasTower.angle}deg) translateX(4px)`,
                                backgroundColor: hasTower.type === 'gun' ? '#34d399' :
                                                hasTower.type === 'missile' ? '#fbbf24' :
                                                hasTower.type === 'flame' ? '#f87171' :
                                                hasTower.type === 'cryo' ? '#22d3ee' : '#a78bfa'
                              }}
                            />
                            
                            {/* Inner turret core badge */}
                            <span className="text-[7px] font-black mt-2 text-slate-400 z-10 scale-90">L{hasTower.level}</span>
                            
                            {/* Synergy highlight flash */}
                            {hasTower.synergyActive && (
                              <div className="absolute inset-0 bg-red-500/10 border border-red-500 rounded animate-ping pointer-events-none"></div>
                            )}

                            {/* Sell Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const refund = Math.round(TOWER_PRESETS[hasTower.type].cost * 0.65);
                                setCredits(prev => prev + refund);
                                setTowers(prev => prev.filter(t => t.id !== hasTower.id));
                                const nextBlocked = new Set<string>(blockedCells);
                                nextBlocked.delete(key);
                                setBlockedCells(nextBlocked);
                                const path = computePath(selectedLevel.gridCols, selectedLevel.gridRows, selectedLevel.startCell, selectedLevel.endCell, nextBlocked);
                                if (path) setCalculatedPath(path);
                                pushLog(`RIMOZIONE: Smantellata torretta. Rimborsati ${refund}G.`);
                                playSound(220, 'sine', 0.15);
                              }}
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-700 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold z-30"
                              title="Smantella Torretta"
                            >
                              x
                            </button>
                          </div>
                        )}

                        {/* Ghost Construction Preview */}
                        {isHovered && !hasBlocked && !hasTower && !hasBarricade && !hasWire && !isStart && !isEnd && (
                          <div className="absolute inset-1 rounded border border-dashed border-slate-500/40 bg-slate-800/10 flex items-center justify-center text-slate-500 opacity-60 z-10 pointer-events-none">
                            {selectedTool === 'tower' && <Target size={12} />}
                            {selectedTool === 'barricade' && <Construction size={12} />}
                            {selectedTool === 'wire' && <Skull size={12} />}
                          </div>
                        )}

                        {/* Dynamic Range Circle overlay preview */}
                        {showRange && (
                          <div 
                            className="absolute rounded-full border pointer-events-none z-40 animate-pulse"
                            style={{
                              width: `calc(${rangeValue} * 200%)`,
                              height: `calc(${rangeValue} * 200%)`,
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              borderColor: hasTower ? 'rgba(245, 158, 11, 0.4)' : 'rgba(34, 211, 238, 0.4)',
                              backgroundColor: hasTower ? 'rgba(245, 158, 11, 0.05)' : 'rgba(34, 211, 238, 0.05)',
                              borderWidth: '2px',
                              borderStyle: 'dashed'
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                ))}

                {/* Tactical Laser fire indicators overlay lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                  {towers.map(tower => {
                    // Check if tower recently fired (cooldown is near maxCooldown)
                    const firedRecently = tower.cooldown >= tower.maxCooldown - 1;
                    if (!firedRecently) return null;

                    // Locate nearest zombie in range to draw bullet line
                    let target: Zombie | null = null;
                    let minDist = tower.range;
                    enemies.forEach(z => {
                      if (!z) return;
                      const dist = Math.sqrt(Math.pow(z.x - tower.x, 2) + Math.pow(z.y - tower.y, 2));
                      if (dist <= tower.range && dist < minDist) {
                        target = z;
                        minDist = dist;
                      }
                    });

                    if (!target) return null;

                    const startX = ((tower.x + 0.5) / selectedLevel.gridCols) * 100;
                    const startY = ((tower.y + 0.5) / selectedLevel.gridRows) * 100;
                    const endX = ((target.x + 0.5) / selectedLevel.gridCols) * 100;
                    const endY = ((target.y + 0.5) / selectedLevel.gridRows) * 100;

                    let strokeColor = "#ef4444";
                    if (tower.type === 'cryo') strokeColor = "#22d3ee";
                    else if (tower.type === 'shock') strokeColor = "#a78bfa";
                    else if (tower.type === 'flame') strokeColor = "#fb923c";

                    return (
                      <g key={tower.id}>
                        <line
                          x1={`${startX}%`}
                          y1={`${startY}%`}
                          x2={`${endX}%`}
                          y2={`${endY}%`}
                          stroke={strokeColor}
                          strokeWidth={tower.type === 'missile' ? "4" : "1.5"}
                          className="opacity-90 animate-pulse"
                        />
                        <circle
                          cx={`${endX}%`}
                          cy={`${endY}%`}
                          r="4"
                          fill={strokeColor}
                          className="animate-ping"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* ACTIVE ZOMBIES LAYER OVERLAYS */}
                {enemies.map(zombie => {
                  if (!zombie) return null;
                  const leftPercent = ((zombie.x + 0.5) / selectedLevel.gridCols) * 100;
                  const topPercent = ((zombie.y + 0.5) / selectedLevel.gridRows) * 100;
                  const hpPercent = (zombie.hp / zombie.maxHp) * 100;

                  // Debuff visual markers
                  const isBurning = zombie.burnDuration > 0;
                  const isSlowed = zombie.slowDuration > 0;
                  const isOiled = zombie.oilDuration > 0;

                  return (
                    <div
                      key={zombie.id}
                      className="absolute z-40 flex flex-col items-center justify-center w-8 h-8 -ml-4 -mt-4 transition-all duration-150 ease-linear pointer-events-none"
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`
                      }}
                    >
                      {/* Styled Top-down Zombie shape */}
                      <div 
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center relative shadow-lg ${
                          zombie.type === 'hulk' ? 'w-7 h-7 bg-red-950/60 border-red-500 text-red-400' :
                          zombie.type === 'sprinter' ? 'bg-amber-950/60 border-amber-500 text-amber-400' :
                          'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                        }`}
                        style={{
                          transform: `rotate(${zombie.angle}deg)`,
                          boxShadow: isBurning ? '0 0 10px #f87171' : isSlowed ? '0 0 10px #22d3ee' : 'none'
                        }}
                      >
                        {/* Target reticle inside zombie */}
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
                        
                        {/* Status visual particles */}
                        {isBurning && <span className="absolute -top-1 text-[8px] animate-bounce">🔥</span>}
                        {isSlowed && <span className="absolute -bottom-1 text-[8px]">❄️</span>}
                        {isOiled && <span className="absolute -right-1 text-[8px]">💧</span>}
                      </div>

                      {/* Small HP indicator bar */}
                      <div className="w-6 h-1 bg-black/80 border border-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div 
                          className="h-full transition-all duration-100"
                          style={{
                            width: `${hpPercent}%`,
                            backgroundColor: hpPercent < 40 ? '#ef4444' : '#10b981'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Tactical General Log console */}
            <div className="border border-slate-800 bg-[#050912] rounded-xl p-4 h-36 flex flex-col justify-between shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                <span>RELAZIONE COURIER STRATEGICO</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> LIVE RECEPTOR
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 text-[10px] leading-tight text-slate-400 select-text pr-2">
                {logs.map((log, idx) => (
                  <div key={idx} className={idx === 0 ? "text-white font-extrabold flex items-start gap-1" : "opacity-60 flex items-start gap-1"}>
                    <span className="text-red-500/70 select-none">➜</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Configuration Arsenal sidebar panel (Right 4 columns) */}
          <div className="xl:col-span-4 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Construction Selector tab buttons */}
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <button
                  onClick={() => setSelectedTool('tower')}
                  className={`py-2.5 rounded-lg border-2 transition-all cursor-pointer text-center font-black uppercase ${
                    selectedTool === 'tower' 
                      ? 'bg-sky-950/40 border-sky-500 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                      : 'border-slate-800 bg-slate-950/20 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  1. ARTIGLIERIA
                </button>
                <button
                  onClick={() => setSelectedTool('barricade')}
                  className={`py-2.5 rounded-lg border-2 transition-all cursor-pointer text-center font-black uppercase ${
                    selectedTool === 'barricade'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'border-slate-800 bg-slate-950/20 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  2. MURA
                </button>
                <button
                  onClick={() => setSelectedTool('wire')}
                  className={`py-2.5 rounded-lg border-2 transition-all cursor-pointer text-center font-black uppercase ${
                    selectedTool === 'wire'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                      : 'border-slate-800 bg-slate-950/20 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  3. TRAPPOLE
                </button>
              </div>

              {/* TOOL SELECTOR AREA */}
              <AnimatePresence mode="wait">
                {selectedTool === 'tower' ? (
                  <motion.div 
                    key="tower-arsenal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">ARSENALE ARTIGLIERIA</h4>
                      <span className="text-[10px] text-slate-500 uppercase">Seleziona e costruisci</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                      {(Object.keys(TOWER_PRESETS) as Array<keyof typeof TOWER_PRESETS>).map(type => {
                        const config = TOWER_PRESETS[type];
                        const isSelected = selectedBuildType === type;
                        return (
                          <button
                            key={type}
                            onClick={() => setSelectedBuildType(type)}
                            className={`p-3 rounded-lg border-2 text-left flex flex-col transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-slate-900 border-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                                : 'border-slate-800/80 bg-slate-950/40 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-extrabold text-xs flex items-center gap-1.5 uppercase">
                                <span className={config.color}>⌖</span>
                                <span>{config.name}</span>
                              </span>
                              <span className={`font-black text-xs ${credits >= config.cost ? 'text-yellow-400' : 'text-red-500'}`}>
                                {config.cost}G
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans mt-1 leading-relaxed">
                              {config.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="terrain-blocking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">STRUTTURE TERRAFORMING</h4>
                      <span className="text-[10px] text-slate-500 uppercase">Richiede Materiali</span>
                    </div>

                    <div className="space-y-3">
                      {selectedTool === 'barricade' && (
                        <div className="p-4 rounded-lg border-2 border-amber-500/40 bg-amber-950/10 space-y-3">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-amber-400 text-xs uppercase">{OBSTACLE_COSTS.barricade.name}</span>
                            <span className="text-yellow-400 font-black text-xs">{OBSTACLE_COSTS.barricade.cost} MAT</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                            {OBSTACLE_COSTS.barricade.desc}
                          </p>
                          <div className="text-[9px] text-amber-500 bg-amber-950/20 border border-amber-500/20 p-2 rounded">
                            INFO COMANDO: Posizionando sandbags modifichi all'istante l'algoritmo di calcolo del sentiero degli zombie mutati.
                          </div>
                        </div>
                      )}

                      {selectedTool === 'wire' && (
                        <div className="p-4 rounded-lg border-2 border-rose-500/40 bg-rose-950/10 space-y-3">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-rose-400 text-xs uppercase">{OBSTACLE_COSTS.wire.name}</span>
                            <span className="text-yellow-400 font-black text-xs">{OBSTACLE_COSTS.wire.cost} MAT</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                            {OBSTACLE_COSTS.wire.desc}
                          </p>
                          <div className="text-[9px] text-rose-500 bg-rose-950/20 border border-rose-500/20 p-2 rounded">
                            INFO COMANDO: Perfetto da stendere in prossimità delle zone di fuoco pesante per massimizzare il rendimento balistico.
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sinergy list info card */}
              <div className="p-3 bg-indigo-950/10 border border-indigo-950/60 rounded-lg space-y-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">⌖ SINERGIE BALISTICHE RILEVATE</span>
                <div className="space-y-1.5 text-[9px] text-slate-400">
                  <div>🔥 <strong className="text-white">Effetto Napalm:</strong> Lanciafiamme adiacente a Torretta Olio incendia l'area (+50% Danno).</div>
                  <div>⚡ <strong className="text-white">Carica Conduttiva:</strong> Torretta Shock su nemici rallentati (Cryo/Filo spinato) infligge 2x Danni.</div>
                </div>
              </div>

            </div>

            {/* Core control action buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              {waveRunning ? (
                <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] rounded text-center animate-pulse uppercase tracking-wider font-bold">
                  ⚠️ INVASIONE MUTANTE IN CORSO! DIFENDERE IL SETTORE
                </div>
              ) : (
                <button
                  onClick={launchWave}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-red-500/20 cursor-pointer"
                >
                  Avvia Ondata {currentWave} Rilevata
                </button>
              )}

              {/* Speed Flow Control */}
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-800/80 bg-slate-950/40 font-mono text-[10px]">
                <span className="text-slate-500 uppercase font-bold">Velocità Simulazione</span>
                <div className="flex gap-1.5">
                  {([1, 2, 3] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        setGameSpeed(speed);
                        playSound(300 + speed * 100, 'sine', 0.1, 0.03);
                        pushLog(`FLUSSO SIMULAZIONE: Velocità impostata a ${speed}x.`);
                      }}
                      className={`px-3 py-1 rounded font-black text-[9px] transition-all cursor-pointer ${
                        gameSpeed === speed
                          ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                          : 'bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white/80 font-bold text-[10px] rounded uppercase cursor-pointer"
                >
                  {isPaused ? "Riprendi" : "Pausa Tattica"}
                </button>
                <button
                  onClick={() => resetLevelData(selectedLevel)}
                  className="py-2 bg-slate-900 border border-slate-700 hover:border-red-500/40 text-white/50 hover:text-red-400 font-bold text-[10px] rounded uppercase cursor-pointer"
                >
                  Riavvia Missione
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PAUSE DIALOG OVERLAY */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-[#05080f]/90 backdrop-blur-sm flex flex-col items-center justify-center font-mono select-none">
          <div className="border-2 border-red-500/50 bg-[#090e18] rounded-xl p-8 max-w-sm text-center space-y-5 shadow-2xl">
            <AlertTriangle className="text-red-500 mx-auto animate-pulse" size={40} />
            <h3 className="text-xl font-bold text-white uppercase">PAUSA STRATEGICA</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              La simulazione bellica d'emergenza è stata temporaneamente congelata. Studia la mappa e posiziona le tue difese al riavvio.
            </p>
            <button
              onClick={() => setIsPaused(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer"
            >
              RIPRENDI OPERAZIONI
            </button>
          </div>
        </div>
      )}

      {/* VICTORY SCREEN STATE */}
      {gameState === 'victory' && (
        <div className="fixed inset-0 z-50 bg-[#05080f]/95 backdrop-blur-md flex flex-col items-center justify-center font-mono select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-4 border-emerald-500 bg-[#090e18] rounded-xl p-10 max-w-md text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] relative"
          >
            <div className="absolute top-4 right-4 text-[9px] text-emerald-400 border border-emerald-500/40 rounded bg-emerald-950/20 px-2 py-0.5">
              MISSION_PASSED
            </div>

            <Trophy className="text-emerald-400 mx-auto animate-bounce" size={54} />
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">SETTORE MESSO IN SICUREZZA</h2>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">VITTORIA ASSOLUTA SULL'ORDA</p>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Comandante, le tue abilità tattiche nel combinare l'artiglieria pesante, sfruttare le sinergie elementali e dirottare gli assalti mutanti con le barricate hanno salvato il Bunker e messo in salvo l'intero settore operativo.
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 rounded bg-slate-950 border border-slate-900 text-xs">
              <div>
                <span className="text-slate-500 block text-[9px]">PUNTI RECORD</span>
                <span className="text-white font-extrabold text-sm">{score}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">STELLE CONSEGUITE</span>
                <span className="text-amber-400 font-extrabold text-sm flex justify-center gap-1 mt-0.5">
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setGameState('lobby')}
                className="flex-1 py-3 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs uppercase cursor-pointer"
              >
                Lista Settori
              </button>
              <button
                onClick={() => resetLevelData(selectedLevel)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-black text-xs uppercase cursor-pointer"
              >
                Rigioca Settore
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DEFEAT SCREEN STATE */}
      {gameState === 'defeat' && (
        <div className="fixed inset-0 z-50 bg-[#05080f]/95 backdrop-blur-md flex flex-col items-center justify-center font-mono select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-4 border-red-600 bg-[#090e18] rounded-xl p-10 max-w-md text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative"
          >
            <div className="absolute top-4 right-4 text-[9px] text-red-500 border border-red-500/40 rounded bg-red-950/20 px-2 py-0.5">
              BASE_COMPROMISED
            </div>

            <AlertTriangle className="text-red-500 mx-auto animate-pulse animate-duration-1000" size={54} />
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">SCONFITTA: BUNKER CADUTO</h2>
              <p className="text-xs text-red-500 font-bold uppercase tracking-wider">L'ORDA HA OVERRANNATO LE FORTIFICAZIONI</p>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Le difese perimetrali non hanno retto alla violenza dell'orda mutata. Rivedi il piazzamento delle tue torrette, prepara barricate per convogliare le ondate e non dimenticare le potenti sinergie balistiche adiacenti!
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setGameState('lobby')}
                className="flex-1 py-3 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs uppercase cursor-pointer"
              >
                Lista Settori
              </button>
              <button
                onClick={() => {
                  resetLevelData(selectedLevel);
                  setGameState('active');
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-black text-xs uppercase cursor-pointer"
              >
                Riorganizza Difese
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
