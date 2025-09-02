import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { LoginDialog } from '@/components/LoginDialog';
import { toast } from 'sonner';
import {
  Dices,
  ArrowLeft,
  DollarSign,
  Target,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

type Mode = 'under' | 'over';

const SLIDER_MIN = 2;
const SLIDER_MAX = 99;

const Dice = () => {
  const { user, updateBalance, addBetHistory } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [rollTarget, setRollTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<'win' | 'loss' | null>(null);
  const [mode, setMode] = useState<Mode>('under');
  const [dicePos, setDicePos] = useState<number | null>(null); // null means not shown

  // Animate dice to stop at result
  const animateDiceTo = (final: number, cb: () => void) => {
    // Animate dice to the rolled number (single smooth animation)
    const start = dicePos === null ? rollTarget : dicePos;
    const distance = final - start;
    const duration = 400;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      if (elapsed >= duration) {
        setDicePos(final);
        cb();
        return;
      }
      const progress = elapsed / duration;
      setDicePos(start + distance * progress);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  };

  const rollDice = async () => {
    if (betAmount > user.balance) {
      toast.error('Insufficient balance!');
      return;
    }
    if (betAmount < 1) {
      toast.error('Minimum bet is $1');
      return;
    }
    if (
      (mode === 'under' && (rollTarget <= SLIDER_MIN || rollTarget >= SLIDER_MAX + 1)) ||
      (mode === 'over' && (rollTarget <= SLIDER_MIN - 1 || rollTarget >= SLIDER_MAX))
    ) {
      toast.error('Invalid roll target!');
      return;
    }
    setIsRolling(true);
    // Deduct bet amount
    updateBalance(-betAmount);

    // Simulate rolling
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 100) + 1; // 1-100
      const won =
        mode === 'under'
          ? roll < rollTarget
          : roll > rollTarget;
      // Animate dice to result
      animateDiceTo(roll, () => {
        setLastRoll(roll);
        setLastResult(won ? 'win' : 'loss');
        setIsRolling(false);
        if (won) {
          const winAmount = betAmount * payoutMultiplier;
          updateBalance(winAmount);
          addBetHistory({
            game: 'Dice',
            betAmount,
            result: 'win',
            payout: winAmount
          });
          toast.success(`🎉 You won $${winAmount.toFixed(2)}! Rolled ${roll}`);
        } else {
          addBetHistory({
            game: 'Dice',
            betAmount,
            result: 'loss',
            payout: 0
          });
          toast.error(`💥 You lost! Rolled ${roll}`);
        }
      });
    }, 400); // fast response
  };

  const resetGame = () => {
    setLastRoll(null);
    setLastResult(null);
    // Do not reset dicePos here, so it stays at last rolled position
  };

  // --- UI ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#132632] px-2">
      <Card className="w-full max-w-2xl bg-gradient-card border-border shadow-xl">
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 rounded-lg flex items-center justify-center">
                <Dices className="w-6 h-6 text-neon-blue" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Dice</h1>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant={mode === 'under' ? 'casino' : 'outline'}
                className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'under' ? 'shadow-glow-primary' : ''}`}
                onClick={() => setMode('under')}
                disabled={isRolling}
              >
                Roll Under
              </Button>
              <Button
                type="button"
                variant={mode === 'over' ? 'casino' : 'outline'}
                className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'over' ? 'shadow-glow-primary' : ''}`}
                onClick={() => setMode('over')}
                disabled={isRolling}
              >
                Roll Over
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Target Number */}
          <div className="flex flex-col items-center mb-6">
            <span className="text-lg text-muted-foreground mb-1">
              Target Number
            </span>
            <span className="text-5xl font-extrabold text-primary drop-shadow-lg mb-2">
              {rollTarget}
            </span>
          </div>
          {/* Slider with Dice Animation */}
          <div className="relative w-full flex flex-col items-center mb-8">
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full" style={{ height: 64 }}>
                {/* Slider Track */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 rounded-full bg-gradient-to-r from-neon-blue/30 via-secondary/60 to-casino-red/30 shadow-inner" />
                {/* Ticks */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-10">
                  <span className="text-xs text-muted-foreground">2</span>
                  <span className="text-xs text-muted-foreground">50</span>
                  <span className="text-xs text-muted-foreground">99</span>
                </div>
                {/* Draggable Target Square */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 z-20 transition-transform"
                  style={{
                    left: `calc(${getPercent(rollTarget)}% - 24px)`,
                    transition: isRolling ? 'none' : 'left 0.2s',
                    cursor: isRolling ? 'not-allowed' : 'grab'
                  }}
                  tabIndex={0}
                  aria-label="Target Number"
                  role="slider"
                  aria-valuenow={rollTarget}
                  aria-valuemin={SLIDER_MIN}
                  aria-valuemax={SLIDER_MAX}
                  onKeyDown={e => {
                    if (isRolling) return;
                    if (e.key === 'ArrowLeft' && rollTarget > SLIDER_MIN) setRollTarget(rollTarget - 1);
                    if (e.key === 'ArrowRight' && rollTarget < SLIDER_MAX) setRollTarget(rollTarget + 1);
                  }}
                  onMouseDown={e => {
                    if (isRolling) return;
                    const slider = e.currentTarget.parentElement!;
                    const onMove = (moveEvent: MouseEvent) => {
                      const rect = slider.getBoundingClientRect();
                      let percent = (moveEvent.clientX - rect.left) / rect.width;
                      percent = Math.max(0, Math.min(1, percent));
                      const value = Math.round(SLIDER_MIN + percent * (SLIDER_MAX - SLIDER_MIN));
                      setRollTarget(value);
                    };
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove);
                      window.removeEventListener('mouseup', onUp);
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                  onTouchStart={e => {
                    if (isRolling) return;
                    const slider = e.currentTarget.parentElement!;
                    const onMove = (moveEvent: TouchEvent) => {
                      const rect = slider.getBoundingClientRect();
                      let percent = (moveEvent.touches[0].clientX - rect.left) / rect.width;
                      percent = Math.max(0, Math.min(1, percent));
                      const value = Math.round(SLIDER_MIN + percent * (SLIDER_MAX - SLIDER_MIN));
                      setRollTarget(value);
                    };
                    const onUp = () => {
                      window.removeEventListener('touchmove', onMove);
                      window.removeEventListener('touchend', onUp);
                    };
                    window.addEventListener('touchmove', onMove);
                    window.addEventListener('touchend', onUp);
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-background to-secondary border-2 border-neon-blue flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-primary">{rollTarget}</span>
                  </div>
                </div>
                {/* Dice Animation (only after rolling or while rolling) */}
                {(isRolling || lastRoll !== null) && dicePos !== null && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 z-30 transition-transform pointer-events-none"
                    style={{
                      left: `calc(${getPercent(dicePos)}% - 24px)`,
                      transition: 'left 0.4s cubic-bezier(.4,2,.6,1)'
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-background to-secondary border-2 border-neon-blue flex items-center justify-center shadow-lg">
                      <Dices className="w-8 h-8 text-neon-blue" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-14 text-xs text-muted-foreground font-bold">
                      {Math.round(dicePos)}
                    </div>
                  </div>
                )}
                {/* Slider Input (hidden, but accessible for a11y) */}
                <input
                  type="range"
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  value={rollTarget}
                  onChange={e => setRollTarget(Number(e.target.value))}
                  disabled={isRolling}
                  className="w-full opacity-0 absolute top-0 left-0 h-full cursor-pointer"
                  style={{ zIndex: 30 }}
                  aria-label="Roll Target"
                />
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Bet Amount</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                min={1}
                max={user.balance}
                step={0.01}
                className="bg-secondary"
                disabled={isRolling}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Win Chance</span>
                <span>Payout</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-success">{winChance}%</span>
                <span className="text-casino-gold">{payoutMultiplier.toFixed(4)}x</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-xs text-muted-foreground mb-1">Potential Win</div>
              <div className="text-success font-bold text-lg">${potentialWin.toFixed(2)}</div>
            </div>
          </div>
          {/* Roll/Reset Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              variant="casino"
              size="xl"
              className="w-full"
              onClick={rollDice}
              disabled={isRolling || betAmount > user.balance}
            >
              <Target className="w-5 h-5" />
              {isRolling ? 'Rolling...' : `Roll Dice - $${betAmount.toFixed(2)}`}
            </Button>
            {(lastRoll !== null || lastResult !== null) && !isRolling && (
              <Button
                variant="outline"
                className="w-full"
                onClick={resetGame}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>
          {/* Result */}
          <div className="flex flex-col items-center mt-8">
            {isRolling ? (
              <div className="text-lg font-medium text-neon-blue animate-pulse">
                Rolling...
              </div>
            ) : lastRoll !== null ? (
              <>
                <div className={`text-2xl font-bold mb-2 ${
                  lastResult === 'win' ? 'text-success' : 'text-casino-red'
                }`}>
                  {lastResult === 'win' ? '🎉 You Won!' : '💥 You Lost!'}
                </div>
                <div className="text-muted-foreground">
                  Rolled {lastRoll}, needed {mode === 'under' ? 'under' : 'over'} {rollTarget}
                </div>
              </>
            ) : (
              <div className="text-lg text-muted-foreground">
                Ready to roll!
              </div>
            )}
          </div>
          {/* How to Play */}
          <div className="mt-8">
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Set your bet amount and choose a target number</p>
                <p>• Select "Roll Under" or "Roll Over" mode</p>
                <p>• The dice will roll and stop at a random number</p>
                <p>• Win if the dice lands {mode === 'under' ? 'under' : 'over'} your target</p>
                <p>• House edge: 2% (built into payout calculations)</p>
              </CardContent>
            </Card>
          </div>
          {/* Balance & Back */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <Card className="flex-1 bg-gradient-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-casino-gold" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${user.balance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full md:w-auto mt-4 md:mt-0" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dice;