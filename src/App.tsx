/**
 * FLASH TAP! ⚡
 * Fast-reaction neon arcade mini game
 */

import React, { useState, useEffect, useCallback } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { GameArena } from './components/GameArena';
import { ResultsScreen } from './components/ResultsScreen';
import { ParticleBurst } from './components/ParticleBurst';
import { soundManager } from './utils/audio';
import {
  loadSessionStats,
  saveSessionStats,
  updateSessionWithGame,
  SessionStats,
} from './utils/gameLogic';

const TOTAL_ROUNDS = 10;

type GameState = 'WELCOME' | 'COUNTDOWN' | 'ARENA' | 'RESULTS';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('WELCOME');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.enabled);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(soundManager.hapticsEnabled);
  const [sessionStats, setSessionStats] = useState<SessionStats>(loadSessionStats());
  const [isNewBestAverage, setIsNewBestAverage] = useState<boolean>(false);
  const [isNewBestTap, setIsNewBestTap] = useState<boolean>(false);

  // Particle burst state
  const [particleTrigger, setParticleTrigger] = useState<{
    key: number;
    x?: number;
    y?: number;
    type?: 'go' | 'early' | 'fanfare';
  }>({
    key: 0,
    type: 'go',
  });

  const triggerParticles = useCallback(
    (x?: number, y?: number, type: 'go' | 'early' | 'fanfare' = 'go') => {
      setParticleTrigger((prev) => ({
        key: prev.key + 1,
        x,
        y,
        type,
      }));
    },
    []
  );

  const toggleSound = () => {
    const updated = soundManager.toggleSound();
    setSoundEnabled(updated);
  };

  const toggleHaptics = () => {
    const updated = soundManager.toggleHaptics();
    setHapticsEnabled(updated);
  };

  // Start new game
  const handleStartGame = () => {
    setRoundTimes([]);
    setCurrentRound(1);
    setIsNewBestAverage(false);
    setIsNewBestTap(false);
    setGameState('COUNTDOWN');
  };

  // Called when 3-2-1 countdown finishes
  const handleCountdownComplete = () => {
    setGameState('ARENA');
  };

  // Player tapped on green successfully
  const handleRoundSuccess = (reactionMs: number) => {
    const newTimes = [...roundTimes, reactionMs];
    setRoundTimes(newTimes);

    if (newTimes.length >= TOTAL_ROUNDS) {
      // Game Over: calculate final stats
      const totalMs = newTimes.reduce((acc, curr) => acc + curr, 0);
      const avgMs = Math.round(totalMs / TOTAL_ROUNDS);
      const fastest = Math.min(...newTimes);

      const { updated, isNewBestAverage: isNewAvg, isNewBestTap: isNewTap } =
        updateSessionWithGame(sessionStats, avgMs, fastest);

      setSessionStats(updated);
      setIsNewBestAverage(isNewAvg);
      setIsNewBestTap(isNewTap);

      soundManager.playFanfare();
      triggerParticles(undefined, undefined, 'fanfare');
      setGameState('RESULTS');
    } else {
      // Proceed to next round countdown
      setCurrentRound((prev) => prev + 1);
      setGameState('COUNTDOWN');
    }
  };

  // Player tapped too early -> restart current round
  const handleRestartRound = () => {
    setGameState('COUNTDOWN');
  };

  // Reset to welcome
  const handleAbortGame = () => {
    setGameState('WELCOME');
    setRoundTimes([]);
    setCurrentRound(1);
  };

  // Reset session records
  const handleResetSessionStats = () => {
    const fresh: SessionStats = {
      bestAverage: null,
      fastestTap: null,
      totalGames: 0,
    };
    saveSessionStats(fresh);
    setSessionStats(fresh);
  };

  return (
    <div className="min-h-screen w-full bg-[#17152E] text-slate-100 flex flex-col justify-between relative overflow-hidden arcade-grid-bg select-none">
      {/* Particle Canvas */}
      <ParticleBurst
        triggerKey={particleTrigger.key}
        x={particleTrigger.x}
        y={particleTrigger.y}
        colorType={particleTrigger.type}
      />

      {/* Header with logo, sounds, round indicator */}
      <HeaderBar
        currentRound={currentRound}
        totalRounds={TOTAL_ROUNDS}
        gameState={gameState}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        hapticsEnabled={hapticsEnabled}
        onToggleHaptics={toggleHaptics}
        onResetGame={gameState !== 'WELCOME' ? handleAbortGame : undefined}
        sessionBestAverage={sessionStats.bestAverage}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full relative z-10">
        {gameState === 'WELCOME' && (
          <WelcomeScreen
            onStartGame={handleStartGame}
            sessionStats={sessionStats}
          />
        )}

        {gameState === 'COUNTDOWN' && (
          <CountdownScreen
            round={currentRound}
            totalRounds={TOTAL_ROUNDS}
            onCountdownComplete={handleCountdownComplete}
          />
        )}

        {gameState === 'ARENA' && (
          <GameArena
            currentRound={currentRound}
            totalRounds={TOTAL_ROUNDS}
            onRoundSuccess={handleRoundSuccess}
            onRestartRound={handleRestartRound}
            onTriggerParticles={triggerParticles}
          />
        )}

        {gameState === 'RESULTS' && (
          <ResultsScreen
            roundTimes={roundTimes}
            sessionStats={sessionStats}
            isNewBestAverage={isNewBestAverage}
            isNewBestTap={isNewBestTap}
            onPlayAgain={handleStartGame}
            onResetSessionStats={handleResetSessionStats}
          />
        )}
      </main>

      {/* Footer info (quiet, clean) */}
      <footer className="w-full py-2.5 px-4 text-center text-[11px] font-tech text-slate-500 z-10">
        FLASH TAP! ⚡ Neon Reaction Arcade · 10 Rounds Challenge · Millisecond Precision
      </footer>
    </div>
  );
}
