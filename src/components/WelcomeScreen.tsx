import React from 'react';
import { Zap, Play, Trophy, ShieldAlert, Award, Keyboard } from 'lucide-react';
import { SessionStats } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';

interface WelcomeScreenProps {
  onStartGame: () => void;
  sessionStats: SessionStats;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartGame,
  sessionStats,
}) => {
  const handleStart = () => {
    soundManager.playClick();
    onStartGame();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full text-center relative z-20">
      {/* Arcade Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#17152E] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-tech tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
        <Zap size={14} className="text-[#39FF88]" />
        High-Precision Reflex Challenge
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4FD8] animate-ping" />
      </div>

      {/* Main Title */}
      <div className="relative mb-6">
        <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]">
          FLASH <span className="text-[#00E5FF]">TAP</span>
          <span className="text-[#39FF88] inline-block ml-1 animate-bounce">!</span>
          <span className="text-[#FF4FD8] ml-2 text-4xl sm:text-6xl">⚡</span>
        </h1>
        <p className="mt-3 text-slate-300 font-tech text-base sm:text-lg max-w-md mx-auto">
          Test your human visual reaction limits across 10 intense rounds.
        </p>
      </div>

      {/* Glowing START Button */}
      <div className="w-full max-w-xs my-6">
        <button
          type="button"
          onClick={handleStart}
          className="w-full relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#39FF88] p-[2px] transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:shadow-[0_0_45px_rgba(0,229,255,0.8)]"
        >
          <div className="relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-[#17152E] transition-all group-hover:bg-[#17152E]/85">
            <Play
              size={24}
              className="text-[#00E5FF] fill-[#00E5FF] group-hover:text-[#39FF88] group-hover:fill-[#39FF88] transition-colors"
            />
            <span className="font-display font-black text-xl tracking-wider text-white group-hover:text-[#00E5FF] transition-colors">
              START GAME
            </span>
          </div>
        </button>
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-slate-400 text-xs font-tech">
          <Keyboard size={13} className="text-slate-500" />
          <span>Tap anywhere or press Spacebar</span>
        </div>
      </div>

      {/* How It Works Card */}
      <div className="w-full mt-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 text-left backdrop-blur-sm">
        <h3 className="font-display text-xs tracking-wider uppercase text-[#00E5FF] font-bold mb-3 flex items-center gap-2">
          <span>⚡ Rules of Engagement</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#17152E] border border-red-500/30 flex flex-col justify-between">
            <div>
              <div className="text-rose-400 font-display font-bold mb-1 flex items-center gap-1.5">
                <ShieldAlert size={14} /> 1. Red Alert
              </div>
              <p className="text-slate-300 font-tech">
                Screen turns RED. Steady your finger and wait 1–5 seconds.
              </p>
            </div>
            <div className="mt-2 text-[10px] text-rose-400/80 font-mono">
              Don&apos;t tap early!
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#17152E] border border-[#39FF88]/30 flex flex-col justify-between">
            <div>
              <div className="text-[#39FF88] font-display font-bold mb-1 flex items-center gap-1.5">
                <Zap size={14} /> 2. Neon Flash
              </div>
              <p className="text-slate-300 font-tech">
                The instant it turns NEON GREEN, TAP as fast as humanly possible!
              </p>
            </div>
            <div className="mt-2 text-[10px] text-[#39FF88]/80 font-mono">
              Measured in ms
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#17152E] border border-[#FF4FD8]/30 flex flex-col justify-between">
            <div>
              <div className="text-[#FF4FD8] font-display font-bold mb-1 flex items-center gap-1.5">
                <Award size={14} /> 3. Reflex Rank
              </div>
              <p className="text-slate-300 font-tech">
                Survive 10 rounds to unlock your final average and cyber tier rank.
              </p>
            </div>
            <div className="mt-2 text-[10px] text-[#FF4FD8]/80 font-mono">
              10 Rounds Total
            </div>
          </div>
        </div>
      </div>

      {/* Session Records (if any) */}
      {sessionStats.totalGames > 0 && (
        <div className="w-full mt-4 flex items-center justify-around p-3 rounded-xl bg-[#17152E]/90 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-[#FF4FD8]" />
            <div className="text-left">
              <div className="text-[10px] font-tech text-slate-400 uppercase">Session Best Avg</div>
              <div className="font-display font-bold text-sm text-[#39FF88]">
                {sessionStats.bestAverage !== null ? `${sessionStats.bestAverage} ms` : '--'}
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-700/60" />

          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#00E5FF]" />
            <div className="text-left">
              <div className="text-[10px] font-tech text-slate-400 uppercase">Fastest Single Tap</div>
              <div className="font-display font-bold text-sm text-[#00E5FF]">
                {sessionStats.fastestTap !== null ? `${sessionStats.fastestTap} ms` : '--'}
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-700/60 hidden sm:block" />

          <div className="hidden sm:block text-left">
            <div className="text-[10px] font-tech text-slate-400 uppercase">Runs Completed</div>
            <div className="font-display font-bold text-sm text-slate-200">
              {sessionStats.totalGames}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
