import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { User, LogIn } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const [username, setUsername] = useState('');
  const { login } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      onOpenChange(false);
      setUsername('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LogIn className="w-6 h-6 text-primary" />
            Welcome to StakeSim
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>Enter a username to start playing with virtual credits!</p>
            <p className="text-sm mt-1">No password required - just pick a name</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-secondary border-border focus:border-primary"
                maxLength={20}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="casino"
                className="flex-1"
                disabled={!username.trim()}
              >
                Start Playing
              </Button>
            </div>
          </form>
          
          <div className="text-xs text-center text-muted-foreground bg-secondary/50 p-3 rounded-lg">
            <p>🎮 You'll start with $1,000 in virtual credits</p>
            <p>🔒 This is a simulation - no real money involved</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};