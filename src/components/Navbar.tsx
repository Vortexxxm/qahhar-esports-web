
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Settings, News, Trophy } from "lucide-react";
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: "الرئيسية", href: "/" },
    { name: "من نحن", href: "/about" },
    { name: "المتصدرين", href: "/leaderboard" },
    { name: "الأخبار", href: "/news", icon: News },
    { name: "البطولات", href: "/tournaments", icon: Trophy },
    { name: "انضم إلينا", href: "/join-us" },
  ];

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
              <AvatarImage src={profile?.avatar_url || ""} alt="Profile" />
              <AvatarFallback className="bg-s3m-red text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-black/95 border-s3m-red/20 text-white">
          <div className="flex flex-col h-full">
            {/* User Profile Section */}
            <div className="flex flex-col items-center py-6 border-b border-s3m-red/20">
              <Avatar className="h-20 w-20 mb-4 border-4 border-s3m-red/50">
                <AvatarImage src={profile?.avatar_url || ""} alt="Profile" />
                <AvatarFallback className="bg-s3m-red text-white text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-white">{profile?.username || 'مستخدم'}</h3>
              <p className="text-sm text-white/60">{user.email}</p>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 py-6">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-s3m-red hover:bg-s3m-red/10 transition-all duration-200"
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-s3m-red hover:bg-s3m-red/10 transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">الملف الشخصي</span>
                </Link>
              </nav>
            </div>

            {/* Admin & Actions Section */}
            <div className="border-t border-s3m-red/20 pt-6 space-y-2">
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-s3m-red hover:bg-s3m-red/10 transition-all duration-200"
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-white/80 hover:text-s3m-red transition-colors duration-200 font-medium"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {userRole === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white">
                      <Settings className="h-4 w-4 ml-2" />
                      لوحة الإدارة
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ""} alt="Profile" />
                        <AvatarFallback className="bg-s3m-red text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/90 border-s3m-red/20" align="end" forceMount>
                    <DropdownMenuItem disabled className="text-white/60">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-white hover:bg-s3m-red/20">
                      <Link to="/profile" className="flex items-center">
                        <User className="ml-2 h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-s3m-red/20">
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-s3m-red">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
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
          <div className="md:hidden py-4 border-t border-s3m-red/20">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 text-white/80 hover:text-s3m-red transition-colors duration-200 font-medium px-4 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
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
