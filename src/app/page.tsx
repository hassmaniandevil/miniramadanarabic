'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Moon, Check } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Softer floating elements - lanterns and moons
  const floatingElements = [
    { emoji: '🏮', left: '10%', top: '35%', duration: 4.5 },
    { emoji: '🌙', left: '22%', top: '55%', duration: 5.2 },
    { emoji: '✨', left: '34%', top: '25%', duration: 4.8 },
    { emoji: '🕌', left: '46%', top: '65%', duration: 5.5 },
    { emoji: '🌟', left: '58%', top: '40%', duration: 4.2 },
    { emoji: '🏮', left: '70%', top: '50%', duration: 5.8 },
    { emoji: '✨', left: '82%', top: '30%', duration: 4.6 },
    { emoji: '🌙', left: '94%', top: '60%', duration: 5.0 },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-12">
        {/* Gentle floating lanterns and moons */}
        <div className="absolute inset-0 overflow-hidden">
          {mounted && floatingElements.map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl md:text-3xl opacity-60"
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                y: [-10, -25, -10],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut",
              }}
              style={{
                left: item.left,
                top: item.top,
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>

        {/* Gentle crescent moon */}
        {mounted && (
          <motion.div
            className="absolute top-8 left-4 md:top-16 md:left-16"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
          >
            <motion.div
              className="relative w-20 h-20 md:w-28 md:h-28"
              animate={{ rotate: [0, 3, 0, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 shadow-xl shadow-yellow-300/30" />
              <div className="absolute top-1 left-1 w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-950" />
            </motion.div>
          </motion.div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo with tagline */}
            <motion.div
              className="inline-flex flex-col items-center gap-2 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 3, 0, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Image
                    src="/logo.svg"
                    alt="ميني رمضان"
                    width={56}
                    height={56}
                    className="drop-shadow-lg"
                  />
                </motion.div>
                <span className="text-3xl font-bold">
                  <span className="text-amber-400">ميني</span>
                  <span className="text-white">رمضان</span>
                </span>
              </div>
              <p className="text-amber-200/80 text-sm">رحلة لطيفة لاكتشاف معنى رمضان</p>
            </motion.div>

            {/* Warm, meaningful headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-yellow-200">نكتشف رمضان معاً</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-300">
                خطوة بخطوة
              </span>
            </h1>

            {/* Values-focused description */}
            <motion.p
              className="text-xl md:text-2xl text-white/85 max-w-2xl mx-auto mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              نتعلّم الصبر والإحسان والشكر برفق ومعنى.
              <br className="hidden md:block" />
              قصص دافئة، أعمال طيبة، وذكريات تبقى في القلب.
            </motion.p>

            {/* Trust badges - softer */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="px-4 py-2 bg-amber-500/10 rounded-full text-sm text-amber-200 border border-amber-500/20">
                للأطفال ٤-١٢ سنة
              </span>
              <span className="px-4 py-2 bg-amber-500/10 rounded-full text-sm text-amber-200 border border-amber-500/20">
                بنية ومعنى
              </span>
              <span className="px-4 py-2 bg-emerald-500/10 rounded-full text-sm text-emerald-200 border border-emerald-500/20">
                آمن وبدون إعلانات
              </span>
            </motion.div>

            {/* Warm buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-5 rounded-2xl bg-gradient-to-l from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-900 font-semibold shadow-xl shadow-amber-400/20">
                    ابدأ الرحلة مجاناً
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15">
                    تسجيل الدخول
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Gentle scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-2.5 bg-white/40 rounded-full"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* What We Learn Section - Values focused */}
      <section className="py-16 px-4 bg-gradient-to-b from-purple-900/30 to-indigo-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              ماذا نتعلّم معاً؟
            </h2>
            <p className="text-xl text-amber-200/70">
              نبني القيم الجميلة خطوة خطوة
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Values Cards - Warm, gentle colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20"
            >
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-amber-200 mb-2">
                نتدرّب برفق
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                نجرّب الصيام بخطوات صغيرة. كل محاولة تُحتسب، وكل جهد له قيمة. نتعلّم الصبر دون ضغط.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20"
            >
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-2xl font-bold text-emerald-200 mb-2">
                أعمال طيبة
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                مهمات إحسان صغيرة كل يوم. نساعد، نشارك، ونفرح قلوب من حولنا. الخير يبدأ من البيت.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20"
            >
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-2xl font-bold text-blue-200 mb-2">
                معلومات جميلة
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                كل يوم نكتشف شيئاً جديداً عن رمضان. لماذا نصوم؟ ما معنى الهلال؟ نتعلّم بفضول وحب.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20"
            >
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-bold text-purple-200 mb-2">
                ذكريات العائلة
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                نجمع اللحظات الجميلة معاً. رسائل الإفطار، صور السحور، وقصص قبل النوم تبقى في القلب.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              رحلة للجميع
            </h2>
            <p className="text-xl text-amber-200/70">
              كل فرد في العائلة يشارك بطريقته
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Little Star */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -3 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 text-center"
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                ⭐
              </motion.div>
              <h3 className="text-2xl font-bold text-pink-200 mb-2">نجمة صغيرة</h3>
              <div className="inline-block px-4 py-1 bg-pink-500/20 rounded-full text-pink-200/80 text-sm mb-4">
                ٣-٦ سنوات
              </div>
              <p className="text-white/70">
                &ldquo;ساعدت اليوم!&rdquo; - زر واحد بسيط يُشعرهم بأنهم جزء من رمضان.
              </p>
            </motion.div>

            {/* Child */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -3 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 text-center"
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ rotate: [0, 3, 0, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                🌙
              </motion.div>
              <h3 className="text-2xl font-bold text-cyan-200 mb-2">المستكشف</h3>
              <div className="inline-block px-4 py-1 bg-cyan-500/20 rounded-full text-cyan-200/80 text-sm mb-4">
                ٧-١٢ سنة
              </div>
              <p className="text-white/70">
                يتدرّب على الصيام، يكتشف المعلومات، ويُنجز مهمات الإحسان اليومية.
              </p>
            </motion.div>

            {/* Adult */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -3 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 text-center"
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                🌳
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-200 mb-2">الوالدين</h3>
              <div className="inline-block px-4 py-1 bg-emerald-500/20 rounded-full text-emerald-200/80 text-sm mb-4">
                يشاركون أيضاً
              </div>
              <p className="text-white/70">
                يُرسلون رسائل دافئة للأطفال ويشاركون في جمع نجوم العائلة معاً.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing - Warm and simple */}
      <section className="py-16 px-4 bg-gradient-to-b from-indigo-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              ابدأ رحلتك
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10"
            >
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="text-2xl font-bold text-white mb-2">مجاني</h3>
              <p className="text-3xl font-bold text-white mb-6">٠ ر.س</p>
              <ul className="space-y-3 mb-8">
                {['ملف طفل واحد', 'التدرّب على الصيام', 'معلومة يومية', 'سماء النجوم', 'رسائل الإفطار'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/80">
                    <span className="text-amber-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="secondary" className="w-full text-lg py-4 rounded-xl border border-white/15">
                    ابدأ مجاناً
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Paid */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-amber-400/90 to-yellow-400/90 relative shadow-xl"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-slate-800 rounded-full text-amber-200 text-sm font-medium shadow-lg">
                التجربة الكاملة
              </div>
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">بطاقة رمضان</h3>
              <p className="text-3xl font-bold text-slate-800 mb-1">
                ١١٩ ر.س<span className="text-lg font-normal text-slate-700">/سنة</span>
              </p>
              <p className="text-slate-700 text-sm mb-6">أقل من ٤ ر.س يومياً</p>
              <ul className="space-y-3 mb-8">
                {['حتى ٤ أطفال', '٩٠ قصة إسلامية', 'أبراج العائلة', 'مهمات إحسان يومية', 'متتبع القرآن', 'ذكريات وكبسولات زمنية'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-800 font-medium">
                    <span className="text-slate-700">⭐</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=paid">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full text-lg py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-100 shadow-lg">
                    جرّب ٧ أيام مجاناً
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section - Values focused */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              صُنع بقلب وإخلاص
            </h2>
            <p className="text-lg text-amber-200/70 max-w-2xl mx-auto">
              بنينا ميني رمضان لأننا نريد لأطفالنا أن يحبوا رمضان ويفهموا معناه العميق - بطريقة لطيفة تناسب قلوبهم الصغيرة.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="text-3xl mb-3">📖</div>
              <div className="text-2xl font-bold text-white mb-1">٩٠</div>
              <div className="text-amber-200/70">قصة إسلامية هادفة</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="text-3xl mb-3">💚</div>
              <div className="text-2xl font-bold text-white mb-1">٣٠</div>
              <div className="text-amber-200/70">عمل طيب يومي</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="text-3xl mb-3">🤲</div>
              <div className="text-2xl font-bold text-white mb-1">٣٠</div>
              <div className="text-amber-200/70">دعاء وذكر قصير</div>
            </motion.div>
          </div>

          {/* Values promise */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center"
          >
            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2 text-emerald-200">
                <Check className="w-5 h-5" />
                <span>محتوى إسلامي موثوق</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Check className="w-5 h-5" />
                <span>بدون ضغط أو إجبار</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Check className="w-5 h-5" />
                <span>آمن ومناسب للأطفال</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA - Warm and inviting */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            className="text-5xl mb-6"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🏮
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            هل أنتم مستعدون؟
          </h2>
          <p className="text-xl text-amber-200/70 mb-8">
            نبدأ رحلة رمضان معاً، بخطوات صغيرة ونية كبيرة.
          </p>
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" className="text-xl px-10 py-6 rounded-2xl bg-gradient-to-l from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-900 font-semibold shadow-xl shadow-amber-400/20">
                ابدأ رحلة العائلة
              </Button>
            </motion.div>
          </Link>
          <p className="mt-4 text-sm text-white/50">
            مجاني للبدء · بدون بطاقة ائتمان
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/10 bg-slate-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center">
                <Moon className="w-5 h-5 text-slate-800" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">ميني رمضان</span>
                <p className="text-xs text-amber-200/60">رحلة لطيفة للصغار</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/50">
              <Link href="/privacy" className="hover:text-white/80">الخصوصية</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white/80">الشروط</Link>
            </div>
          </div>
          <div className="text-center text-white/40 text-sm">
            <p>© {new Date().getFullYear()} ميني رمضان · صُنع بإخلاص للعائلات المسلمة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
