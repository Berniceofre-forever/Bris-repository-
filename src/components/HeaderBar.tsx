import React from 'react';
import { Volume2, VolumeX, Smartphone, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderBarProps {
  currentRound: number;
  totalRounds: number;
  gameState: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  onResetGame?: () => void;
  sessionBestAverage: number | null;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentRound,
  totalRounds,
  gameState,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
  onToggleHaptics,
  onResetGame,
  sessionBestAverage,
}) => {
  const isPlaying = ['COUNTDOWN', 'WAITING', 'GO', 'ROUND_RESULT', 'TOO_EARLY'].includes(gameState);

  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between z-30 select-none">
      {/* Brand logo & Round tracker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[#00E5FF] font-display font-black text-xl tracking-wider">
            FLASH<span className="text-[#39FF88]">TAP</span>
          </span>
          <span className="text-[#FF4FD8] font-bold text-lg animate-pulse">⚡</span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-700/60">
            <span className="text-xs text-slate-400 font-tech uppercase tracking-wider">
              Round
            </span>
            <span className="font-display font-bold text-sm text-[#00E5FF]">
              {currentRound}
              <span className="text-slate-500 font-normal">/{totalRounds}</span>
            </span>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {sessionBestAverage !== null && !isPlaying && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#17152E]/80 border border-slate-700/50 text-xs">
            <span className="text-slate-400 font-tech">Best Avg:</span>
            <span className="text-[#39FF88] font-display font-bold">{sessionBestAverage}ms</span>
          </div>
        )}

        {/* Sound toggle */}
        <button
          type="button"
          onClick={() => {
            onToggleSound();
          }}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-slate-800/80 border-[#00E5FF]/40 text-[#00E5FF] hover:border-[#00E5FF] hover:shadow-[0_0_10px_rgba(0,229,255,0.4)]'
              : 'bg-slate-900/60 border-slate-700 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Haptics toggle (on mobile supported) */}
        {'vibrate' in navigator && (
          <button
            type="button"
            onClick={onToggleHaptics}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              hapticsEnabled
                ? 'bg-slate-800/80 border-[#FF4FD8]/40 text-[#FF4FD8] hover:border-[#FF4FD8] hover:shadow-[0_0_10px_rgba(255,79,216,0.4)]'
                : 'bg-slate-900/60 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            title={hapticsEnabled ? 'Haptics Enabled' : 'Haptics Disabled'}
            aria-label="Toggle Haptic Vibration"
          >
            <Smartphone size={18} />
          </button>
        )}

        {/* Abort / Restart round button during gameplay */}
        {isPlaying && onResetGame && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onResetGame();
            }}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-400/50 hover:bg-slate-800/80 transition-all cursor-pointer"
            title="Abandon Game"
            aria-label="Abandon Game"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
