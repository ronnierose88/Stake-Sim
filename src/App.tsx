import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Mines from "./pages/games/Mines";
import Dice from "./pages/games/Dice";
import Blackjack from "./pages/games/Blackjack";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/mines" element={<Mines />} />
                <Route path="/games/dice" element={<Dice />} />
                <Route path="/games/blackjack" element={<Blackjack />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <footer className="border-t border-border bg-card mt-auto py-6">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>⚠️ This is a fake-money simulation. No real gambling. ⚠️</p>
                <p className="mt-1">StakeSim - Virtual Casino Experience</p>
              </div>
            </footer>
          </BrowserRouter>
        </div>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
