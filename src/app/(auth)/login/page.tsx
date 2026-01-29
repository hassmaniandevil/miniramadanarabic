'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Moon, Mail, Lock, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        // Use generic error message to prevent user enumeration
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }

      router.push('/family');
      router.refresh();
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <Card className="relative overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-amber-500 to-yellow-400" />

          <div className="p-6 md:p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-4">
                <Moon className="w-8 h-8 text-slate-900" />
              </div>
              <h1 className="text-2xl font-bold text-white">أهلاً بعودتك</h1>
              <p className="text-slate-400 mt-1">سجّل الدخول لحساب عائلتك</p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-start">
                <Link
                  href="/forgot-password"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                تسجيل الدخول
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-sm text-slate-500">أو</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-slate-400">
              ليس لديك حساب؟{' '}
              <Link
                href="/signup"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                أنشئ واحداً
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
