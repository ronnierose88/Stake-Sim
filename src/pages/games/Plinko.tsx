import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, Target } from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';
type RowCount = 8 | 12 | 16; // Removed 20 as an option

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
  betAmount: number; // store bet per ball
}

const PAYOUTS: Record<RiskLevel, Record<RowCount, number[]>> = {
  low: {
    8:  [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16]
  },
  medium: {
    8:  [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
  },
  high: {
    8:  [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
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
    16: 'Low Risk (1x - 4x)'
  },
  medium: {
    8: 'Medium Risk (1x - 10x)',
    12: 'Medium Risk (0.5x - 15x)',
    16: 'Medium Risk (1x - 20x)'
  },
  high: {
    8: 'High Risk (0.5x - 50x)',
    12: 'High Risk (0.5x - 100x)',
    16: 'High Risk (0.5x - 250x)'
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

    const currentBetAmount = parseFloat(betAmount.toFixed(2));
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
      id: Date.now() + Math.random(),
      betAmount: currentBetAmount, // store the bet per ball
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
    const gravity = 0.5; // Increased gravity to make balls faster
    const bounce = 1.2; // Increased bounce to make balls more bouncy
    const pegRadius = 4;
    const ballRadius = Math.max(3, Math.min(pegSpacingY * 0.3, 5)); // Reduced ball size

    setBalls(prevBalls => {
      const updatedBalls: Ball[] = [];

      prevBalls.forEach(ballData => {
        ballData.vy += gravity;
        ballData.x += ballData.vx;
        ballData.y += ballData.vy;

        // Ensure the ball hits the center of the peg
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
              ballData.x = pegX; // Align ball to the center of the peg
              ballData.y = pegY + pegRadius + ballRadius; // Move ball slightly below the peg
              const randomDirection = Math.random() < 0.5 ? -1 : 1; // 50/50 chance
              ballData.vx = randomDirection * Math.abs(ballData.vx); // Apply random direction
              ballData.vy = gravity; // Reset vertical velocity
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

          const winAmount = parseFloat((ballData.betAmount * multiplier).toFixed(2));

          updateBalance(winAmount);
          setGameHistory(prev => [{ multiplier, amount: winAmount }, ...prev.slice(0, 9)]);
          addBetHistory({
            game: 'Plinko',
            betAmount: ballData.betAmount,
            result: multiplier >= 1 ? 'win' : 'loss',
            payout: winAmount
          });

          if (multiplier >= 1) {
            toast.success(`You won! Multiplier: ${multiplier}x`);
          } else {
            toast.error('You lost! Better luck next time.');
          }
        }
      });

      return updatedBalls;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    drawBoard();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rowCount, riskLevel, balls]);

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Plinko Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col mb-4 md:mb-0">
              <label className="text-sm font-medium mb-1">Bet Amount</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                className="w-full max-w-xs"
              />
            </div>
            <div className="flex flex-col mb-4 md:mb-0">
              <label className="text-sm font-medium mb-1">Risk Level</label>
              <Select
                value={riskLevel}
                onValueChange={setRiskLevel}
                className="w-full max-w-xs"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className={RISK_COLORS.low}>
                    Low Risk (1x - 2x)
                  </SelectItem>
                  <SelectItem value="medium" className={RISK_COLORS.medium}>
                    Medium Risk (1x - 10x)
                  </SelectItem>
                  <SelectItem value="high" className={RISK_COLORS.high}>
                    High Risk (0.5x - 50x)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Row Count</label>
              <Select
                value={rowCount.toString()}
                onValueChange={(value) => setRowCount(parseInt(value))}
                className="w-full max-w-xs"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select row count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 Rows</SelectItem>
                  <SelectItem value="12">12 Rows</SelectItem>
                  <SelectItem value="16">16 Rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <Button onClick={dropBall} className="px-6 py-3 text-lg">
              Drop Ball
            </Button>
          </div>
          <div className="relative w-full h-96">
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Game History</h3>
            <div className="grid grid-cols-3 gap-2 text-sm text-center">
              <div className="font-medium">Multiplier</div>
              <div className="font-medium">Amount</div>
              <div className="font-medium">Result</div>
              {gameHistory.map((game, index) => (
                <React.Fragment key={index}>
                  <div>{game.multiplier}x</div>
                  <div>${game.amount.toFixed(2)}</div>
                  <div className={game.multiplier >= 1 ? 'text-green-500' : 'text-red-500'}>
                    {game.multiplier >= 1 ? 'Win' : 'Loss'}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
