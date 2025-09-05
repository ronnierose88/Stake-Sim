import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Bomb, DollarSign, AlertTriangle, RotateCcw } from 'lucide-react';

type GameState = 'setup' | 'playing' | 'ended';
type Cell = { revealed: boolean; isBomb: boolean; hasMoney: boolean };

const probabilities = {
  1: [1.04, 1.09, 1.14, 1.19, 1.25, 1.32, 1.39, 1.47, 1.56, 1.67, 1.79, 1.92, 2.08, 2.27, 2.50, 2.78, 3.12, 3.57, 4.17, 5.00, 6.25, 8.33, 12.50, 25.00],
  2: [1.09, 1.19, 1.30, 1.43, 1.58, 1.75, 1.96, 2.21, 2.50, 2.86, 3.30, 3.85, 4.55, 5.45, 6.67, 8.33, 10.71, 14.29, 20.00, 30.00, 50.00, 100.00, 300.00],
  3: [1.14, 1.30, 1.49, 1.73, 2.02, 2.37, 2.82, 3.38, 4.11, 5.05, 6.32, 8.04, 10.45, 13.94, 19.17, 27.38, 41.07, 65.71, 115.00, 230.00, 575.00, 2300.00],
  4: [1.19, 1.43, 1.73, 2.11, 2.61, 3.26, 4.13, 5.32, 6.95, 9.27, 12.64, 17.69, 25.56, 38.33, 60.24, 100.40, 180.71, 361.43, 843.33, 2530.00, 12650.00],
  5: [1.25, 1.58, 2.02, 2.61, 3.43, 4.57, 6.20, 8.59, 12.16, 17.69, 26.54, 41.28, 67.08, 115.00, 210.83, 421.67, 948.75, 2530.00, 8855.00, 53130.00],
  6: [1.32, 1.75, 2.37, 3.26, 4.57, 6.53, 9.54, 14.31, 22.12, 35.38, 58.97, 103.21, 191.67, 383.33, 843.33, 2108.33, 6325.00, 25300.00, 177100.00],
  7: [1.39, 1.96, 2.82, 4.13, 6.20, 9.54, 15.10, 24.72, 42.02, 74.70, 140.06, 280.13, 606.94, 1456.67, 4005.83, 13352.78, 60087.50, 480700.00],
  8: [1.47, 2.21, 3.38, 5.32, 8.59, 14.31, 24.72, 44.49, 84.04, 168.08, 360.16, 840.38, 2185.00, 6555.00, 24035.00, 120175.00, 1081575.00],
  9: [1.56, 2.50, 4.11, 6.95, 12.16, 22.12, 42.02, 84.04, 178.58, 408.19, 1020.47, 2857.31, 9286.25, 37145.00, 204297.50, 2042975.00],
  10: [1.67, 2.86, 5.05, 9.27, 17.69, 35.38, 74.70, 168.08, 408.19, 1088.50, 3265.49, 11429.23, 49526.67, 297160.00, 3268760.00],
  11: [1.79, 3.30, 6.32, 12.64, 26.54, 58.97, 140.06, 360.16, 1020.47, 3265.49, 12245.60, 57146.15, 371450.00, 4457400.00],
  12: [1.92, 3.85, 8.04, 17.69, 41.28, 103.21, 280.13, 840.38, 2857.31, 11429.23, 57146.15, 400023.08, 5200300.00],
  13: [2.08, 4.55, 10.45, 25.56, 67.08, 191.67, 606.94, 2185.00, 9286.25, 49526.67, 371450.00, 5200300.00],
  14: [2.27, 5.45, 13.94, 38.33, 115.00, 383.33, 1456.67, 6555.00, 37145.00, 297160.00, 4457400.00],
  15: [2.50, 6.67, 19.17, 60.24, 210.83, 843.33, 4005.83, 24035.00, 204297.50, 3268760.00],
  16: [2.78, 8.33, 27.38, 100.40, 421.67, 2108.33, 13352.78, 120175.00, 2042975.00],
  17: [3.12, 10.71, 41.07, 180.71, 948.75, 6325.00, 60087.50, 1081575.00],
  18: [3.57, 14.29, 65.71, 361.43, 2530.00, 25300.00, 480700.00],
  19: [4.17, 20.00, 115.00, 843.33, 8855.00, 177100.00],
  20: [5.00, 30.00, 230.00, 2530.00, 53130.00],
  21: [6.25, 50.00, 575.00, 12650.00],
  22: [8.33, 100.00, 2300.00],
  23: [12.50, 300.00],
  24: [25.00]
};

export default function Mines() {
  const { user, updateBalance, addBetHistory } = useUser();
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<GameState>('setup');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [currentWinnings, setCurrentWinnings] = useState(0);
  const [mines, setMines] = useState(5); // Default number of mines

  const boardSize = 5; // Fixed board size to 5x5

  const startGame = () => {
    if (!user || betAmount <= 0 || betAmount > user.balance) {
      toast.error('Invalid bet amount');
      return;
    }

    const totalTiles = boardSize * boardSize;
    if (mines >= totalTiles) {
      toast.error('Too many mines for board size');
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
    while (bombPositions.size < mines) {
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

    toast.success(`Game started! Find the safe tiles and avoid ${mines} bombs.`);
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
    const multiplier = calculateMultiplier(revealedSafeTiles, mines);
    const winnings = betAmount * multiplier;
    setCurrentWinnings(winnings);

    toast.success(`💎 Safe! Current winnings: $${winnings.toFixed(2)}`);
  };

  const calculateMultiplier = (safeTiles: number, mines: number): number => {
    return probabilities[mines][safeTiles - 1]; // Adjusted for 0-based index
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
    const G = T - mines; // Safe tiles

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

    const finalFair = T / mines;

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

              {/* Mines Slider */}
              <div>
                <label className="text-sm font-medium mb-2 block">Number of Mines</label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={mines}
                  onChange={(e) => setMines(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center mt-2">{mines} Mines</p>
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
                  {boardSize}×{boardSize} • {mines} bombs
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
                {gameState === 'playing' && `Find the Safe Tiles! (${mines} bombs hidden)`}
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