import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calculator, Plus, Trash2, TrendingUp, Target, Trophy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Grade {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  category: string;
}

interface GradeCategory {
  name: string;
  weight: number;
  color: string;
}

const DEFAULT_CATEGORIES: GradeCategory[] = [
  { name: 'Exams', weight: 40, color: 'bg-blue-500' },
  { name: 'Homework', weight: 20, color: 'bg-green-500' },
  { name: 'Quizzes', weight: 20, color: 'bg-yellow-500' },
  { name: 'Projects', weight: 15, color: 'bg-purple-500' },
  { name: 'Participation', weight: 5, color: 'bg-pink-500' },
];

const GRADE_SCALE = [
  { min: 93, grade: 'A', gpa: 4.0 },
  { min: 90, grade: 'A-', gpa: 3.7 },
  { min: 87, grade: 'B+', gpa: 3.3 },
  { min: 83, grade: 'B', gpa: 3.0 },
  { min: 80, grade: 'B-', gpa: 2.7 },
  { min: 77, grade: 'C+', gpa: 2.3 },
  { min: 73, grade: 'C', gpa: 2.0 },
  { min: 70, grade: 'C-', gpa: 1.7 },
  { min: 67, grade: 'D+', gpa: 1.3 },
  { min: 63, grade: 'D', gpa: 1.0 },
  { min: 60, grade: 'D-', gpa: 0.7 },
  { min: 0, grade: 'F', gpa: 0.0 },
];

export default function GradeCalculator() {
  const { toast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [categories, setCategories] = useState<GradeCategory[]>(DEFAULT_CATEGORIES);
  const [targetGrade, setTargetGrade] = useState(90);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newScore, setNewScore] = useState('');
  const [newMaxScore, setNewMaxScore] = useState('100');
  const [newCategory, setNewCategory] = useState('Exams');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('grade-calculator');
    if (saved) {
      const data = JSON.parse(saved);
      setGrades(data.grades || []);
      if (data.categories) setCategories(data.categories);
      if (data.targetGrade) setTargetGrade(data.targetGrade);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('grade-calculator', JSON.stringify({
      grades,
      categories,
      targetGrade,
    }));
  }, [grades, categories, targetGrade]);

  const addGrade = () => {
    if (!newName.trim() || !newScore || !newMaxScore) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const category = categories.find(c => c.name === newCategory);
    
    const grade: Grade = {
      id: Date.now().toString(),
      name: newName.trim(),
      score: parseFloat(newScore),
      maxScore: parseFloat(newMaxScore),
      weight: category?.weight || 0,
      category: newCategory,
    };

    setGrades([...grades, grade]);
    setNewName('');
    setNewScore('');
    setNewMaxScore('100');
    toast({ title: 'Grade added!' });
  };

  const deleteGrade = (id: string) => {
    setGrades(grades.filter(g => g.id !== id));
  };

  const calculateOverallGrade = () => {
    if (grades.length === 0) return 0;

    const categoryGrades: Record<string, { totalScore: number; totalMax: number }> = {};

    // Group grades by category
    grades.forEach(grade => {
      if (!categoryGrades[grade.category]) {
        categoryGrades[grade.category] = { totalScore: 0, totalMax: 0 };
      }
      categoryGrades[grade.category].totalScore += grade.score;
      categoryGrades[grade.category].totalMax += grade.maxScore;
    });

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;

    categories.forEach(cat => {
      if (categoryGrades[cat.name] && categoryGrades[cat.name].totalMax > 0) {
        const categoryPercentage = (categoryGrades[cat.name].totalScore / categoryGrades[cat.name].totalMax) * 100;
        totalWeightedScore += categoryPercentage * (cat.weight / 100);
        totalWeight += cat.weight;
      }
    });

    if (totalWeight === 0) return 0;
    return (totalWeightedScore / totalWeight) * 100;
  };

  const getLetterGrade = (percentage: number) => {
    for (const scale of GRADE_SCALE) {
      if (percentage >= scale.min) {
        return { grade: scale.grade, gpa: scale.gpa };
      }
    }
    return { grade: 'F', gpa: 0.0 };
  };

  const calculateNeededScore = () => {
    const currentGrade = calculateOverallGrade();
    if (currentGrade >= targetGrade) return null;
    
    // Simplified calculation - what you need on next assignment
    const remainingWeight = 100 - grades.reduce((sum, g) => {
      const cat = categories.find(c => c.name === g.category);
      return sum + (cat?.weight || 0) / (grades.filter(gr => gr.category === g.category).length || 1);
    }, 0);

    if (remainingWeight <= 0) return null;

    const needed = ((targetGrade - currentGrade * (100 - remainingWeight) / 100) / remainingWeight) * 100;
    return Math.min(100, Math.max(0, needed));
  };

  const overallGrade = calculateOverallGrade();
  const letterGrade = getLetterGrade(overallGrade);
  const neededScore = calculateNeededScore();

  const getCategoryStats = (categoryName: string) => {
    const categoryGrades = grades.filter(g => g.category === categoryName);
    if (categoryGrades.length === 0) return { average: 0, count: 0 };
    
    const totalScore = categoryGrades.reduce((sum, g) => sum + g.score, 0);
    const totalMax = categoryGrades.reduce((sum, g) => sum + g.maxScore, 0);
    
    return {
      average: totalMax > 0 ? (totalScore / totalMax) * 100 : 0,
      count: categoryGrades.length,
    };
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Grade Calculator</h1>
          <p className="text-muted-foreground">Track and calculate your grades</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Overview */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6 text-center">
              <div className="text-6xl font-bold mb-2">{overallGrade.toFixed(1)}%</div>
              <div className="flex items-center justify-center gap-3">
                <Badge className="text-lg px-3 py-1">{letterGrade.grade}</Badge>
                <span className="text-muted-foreground">GPA: {letterGrade.gpa.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Target Grade */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Grade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  className="text-center text-lg font-bold"
                />
                <span className="flex items-center text-lg">%</span>
              </div>

              {neededScore !== null && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Need {neededScore.toFixed(1)}% on remaining work
                    </span>
                  </div>
                </div>
              )}

              {overallGrade >= targetGrade && grades.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <Trophy className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Target achieved! 🎉
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const stats = getCategoryStats(cat.name);
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.name} ({cat.weight}%)</span>
                        <span className="font-medium">
                          {stats.count > 0 ? `${stats.average.toFixed(1)}%` : '-'}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.average}%` }}
                          className={`h-full ${cat.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grades List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Grades ({grades.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Grade Form */}
              <div className="grid grid-cols-5 gap-2">
                <Input
                  placeholder="Assignment name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-2"
                />
                <div className="flex gap-1 items-center">
                  <Input
                    type="number"
                    placeholder="Score"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    min={0}
                  />
                  <span>/</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(e.target.value)}
                    min={1}
                  />
                </div>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addGrade}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Grades Table */}
              {grades.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No grades yet</p>
                  <p className="text-sm">Add your first grade above</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {grades.map((grade) => {
                        const percentage = (grade.score / grade.maxScore) * 100;
                        const letter = getLetterGrade(percentage);
                        const category = categories.find(c => c.name === grade.category);
                        
                        return (
                          <motion.div
                            key={grade.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="group flex items-center gap-4 p-3 bg-muted rounded-lg"
                          >
                            <div className={`w-2 h-full rounded ${category?.color || 'bg-gray-500'}`} />
                            <div className="flex-1">
                              <p className="font-medium">{grade.name}</p>
                              <p className="text-xs text-muted-foreground">{grade.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold">
                                {grade.score}/{grade.maxScore}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {percentage.toFixed(1)}%
                                </span>
                                <Badge variant={percentage >= 70 ? 'default' : 'destructive'} className="text-xs">
                                  {letter.grade}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 text-destructive"
                              onClick={() => deleteGrade(grade.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
