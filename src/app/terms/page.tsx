'use client';

import { Header } from '@/components/layout';
import { Card } from '@/components/ui';
import { FileText, Check, AlertTriangle, CreditCard, Scale } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">شروط الخدمة</h1>
          <p className="text-slate-400">آخر تحديث: يناير 2026</p>
        </div>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">الموافقة على الشروط</h2>
          <p className="text-slate-300 leading-relaxed">
            باستخدامك أو وصولك إلى ميني رمضان، فإنك توافق على الالتزام بهذه الشروط.
            إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يمكنك استخدام الخدمة.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-amber-400" />
            استخدام الخدمة
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            ميني رمضان هو تطبيق عائلي مصمم لمساعدة العائلات على تتبع رمضان والاحتفال به معاً.
            باستخدامك للخدمة، فإنك توافق على:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>استخدام التطبيق للغرض المقصود منه</li>
            <li>تقديم معلومات دقيقة عند إنشاء حساب</li>
            <li>الحفاظ على أمان بيانات حسابك</li>
            <li>عدم مشاركة محتوى غير لائق</li>
            <li>احترام المستخدمين الآخرين وخصوصيتهم</li>
            <li>عدم محاولة اختراق الخدمة أو تعديلها أو إساءة استخدامها</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">الحسابات</h2>
          <p className="text-slate-300 leading-relaxed">
            عند إنشاء حساب لدينا، يجب عليك تقديم معلومات دقيقة وكاملة.
            أنت مسؤول عن الحفاظ على أمان حسابك وعن جميع الأنشطة التي تتم من خلاله.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            يتم إدارة حسابات العائلة من قبل الوالد أو الوصي الذي أنشأ الحساب.
            وهم مسؤولون عن جميع الملفات الشخصية والأنشطة ضمن حساب العائلة.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">المحتوى</h2>
          <p className="text-slate-300 leading-relaxed">
            يمكن للمستخدمين رفع محتوى مثل الصور والرسائل والملاحظات. برفع المحتوى،
            فإنك تمنح ميني رمضان ترخيصاً لتخزين وعرض هذا المحتوى ضمن حساب عائلتك.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            أنت مسؤول عن التأكد من أن أي محتوى ترفعه:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mt-2">
            <li>لا ينتهك أي قوانين أو لوائح</li>
            <li>لا يتعدى على حقوق الآخرين</li>
            <li>مناسب لجميع الأعمار</li>
            <li>لا يحتوي على مواد ضارة أو مسيئة</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            الاشتراكات والدفع
          </h2>
          <p className="text-slate-300 leading-relaxed">
            يقدم ميني رمضان مستويات اشتراك مجانية ومدفوعة. يوفر اشتراك &quot;تذكرة رمضان&quot;
            المدفوع الوصول إلى الميزات المميزة.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mt-4">
            <li>يتم إصدار فواتير الاشتراكات سنوياً</li>
            <li>تتم معالجة الدفع بشكل آمن عبر Stripe</li>
            <li>يمكنك إلغاء اشتراكك في أي وقت</li>
            <li>تتم معالجة المبالغ المستردة وفقاً لسياسة الاسترداد لدينا</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            إخلاء المسؤولية
          </h2>
          <p className="text-slate-300 leading-relaxed">
            يتم تقديم ميني رمضان &quot;كما هو&quot; دون أي ضمانات من أي نوع. لا نضمن
            أن الخدمة ستكون متواصلة أو آمنة أو خالية من الأخطاء.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            مواقيت الصلاة وتواريخ رمضان المعروضة في التطبيق تقريبية ويجب التحقق منها
            مع السلطات الدينية المحلية. نحن غير مسؤولين عن أي أخطاء في حساب مواقيت الصلاة.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">تحديد المسؤولية</h2>
          <p className="text-slate-300 leading-relaxed">
            إلى أقصى حد يسمح به القانون، لن يكون ميني رمضان ومشغلوه مسؤولين عن
            أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو تأديبية،
            أو أي خسارة في الأرباح أو الإيرادات، سواء تكبدتها بشكل مباشر أو غير مباشر.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">إنهاء الخدمة</h2>
          <p className="text-slate-300 leading-relaxed">
            يمكننا إنهاء أو تعليق حسابك فوراً، دون إشعار مسبق، بسبب
            سلوك نعتقد أنه ينتهك هذه الشروط أو يضر بالمستخدمين الآخرين
            أو بنا أو بأطراف ثالثة، أو لأي سبب آخر.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            يمكنك حذف حسابك في أي وقت من خلال إعدادات التطبيق. عند الحذف،
            ستتم إزالة بياناتك نهائياً من أنظمتنا.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            القانون الحاكم
          </h2>
          <p className="text-slate-300 leading-relaxed">
            تخضع هذه الشروط وتُفسّر وفقاً لقوانين المملكة المتحدة،
            بصرف النظر عن أحكام تعارض القوانين.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">التغييرات على الشروط</h2>
          <p className="text-slate-300 leading-relaxed">
            نحتفظ بالحق في تعديل أو استبدال هذه الشروط في أي وقت. سنقدم
            إشعاراً بأي تغييرات جوهرية من خلال نشر الشروط الجديدة على هذه الصفحة.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            استمرارك في استخدام الخدمة بعد أي تغييرات يشكل قبولاً
            لشروط الخدمة الجديدة.
          </p>
        </Card>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            ← العودة إلى ميني رمضان
          </Link>
        </div>
      </main>
    </div>
  );
}
