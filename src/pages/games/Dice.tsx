import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { toast } from 'sonner';
import { 
  Dices, 
  ArrowLeft, 
  DollarSign,
  Target,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const Dice = () => {
  const { user, updateBalance, addBetHistory } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [rollUnder, setRollUnder] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<'win' | 'loss' | null>(null);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Dices className="w-10 h-10 text-neon-blue" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Dice</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Login to start rolling the dice and winning big!
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

  // Calculate win chance and payout multiplier
  const winChance = rollUnder - 1; // 1-99
  const payoutMultiplier = winChance > 0 ? (100 / winChance) * 0.98 : 0; // 2% house edge
  const potentialWin = betAmount * payoutMultiplier;

  const rollDice = async () => {
    if (betAmount > user.balance) {
      toast.error('Insufficient balance!');
      return;
    }
    
    if (betAmount < 1) {
      toast.error('Minimum bet is $1');
      return;
    }

    if (winChance <= 0 || winChance >= 99) {
      toast.error('Invalid roll target!');
      return;
    }

    setIsRolling(true);
    
    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Simulate rolling animation delay
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 100) + 1; // 1-100
      const won = roll < rollUnder;
      
      setLastRoll(roll);
      setLastResult(won ? 'win' : 'loss');
      setIsRolling(false);
      
      if (won) {
        const winAmount = betAmount * payoutMultiplier;
        updateBalance(winAmount);
        
        addBetHistory({
          game: 'Dice',
          betAmount,
          result: 'win',
          payout: winAmount
        });
        
        toast.success(`🎉 You won $${winAmount.toFixed(2)}! Rolled ${roll}`);
      } else {
        addBetHistory({
          game: 'Dice',
          betAmount,
          result: 'loss',
          payout: 0
        });
        
        toast.error(`💥 You lost! Rolled ${roll}`);
      }
    }, 1500);
  };

  const resetGame = () => {
    setLastRoll(null);
    setLastResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 rounded-lg flex items-center justify-center">
            <Dices className="w-6 h-6 text-neon-blue" />
          </div>
          <h1 className="text-4xl font-bold">Dice</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Set your target, place your bet, and roll for big wins!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Game Controls */}
        <div className="space-y-6">
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
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Bet Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  disabled={isRolling}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Roll Under</label>
                  <div className="text-lg font-bold text-neon-blue">{rollUnder}</div>
                </div>
                <Slider
                  value={[rollUnder]}
                  onValueChange={(value) => setRollUnder(value[0])}
                  min={2}
                  max={99}
                  step={1}
                  disabled={isRolling}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>50</span>
                  <span>99</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Game Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Win Chance:</span>
                <span className="font-medium text-success">{winChance}%</span>
              </div>
              <div className="flex justify-between">
                <span>Payout:</span>
                <span className="font-medium text-casino-gold">
                  {payoutMultiplier.toFixed(4)}x
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Potential Win:</span>
                <span className="text-success">${potentialWin.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
        </div>

        {/* Dice Game Area */}
        <div className="space-y-6">
          {/* Dice Display */}
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-8">
              <div className="text-center">
                <div className={`
                  w-32 h-32 mx-auto mb-6 rounded-2xl flex items-center justify-center text-6xl font-bold border-4
                  ${isRolling 
                    ? 'border-neon-blue bg-neon-blue/10 text-neon-blue animate-spin-slow' 
                    : lastResult === 'win'
                    ? 'border-success bg-success/10 text-success'
                    : lastResult === 'loss'
                    ? 'border-casino-red bg-casino-red/10 text-casino-red'
                    : 'border-border bg-secondary text-muted-foreground'
                  }
                `}>
                  {isRolling ? (
                    <Dices className="w-16 h-16" />
                  ) : lastRoll !== null ? (
                    lastRoll
                  ) : (
                    '?'
                  )}
                </div>
                
                <div className="space-y-2 mb-6">
                  {isRolling ? (
                    <div className="text-lg font-medium text-neon-blue animate-pulse">
                      Rolling...
                    </div>
                  ) : lastRoll !== null ? (
                    <>
                      <div className={`text-2xl font-bold ${
                        lastResult === 'win' ? 'text-success' : 'text-casino-red'
                      }`}>
                        {lastResult === 'win' ? '🎉 You Won!' : '💥 You Lost!'}
                      </div>
                      <div className="text-muted-foreground">
                        Rolled {lastRoll}, needed under {rollUnder}
                      </div>
                    </>
                  ) : (
                    <div className="text-lg text-muted-foreground">
                      Ready to roll!
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Button 
                    variant="casino" 
                    size="xl"
                    className="w-full"
                    onClick={rollDice}
                    disabled={isRolling || betAmount > user.balance}
                  >
                    <Target className="w-5 h-5" />
                    {isRolling ? 'Rolling...' : `Roll Dice - $${betAmount.toFixed(2)}`}
                  </Button>
                  
                  {(lastRoll !== null || lastResult !== null) && !isRolling && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={resetGame}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Set your bet amount and choose a "roll under" target (2-99)</p>
              <p>• Higher targets = better win chance but lower payouts</p>
              <p>• Lower targets = worse win chance but higher payouts</p>
              <p>• If the dice rolls under your target, you win!</p>
              <p>• House edge: 2% (built into payout calculations)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dice;