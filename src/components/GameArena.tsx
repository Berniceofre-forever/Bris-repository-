import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Zap, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getSingleTapRating } from '../utils/gameLogic';

interface GameArenaProps {
  currentRound: number;
  totalRounds: number;
  onRoundSuccess: (reactionMs: number) => void;
  onRestartRound: () => void;
  onTriggerParticles: (x?: number, y?: number, type?: 'go' | 'early' | 'fanfare') => void;
}

type ArenaState = 'WAITING' | 'GO' | 'TOO_EARLY' | 'ROUND_SUCCESS';

export const GameArena: React.FC<GameArenaProps> = ({
  currentRound,
  totalRounds,
  onRoundSuccess,
  onRestartRound,
  onTriggerParticles,
}) => {
  const [arenaState, setArenaState] = useState<ArenaState>('WAITING');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [foulCount, setFoulCount] = useState<number>(0);

  const waitTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isTapLockedRef = useRef<boolean>(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  // Arm the round with random delay (1000ms - 5000ms)
  const armRound = useCallback(() => {
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
    }
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    setArenaState('WAITING');
    setReactionMs(null);
    isTapLockedRef.current = false;

    // Random wait between 1.0s and 5.0s (1000 - 5000 ms)
    const randomDelay = Math.floor(Math.random() * 4000) + 1000;

    waitTimerRef.current = window.setTimeout(() => {
      // Trigger GO state
      startTimeRef.current = performance.now();
      setArenaState('GO');
      soundManager.playGoSignal();
    }, randomDelay);
  }, []);

  // Initialize on mount
  useEffect(() => {
    armRound();

    return () => {
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [armRound, currentRound]);

  // Handle tap anywhere
  const handleArenaTap = useCallback(
    (clientX?: number, clientY?: number) => {
      // Prevent double taps or taps during result preview
      if (isTapLockedRef.current) return;

      if (arenaState === 'WAITING') {
        // Player tapped too early!
        isTapLockedRef.current = true;
        if (waitTimerRef.current) {
          clearTimeout(waitTimerRef.current);
          waitTimerRef.current = null;
        }

        setArenaState('TOO_EARLY');
        setFoulCount((prev) => prev + 1);
        soundManager.playTooEarly();
        onTriggerParticles(clientX, clientY, 'early');

        // Automatically prepare to restart the round after 1.8s if player doesn't tap restart
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          onRestartRound();
        }, 1800);
      } else if (arenaState === 'GO') {
        // Player tapped on green!
        isTapLockedRef.current = true;
        const endTime = performance.now();
        const duration = Math.max(1, Math.round(endTime - startTimeRef.current));

        setReactionMs(duration);
        setArenaState('ROUND_SUCCESS');
        soundManager.playTapSuccess(duration);
        onTriggerParticles(clientX, clientY, 'go');

        // Auto advance to next round after 1.5s
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          onRoundSuccess(duration);
        }, 1500);
      } else if (arenaState === 'ROUND_SUCCESS' && reactionMs !== null) {
        // Player tapped to manually advance without waiting for auto-advance
        if (autoAdvanceTimerRef.current) {
          clearTimeout(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }
        onRoundSuccess(reactionMs);
      } else if (arenaState === 'TOO_EARLY') {
        // Player tapped to manually restart immediately
        if (autoAdvanceTimerRef.current) {
          clearTimeout(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }
        onRestartRound();
      }
    },
    [arenaState, onRoundSuccess, onRestartRound, onTriggerParticles, reactionMs]
  );

  // Keyboard support: Space or Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleArenaTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleArenaTap]);

  // Pointer down handler for instant touch reaction
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handleArenaTap(e.clientX, e.clientY);
  };

  const singleRating = reactionMs !== null ? getSingleTapRating(reactionMs) : null;

  return (
    <div
      onPointerDown={onPointerDown}
      className={`relative flex-1 w-full flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-colors duration-200 overflow-hidden ${
        arenaState === 'WAITING'
          ? 'bg-gradient-to-b from-[#3a0815] via-[#5c0d22] to-[#2b0510] border-4 border-red-500/80 neon-box-red'
          : arenaState === 'GO'
          ? 'bg-gradient-to-b from-[#09401f] via-[#127a3c] to-[#042410] border-4 border-[#39FF88] neon-box-green animate-flash-shock'
          : arenaState === 'TOO_EARLY'
          ? 'bg-gradient-to-b from-[#2a0614] via-[#450a22] to-[#1e040f] border-4 border-[#FF4FD8]/80 neon-box-pink'
          : 'bg-gradient-to-b from-[#0e2a3b] via-[#103a4f] to-[#0c1f2e] border-4 border-[#00E5FF]/80 neon-box-cyan'
      }`}
      role="button"
      tabIndex={0}
      aria-label="Reaction arena - tap when green"
    >
      {/* Background scanline/grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* WAITING STATE (RED SCREEN) */}
      {arenaState === 'WAITING' && (
        <div className="flex flex-col items-center justify-center z-10 animate-suspense">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-red-400/80 flex items-center justify-center mb-6 bg-red-950/60 shadow-[0_0_40px_rgba(255,42,77,0.7)] animate-pulse">
            <span className="w-12 h-12 rounded-full bg-red-500 animate-ping" />
          </div>

          <h2 className="font-display font-black text-4xl sm:text-6xl text-white tracking-wider drop-shadow-[0_0_20px_rgba(255,42,77,0.9)]">
            WAIT FOR GREEN...
          </h2>

          <p className="mt-4 font-tech text-base sm:text-xl text-red-200 tracking-wide">
            Steady your finger. DO NOT TAP YET!
          </p>

          <div className="mt-8 px-4 py-2 rounded-full bg-red-950/80 border border-red-500/40 text-xs font-mono text-red-300">
            Random signal incoming (1–5s)
          </div>
        </div>
      )}

      {/* GO STATE (NEON GREEN SCREEN) */}
      {arenaState === 'GO' && (
        <div className="flex flex-col items-center justify-center z-10">
          <div className="relative mb-6">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#39FF88] flex items-center justify-center bg-[#39FF88]/20 shadow-[0_0_60px_rgba(57,255,136,0.9)] animate-pulse">
              <Zap size={60} className="text-[#39FF88] fill-[#39FF88] animate-bounce" />
            </div>
          </div>

          <h2 className="font-display font-black text-6xl sm:text-8xl text-white tracking-tight drop-shadow-[0_0_30px_rgba(57,255,136,1)] neon-glow-green">
            TAP NOW! ⚡
          </h2>

          <p className="mt-4 font-tech text-lg sm:text-2xl text-[#39FF88] font-bold tracking-wider">
            TAP ANYWHERE ON SCREEN!
          </p>
        </div>
      )}

      {/* TOO EARLY STATE (FALSE START) */}
      {arenaState === 'TOO_EARLY' && (
        <div className="flex flex-col items-center justify-center z-10 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full border-2 border-rose-500 flex items-center justify-center mb-5 bg-rose-950/80 text-rose-400 shadow-[0_0_30px_rgba(255,79,216,0.6)]">
            <AlertTriangle size={40} className="animate-bounce" />
          </div>

          <h2 className="font-display font-black text-4xl sm:text-6xl text-rose-300 tracking-wider drop-shadow-[0_0_20px_rgba(255,42,77,0.9)]">
            TOO EARLY!
          </h2>

          <p className="mt-3 font-tech text-base sm:text-lg text-slate-200">
            You tapped before the green signal!
          </p>

          <p className="mt-1 font-tech text-xs text-[#FF4FD8]">
            Round {currentRound} is restarting...
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
              onRestartRound();
            }}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-[#FF4FD8] text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(255,79,216,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            TRY ROUND AGAIN
          </button>
        </div>
      )}

      {/* ROUND SUCCESS RESULT */}
      {arenaState === 'ROUND_SUCCESS' && reactionMs !== null && singleRating && (
        <div className="flex flex-col items-center justify-center z-10 max-w-md mx-auto">
          <div className="text-xs font-tech tracking-widest uppercase text-[#00E5FF] mb-2">
            Round {currentRound} Result
          </div>

          <div className="font-display font-black text-6xl sm:text-8xl text-white drop-shadow-[0_0_25px_rgba(0,229,255,0.9)] flex items-baseline justify-center gap-2">
            <span>{reactionMs}</span>
            <span className="text-2xl sm:text-3xl font-tech text-[#00E5FF]">ms</span>
          </div>

          <div className={`mt-3 font-display font-bold text-xl sm:text-2xl ${singleRating.color}`}>
            {singleRating.label}
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-tech text-slate-300 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-700">
            <span>Tap anywhere to continue</span>
            <ArrowRight size={14} className="text-[#00E5FF]" />
          </div>
        </div>
      )}
    </div>
  );
};
