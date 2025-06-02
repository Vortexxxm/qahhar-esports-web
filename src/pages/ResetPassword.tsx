
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check if we have the required session
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Set the session with the tokens from URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (confirmPassword && password !== confirmPassword) {
      return "كلمتا المرور غير متطابقتان";
    }
    return "";
  };

  const handlePasswordChange = (value: string) => {
    setPasswords(prev => ({ ...prev, password: value }));
    const error = validatePassword(value);
    setErrors(prev => ({ ...prev, password: error }));
    
    // Also validate confirm password if it's filled
    if (passwords.confirmPassword) {
      const confirmError = validateConfirmPassword(value, passwords.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setPasswords(prev => ({ ...prev, confirmPassword: value }));
    const error = validateConfirmPassword(passwords.password, value);
    setErrors(prev => ({ ...prev, confirmPassword: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both fields
    const passwordError = validatePassword(passwords.password);
    const confirmPasswordError = validateConfirmPassword(passwords.password, passwords.confirmPassword);
    
    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isSuccess) {
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
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-s3m-red text-center flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                  تم بنجاح
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">
                    تم تغيير كلمة المرور بنجاح
                  </h2>
                  <p className="text-white/70">
                    يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
                  </p>
                </div>
                
                <Button 
                  onClick={handleBackToLogin}
                  className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                >
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة لتسجيل الدخول
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-white/70">إعادة تعيين كلمة المرور</p>
          </div>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-s3m-red text-center flex items-center justify-center">
                <Lock className="h-5 w-5 mr-2" />
                كلمة مرور جديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={passwords.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={`bg-black/20 border-s3m-red/30 text-white pl-10 pr-10 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      placeholder="أدخل كلمة المرور الجديدة"
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
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      className={`bg-black/20 border-s3m-red/30 text-white pl-10 pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                      placeholder="أعد إدخال كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-white/60 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                  disabled={isLoading || !!errors.password || !!errors.confirmPassword}
                >
                  {isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-white/60 hover:text-white text-sm underline"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
