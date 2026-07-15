import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, Shield, Zap, Sparkles, Trophy, 
  Play, RotateCcw, Plus, Trash2, Heart, Award, 
  Terminal, Code2, AlertTriangle, ChevronRight, Volume2, VolumeX,
  Target, Keyboard, Brain, HelpCircle, ArrowLeft, Database, Check, Server,
  Skull, Ghost, Flame, Crosshair, Snowflake, Coins, Music, Star, Smile, Sparkles as SparkleIcon
} from 'lucide-react';

// ==========================================
// TOWER DEFENSE CONSTANTS & SETUP
// ==========================================
const GRID_COLS = 12;
const GRID_ROWS = 8;

// Path coordinates: [col, row]
const TD_PATH: [number, number][] = [
  [0, 2], [1, 2], [2, 2], [2, 5], [3, 5], [4, 5], 
  [4, 1], [5, 1], [6, 1], [7, 1], [7, 4], [8, 4], 
  [9, 4], [10, 4], [11, 4]
];

interface Enemy {
  id: string;
  type: 'bug' | 'leak' | 'crash';
  name: string;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  color: string;
  icon: string;
  pathIndex: number; // Index in TD_PATH
  subProgress: number; // 0 to 1 between pathIndex and pathIndex + 1
  x: number; // Calculated screen/grid x
  y: number; // Calculated screen/grid y
  isSlowed?: boolean;
  slowDuration?: number;
}

interface Tower {
  id: string;
  x: number;
  y: number;
  type: 'firewall' | 'antivirus' | 'proxy';
  name: string;
  level: number;
  damage: number;
  range: number; // grid cells
  cooldown: number; // current ticks left
  maxCooldown: number; // ticks between shots
  cost: number;
  icon: string;
  color: string;
}

interface Projectile {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  life: number; // ticks left (usually 2-3 for visual effect)
}

// Global Game Icon Helper (Ensuring pure vectors, no emojis)
const getGameIcon = (name: string, className: string = '', style: React.CSSProperties = {}) => {
  switch (name) {
    case 'Skull': return <Skull className={className} style={style} />;
    case 'Zap': return <Zap className={className} style={style} />;
    case 'Ghost': return <Ghost className={className} style={style} />;
    case 'Crosshair': return <Crosshair className={className} style={style} />;
    case 'Flame': return <Flame className={className} style={style} />;
    case 'Snowflake': return <Snowflake className={className} style={style} />;
    case 'Coins': return <Coins className={className} style={style} />;
    case 'Heart': return <Heart className={className} style={style} />;
    case 'Trophy': return <Trophy className={className} style={style} />;
    case 'Server': return <Server className={className} style={style} />;
    case 'Brain': return <Brain className={className} style={style} />;
    case 'Music': return <Music className={className} style={style} />;
    case 'Star': return <Star className={className} style={style} />;
    case 'Gamepad2': return <Gamepad2 className={className} style={style} />;
    case 'Keyboard': return <Keyboard className={className} style={style} />;
    default: return null;
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MiniGamesPage({ onBackToPortfolio }: { onBackToPortfolio: () => void }) {
  const [activeGame, setActiveGame] = useState<'td' | 'memory' | 'typing'>('td');
  const [muted, setMuted] = useState(true);

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-4 md:px-8 relative z-10 font-sans text-[#e0e0e0]">
      {/* Playful Arcade Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-dashed border-violet-500/30 pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="text-[11px] font-mono text-pink-500 tracking-[0.25em] uppercase font-black">// PLAYFUL_ARCADE_CABINET</span>
            <div className="h-[2px] w-12 bg-pink-500"></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 leading-none drop-shadow-[0_4px_12px_rgba(236,72,153,0.3)]">
            FUN_ZONE
          </h1>
          <p className="text-cyan-300 text-xs md:text-sm font-mono mt-2 tracking-wide uppercase">
            Mettiti alla prova con minigiochi retrò colorati, interattivi e ricchi di effetti speciali!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToPortfolio}
            className="px-5 py-2.5 rounded-lg border-2 border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/40 text-cyan-300 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all text-xs font-mono font-bold flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft size={14} className="text-cyan-400" />
            <span>Torna al Portfolio</span>
          </button>
          
          <button 
            onClick={() => setMuted(!muted)}
            className="p-2.5 rounded-lg border-2 border-purple-500/30 text-purple-400 hover:text-white hover:border-purple-400 bg-purple-950/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
            title={muted ? "Sblocca Audio" : "Disattiva Audio"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-pink-500" />}
          </button>
        </div>
      </div>

      {/* Main Game Selection Tabs (Retro Arcade Controls Styling) */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto font-mono text-xs">
        <button
          onClick={() => setActiveGame('td')}
          className={`py-4 px-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            activeGame === 'td'
              ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 border-emerald-500 text-emerald-300 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.03]'
          }`}
        >
          {getGameIcon('Skull', `w-6 h-6 ${activeGame === 'td' ? 'text-emerald-400 animate-pulse' : 'text-white/30'}`)}
          <span className="tracking-wide text-[10px] md:text-xs uppercase font-black">1. Zombie Defense</span>
        </button>

        <button
          onClick={() => setActiveGame('memory')}
          className={`py-4 px-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            activeGame === 'memory'
              ? 'bg-gradient-to-b from-purple-500/20 to-purple-950/40 border-purple-500 text-purple-300 font-extrabold shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.03]'
          }`}
        >
          {getGameIcon('Music', `w-6 h-6 ${activeGame === 'memory' ? 'text-purple-400 animate-bounce' : 'text-white/30'}`)}
          <span className="tracking-wide text-[10px] md:text-xs uppercase font-black">2. Simon Synth</span>
        </button>

        <button
          onClick={() => setActiveGame('typing')}
          className={`py-4 px-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            activeGame === 'typing'
              ? 'bg-gradient-to-b from-cyan-500/20 to-cyan-950/40 border-cyan-500 text-cyan-300 font-extrabold shadow-[0_0_20px_rgba(34,211,238,0.4)]'
              : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.03]'
          }`}
        >
          {getGameIcon('Keyboard', `w-6 h-6 ${activeGame === 'typing' ? 'text-cyan-400 animate-pulse' : 'text-white/30'}`)}
          <span className="tracking-wide text-[10px] md:text-xs uppercase font-black">3. Bubble Blaster</span>
        </button>
      </div>

      {/* Game Cabinet Container */}
      <div className="relative rounded-3xl border-4 border-purple-500/30 overflow-hidden bg-gradient-to-b from-slate-950 to-indigo-950 p-6 md:p-8 shadow-[0_0_40px_rgba(139,92,246,0.15)] min-h-[520px]">
        {/* Playful cabinet structural aesthetics */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-60"></div>
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-pink-500/40 animate-ping"></div>
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cyan-500/40 animate-ping"></div>

        <AnimatePresence mode="wait">
          {activeGame === 'td' && (
            <motion.div
              key="td"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <ZombieDefenseGame muted={muted} />
            </motion.div>
          )}

          {activeGame === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <ChromaSimonSynthGame muted={muted} />
            </motion.div>
          )}

          {activeGame === 'typing' && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <BubbleBlastGame muted={muted} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// 1. ZOMBIE DEFENSE (FORMERLY BUG DEFENSE)
// ==========================================
function ZombieDefenseGame({ muted }: { muted: boolean }) {
  const [baseHp, setBaseHp] = useState(10);
  const [credits, setCredits] = useState(350);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveActive, setWaveActive] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedBuildType, setSelectedBuildType] = useState<'firewall' | 'antivirus' | 'proxy'>('firewall');
  const [highScore, setHighScore] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  // References for spawn tracking
  const spawnQueue = useRef<{ type: 'bug' | 'leak' | 'crash'; count: number; delay: number }[]>([]);
  const spawnCooldown = useRef(0);
  const gameTickRef = useRef<any>(null);

  // Keep refs in sync with state for non-stale closure access inside setInterval
  const baseHpRef = useRef(baseHp);
  const creditsRef = useRef(credits);
  const scoreRef = useRef(score);
  const waveRef = useRef(wave);
  const waveActiveRef = useRef(waveActive);
  const enemiesRef = useRef(enemies);
  const towersRef = useRef(towers);

  useEffect(() => { baseHpRef.current = baseHp; }, [baseHp]);
  useEffect(() => { creditsRef.current = credits; }, [credits]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { waveRef.current = wave; }, [wave]);
  useEffect(() => { waveActiveRef.current = waveActive; }, [waveActive]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { towersRef.current = towers; }, [towers]);

  // Playful Turret configurations
  const TOWER_TYPES = {
    firewall: {
      name: 'Gatling Turret',
      cost: 100,
      damage: 15,
      range: 2.3,
      maxCooldown: 8, // fast
      color: '#38bdf8', // Neon Sky Blue
      icon: 'Crosshair',
      desc: 'Torretta automatica rapida. Ideale per ondate folte.'
    },
    antivirus: {
      name: 'Plasma Cannon',
      cost: 160,
      damage: 42,
      range: 3.3,
      maxCooldown: 18, // heavy but slow
      color: '#4ade80', // Glowing Lime Green
      icon: 'Flame',
      desc: 'Lancia dardi incendiari ad altissimo danno. Grande gittata.'
    },
    proxy: {
      name: 'Cryo Beamer',
      cost: 120,
      damage: 6,
      range: 1.9,
      maxCooldown: 6, // fast frost slow
      color: '#fbbf24', // Yellow Gold
      icon: 'Snowflake',
      desc: 'Genera un raggio congelante che rallenta gli zombie del 55%.'
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('td_bug_defense_highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Audio helper
  const playSound = (freq: number, type: OscillatorType, duration: number) => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Check path coordinate
  const isPathCell = (c: number, r: number) => {
    return TD_PATH.some(([pc, pr]) => pc === c && pr === r);
  };

  // Build a tower
  const buildTower = (c: number, r: number) => {
    if (isPathCell(c, r)) return;
    // Check if tower already exists there
    const existing = towers.find(t => t.x === c && t.y === r);
    if (existing) {
      // Simple upgrade if enough credits
      const upgradeCost = Math.round(existing.cost * 0.75);
      if (credits >= upgradeCost && existing.level < 3) {
        setCredits(prev => prev - upgradeCost);
        setTowers(prev => prev.map(t => t.id === existing.id ? {
          ...t,
          level: t.level + 1,
          damage: Math.round(t.damage * 1.6),
          range: t.range + 0.3,
          cost: t.cost + upgradeCost
        } : t));
        playSound(587.33, 'triangle', 0.15); // upgrade D5
      }
      return;
    }

    const config = TOWER_TYPES[selectedBuildType];
    if (credits >= config.cost) {
      setCredits(prev => prev - config.cost);
      const newTower: Tower = {
        id: Math.random().toString(),
        x: c,
        y: r,
        type: selectedBuildType,
        name: config.name,
        level: 1,
        damage: config.damage,
        range: config.range,
        cooldown: 0,
        maxCooldown: config.maxCooldown,
        cost: config.cost,
        icon: config.icon,
        color: config.color
      };
      setTowers(prev => [...prev, newTower]);
      playSound(392.00, 'sine', 0.12); // place G4
    } else {
      playSound(120, 'sawtooth', 0.25); // buzzer error
    }
  };

  const sellTower = (id: string, cost: number, level: number) => {
    const refund = Math.round(cost * 0.65);
    setCredits(prev => prev + refund);
    setTowers(prev => prev.filter(t => t.id !== id));
    playSound(220, 'sine', 0.15);
  };

  // Start next wave
  const startWave = () => {
    if (waveActive) return;
    setWaveActive(true);
    setIsPlaying(true);
    
    // Wave zombie progression
    const bugCount = 4 + wave * 2;
    const leakCount = wave > 2 ? 2 + wave : 0;
    const crashCount = wave > 4 ? 1 + Math.floor(wave / 2) : 0;

    const queue: typeof spawnQueue.current = [];
    if (bugCount > 0) queue.push({ type: 'bug', count: bugCount, delay: 10 });
    if (leakCount > 0) queue.push({ type: 'leak', count: leakCount, delay: 14 });
    if (crashCount > 0) queue.push({ type: 'crash', count: crashCount, delay: 24 });

    spawnQueue.current = queue;
    spawnCooldown.current = 0;
    playSound(330, 'triangle', 0.4); // horn alert
  };

  // Reset entire game state
  const resetGame = () => {
    setBaseHp(10);
    setCredits(350);
    setScore(0);
    setWave(1);
    setEnemies([]);
    setTowers([]);
    setProjectiles([]);
    setWaveActive(false);
    setIsPlaying(false);
    spawnQueue.current = [];
  };

  // Game loop tick (runs every 120ms for smooth logical states)
  useEffect(() => {
    if (!isPlaying) {
      if (gameTickRef.current) clearInterval(gameTickRef.current);
      return;
    }

    gameTickRef.current = setInterval(() => {
      let currentEnemies = [...enemiesRef.current];
      let currentTowers = [...towersRef.current];
      let currentCredits = creditsRef.current;
      let currentScore = scoreRef.current;
      let currentBaseHp = baseHpRef.current;
      let currentWaveActive = waveActiveRef.current;
      let currentProjectiles: Projectile[] = [];

      // 1. Spawning Zombie Enemies
      if (spawnQueue.current.length > 0) {
        if (spawnCooldown.current <= 0) {
          const currentBatch = spawnQueue.current[0];
          if (currentBatch.count > 0) {
            // Spawn an enemy
            const id = Math.random().toString();
            let hp = 42 + waveRef.current * 18;
            let speed = 0.18;
            let reward = 12 + waveRef.current * 2;
            let color = '#84cc16'; // Zombie lime green
            let name = 'Walker Zombie';
            let icon = 'Skull';

            if (currentBatch.type === 'leak') {
              hp = 32 + waveRef.current * 12;
              speed = 0.28; // Faster
              reward = 18 + waveRef.current * 3;
              color = '#f43f5e'; // Runner rose-pink
              name = 'Runner Zombie';
              icon = 'Zap';
            } else if (currentBatch.type === 'crash') {
              hp = 115 + waveRef.current * 35; // Huge hp tank abomination
              speed = 0.09; // Slow crawling abomination
              reward = 35 + waveRef.current * 5;
              color = '#a855f7'; // Purple giant tank
              name = 'Mutant Giant';
              icon = 'Ghost';
            }

            const startCell = TD_PATH[0];
            const newEnemy: Enemy = {
              id,
              type: currentBatch.type,
              name,
              hp,
              maxHp: hp,
              speed,
              reward,
              color,
              icon,
              pathIndex: 0,
              subProgress: 0,
              x: startCell[0],
              y: startCell[1]
            };

            currentEnemies.push(newEnemy);
            currentBatch.count--;
            spawnCooldown.current = currentBatch.delay;
          } else {
            spawnQueue.current.shift();
          }
        } else {
          spawnCooldown.current--;
        }
      }

      // 2. Move Zombies
      const nextEnemies: Enemy[] = [];
      currentEnemies.forEach(enemy => {
        let currentSpeed = enemy.isSlowed ? enemy.speed * 0.45 : enemy.speed;
        let nextSub = enemy.subProgress + currentSpeed;
        
        let duration = enemy.slowDuration ? enemy.slowDuration - 1 : 0;
        let isSlowed = duration > 0;

        if (nextSub >= 1) {
          const nextIndex = enemy.pathIndex + 1;
          if (nextIndex >= TD_PATH.length - 1) {
            // Reached base bunker!
            currentBaseHp = currentBaseHp - 1;
            if (currentBaseHp <= 0) {
              setIsPlaying(false);
              playSound(90, 'sawtooth', 0.9); // GameOver explosion
            } else {
              playSound(150, 'sawtooth', 0.25); // Bunker hit sound
            }
          } else {
            nextEnemies.push({
              ...enemy,
              pathIndex: nextIndex,
              subProgress: nextSub - 1,
              isSlowed,
              slowDuration: duration,
              x: TD_PATH[nextIndex][0],
              y: TD_PATH[nextIndex][1]
            });
          }
        } else {
          // Calculate smooth layout X and Y between current cell and next cell
          const currCell = TD_PATH[enemy.pathIndex];
          const nextCell = TD_PATH[enemy.pathIndex + 1];
          const calcX = currCell[0] + (nextCell[0] - currCell[0]) * nextSub;
          const calcY = currCell[1] + (nextCell[1] - currCell[1]) * nextSub;

          nextEnemies.push({
            ...enemy,
            subProgress: nextSub,
            isSlowed,
            slowDuration: duration,
            x: calcX,
            y: calcY
          });
        }
      });
      currentEnemies = nextEnemies;

      // 3. Turrets Attack
      currentTowers = currentTowers.map(tower => {
        if (tower.cooldown > 0) {
          return { ...tower, cooldown: tower.cooldown - 1 };
        }

        // Search first zombie in range
        let target: Enemy | null = null;
        for (let i = 0; i < currentEnemies.length; i++) {
          const enemy = currentEnemies[i];
          const dx = enemy.x - tower.x;
          const dy = enemy.y - tower.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= tower.range) {
            target = enemy;
            break; 
          }
        }

        if (target) {
          const targetEnemy = target as Enemy;
          // Apply damage!
          currentEnemies = currentEnemies.map(e => {
            if (e.id === targetEnemy.id) {
              const updatedHp = e.hp - tower.damage;
              if (updatedHp <= 0) {
                // Defeated! Credit player & increase score
                currentCredits += e.reward;
                currentScore += Math.round(e.maxHp * 1.5);
                playSound(523.25, 'sine', 0.08); // high reward ping
                return null;
              } else {
                return {
                  ...e,
                  hp: updatedHp,
                  isSlowed: tower.type === 'proxy' ? true : e.isSlowed,
                  slowDuration: tower.type === 'proxy' ? 12 : e.slowDuration
                };
              }
            }
            return e;
          }).filter((e): e is Enemy => e !== null);

          // Add double-laser visual effect
          currentProjectiles.push({
            id: Math.random().toString(),
            startX: tower.x,
            startY: tower.y,
            endX: targetEnemy.x,
            endY: targetEnemy.y,
            color: tower.color,
            life: 2
          });

          if (tower.type === 'firewall') playSound(600, 'sine', 0.04);
          else if (tower.type === 'antivirus') playSound(280, 'triangle', 0.12);
          else playSound(900, 'sine', 0.03);

          return { ...tower, cooldown: tower.maxCooldown };
        }

        return tower;
      });

      // 4. Update projectiles visualizer
      setProjectiles(prev => {
        const remainingProjectiles = prev.map(p => ({ ...p, life: p.life - 1 })).filter(p => p.life > 0);
        return [...remainingProjectiles, ...currentProjectiles];
      });

      // 5. Check if Wave Clear
      if (currentEnemies.length === 0 && spawnQueue.current.length === 0 && currentWaveActive) {
        currentWaveActive = false;
        currentCredits += 60 + waveRef.current * 10;
        setWave(w => w + 1);
        playSound(493.88, 'sine', 0.35); // level up chord
      }

      // Update states
      setEnemies(currentEnemies);
      setTowers(currentTowers);
      setCredits(currentCredits);
      setScore(currentScore);
      setBaseHp(currentBaseHp);
      setWaveActive(currentWaveActive);

    }, 120);

    return () => {
      if (gameTickRef.current) clearInterval(gameTickRef.current);
    };
  }, [isPlaying, highScore]);

  return (
    <div className="space-y-6">
      {/* HUD Header - Playful Styled */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/30 font-mono text-xs shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col justify-center">
          <span className="text-emerald-400 font-extrabold tracking-widest text-[9px] uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            BUNKER SALUTE
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span 
                  key={i} 
                  className={`text-sm ${i < Math.ceil(baseHp / 2) ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}
                >
                  {getGameIcon('Heart', 'w-4 h-4 fill-current')}
                </span>
              ))}
            </div>
            <span className="font-extrabold text-white">({baseHp}/10 HP)</span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-amber-400 font-extrabold tracking-widest text-[9px] uppercase flex items-center gap-1">
            {getGameIcon('Coins', 'w-3.5 h-3.5 text-amber-400')}
            MONETE SURVIVAL
          </span>
          <span className="font-black text-base text-amber-300 mt-0.5">{credits} G</span>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-pink-400 font-extrabold tracking-widest text-[9px] uppercase flex items-center gap-1">
            {getGameIcon('Star', 'w-3.5 h-3.5 text-pink-400')}
            GIORNO SOPRAVVISSUTO
          </span>
          <span className="font-black text-base text-pink-300 mt-0.5">Giorno {wave}</span>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-cyan-400 font-extrabold tracking-widest text-[9px] uppercase flex items-center gap-1">
            {getGameIcon('Trophy', 'w-3.5 h-3.5 text-cyan-400')}
            PUNTI RECORD
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-black text-base text-cyan-300">{score}</span>
            <span className="text-[10px] text-cyan-500/75">(Record: {highScore})</span>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Arena Grid Board (9 columns for left) */}
        <div className="lg:col-span-9 bg-[#0b0c15] rounded-3xl border-4 border-slate-800 p-3 overflow-x-auto select-none relative shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
          {/* Subtle grid mesh background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          <div 
            className="grid gap-[3px] relative"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(42px, 1fr))`,
              gridTemplateRows: `repeat(${GRID_ROWS}, minmax(42px, 1fr))`
            }}
          >
            {/* Draw Path Layer & Construction Squares */}
            {Array.from({ length: GRID_ROWS }).map((_, rIndex) => (
              Array.from({ length: GRID_COLS }).map((_, cIndex) => {
                const isPath = isPathCell(cIndex, rIndex);
                const hasTower = towers.find(t => t.x === cIndex && t.y === rIndex);
                const isStart = TD_PATH[0][0] === cIndex && TD_PATH[0][1] === rIndex;
                const isEnd = TD_PATH[TD_PATH.length - 1][0] === cIndex && TD_PATH[TD_PATH.length - 1][1] === rIndex;

                const isHovered = hoveredCell?.x === cIndex && hoveredCell?.y === rIndex;
                const config = TOWER_TYPES[selectedBuildType];

                // Decide range visualization
                let showRange = false;
                let rangeValue = 0;
                let rangeColor = '#3b82f6';

                if (hasTower && isHovered) {
                  showRange = true;
                  rangeValue = hasTower.range;
                  rangeColor = hasTower.color;
                } else if (isHovered && !isPath && !isEnd && !hasTower) {
                  showRange = true;
                  rangeValue = config.range;
                  rangeColor = config.color;
                }

                return (
                  <div
                    key={`${cIndex}-${rIndex}`}
                    onClick={() => buildTower(cIndex, rIndex)}
                    onMouseEnter={() => setHoveredCell({ x: cIndex, y: rIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`aspect-square rounded-xl flex items-center justify-center relative cursor-pointer group transition-all text-xs ${
                      isPath 
                        ? 'bg-amber-950/20 border-2 border-amber-800/10 text-[10px] font-bold text-amber-600/45' 
                        : 'bg-slate-900/40 border border-slate-800/40 hover:border-purple-500/50 hover:bg-purple-950/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]'
                    }`}
                  >
                    {isPath && (
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-black tracking-widest pointer-events-none opacity-40">
                        {isStart ? 'IN' : isEnd ? 'BUNKER' : '•'}
                      </span>
                    )}

                    {/* Server render at output cell (Defensive Bunker Base) */}
                    {isEnd && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/30 text-rose-400 border-2 border-rose-500/50 rounded-xl z-10 animate-pulse pointer-events-none shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                        {getGameIcon('Server', 'w-6 h-6')}
                        <span className="text-[6px] uppercase font-black tracking-tight scale-90 mt-0.5">BUNKER</span>
                      </div>
                    )}

                    {/* Rendering a placed Turret Tower (Pure Vectors) */}
                    {hasTower && (
                      <div 
                        className="absolute inset-1 rounded-full flex flex-col items-center justify-center z-10 border-2 shadow-lg hover:scale-105 transition-transform"
                        style={{ backgroundColor: `${hasTower.color}15`, borderColor: hasTower.color }}
                        title={`${hasTower.name} (Lvl ${hasTower.level})`}
                      >
                        <span style={{ color: hasTower.color }}>
                          {getGameIcon(hasTower.icon, "w-4 h-4 shrink-0")}
                        </span>
                        <span className="text-[7px] font-black scale-90 mt-0.5" style={{ color: hasTower.color }}>L{hasTower.level}</span>
                        {/* Sell handle */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            sellTower(hasTower.id, hasTower.cost, hasTower.level);
                          }}
                          className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 bg-rose-600 rounded-full items-center justify-center text-white font-bold text-[8px] border border-white/20 hover:scale-120 hover:bg-rose-500 shadow-md"
                        >
                          x
                        </button>
                      </div>
                    )}

                    {/* Ghost preview of tower to be built */}
                    {isHovered && !isPath && !isEnd && !hasTower && (
                      <div className="absolute inset-1 rounded-full flex flex-col items-center justify-center z-10 border-2 border-dashed border-white/20 bg-white/5 opacity-50 pointer-events-none">
                        <span className="opacity-80">
                          {getGameIcon(config.icon, "w-4 h-4 text-white")}
                        </span>
                      </div>
                    )}

                    {/* Range Indicator */}
                    {showRange && (
                      <div 
                        className="absolute rounded-full border pointer-events-none z-40 animate-pulse"
                        style={{
                          width: `calc(${rangeValue} * 200%)`,
                          height: `calc(${rangeValue} * 200%)`,
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          borderColor: rangeColor,
                          backgroundColor: `${rangeColor}08`,
                          borderWidth: '2px',
                          borderStyle: 'dashed'
                        }}
                      />
                    )}
                  </div>
                );
              })
            ))}

            {/* Projectile Shot Laser overlays - Glowing Neon Beam Style */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              {projectiles.map(proj => {
                const startXPercent = ((proj.startX + 0.5) / GRID_COLS) * 100;
                const startYPercent = ((proj.startY + 0.5) / GRID_ROWS) * 100;
                const endXPercent = ((proj.endX + 0.5) / GRID_COLS) * 100;
                const endYPercent = ((proj.endY + 0.5) / GRID_ROWS) * 100;

                return (
                  <g key={proj.id}>
                    {/* Glowing outer aura beam */}
                    <line
                      x1={`${startXPercent}%`}
                      y1={`${startYPercent}%`}
                      x2={`${endXPercent}%`}
                      y2={`${endYPercent}%`}
                      stroke={proj.color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="opacity-40 animate-pulse"
                    />
                    {/* Inner hot white core */}
                    <line
                      x1={`${startXPercent}%`}
                      y1={`${startYPercent}%`}
                      x2={`${endXPercent}%`}
                      y2={`${endYPercent}%`}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Active Zombies Overlays (Pure vectors with custom animated glow) */}
            {enemies.map(enemy => {
              const leftPercent = ((enemy.x + 0.5) / GRID_COLS) * 100;
              const topPercent = ((enemy.y + 0.5) / GRID_ROWS) * 100;
              const hpPercent = (enemy.hp / enemy.maxHp) * 100;

              return (
                <div
                  key={enemy.id}
                  className="absolute z-30 flex flex-col items-center justify-center w-8 h-8 -ml-4 -mt-4 transition-all duration-100 ease-linear"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`
                  }}
                >
                  {/* Zombie label */}
                  <span className="text-[6px] font-black font-mono text-white/90 bg-slate-950/90 px-1 py-0.5 rounded border border-white/10 whitespace-nowrap mb-0.5 leading-none shadow-md">
                    {enemy.isSlowed ? '❄️ ' : ''}{enemy.name.split(' ')[0]}
                  </span>

                  {/* Character Avatar representing Zombie (No emojis) */}
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg animate-bounce" 
                    style={{ 
                      animationDuration: enemy.isSlowed ? '1.5s' : '0.6s',
                      backgroundColor: `${enemy.color}20`,
                      borderColor: enemy.color,
                      boxShadow: `0 0 10px ${enemy.color}40`
                    }}
                  >
                    {getGameIcon(enemy.icon, "w-4 h-4", { style: { color: enemy.color } })}
                  </div>

                  {/* Health Gauge */}
                  <div className="w-6 h-1 bg-black/70 rounded-full border border-white/10 mt-0.5 overflow-hidden">
                    <div 
                      className="h-full transition-all" 
                      style={{ 
                        width: `${hpPercent}%`, 
                        backgroundColor: enemy.hp < enemy.maxHp * 0.4 ? '#ef4444' : enemy.color 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Info (3 columns for right) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-widest border-b border-cyan-500/20 pb-2"> arsenale torrette</h3>
            <p className="text-white/60 text-[10px] leading-relaxed uppercase tracking-wider font-mono">
              Seleziona una torretta e posizionala sui nodi grigi liberi dell'arena.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(TOWER_TYPES) as Array<keyof typeof TOWER_TYPES>).map(type => {
                const config = TOWER_TYPES[type];
                const isSelected = selectedBuildType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedBuildType(type)}
                    className={`p-3 rounded-xl border-2 text-left font-mono text-xs flex flex-col transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-purple-500/10 to-purple-950/20 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                        : 'bg-slate-900/50 border-slate-800/80 text-white/50 hover:text-white/80 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-extrabold flex items-center gap-1.5">
                        <span style={{ color: config.color }}>{getGameIcon(config.icon, "w-4 h-4")}</span>
                        <span>{config.name}</span>
                      </span>
                      <span className={`font-black ${credits >= config.cost ? 'text-amber-400' : 'text-red-400'}`}>
                        {config.cost}G
                      </span>
                    </div>
                    <span className="text-[9px] text-white/40 font-sans mt-2 leading-relaxed">
                      {config.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-dashed border-slate-800 font-mono">
            {baseHp <= 0 ? (
              <div className="text-center p-4 bg-rose-950/30 border-2 border-rose-500/40 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <span className="text-rose-400 font-black text-sm uppercase block tracking-widest animate-pulse">GAME OVER</span>
                <span className="text-[10px] text-white/50 block mt-1 leading-relaxed">Gli zombie hanno distrutto il bunker delle provviste.</span>
                <button
                  onClick={resetGame}
                  className="mt-3 w-full py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold rounded-lg text-xs tracking-wider cursor-pointer transition-all uppercase shadow-lg shadow-rose-500/30"
                >
                  Riprova Livello
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={startWave}
                  disabled={waveActive || !isPlaying && baseHp <= 0}
                  className={`w-full py-3.5 rounded-xl text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all uppercase cursor-pointer ${
                    waveActive
                      ? 'bg-slate-900/60 border border-slate-800 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  <Play size={12} fill="currentColor" />
                  <span>Avvia Ondata {wave}</span>
                </button>

                {isPlaying && (
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="w-full py-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-white/80 font-bold text-[10px] tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    Metti in Pausa
                  </button>
                )}

                {!isPlaying && baseHp > 0 && enemies.length > 0 && (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-full py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] tracking-wider uppercase cursor-pointer animate-pulse"
                  >
                    Riprendi Difesa
                  </button>
                )}

                <button
                  onClick={resetGame}
                  className="w-full py-1.5 text-white/30 hover:text-rose-400 hover:border-rose-500/20 text-[9px] tracking-wider uppercase border border-transparent rounded-lg transition-all cursor-pointer"
                >
                  Reset Livello
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. CHROMA SIMON SYNTH (PATTERN RECALL)
// ==========================================
function ChromaSimonSynthGame({ muted }: { muted: boolean }) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'success' | 'failure'>('idle');
  const [activeFlash, setActiveFlash] = useState<number | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('matrix_high_score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const playSound = (freq: number, type: OscillatorType, duration: number) => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Start a new sequence/level
  const generateSequence = (currLevel: number) => {
    setGameState('showing');
    setPlayerSequence([]);
    
    const len = currLevel + 2;
    const newSeq: number[] = [];
    for (let i = 0; i < len; i++) {
      newSeq.push(Math.floor(Math.random() * 16)); // Random tile from 0 to 15
    }
    setSequence(newSeq);

    // Playback sequence visualization
    let i = 0;
    const interval = setInterval(() => {
      if (i < newSeq.length) {
        const tileIndex = newSeq[i];
        setActiveFlash(tileIndex);
        playSound(220 + (tileIndex * 35), 'sine', 0.22); // lovely synth pitches
        
        setTimeout(() => {
          setActiveFlash(null);
        }, 320);
        i++;
      } else {
        clearInterval(interval);
        setGameState('playing');
      }
    }, 550);
  };

  const startNewGame = () => {
    setLevel(1);
    setScore(0);
    generateSequence(1);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;

    // Flash tile clicked
    setActiveFlash(index);
    playSound(220 + (index * 35), 'sine', 0.16);
    setTimeout(() => setActiveFlash(null), 140);

    const nextPlayerSeq = [...playerSequence, index];
    setPlayerSequence(nextPlayerSeq);

    // Validate
    const checkIdx = nextPlayerSeq.length - 1;
    if (nextPlayerSeq[checkIdx] !== sequence[checkIdx]) {
      // Wrong choice
      setGameState('failure');
      playSound(130, 'sawtooth', 0.55); // low buzz
      return;
    }

    // Is sequence finished?
    if (nextPlayerSeq.length === sequence.length) {
      setGameState('success');
      const roundScore = level * 100;
      setScore(prev => {
        const updated = prev + roundScore;
        if (updated > highScore) {
          setHighScore(updated);
          localStorage.setItem('matrix_high_score', updated.toString());
        }
        return updated;
      });
      playSound(523.25, 'sine', 0.15); // high ding
      setTimeout(() => {
        playSound(659.25, 'sine', 0.2);
      }, 90);

      // Delay then next level
      setTimeout(() => {
        setLevel(prev => {
          const nextLvl = prev + 1;
          generateSequence(nextLvl);
          return nextLvl;
        });
      }, 1200);
    }
  };

  // Vivid Playful Colors for synthesizer pads
  const getPadColorClass = (idx: number, isFlashing: boolean) => {
    const row = Math.floor(idx / 4);
    if (isFlashing) {
      switch (row) {
        case 0: return 'bg-pink-400 border-pink-300 shadow-[0_0_20px_#f43f5e] scale-95';
        case 1: return 'bg-purple-400 border-purple-300 shadow-[0_0_20px_#a855f7] scale-95';
        case 2: return 'bg-cyan-400 border-cyan-300 shadow-[0_0_20px_#06b6d4] scale-95';
        default: return 'bg-amber-400 border-amber-300 shadow-[0_0_20px_#f59e0b] scale-95';
      }
    }

    switch (row) {
      case 0: return 'bg-pink-950/50 border-pink-500/30 text-pink-400/80 hover:bg-pink-900/30 hover:border-pink-400';
      case 1: return 'bg-purple-950/50 border-purple-500/30 text-purple-400/80 hover:bg-purple-900/30 hover:border-purple-400';
      case 2: return 'bg-cyan-950/50 border-cyan-500/30 text-cyan-400/80 hover:bg-cyan-900/30 hover:border-cyan-400';
      default: return 'bg-amber-950/50 border-amber-500/30 text-amber-400/80 hover:bg-amber-900/30 hover:border-amber-400';
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="font-mono text-xs font-black text-purple-300 uppercase tracking-widest flex items-center justify-center gap-2">
          {getGameIcon('Music', 'w-4 h-4 animate-bounce')} CHROMA SIMON SYNTH
        </h3>
        <p className="text-white/60 text-[10px] leading-relaxed uppercase tracking-wider font-mono">
          Ascolta, osserva e ripeti la melodia luminosa dei pad di memoria melodici!
        </p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900 border-2 border-purple-500/20 font-mono text-xs text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        <div>
          <span className="text-purple-400 font-extrabold block text-[9px] uppercase tracking-wider">LIVELLO</span>
          <span className="font-black text-sm text-purple-300">{level}</span>
        </div>
        <div>
          <span className="text-white/40 block text-[9px] uppercase tracking-wider">PUNTEGGIO</span>
          <span className="font-black text-sm text-white">{score}</span>
        </div>
        <div>
          <span className="text-amber-400 font-extrabold block text-[9px] uppercase tracking-wider">MIGLIORE</span>
          <span className="font-black text-sm text-amber-300">{highScore}</span>
        </div>
      </div>

      {/* Matrix board */}
      <div className="aspect-square bg-slate-950 rounded-3xl border-4 border-slate-800 p-4 relative flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
        <div className="grid grid-cols-4 gap-3 w-full h-full">
          {Array.from({ length: 16 }).map((_, index) => {
            const isFlashing = activeFlash === index;
            const isTarget = gameState === 'showing' && isFlashing;
            const isFailure = gameState === 'failure' && sequence[playerSequence.length - 1] === index;

            return (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={gameState !== 'playing'}
                className={`w-full aspect-square rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center ${
                  isTarget 
                    ? 'scale-95 shadow-lg' 
                    : isFailure 
                      ? 'bg-rose-600 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-shake scale-95'
                      : getPadColorClass(index, isFlashing)
                }`}
                style={{
                  transitionDuration: isTarget || isFlashing ? '60ms' : '220ms'
                }}
              >
                {/* Glowing tactile circle indicator inside the pad */}
                <span className={`w-3 h-3 rounded-full border border-white/20 transition-all ${isFlashing ? 'bg-white opacity-100 scale-125' : 'bg-white/10'}`} />
              </button>
            );
          })}
        </div>

        {/* Playful Status Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/90 rounded-2xl backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center animate-bounce">
              {getGameIcon('Music', 'w-8 h-8 text-purple-400')}
            </div>
            <p className="text-xs text-purple-300 leading-relaxed max-w-xs font-mono uppercase tracking-widest font-extrabold">
              Pronto a suonare la sequenza di note luminose?
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-purple-500/30"
            >
              Inizia Melodia
            </button>
          </div>
        )}

        {gameState === 'failure' && (
          <div className="absolute inset-0 bg-slate-950/95 rounded-2xl backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center animate-pulse">
              <AlertTriangle size={32} className="text-rose-400" />
            </div>
            <p className="text-sm font-black text-rose-400 font-mono uppercase tracking-widest">
              MELODIA INTERROTTA
            </p>
            <p className="text-[10px] text-white/50 max-w-xs leading-relaxed font-mono uppercase tracking-wide">
              Hai commesso un errore di sincronizzazione al livello {level}.
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg"
            >
              Riavvia Melodia
            </button>
          </div>
        )}

        {gameState === 'success' && (
          <div className="absolute inset-0 bg-purple-500/5 rounded-2xl backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="p-4 bg-slate-900/90 rounded-2xl border-2 border-emerald-500/50 flex items-center gap-2 animate-bounce shadow-xl">
              <Check size={18} className="text-emerald-400" />
              <span className="font-mono text-xs font-black text-emerald-400 uppercase tracking-widest">RIEPILOGO COMPLETO!</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center font-mono text-[9px] text-white/40 uppercase tracking-[0.25em] font-extrabold leading-relaxed h-4">
        {gameState === 'showing' && '=== RIPRODUZIONE MELODIA IN CORSO ==='}
        {gameState === 'playing' && `=== RIPETI NOTA: ${playerSequence.length} / ${sequence.length} ===`}
        {gameState === 'idle' && '=== STANDBY STRUMENTO ==='}
      </div>
    </div>
  );
}

// ==========================================
// 3. BUBBLE BLAST ARCADE (CODE TYPING GAME)
// ==========================================
interface FallingWord {
  id: string;
  word: string;
  x: number; // percentage width
  y: number; // percentage height
  speed: number;
}

function BubbleBlastGame({ muted }: { muted: boolean }) {
  const [words, setWords] = useState<FallingWord[]>([]);
  const [inputText, setInputText] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);

  // Playful retro game/fantasy keywords list (Replacing dry coding variables)
  const wordList = [
    'zombie', 'turret', 'shield', 'blast', 'arcade', 'brain', 'laser', 'matrix', 'crystal', 'player',
    'bubble', 'joystick', 'rocket', 'plasma', 'cyberpunk', 'retro', 'sound', 'synth', 'nebula', 'galaxy',
    'cosmic', 'slime', 'potion', 'sword', 'castle', 'dragon', 'wizard', 'dungeon', 'quest', 'victory'
  ];

  const loopRef = useRef<any>(null);
  const spawnRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('typing_high_score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const playSound = (freq: number, type: OscillatorType, duration: number) => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const startGame = () => {
    setWords([]);
    setInputText('');
    setScore(0);
    setLives(5);
    setLevel(1);
    setIsPlaying(true);
  };

  // Main game ticks loop
  useEffect(() => {
    if (!isPlaying) {
      if (loopRef.current) clearInterval(loopRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      return;
    }

    // Game update clock
    loopRef.current = setInterval(() => {
      setWords(prev => {
        const moved = prev.map(w => ({ ...w, y: w.y + w.speed }));
        
        // Find if any word hit the bottom (y >= 88)
        const hitBottom = moved.filter(w => w.y >= 88);
        if (hitBottom.length > 0) {
          setLives(curr => {
            const updated = curr - hitBottom.length;
            if (updated <= 0) {
              setIsPlaying(false);
              playSound(110, 'sawtooth', 0.6); // GameOver buzz
            } else {
              playSound(160, 'triangle', 0.22); // loss ping
            }
            return updated;
          });
        }

        return moved.filter(w => w.y < 88);
      });
    }, 100);

    // Spawning clock
    const baseSpawnRate = Math.max(1000, 2800 - level * 280);
    spawnRef.current = setInterval(() => {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      const id = Math.random().toString();
      const x = 12 + Math.random() * 66; // safe screen boundaries
      const speed = 1.0 + level * 0.22 + Math.random() * 0.4;

      setWords(prev => [...prev, { id, word: randomWord, x, y: 0, speed }]);
    }, baseSpawnRate);

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [isPlaying, level]);

  // Handle word input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.trim();
    setInputText(text);

    // Check if typed matches any active word
    const matched = words.find(w => w.word.toLowerCase() === text.toLowerCase());
    if (matched) {
      // Blast word!
      setWords(prev => prev.filter(w => w.id !== matched.id));
      setInputText('');
      playSound(800, 'sine', 0.08); // bubble pop high pitch
      setScore(sc => {
        const updated = sc + matched.word.length * 10;
        if (updated > highScore) {
          setHighScore(updated);
          localStorage.setItem('typing_high_score', updated.toString());
        }
        // Advance level for every 250 pts
        const nextLvl = Math.floor(updated / 250) + 1;
        if (nextLvl !== level) setLevel(nextLvl);
        return updated;
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-widest flex items-center justify-center gap-2">
          {getGameIcon('Keyboard', 'w-4 h-4 text-cyan-400')} BUBBLE BLAST ARCADE
        </h3>
        <p className="text-white/60 text-[10px] leading-relaxed uppercase tracking-wider font-mono">
          Digita velocemente le parole dentro le bolle fluttuanti prima che cadano sulla griglia!
        </p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-900 border-2 border-cyan-500/20 font-mono text-xs text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        <div>
          <span className="text-rose-400 font-extrabold block text-[9px] uppercase tracking-wider">CUORI</span>
          <div className="flex gap-0.5 justify-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < lives ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                {getGameIcon('Heart', 'w-3.5 h-3.5 fill-current')}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-cyan-400 font-extrabold block text-[9px] uppercase tracking-wider">VELOCITÀ</span>
          <span className="font-black text-sm text-cyan-300">Lv {level}</span>
        </div>
        <div>
          <span className="text-white/40 block text-[9px] uppercase tracking-wider">SCORE</span>
          <span className="font-black text-sm text-white">{score}</span>
        </div>
        <div>
          <span className="text-amber-400 font-extrabold block text-[9px] uppercase tracking-wider">HI-SCORE</span>
          <span className="font-black text-sm text-amber-300">{highScore}</span>
        </div>
      </div>

      {/* Falling Arena - Bouncy Bubble Popper aesthetic */}
      <div className="h-[330px] bg-[#0c0d16] border-4 border-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
        {/* Sky / Words containment box */}
        <div className="relative w-full h-full">
          {words.map(w => {
            const isLong = w.word.length > 7;
            return (
              <div
                key={w.id}
                className="absolute font-mono text-xs md:text-sm px-4 py-1.5 rounded-full border-2 text-white shadow-lg transition-all animate-bounce flex items-center gap-1"
                style={{
                  left: `${w.x}%`,
                  top: `${w.y}%`,
                  transform: 'translateX(-50%)',
                  background: isLong 
                    ? 'linear-gradient(to right, rgba(236, 72, 153, 0.25), rgba(168, 85, 247, 0.25))' 
                    : 'linear-gradient(to right, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))',
                  borderColor: isLong ? '#ec4899' : '#06b6d4',
                  boxShadow: isLong ? '0 4px 12px rgba(236,72,153,0.3)' : '0 4px 12px rgba(6,182,212,0.3)',
                  animationDuration: '1.2s'
                }}
              >
                {/* Visual Bubble ring accent */}
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-ping"></span>
                <span className="font-black uppercase tracking-wider">{w.word}</span>
              </div>
            );
          })}

          {/* Red warning border danger threshold */}
          <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-rose-500/30 border-dashed border-rose-500/30" />
        </div>

        {/* Input box */}
        <div className="w-full pt-4 border-t border-slate-800 z-10 flex items-center justify-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            disabled={!isPlaying}
            placeholder={isPlaying ? "Digita la parola e premi INVIO..." : "Clicca GIOCA per caricare la bolla"}
            className="w-full max-w-sm p-3 rounded-full bg-slate-900 border-2 border-slate-800 focus:border-cyan-400 outline-none text-center font-mono text-sm placeholder-white/20 text-white uppercase tracking-widest font-black shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]"
            autoFocus={isPlaying}
          />
        </div>

        {/* Game Standby Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/90 rounded-2xl backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center animate-bounce">
              {getGameIcon('Keyboard', 'w-8 h-8 text-cyan-400')}
            </div>
            <p className="text-xs text-cyan-300 leading-relaxed max-w-xs font-mono uppercase tracking-widest font-extrabold">
              Pronto a caricare il tracciatore di bolle?
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-extrabold text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-cyan-500/30"
            >
              GIOCA ORA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
