
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
  });
  const [resetEmail, setResetEmail] = useState("");

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في S3M",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: signupData.username,
            full_name: signupData.fullName,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast({
        title: "تم إرسال رابط إعادة التعيين",
        description: "يرجى التحقق من بريدك الإلكتروني",
      });

      setShowResetForm(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80')`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-s3m-red/20 to-red-900/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              S3M
            </h1>
            <p className="text-white/70">انضم إلى أقوى فريق في Free Fire</p>
          </div>

          {showResetForm ? (
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-s3m-red text-center flex items-center justify-center">
                  <Mail className="h-5 w-5 mr-2" />
                  استعادة كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-white">البريد الإلكتروني</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                      disabled={isLoading}
                    >
                      {isLoading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full border-s3m-red/30 text-white hover:bg-s3m-red/10"
                      onClick={() => setShowResetForm(false)}
                    >
                      العودة لتسجيل الدخول
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="gaming-card">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/20">
                  <TabsTrigger value="login" className="data-[state=active]:bg-s3m-red">
                    تسجيل الدخول
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-s3m-red">
                    إنشاء حساب
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <CardHeader>
                    <CardTitle className="text-s3m-red text-center flex items-center justify-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      تسجيل الدخول
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleGoogleSignIn}
                      className="w-full bg-white text-gray-900 hover:bg-gray-200 flex items-center justify-center gap-2 mb-4 relative"
                      disabled={isLoading}
                    >
                      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                          <path d="M21.35,11.1H12v3.73h5.51c-0.52,2.48-2.76,4.34-5.51,4.34c-3.36,0-6.1-2.69-6.1-6s2.73-6,6.1-6c1.55,0,2.95,0.57,4.03,1.5l2.7-2.58C17.18,4.56,14.74,3.5,12,3.5c-4.97,0-9,3.99-9,8.9s4.03,8.9,9,8.9c4.97,0,8.54-3.5,8.54-8.29C21.54,12.44,21.47,11.78,21.35,11.1z" fill="#4285F4"></path>
                          <path d="M3,11.1h4v3.73H3V11.1z" fill="#34A853"></path>
                          <path d="M12,3.5c-1.97,0-3.79,0.71-5.2,1.88L3,2.6C5.02,1,8.29,0,12,0c3.72,0,6.98,1,9,2.6L18.2,5.38C16.79,4.21,14.97,3.5,12,3.5z" fill="#EA4335"></path>
                          <path d="M12,21.3c-3.72,0-6.98-1-9-2.6l3.8-2.77C8.21,16.79,10.03,17.5,12,17.5c1.97,0,3.79-0.71,5.2-1.88l3.8,2.77C18.98,20.3,15.72,21.3,12,21.3z" fill="#FBBC05"></path>
                        </g>
                      </svg>
                      <span>تسجيل الدخول باستخدام جوجل</span>
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-600"></span>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black/50 text-gray-400">أو تسجيل الدخول بالبريد الإلكتروني</span>
                      </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">البريد الإلكتروني</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="email"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-black/20 border-s3m-red/30 text-white pl-10"
                            placeholder="example@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">كلمة المرور</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                            className="bg-black/20 border-s3m-red/30 text-white pl-10 pr-10"
                            placeholder="كلمة المرور"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-white/60 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-s3m-red hover:text-red-400 text-sm underline"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                        disabled={isLoading}
                      >
                        {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>

                <TabsContent value="signup">
                  <CardHeader>
                    <CardTitle className="text-s3m-red text-center flex items-center justify-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      إنشاء حساب جديد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleGoogleSignIn}
                      className="w-full bg-white text-gray-900 hover:bg-gray-200 flex items-center justify-center gap-2 mb-4"
                      disabled={isLoading}
                    >
                      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                          <path d="M21.35,11.1H12v3.73h5.51c-0.52,2.48-2.76,4.34-5.51,4.34c-3.36,0-6.1-2.69-6.1-6s2.73-6,6.1-6c1.55,0,2.95,0.57,4.03,1.5l2.7-2.58C17.18,4.56,14.74,3.5,12,3.5c-4.97,0-9,3.99-9,8.9s4.03,8.9,9,8.9c4.97,0,8.54-3.5,8.54-8.29C21.54,12.44,21.47,11.78,21.35,11.1z" fill="#4285F4"></path>
                          <path d="M3,11.1h4v3.73H3V11.1z" fill="#34A853"></path>
                          <path d="M12,3.5c-1.97,0-3.79,0.71-5.2,1.88L3,2.6C5.02,1,8.29,0,12,0c3.72,0,6.98,1,9,2.6L18.2,5.38C16.79,4.21,14.97,3.5,12,3.5z" fill="#EA4335"></path>
                          <path d="M12,21.3c-3.72,0-6.98-1-9-2.6l3.8-2.77C8.21,16.79,10.03,17.5,12,17.5c1.97,0,3.79-0.71,5.2-1.88l3.8,2.77C18.98,20.3,15.72,21.3,12,21.3z" fill="#FBBC05"></path>
                        </g>
                      </svg>
                      <span>التسجيل باستخدام جوجل</span>
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-600"></span>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black/50 text-gray-400">أو التسجيل بالبريد الإلكتروني</span>
                      </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-username" className="text-white">اسم المستخدم</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="signup-username"
                            value={signupData.username}
                            onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                            className="bg-black/20 border-s3m-red/30 text-white pl-10"
                            placeholder="اسم المستخدم"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-fullname" className="text-white">الاسم الكامل</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="signup-fullname"
                            value={signupData.fullName}
                            onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="bg-black/20 border-s3m-red/30 text-white pl-10"
                            placeholder="الاسم الكامل"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-white">البريد الإلكتروني</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={signupData.email}
                            onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-black/20 border-s3m-red/30 text-white pl-10"
                            placeholder="example@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-white">كلمة المرور</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            value={signupData.password}
                            onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                            className="bg-black/20 border-s3m-red/30 text-white pl-10 pr-10"
                            placeholder="كلمة المرور"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-white/60 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                        disabled={isLoading}
                      >
                        {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          )}

          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-white/60 hover:text-white transition-colors"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
