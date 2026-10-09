import React, { useState } from 'react';
import { RotateCcw, Trophy, Zap, Share2, Check, Award, TrendingUp, Sparkles } from 'lucide-react';
import { getPerformanceRating, SessionStats } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';

interface ResultsScreenProps {
  roundTimes: number[];
  sessionStats: SessionStats;
  isNewBestAverage: boolean;
  isNewBestTap: boolean;
  onPlayAgain: () => void;
  onResetSessionStats: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  roundTimes,
  sessionStats,
  isNewBestAverage,
  isNewBestTap,
  onPlayAgain,
  onResetSessionStats,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const totalMs = roundTimes.reduce((acc, curr) => acc + curr, 0);
  const averageMs = Math.round(totalMs / roundTimes.length);
  const fastestMs = Math.min(...roundTimes);
  const slowestMs = Math.max(...roundTimes);
  const spreadMs = slowestMs - fastestMs;

  const fastestRoundIndex = roundTimes.indexOf(fastestMs);
  const rating = getPerformanceRating(averageMs);

  const handleShare = async () => {
    soundManager.playClick();
    const shareText = `⚡ FLASH TAP! Reaction Speed\n👑 Rank: ${rating.rank} - ${rating.title}\n⏱️ Avg: ${averageMs}ms | Fastest: ${fastestMs}ms\nCan you beat my reaction time? ⚡`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center justify-center select-none z-20">
      {/* New Record Banner if beaten */}
      {(isNewBestAverage || isNewBestTap) && (
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF4FD8]/20 via-[#00E5FF]/20 to-[#39FF88]/20 border border-[#00E5FF] text-white text-xs font-display tracking-wider animate-pulse shadow-[0_0_20px_rgba(0,229,255,0.4)]">
          <Sparkles size={14} className="text-[#39FF88]" />
          <span>NEW SESSION RECORD ACHIEVED!</span>
          <Sparkles size={14} className="text-[#FF4FD8]" />
        </div>
      )}

      {/* Main Results Card */}
      <div className="w-full bg-[#17152E]/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#39FF88]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <div className="text-xs font-tech uppercase tracking-widest text-slate-400">
            Session Performance Summary (10 Rounds)
          </div>

          {/* Average Reaction Time */}
          <div className="mt-3 flex items-baseline justify-center gap-2">
            <span className="font-display font-black text-6xl sm:text-7xl text-white tracking-tight drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]">
              {averageMs}
            </span>
            <span className="text-2xl sm:text-3xl font-tech font-bold text-[#00E5FF]">
              ms
            </span>
          </div>
          <div className="text-xs font-tech text-slate-300">AVERAGE REACTION TIME</div>

          {/* Rank Badge */}
          <div className="mt-6 flex flex-col items-center">
            <div
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl border-2 ${rating.borderColor} bg-slate-900/80 shadow-[0_0_25px_rgba(0,229,255,0.3)]`}
            >
              <span className="text-2xl">{rating.badge}</span>
              <div className="text-left">
                <div className="text-[10px] font-tech text-slate-400 leading-none">
                  RANK {rating.rank} · {rating.percentile}
                </div>
                <div className={`font-display font-black text-lg sm:text-xl ${rating.textColor}`}>
                  {rating.title}
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 font-tech max-w-sm">
              {rating.comment}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-tech text-slate-400 uppercase flex items-center justify-center gap-1">
              <Zap size={13} className="text-[#39FF88]" /> Fastest
            </div>
            <div className="mt-1 font-display font-black text-xl sm:text-2xl text-[#39FF88]">
              {fastestMs} <span className="text-xs font-tech text-slate-400">ms</span>
            </div>
            <div className="text-[10px] text-slate-500 font-tech">Round #{fastestRoundIndex + 1}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-tech text-slate-400 uppercase flex items-center justify-center gap-1">
              <TrendingUp size={13} className="text-[#FF4FD8]" /> Slowest
            </div>
            <div className="mt-1 font-display font-black text-xl sm:text-2xl text-[#FF4FD8]">
              {slowestMs} <span className="text-xs font-tech text-slate-400">ms</span>
            </div>
            <div className="text-[10px] text-slate-500 font-tech">Spread: ±{spreadMs}ms</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[11px] font-tech text-slate-400 uppercase flex items-center justify-center gap-1">
              <Trophy size={13} className="text-[#00E5FF]" /> Best Ever
            </div>
            <div className="mt-1 font-display font-black text-xl sm:text-2xl text-[#00E5FF]">
              {sessionStats.bestAverage || averageMs}{' '}
              <span className="text-xs font-tech text-slate-400">ms</span>
            </div>
            <div className="text-[10px] text-slate-500 font-tech">This Session</div>
          </div>
        </div>

        {/* 10-Round Visual Bar Breakdown */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-tech text-slate-400 mb-2.5">
            <span>Round Breakdown</span>
            <span>Fastest highlighted in green</span>
          </div>

          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 items-end h-28 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            {roundTimes.map((time, idx) => {
              const isFastest = idx === fastestRoundIndex;
              // Normalize bar height between 20% and 100%
              const minTime = Math.min(...roundTimes);
              const maxTime = Math.max(...roundTimes);
              const range = maxTime - minTime || 1;
              const heightPercent = 25 + ((time - minTime) / range) * 75;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover/touch */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                    {time}ms
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t transition-all duration-500 ${
                      isFastest
                        ? 'bg-[#39FF88] shadow-[0_0_12px_rgba(57,255,136,0.8)]'
                        : 'bg-gradient-to-t from-slate-700 to-[#00E5FF]/80 hover:bg-[#00E5FF]'
                    }`}
                  />
                  <span className="mt-1 text-[9px] font-mono text-slate-400">
                    R{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          {/* PLAY AGAIN BUTTON */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full flex-1 relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#39FF88] p-[2px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.7)]"
          >
            <div className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#17152E] group-hover:bg-[#17152E]/80 transition-all">
              <RotateCcw size={18} className="text-[#00E5FF] group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-display font-black text-base sm:text-lg tracking-wider text-white group-hover:text-[#00E5FF]">
                PLAY AGAIN
              </span>
            </div>
          </button>

          {/* Share score */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-tech font-bold text-sm transition-all cursor-pointer hover:border-[#FF4FD8]/50"
            title="Copy score to clipboard"
          >
            {copied ? (
              <>
                <Check size={18} className="text-[#39FF88]" />
                <span className="text-[#39FF88]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={18} className="text-[#FF4FD8]" />
                <span>Share Score</span>
              </>
            )}
          </button>
        </div>

        {/* Reset session link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              if (window.confirm('Reset all session high scores and records?')) {
                onResetSessionStats();
              }
            }}
            className="text-[11px] font-tech text-slate-500 hover:text-slate-400 underline transition-colors cursor-pointer"
          >
            Reset Session Records
          </button>
        </div>
      </div>
    </div>
  );
};
