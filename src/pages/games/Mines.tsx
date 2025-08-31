import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { toast } from 'sonner';
import { 
  Bomb, 
  Gem, 
  ArrowLeft, 
  DollarSign,
  Target,
  Zap
} from 'lucide-react';

const Mines = () => {
  const { user, updateBalance, addBetHistory } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'ended'>('setup');
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState<Array<'hidden' | 'safe' | 'bomb'>>(Array(25).fill('hidden'));
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [potentialWin, setPotentialWin] = useState(0);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-casino-red/20 to-casino-red/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bomb className="w-10 h-10 text-casino-red" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Mines</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Login to start playing this thrilling game of risk and reward
          </p>
          <Button variant="casino" onClick={() => setIsLoginOpen(true)}>
            Login to Play
          </Button>
        </div>
        
        <LoginDialog 
          open={isLoginOpen} 
          onOpenChange={setIsLoginOpen} 
        />
      </div>
    );
  }

  const calculateMultiplier = (revealed: number, mines: number) => {
    const safeSpaces = 25 - mines;
    if (revealed === 0) return 1;
    
    // Calculate multiplier based on revealed safe spaces
    let multiplier = 1;
    for (let i = 1; i <= revealed; i++) {
      multiplier *= (safeSpaces - i + 1) / (25 - i + 1);
    }
    return 1 / multiplier;
  };

  const startGame = () => {
    if (betAmount > user.balance) {
      toast.error('Insufficient balance!');
      return;
    }
    
    if (betAmount < 1) {
      toast.error('Minimum bet is $1');
      return;
    }

    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Generate mine positions
    const positions = [];
    while (positions.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    
    setMinePositions(positions);
    setGrid(Array(25).fill('hidden'));
    setRevealedCount(0);
    setCurrentMultiplier(1);
    setPotentialWin(betAmount);
    setGameState('playing');
    
    toast.success(`Game started! Find gems and avoid ${mineCount} bombs.`);
  };

  const revealTile = (index: number) => {
    if (gameState !== 'playing' || grid[index] !== 'hidden') return;
    
    const newGrid = [...grid];
    
    if (minePositions.includes(index)) {
      // Hit a mine - game over
      newGrid[index] = 'bomb';
      setGrid(newGrid);
      setGameState('ended');
      
      // Show all mines
      setTimeout(() => {
        const finalGrid = [...newGrid];
        minePositions.forEach(pos => {
          if (pos !== index) {
            finalGrid[pos] = 'bomb';
          }
        });
        setGrid(finalGrid);
      }, 500);
      
      addBetHistory({
        game: 'Mines',
        betAmount,
        result: 'loss',
        payout: 0
      });
      
      toast.error('💥 You hit a mine! Better luck next time.');
    } else {
      // Safe tile
      newGrid[index] = 'safe';
      setGrid(newGrid);
      
      const newRevealed = revealedCount + 1;
      setRevealedCount(newRevealed);
      
      const newMultiplier = calculateMultiplier(newRevealed, mineCount);
      setCurrentMultiplier(newMultiplier);
      setPotentialWin(betAmount * newMultiplier);
      
      toast.success('💎 Safe! Keep going or cash out.');
    }
  };

  const cashOut = () => {
    if (gameState !== 'playing' || revealedCount === 0) return;
    
    const winAmount = betAmount * currentMultiplier;
    updateBalance(winAmount);
    
    addBetHistory({
      game: 'Mines',
      betAmount,
      result: 'win',
      payout: winAmount
    });
    
    setGameState('ended');
    toast.success(`🎉 Cashed out for $${winAmount.toFixed(2)}!`);
  };

  const resetGame = () => {
    setGameState('setup');
    setGrid(Array(25).fill('hidden'));
    setMinePositions([]);
    setRevealedCount(0);
    setCurrentMultiplier(1);
    setPotentialWin(0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-casino-red/20 to-casino-red/5 rounded-lg flex items-center justify-center">
            <Bomb className="w-6 h-6 text-casino-red" />
          </div>
          <h1 className="text-4xl font-bold">Mines</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Navigate the minefield. Find gems, avoid bombs, cash out anytime!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Game Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance */}
          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-casino-gold" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${user.balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Bet Setup */}
          {gameState === 'setup' && (
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle>Game Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bet Amount</label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                    min={1}
                    max={user.balance}
                    step={0.01}
                    className="bg-secondary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mines ({mineCount})
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 5, 10, 15, 20].map(count => (
                      <Button
                        key={count}
                        variant={mineCount === count ? "casino" : "outline"}
                        size="sm"
                        onClick={() => setMineCount(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="casino" 
                  className="w-full" 
                  onClick={startGame}
                  disabled={betAmount > user.balance}
                >
                  <Target className="w-4 h-4" />
                  Start Game - ${betAmount.toFixed(2)}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Game Stats */}
          {gameState !== 'setup' && (
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle>Current Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bet Amount:</span>
                    <span className="font-medium">${betAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revealed:</span>
                    <span className="font-medium">{revealedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multiplier:</span>
                    <span className="font-medium text-casino-gold">
                      {currentMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Potential Win:</span>
                    <span className="text-success">${potentialWin.toFixed(2)}</span>
                  </div>
                </div>
                
                {gameState === 'playing' && revealedCount > 0 && (
                  <Button 
                    variant="success" 
                    className="w-full"
                    onClick={cashOut}
                  >
                    <Zap className="w-4 h-4" />
                    Cash Out ${potentialWin.toFixed(2)}
                  </Button>
                )}
                
                {gameState === 'ended' && (
                  <Button 
                    variant="casino" 
                    className="w-full"
                    onClick={resetGame}
                  >
                    Play Again
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
        </div>

        {/* Game Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto">
                {grid.map((tile, index) => (
                  <button
                    key={index}
                    className={`
                      aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-2xl
                      ${tile === 'hidden' 
                        ? 'border-border bg-secondary hover:border-primary hover:bg-secondary/80 cursor-pointer' 
                        : tile === 'safe'
                        ? 'border-success bg-success/20 text-success cursor-default'
                        : 'border-casino-red bg-casino-red/20 text-casino-red cursor-default animate-shake'
                      }
                      ${gameState !== 'playing' && tile === 'hidden' ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                    onClick={() => revealTile(index)}
                    disabled={gameState !== 'playing' || tile !== 'hidden'}
                  >
                    {tile === 'safe' && <Gem />}
                    {tile === 'bomb' && <Bomb />}
                  </button>
                ))}
              </div>
              
              {gameState === 'setup' && (
                <div className="text-center mt-6 text-muted-foreground">
                  Set your bet and mine count, then start the game!
                </div>
              )}
              
              {gameState === 'playing' && (
                <div className="text-center mt-6 text-muted-foreground">
                  Click tiles to reveal gems. Avoid the {mineCount} hidden mines!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Mines;