
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Calendar, Gamepad2 } from "lucide-react";

const Signup = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    country: "",
    city: "",
    password: "",
    confirmPassword: "",
    gameId: "",
    gameName: "",
    currentRank: "",
    playingHours: "",
    favoriteWeapons: "",
    experienceYears: "",
    agreeToTerms: false,
    agreeToPrivacy: false,
    subscribeNewsletter: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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

    if (!formData.agreeToPrivacy) {
      toast({
        title: "خطأ",
        description: "يجب الموافقة على سياسة الخصوصية",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "مرحباً بك في S3M!",
      description: "تم إنشاء حسابك بنجاح. مرحباً بك في عائلة S3M E-Sports!",
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 3:
        return formData.gameId && formData.gameName && formData.agreeToTerms && formData.agreeToPrivacy;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto">
          <Card className="gaming-card">
            <CardHeader className="text-center">
              <div className="gaming-gradient w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">S3M</span>
              </div>
              <CardTitle className="text-2xl md:text-3xl text-s3m-red">إنشاء حساب جديد</CardTitle>
              <p className="text-white/70">انضم إلى مجتمع S3M E-Sports</p>
              
              {/* Progress indicator */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        step <= currentStep ? 'bg-s3m-red' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/60 mt-2">
                الخطوة {currentStep} من {totalSteps}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                        <User className="w-5 h-5" />
                        المعلومات الشخصية
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">الاسم الأول *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="bg-black/20 border-s3m-red/30 text-white"
                          placeholder="أحمد"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">الاسم الأخير *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="bg-black/20 border-s3m-red/30 text-white"
                          placeholder="محمد"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني *
                      </Label>
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
                      <Label htmlFor="phone" className="text-white flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        رقم الهاتف *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-black/20 border-s3m-red/30 text-white"
                        placeholder="+966 50 123 4567"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          تاريخ الميلاد
                        </Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                          className="bg-black/20 border-s3m-red/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-white flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          البلد
                        </Label>
                        <Select onValueChange={(value) => handleInputChange("country", value)}>
                          <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                            <SelectValue placeholder="اختر البلد" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sa">المملكة العربية السعودية</SelectItem>
                            <SelectItem value="ae">الإمارات العربية المتحدة</SelectItem>
                            <SelectItem value="kw">الكويت</SelectItem>
                            <SelectItem value="qa">قطر</SelectItem>
                            <SelectItem value="bh">البحرين</SelectItem>
                            <SelectItem value="om">عمان</SelectItem>
                            <SelectItem value="eg">مصر</SelectItem>
                            <SelectItem value="jo">الأردن</SelectItem>
                            <SelectItem value="lb">لبنان</SelectItem>
                            <SelectItem value="sy">سوريا</SelectItem>
                            <SelectItem value="iq">العراق</SelectItem>
                            <SelectItem value="ma">المغرب</SelectItem>
                            <SelectItem value="tn">تونس</SelectItem>
                            <SelectItem value="dz">الجزائر</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-white">المدينة</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="bg-black/20 border-s3m-red/30 text-white"
                        placeholder="الرياض"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Account Security */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                        <Eye className="w-5 h-5" />
                        أمان الحساب
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">كلمة المرور *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="bg-black/20 border-s3m-red/30 text-white pr-10"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-white/60">
                        يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">تأكيد كلمة المرور *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="bg-black/20 border-s3m-red/30 text-white pr-10"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-400">كلمة المرور غير متطابقة</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Gaming Information */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                        <Gamepad2 className="w-5 h-5" />
                        معلومات الألعاب
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gameId" className="text-white">معرف Free Fire *</Label>
                        <Input
                          id="gameId"
                          value={formData.gameId}
                          onChange={(e) => handleInputChange("gameId", e.target.value)}
                          className="bg-black/20 border-s3m-red/30 text-white"
                          placeholder="123456789"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gameName" className="text-white">اسم اللاعب في اللعبة *</Label>
                        <Input
                          id="gameName"
                          value={formData.gameName}
                          onChange={(e) => handleInputChange("gameName", e.target.value)}
                          className="bg-black/20 border-s3m-red/30 text-white"
                          placeholder="S3M_Player"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentRank" className="text-white">الرتبة الحالية</Label>
                        <Select onValueChange={(value) => handleInputChange("currentRank", value)}>
                          <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                            <SelectValue placeholder="اختر الرتبة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bronze">برونزي</SelectItem>
                            <SelectItem value="silver">فضي</SelectItem>
                            <SelectItem value="gold">ذهبي</SelectItem>
                            <SelectItem value="platinum">بلاتيني</SelectItem>
                            <SelectItem value="diamond">الماسي</SelectItem>
                            <SelectItem value="heroic">بطولي</SelectItem>
                            <SelectItem value="grandmaster">جراند ماستر</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceYears" className="text-white">سنوات الخبرة</Label>
                        <Select onValueChange={(value) => handleInputChange("experienceYears", value)}>
                          <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                            <SelectValue placeholder="سنوات الخبرة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less-than-1">أقل من سنة</SelectItem>
                            <SelectItem value="1-2">1-2 سنة</SelectItem>
                            <SelectItem value="2-3">2-3 سنوات</SelectItem>
                            <SelectItem value="3-5">3-5 سنوات</SelectItem>
                            <SelectItem value="more-than-5">أكثر من 5 سنوات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="playingHours" className="text-white">ساعات اللعب يومياً</Label>
                      <Select onValueChange={(value) => handleInputChange("playingHours", value)}>
                        <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                          <SelectValue placeholder="كم ساعة تلعب يومياً؟" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 ساعة</SelectItem>
                          <SelectItem value="2-4">2-4 ساعات</SelectItem>
                          <SelectItem value="4-6">4-6 ساعات</SelectItem>
                          <SelectItem value="6-8">6-8 ساعات</SelectItem>
                          <SelectItem value="more-than-8">أكثر من 8 ساعات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="favoriteWeapons" className="text-white">الأسلحة المفضلة</Label>
                      <Input
                        id="favoriteWeapons"
                        value={formData.favoriteWeapons}
                        onChange={(e) => handleInputChange("favoriteWeapons", e.target.value)}
                        className="bg-black/20 border-s3m-red/30 text-white"
                        placeholder="AK47, M4A1, AWM..."
                      />
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                          className="border-s3m-red data-[state=checked]:bg-s3m-red mt-1"
                          required
                        />
                        <Label htmlFor="terms" className="text-sm text-white/80 leading-relaxed">
                          أوافق على{" "}
                          <Link to="/terms" className="text-s3m-red hover:text-s3m-red-light underline">
                            الشروط والأحكام
                          </Link>{" "}
                          الخاصة بفريق S3M E-Sports *
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="privacy"
                          checked={formData.agreeToPrivacy}
                          onCheckedChange={(checked) => handleInputChange("agreeToPrivacy", checked as boolean)}
                          className="border-s3m-red data-[state=checked]:bg-s3m-red mt-1"
                          required
                        />
                        <Label htmlFor="privacy" className="text-sm text-white/80 leading-relaxed">
                          أوافق على{" "}
                          <Link to="/privacy" className="text-s3m-red hover:text-s3m-red-light underline">
                            سياسة الخصوصية
                          </Link>{" "}
                          وأفهم كيفية استخدام بياناتي *
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="newsletter"
                          checked={formData.subscribeNewsletter}
                          onCheckedChange={(checked) => handleInputChange("subscribeNewsletter", checked as boolean)}
                          className="border-s3m-red data-[state=checked]:bg-s3m-red mt-1"
                        />
                        <Label htmlFor="newsletter" className="text-sm text-white/80 leading-relaxed">
                          أريد الحصول على أخبار الفريق والبطولات عبر البريد الإلكتروني
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
                    >
                      السابق
                    </Button>
                  )}
                  
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="flex-1 gaming-gradient hover:opacity-90 text-lg py-3"
                    >
                      التالي
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isStepValid()}
                      className="flex-1 gaming-gradient hover:opacity-90 text-lg py-3"
                    >
                      إنشاء الحساب
                    </Button>
                  )}
                </div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
