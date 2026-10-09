import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/audio';

interface CountdownScreenProps {
  round: number;
  totalRounds: number;
  onCountdownComplete: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  round,
  totalRounds,
  onCountdownComplete,
}) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    soundManager.playCountdown(3);

    const timer1 = setTimeout(() => {
      setCount(2);
      soundManager.playCountdown(2);
    }, 700);

    const timer2 = setTimeout(() => {
      setCount(1);
      soundManager.playCountdown(1);
    }, 1400);

    const timer3 = setTimeout(() => {
      onCountdownComplete();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onCountdownComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none w-full max-w-md mx-auto">
      <div className="text-slate-400 font-tech text-sm tracking-widest uppercase mb-4">
        Round {round} of {totalRounds}
      </div>

      <div className="relative flex items-center justify-center w-40 h-40 rounded-full border-2 border-[#00E5FF]/40 bg-[#17152E]/90 neon-box-cyan">
        <span
          key={count}
          className="font-display font-black text-7xl sm:text-8xl text-white drop-shadow-[0_0_20px_rgba(0,229,255,0.8)] animate-ping-once inline-block"
        >
          {count}
        </span>
      </div>

      <p className="mt-8 text-lg font-tech font-semibold tracking-wider text-[#00E5FF] animate-pulse">
        GET READY...
      </p>
      <p className="mt-1 text-xs text-slate-400 font-tech">
        Wait for the screen to turn green!
      </p>
    </div>
  );
};
