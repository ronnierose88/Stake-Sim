import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { Menu, X } from 'lucide-react';
import StakeLogo from '@/assets/stake-logo.png'; // <-- Add this line (adjust path if needed)

export const Header = () => {
  const { user, logout } = useUser();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Wallet', path: '/wallet' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className="border-b border-border sticky top-0 z-50 backdrop-blur-sm"
        style={{ backgroundColor: '#1b2b38' }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <img
                src={StakeLogo}
                alt="Stake Logo"
                className="w-10 h-10 rounded"
                style={{ background: 'transparent' }}
              />
            </Link>

            {/* Center Balance & Account */}
            <div className="flex-1 flex justify-center">
              {user ? (
                <div className="flex items-center gap-4">
                  <div
                    className="px-6 py-3 bg-[#09202d] rounded-none"
                    /* bigger, sharp edges, dark bg, no glow */
                  >
                    <div className="text-sm font-medium text-white">
                      ${user.balance.toFixed(2)}
                    </div>
                  </div>
                  {/* Removed username */}
                </div>
              ) : null}
            </div>

            {/* Desktop Navigation & Login/Logout on right */}
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground shadow-neon-green'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              {user ? (
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <Button 
                  variant="casino" 
                  onClick={() => setIsLoginOpen(true)}
                  className="shadow-glow-primary"
                >
                  Login
                </Button>
              )}
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 border-t border-border pt-4 animate-slide-up">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground shadow-neon-green'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Balance & Account */}
              <div className="mt-4 pt-4 border-t border-border">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="bg-gradient-accent rounded-lg px-4 py-2 shadow-neon-blue">
                      <div className="text-sm text-accent-foreground font-medium">
                        ${user.balance.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {user.username}
                      </span>
                      <Button variant="outline" size="sm" onClick={logout}>
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="casino" 
                    className="w-full shadow-glow-primary"
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginDialog 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen} 
      />
    </>
  );
};