import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Play, DollarSign, Trophy, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type RiskLevel = 'low' | 'medium' | 'high';

interface RiskConfig {
  name: string;
  color: string;
  survivalRate: number;
  multiplierIncrease: number;
  description: string;
}

const CrossyRoad = () => {
  const { user, updateBalance, addBetHistory } = useUser();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'ended'>('setup');
  const [betAmount, setBetAmount] = useState(10);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [laneIndex, setLaneIndex] = useState(0); // horizontal position
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [jumping, setJumping] = useState(false);

  const riskConfigs: Record<RiskLevel, RiskConfig> = {
    low: {
      name: 'Low Risk',
      color: 'from-green-500 to-emerald-500',
      survivalRate: 0.73,
      multiplierIncrease: 0.15,
      description: 'Fewer cars, safer crossing'
    },
    medium: {
      name: 'Medium Risk',
      color: 'from-yellow-500 to-amber-500',
      survivalRate: 0.58,
      multiplierIncrease: 0.25,
      description: 'Moderate traffic, balanced risk'
    },
    high: {
      name: 'High Risk',
      color: 'from-red-500 to-orange-500',
      survivalRate: 0.38,
      multiplierIncrease: 0.4,
      description: 'Heavy traffic, high rewards'
    }
  };

  const currentConfig = riskConfigs[riskLevel];

  // Infinite lanes: dynamically calculate lane data based on laneIndex
  const getLane = (idx: number) => ({
    index: idx,
    multiplier: 1 + currentConfig.multiplierIncrease * (idx + 1),
    amount: betAmount * (1 + currentConfig.multiplierIncrease * (idx + 1))
  });

  const visibleLanes = Array.from({ length: 6 }, (_, i) => getLane(laneIndex + i));
  const currentLane = getLane(laneIndex);

  const potentialWinnings = currentLane.amount;

  const startGame = () => {
    if (!user) return;
    if (betAmount > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }
    updateBalance(-betAmount);
    setGameState('playing');
    setLaneIndex(0);
    setCurrentMultiplier(1.0);
    setIsHit(false);
    addBetHistory({
      game: 'Crossy Road',
      betAmount,
      result: 'loss',
      payout: 0
    });
  };

  // Hop forward, random hit logic with jump animation
  const moveRight = () => {
    if (gameState !== 'playing' || isAnimating || isHit) return;
    setIsAnimating(true);
    setJumping(true);

    // Animate chicken jump
    setTimeout(() => {
      setJumping(false);
      setLaneIndex(prev => prev + 1);
      setCurrentMultiplier(getLane(laneIndex + 1).multiplier);

      // Animate circles sliding down
      setTimeout(() => {
        const survivalCheck = Math.random() < currentConfig.survivalRate;
        if (!survivalCheck) {
          setIsHit(true);
          setTimeout(() => {
            endGame(false);
          }, 700);
        } else {
          setIsAnimating(false);
        }
      }, 350);
    }, 350);
  };

  const cashOut = () => {
    if (gameState === 'playing' && laneIndex > 0 && !isHit) {
      endGame(true);
    }
  };

  const endGame = (won: boolean) => {
    setGameState('ended');
    setIsAnimating(false);
    if (won) {
      const winnings = lanes[laneIndex].amount;
      updateBalance(winnings);
      toast.success(`Cashed out $${winnings.toFixed(2)}!`);
      addBetHistory({
        game: 'Crossy Road',
        betAmount,
        result: 'win',
        payout: winnings
      });
    } else {
      toast.error("You got hit! Better luck next time.");
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentMultiplier(1.0);
    setLaneIndex(0);
    setIsHit(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Please log in to play Crossy Road</h1>
        <Link to="/games">
          <Button variant="outline">Back to Games</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/games">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">🐔 Crossy Road</h1>
          <p className="text-muted-foreground">Move sideways across lanes and cash out before getting hit!</p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-xl font-bold">${user.balance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-muted-foreground">Current Multiplier</p>
              <p className="text-xl font-bold">{currentMultiplier.toFixed(2)}x</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-muted-foreground">Lane</p>
              <p className="text-xl font-bold">{laneIndex + 1}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Setup */}
      {gameState === 'setup' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bet Amount</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={user.balance}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Risk Level</label>
                <Select value={riskLevel} onValueChange={(value) => setRiskLevel(value as RiskLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(riskConfigs).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.color}`} />
                          {config.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentConfig.description}
                </p>
              </div>

              <Button 
                onClick={startGame}
                className="w-full"
                disabled={betAmount > user.balance}
                variant="casino"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game (${betAmount})
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>Risk Level Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg bg-gradient-to-r ${currentConfig.color} bg-opacity-20 mb-4`}>
                <h3 className="font-bold text-lg mb-2">{currentConfig.name}</h3>
                <p className="text-sm mb-3">{currentConfig.description}</p>
                <div className="space-y-2 text-sm">
                  <div>Multiplier increase: +{currentConfig.multiplierIncrease}x per hop</div>
                  <div>Survival rate: ~{Math.round(currentConfig.survivalRate * 100)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Board */}
      {(gameState === 'playing' || gameState === 'ended') && (
        <div className="space-y-6">
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  Potential Winnings: ${potentialWinnings.toFixed(2)}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${currentConfig.color} bg-opacity-20`}>
                  {currentConfig.name}
                </div>
              </div>
              {/* Infinite Game Lanes with animation */}
              <div
                className={`relative bg-gray-800 rounded-lg p-8 h-40 flex items-center justify-between overflow-hidden`}
                style={{
                  transition: 'transform 0.35s cubic-bezier(.4,2,.6,1)',
                  transform: jumping ? 'translateY(40px)' : 'translateY(0)'
                }}
              >
                {visibleLanes.map((lane, idx) => (
                  <div key={lane.index} className="relative flex flex-col items-center justify-center w-1/6">
                    {/* Money Circle */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${idx === 0 ? 'bg-green-500' : 'bg-gray-700'} transition-all duration-300`}>
                      <span className="text-white font-bold text-lg">${lane.amount.toFixed(2)}</span>
                    </div>
                    {/* Chicken */}
                    {idx === 0 && (
                      <div
                        className={`absolute top-16 left-1/2 -translate-x-1/2 text-3xl transition-all duration-300`}
                        style={{
                          transition: 'transform 0.35s cubic-bezier(.4,2,.6,1)',
                          transform: jumping ? 'translateY(-40px) scale(1.2)' : 'translateY(0) scale(1)'
                        }}
                      >
                        {isHit ? '💥🐔' : '🐔'}
                      </div>
                    )}
                    {/* Car animation only if hit and chicken is in this lane */}
                    {isHit && idx === 0 && (
                      <div className="absolute top-16 left-0 text-3xl animate-[car-sweep_0.7s_linear]">
                        🚗
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Controls */}
              {gameState === 'playing' && (
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={moveRight}
                    disabled={isAnimating || isHit}
                    className="flex-1"
                    variant="casino"
                  >
                    Move Right 🐔
                  </Button>
                  {laneIndex > 0 && !isHit && (
                    <Button 
                      onClick={cashOut}
                      variant="success"
                      className="flex-1"
                    >
                      Cash Out (${potentialWinnings.toFixed(2)})
                    </Button>
                  )}
                </div>
              )}
              {gameState === 'ended' && (
                <div className="mt-4">
                  <Button onClick={resetGame} className="w-full" variant="casino">
                    Play Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Add car sweep animation keyframes */}
          <style>
            {`
              @keyframes car-sweep {
                0% { left: 0; opacity: 0; }
                20% { opacity: 1; }
                100% { left: 80px; opacity: 1; }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
};

export default CrossyRoad;