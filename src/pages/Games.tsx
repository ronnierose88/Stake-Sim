import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { useState } from 'react';
import { 
  Dices, 
  Bomb, 
  Coins,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react';

const Games = () => {
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const games = [
    {
      id: 'mines',
      title: 'Mines',
      description: 'Find the safe tiles and avoid the bombs in this customizable grid game.',
      difficulty: 'Medium',
      payout: 'Up to 24.47x',
      icon: '💣',
      path: '/games/mines',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'dice',
      title: 'Dice',
      description: 'Roll the dice and predict the outcome. Simple yet exciting!',
      difficulty: 'Easy',
      payout: 'Up to 990x',
      icon: '🎲',
      path: '/games/dice',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'blackjack',
      title: 'Blackjack',
      description: 'Classic card game. Get as close to 21 as possible without going over.',
      difficulty: 'Medium',
      payout: 'Up to 3:2',
      icon: '🃏',
      path: '/games/blackjack',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'crash',
      title: 'Crash',
      description: 'Watch the multiplier rise and cash out before it crashes!',
      difficulty: 'High',
      payout: 'Up to 50x',
      icon: '⚡',
      path: '/games/crash',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'plinko',
      title: 'Plinko',
      description: 'Drop the ball and watch it bounce through pegs to win big!',
      difficulty: 'Easy',
      payout: 'Up to 500x',
      icon: '🎯',
      path: '/games/plinko',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'crossy-road',
      title: 'Crossy Road',
      description: 'Hop across traffic and cash out before getting hit!',
      difficulty: 'High',
      payout: 'Unlimited',
      icon: '🐸',
      path: '/games/crossy-road',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Choose Your Game
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select from our collection of exciting casino games. All games use virtual credits only.
        </p>
      </div>

      {/* User Balance (if logged in) */}
      {user && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-accent rounded-lg px-6 py-3 shadow-neon-blue">
            <Coins className="w-5 h-5" />
            <span className="text-lg font-semibold">
              Balance: ${user.balance.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {games.map((game, index) => (
          <Card 
            key={game.id} 
            className="bg-gradient-card border-border hover:border-primary transition-all duration-300 group overflow-hidden"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {game.icon}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Max Payout</div>
                  <div className="text-sm font-bold text-green-400">{game.payout}</div>
                </div>
              </div>
              
              <CardTitle className="text-xl mb-2">{game.title}</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span>Difficulty: {game.difficulty}</span>
              </div>
              <CardDescription className="text-sm">
                {game.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              {user ? (
                <Link to={game.path}>
                  <Button variant="casino" className="w-full group-hover:shadow-lg">
                    Play Now
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Login to Play
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold mb-6 text-muted-foreground">
          More Games Coming Soon...
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto opacity-50">
          <div className="bg-gradient-card border border-dashed border-border rounded-lg p-4">
            <div className="text-sm">🎰 Slots</div>
          </div>
          <div className="bg-gradient-card border border-dashed border-border rounded-lg p-4">
            <div className="text-sm">🎡 Roulette</div>
          </div>
          <div className="bg-gradient-card border border-dashed border-border rounded-lg p-4">
            <div className="text-sm">🎪 Baccarat</div>
          </div>
        </div>
      </div>

      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
      />
    </div>
  );
};

export default Games;