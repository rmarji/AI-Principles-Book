import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Chapter from "@/pages/Chapter";
import TableOfContents from "@/pages/TableOfContents";
import BookIndex from "@/pages/BookIndex";
import EditorialGuidelines from "@/pages/EditorialGuidelines";
import Assessment from "@/pages/Assessment";
import Dashboard from "@/pages/Dashboard";

function AppRouter() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/toc" component={TableOfContents} />
        <Route path="/chapter/:id" component={Chapter} />
        <Route path="/book/:bookId" component={TableOfContents} />
        <Route path="/book/:bookId/chapter/:id" component={Chapter} />
        <Route path="/book/:bookId/index" component={BookIndex} />
        <Route path="/editorial-guidelines" component={EditorialGuidelines} />
        <Route path="/assessment" component={Assessment} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
