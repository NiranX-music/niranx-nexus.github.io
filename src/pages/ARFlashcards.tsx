import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Glasses, Camera, CameraOff, RotateCcw, 
  ChevronLeft, ChevronRight, Eye, EyeOff,
  Sparkles, Volume2, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FlashcardDeck {
  id: string;
  title: string;
  card_count: number;
  subject: string | null;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export default function ARFlashcards() {
  const [cameraActive, setCameraActive] = useState(false);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardsViewed, setCardsViewed] = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDecks();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      loadCards(selectedDeck);
    }
  }, [selectedDeck]);

  const loadDecks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('id, title, card_count, subject')
      .eq('user_id', user.id);

    if (!error && data) {
      setDecks(data);
    }
  };

  const loadCards = async (deckId: string) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('id, question, answer')
      .eq('deck_id', deckId);

    if (!error && data) {
      setCards(data);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setCardsViewed(0);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setSessionStart(new Date());
        toast({ title: "Camera activated", description: "AR mode is now active" });
      }
    } catch (error) {
      toast({ 
        title: "Camera access denied", 
        description: "Please allow camera access for AR mode",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    saveSession();
  };

  const saveSession = async () => {
    if (!sessionStart || cardsViewed === 0) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const duration = Math.round((new Date().getTime() - sessionStart.getTime()) / 1000);
    
    await supabase.from('ar_flashcard_sessions').insert({
      user_id: user.id,
      deck_id: selectedDeck,
      cards_viewed: cardsViewed,
      duration_seconds: duration,
    });
  };

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
      setCardsViewed(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* AR View */}
      {cameraActive ? (
        <div className="relative h-screen w-full">
          {/* Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* AR Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
              <Button variant="secondary" size="sm" onClick={stopCamera}>
                <CameraOff className="h-4 w-4 mr-2" />
                Exit AR
              </Button>
              <Badge variant="secondary" className="bg-black/50 text-white">
                Card {currentCardIndex + 1} of {cards.length}
              </Badge>
            </div>

            {/* Floating Flashcard */}
            {currentCard && (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <motion.div
                  key={currentCardIndex + (showAnswer ? '-answer' : '-question')}
                  initial={{ opacity: 0, scale: 0.8, rotateY: showAnswer ? -90 : 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-full max-w-lg"
                >
                  <Card 
                    className="backdrop-blur-xl bg-white/90 dark:bg-black/80 border-white/20 shadow-2xl cursor-pointer"
                    onClick={() => setShowAnswer(!showAnswer)}
                  >
                    <CardHeader className="text-center pb-2">
                      <Badge variant={showAnswer ? "default" : "secondary"} className="mx-auto">
                        {showAnswer ? "Answer" : "Question"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-center py-8 px-6">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={showAnswer ? 'answer' : 'question'}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xl font-medium"
                        >
                          {showAnswer ? currentCard.answer : currentCard.question}
                        </motion.p>
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex justify-center items-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full h-14 w-14 bg-white/80"
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </Button>
                
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full h-14 w-14 bg-white/80"
                  onClick={nextCard}
                  disabled={currentCardIndex === cards.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              
              <p className="text-center text-white/80 text-sm mt-4">
                Tap the card to flip • {cardsViewed} cards reviewed
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Setup View */
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Glasses className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AR Flashcards
              </h1>
            </div>
            <p className="text-muted-foreground">
              Study flashcards in augmented reality through your camera
            </p>
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Camera className="h-5 w-5" />, title: "Camera View", desc: "Cards float over your surroundings" },
              { icon: <Sparkles className="h-5 w-5" />, title: "Spatial Memory", desc: "Learn better with visual context" },
              { icon: <BookOpen className="h-5 w-5" />, title: "Any Deck", desc: "Use any of your flashcard decks" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mx-auto mb-3">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Deck Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Deck</CardTitle>
              <CardDescription>Choose which flashcard deck to study in AR mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {decks.length > 0 ? (
                <>
                  <Select value={selectedDeck || ""} onValueChange={setSelectedDeck}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a flashcard deck..." />
                    </SelectTrigger>
                    <SelectContent>
                      {decks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          <div className="flex items-center gap-2">
                            <span>{deck.title}</span>
                            <Badge variant="secondary">{deck.card_count} cards</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedDeck && cards.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-xl bg-accent/50 text-center">
                        <p className="text-lg font-medium">{cards.length} cards ready</p>
                        <p className="text-sm text-muted-foreground">
                          Make sure you're in a well-lit area
                        </p>
                      </div>

                      <Button 
                        onClick={startCamera} 
                        className="w-full h-14 text-lg"
                        size="lg"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Start AR Mode
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No flashcard decks found</p>
                  <p className="text-sm">Create some flashcards first to use AR mode</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Tips for AR Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Point your camera at a clean, contrasting background
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Move around to study in different locations for better memory
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Tap the card to flip between question and answer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Use swipe gestures or buttons to navigate cards
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
