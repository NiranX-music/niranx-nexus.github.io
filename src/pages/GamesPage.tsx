import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2, 
  Trophy, 
  Timer, 
  Star, 
  Play,
  RotateCcw,
  Zap,
  Brain,
  Target,
  Keyboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameStats {
  gamesPlayed: number;
  totalXP: number;
  highScores: { [gameId: string]: number };
  achievements: string[];
}

interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: any;
  xpReward: number;
  timeLimit: number;
  category: string;
}

const GamesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesPlayed: 0,
    totalXP: 0,
    highScores: {},
    achievements: []
  });

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<{ id: number; value: string; flipped: boolean; matched: boolean }[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryFlippedCards, setMemoryFlippedCards] = useState<number[]>([]);

  // Typing Game State
  const [typingText, setTypingText] = useState('');
  const [typingInput, setTypingInput] = useState('');
  const [typingWPM, setTypingWPM] = useState(0);
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);

  // Quick Math State
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
  const [mathInput, setMathInput] = useState('');
  const [mathScore, setMathScore] = useState(0);
  const [mathTimeLeft, setMathTimeLeft] = useState(60);

  const miniGames: MiniGame[] = [
    {
      id: 'memory',
      name: 'Memory Flip',
      description: 'Match pairs of cards to boost your memory',
      icon: Brain,
      xpReward: 15,
      timeLimit: 120,
      category: 'Memory'
    },
    {
      id: 'typing',
      name: 'Typing Dash',
      description: 'Type as fast as you can to improve WPM',
      icon: Keyboard,
      xpReward: 20,
      timeLimit: 60,
      category: 'Skills'
    },
    {
      id: 'math',
      name: 'Quick Math',
      description: 'Solve math problems rapidly',
      icon: Target,
      xpReward: 25,
      timeLimit: 60,
      category: 'Brain'
    },
    {
      id: 'focus',
      name: 'Focus Challenge',
      description: 'Test your concentration skills',
      icon: Zap,
      xpReward: 30,
      timeLimit: 90,
      category: 'Focus'
    }
  ];

  useEffect(() => {
    if (user) {
      (supabase as any).from('game_stats').select('*').eq('user_id', user.id).then(({ data }: any) => {
        if (data && data.length > 0) {
          const combined = { gamesPlayed: 0, totalXP: 0, highScores: {} as any, achievements: [] as string[] };
          data.forEach((row: any) => {
            combined.gamesPlayed += row.games_played || 0;
            combined.totalXP += row.total_xp || 0;
            combined.highScores[row.game_type] = row.high_score || 0;
          });
          setGameStats(combined);
        }
      });
    }
  }, [user]);

  const startGame = (gameId: string) => {
    setCurrentGame(gameId);
    
    switch (gameId) {
      case 'memory':
        initMemoryGame();
        break;
      case 'typing':
        initTypingGame();
        break;
      case 'math':
        initMathGame();
        break;
    }
  };

  const endGame = (gameId: string, score: number) => {
    const game = miniGames.find(g => g.id === gameId);
    if (!game) return;

    const currentHighScore = gameStats?.highScores?.[gameId] || 0;
    const isHighScore = score > currentHighScore;
    
    setGameStats(prev => ({
      ...prev,
      gamesPlayed: (prev.gamesPlayed || 0) + 1,
      totalXP: (prev.totalXP || 0) + game.xpReward,
      highScores: {
        ...(prev.highScores || {}),
        [gameId]: Math.max(currentHighScore, score)
      }
    }));

    toast({
      title: isHighScore ? "New High Score! 🏆" : "Game Complete! 🎮",
      description: `+${game.xpReward} XP earned!`
    });

    setCurrentGame(null);
  };

  // Memory Game Logic
  const initMemoryGame = () => {
    const symbols = ['🎯', '🧠', '⚡', '🎮', '🏆', '🔥', '💡', '🚀'];
    const cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        value: symbol,
        flipped: false,
        matched: false
      }));
    
    setMemoryCards(cards);
    setMemoryScore(0);
    setMemoryMoves(0);
    setMemoryFlippedCards([]);
  };

  const flipCard = (cardId: number) => {
    if (memoryFlippedCards.length === 2) return;
    if (memoryCards[cardId].flipped || memoryCards[cardId].matched) return;

    const newFlippedCards = [...memoryFlippedCards, cardId];
    setMemoryFlippedCards(newFlippedCards);

    setMemoryCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, flipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMemoryMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [first, second] = newFlippedCards;
        const firstCard = memoryCards[first];
        const secondCard = memoryCards[second];

        if (firstCard.value === secondCard.value) {
          setMemoryCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, matched: true } 
              : card
          ));
          setMemoryScore(prev => prev + 10);
          
          // Check if game is complete
          const allMatched = memoryCards.every(card => 
            card.id === first || card.id === second || card.matched
          );
          if (allMatched) {
            endGame('memory', memoryScore + 10);
          }
        } else {
          setMemoryCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, flipped: false } 
              : card
          ));
        }
        
        setMemoryFlippedCards([]);
      }, 1000);
    }
  };

  // Typing Game Logic
  const initTypingGame = () => {
    const texts = [
      "The quick brown fox jumps over the lazy dog",
      "Programming is the art of telling another human what one wants the computer to do",
      "Success is not final failure is not fatal it is the courage to continue that counts",
      "Innovation distinguishes between a leader and a follower"
    ];
    setTypingText(texts[Math.floor(Math.random() * texts.length)]);
    setTypingInput('');
    setTypingWPM(0);
    setTypingStartTime(null);
  };

  const handleTypingInput = (value: string) => {
    if (!typingStartTime) {
      setTypingStartTime(Date.now());
    }

    setTypingInput(value);

    if (value === typingText) {
      const timeElapsed = (Date.now() - (typingStartTime || Date.now())) / 1000 / 60;
      const wpm = Math.round((typingText.split(' ').length / timeElapsed));
      setTypingWPM(wpm);
      endGame('typing', wpm);
    }
  };

  // Math Game Logic
  const initMathGame = () => {
    setMathScore(0);
    setMathTimeLeft(60);
    generateMathQuestion();
    
    const timer = setInterval(() => {
      setMathTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame('math', mathScore);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateMathQuestion = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;
    let answer = 0;

    switch (operation) {
      case '+':
        answer = a + b;
        break;
      case '-':
        if (a < b) [a, b] = [b, a]; // Ensure positive result
        answer = a - b;
        break;
      case '*':
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a * b;
        break;
    }

    setMathQuestion({
      question: `${a} ${operation} ${b} = ?`,
      answer
    });
  };

  const checkMathAnswer = () => {
    if (parseInt(mathInput) === mathQuestion.answer) {
      setMathScore(prev => prev + 1);
      generateMathQuestion();
      setMathInput('');
    }
  };

  const renderGameContent = () => {
    switch (currentGame) {
      case 'memory':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">Score: {memoryScore}</Badge>
              <Badge variant="outline">Moves: {memoryMoves}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {memoryCards.map((card) => (
                <Button
                  key={card.id}
                  onClick={() => flipCard(card.id)}
                  className={`h-16 text-2xl ${
                    card.flipped || card.matched 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary'
                  }`}
                  disabled={card.matched}
                >
                  {card.flipped || card.matched ? card.value : '?'}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'typing':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">WPM: {typingWPM}</Badge>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-lg leading-relaxed">{typingText}</p>
            </div>
            <textarea
              value={typingInput}
              onChange={(e) => handleTypingInput(e.target.value)}
              placeholder="Start typing here..."
              className="w-full h-32 p-3 border rounded-lg resize-none"
            />
            <Progress 
              value={(typingInput.length / typingText.length) * 100} 
              className="h-2"
            />
          </div>
        );

      case 'math':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-between items-center">
              <Badge variant="outline">Score: {mathScore}</Badge>
              <Badge variant="outline">Time: {mathTimeLeft}s</Badge>
            </div>
            <div className="text-4xl font-bold py-8">
              {mathQuestion.question}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={mathInput}
                onChange={(e) => setMathInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkMathAnswer()}
                className="flex-1 p-3 border rounded-lg text-center text-xl"
                placeholder="Answer"
              />
              <Button onClick={checkMathAnswer}>
                Check
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentGame) {
    const game = miniGames.find(g => g.id === currentGame);
    return (
      <div className="min-h-screen p-6 pb-20">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {game && <game.icon className="w-6 h-6" />}
                {game?.name}
              </CardTitle>
              <Button
                onClick={() => setCurrentGame(null)}
                variant="outline"
                size="sm"
              >
                Exit Game
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderGameContent()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Games Arcade
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{gameStats.gamesPlayed}</div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{gameStats.totalXP}</div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Object.keys(gameStats?.highScores || {}).length}</div>
              <div className="text-sm text-muted-foreground">High Scores</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {miniGames.map((game) => {
          const Icon = game.icon;
          const highScore = gameStats?.highScores?.[game.id];
          
          return (
            <Card key={game.id} className="glass-card hover:scale-105 transition-transform">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {game.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">+{game.xpReward} XP</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Timer className="w-3 h-3" />
                      {game.timeLimit}s
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{game.description}</p>
                
                {highScore && (
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">High Score: {highScore}</span>
                  </div>
                )}
                
                <Button 
                  onClick={() => startGame(game.id)}
                  className="w-full glass-button"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Game
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievement Section */}
      <Card className="glass-card mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Play games to unlock achievements!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesPage;