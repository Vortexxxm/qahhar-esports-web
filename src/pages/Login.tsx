
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (!error) {
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="gaming-card">
            <CardHeader className="text-center">
              <div className="gaming-gradient w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">S3M</span>
              </div>
              <CardTitle className="text-2xl text-s3m-red">تسجيل الدخول</CardTitle>
              <p className="text-white/70">ادخل إلى حسابك في S3M E-Sports</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-lg py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>

              <Separator className="my-6 bg-white/20" />

              <div className="text-center">
                <p className="text-white/70 mb-4">ليس لديك حساب؟</p>
                <Link to="/signup">
                  <Button variant="outline" className="w-full border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white">
                    إنشاء حساب جديد
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-white/50">
                  بتسجيل الدخول، أنت توافق على{" "}
                  <Link to="/terms" className="text-s3m-red hover:text-red-300">
                    الشروط والأحكام
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
