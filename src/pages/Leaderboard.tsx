import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users,
  Coins,
  Target,
  Calendar
} from 'lucide-react';

interface LeaderboardUser {
  username: string;
  balance: number;
  totalWagered: number;
  totalWinnings: number;
  netProfit: number;
  joinDate: string;
}

const Leaderboard = () => {
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [activeTab, setActiveTab] = useState<'balance' | 'profit' | 'wagered'>('balance');

  useEffect(() => {
    // Load leaderboard data from localStorage
    const loadLeaderboardData = () => {
      const allUsers: LeaderboardUser[] = [];
      
      // Get all users from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('casino-user-')) {
          try {
            const userData = JSON.parse(localStorage.getItem(key) || '');
            if (userData && userData.username) {
              allUsers.push({
                username: userData.username,
                balance: userData.balance || 0,
                totalWagered: userData.totalWagered || 0,
                totalWinnings: userData.totalWinnings || 0,
                netProfit: (userData.totalWinnings || 0) - (userData.totalWagered || 0),
                joinDate: userData.createdAt || new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }
      
      // Add some demo users if no users exist
      if (allUsers.length === 0) {
        const demoUsers: LeaderboardUser[] = [
          {
            username: 'HighRoller99',
            balance: 2547.80,
            totalWagered: 15420.00,
            totalWinnings: 18967.80,
            netProfit: 3547.80,
            joinDate: '2024-01-15T10:30:00Z'
          },
          {
            username: 'LuckyPlayer',
            balance: 1834.50,
            totalWagered: 8750.00,
            totalWinnings: 10584.50,
            netProfit: 1834.50,
            joinDate: '2024-02-03T14:22:00Z'
          },
          {
            username: 'MinesSweeper',
            balance: 1520.25,
            totalWagered: 12300.00,
            totalWinnings: 13820.25,
            netProfit: 1520.25,
            joinDate: '2024-01-28T09:45:00Z'
          },
          {
            username: 'DiceHunter',
            balance: 1205.75,
            totalWagered: 6890.00,
            totalWinnings: 8095.75,
            netProfit: 1205.75,
            joinDate: '2024-02-10T16:18:00Z'
          },
          {
            username: 'CasinoKing',
            balance: 987.40,
            totalWagered: 9500.00,
            totalWinnings: 10487.40,
            netProfit: 987.40,
            joinDate: '2024-01-20T11:55:00Z'
          }
        ];
        
        setLeaderboardData(demoUsers);
      } else {
        setLeaderboardData(allUsers);
      }
    };

    loadLeaderboardData();
    
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(loadLeaderboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSortedData = () => {
    const sorted = [...leaderboardData].sort((a, b) => {
      switch (activeTab) {
        case 'balance':
          return b.balance - a.balance;
        case 'profit':
          return b.netProfit - a.netProfit;
        case 'wagered':
          return b.totalWagered - a.totalWagered;
        default:
          return b.balance - a.balance;
      }
    });
    return sorted.slice(0, 10); // Top 10
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-casino-gold" />;
      case 2:
        return <Medal className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">{rank}</div>;
    }
  };

  const getUserRank = () => {
    if (!user) return null;
    const sorted = getSortedData();
    const userIndex = sorted.findIndex(u => u.username === user.username);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-neon-blue">
            <Trophy className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Login to see where you rank among the top players
          </p>
          <Button variant="casino" onClick={() => setIsLoginOpen(true)}>
            Login to View Rankings
          </Button>
        </div>
        
        <LoginDialog 
          open={isLoginOpen} 
          onOpenChange={setIsLoginOpen} 
        />
      </div>
    );
  }

  const sortedData = getSortedData();
  const userRank = getUserRank();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            Leaderboard
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          See how you stack up against other players
        </p>
      </div>

      {/* User's Current Rank */}
      {userRank && (
        <Card className="bg-gradient-primary/10 border-primary mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(userRank)}
                  <span className="text-lg font-semibold">Your Rank: #{userRank}</span>
                </div>
                <div className="text-muted-foreground">•</div>
                <div className="text-lg font-medium">{user.username}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${user.balance.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Current Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 justify-center">
        <Button
          variant={activeTab === 'balance' ? 'casino' : 'outline'}
          onClick={() => setActiveTab('balance')}
          className="flex items-center gap-2"
        >
          <Coins className="w-4 h-4" />
          Balance
        </Button>
        <Button
          variant={activeTab === 'profit' ? 'casino' : 'outline'}
          onClick={() => setActiveTab('profit')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Net Profit
        </Button>
        <Button
          variant={activeTab === 'wagered' ? 'casino' : 'outline'}
          onClick={() => setActiveTab('wagered')}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Total Wagered
        </Button>
      </div>

      {/* Leaderboard */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-casino-gold" />
            Top Players - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedData.map((player, index) => {
              const rank = index + 1;
              const isCurrentUser = user && player.username === user.username;
              
              return (
                <div
                  key={player.username}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border transition-all duration-200
                    ${isCurrentUser 
                      ? 'bg-primary/10 border-primary shadow-neon-green' 
                      : 'bg-secondary/50 border-border/50 hover:bg-secondary/80'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(rank)}
                    </div>
                    
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {player.username}
                        {isCurrentUser && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(player.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ${(() => {
                        switch (activeTab) {
                          case 'balance':
                            return player.balance.toFixed(2);
                          case 'profit':
                            return player.netProfit.toFixed(2);
                          case 'wagered':
                            return player.totalWagered.toFixed(2);
                          default:
                            return player.balance.toFixed(2);
                        }
                      })()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activeTab === 'balance' && 'Balance'}
                      {activeTab === 'profit' && (
                        <span className={player.netProfit >= 0 ? 'text-success' : 'text-casino-red'}>
                          {player.netProfit >= 0 ? 'Profit' : 'Loss'}
                        </span>
                      )}
                      {activeTab === 'wagered' && 'Wagered'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {sortedData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No players found</p>
              <p className="text-sm">Start playing to appear on the leaderboard!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card className="bg-gradient-card border-border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {leaderboardData.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Players</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-casino-gold">
              ${leaderboardData.reduce((sum, p) => sum + p.totalWagered, 0).toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Wagered</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              ${leaderboardData.reduce((sum, p) => sum + p.balance, 0).toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Balance</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;