import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Account Info
    email: "",
    password: "",
    confirmPassword: "",
    
    // Step 2: Personal Info
    fullName: "",
    username: "",
    gameId: "",
    age: "",
    country: "",
    city: "",
    
    // Step 3: Gaming Info
    gameExperience: "",
    favoriteWeapons: "",
    playStyle: "",
    availability: "",
  });

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Pass additional user metadata
      const userMetadata = {
        username: formData.username,
        full_name: formData.fullName,
        game_id: formData.gameId,
      };

      await signUp(formData.email, formData.password, userMetadata);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في S3M E-Sports",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">البريد الإلكتروني *</Label>
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
        <Label htmlFor="password" className="text-white">كلمة المرور *</Label>
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white">تأكيد كلمة المرور *</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          className="bg-black/20 border-s3m-red/30 text-white"
          placeholder="••••••••"
          required
        />
      </div>

      <Button 
        type="button" 
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
      >
        التالي
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-white">الاسم الكامل *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          className="bg-black/20 border-s3m-red/30 text-white"
          placeholder="اسمك الكامل"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username" className="text-white">اسم المستخدم *</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          className="bg-black/20 border-s3m-red/30 text-white"
          placeholder="اسم مستخدم فريد"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gameId" className="text-white">معرف Free Fire *</Label>
        <Input
          id="gameId"
          value={formData.gameId}
          onChange={(e) => handleInputChange("gameId", e.target.value)}
          className="bg-black/20 border-s3m-red/30 text-white"
          placeholder="معرفك في لعبة Free Fire"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age" className="text-white">العمر</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            className="bg-black/20 border-s3m-red/30 text-white"
            placeholder="العمر"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-white">البلد</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
            <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
              <SelectValue placeholder="اختر البلد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sa">السعودية</SelectItem>
              <SelectItem value="ae">الإمارات</SelectItem>
              <SelectItem value="kw">الكويت</SelectItem>
              <SelectItem value="qa">قطر</SelectItem>
              <SelectItem value="bh">البحرين</SelectItem>
              <SelectItem value="om">عمان</SelectItem>
              <SelectItem value="jo">الأردن</SelectItem>
              <SelectItem value="lb">لبنان</SelectItem>
              <SelectItem value="sy">سوريا</SelectItem>
              <SelectItem value="iq">العراق</SelectItem>
              <SelectItem value="eg">مصر</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          onClick={handlePrevious}
          variant="outline"
          className="flex-1 border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
        >
          السابق
        </Button>
        <Button 
          type="button" 
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
        >
          التالي
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gameExperience" className="text-white">سنوات الخبرة في Free Fire</Label>
        <Select value={formData.gameExperience} onValueChange={(value) => handleInputChange("gameExperience", value)}>
          <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
            <SelectValue placeholder="اختر سنوات الخبرة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="less-than-1">أقل من سنة</SelectItem>
            <SelectItem value="1-2">1-2 سنة</SelectItem>
            <SelectItem value="2-3">2-3 سنوات</SelectItem>
            <SelectItem value="more-than-3">أكثر من 3 سنوات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="playStyle" className="text-white">أسلوب اللعب المفضل</Label>
        <Select value={formData.playStyle} onValueChange={(value) => handleInputChange("playStyle", value)}>
          <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
            <SelectValue placeholder="اختر أسلوب اللعب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aggressive">عدواني</SelectItem>
            <SelectItem value="tactical">تكتيكي</SelectItem>
            <SelectItem value="support">دعم الفريق</SelectItem>
            <SelectItem value="sniper">قناص</SelectItem>
            <SelectItem value="balanced">متوازن</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability" className="text-white">الوقت المتاح للعب يومياً</Label>
        <Select value={formData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
          <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
            <SelectValue placeholder="اختر الوقت المتاح" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-2">1-2 ساعة</SelectItem>
            <SelectItem value="2-4">2-4 ساعات</SelectItem>
            <SelectItem value="4-6">4-6 ساعات</SelectItem>
            <SelectItem value="more-than-6">أكثر من 6 ساعات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          onClick={handlePrevious}
          variant="outline"
          className="flex-1 border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
        >
          السابق
        </Button>
        <Button 
          type="submit"
          className="flex-1 bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="gaming-card">
            <CardHeader className="text-center">
              <div className="gaming-gradient w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">S3M</span>
              </div>
              <CardTitle className="text-2xl text-s3m-red">إنشاء حساب جديد</CardTitle>
              <p className="text-white/70">انضم إلى فريق S3M E-Sports</p>
              
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        step <= currentStep ? 'bg-s3m-red' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </form>

              <Separator className="my-6 bg-white/20" />

              <div className="text-center">
                <p className="text-white/70 mb-4">لديك حساب بالفعل؟</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white">
                    تسجيل الدخول
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-white/50">
                  بإنشاء حساب، أنت توافق على{" "}
                  <Link to="/terms" className="text-s3m-red hover:text-red-300">
                    الشروط والأحكام
                  </Link>{" "}
                  و{" "}
                  <Link to="/privacy" className="text-s3m-red hover:text-red-300">
                    سياسة الخصوصية
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

export default Signup;
