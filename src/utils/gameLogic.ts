export interface PerformanceRating {
  rank: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';
  title: string;
  badge: string;
  color: string; // Tailwind color class or hex
  borderColor: string;
  textColor: string;
  comment: string;
  percentile: string;
}

export function getPerformanceRating(averageMs: number): PerformanceRating {
  if (averageMs <= 185) {
    return {
      rank: 'SSS',
      title: 'CYBER GOD',
      badge: '⚡👑⚡',
      color: 'from-[#39FF88] to-[#00E5FF]',
      borderColor: 'border-[#39FF88]',
      textColor: 'text-[#39FF88]',
      comment: 'Beyond human limits! Esports cyborg reflexes.',
      percentile: 'Top 0.1% Globally',
    };
  }
  if (averageMs <= 215) {
    return {
      rank: 'SS',
      title: 'LIGHTNING REFLEX',
      badge: '⚡⚡⚡',
      color: 'from-[#00E5FF] to-[#39FF88]',
      borderColor: 'border-[#00E5FF]',
      textColor: 'text-[#00E5FF]',
      comment: 'Elite speed! You react faster than 99% of people.',
      percentile: 'Top 1% Reflexes',
    };
  }
  if (averageMs <= 250) {
    return {
      rank: 'S',
      title: 'WARP SPEED',
      badge: '⚡🔥',
      color: 'from-[#00E5FF] to-[#FF4FD8]',
      borderColor: 'border-[#00E5FF]',
      textColor: 'text-[#00E5FF]',
      comment: 'Pro gamer territory! Outstanding visual reaction speed.',
      percentile: 'Top 5% Reflexes',
    };
  }
  if (averageMs <= 290) {
    return {
      rank: 'A',
      title: 'SHARP SHOOTER',
      badge: '🎯✨',
      color: 'from-[#FF4FD8] to-[#00E5FF]',
      borderColor: 'border-[#FF4FD8]',
      textColor: 'text-[#FF4FD8]',
      comment: 'Very sharp! Above average human reaction time.',
      percentile: 'Top 20% Reflexes',
    };
  }
  if (averageMs <= 350) {
    return {
      rank: 'B',
      title: 'SOLID REFLEXES',
      badge: '⏱️👍',
      color: 'from-purple-400 to-indigo-400',
      borderColor: 'border-purple-400',
      textColor: 'text-purple-300',
      comment: 'Normal human reaction speed. Good consistency!',
      percentile: 'Average Human Range',
    };
  }
  if (averageMs <= 430) {
    return {
      rank: 'C',
      title: 'CASUAL REACTOR',
      badge: '🐢💤',
      color: 'from-amber-400 to-orange-400',
      borderColor: 'border-amber-400',
      textColor: 'text-amber-300',
      comment: 'A bit sluggish! Grab some water and focus your eyes.',
      percentile: 'Below Average',
    };
  }
  return {
    rank: 'D',
    title: 'SLEEPY SLOTH',
    badge: '🦥☕',
    color: 'from-rose-500 to-amber-500',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-400',
    comment: 'Did you fall asleep? Needs extra caffeine and a rematch!',
    percentile: 'Coffee Needed',
  };
}

export function getSingleTapRating(ms: number): { label: string; color: string } {
  if (ms < 190) return { label: 'GODLIKE! ⚡', color: 'text-[#39FF88]' };
  if (ms < 230) return { label: 'LIGHTNING! ⚡', color: 'text-[#00E5FF]' };
  if (ms < 280) return { label: 'GREAT SPEED! 🔥', color: 'text-[#FF4FD8]' };
  if (ms < 350) return { label: 'DECENT! 👍', color: 'text-emerald-300' };
  if (ms < 450) return { label: 'A BIT SLOW ⏱️', color: 'text-amber-300' };
  return { label: 'SLUGGISH 🦥', color: 'text-rose-400' };
}

export interface SessionStats {
  bestAverage: number | null;
  fastestTap: number | null;
  totalGames: number;
}

const STORAGE_KEY = 'flash_tap_session_stats';

export function loadSessionStats(): SessionStats {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return {
    bestAverage: null,
    fastestTap: null,
    totalGames: 0,
  };
}

export function saveSessionStats(stats: SessionStats): void {
  try {
    const serialized = JSON.stringify(stats);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore
  }
}

export function updateSessionWithGame(
  prev: SessionStats,
  currentAverage: number,
  currentFastest: number
): { updated: SessionStats; isNewBestAverage: boolean; isNewBestTap: boolean } {
  const isNewBestAverage = prev.bestAverage === null || currentAverage < prev.bestAverage;
  const isNewBestTap = prev.fastestTap === null || currentFastest < prev.fastestTap;

  const nextStats: SessionStats = {
    bestAverage: isNewBestAverage ? currentAverage : prev.bestAverage,
    fastestTap: isNewBestTap ? currentFastest : prev.fastestTap,
    totalGames: prev.totalGames + 1,
  };

  saveSessionStats(nextStats);

  return {
    updated: nextStats,
    isNewBestAverage,
    isNewBestTap,
  };
}
