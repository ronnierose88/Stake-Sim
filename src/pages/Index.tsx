import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { useState } from 'react';
import casinoHero from '@/assets/casino-hero.jpg';
import stakeLogo from '@/assets/stake-logo.png';
import { 
  Gamepad2, 
  Dices, 
  Bomb, 
  TrendingUp, 
  Coins,
  Trophy,
  Wallet,
  Users,
  Sparkles,
  Zap,
  Landmark,
  ArrowUpRight,
  Layers
} from 'lucide-react';

const stakeOriginals = [
  {
    name: 'Blackjack',
    description: 'Beat the dealer in this classic card game.',
    icon: Landmark,
    path: '/games/blackjack',
    color: 'text-casino-gold',
    bgColor: 'from-casino-gold/20 to-casino-gold/5'
  },
  {
    name: 'Crash',
    description: 'Cash out before the multiplier crashes!',
    icon: TrendingUp,
    path: '/games/crash',
    color: 'text-neon-pink',
    bgColor: 'from-neon-pink/20 to-neon-pink/5'
  },
  {
    name: 'Dice',
    description: 'Roll the dice and predict the outcome.',
    icon: Dices,
    path: '/games/dice',
    color: 'text-neon-blue',
    bgColor: 'from-neon-blue/20 to-neon-blue/5'
  },
  {
    name: 'Mines',
    description: 'Navigate through a minefield to multiply your winnings.',
    icon: Bomb,
    path: '/games/mines',
    color: 'text-casino-red',
    bgColor: 'from-casino-red/20 to-casino-red/5'
  },
  {
    name: 'Plinko',
    description: 'Drop the ball and win big prizes!',
    icon: Layers,
    path: '/games/plinko',
    color: 'text-casino-green',
    bgColor: 'from-casino-green/20 to-casino-green/5'
  }
];

const Index = () => {
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const features = [
    {
      icon: Wallet,
      title: 'Virtual Wallet',
      description: 'Start with $1,000 virtual credits'
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete with other players'
    },
    {
      icon: Users,
      title: 'No Real Money',
      description: 'Safe simulation environment'
    }
  ];

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ backgroundColor: '#132632', minHeight: '100vh' }}
    >
      {/* Stake Originals Slider */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-bold">Stake Originals</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {stakeOriginals.map((game, idx) => (
              <Link
                to={game.path}
                key={game.name}
                className="min-w-[260px] max-w-xs flex-shrink-0 group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Card className="relative bg-gradient-card border-border hover:border-primary transition-all duration-300 hover:shadow-neon-green hover:scale-105 animate-slide-up group h-full overflow-hidden flex flex-col items-center justify-end min-h-[260px]">
                  {/* Large faded icon as background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <game.icon
                      className={`w-32 h-32 opacity-10 ${game.color}`}
                      style={{ filter: 'blur(0.5px)' }}
                    />
                  </div>
                  {/* Overlayed game name */}
                  <div className="relative z-10 flex flex-col items-center w-full px-4 pt-8 pb-4">
                    <div className="text-2xl font-bold text-center drop-shadow-md mb-2 text-foreground">
                      {game.name}
                    </div>
                    <CardDescription className="text-base text-center text-muted-foreground mb-4">
                      {game.description}
                    </CardDescription>
                    <Button variant="game" className="w-full group-hover:shadow-neon-green">
                      <ArrowUpRight className="w-4 h-4" />
                      Play
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Why StakeSim?</h2>
          <p className="text-lg text-muted-foreground">
            Safe, fun, and completely risk-free gaming experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="bg-gradient-card border-border text-center hover:border-accent transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center shadow-neon-blue">
                    <feature.icon className="w-8 h-8 text-accent-foreground" />
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      {user && (
        <section className="mb-16">
          <Card className="bg-gradient-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    ${user.balance.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Balance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-casino-gold">
                    ${user.totalWagered.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Wagered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    ${user.totalWinnings.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Won</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
      />
    </div>
  );
};

export default Index;