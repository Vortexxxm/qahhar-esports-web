
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "مرحباً بك!",
      description: "تم تسجيل الدخول بنجاح",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="gaming-card">
            <CardHeader className="text-center">
              <div className="gaming-gradient w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">S3M</span>
              </div>
              <CardTitle className="text-2xl text-gaming-primary">تسجيل الدخول</CardTitle>
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
                    className="bg-black/20 border-gaming-primary/30 text-white"
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
                    className="bg-black/20 border-gaming-primary/30 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-gaming-primary hover:text-gaming-secondary text-sm">
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <Button type="submit" className="w-full gaming-gradient hover:opacity-90 text-lg py-3">
                  تسجيل الدخول
                </Button>
              </form>

              <Separator className="my-6 bg-white/20" />

              <div className="text-center">
                <p className="text-white/70 mb-4">ليس لديك حساب؟</p>
                <Link to="/signup">
                  <Button variant="outline" className="w-full border-gaming-primary text-gaming-primary hover:bg-gaming-primary hover:text-white">
                    إنشاء حساب جديد
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-white/50">
                  بتسجيل الدخول، أنت توافق على{" "}
                  <Link to="/terms" className="text-gaming-primary hover:text-gaming-secondary">
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
