import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, Target } from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';
type RowCount = 8 | 12 | 16 | 20;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
}

const PAYOUTS: Record<RiskLevel, Record<RowCount, number[]>> = {
  low: {
    8:  [5, 2, 1.5, 1.2, 1.1, 1.2, 1.5, 2, 5],
    12: [7, 3, 2, 1.5, 1.2, 1.1, 1.1, 1.2, 1.5, 2, 3, 7],
    16: [10, 4, 3, 2, 1.5, 1.2, 1.1, 1.05, 1.05, 1.1, 1.2, 1.5, 2, 3, 4, 10],
    20: [15, 6, 4, 3, 2, 1.5, 1.2, 1.1, 1.05, 1.02, 1.02, 1.05, 1.1, 1.2, 1.5, 2, 3, 4, 6, 15]
  },
  medium: {
    8:  [15, 5, 2, 1.2, 0.8, 1.2, 2, 5, 15],
    12: [25, 10, 5, 2, 1.2, 0.9, 0.9, 1.2, 2, 5, 10, 25],
    16: [50, 15, 8, 4, 2, 1.2, 0.8, 0.6, 0.6, 0.8, 1.2, 2, 4, 8, 15, 50],
    20: [100, 25, 12, 6, 3, 2, 1.2, 0.9, 0.7, 0.5, 0.5, 0.7, 0.9, 1.2, 2, 3, 6, 12, 25, 100]
  },
  high: {
    8:  [30, 10, 3, 1.2, 0.4, 1.2, 3, 10, 30],
    12: [75, 20, 10, 4, 2, 0.5, 0.5, 2, 4, 10, 20, 75],
    16: [200, 40, 20, 8, 3, 1.5, 0.3, 0.2, 0.2, 0.3, 1.5, 3, 8, 20, 40, 200],
    20: [500, 100, 40, 15, 8, 4, 2, 1, 0.4, 0.2, 0.2, 0.4, 1, 2, 4, 8, 15, 40, 100, 500]
  }
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400'
};

const RISK_DESCRIPTIONS: Record<RiskLevel, Record<RowCount, string>> = {
  low: {
    8: 'Low Risk (1x - 2x)',
    12: 'Low Risk (1x - 3x)',
    16: 'Low Risk (1x - 4x)',
    20: 'Low Risk (1x - 5x)'
  },
  medium: {
    8: 'Medium Risk (1x - 10x)',
    12: 'Medium Risk (0.5x - 15x)',
    16: 'Medium Risk (1x - 20x)',
    20: 'Medium Risk (1x - 30x)'
  },
  high: {
    8: 'High Risk (0.5x - 50x)',
    12: 'High Risk (0.5x - 100x)',
    16: 'High Risk (0.5x - 250x)',
    20: 'High Risk (0.5x - 500x)'
  }
};

export default function Plinko() {
  const { user, updateBalance, addBetHistory } = useUser();
  const [betAmount, setBetAmount] = useState(10);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [rowCount, setRowCount] = useState<RowCount>(12);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [gameHistory, setGameHistory] = useState<{ multiplier: number; amount: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const currentMultipliers = PAYOUTS[riskLevel][rowCount];
  const slotCount = currentMultipliers.length;

  const getSlotColor = (index: number): string => {
    const multiplier = currentMultipliers[index];
    if (multiplier >= 10) return '#ef4444';
    if (multiplier >= 3) return '#f59e0b';
    if (multiplier >= 1) return '#10b981';
    return '#6b7280';
  };

  const drawBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pegSpacingX = canvas.width / (rowCount + 1);
    const pegSpacingY = (canvas.height - 100) / rowCount;
    const pegRadius = 4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4b5563';
    for (let row = 0; row < rowCount; row++) {
      const pegsInRow = row + 2;
      const startX = (canvas.width - (pegsInRow - 1) * pegSpacingX) / 2;
      for (let peg = 0; peg < pegsInRow; peg++) {
        const pegX = startX + peg * pegSpacingX;
        const pegY = 50 + row * pegSpacingY;
        ctx.beginPath();
        ctx.arc(pegX, pegY, pegRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const slotWidth = canvas.width / slotCount;
    for (let i = 0; i < slotCount; i++) {
      const x = i * slotWidth;
      const y = canvas.height - 50;
      ctx.fillStyle = getSlotColor(i);
      ctx.fillRect(x, y, slotWidth - 2, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${currentMultipliers[i]}x`, x + slotWidth / 2, y + 20);
    }
  };

  const dropBall = () => {
    if (!user) return;
    const currentBetAmount = betAmount; // Capture the current bet amount at the time of the bet

    if (currentBetAmount <= 0 || currentBetAmount > user.balance) {
      toast.error('Invalid bet amount');
      return;
    }

    updateBalance(-currentBetAmount);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const newBall: Ball = {
      x: canvas.width / 2,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      id: Date.now() + Math.random()
    };

    setBalls(prev => [...prev, newBall]);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    drawBoard();

    const pegSpacingX = canvas.width / (rowCount + 1);
    const pegSpacingY = (canvas.height - 100) / rowCount;
    const gravity = 0.3;
    const bounce = 0.7;
    const pegRadius = 4;
    // 🔥 Ball radius now scales with peg spacing
    const ballRadius = Math.max(3, Math.min(pegSpacingY * 0.35, 6));

    setBalls(prevBalls => {
      const updatedBalls: Ball[] = [];

      prevBalls.forEach(ballData => {
        ballData.vy += gravity;
        ballData.x += ballData.vx;
        ballData.y += ballData.vy;

        for (let row = 0; row < rowCount; row++) {
          const pegsInRow = row + 2;
          const startX = (canvas.width - (pegsInRow - 1) * pegSpacingX) / 2;
          for (let peg = 0; peg < pegsInRow; peg++) {
            const pegX = startX + peg * pegSpacingX;
            const pegY = 50 + row * pegSpacingY;
            const dx = ballData.x - pegX;
            const dy = ballData.y - pegY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < pegRadius + ballRadius) {
              const angle = Math.atan2(dy, dx);
              ballData.x = pegX + Math.cos(angle) * (pegRadius + ballRadius);
              ballData.y = pegY + Math.sin(angle) * (pegRadius + ballRadius);
              ballData.vx = Math.cos(angle) * bounce + (Math.random() - 0.5) * 2;
              ballData.vy = Math.sin(angle) * bounce * 0.5;
            }
          }
        }

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(ballData.x, ballData.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        if (ballData.y > canvas.height - 60) {
          const slotWidth = canvas.width / slotCount;
          const slotIndex = Math.floor(ballData.x / slotWidth);
          const finalSlot = Math.max(0, Math.min(slotCount - 1, slotIndex));
          const multiplier = currentMultipliers[finalSlot];
          const winAmount = betAmount * multiplier;

          updateBalance(winAmount);
          setGameHistory(prev => [{ multiplier, amount: winAmount }, ...prev.slice(0, 9)]);
          addBetHistory({
            game: 'Plinko',
            betAmount,
            result: multiplier >= 1 ? 'win' : 'loss',
            payout: winAmount
          });

          if (multiplier >= 1) {
            toast.success(`Won ${multiplier}x! Received $${winAmount.toFixed(2)}`);
          } else {
            toast.error(`Hit ${multiplier}x slot. Lost $${betAmount.toFixed(2)}`);
          }
        } else {
          updatedBalls.push(ballData);
        }
      });

      return updatedBalls;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [riskLevel, rowCount]);

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="bg-gradient-card border-border max-w-md mx-auto">
          <CardContent className="p-6">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground">Please login to play Plinko</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          <Target className="w-8 h-8 inline mr-2" />
          Plinko
        </h1>
        <p className="text-muted-foreground">Drop the ball and watch it bounce through the pegs to win big!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Plinko Board ({rowCount} Rows)</span>
                <span className={`text-sm font-bold ${RISK_COLORS[riskLevel]}`}>{riskLevel.toUpperCase()} RISK</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={500}
                height={400}
                className="w-full h-auto border border-border rounded-lg bg-black/20"
              />
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
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rows</label>
                <Select value={rowCount.toString()} onValueChange={(value) => setRowCount(Number(value) as RowCount)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 Rows</SelectItem>
                    <SelectItem value="12">12 Rows</SelectItem>
                    <SelectItem value="16">16 Rows</SelectItem>
                    <SelectItem value="20">20 Rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Risk Level</label>
                <Select value={riskLevel} onValueChange={(value: RiskLevel) => setRiskLevel(value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{RISK_DESCRIPTIONS.low[rowCount]}</SelectItem>
                    <SelectItem value="medium">{RISK_DESCRIPTIONS.medium[rowCount]}</SelectItem>
                    <SelectItem value="high">{RISK_DESCRIPTIONS.high[rowCount]}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(betAmount / 2))}>
                  1/2
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.min(user.balance, betAmount * 2))}>
                  2x
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBetAmount(user.balance)}>
                  Max
                </Button>
              </div>

              <Button variant="casino" className="w-full" onClick={dropBall} disabled={betAmount <= 0 || betAmount > user.balance}>
                Drop Ball - ${betAmount.toFixed(2)}
              </Button>

              <div className="text-center p-3 bg-gradient-accent rounded-lg">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-lg font-bold">${user.balance.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Game History */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameHistory.length === 0 ? (
                  <p className="text-muted-foreground">No games played yet</p>
                ) : (
                  gameHistory.map((game, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-background/50 rounded">
                      <span className="text-sm">{game.multiplier.toFixed(1)}x</span>
                      <span className={`text-sm font-bold ${game.multiplier >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                        {game.multiplier >= 1 ? '+' : ''}${game.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
