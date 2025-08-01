
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import EditProfile from "@/pages/EditProfile";
import AdminPanel from "@/pages/AdminPanel";
import ResetPassword from "@/pages/ResetPassword";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 0, // Disable retries for faster failures
      retryDelay: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <div className="min-h-screen bg-background text-foreground flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/index" element={<Index />} />
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
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/reset-password-page" element={<ResetPasswordPage />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <PushNotificationPrompt />
              </div>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
