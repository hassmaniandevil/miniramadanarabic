'use client';

import { Header } from '@/components/layout';
import { Card } from '@/components/ui';
import { Shield, Mail, Lock, Users, Trash2, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
            <Shield className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">سياسة الخصوصية</h1>
          <p className="text-slate-400">آخر تحديث: يناير 2026</p>
        </div>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            مقدمة
          </h2>
          <p className="text-slate-300 leading-relaxed">
            ميني رمضان (&quot;نحن&quot;، &quot;خدمتنا&quot;، أو &quot;لنا&quot;) ملتزمون بحماية خصوصية
            العائلات التي تستخدم تطبيقنا. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم
            ونحمي معلوماتك عند استخدام ميني رمضان.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            صُمم ميني رمضان للعائلات مع الأطفال. نحن نحرص على ضمان
            حماية بيانات الأطفال وفقاً لقانون حماية خصوصية الأطفال على الإنترنت (COPPA)
            والأنظمة المشابهة في جميع أنحاء العالم.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            المعلومات التي نجمعها
          </h2>
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-medium text-white mb-2">معلومات الحساب</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>البريد الإلكتروني (لإنشاء الحساب وتسجيل الدخول)</li>
                <li>اسم العائلة (الذي تختاره)</li>
                <li>أسماء الملفات الشخصية والصور الرمزية (التي تختارها)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">بيانات النشاط</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>سجلات الصيام والتقدم</li>
                <li>بيانات تتبع الوجبات (مجموعات الطعام المختارة)</li>
                <li>الأنشطة اليومية المكتملة</li>
                <li>النجوم المكتسبة والإنجازات</li>
                <li>الرسائل بين أفراد العائلة</li>
                <li>الصور المرفوعة للذكريات (مخزنة بأمان)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">البيانات التقنية</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>نوع الجهاز ونظام التشغيل</li>
                <li>إصدار التطبيق</li>
                <li>إعدادات المنطقة الزمنية</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            كيف نستخدم معلوماتك
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>لتقديم وصيانة خدمة ميني رمضان</li>
            <li>لمزامنة بيانات عائلتك عبر الأجهزة</li>
            <li>لعرض مواقيت الصلاة بناءً على منطقتك الزمنية</li>
            <li>لتتبع تقدمك في رمضان وإنجازاتك</li>
            <li>لتمكين أفراد العائلة من إرسال رسائل لبعضهم البعض</li>
            <li>لتخزين وعرض ذكريات رمضان</li>
            <li>لإرسال إشعارات الخدمة المهمة (اختياري)</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">تخزين البيانات والأمان</h2>
          <p className="text-slate-300 leading-relaxed">
            تُخزن بياناتك بأمان باستخدام Supabase، الذي يوفر أمان على مستوى
            المؤسسات بما في ذلك التشفير أثناء الراحة والنقل. نستخدم أمان على مستوى الصف
            لضمان أن كل عائلة يمكنها الوصول فقط إلى بياناتها الخاصة.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            تُخزن الصور والوسائط في تخزين سحابي آمن مع ضوابط وصول تضمن
            أن عائلتك فقط يمكنها مشاهدتها.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">خصوصية الأطفال</h2>
          <p className="text-slate-300 leading-relaxed">
            صُمم ميني رمضان للاستخدام العائلي، بما في ذلك الأطفال. نحن لا:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mt-4">
            <li>نجمع معلومات شخصية من الأطفال دون موافقة الوالدين</li>
            <li>نشارك بيانات الأطفال مع أطراف ثالثة</li>
            <li>نستخدم بيانات الأطفال للإعلان أو التسويق</li>
            <li>نسمح للأطفال بنشر منشورات عامة أو الاتصال بالغرباء</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            يتم إدارة جميع ملفات الأطفال من قبل الوالد/الوصي الذي أنشأ
            حساب العائلة.
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">مشاركة البيانات</h2>
          <p className="text-slate-300 leading-relaxed">
            لا نبيع أو نتاجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة.
            قد نشارك البيانات فقط في الظروف التالية:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mt-4">
            <li>مع مزودي الخدمات الذين يساعدوننا في تشغيل التطبيق (الاستضافة، معالجة الدفع)</li>
            <li>عندما يتطلب القانون ذلك أو لحماية حقوقنا</li>
            <li>بموافقتك الصريحة</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-400" />
            حقوقك
          </h2>
          <p className="text-slate-300 leading-relaxed">
            لديك الحق في:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mt-4">
            <li>الوصول إلى بياناتك الشخصية</li>
            <li>تصحيح البيانات غير الدقيقة</li>
            <li>حذف حسابك وجميع البيانات المرتبطة به</li>
            <li>تصدير بياناتك</li>
            <li>سحب الموافقة في أي وقت</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            لممارسة هذه الحقوق، تواصل معنا على privacy@miniramadan.com
          </p>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            اتصل بنا
          </h2>
          <p className="text-slate-300 leading-relaxed">
            إذا كان لديك أسئلة حول سياسة الخصوصية هذه أو ممارساتنا، يرجى التواصل معنا:
          </p>
          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
            <p className="text-white font-medium">ميني رمضان</p>
            <p className="text-slate-400">البريد الإلكتروني: privacy@miniramadan.com</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">التغييرات على هذه السياسة</h2>
          <p className="text-slate-300 leading-relaxed">
            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنُبلغك بأي
            تغييرات من خلال نشر السياسة الجديدة على هذه الصفحة وتحديث
            تاريخ &quot;آخر تحديث&quot;.
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
