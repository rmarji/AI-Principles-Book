import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, Book, Edit2, Trash2, MoreVertical, FileText, Loader2, Sparkles, Home, ArrowLeft, ChevronRight, Wand2, Save, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Book as BookType, Chapter } from "@shared/schema";

const COVER_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", 
  "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6"
];

const EMPTY_BOOK = { title: "", subtitle: "", authors: "", description: "", coverColor: "#6366f1", status: "draft" };
const EMPTY_CHAPTER = { title: "", subtitle: "", content: "", status: "draft" };

export default function Dashboard() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_BOOK);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();

  // Chapter management state
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterForm, setChapterForm] = useState(EMPTY_CHAPTER);
  const [savingChapter, setSavingChapter] = useState(false);
  
  // AI generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("write");

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      fetchChapters(selectedBook.id);
    }
  }, [selectedBook]);

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast({ title: "Error", description: "Failed to load books", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (bookId: number) => {
    setLoadingChapters(true);
    try {
      const response = await fetch(`/api/books/${bookId}/chapters`);
      const data = await response.json();
      setChapters(data);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      toast({ title: "Error", description: "Failed to load chapters", variant: "destructive" });
    } finally {
      setLoadingChapters(false);
    }
  };

  const openCreateDialog = () => {
    setEditingBook(null);
    setFormData(EMPTY_BOOK);
    setDialogOpen(true);
  };

  const openEditDialog = (book: BookType) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      subtitle: book.subtitle || "",
      authors: book.authors,
      description: book.description || "",
      coverColor: book.coverColor || "#6366f1",
      status: book.status
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.authors.trim()) {
      toast({ title: "Required fields", description: "Title and authors are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingBook) {
        const response = await fetch(`/api/books/${editingBook.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const updated = await response.json();
          setBooks(books.map(b => b.id === updated.id ? updated : b));
          toast({ title: "Updated", description: "Book updated successfully" });
        }
      } else {
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const created = await response.json();
          setBooks([...books, created]);
          toast({ title: "Created", description: "Book created successfully" });
        }
      }
      setDialogOpen(false);
      setEditingBook(null);
      setFormData(EMPTY_BOOK);
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${editingBook ? 'update' : 'create'} book`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (response.ok) {
        setBooks(books.filter(b => b.id !== id));
        toast({ title: "Deleted", description: "Book deleted successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete book", variant: "destructive" });
    }
  };

  const handleSeedDefault = async () => {
    setSeeding(true);
    try {
      const response = await fetch("/api/migrate/seed-default-book", { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        await fetchBooks();
        toast({ title: "Success", description: data.message });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to seed default book", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  // Chapter management functions
  const openChapterDialog = (chapter?: Chapter) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterForm({
        title: chapter.title,
        subtitle: chapter.subtitle || "",
        content: chapter.content || "",
        status: chapter.status || "draft"
      });
    } else {
      setEditingChapter(null);
      setChapterForm(EMPTY_CHAPTER);
    }
    setAiPrompt("");
    setActiveTab("write");
    setChapterDialogOpen(true);
  };

  const handleSaveChapter = async () => {
    if (!chapterForm.title.trim()) {
      toast({ title: "Required", description: "Chapter title is required", variant: "destructive" });
      return;
    }
    if (!selectedBook) return;
    
    setSavingChapter(true);
    try {
      const wordCount = chapterForm.content ? chapterForm.content.split(/\s+/).filter(Boolean).length : 0;
      const slug = chapterForm.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      const payload = { 
        ...chapterForm, 
        slug,
        wordCount,
        sortOrder: editingChapter ? editingChapter.sortOrder : chapters.length
      };

      if (editingChapter) {
        const response = await fetch(`/api/books/${selectedBook.id}/chapters/${editingChapter.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const updated = await response.json();
          setChapters(chapters.map(c => c.id === updated.id ? updated : c));
          toast({ title: "Updated", description: "Chapter saved" });
        }
      } else {
        const response = await fetch(`/api/books/${selectedBook.id}/chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const created = await response.json();
          setChapters([...chapters, created]);
          toast({ title: "Created", description: "Chapter created" });
        }
      }
      setChapterDialogOpen(false);
      setEditingChapter(null);
      setChapterForm(EMPTY_CHAPTER);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save chapter", variant: "destructive" });
    } finally {
      setSavingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!selectedBook) return;
    try {
      const response = await fetch(`/api/books/${selectedBook.id}/chapters/${chapterId}`, { method: "DELETE" });
      if (response.ok) {
        setChapters(chapters.filter(c => c.id !== chapterId));
        toast({ title: "Deleted", description: "Chapter deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete chapter", variant: "destructive" });
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim() || !selectedBook) {
      toast({ title: "Required", description: "Please enter a description for the AI", variant: "destructive" });
      return;
    }
    
    setGenerating(true);
    try {
      const response = await fetch(`/api/books/${selectedBook.id}/chapters/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          title: chapterForm.title || "New Chapter",
          context: selectedBook.description
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setChapterForm(prev => ({
          ...prev,
          content: data.content,
          title: prev.title || data.title
        }));
        setActiveTab("write");
        toast({ title: "Generated", description: `AI created ${data.wordCount} words of content` });
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error || "Failed to generate content", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate chapter content", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "review": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "editing": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Chapter Management View
  if (selectedBook) {
    return (
      <div className="min-h-screen bg-background" data-testid="chapter-management-page">
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedBook(null)} data-testid="button-back-to-books">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div 
                  className="w-10 h-14 rounded-md flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedBook.coverColor || "#6366f1" }}
                >
                  <Book className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{selectedBook.title}</h1>
                  <p className="text-sm text-muted-foreground">{chapters.length} chapters</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/book/${selectedBook.id}`}>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
                <Button onClick={() => openChapterDialog()} data-testid="button-add-chapter">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Chapter
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          {loadingChapters ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No chapters yet</h2>
              <p className="text-muted-foreground mb-6">Start writing your book by adding chapters</p>
              <Button onClick={() => openChapterDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Chapter
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <Card key={chapter.id} className="group hover:shadow-md transition-shadow" data-testid={`card-chapter-${chapter.id}`}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-medium w-8">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{chapter.title}</h3>
                      {chapter.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{chapter.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {chapter.wordCount && (
                        <Badge variant="outline" className="text-xs">
                          {chapter.wordCount.toLocaleString()} words
                        </Badge>
                      )}
                      <Badge className={getStatusColor(chapter.status || "draft")} variant="outline">
                        {chapter.status || "draft"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openChapterDialog(chapter)} data-testid={`button-edit-chapter-${chapter.id}`}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteChapter(chapter.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Chapter Editor Dialog */}
        <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingChapter ? "Edit Chapter" : "Add New Chapter"}</DialogTitle>
              <DialogDescription>Write your chapter content or use AI to generate it</DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chapter-title">Chapter Title *</Label>
                  <Input 
                    id="chapter-title"
                    value={chapterForm.title}
                    onChange={e => setChapterForm({...chapterForm, title: e.target.value})}
                    placeholder="Introduction to AI Leadership"
                    data-testid="input-chapter-title"
                  />
                </div>
                <div>
                  <Label htmlFor="chapter-subtitle">Subtitle</Label>
                  <Input 
                    id="chapter-subtitle"
                    value={chapterForm.subtitle}
                    onChange={e => setChapterForm({...chapterForm, subtitle: e.target.value})}
                    placeholder="Optional subtitle"
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Write
                  </TabsTrigger>
                  <TabsTrigger value="ai">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate with AI
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="write" className="flex-1 overflow-hidden mt-4">
                  <Textarea 
                    value={chapterForm.content}
                    onChange={e => setChapterForm({...chapterForm, content: e.target.value})}
                    placeholder="Write your chapter content in Markdown format..."
                    className="h-[400px] font-mono text-sm resize-none"
                    data-testid="textarea-chapter-content"
                  />
                  {chapterForm.content && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {chapterForm.content.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="ai" className="flex-1 overflow-hidden mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ai-prompt">Describe what you want this chapter to cover</Label>
                      <Textarea 
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="Example: Write a chapter about the fundamentals of AI agents, explaining what they are, how they work, and why leaders should care. Include practical examples and actionable advice for getting started."
                        className="h-[200px] resize-none mt-2"
                        data-testid="textarea-ai-prompt"
                      />
                    </div>
                    <Button 
                      onClick={handleGenerateWithAI} 
                      disabled={generating || !aiPrompt.trim()}
                      className="w-full"
                      data-testid="button-generate-ai"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating chapter...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Chapter Content
                        </>
                      )}
                    </Button>
                    {chapterForm.content && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Content generated! Switch to the "Write" tab to review and edit.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setChapterDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveChapter} disabled={savingChapter} data-testid="button-save-chapter">
                {savingChapter ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingChapter ? "Save Changes" : "Create Chapter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Books Grid View
  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Book Studio</h1>
                <p className="text-sm text-muted-foreground">Create, edit, and publish your books</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button onClick={openCreateDialog} data-testid="button-create-book">
                <Plus className="w-4 h-4 mr-2" />
                New Book
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit Book" : "Create New Book"}</DialogTitle>
            <DialogDescription>{editingBook ? "Update your book details" : "Start a new book project"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="The Art of Leadership"
                data-testid="input-book-title"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                value={formData.subtitle} 
                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                placeholder="A Modern Approach"
              />
            </div>
            <div>
              <Label htmlFor="authors">Authors *</Label>
              <Input 
                id="authors" 
                value={formData.authors} 
                onChange={e => setFormData({...formData, authors: e.target.value})}
                placeholder="Jane Doe"
                data-testid="input-book-authors"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="A brief description of your book..."
                rows={3}
              />
            </div>
            {editingBook && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={val => setFormData({...formData, status: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="editing">Editing</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Cover Color</Label>
              <div className="flex gap-2 mt-2">
                {COVER_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({...formData, coverColor: color})}
                    className={`w-8 h-8 rounded-full transition-all ${formData.coverColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-submit-book">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingBook ? "Save Changes" : "Create Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No books yet</h2>
            <p className="text-muted-foreground mb-6">Get started by creating your first book or importing the sample</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleSeedDefault} disabled={seeding} data-testid="button-seed-default">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                Import Sample Book
              </Button>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Book
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(book => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow" data-testid={`card-book-${book.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div 
                      className="w-12 h-16 rounded-md flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                      style={{ backgroundColor: book.coverColor || "#6366f1" }}
                      onClick={() => setSelectedBook(book)}
                    >
                      <Book className="w-6 h-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedBook(book)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Manage Chapters
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(book)} data-testid={`button-edit-book-${book.id}`}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(book.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle 
                    className="text-lg mt-3 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setSelectedBook(book)}
                  >
                    {book.title}
                  </CardTitle>
                  {book.subtitle && (
                    <CardDescription className="text-sm">{book.subtitle}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{book.authors}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <Badge className={getStatusColor(book.status)} variant="outline">
                    {book.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedBook(book)}
                      data-testid={`button-edit-chapters-${book.id}`}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Link href={book.isDefault ? `/chapter/overview` : `/book/${book.id}`}>
                      <Button variant="ghost" size="sm" data-testid={`button-open-book-${book.id}`}>
                        Open
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
