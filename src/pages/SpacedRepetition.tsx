import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Clock, CheckCircle, XCircle, RotateCcw,
  Calendar, TrendingUp, Zap, Star, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Card {
  id: string;
  question: string;
  answer: string;
  interval: number;
  easeFactor: number;
  nextReview: Date;
  repetitions: number;
}

const sampleCards: Card[] = [
  {
    id: "1",
    question: "What is the mitochondria?",
    answer: "The powerhouse of the cell - produces ATP through cellular respiration",
    interval: 1,
    easeFactor: 2.5,
    nextReview: new Date(),
    repetitions: 0,
  },
  {
    id: "2",
    question: "What is Newton's First Law?",
    answer: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force",
    interval: 1,
    easeFactor: 2.5,
    nextReview: new Date(),
    repetitions: 0,
  },
  {
    id: "3",
    question: "What is the quadratic formula?",
    answer: "x = (-b ± √(b² - 4ac)) / 2a",
    interval: 1,
    easeFactor: 2.5,
    nextReview: new Date(),
    repetitions: 0,
  },
];

export default function SpacedRepetition() {
  const [cards, setCards] = useState<Card[]>(sampleCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, incorrect: 0 });
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentCard = cards[currentIndex];
  const dueCards = cards.filter(c => new Date(c.nextReview) <= new Date());
  const progress = ((sessionStats.reviewed) / cards.length) * 100;

  const calculateNextInterval = (card: Card, quality: number): { interval: number; easeFactor: number } => {
    // SM-2 algorithm implementation
    let newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor);

    let newInterval: number;
    if (quality < 3) {
      newInterval = 1;
    } else if (card.repetitions === 0) {
      newInterval = 1;
    } else if (card.repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.interval * newEaseFactor);
    }

    return { interval: newInterval, easeFactor: newEaseFactor };
  };

  const handleResponse = (quality: 1 | 2 | 3 | 4 | 5) => {
    const { interval, easeFactor } = calculateNextInterval(currentCard, quality);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    setCards(prev => prev.map(c => 
      c.id === currentCard.id 
        ? { ...c, interval, easeFactor, nextReview, repetitions: c.repetitions + 1 }
        : c
    ));

    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect,
    }));

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setIsSessionComplete(true);
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 });
    setIsSessionComplete(false);
  };

  const responseButtons = [
    { quality: 1 as const, label: "Again", color: "bg-red-500 hover:bg-red-600", desc: "Complete blackout" },
    { quality: 2 as const, label: "Hard", color: "bg-orange-500 hover:bg-orange-600", desc: "Incorrect but close" },
    { quality: 3 as const, label: "Good", color: "bg-blue-500 hover:bg-blue-600", desc: "Correct with effort" },
    { quality: 4 as const, label: "Easy", color: "bg-green-500 hover:bg-green-600", desc: "Perfect response" },
  ];

  if (isSessionComplete) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-8">
              <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground mb-6">Great job reviewing your cards</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-3xl font-bold">{sessionStats.reviewed}</p>
                  <p className="text-sm text-muted-foreground">Reviewed</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10">
                  <p className="text-3xl font-bold text-green-500">{sessionStats.correct}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10">
                  <p className="text-3xl font-bold text-red-500">{sessionStats.incorrect}</p>
                  <p className="text-sm text-muted-foreground">To Review</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={restartSession} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Study Again
                </Button>
                <Button>
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Back to Decks
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Spaced Repetition</h1>
              <p className="text-muted-foreground">Optimize your memory retention</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {dueCards.length} due
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Session Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {cards.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Flashcard */}
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <Card
            className="border-border/50 bg-card/50 backdrop-blur cursor-pointer min-h-[300px] flex flex-col"
            onClick={() => setShowAnswer(true)}
          >
            <CardContent className="flex-1 flex flex-col justify-center items-center p-8 text-center">
              <AnimatePresence mode="wait">
                {!showAnswer ? (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                  >
                    <Badge className="mb-4">Question</Badge>
                    <p className="text-xl font-medium">{currentCard.question}</p>
                    <p className="text-sm text-muted-foreground mt-6">
                      Click to reveal answer
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                  >
                    <Badge variant="secondary" className="mb-4">Answer</Badge>
                    <p className="text-xl font-medium">{currentCard.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Buttons */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {responseButtons.map((btn) => (
                <Button
                  key={btn.quality}
                  onClick={() => handleResponse(btn.quality)}
                  className={`${btn.color} text-white h-auto py-3 flex flex-col`}
                >
                  <span className="font-semibold">{btn.label}</span>
                  <span className="text-xs opacity-80">{btn.desc}</span>
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{sessionStats.reviewed}</p>
              <p className="text-xs text-muted-foreground">Reviewed</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-500">{sessionStats.correct}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">
                {sessionStats.reviewed > 0 
                  ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) 
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
