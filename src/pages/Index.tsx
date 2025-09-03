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
import blackjackLogo from '@/assets/blackjack-logo.png';
import crashLogo from '@/assets/crash-logo.png';
import crossyroadLogo from '@/assets/crossyroad-logo.png';
import diceLogo from '@/assets/dice-logo.png';
import minesLogo from '@/assets/mines-logo.png';
import plinkoLogo from '@/assets/plinko-logo.png';

const stakeOriginals = [
  {
    name: 'Blackjack',
    logo: blackjackLogo,
    path: '/games/blackjack'
  },
  {
    name: 'Crossy Road',
    logo: crossyroadLogo,
    path: '/games/crossy-road'
  },
  {
    name: 'Crash',
    logo: crashLogo,
    path: '/games/crash'
  },
  {
    name: 'Dice',
    logo: diceLogo,
    path: '/games/dice'
  },
  {
    name: 'Mines',
    logo: minesLogo,
    path: '/games/mines'
  },
  {
    name: 'Plinko',
    logo: plinkoLogo,
    path: '/games/plinko'
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
              <div
                key={game.name}
                className="min-w-[260px] max-w-xs flex-shrink-0 flex items-center justify-center min-h-[260px] aspect-square"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Only the logo is clickable */}
                <Link
                  to={game.path}
                  className="w-full h-full block"
                >
                  <img
                    src={game.logo}
                    alt={`${game.name} Logo`}
                    className="w-full h-full object-contain"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Why Stake?</h2>
          <p className="text-lg text-muted-foreground">
            Fair, and fun gaming experience
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