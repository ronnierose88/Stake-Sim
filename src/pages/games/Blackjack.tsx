import { useState } from 'react'; a
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { toast } from 'sonner';
import { 
  Spade, 
  ArrowLeft, 
  DollarSign,
  RotateCcw,
  Zap
} from 'lucide-react';

interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numValue: number;
}

const Blackjack = () => {
  const { user, updateBalance, addBetHistory } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'ended'>('setup');
  const [betAmount, setBetAmount] = useState(10);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHands, setPlayerHands] = useState<PlayingCard[][]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [gameResult, setGameResult] = useState<string>('');
  const [canDouble, setCanDouble] = useState(false);
  const [canSplit, setCanSplit] = useState(false);
  const [isDealing, setIsDealing] = useState(false);

  const createDeck = (): PlayingCard[] => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: PlayingCard[] = [];

    for (const suit of suits) {
      for (const value of values) {
        let numValue = parseInt(value);
        if (value === 'A') numValue = 11;
        else if (['J', 'Q', 'K'].includes(value)) numValue = 10;
        
        deck.push({ suit, value, numValue });
      }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };

  const calculateHandValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aces = 0;
    
    for (const card of hand) {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  };

  const calculateDealerVisibleValue = (hand: PlayingCard[]): number => {
    if (hand.length === 0) return 0;
    if (gameState === 'playing') {
      // Only show value of first card during play
      return calculateHandValue([hand[0]]);
    }
    // Show full value when game is over
    return calculateHandValue(hand);
  };

  const startGame = () => {
    if (betAmount > user!.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    const newDeck = createDeck();
    const playerHand = [newDeck.pop()!, newDeck.pop()!];
    const dealerHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayerHands([playerHand]);
    setDealerHand(dealerHand);
    setCurrentHandIndex(0);
    setGameState('playing');
    setGameResult('');
    setIsDealing(true);
    
    updateBalance(-betAmount);
    
    // Check for natural blackjack
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    if (playerValue === 21) {
      if (dealerValue === 21) {
        endGame('push');
      } else {
        endGame('blackjack');
      }
      return;
    }
    
    // Set available actions
    setCanDouble(playerHand.length === 2);
    setCanSplit(playerHand.length === 2 && playerHand[0].value === playerHand[1].value);
    
    setTimeout(() => setIsDealing(false), 1000);
  };

  const hit = () => {
    const newCard = deck.pop()!;
    const newPlayerHands = [...playerHands];
    newPlayerHands[currentHandIndex] = [...newPlayerHands[currentHandIndex], newCard];
    setPlayerHands(newPlayerHands);
    setDeck([...deck]);
    
    const handValue = calculateHandValue(newPlayerHands[currentHandIndex]);
    
    setCanDouble(false);
    setCanSplit(false);
    
    if (handValue > 21) {
      if (currentHandIndex < newPlayerHands.length - 1) {
        setCurrentHandIndex(currentHandIndex + 1);
        setCanDouble(newPlayerHands[currentHandIndex + 1].length === 2);
        setCanSplit(false);
      } else {
        endGame('bust');
      }
    }
  };

  const stand = () => {
    if (currentHandIndex < playerHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
      setCanDouble(playerHands[currentHandIndex + 1].length === 2);
      setCanSplit(false);
    } else {
      dealerPlay();
    }
  };

  const doubleDown = () => {
    if (betAmount > user!.balance) {
      toast.error("Insufficient balance to double!");
      return;
    }
    
    updateBalance(-betAmount);
    hit();
    setTimeout(() => stand(), 500);
  };

  const split = () => {
    if (betAmount > user!.balance) {
      toast.error("Insufficient balance to split!");
      return;
    }
    
    updateBalance(-betAmount);
    
    const currentHand = playerHands[currentHandIndex];
    const newHand1 = [currentHand[0], deck.pop()!];
    const newHand2 = [currentHand[1], deck.pop()!];
    
    const newPlayerHands = [...playerHands];
    newPlayerHands[currentHandIndex] = newHand1;
    newPlayerHands.splice(currentHandIndex + 1, 0, newHand2);
    
    setPlayerHands(newPlayerHands);
    setDeck([...deck]);
    setCanSplit(false);
    setCanDouble(newHand1.length === 2);
  };

  const dealerPlay = () => {
    let newDealerHand = [...dealerHand];
    let dealerValue = calculateHandValue(newDealerHand);
    
    while (dealerValue < 17) {
      newDealerHand.push(deck.pop()!);
      dealerValue = calculateHandValue(newDealerHand);
    }
    
    setDealerHand(newDealerHand);
    
    // Determine winner for each hand
    let totalWin = 0;
    let results: string[] = [];
    
    playerHands.forEach(hand => {
      const playerValue = calculateHandValue(hand);
      
      if (playerValue > 21) {
        results.push('bust');
      } else if (dealerValue > 21) {
        results.push('win');
        totalWin += betAmount * 2;
      } else if (playerValue > dealerValue) {
        results.push('win');
        totalWin += betAmount * 2;
      } else if (playerValue === dealerValue) {
        results.push('push');
        totalWin += betAmount;
      } else {
        results.push('lose');
      }
    });
    
    if (totalWin > 0) {
      updateBalance(totalWin);
    }
    
    const overallResult = results.includes('win') ? 'win' : 
                         results.every(r => r === 'push') ? 'push' : 'lose';
    
    addBetHistory({
      game: 'Blackjack',
      betAmount: betAmount * playerHands.length,
      result: overallResult === 'win' ? 'win' : 'loss',
      payout: totalWin
    });
    
    setGameResult(overallResult);
    setGameState('ended');
  };

  const endGame = (result: string) => {
    let payout = 0;
    
    if (result === 'blackjack') {
      payout = betAmount * 2.5;
      updateBalance(payout);
      toast.success(`Blackjack! Won $${(payout - betAmount).toFixed(2)}`);
    } else if (result === 'push') {
      payout = betAmount;
      updateBalance(payout);
      toast.info("Push - Bet returned");
    } else if (result === 'bust') {
      toast.error("Bust! Better luck next time");
    }
    
    addBetHistory({
      game: 'Blackjack',
      betAmount,
      result: result === 'blackjack' || result === 'win' ? 'win' : 'loss',
      payout
    });
    
    setGameResult(result);
    setGameState('ended');
  };

  const resetGame = () => {
    setGameState('setup');
    setPlayerHands([]);
    setDealerHand([]);
    setGameResult('');
    setCurrentHandIndex(0);
    setCanDouble(false);
    setCanSplit(false);
  };

  const getCardSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥️';
      case 'diamonds': return '♦️';
      case 'clubs': return '♣️';
      case 'spades': return '♠️';
      default: return '♠️';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Spade className="w-10 h-10 text-neon-blue" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Blackjack</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Login to play the classic card game
          </p>
          <Button variant="casino" onClick={() => setIsLoginOpen(true)}>
            Login to Play
          </Button>
        </div>
        
        <LoginDialog 
          open={isLoginOpen} 
          onOpenChange={setIsLoginOpen} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Spade className="w-8 h-8 text-neon-blue" />
              Blackjack
            </h1>
            <p className="text-muted-foreground">Get as close to 21 as possible without going over</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Balance</div>
          <div className="text-2xl font-bold text-casino-gold">
            ${user.balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Game Controls */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Game Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameState === 'setup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bet Amount
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={user.balance}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    variant="casino" 
                    size="lg" 
                    className="w-full shadow-glow-primary"
                    onClick={startGame}
                    disabled={betAmount > user.balance || betAmount < 1}
                  >
                    <Zap className="w-5 h-5" />
                    Deal Cards
                  </Button>
                </>
              )}
              
              {gameState === 'playing' && !isDealing && (
                <div className="space-y-3">
                  <Button 
                    variant="casino" 
                    size="lg" 
                    className="w-full"
                    onClick={hit}
                  >
                    Hit
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={stand}
                  >
                    Stand
                  </Button>
                  
                  {canDouble && (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full"
                      onClick={doubleDown}
                      disabled={betAmount > user.balance}
                    >
                      Double Down
                    </Button>
                  )}
                  
                  {canSplit && (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full"
                      onClick={split}
                      disabled={betAmount > user.balance}
                    >
                      Split
                    </Button>
                  )}
                </div>
              )}
              
              {gameState === 'ended' && (
                <Button 
                  variant="casino" 
                  size="lg" 
                  className="w-full"
                  onClick={resetGame}
                >
                  <RotateCcw className="w-5 h-5" />
                  New Game
                </Button>
              )}
              
              <div className="text-center p-3 bg-gradient-accent rounded-lg">
                <div className="text-sm text-muted-foreground">Current Bet</div>
                <div className="text-lg font-bold">
                  ${(betAmount * Math.max(1, playerHands.length)).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dealer Hand */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Dealer's Hand {dealerHand.length > 0 && `(${calculateDealerVisibleValue(dealerHand)})`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {dealerHand.map((card, index) => (
                  <div 
                    key={index}
                    className={`w-16 h-24 bg-white text-black rounded-lg flex flex-col items-center justify-center border-2 shadow-lg ${
                      index === 1 && gameState === 'playing' ? 'bg-gradient-to-br from-primary/20 to-primary/5' : ''
                    }`}
                  >
                    {index === 1 && gameState === 'playing' ? (
                      <div className="text-lg">🂠</div>
                    ) : (
                      <>
                        <div className="text-xs font-bold">{card.value}</div>
                        <div className="text-lg">{getCardSymbol(card.suit)}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Player Hands */}
          {playerHands.map((hand, handIndex) => (
            <Card 
              key={handIndex}
              className={`bg-gradient-card border-border ${
                currentHandIndex === handIndex && gameState === 'playing' ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader>
                <CardTitle>
                  {playerHands.length > 1 ? `Hand ${handIndex + 1}` : 'Your Hand'} 
                  {hand.length > 0 && ` (${calculateHandValue(hand)})`}
                  {currentHandIndex === handIndex && gameState === 'playing' && (
                    <span className="text-sm font-normal text-primary ml-2">← Current</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {hand.map((card, cardIndex) => (
                    <div 
                      key={cardIndex}
                      className="w-16 h-24 bg-white text-black rounded-lg flex flex-col items-center justify-center border-2 shadow-lg animate-scale-in"
                    >
                      <div className="text-xs font-bold">{card.value}</div>
                      <div className="text-lg">{getCardSymbol(card.suit)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Game Result */}
          {gameResult && (
            <Card className="bg-gradient-card border-border">
              <CardContent className="text-center py-6">
                <div className={`text-2xl font-bold ${
                  gameResult === 'blackjack' || gameResult === 'win' 
                    ? 'text-neon-green' 
                    : gameResult === 'push' 
                    ? 'text-casino-gold' 
                    : 'text-casino-red'
                }`}>
                  {gameResult === 'blackjack' && 'BLACKJACK! 🎉'}
                  {gameResult === 'win' && 'YOU WIN! 🎉'}
                  {gameResult === 'push' && 'PUSH - TIE 🤝'}
                  {gameResult === 'bust' && 'BUST - YOU LOSE 💥'}
                  {gameResult === 'lose' && 'DEALER WINS 😔'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blackjack;