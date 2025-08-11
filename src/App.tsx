
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const Index = lazy(() => import("@/pages/Index"));
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Team = lazy(() => import("@/pages/Team"));
const News = lazy(() => import("@/pages/News"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const TournamentDetails = lazy(() => import("@/pages/TournamentDetails"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const JoinUs = lazy(() => import("@/pages/JoinUs"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Profile = lazy(() => import("@/pages/Profile"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PushNotificationPrompt = lazy(() => import("@/components/PushNotificationPrompt"));

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
                <Suspense fallback={<div className="p-6 text-center text-muted-foreground">جارٍ التحميل...</div>}>
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
                </Suspense>
              </div>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
