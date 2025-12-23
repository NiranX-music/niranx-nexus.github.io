import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, ArrowRight, Save, Eye, Plus, Trash2, GripVertical,
  FileText, Clock, Target, BookOpen, Shield, Settings,
  Type, Hash, AlignLeft, List, Image, Code, Music, Shapes,
  Check, X, HelpCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'mcq' | 'numerical' | 'short' | 'long' | 'assertion' | 'match' | 'image';
  question: string;
  options?: string[];
  correctAnswer?: string | number | string[];
  marks: number;
  negativeMarks: number;
  explanation?: string;
  section?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice', icon: List },
  { value: 'numerical', label: 'Numerical', icon: Hash },
  { value: 'short', label: 'Short Answer', icon: AlignLeft },
  { value: 'long', label: 'Long Answer', icon: FileText },
  { value: 'assertion', label: 'Assertion-Reason', icon: Check },
  { value: 'match', label: 'Match the Following', icon: Shapes },
  { value: 'image', label: 'Image Based', icon: Image },
];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

export default function TestBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [testData, setTestData] = useState({
    title: '',
    subject: '',
    class: '',
    syllabusTag: '',
    difficulty: 'medium',
    duration: 60,
    totalMarks: 100,
    negativeMarking: false,
    negativeMarkPercentage: 25,
    isPrivate: false,
    shuffleQuestions: false,
    showResultsImmediately: true,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: crypto.randomUUID(),
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 4,
    negativeMarks: 1,
    explanation: '',
    difficulty: 'medium',
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question) {
      toast({ title: 'Please enter a question', variant: 'destructive' });
      return;
    }
    setQuestions([...questions, { ...currentQuestion, id: crypto.randomUUID() }]);
    setCurrentQuestion({
      id: crypto.randomUUID(),
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 4,
      negativeMarks: 1,
      explanation: '',
      difficulty: 'medium',
    });
    toast({ title: 'Question added successfully' });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveTest = () => {
    if (!testData.title) {
      toast({ title: 'Please enter a test title', variant: 'destructive' });
      return;
    }
    if (questions.length === 0) {
      toast({ title: 'Please add at least one question', variant: 'destructive' });
      return;
    }
    toast({ title: 'Test saved successfully!' });
    navigate('/niranx/tests');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Test Details</h2>
              <p className="text-muted-foreground">Enter basic information about your test</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Mathematics Mid-Term Exam"
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={testData.subject} onValueChange={(v) => setTestData({ ...testData, subject: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class/Grade</Label>
                <Select value={testData.class} onValueChange={(v) => setTestData({ ...testData, class: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Undergraduate', 'Graduate'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={testData.difficulty} onValueChange={(v) => setTestData({ ...testData, difficulty: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={testData.duration}
                  onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={testData.totalMarks}
                  onChange={(e) => setTestData({ ...testData, totalMarks: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Test Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Negative Marking</Label>
                  <p className="text-sm text-muted-foreground">Deduct marks for wrong answers</p>
                </div>
                <Switch
                  checked={testData.negativeMarking}
                  onCheckedChange={(v) => setTestData({ ...testData, negativeMarking: v })}
                />
              </div>

              {testData.negativeMarking && (
                <div className="space-y-2 pl-4 border-l-2">
                  <Label>Negative Mark Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={testData.negativeMarkPercentage}
                      onChange={(e) => setTestData({ ...testData, negativeMarkPercentage: parseInt(e.target.value) || 0 })}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Private Test</Label>
                  <p className="text-sm text-muted-foreground">Only accessible via invite link</p>
                </div>
                <Switch
                  checked={testData.isPrivate}
                  onCheckedChange={(v) => setTestData({ ...testData, isPrivate: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Shuffle Questions</Label>
                  <p className="text-sm text-muted-foreground">Randomize question order for each attempt</p>
                </div>
                <Switch
                  checked={testData.shuffleQuestions}
                  onCheckedChange={(v) => setTestData({ ...testData, shuffleQuestions: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Results Immediately</Label>
                  <p className="text-sm text-muted-foreground">Display score right after submission</p>
                </div>
                <Switch
                  checked={testData.showResultsImmediately}
                  onCheckedChange={(v) => setTestData({ ...testData, showResultsImmediately: v })}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Add Questions</h2>
              <p className="text-muted-foreground">Create questions for your test</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Question Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {QUESTION_TYPES.map(type => (
                        <Button
                          key={type.value}
                          variant={currentQuestion.type === type.value ? 'default' : 'outline'}
                          size="sm"
                          className="flex-col h-auto py-3 gap-1"
                          onClick={() => setCurrentQuestion({ ...currentQuestion, type: type.value as Question['type'] })}
                        >
                          <type.icon className="h-4 w-4" />
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Question *</Label>
                    <Textarea
                      placeholder="Enter your question here..."
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {currentQuestion.type === 'mcq' && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {currentQuestion.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...(currentQuestion.options || [])];
                              newOptions[i] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOptions });
                            }}
                          />
                          <Button
                            variant={currentQuestion.correctAnswer === String.fromCharCode(65 + i) ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: String.fromCharCode(65 + i) })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'numerical' && (
                    <div className="space-y-2">
                      <Label>Correct Answer (Numerical)</Label>
                      <Input
                        type="number"
                        placeholder="Enter the correct numerical answer"
                        value={currentQuestion.correctAnswer as string || ''}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Marks</Label>
                      <Input
                        type="number"
                        value={currentQuestion.marks}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Negative Marks</Label>
                      <Input
                        type="number"
                        value={currentQuestion.negativeMarks}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, negativeMarks: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select 
                        value={currentQuestion.difficulty} 
                        onValueChange={(v: 'easy' | 'medium' | 'hard') => setCurrentQuestion({ ...currentQuestion, difficulty: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      placeholder="Explain the answer..."
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleAddQuestion} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              {/* Question List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Questions ({questions.length})</span>
                    <Badge variant="outline">
                      {questions.reduce((acc, q) => acc + q.marks, 0)} marks
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No questions added yet</p>
                      <p className="text-sm">Add questions using the editor</p>
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-2">
                      {questions.map((q, index) => (
                        <Reorder.Item key={q.id} value={q}>
                          <div className="flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-grab">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">Q{index + 1}</Badge>
                                <Badge variant="outline" className="text-xs">{q.type}</Badge>
                                <Badge variant="outline" className="text-xs">{q.marks}m</Badge>
                              </div>
                              <p className="text-sm line-clamp-2">{q.question}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Review & Publish</h2>
              <p className="text-muted-foreground">Review your test before publishing</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Test Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Title</Label>
                      <p className="font-medium">{testData.title || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Subject</Label>
                      <p className="font-medium">{testData.subject || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Duration</Label>
                      <p className="font-medium">{testData.duration} minutes</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Marks</Label>
                      <p className="font-medium">{testData.totalMarks}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Questions</Label>
                      <p className="font-medium">{questions.length}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Difficulty</Label>
                      <Badge variant="outline">{testData.difficulty}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Negative Marking</span>
                    <Badge variant={testData.negativeMarking ? 'default' : 'secondary'}>
                      {testData.negativeMarking ? `${testData.negativeMarkPercentage}%` : 'Off'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Private Test</span>
                    <Badge variant={testData.isPrivate ? 'default' : 'secondary'}>
                      {testData.isPrivate ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shuffle Questions</span>
                    <Badge variant={testData.shuffleQuestions ? 'default' : 'secondary'}>
                      {testData.shuffleQuestions ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Immediate Results</span>
                    <Badge variant={testData.showResultsImmediately ? 'default' : 'secondary'}>
                      {testData.showResultsImmediately ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Questions Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {questions.map((q, index) => (
                    <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Badge variant="secondary">Q{index + 1}</Badge>
                      <div className="flex-1">
                        <p className="text-sm">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{q.type}</Badge>
                          <Badge variant="outline" className="text-xs">{q.marks}m</Badge>
                          <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 gap-2">
                <Eye className="h-4 w-4" />
                Preview Test
              </Button>
              <Button className="flex-1 gap-2" onClick={handleSaveTest}>
                <Save className="h-4 w-4" />
                Save & Publish
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/niranx/tests')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Test</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Settings, label: 'Test Details' },
          { icon: FileText, label: 'Add Questions' },
          { icon: Eye, label: 'Review & Publish' },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
              i + 1 === step
                ? 'bg-primary/10 text-primary'
                : i + 1 < step
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setStep(Math.min(3, step + 1))}
          disabled={step === 3}
          className="gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
