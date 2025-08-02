import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Folder, 
  Plus, 
  ExternalLink, 
  Search, 
  Library as LibraryIcon,
  FileText,
  Download,
  Star
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useXP } from '@/contexts/XPContext';

interface Book {
  id: string;
  title: string;
  author: string;
  subject: string;
  url: string;
  type: 'book' | 'folder';
  description?: string;
  rating?: number;
}

const Library = () => {
  const [books, setBooks] = useState<Book[]>([
    {
      id: '1',
      title: 'Vedic Mathematics',
      author: 'Bharati Krishna Tirtha',
      subject: 'Mathematics',
      url: 'https://example.com/vedic-math',
      type: 'book',
      description: 'Ancient Indian mathematical techniques',
      rating: 5
    },
    {
      id: '2', 
      title: 'Physics Study Materials',
      author: 'Various Authors',
      subject: 'Physics',
      url: 'https://example.com/physics-folder',
      type: 'folder',
      description: 'Complete physics notes and practice papers'
    },
    {
      id: '3',
      title: 'Ancient Indian Literature',
      author: 'Multiple Authors',
      subject: 'Literature',
      url: 'https://example.com/literature',
      type: 'folder',
      description: 'Classical Sanskrit and Hindi texts'
    }
  ]);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    subject: '',
    url: '',
    type: 'book' as 'book' | 'folder',
    description: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { addXP } = useXP();

  const handleAddBook = () => {
    if (!newBook.title || !newBook.author || !newBook.url) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const book: Book = {
      id: Date.now().toString(),
      ...newBook,
      rating: Math.floor(Math.random() * 5) + 1
    };

    setBooks(prev => [...prev, book]);
    addXP(50); // Add XP for contributing to library
    
    toast({
      title: "Book Added! 📚",
      description: `${book.title} has been added to the library. +50 XP earned!`,
    });

    setNewBook({
      title: '',
      author: '',
      subject: '',
      url: '',
      type: 'book',
      description: ''
    });
    setIsDialogOpen(false);
  };

  const handleOpenBook = (book: Book) => {
    window.open(book.url, '_blank');
    addXP(10); // Add XP for reading
    toast({
      title: "Happy Reading! 📖",
      description: `Opened ${book.title}. +10 XP earned!`,
    });
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subjects = [...new Set(books.map(book => book.subject))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-orange-950 dark:via-red-950 dark:to-yellow-950">
      {/* Traditional Indian Header */}
      <div className="relative overflow-hidden">
        {/* Decorative Border */}
        <div className="h-4 bg-gradient-to-r from-orange-600 via-red-600 via-yellow-600 to-orange-600"></div>
        
        {/* Main Header */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 py-8">
          <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <LibraryIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent mb-2">
              ज्ञान भंडार
            </h1>
            <h2 className="text-2xl font-semibold text-orange-800 dark:text-orange-200 mb-2">
              Digital Library
            </h2>
            <p className="text-orange-600 dark:text-orange-300 font-medium">
              "विद्या ददाति विनयं" - Knowledge gives humility
            </p>
          </div>
        </div>
        
        {/* Decorative pattern */}
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Add Section */}
        <Card className="mb-8 border-2 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-4 h-4" />
                <Input
                  placeholder="Search books, authors, or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-300 focus:border-orange-500"
                />
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Book/Folder
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-orange-500" />
                      Add to Library
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        value={newBook.title}
                        onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Book or folder title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Author *</label>
                      <Input
                        value={newBook.author}
                        onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        value={newBook.subject}
                        onChange={(e) => setNewBook(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Subject category"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="book"
                            checked={newBook.type === 'book'}
                            onChange={(e) => setNewBook(prev => ({ ...prev, type: e.target.value as 'book' | 'folder' }))}
                          />
                          <BookOpen className="w-4 h-4" />
                          Book
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="folder"
                            checked={newBook.type === 'folder'}
                            onChange={(e) => setNewBook(prev => ({ ...prev, type: e.target.value as 'book' | 'folder' }))}
                          />
                          <Folder className="w-4 h-4" />
                          Folder
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL/Link *</label>
                      <Input
                        value={newBook.url}
                        onChange={(e) => setNewBook(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={newBook.description}
                        onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description"
                      />
                    </div>
                    <Button onClick={handleAddBook} className="w-full">
                      Add to Library
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Subject Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="cursor-pointer border-orange-300" onClick={() => setSearchTerm('')}>
            All Subjects
          </Badge>
          {subjects.map(subject => (
            <Badge 
              key={subject} 
              variant="secondary" 
              className="cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200"
              onClick={() => setSearchTerm(subject)}
            >
              {subject}
            </Badge>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <Card 
              key={book.id} 
              className="group hover:shadow-xl transition-all duration-300 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 cursor-pointer overflow-hidden"
              onClick={() => handleOpenBook(book)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {book.type === 'book' ? (
                      <BookOpen className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Folder className="w-5 h-5 text-yellow-600" />
                    )}
                    <Badge variant="outline" className="text-xs border-orange-300">
                      {book.subject}
                    </Badge>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                {book.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {book.description}
                  </p>
                )}
                {book.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < book.rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({book.rating}/5)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <LibraryIcon className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-600 mb-2">No books found</h3>
            <p className="text-orange-500">Try adjusting your search or add new books to the library</p>
          </div>
        )}
      </div>

      {/* Traditional Footer Pattern */}
      <div className="mt-12">
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-60"></div>
        <div className="h-4 bg-gradient-to-r from-orange-600 via-red-600 via-yellow-600 to-orange-600"></div>
      </div>
    </div>
  );
};

export default Library;