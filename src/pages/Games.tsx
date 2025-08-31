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
      name: 'Mines',
      description: 'Navigate through a minefield. Find gems, avoid bombs. Cash out before it\'s too late!',
      icon: Bomb,
      path: '/games/mines',
      color: 'text-casino-red',
      bgColor: 'from-casino-red/20 to-casino-red/5',
      difficulty: 'Medium',
      maxPayout: '24.48x',
      players: '1.2k'
    },
    {
      name: 'Dice',
      description: 'Simple and classic. Set your target, roll the dice, and win big with customizable odds.',
      icon: Dices,
      path: '/games/dice',
      color: 'text-neon-blue',
      bgColor: 'from-neon-blue/20 to-neon-blue/5',
      difficulty: 'Easy',
      maxPayout: '98.99x',
      players: '856'
    },
    {
      name: 'Blackjack',
      description: 'Classic card game. Get as close to 21 as possible. Double down and split for bigger wins!',
      icon: Coins,
      path: '/games/blackjack',
      color: 'text-neon-green',
      bgColor: 'from-neon-green/20 to-neon-green/5',
      difficulty: 'Medium',
      maxPayout: '2.5x',
      players: '2.1k'
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
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {games.map((game, index) => (
          <Card 
            key={game.name} 
            className="bg-gradient-card border-border hover:border-primary transition-all duration-300 hover:shadow-neon-green hover:scale-105 animate-slide-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.bgColor} flex items-center justify-center shadow-lg`}>
                    <game.icon className={`w-8 h-8 ${game.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-1">{game.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Difficulty: {game.difficulty}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {game.players} playing
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Max Payout</div>
                  <div className="text-lg font-bold text-casino-gold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {game.maxPayout}
                  </div>
                </div>
              </div>
              
              <CardDescription className="text-base leading-relaxed">
                {game.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {user ? (
                <Link to={game.path}>
                  <Button variant="casino" size="lg" className="w-full shadow-glow-primary">
                    <Zap className="w-5 h-5" />
                    Play {game.name}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg"
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
        <h2 className="text-2xl font-bold mb-4 text-muted-foreground">
          More Games Coming Soon...
        </h2>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto opacity-50">
          <div className="bg-gradient-card border border-dashed border-border rounded-lg p-4">
            <div className="text-sm">Roulette</div>
          </div>
          <div className="bg-gradient-card border border-dashed border-border rounded-lg p-4">
            <div className="text-sm">Crash</div>
          </div>
          <div className="bg-gradient-card border border-dashed border-border rounded-lg p-4">
            <div className="text-sm">Slots</div>
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