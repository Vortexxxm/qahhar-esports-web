
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gameId: "",
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "خطأ",
        description: "يجب الموافقة على الشروط والأحكام",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "مرحباً بك في S3M!",
      description: "تم إنشاء حسابك بنجاح",
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
              <CardTitle className="text-2xl text-gaming-primary">إنشاء حساب جديد</CardTitle>
              <p className="text-white/70">انضم إلى مجتمع S3M E-Sports</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">الاسم الأول</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="bg-black/20 border-gaming-primary/30 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">الاسم الأخير</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="bg-black/20 border-gaming-primary/30 text-white"
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="gameId" className="text-white">معرف Free Fire</Label>
                  <Input
                    id="gameId"
                    value={formData.gameId}
                    onChange={(e) => handleInputChange("gameId", e.target.value)}
                    className="bg-black/20 border-gaming-primary/30 text-white"
                    placeholder="123456789"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="bg-black/20 border-gaming-primary/30 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="border-gaming-primary data-[state=checked]:bg-gaming-primary"
                  />
                  <Label htmlFor="terms" className="text-sm text-white/80">
                    أوافق على{" "}
                    <Link to="/terms" className="text-gaming-primary hover:text-gaming-secondary">
                      الشروط والأحكام
                    </Link>{" "}
                    و{" "}
                    <Link to="/privacy" className="text-gaming-primary hover:text-gaming-secondary">
                      سياسة الخصوصية
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full gaming-gradient hover:opacity-90 text-lg py-3">
                  إنشاء الحساب
                </Button>
              </form>

              <Separator className="my-6 bg-white/20" />

              <div className="text-center">
                <p className="text-white/70 mb-4">لديك حساب بالفعل؟</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-gaming-primary text-gaming-primary hover:bg-gaming-primary hover:text-white">
                    تسجيل الدخول
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
