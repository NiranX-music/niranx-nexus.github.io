import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FlashcardDeck {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  card_count: number;
  last_studied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  difficulty: string;
  next_review_at: string;
  review_count: number;
  ease_factor: number;
  interval_days: number;
  created_at: string;
  updated_at: string;
}

// SM-2 Algorithm implementation
export function calculateNextReview(
  rating: number, // 1-5 (1=Again, 2=Hard, 3=Good, 4=Easy, 5=Perfect)
  currentEaseFactor: number,
  currentIntervalDays: number,
  reviewCount: number
): { nextReviewAt: Date; newEaseFactor: number; newIntervalDays: number } {
  let newEaseFactor = currentEaseFactor;
  let newIntervalDays: number;

  // Adjust ease factor based on rating
  newEaseFactor = Math.max(
    1.3,
    currentEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  if (rating < 3) {
    // Failed - reset to beginning
    newIntervalDays = 1;
  } else if (reviewCount === 0) {
    newIntervalDays = 1;
  } else if (reviewCount === 1) {
    newIntervalDays = 6;
  } else {
    newIntervalDays = Math.round(currentIntervalDays * newEaseFactor);
  }

  // Apply rating multiplier
  if (rating === 4) {
    newIntervalDays = Math.round(newIntervalDays * 1.3);
  } else if (rating === 5) {
    newIntervalDays = Math.round(newIntervalDays * 1.5);
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newIntervalDays);

  return { nextReviewAt, newEaseFactor, newIntervalDays };
}

export function useFlashcards() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = useCallback(async () => {
    if (!user) {
      setDecks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDecks(data || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Failed to load flashcard decks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const createDeck = async (title: string, description?: string, subject?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .insert({
          user_id: user.id,
          title,
          description,
          subject,
        })
        .select()
        .single();

      if (error) throw error;
      
      setDecks((prev) => [data, ...prev]);
      toast.success('Deck created successfully');
      return data;
    } catch (error) {
      console.error('Error creating deck:', error);
      toast.error('Failed to create deck');
      return null;
    }
  };

  const deleteDeck = async (deckId: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;
      
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      toast.success('Deck deleted');
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck');
    }
  };

  const updateDeck = async (deckId: string, updates: Partial<FlashcardDeck>) => {
    try {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .update(updates)
        .eq('id', deckId)
        .select()
        .single();

      if (error) throw error;
      
      setDecks((prev) => prev.map((d) => (d.id === deckId ? data : d)));
      return data;
    } catch (error) {
      console.error('Error updating deck:', error);
      toast.error('Failed to update deck');
      return null;
    }
  };

  return {
    decks,
    loading,
    fetchDecks,
    createDeck,
    deleteDeck,
    updateDeck,
  };
}

export function useDeckFlashcards(deckId: string | undefined) {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    if (!deckId || !user) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  }, [deckId, user]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const addCard = async (question: string, answer: string, difficulty: string = 'medium') => {
    if (!deckId) return null;

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          deck_id: deckId,
          question,
          answer,
          difficulty,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCards((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add flashcard');
      return null;
    }
  };

  const addMultipleCards = async (
    cardsToAdd: { question: string; answer: string; difficulty?: string }[]
  ) => {
    if (!deckId) return [];

    try {
      const cardsWithDeckId = cardsToAdd.map((c) => ({
        deck_id: deckId,
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty || 'medium',
      }));

      const { data, error } = await supabase
        .from('flashcards')
        .insert(cardsWithDeckId)
        .select();

      if (error) throw error;
      
      setCards((prev) => [...prev, ...(data || [])]);
      return data || [];
    } catch (error) {
      console.error('Error adding cards:', error);
      toast.error('Failed to add flashcards');
      return [];
    }
  };

  const updateCard = async (cardId: string, updates: Partial<Flashcard>) => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;
      
      setCards((prev) => prev.map((c) => (c.id === cardId ? data : c)));
      return data;
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update flashcard');
      return null;
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      toast.success('Flashcard deleted');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete flashcard');
    }
  };

  const recordReview = async (cardId: string, rating: number) => {
    if (!user) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const { nextReviewAt, newEaseFactor, newIntervalDays } = calculateNextReview(
      rating,
      Number(card.ease_factor),
      card.interval_days,
      card.review_count
    );

    try {
      // Record the review
      await supabase.from('flashcard_reviews').insert({
        flashcard_id: cardId,
        user_id: user.id,
        rating,
      });

      // Update the card
      await updateCard(cardId, {
        next_review_at: nextReviewAt.toISOString(),
        ease_factor: newEaseFactor,
        interval_days: newIntervalDays,
        review_count: card.review_count + 1,
      });

      // Update deck last studied
      await supabase
        .from('flashcard_decks')
        .update({ last_studied_at: new Date().toISOString() })
        .eq('id', deckId);

    } catch (error) {
      console.error('Error recording review:', error);
    }
  };

  const getDueCards = useCallback(() => {
    const now = new Date();
    return cards.filter((card) => new Date(card.next_review_at) <= now);
  }, [cards]);

  return {
    cards,
    loading,
    fetchCards,
    addCard,
    addMultipleCards,
    updateCard,
    deleteCard,
    recordReview,
    getDueCards,
  };
}
