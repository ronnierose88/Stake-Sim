import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const PAYOUTS = {
  low: [1.5, 2, 3, 5],
  medium: [2, 5, 10, 20],
  high: [5, 10, 20, 50]
};

const Plinko = () => {
  const { user, updateBalance, addBetHistory } = useUser();
  const [betAmount, setBetAmount] = useState(10);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [gameHistory, setGameHistory] = useState([]);

  const handleDropBall = () => {
    if (!user) {
      toast.error('Please log in to play.');
      return;
    }

    if (betAmount <= 0 || betAmount > user.balance) {
      toast.error('Invalid bet amount.');
      return;
    }

    updateBalance(-betAmount);

    const multipliers = PAYOUTS[riskLevel];
    const randomIndex = Math.floor(Math.random() * multipliers.length);
    const multiplier = multipliers[randomIndex];
    const payout = parseFloat((betAmount * multiplier).toFixed(2));

    updateBalance(payout);
    addBetHistory({
      game: 'Plinko',
      betAmount,
      result: multiplier >= 1 ? 'win' : 'loss',
      payout
    });

    setGameHistory([{ multiplier, payout }, ...gameHistory.slice(0, 9)]);

    toast.success(`You won ${multiplier}x! Payout: $${payout}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Plinko</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Bet Amount</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min="1"
              max={user?.balance || 0}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Risk Level</label>
            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleDropBall} className="w-full">
            Drop Ball
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          {gameHistory.length === 0 ? (
            <p>No games played yet.</p>
          ) : (
            <ul>
              {gameHistory.map((game, index) => (
                <li key={index}>
                  Multiplier: {game.multiplier}x, Payout: ${game.payout}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Plinko;
