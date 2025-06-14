
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Team from "@/pages/Team";
import News from "@/pages/News";
import Tournaments from "@/pages/Tournaments";
import TournamentDetails from "@/pages/TournamentDetails";
import Leaderboard from "@/pages/Leaderboard";
import JoinUs from "@/pages/JoinUs";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import AdminPanel from "@/pages/AdminPanel";
import ResetPassword from "@/pages/ResetPassword";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/tournaments" element={<Tournaments />} />
                  <Route path="/tournaments/:id" element={<TournamentDetails />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/join-us" element={<JoinUs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/reset-password-page" element={<ResetPasswordPage />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
