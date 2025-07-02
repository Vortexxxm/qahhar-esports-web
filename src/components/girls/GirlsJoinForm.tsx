
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Heart, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  full_name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  age: z.number().min(13, "العمر يجب أن يكون 13 سنة على الأقل").max(30, "العمر يجب أن يكون أقل من 30 سنة"),
  game_id: z.string().min(1, "معرف اللعبة مطلوب"),
  phone_number: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  experience_level: z.enum(["beginner", "intermediate", "advanced", "professional"]),
  play_hours_daily: z.string().min(1, "ساعات اللعب مطلوبة"),
  previous_teams: z.string().optional(),
  why_join: z.string().min(20, "يجب أن يكون السبب 20 حرف على الأقل"),
  commitment_level: z.enum(["casual", "semi_serious", "serious", "professional"]),
  can_attend_training: z.boolean(),
  preferred_role: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const GirlsJoinForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      can_attend_training: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('girls_join_requests').insert(data);
      
      if (error) throw error;

      toast({
        title: "تم إرسال الطلب بنجاح! 🎉",
        description: "سيتم مراجعة طلبك والتواصل معك قريباً",
      });

      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "حدث خطأ",
        description: "لم يتم إرسال الطلب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-pink-400" />
          انضمي لفريق S3M Girls
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          هل تحلمين بأن تكوني جزءاً من أقوى فريق نسائي في عالم الألعاب الإلكترونية؟ 
          املأي النموذج أدناه وابدأي رحلتك معنا! 💫
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="gaming-card bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-400/30 text-center">
          <CardContent className="p-6">
            <Crown className="h-12 w-12 text-pink-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">قيادة مميزة</h3>
            <p className="text-white/70 text-sm">بقيادة شهد والفريق المحترف</p>
          </CardContent>
        </Card>
        
        <Card className="gaming-card bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/30 text-center">
          <CardContent className="p-6">
            <Star className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">بيئة احترافية</h3>
            <p className="text-white/70 text-sm">تدريب منتظم وتطوير مستمر</p>
          </CardContent>
        </Card>
        
        <Card className="gaming-card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-center">
          <CardContent className="p-6">
            <Heart className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">مجتمع متميز</h3>
            <p className="text-white/70 text-sm">صداقات حقيقية وذكريات جميلة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-pink-400" />
            نموذج الانضمام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">الاسم الكامل *</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخلي اسمك الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">العمر *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="العمر"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="game_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">معرف اللعبة *</FormLabel>
                      <FormControl>
                        <Input placeholder="معرف اللعبة (Player ID)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">رقم الهاتف *</FormLabel>
                      <FormControl>
                        <Input placeholder="05xxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">البريد الإلكتروني *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">مستوى الخبرة *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختاري مستوى خبرتك" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">مبتدئة</SelectItem>
                          <SelectItem value="intermediate">متوسطة</SelectItem>
                          <SelectItem value="advanced">متقدمة</SelectItem>
                          <SelectItem value="professional">محترفة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="play_hours_daily"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">ساعات اللعب يومياً *</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 2-4 ساعات" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commitment_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">مستوى الالتزام *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختاري مستوى التزامك" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="casual">عادي</SelectItem>
                          <SelectItem value="semi_serious">شبه جدي</SelectItem>
                          <SelectItem value="serious">جدي</SelectItem>
                          <SelectItem value="professional">احترافي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="previous_teams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">الفرق السابقة (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="اذكري الفرق التي لعبت معها سابقاً (إن وجد)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">الدور المفضل (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: Support, Assault, Sniper" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="why_join"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">لماذا تريدين الانضمام لفريق S3M Girls؟ *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أخبرينا عن دوافعك وأهدافك في الانضمام للفريق..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="can_attend_training"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/20 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        أستطيع حضور التدريبات المنتظمة
                      </FormLabel>
                      <p className="text-sm text-white/60">
                        التدريبات مهمة لتطوير مستوى الفريق والتناغم بين الأعضاء
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 text-lg"
              >
                {isSubmitting ? "جاري الإرسال..." : "إرسال طلب الانضمام 💖"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="gaming-card bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-400/30">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-3">ملاحظة مهمة</h3>
          <p className="text-white/80 leading-relaxed">
            سيتم مراجعة جميع الطلبات بعناية من قبل قائدة الفريق شهد والإدارة. 
            إذا تم قبول طلبك، سيتم التواصل معك خلال 3-5 أيام عمل. 
            نتطلع لاستقبالك في عائلة S3M Girls! 👑✨
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GirlsJoinForm;
