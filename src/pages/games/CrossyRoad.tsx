import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Play, DollarSign, Trophy, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const RTP_TARGET = 0.97;

const RISK_SETTINGS = {
  low: {
    name: 'Low Risk',
    color: 'from-green-500 to-emerald-500',
    r: 1.15,
    p: RTP_TARGET / 1.15, // ≈ 0.8435
    description: 'Small multiplier, high survival chance'
  },
  medium: {
    name: 'Medium Risk',
    color: 'from-yellow-500 to-amber-500',
    r: 1.25,
    p: RTP_TARGET / 1.25, // ≈ 0.7760
    description: 'Medium multiplier, medium survival chance'
  },
  high: {
    name: 'High Risk',
    color: 'from-red-500 to-orange-500',
    r: 1.40,
    p: RTP_TARGET / 1.40, // ≈ 0.6929
    description: 'Big multiplier, low survival chance'
  }
} as const;

type RiskLevel = keyof typeof RISK_SETTINGS;

const CrossyRoad = () => {
  const { user, updateBalance, addBetHistory } = useUser();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'ended'>('setup');
  const [betAmount, setBetAmount] = useState(10);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [laneIndex, setLaneIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHit, setIsHit] = useState(false);

  const riskConfig = RISK_SETTINGS[riskLevel];
  const r = riskConfig.r;
  const p = riskConfig.p;

  // Compounding multiplier for each lane
  const getLane = (idx: number) => ({
    index: idx,
    multiplier: Number((r ** idx).toFixed(6)),
    amount: Number((betAmount * (r ** idx)).toFixed(2)),
    survival: Number((p ** idx).toFixed(4))
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

  // Hop forward, compounding multiplier and survival odds
  const moveRight = () => {
    if (gameState !== 'playing' || isAnimating || isHit) return;
    setIsAnimating(true);

    setTimeout(() => {
      const nextLane = laneIndex + 1;
      setLaneIndex(nextLane);
      setCurrentMultiplier(r ** nextLane);

      setTimeout(() => {
        const survived = Math.random() < p;
        if (!survived) {
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
      const winnings = getLane(laneIndex).amount;
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
              <p className="text-xl font-bold">{currentLane.multiplier.toFixed(2)}x</p>
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
                    {Object.entries(RISK_SETTINGS).map(([key, config]) => (
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
                  {riskConfig.description}
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
              <div className={`p-4 rounded-lg bg-gradient-to-r ${riskConfig.color} bg-opacity-20 mb-4`}>
                <h3 className="font-bold text-lg mb-2">{riskConfig.name}</h3>
                <p className="text-sm mb-3">{riskConfig.description}</p>
                <div className="space-y-2 text-sm">
                  <div>Compounding multiplier: ×{riskConfig.r.toFixed(2)} per hop</div>
                  <div>Survival chance per hop: {(riskConfig.p * 100).toFixed(2)}%</div>
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
                <div className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${riskConfig.color} bg-opacity-20`}>
                  {riskConfig.name}
                </div>
              </div>
              {/* Infinite Game Lanes */}
              <div className="relative bg-gray-800 rounded-lg p-8 h-40 flex items-center justify-between">
                {/* Dotted lane lines between circles */}
                {visibleLanes.map((lane, idx) => (
                  <React.Fragment key={lane.index}>
                    <div className="relative flex flex-col items-center justify-center w-1/6">
                      {/* Money Circle */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${idx === 0 ? 'bg-green-500' : 'bg-gray-700'} transition-all duration-300`}>
                        <span className="text-white font-bold text-lg">${lane.amount.toFixed(2)}</span>
                      </div>
                      {/* Chicken */}
                      {idx === 0 && (
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 text-3xl transition-all duration-300">
                          {isHit ? '💥🐔' : '🐔'}
                        </div>
                      )}
                      {/* Car animation only if hit and chicken is in this lane */}
                      {isHit && idx === 0 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 text-3xl animate-[car-down_0.7s_linear]">
                          🚗
                        </div>
                      )}
                    </div>
                    {/* Dotted line between circles, except after last */}
                    {idx < visibleLanes.length - 1 && (
                      <div className="h-20 w-0 border-r-2 border-dotted border-white opacity-60 mx-auto" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {/* Controls & Info */}
              <div className="flex flex-col md:flex-row gap-3 mt-4 items-center">
                {gameState === 'playing' && (
                  <>
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
                  </>
                )}
                {gameState === 'ended' && (
                  <Button onClick={resetGame} className="w-full" variant="casino">
                    Play Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Add car down animation keyframes */}
          <style>
            {`
              @keyframes car-down {
                0% { top: 0; opacity: 0; }
                20% { opacity: 1; }
                100% { top: 64px; opacity: 1; }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
};

export default CrossyRoad;