import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Settings, Newspaper, Trophy, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotificationsPopover from "./NotificationsPopover";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching profile for navbar:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile for navbar:', error);
        throw error;
      }
      
      console.log('Profile data for navbar:', data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: "الرئيسية", href: "/" },
    { name: "من نحن", href: "/about" },
    { name: "المتصدرين", href: "/leaderboard" },
    { name: "اللاعبين", href: "/players", icon: Users },
    { name: "الأخبار", href: "/news", icon: Newspaper },
    { name: "البطولات", href: "/tournaments", icon: Trophy },
    { name: "الفريق والمطورين", href: "/team" },
    { name: "انضم إلينا", href: "/join-us" },
  ];

  const getUserDisplayName = () => {
    if (profile?.username) return profile.username;
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'مستخدم';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarUrl = () => {
    const avatarUrl = profile?.avatar_url;
    if (avatarUrl && avatarUrl.trim() !== '') {
      // Always add fresh timestamp to prevent caching issues
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}t=${Date.now()}&cache_bust=${Math.random()}`;
    }
    return null;
  };

  const MobileUserButton = () => {
    if (!user) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-1"
        >
          <Menu className="h-6 w-6" />
        </Button>
      );
    }

    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="p-0 h-auto">
            <Avatar className="h-10 w-10 border-2 border-s3m-red/50">
              <AvatarImage 
                src={getAvatarUrl() || ""} 
                alt="Profile"
                key={getAvatarUrl() || 'no-avatar'}
                onError={(e) => {
                  console.error('Avatar failed to load:', e);
                }}
              />
              <AvatarFallback className="bg-s3m-red text-white">
                {profileLoading ? <User className="h-5 w-5" /> : getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-80 bg-black/95 border-s3m-red/20 text-white overflow-y-auto max-h-screen"
        >
          <div className="flex flex-col h-full min-h-0">
            {/* User Profile Section */}
            <div className="flex flex-col items-center py-6 border-b border-s3m-red/20 flex-shrink-0">
              <Avatar className="h-20 w-20 mb-4 border-4 border-s3m-red/50">
                <AvatarImage 
                  src={getAvatarUrl() || ""} 
                  alt="Profile"
                  key={getAvatarUrl() || 'no-avatar'}
                  onError={(e) => {
                    console.error('Avatar failed to load:', e);
                  }}
                />
                <AvatarFallback className="bg-s3m-red text-white text-xl">
                  {profileLoading ? <User className="h-8 w-8" /> : getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-white">{getUserDisplayName()}</h3>
              <p className="text-sm text-white/60">{user.email}</p>
            </div>

            {/* Navigation Menu - Scrollable */}
            <div className="flex-1 py-6 overflow-y-auto">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-s3m-red hover:bg-s3m-red/10 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-s3m-red hover:bg-s3m-red/10 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">الملف الشخصي</span>
                </Link>
              </nav>
            </div>

            {/* Admin and Logout Section - Fixed at bottom */}
            <div className="border-t border-s3m-red/20 pt-4 pb-6 flex-shrink-0 space-y-2">
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-s3m-red hover:bg-s3m-red/10 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">لوحة الإدارة</span>
                </Link>
              )}
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-s3m-red/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/876694d5-ec41-469d-9b93-b1c067364893.png"
              alt="S3M E-Sports"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              S3M E-Sports
            </span>
          </Link>

          {/* Desktop Navigation - Enhanced with styling */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 px-3 py-2 text-white/80 hover:text-s3m-red hover:bg-white/5 rounded-md transition-all duration-200 font-medium text-sm lg:text-base"
              >
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section - Enhanced with animations */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationsPopover />
                
                {userRole === 'admin' && (
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white transition-all duration-200"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      لوحة الإدارة
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-8 w-8 rounded-full hover:bg-white/10 transition-colors duration-200 p-0"
                    >
                      <Avatar className="h-8 w-8 border border-s3m-red/30 transition-transform hover:scale-105 duration-200">
                        <AvatarImage 
                          src={getAvatarUrl() || ""} 
                          alt="Profile"
                          key={getAvatarUrl() || 'no-avatar'}
                          onError={(e) => {
                            console.error('Avatar failed to load:', e);
                          }}
                        />
                        <AvatarFallback className="bg-s3m-red text-white">
                          {profileLoading ? <User className="h-4 w-4" /> : getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-56 bg-black/90 border-s3m-red/20 z-50 animate-in fade-in-80 slide-in-from-top-5" 
                    align="end" 
                    forceMount
                  >
                    <DropdownMenuItem disabled className="text-white/60">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-white hover:bg-s3m-red/20">
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-s3m-red/20">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-s3m-red hover:bg-white/5 transition-all duration-200"
                  >
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red shadow-lg shadow-s3m-red/20 hover:shadow-s3m-red/40 transition-all duration-300"
                  >
                    انضم الآن
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button/user avatar */}
          <div className="md:hidden">
            {user ? (
              <MobileUserButton />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation for non-authenticated users */}
        {!user && isOpen && (
          <div className="md:hidden py-4 border-t border-s3m-red/20 animate-in slide-in-from-top-5 duration-300">
            <div className="flex flex-col space-y-2 max-h-96 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 text-white/80 hover:text-s3m-red hover:bg-white/5 transition-colors duration-200 font-medium rounded-md px-4 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="px-4 py-2 space-y-2 border-t border-s3m-red/20 mt-4 pt-4">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:text-s3m-red">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                    انضم الآن
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
