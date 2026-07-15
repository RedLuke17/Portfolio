import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Award, Shield, Key, Sparkles, AlertCircle, Gamepad2 } from 'lucide-react';

export default function ArcadeGame() {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'normale' | 'difficile'>('normale');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Game assets and loop references
  const shipPos = useRef({ x: 150, y: 180 });
  const bullets = useRef<{ x: number; y: number; id: number }[]>([]);
  const asteroids = useRef<{ x: number; y: number; speed: number; size: number; id: number }[]>([]);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[]>([]);
  const keysPressed = useRef<Record<string, boolean>>({});

  // Mouse/Touch controls
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'running' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    // Keep ship inside bounds
    shipPos.current.x = Math.max(15, Math.min(rect.width - 15, relativeX));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'running' || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    shipPos.current.x = Math.max(15, Math.min(rect.width - 15, relativeX));
  };

  // Shoot trigger
  const fireBullet = () => {
    if (gameState !== 'running') return;
    bullets.current.push({
      x: shipPos.current.x,
      y: shipPos.current.y - 12,
      id: Math.random()
    });
  };

  const handleCanvasClick = () => {
    fireBullet();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        fireBullet();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Create explosion particles
  const createExplosion = (x: number, y: number, color = '#22c55e') => {
    for (let i = 0; i < 12; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        size: Math.random() * 3 + 1.5,
        alpha: 1
      });
    }
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'running') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset loop assets on start
    bullets.current = [];
    asteroids.current = [];
    particles.current = [];
    shipPos.current = { x: canvas.width / 2, y: canvas.height - 30 };

    let frameCount = 0;
    const astSpawnRate = difficulty === 'normale' ? 45 : 25;

    const gameLoop = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const starX = (Math.sin(i * 1234.5) + 1) * canvas.width / 2;
        const starY = ((frameCount * (1 + (i % 3) * 0.5) + i * 50) % canvas.height);
        ctx.fillRect(starX, starY, 1.5, 1.5);
      }

      // Keyboard movement check
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
        shipPos.current.x = Math.max(15, shipPos.current.x - 5);
      }
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
        shipPos.current.x = Math.min(canvas.width - 15, shipPos.current.x + 5);
      }

      // 1. Draw Player Spaceship (Sleek vector custom triangle design)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#22c55e';
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(shipPos.current.x, shipPos.current.y - 12); // nose
      ctx.lineTo(shipPos.current.x - 10, shipPos.current.y + 10); // wing left
      ctx.lineTo(shipPos.current.x + 10, shipPos.current.y + 10); // wing right
      ctx.closePath();
      ctx.fill();

      // Thruster flare
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(shipPos.current.x - 4, shipPos.current.y + 10);
      ctx.lineTo(shipPos.current.x + 4, shipPos.current.y + 10);
      ctx.lineTo(shipPos.current.x, shipPos.current.y + 16 + (Math.sin(frameCount) * 4));
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // 2. Spawn Asteroids
      if (frameCount % astSpawnRate === 0) {
        asteroids.current.push({
          x: Math.random() * (canvas.width - 30) + 15,
          y: -20,
          speed: Math.random() * 1.5 + (difficulty === 'difficile' ? 1.5 : 1),
          size: Math.random() * 12 + 8,
          id: Math.random()
        });
      }

      // 3. Move and Draw Bullets
      bullets.current.forEach((b, index) => {
        b.y -= 6;
        ctx.fillStyle = '#60a5fa';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#3b82f6';
        ctx.fillRect(b.x - 1.5, b.y, 3, 10);
        ctx.shadowBlur = 0;

        // Remove out of screen bullets
        if (b.y < -10) bullets.current.splice(index, 1);
      });

      // 4. Move and Draw Asteroids
      asteroids.current.forEach((ast, astIndex) => {
        ast.y += ast.speed;
        
        // Draw asteroid (Rocky detailed circle)
        ctx.fillStyle = '#4b5563';
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Craggy detail inside
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(ast.x - ast.size/3, ast.y - ast.size/3, ast.size/4, 0, Math.PI * 2);
        ctx.fill();

        // Collision Check: Bullet meets Asteroid
        bullets.current.forEach((bul, bulIndex) => {
          const dx = bul.x - ast.x;
          const dy = bul.y - ast.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ast.size + 3) {
            // Hit!
            createExplosion(ast.x, ast.y, '#3b82f6');
            bullets.current.splice(bulIndex, 1);
            asteroids.current.splice(astIndex, 1);
            setScore(prev => {
              const next = prev + 10;
              if (next > highScore) setHighScore(next);
              return next;
            });
          }
        });

        // Collision Check: Asteroid meets Spaceship
        const shipDx = ast.x - shipPos.current.x;
        const shipDy = ast.y - shipPos.current.y;
        const shipDist = Math.sqrt(shipDx * shipDx + shipDy * shipDy);

        if (shipDist < ast.size + 10) {
          // Player hit!
          createExplosion(shipPos.current.x, shipPos.current.y, '#ef4444');
          asteroids.current.splice(astIndex, 1);
          setLives(prev => {
            const next = prev - 1;
            if (next <= 0) {
              setGameState('gameover');
            }
            return next;
          });
        }

        // Out of screen asteroids
        if (ast.y > canvas.height + 20) {
          asteroids.current.splice(astIndex, 1);
        }
      });

      // 5. Draw and Fade Particles
      particles.current.forEach((p, pIndex) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (p.alpha <= 0) particles.current.splice(pIndex, 1);
      });
      ctx.globalAlpha = 1; // reset alpha

      // Recursive call
      if (gameState === 'running') {
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, difficulty]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameState('running');
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full filter blur-[80px] pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Descriptions and Game Info */}
        <div className="lg:col-span-5 space-y-5">
          <div className="border-b border-gray-800 pb-3">
            <h4 className="font-display font-bold text-lg text-white">Arcade Game Sviluppato da Me</h4>
            <p className="text-xs font-mono text-gray-500">Un vero e proprio motore arcade 2D scritto da zero per testare le abilità logiche.</p>
          </div>

          <div className="space-y-4 text-xs font-mono text-gray-300">
            <p className="leading-relaxed">
              Nel 2026 ho canalizzato la mia passione per i videogiochi programmando simulatori e giochi 2D/3D in C# utilizzando Unity e Godot. 
            </p>

            <div className="p-3.5 rounded-lg bg-gray-950 border border-gray-850 space-y-3">
              <h5 className="font-bold text-brand-400 flex items-center gap-1.5 uppercase text-[10px]">
                <Key size={12} />
                <span>Controlli di Gioco</span>
              </h5>
              <div className="space-y-1.5 text-gray-400">
                <div className="flex justify-between">
                  <span>Mouse / Touch:</span>
                  <span className="text-white font-semibold">Trascina destra / sinistra</span>
                </div>
                <div className="flex justify-between">
                  <span>Spara:</span>
                  <span className="text-white font-semibold">Click sinistro o SPAZIO</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasti Tastiera:</span>
                  <span className="text-white font-semibold">A/D o Frecce per muoverti</span>
                </div>
              </div>
            </div>

            {/* Game Difficulty selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Livello Difficoltà</label>
              <div className="flex gap-2">
                {(['normale', 'difficile'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-1 px-2 rounded text-[10px] text-center border font-bold uppercase tracking-wider cursor-pointer ${
                      difficulty === diff 
                        ? 'bg-brand-900/40 text-brand-400 border-brand-500/40' 
                        : 'bg-gray-950 text-gray-500 border-gray-850 hover:text-gray-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: HTML5 Canvas Gaming viewport */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[360px] aspect-[4/3] rounded-xl overflow-hidden border border-gray-800 bg-[#0b0f19] shadow-2xl">
            {/* Top Stats Overlay Panel */}
            <div className="absolute top-0 left-0 right-0 bg-gray-950/70 backdrop-blur-md px-3.5 py-2 flex justify-between items-center z-10 font-mono text-[11px] text-gray-300 border-b border-gray-800/50">
              <div className="flex gap-1.5">
                <span>PUNTI:</span>
                <span className="text-brand-400 font-bold">{score}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i < lives ? 'bg-red-500 animate-pulse' : 'bg-gray-800'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <span>HI-SCORE:</span>
                <span className="text-yellow-400 font-bold">{highScore}</span>
              </div>
            </div>

            {/* Canvas screen */}
            <canvas
              ref={canvasRef}
              width={360}
              height={200}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onClick={handleCanvasClick}
              className="w-full h-full cursor-crosshair block"
            />

            {/* Idle state overlay */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-3 rounded-full bg-brand-500/10 text-brand-400 animate-bounce">
                  <Gamepad2 size={32} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-display font-bold text-white text-base">Meteore 2026: Game Dev Edition</h5>
                  <p className="text-[10px] font-mono text-gray-500">Gioca subito per testare il motore grafico 2D</p>
                </div>
                <button
                  onClick={startGame}
                  className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold font-mono text-xs shadow-lg shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={12} fill="currentColor" />
                  <span>AVVIA GIOCO</span>
                </button>
              </div>
            )}

            {/* Game Over state overlay */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-2.5 rounded-full bg-red-500/10 text-red-500">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-display font-bold text-red-400 text-base">MISSIONE FALLITA</h5>
                  <p className="text-[10px] font-mono text-gray-500">Hai concluso le vite della navicella</p>
                </div>
                <div className="bg-gray-900 px-3 py-1.5 rounded border border-gray-800 font-mono text-[11px] text-gray-300">
                  PUNTEGGIO FINALE: <span className="text-brand-400 font-bold">{score}</span>
                </div>
                <button
                  onClick={startGame}
                  className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-gray-950 font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>RIGIOCA</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
