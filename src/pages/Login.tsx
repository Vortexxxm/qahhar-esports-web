
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
