'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Moon, Mail, Lock, Users, ArrowRight, Check } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل'),
  familyName: z.string().min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل').max(50, 'اسم العائلة طويل جداً'),
});

type SignupFormData = z.infer<typeof signupSchema>;

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = searchParams.get('plan');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            family_name: data.familyName,
          },
        },
      });

      if (signUpError) {
        // Use generic error message to prevent user enumeration
        if (signUpError.message.includes('already registered')) {
          setError('تعذر إنشاء الحساب. يرجى تجربة بريد إلكتروني مختلف أو تسجيل الدخول.');
        } else {
          setError('تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.');
        }
        return;
      }

      if (authData.user) {
        router.push('/onboarding');
        router.refresh();
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'تتبع الصيام بـ ٤ أوضاع مختلفة',
    'بطاقات العجائب اليومية للتعلم',
    'مهمات الإحسان للعائلة',
    'سماء ليلية تمتلئ بنجوم عائلتك',
    'رسائل الإفطار بين أفراد العائلة',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-amber-500 to-yellow-400" />

          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-4">
                <Moon className="w-8 h-8 text-slate-900" />
              </div>
              <h1 className="text-2xl font-bold text-white">إنشاء حساب عائلتك</h1>
              <p className="text-slate-400 mt-1">
                {planType === 'paid'
                  ? 'ابدأ تجربتك المجانية لبطاقة رمضان'
                  : 'ابدأ رحلة رمضان معاً'
                }
              </p>
            </div>

            {planType === 'paid' && (
              <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-amber-400 font-medium">
                  بطاقة رمضان - تجربة مجانية ٧ أيام
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  إلغاء في أي وقت، بدون التزام
                </p>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="اسم العائلة"
                placeholder="عائلة أحمد"
                icon={<Users className="w-5 h-5" />}
                error={errors.familyName?.message}
                {...register('familyName')}
              />

              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="بريدك@email.com"
                icon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="كلمة المرور"
                type="password"
                placeholder="٨ أحرف على الأقل"
                icon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="pt-4">
                <p className="text-sm text-slate-400 mb-3">ما ستحصل عليه:</p>
                <ul className="space-y-2">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-6"
              >
                {planType === 'paid' ? 'ابدأ التجربة المجانية' : 'إنشاء الحساب'}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                بإنشاء حساب، أنت توافق على شروط الخدمة وسياسة الخصوصية
              </p>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-sm text-slate-500">أو</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            <p className="text-center text-slate-400">
              لديك حساب بالفعل؟{' '}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function SignupLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-slate-400">جاري التحميل...</div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}
