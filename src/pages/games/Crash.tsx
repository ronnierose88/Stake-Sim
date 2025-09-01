import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';

type GameState = 'waiting' | 'running' | 'crashed';

export default function Crash() {
  const { user, updateBalance, addBetHistory } = useUser();
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0);
  const [gameHistory, setGameHistory] = useState<number[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const gameStartTime = useRef<number>(0);

  // Generate crash point (1.00 to 50.00x with weighted probability)
  const generateCrashPoint = (): number => {
    const random = Math.random();
    if (random < 0.5) return 1 + Math.random() * 1.5; // 1.00-2.50 (50% chance)
    if (random < 0.8) return 2.5 + Math.random() * 2.5; // 2.50-5.00 (30% chance)
    if (random < 0.95) return 5 + Math.random() * 10; // 5.00-15.00 (15% chance)
    return 15 + Math.random() * 35; // 15.00-50.00 (5% chance)
  };

  const startGame = () => {
    if (!user) return;
    
    if (betAmount <= 0 || betAmount > user.balance) {
      toast.error('Invalid bet amount');
      return;
    }

    // Deduct bet amount
    updateBalance(-betAmount);
    
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    setGameState('running');
    setMultiplier(1.00);
    setHasPlacedBet(true);
    setHasCashedOut(false);
    setCashOutMultiplier(0);
    gameStartTime.current = Date.now();

    // Start multiplier increase
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - gameStartTime.current) / 1000;
      const currentMultiplier = 1 + Math.pow(elapsed * 0.1, 1.5);
      
      if (currentMultiplier >= newCrashPoint) {
        // Game crashed
        setMultiplier(newCrashPoint);
        setGameState('crashed');
        
        if (!hasCashedOut) {
          addBetHistory({
            game: 'Crash',
            betAmount,
            result: 'loss',
            payout: 0
          });
          toast.error(`Crashed at ${newCrashPoint.toFixed(2)}x! You lost $${betAmount.toFixed(2)}`);
        }
        
        setGameHistory(prev => [newCrashPoint, ...prev.slice(0, 9)]);
        clearInterval(intervalRef.current);
        
        setTimeout(() => {
          setGameState('waiting');
          setHasPlacedBet(false);
          setHasCashedOut(false);
        }, 3000);
      } else {
        setMultiplier(currentMultiplier);
      }
    }, 50);
  };

  const cashOut = () => {
    if (gameState !== 'running' || hasCashedOut) return;
    
    const winAmount = betAmount * multiplier;
    updateBalance(winAmount);
    setHasCashedOut(true);
    setCashOutMultiplier(multiplier);
    
    addBetHistory({
      game: 'Crash',
      betAmount,
      result: 'win',
      payout: winAmount
    });
    
    toast.success(`Cashed out at ${multiplier.toFixed(2)}x! Won $${winAmount.toFixed(2)}`);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="bg-gradient-card border-border max-w-md mx-auto">
          <CardContent className="p-6">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground">Please login to play Crash</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          <Zap className="w-8 h-8 inline mr-2" />
          Crash
        </h1>
        <p className="text-muted-foreground">
          Watch the multiplier rise and cash out before it crashes!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Crash Game</span>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-muted-foreground">
                    {gameState === 'crashed' ? 'CRASHED!' : gameState === 'running' ? 'RUNNING' : 'WAITING'}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Multiplier Display */}
              <div className="text-center py-12 mb-6">
                <div className={`text-8xl font-bold mb-4 ${
                  gameState === 'crashed' ? 'text-red-400' : 
                  gameState === 'running' ? 'text-green-400 animate-pulse' : 
                  'text-muted-foreground'
                }`}>
                  {multiplier.toFixed(2)}x
                </div>
                
                {gameState === 'crashed' && (
                  <div className="text-2xl text-red-400 font-bold animate-bounce">
                    💥 CRASHED!
                  </div>
                )}
                
                {hasCashedOut && (
                  <div className="text-lg text-green-400">
                    ✅ Cashed out at {cashOutMultiplier.toFixed(2)}x
                  </div>
                )}
              </div>

              {/* Graph Area */}
              <div className="h-32 bg-black/20 rounded-lg mb-6 border border-border relative overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-center p-4">
                  <div 
                    className={`h-full bg-gradient-primary rounded transition-all duration-100 ${
                      gameState === 'running' ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      width: `${Math.min(100, (multiplier - 1) * 20)}%`,
                      background: gameState === 'crashed' ? 
                        'linear-gradient(to top, #ef4444, #dc2626)' : 
                        'linear-gradient(to top, #10b981, #059669)'
                    }}
                  />
                </div>
              </div>

              {/* Game History */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Recent Crashes</h3>
                <div className="flex gap-2 flex-wrap">
                  {gameHistory.map((crash, index) => (
                    <div 
                      key={index}
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        crash < 2 ? 'bg-red-500/20 text-red-400' :
                        crash < 5 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {crash.toFixed(2)}x
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Game Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bet Amount</label>
                <Input
                  type="number"
                  min="1"
                  max={user.balance}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={gameState !== 'waiting'}
                  className="bg-background"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(Math.floor(betAmount / 2))}
                  disabled={gameState !== 'waiting'}
                >
                  1/2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(Math.min(user.balance, betAmount * 2))}
                  disabled={gameState !== 'waiting'}
                >
                  2x
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(user.balance)}
                  disabled={gameState !== 'waiting'}
                >
                  Max
                </Button>
              </div>

              {gameState === 'waiting' && !hasPlacedBet && (
                <Button 
                  variant="casino" 
                  className="w-full" 
                  onClick={startGame}
                  disabled={betAmount <= 0 || betAmount > user.balance}
                >
                  Place Bet ${betAmount.toFixed(2)}
                </Button>
              )}

              {gameState === 'running' && hasPlacedBet && !hasCashedOut && (
                <Button 
                  variant="default" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={cashOut}
                >
                  Cash Out ${(betAmount * multiplier).toFixed(2)}
                </Button>
              )}

              {(gameState === 'crashed' || hasCashedOut) && (
                <Button 
                  variant="casino" 
                  className="w-full" 
                  disabled
                >
                  Next Round Starting...
                </Button>
              )}

              <div className="text-center p-3 bg-gradient-accent rounded-lg">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-lg font-bold">${user.balance.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}