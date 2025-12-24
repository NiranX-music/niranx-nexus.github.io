import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FileText, FileSpreadsheet, X, Check, 
  AlertCircle, Loader2, Eye, Edit, Trash2,
  ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ParsedQuestion {
  id: string;
  type: "mcq" | "numerical" | "short" | "long";
  question: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
}

export default function UploadTest() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<ParsedQuestion | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  // Test metadata
  const [testTitle, setTestTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("60");
  const [difficulty, setDifficulty] = useState("medium");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, CSV, or Excel file",
        variant: "destructive"
      });
      return;
    }
    
    setUploadedFile(file);
  };

  const simulateAIParsing = async () => {
    setIsParsing(true);
    setParseProgress(0);
    
    // Simulate parsing progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setParseProgress(i);
    }
    
    // Generate mock parsed questions
    const mockQuestions: ParsedQuestion[] = [
      {
        id: "1",
        type: "mcq",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: "C",
        marks: 2,
        explanation: "Paris is the capital and most populous city of France."
      },
      {
        id: "2",
        type: "mcq",
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "B",
        marks: 2,
        explanation: "Mars is called the Red Planet due to iron oxide on its surface."
      },
      {
        id: "3",
        type: "numerical",
        question: "What is the value of π (pi) to 2 decimal places?",
        correctAnswer: "3.14",
        marks: 3
      },
      {
        id: "4",
        type: "short",
        question: "Define photosynthesis in one sentence.",
        correctAnswer: "Photosynthesis is the process by which plants convert light energy into chemical energy.",
        marks: 4
      },
      {
        id: "5",
        type: "mcq",
        question: "What is the chemical symbol for water?",
        options: ["CO2", "H2O", "NaCl", "O2"],
        correctAnswer: "B",
        marks: 2
      }
    ];
    
    setParsedQuestions(mockQuestions);
    setIsParsing(false);
    
    toast({
      title: "Parsing Complete",
      description: `Successfully extracted ${mockQuestions.length} questions`
    });
  };

  const toggleQuestionExpand = (id: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  const deleteQuestion = (id: string) => {
    setParsedQuestions(prev => prev.filter(q => q.id !== id));
    toast({
      title: "Question Deleted",
      description: "Question has been removed from the test"
    });
  };

  const saveEditedQuestion = () => {
    if (!editingQuestion) return;
    
    setParsedQuestions(prev => 
      prev.map(q => q.id === editingQuestion.id ? editingQuestion : q)
    );
    setEditingQuestion(null);
    toast({
      title: "Question Updated",
      description: "Your changes have been saved"
    });
  };

  const publishTest = () => {
    if (!testTitle || parsedQuestions.length === 0) {
      toast({
        title: "Cannot Publish",
        description: "Please add a title and at least one question",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Test Published!",
      description: `"${testTitle}" has been published with ${parsedQuestions.length} questions`
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-400" />;
    if (type.includes("spreadsheet") || type.includes("csv") || type.includes("excel")) {
      return <FileSpreadsheet className="h-8 w-8 text-green-400" />;
    }
    return <FileText className="h-8 w-8 text-blue-400" />;
  };

  const getQuestionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      mcq: "bg-blue-500/20 text-blue-300",
      numerical: "bg-purple-500/20 text-purple-300",
      short: "bg-green-500/20 text-green-300",
      long: "bg-orange-500/20 text-orange-300"
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Upload Test
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload PDF, DOCX, or CSV files and let AI extract questions automatically
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!uploadedFile ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                      dragActive 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports PDF, DOCX, CSV, and Excel files
                    </p>
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.csv,.xlsx,.xls"
                        onChange={handleFileInput}
                      />
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      {getFileIcon(uploadedFile.type)}
                      <div className="flex-1">
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setUploadedFile(null);
                          setParsedQuestions([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isParsing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm">AI is extracting questions...</span>
                        </div>
                        <Progress value={parseProgress} className="h-2" />
                      </div>
                    ) : parsedQuestions.length === 0 ? (
                      <Button 
                        className="w-full gap-2"
                        onClick={simulateAIParsing}
                      >
                        <Sparkles className="h-4 w-4" />
                        Parse with AI
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <Check className="h-4 w-4" />
                        {parsedQuestions.length} questions extracted
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parsed Questions */}
            <AnimatePresence>
              {parsedQuestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Extracted Questions ({parsedQuestions.length})
                        </span>
                        <Badge variant="outline">
                          Total: {parsedQuestions.reduce((sum, q) => sum + q.marks, 0)} marks
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {parsedQuestions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border border-border/50 rounded-lg overflow-hidden"
                        >
                          <div 
                            className="p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleQuestionExpand(question.id)}
                          >
                            <span className="text-sm font-medium text-muted-foreground w-8">
                              Q{index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium line-clamp-2">{question.question}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getQuestionTypeBadge(question.type)}>
                                  {question.type.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{question.marks} marks</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingQuestion(question);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuestion(question.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                              {expandedQuestions.has(question.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {expandedQuestions.has(question.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-border/50 bg-muted/20 px-4 py-3"
                              >
                                {question.options && (
                                  <div className="space-y-2 mb-3">
                                    <p className="text-sm font-medium">Options:</p>
                                    {question.options.map((opt, i) => (
                                      <div 
                                        key={i}
                                        className={`text-sm p-2 rounded ${
                                          String.fromCharCode(65 + i) === question.correctAnswer
                                            ? "bg-green-500/20 text-green-300"
                                            : "bg-muted/30"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + i)}. {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="text-sm">
                                  <span className="font-medium">Correct Answer: </span>
                                  <span className="text-green-400">{question.correctAnswer}</span>
                                </div>
                                {question.explanation && (
                                  <div className="text-sm mt-2 p-2 bg-blue-500/10 rounded">
                                    <span className="font-medium">Explanation: </span>
                                    {question.explanation}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Test Settings Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur sticky top-6">
              <CardHeader>
                <CardTitle>Test Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter test title"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                      <SelectItem value="computer">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
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

                <div className="pt-4 border-t border-border/50 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Questions</span>
                    <span className="font-medium">{parsedQuestions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Marks</span>
                    <span className="font-medium">
                      {parsedQuestions.reduce((sum, q) => sum + q.marks, 0)}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={publishTest}
                  disabled={parsedQuestions.length === 0 || !testTitle}
                >
                  Publish Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select 
                  value={editingQuestion.type}
                  onValueChange={(value) => setEditingQuestion({
                    ...editingQuestion,
                    type: value as ParsedQuestion["type"]
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="numerical">Numerical</SelectItem>
                    <SelectItem value="short">Short Answer</SelectItem>
                    <SelectItem value="long">Long Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    question: e.target.value
                  })}
                  rows={3}
                />
              </div>

              {editingQuestion.type === "mcq" && editingQuestion.options && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-center font-medium">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options!];
                          newOptions[i] = e.target.value;
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOptions
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Correct Answer</Label>
                {editingQuestion.type === "mcq" ? (
                  <RadioGroup
                    value={editingQuestion.correctAnswer}
                    onValueChange={(value) => setEditingQuestion({
                      ...editingQuestion,
                      correctAnswer: value
                    })}
                    className="flex gap-4"
                  >
                    {["A", "B", "C", "D"].map((letter) => (
                      <div key={letter} className="flex items-center space-x-2">
                        <RadioGroupItem value={letter} id={letter} />
                        <Label htmlFor={letter}>{letter}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={editingQuestion.correctAnswer}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      correctAnswer: e.target.value
                    })}
                    rows={2}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={editingQuestion.marks}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    marks: parseInt(e.target.value) || 1
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Explanation (Optional)</Label>
                <Textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    explanation: e.target.value
                  })}
                  rows={2}
                  placeholder="Add an explanation for the answer..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedQuestion}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
