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
  const [hopsCompleted, setHopsCompleted] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [cars, setCars] = useState<Array<{ id: number; lane: number; position: number; speed: number }>>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const gameLoopRef = useRef<number>();

  const riskConfigs: Record<RiskLevel, RiskConfig> = {
    low: {
      name: 'Low Risk',
      color: 'from-green-500 to-emerald-500',
      survivalRate: 0.73, // 73% survival rate for balanced RTP
      multiplierIncrease: 0.15,
      description: 'Fewer cars, safer crossing'
    },
    medium: {
      name: 'Medium Risk',
      color: 'from-yellow-500 to-amber-500',
      survivalRate: 0.58, // 58% survival rate for balanced RTP
      multiplierIncrease: 0.25,
      description: 'Moderate traffic, balanced risk'
    },
    high: {
      name: 'High Risk',
      color: 'from-red-500 to-orange-500',
      survivalRate: 0.38, // 38% survival rate for balanced RTP
      multiplierIncrease: 0.4,
      description: 'Heavy traffic, high rewards'
    }
  };

  const currentConfig = riskConfigs[riskLevel];
  const potentialWinnings = betAmount * currentMultiplier;

  // Generate cars based on risk level
  const generateCars = () => {
    const carCount = riskLevel === 'low' ? 3 : riskLevel === 'medium' ? 5 : 8;
    const newCars = [];
    
    for (let i = 0; i < carCount; i++) {
      newCars.push({
        id: Math.random(),
        lane: Math.floor(Math.random() * 6) + 1, // lanes 1-6
        position: Math.random() * 100,
        speed: riskLevel === 'low' ? 0.5 + Math.random() * 0.5 : 
               riskLevel === 'medium' ? 1 + Math.random() * 1 : 
               1.5 + Math.random() * 1.5
      });
    }
    
    setCars(newCars);
  };

  // Game loop for car movement
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = () => {
        setCars(prevCars => 
          prevCars.map(car => ({
            ...car,
            position: (car.position + car.speed) % 100
          }))
        );
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

  const startGame = () => {
    if (!user) return;
    if (betAmount > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    setGameState('playing');
    setCurrentMultiplier(1.0);
    setHopsCompleted(0);
    setPlayerPosition(0);
    generateCars();
    
    addBetHistory({
      game: 'Crossy Road',
      betAmount,
      result: 'loss', // Will update if they cash out
      payout: 0
    });
  };

  const hop = async () => {
    if (gameState !== 'playing' || isAnimating) return;
    
    setIsAnimating(true);
    
    // Check for collision with cars
    const collision = cars.some(car => {
      const carLane = car.lane;
      const carPos = car.position;
      const nextPlayerLane = playerPosition + 1;
      
      // Check if car is in the same lane and close enough to cause collision
      return carLane === nextPlayerLane && 
             carPos > 20 && carPos < 80; // Car is in collision zone
    });

    // Apply survival rate calculation
    const survivalCheck = Math.random() < currentConfig.survivalRate;
    
    setTimeout(() => {
      if (!collision && survivalCheck) {
        // Successful hop
        setPlayerPosition(prev => prev + 1);
        setHopsCompleted(prev => prev + 1);
        setCurrentMultiplier(prev => prev + currentConfig.multiplierIncrease);
        setIsAnimating(false);
      } else {
        // Hit by car - game over
        endGame(false);
      }
    }, 300);
  };

  const cashOut = () => {
    if (gameState === 'playing' && hopsCompleted > 0) {
      endGame(true);
    }
  };

  const endGame = (won: boolean) => {
    setGameState('ended');
    setIsAnimating(false);
    
    if (won) {
      const winnings = potentialWinnings;
      updateBalance(winnings);
      toast.success(`Cashed out $${winnings.toFixed(2)}!`);
      
      // Update bet history
      addBetHistory({
        game: 'Crossy Road',
        betAmount,
        result: 'win',
        payout: winnings
      });
    } else {
      toast.error("Got hit by a car! Better luck next time.");
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentMultiplier(1.0);
    setHopsCompleted(0);
    setPlayerPosition(0);
    setCars([]);
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/games">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">🐸 Crossy Road</h1>
          <p className="text-muted-foreground">Hop across traffic and cash out before getting hit!</p>
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
              <p className="text-sm text-muted-foreground">Hops Completed</p>
              <p className="text-xl font-bold">{hopsCompleted}</p>
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

              {/* Game Road */}
              <div className="relative bg-gray-800 rounded-lg p-4 h-96 overflow-hidden">
                {/* Road lanes */}
                {[1, 2, 3, 4, 5, 6].map(lane => (
                  <div key={lane} className="absolute w-full h-12 border-b border-yellow-400 border-dashed opacity-30"
                       style={{ top: `${lane * 60}px` }} />
                ))}

                {/* Player */}
                <div 
                  className={`absolute transition-all duration-300 text-2xl ${isAnimating ? 'scale-110' : ''}`}
                  style={{ 
                    bottom: `${playerPosition * 60 + 20}px`, 
                    left: '50%', 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  🐸
                </div>

                {/* Cars */}
                {cars.map(car => (
                  <div
                    key={car.id}
                    className="absolute text-xl transition-all duration-100"
                    style={{
                      top: `${car.lane * 60 + 15}px`,
                      left: `${car.position}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    🚗
                  </div>
                ))}

                {/* Finish line */}
                <div className="absolute top-0 w-full h-2 bg-green-400" />
              </div>

              {/* Controls */}
              {gameState === 'playing' && (
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={hop}
                    disabled={isAnimating}
                    className="flex-1"
                    variant="casino"
                  >
                    Hop Forward 🐸
                  </Button>
                  {hopsCompleted > 0 && (
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
        </div>
      )}
    </div>
  );
};

export default CrossyRoad;