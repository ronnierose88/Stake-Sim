import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  History,
  Gift,
  Coins,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const Wallet = () => {
  const { user, betHistory, resetBalance } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleResetBalance = () => {
    resetBalance();
  };

  const handleBonusCredits = () => {
    // For demo purposes, just show a message
    toast.info('Bonus credits feature coming soon!', {
      description: 'Check back later for special promotions'
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-neon-blue">
            <WalletIcon className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Wallet</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Login to view your balance and transaction history
          </p>
          <Button variant="casino" onClick={() => setIsLoginOpen(true)}>
            Login to Continue
          </Button>
        </div>
        
        <LoginDialog 
          open={isLoginOpen} 
          onOpenChange={setIsLoginOpen} 
        />
      </div>
    );
  }

  const profit = user.totalWinnings - user.totalWagered;
  const profitPercentage = user.totalWagered > 0 ? (profit / user.totalWagered) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            Your Wallet
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your virtual credits and view transaction history
        </p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-card border-border mb-8 shadow-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Coins className="w-6 h-6 text-casino-gold" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-5xl font-bold text-primary mb-6">
            ${user.balance.toFixed(2)}
          </div>
          
          <div className="flex justify-center gap-4 mb-6">
            <Button variant="casino" onClick={handleResetBalance}>
              <RefreshCw className="w-4 h-4" />
              Reset to $1,000
            </Button>
            <Button variant="neon" onClick={handleBonusCredits}>
              <Gift className="w-4 h-4" />
              Bonus Credits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-casino-red" />
              Total Wagered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-casino-red">
              ${user.totalWagered.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Total Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${user.totalWinnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${profit >= 0 ? 'text-success' : 'text-casino-red'}`} />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-success' : 'text-casino-red'}`}>
              ${profit.toFixed(2)}
            </div>
            <div className={`text-sm ${profit >= 0 ? 'text-success' : 'text-casino-red'}`}>
              {profit >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Your last {Math.min(betHistory.length, 20)} betting activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {betHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Start playing games to see your betting history here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {betHistory.slice(0, 10).map((bet) => (
                <div 
                  key={bet.id} 
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      bet.result === 'win' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-casino-red/20 text-casino-red'
                    }`}>
                      {bet.result === 'win' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{bet.game}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(bet.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      Bet: ${bet.betAmount.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${
                      bet.result === 'win' ? 'text-success' : 'text-casino-red'
                    }`}>
                      {bet.result === 'win' ? '+' : '-'}${Math.abs(bet.payout - bet.betAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;