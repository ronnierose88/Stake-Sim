import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { useState } from 'react';
import casinoHero from '@/assets/casino-hero.jpg';
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
  Zap
} from 'lucide-react';

const Index = () => {
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const games = [
    {
      name: 'Mines',
      description: 'Navigate through a minefield to multiply your winnings',
      icon: Bomb,
      path: '/games/mines',
      color: 'text-casino-red',
      bgColor: 'from-casino-red/20 to-casino-red/5',
      difficulty: 'Medium'
    },
    {
      name: 'Dice',
      description: 'Roll the dice and predict the outcome',
      icon: Dices,
      path: '/games/dice',
      color: 'text-neon-blue',
      bgColor: 'from-neon-blue/20 to-neon-blue/5',
      difficulty: 'Easy'
    }
  ];

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
      {/* Hero Section */}
      <section
        className="relative text-center py-12 mb-12 overflow-hidden rounded-3xl"
        style={{ backgroundColor: '#132632' }}
      >
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={casinoHero} 
            alt="Casino Hero Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 animate-slide-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary animate-pulse-glow">
              <Coins className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              StakeSim
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-2xl mx-auto font-medium">
            Experience the thrill of casino gaming with virtual credits. 
            <br />
            <span className="text-muted-foreground">No risk, all the excitement!</span>
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-gradient-accent rounded-lg px-6 py-3 shadow-neon-blue">
                <div className="text-lg font-semibold text-accent-foreground">
                  Balance: ${user.balance.toFixed(2)}
                </div>
              </div>
              <Link to="/games">
                <Button variant="casino" size="xl" className="animate-pulse-glow">
                  <Gamepad2 className="w-5 h-5" />
                  Start Playing
                </Button>
              </Link>
            </div>
          ) : (
            <Button 
              variant="casino" 
              size="xl" 
              onClick={() => setIsLoginOpen(true)}
              className="animate-pulse-glow"
            >
              <Sparkles className="w-5 h-5" />
              Get Started
            </Button>
          )}
        </div>
      </section>

      {/* Games Preview */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Available Games
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose your favorite game and start winning!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {games.map((game, index) => (
            <Card 
              key={game.name} 
              className="bg-gradient-card border-border hover:border-primary transition-all duration-300 hover:shadow-neon-green hover:scale-105 animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.bgColor} flex items-center justify-center`}>
                    <game.icon className={`w-6 h-6 ${game.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {game.difficulty}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <Link to={game.path}>
                    <Button variant="game" className="w-full group-hover:shadow-neon-green">
                      <Zap className="w-4 h-4" />
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