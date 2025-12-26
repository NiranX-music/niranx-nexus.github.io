import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDeckFlashcards, Flashcard } from '@/hooks/useFlashcards';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Brain,
  Zap,
  Trophy,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type StudyMode = 'review' | 'all' | 'shuffle';

export default function FlashcardStudy() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { cards, loading, recordReview, getDueCards } = useDeckFlashcards(deckId);

  const [deck, setDeck] = useState<any>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('review');
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0,
    startTime: Date.now(),
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) return;

      try {
        const { data, error } = await supabase
          .from('flashcard_decks')
          .select('*')
          .eq('id', deckId)
          .single();

        if (error) throw error;
        setDeck(data);
      } catch (error) {
        console.error('Error fetching deck:', error);
        navigate('/niranx/flashcards');
      }
    };

    fetchDeck();
  }, [deckId, navigate]);

  useEffect(() => {
    if (!loading && cards.length > 0) {
      initializeStudySession();
    }
  }, [loading, cards, studyMode]);

  const initializeStudySession = () => {
    let cardsToStudy: Flashcard[];

    if (studyMode === 'review') {
      cardsToStudy = getDueCards();
    } else if (studyMode === 'shuffle') {
      cardsToStudy = [...cards].sort(() => Math.random() - 0.5);
    } else {
      cardsToStudy = [...cards];
    }

    setStudyCards(cardsToStudy);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setSessionStats({
      reviewed: 0,
      correct: 0,
      incorrect: 0,
      startTime: Date.now(),
    });
  };

  const currentCard = studyCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: number) => {
    if (!currentCard) return;

    await recordReview(currentCard.id, rating);

    setSessionStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      correct: rating >= 3 ? prev.correct + 1 : prev.correct,
      incorrect: rating < 3 ? prev.incorrect + 1 : prev.incorrect,
    }));

    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case '1':
          if (isFlipped) handleRating(1);
          break;
        case '2':
          if (isFlipped) handleRating(2);
          break;
        case '3':
          if (isFlipped) handleRating(3);
          break;
        case '4':
          if (isFlipped) handleRating(4);
          break;
        case '5':
          if (isFlipped) handleRating(5);
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < studyCards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
          }
          break;
      }
    },
    [isFlipped, isComplete, currentIndex, studyCards.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getSessionDuration = () => {
    const duration = Math.round((Date.now() - sessionStats.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (studyCards.length === 0 && !loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/niranx/flashcards/${deckId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deck
        </Button>

        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
            <p className="text-muted-foreground mb-6">
              {studyMode === 'review'
                ? 'No cards are due for review right now. Check back later!'
                : 'This deck has no cards. Add some to start studying.'}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStudyMode('all');
                  setStudyCards(cards);
                }}
              >
                Study All Cards
              </Button>
              <Button onClick={() => navigate(`/niranx/flashcards/${deckId}`)}>
                Back to Deck
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.reviewed) * 100);

    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-20 w-20 mx-auto mb-6 text-yellow-500" />
              <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground mb-8">Great job studying!</p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{sessionStats.reviewed}</div>
                  <div className="text-sm text-muted-foreground">Cards Reviewed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{getSessionDuration()}</div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={initializeStudySession}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Study Again
                </Button>
                <Button onClick={() => navigate(`/niranx/flashcards/${deckId}`)}>
                  Back to Deck
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/niranx/flashcards/${deckId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {currentIndex + 1} / {studyCards.length}
          </Badge>
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {getSessionDuration()}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Progress
        value={((currentIndex + 1) / studyCards.length) * 100}
        className="mb-6 h-2"
      />

      {/* Flashcard */}
      <div className="perspective-1000 mb-6">
        <motion.div
          className="relative w-full aspect-[4/3] cursor-pointer"
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <Card
            className={cn(
              'absolute inset-0 backface-hidden flex items-center justify-center p-8',
              isFlipped && 'invisible'
            )}
          >
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-4">
                Question
              </Badge>
              <p className="text-xl font-medium">{currentCard?.question}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Click or press Space to reveal answer
              </p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              'absolute inset-0 backface-hidden flex items-center justify-center p-8',
              !isFlipped && 'invisible'
            )}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <CardContent className="text-center">
              <Badge variant="default" className="mb-4">
                Answer
              </Badge>
              <p className="text-xl font-medium">{currentCard?.answer}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <p className="text-center text-sm text-muted-foreground">
              How well did you know this?
            </p>
            <div className="grid grid-cols-5 gap-2">
              <Button
                variant="outline"
                className="flex-col py-4 border-red-500/50 hover:bg-red-500/10"
                onClick={() => handleRating(1)}
              >
                <X className="h-5 w-5 mb-1 text-red-500" />
                <span className="text-xs">Again</span>
                <span className="text-xs text-muted-foreground">(1)</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col py-4 border-orange-500/50 hover:bg-orange-500/10"
                onClick={() => handleRating(2)}
              >
                <span className="text-lg mb-1">😕</span>
                <span className="text-xs">Hard</span>
                <span className="text-xs text-muted-foreground">(2)</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col py-4 border-yellow-500/50 hover:bg-yellow-500/10"
                onClick={() => handleRating(3)}
              >
                <Check className="h-5 w-5 mb-1 text-yellow-500" />
                <span className="text-xs">Good</span>
                <span className="text-xs text-muted-foreground">(3)</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col py-4 border-green-500/50 hover:bg-green-500/10"
                onClick={() => handleRating(4)}
              >
                <Zap className="h-5 w-5 mb-1 text-green-500" />
                <span className="text-xs">Easy</span>
                <span className="text-xs text-muted-foreground">(4)</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col py-4 border-emerald-500/50 hover:bg-emerald-500/10"
                onClick={() => handleRating(5)}
              >
                <Trophy className="h-5 w-5 mb-1 text-emerald-500" />
                <span className="text-xs">Perfect</span>
                <span className="text-xs text-muted-foreground">(5)</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          disabled={currentIndex === 0}
          onClick={() => {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="ghost"
          disabled={currentIndex === studyCards.length - 1}
          onClick={() => {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
          }}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Keyboard: Space to flip, 1-5 to rate, ← → to navigate
      </p>
    </div>
  );
}
