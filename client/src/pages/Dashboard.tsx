import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, Book, Edit2, Trash2, MoreVertical, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Book as BookType } from "@shared/schema";

const COVER_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", 
  "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6"
];

export default function Dashboard() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", subtitle: "", authors: "", description: "", coverColor: "#6366f1" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBooks();
  }, []);

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

  const handleCreate = async () => {
    if (!newBook.title.trim() || !newBook.authors.trim()) {
      toast({ title: "Required fields", description: "Title and authors are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook)
      });
      if (response.ok) {
        const created = await response.json();
        setBooks([...books, created]);
        setNewBook({ title: "", subtitle: "", authors: "", description: "", coverColor: "#6366f1" });
        setDialogOpen(false);
        toast({ title: "Success", description: "Book created successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create book", variant: "destructive" });
    } finally {
      setCreating(false);
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-book">
                  <Plus className="w-4 h-4 mr-2" />
                  New Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Book</DialogTitle>
                  <DialogDescription>Start a new book project</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input 
                      id="title" 
                      value={newBook.title} 
                      onChange={e => setNewBook({...newBook, title: e.target.value})}
                      placeholder="The Art of Leadership"
                      data-testid="input-book-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input 
                      id="subtitle" 
                      value={newBook.subtitle} 
                      onChange={e => setNewBook({...newBook, subtitle: e.target.value})}
                      placeholder="A Modern Approach"
                    />
                  </div>
                  <div>
                    <Label htmlFor="authors">Authors *</Label>
                    <Input 
                      id="authors" 
                      value={newBook.authors} 
                      onChange={e => setNewBook({...newBook, authors: e.target.value})}
                      placeholder="Jane Doe"
                      data-testid="input-book-authors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newBook.description} 
                      onChange={e => setNewBook({...newBook, description: e.target.value})}
                      placeholder="A brief description of your book..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Cover Color</Label>
                    <div className="flex gap-2 mt-2">
                      {COVER_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewBook({...newBook, coverColor: color})}
                          className={`w-8 h-8 rounded-full transition-all ${newBook.coverColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={creating} data-testid="button-submit-book">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Book
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

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
              <Button onClick={() => setDialogOpen(true)}>
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
                      className="w-12 h-16 rounded-md flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: book.coverColor || "#6366f1" }}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/book/${book.id}`}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
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
                  <CardTitle className="text-lg mt-3">{book.title}</CardTitle>
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
                  <Link href={book.isDefault ? `/chapter/overview` : `/book/${book.id}`}>
                    <Button variant="ghost" size="sm" data-testid={`button-open-book-${book.id}`}>
                      Open
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
