import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Drafts from "./pages/Drafts";
import Auth from "./pages/Auth";
import WriterDashboard from "./pages/WriterDashboard";
import ReaderDashboard from "./pages/ReaderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Founders from "./pages/Founders";
import Blog from "./pages/Blog";
import TalkZone from "./pages/TalkZone";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/drafts/:id" element={<BookDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/writer-dashboard" element={<WriterDashboard />} />
          <Route path="/reader-dashboard" element={<ReaderDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/founders" element={<Founders />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/talk-zone" element={<TalkZone />} />
          <Route path="/talk-zone/:id" element={<TalkZone />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
