import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Bomb, DollarSign, AlertTriangle, RotateCcw } from 'lucide-react';

type GameState = 'setup' | 'playing' | 'ended';
type Cell = { revealed: boolean; isBomb: boolean; hasMoney: boolean };

export default function Mines() {
  const { user, updateBalance, addBetHistory } = useUser();
  const [betAmount, setBetAmount] = useState(10);
  const [bombCount, setBombCount] = useState(3);
  const [gameState, setGameState] = useState<GameState>('setup');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [currentWinnings, setCurrentWinnings] = useState(0);

  const boardSize = 5; // Fixed board size to 5x5

  const startGame = () => {
    if (!user || betAmount <= 0 || betAmount > user.balance) {
      toast.error('Invalid bet amount');
      return;
    }

    const totalTiles = boardSize * boardSize;
    if (bombCount >= totalTiles) {
      toast.error('Too many bombs for board size');
      return;
    }

    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Create new board
    const newBoard: Cell[][] = [];
    for (let i = 0; i < boardSize; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < boardSize; j++) {
        row.push({ revealed: false, isBomb: false, hasMoney: false });
      }
      newBoard.push(row);
    }

    // Randomly place bombs
    const bombPositions = new Set<string>();
    while (bombPositions.size < bombCount) {
      const row = Math.floor(Math.random() * boardSize);
      const col = Math.floor(Math.random() * boardSize);
      bombPositions.add(`${row}-${col}`);
    }

    // Set bombs on board
    bombPositions.forEach(pos => {
      const [row, col] = pos.split('-').map(Number);
      newBoard[row][col].isBomb = true;
    });

    // Set money on safe tiles
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (!newBoard[i][j].isBomb) {
          newBoard[i][j].hasMoney = true;
        }
      }
    }

    setBoard(newBoard);
    setGameState('playing');
    setCurrentWinnings(0);

    toast.success(`Game started! Find the safe tiles and avoid ${bombCount} bombs.`);
  };

  const revealTile = (row: number, col: number) => {
    if (gameState !== 'playing' || board[row][col].revealed) return;

    const newBoard = [...board];
    newBoard[row][col].revealed = true;

    if (newBoard[row][col].isBomb) {
      // Hit a bomb - game over
      setBoard(newBoard);
      setGameState('ended');

      // Reveal all bombs
      setTimeout(() => {
        const revealedBoard = [...newBoard];
        for (let i = 0; i < boardSize; i++) {
          for (let j = 0; j < boardSize; j++) {
            if (revealedBoard[i][j].isBomb) {
              revealedBoard[i][j].revealed = true;
            }
          }
        }
        setBoard(revealedBoard);
      }, 500);

      addBetHistory({
        game: 'Mines',
        betAmount,
        result: 'loss',
        payout: 0
      });

      toast.error('💣 You hit a bomb! Game over.');
      return;
    }

    // Safe tile revealed
    setBoard(newBoard);

    // Calculate current winnings
    const revealedSafeTiles = newBoard.flat().filter(cell => cell.revealed && !cell.isBomb).length;
    const multiplier = calculateMultiplier(revealedSafeTiles);
    const winnings = betAmount * multiplier;
    setCurrentWinnings(winnings);

    toast.success(`💎 Safe! Current winnings: $${winnings.toFixed(2)}`);
  };

  const calculateMultiplier = (revealedSafeTiles: number): number => {
    if (revealedSafeTiles === 0) return 1;
    const totalTiles = boardSize * boardSize;
    const safeTiles = totalTiles - bombCount;
    const baseMultiplier = 1.2;
    return Math.pow(baseMultiplier, revealedSafeTiles) * (bombCount / 5);
  };

  const cashOut = () => {
    if (gameState !== 'playing' || currentWinnings <= 0) return;

    updateBalance(currentWinnings);
    addBetHistory({
      game: 'Mines',
      betAmount,
      result: 'win',
      payout: currentWinnings
    });

    setGameState('ended');
    toast.success(`💰 Cashed out for $${currentWinnings.toFixed(2)}!`);
  };

  const resetGame = () => {
    setBoard([]);
    setGameState('setup');
    setCurrentWinnings(0);
  };

  const maxBombs = Math.floor((boardSize * boardSize) * 0.8); // Max 80% of tiles can be bombs

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Card className="bg-gradient-card border-border max-w-md mx-auto">
          <CardContent className="p-6">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground">Please login to play Mines</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate multipliers for the current board size and bomb count
  const calculateMultipliers = () => {
    const T = boardSize * boardSize; // Total tiles
    const G = T - bombCount; // Safe tiles

    const fairMult = (s: number) => (G - s) / (T - s);

    const perClickMultipliers: number[] = [];
    const cumulativeMultipliers: number[] = [];

    let cumulative = 1;
    for (let s = 0; s < G; s++) {
      const multiplier = fairMult(s);
      perClickMultipliers.push(multiplier);
      cumulative *= multiplier;
      cumulativeMultipliers.push(cumulative);
    }

    const finalFair = T / bombCount;

    return {
      perClickMultipliers,
      cumulativeMultipliers,
      finalFair,
    };
  };

  const { perClickMultipliers, cumulativeMultipliers, finalFair } = calculateMultipliers();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          <Bomb className="w-8 h-8 inline mr-2" />
          Mines
        </h1>
        <p className="text-muted-foreground">
          Navigate the minefield. Find gems, avoid bombs, cash out anytime!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Game Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bet Amount</label>
                <Input
                  type="number"
                  min="1"
                  max={user.balance}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={gameState !== 'setup'}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Number of Bombs</label>
                <Input
                  type="number"
                  min="1"
                  max={maxBombs}
                  value={bombCount}
                  onChange={(e) => setBombCount(Math.min(maxBombs, Number(e.target.value)))}
                  disabled={gameState !== 'setup'}
                  className="bg-background"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Max: {maxBombs} bombs ({boardSize}×{boardSize} grid)
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(Math.floor(betAmount / 2))}
                  disabled={gameState !== 'setup'}
                >
                  1/2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(Math.min(user.balance, betAmount * 2))}
                  disabled={gameState !== 'setup'}
                >
                  2x
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(user.balance)}
                  disabled={gameState !== 'setup'}
                >
                  Max
                </Button>
              </div>

              {gameState === 'setup' && (
                <Button 
                  variant="casino" 
                  className="w-full" 
                  onClick={startGame}
                  disabled={betAmount <= 0 || betAmount > user.balance}
                >
                  Start Game
                </Button>
              )}

              {gameState === 'playing' && currentWinnings > 0 && (
                <Button 
                  variant="default" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={cashOut}
                >
                  Cash Out ${currentWinnings.toFixed(2)}
                </Button>
              )}

              {gameState === 'ended' && (
                <Button 
                  variant="casino" 
                  className="w-full" 
                  onClick={resetGame}
                >
                  <RotateCcw className="w-5 h-5" />
                  New Game
                </Button>
              )}

              <div className="text-center p-3 bg-gradient-accent rounded-lg">
                <div className="text-sm text-muted-foreground">Current Bet</div>
                <div className="text-lg font-bold">${betAmount.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {boardSize}×{boardSize} • {bombCount} bombs
                </div>
              </div>

              <div className="text-center p-3 bg-gradient-accent rounded-lg">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-lg font-bold">${user.balance.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>
                {gameState === 'setup' && 'Setup Your Game'}
                {gameState === 'playing' && `Find the Safe Tiles! (${bombCount} bombs hidden)`}
                {gameState === 'ended' && 'Game Over'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="grid gap-2 p-4" 
                style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
              >
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-xl
                        ${!cell.revealed 
                          ? 'border-border bg-secondary hover:border-primary hover:bg-secondary/80 cursor-pointer' 
                          : cell.isBomb
                          ? 'border-red-500 bg-red-500/20 text-red-500 cursor-default'
                          : 'border-green-500 bg-green-500/20 text-green-500 cursor-default'
                        }
                        ${gameState !== 'playing' && !cell.revealed ? 'cursor-not-allowed opacity-50' : ''}
                      `}
                      onClick={() => revealTile(rowIndex, colIndex)}
                      disabled={gameState !== 'playing' || cell.revealed}
                    >
                      {cell.revealed && cell.isBomb && <Bomb className="w-6 h-6" />}
                      {cell.revealed && cell.hasMoney && <DollarSign className="w-6 h-6" />}
                    </button>
                  ))
                )}
              </div>

              {gameState === 'setup' && (
                <div className="text-center mt-4 text-muted-foreground">
                  Configure your game settings and click "Start Game" to begin
                </div>
              )}

              {gameState === 'playing' && (
                <div className="text-center mt-4">
                  <div className="text-lg font-semibold">
                    Current Winnings: 
                    <span className="text-green-400 ml-2">${currentWinnings.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Click tiles to reveal them. Cash out anytime to secure your winnings!
                  </div>
                </div>
              )}

              {/* Multipliers Info */}
              {gameState === 'playing' && (
                <div className="mt-6 p-4 bg-background rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Payout Multipliers</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Per-Click Multiplier</div>
                      {perClickMultipliers.map((mult, index) => (
                        <div key={index} className="text-xl font-bold">
                          {mult.toFixed(4)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cumulative Multiplier</div>
                      {cumulativeMultipliers.map((mult, index) => (
                        <div key={index} className="text-xl font-bold">
                          {mult.toFixed(4)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Final Payout Multiplier</div>
                      <div className="text-xl font-bold">
                        {finalFair.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}