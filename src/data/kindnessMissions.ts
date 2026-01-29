import { KindnessMission } from '@/types';

export const kindnessMissions: KindnessMission[] = [
  // اليوم ١-٥: بداية لطيفة - البيت والعلاقات
  {
    id: 'mission-1',
    day: 1,
    category: 'home',
    title: 'المساعد السري',
    description: 'افعل شيئاً مفيداً في البيت دون أن يطلب منك أحد. ربما ترتب حذاءك، أو تضع شيئاً في مكانه.',
    isQuietStar: false
  },
  {
    id: 'mission-2',
    day: 2,
    category: 'social',
    title: 'كلمات طيبة',
    description: 'أخبر شخصاً في عائلتك بشيء تحبه فيه. شاهد وجهه وهو يضيء بالسعادة!',
    isQuietStar: false
  },
  {
    id: 'mission-3',
    day: 3,
    category: 'home',
    title: 'مساعد الإفطار',
    description: 'ساعد في ترتيب طاولة الإفطار أو في تحضير شيء. حتى المساعدة الصغيرة تصنع فرقاً كبيراً.',
    isQuietStar: false
  },
  {
    id: 'mission-4',
    day: 4,
    category: 'social',
    title: 'ضُم أحداً',
    description: 'إذا رأيت شخصاً وحيداً اليوم - في المدرسة، في المسجد، أو أي مكان - ضُمه إليك. قل له مرحباً أو ادعه ليشاركك.',
    isQuietStar: false
  },
  {
    id: 'mission-5',
    day: 5,
    category: 'spiritual',
    title: 'ثلاث شكرات',
    description: 'قل "الحمد لله" على ثلاثة أشياء محددة اليوم. فكر لماذا أنت ممتن لكل واحد منها.',
    isQuietStar: false
  },

  // اليوم ٦-١٠: خليط من كل الفئات
  {
    id: 'mission-6',
    day: 6,
    category: 'home',
    title: 'رتّب سرير غيرك',
    description: 'رتّب سرير شخص آخر اليوم - ليس سريرك! افعلها بعناية مع الوسادة في مكانها الصحيح.',
    isQuietStar: false
  },
  {
    id: 'mission-7',
    day: 7,
    category: 'charity',
    title: 'لعبة للمشاركة',
    description: 'اختر لعبة أو كتاباً لم تعد تلعب به. ضعه جانباً لتعطيه لشخص سيحبه.',
    isQuietStar: false
  },
  {
    id: 'mission-8',
    day: 8,
    category: 'social',
    title: 'مدح حقيقي',
    description: 'امدح شخصاً على شيء فعله (ليس فقط شكله). "كنت رائعاً في..." أو "أعجبني عندما..."',
    isQuietStar: false
  },
  {
    id: 'mission-9',
    day: 9,
    category: 'spiritual',
    title: 'لحظة هادئة',
    description: 'ابحث عن مكان هادئ واجلس دقيقتين تفكر في شيء جميل. بدون هاتف، بدون كلام - فقط هدوء.',
    isQuietStar: false
  },
  {
    id: 'mission-10',
    day: 10,
    category: 'home',
    title: 'مساعد الماء',
    description: 'اسكب الماء لشخص في الإفطار قبل أن يطلب. لاحظ من يحتاج المزيد.',
    isQuietStar: false
  },

  // اليوم ١١-١٥: أول نجمة هادئة
  {
    id: 'mission-11',
    day: 11,
    category: 'charity',
    title: 'حصالة الصدقة',
    description: 'ضع بعض المال - أي مبلغ - في صندوق الصدقة. إذا لم يكن لديك، اطلب من والديك أن يضعوا شيئاً من أجلك.',
    isQuietStar: false
  },
  {
    id: 'mission-12',
    day: 12,
    category: 'social',
    title: 'رسالة للعائلة',
    description: 'أرسل رسالة (أو ارسم صورة) لقريب لم تتحدث معه منذ فترة. الأجداد يحبون هذا!',
    isQuietStar: false
  },
  {
    id: 'mission-13',
    day: 13,
    category: 'spiritual',
    title: 'دعاء للآخرين',
    description: 'ادعُ دعاءً صغيراً لشخص آخر. اختر شخصاً معيناً واسأل الله أن يساعده في شيء.',
    isQuietStar: true  // نجمة هادئة - خاصة
  },
  {
    id: 'mission-14',
    day: 14,
    category: 'home',
    title: 'بدون جدال',
    description: 'حاول أن تمضي اليوم كله بدون جدال مع أخيك أو أختك. إذا أزعجوك، خذ نفساً عميقاً ودعها تمر.',
    isQuietStar: false
  },
  {
    id: 'mission-15',
    day: 15,
    category: 'social',
    title: 'صديق جديد',
    description: 'تحدث مع شخص لا تتحدث معه عادةً. في المدرسة، في المسجد، أو في حيّك.',
    isQuietStar: false
  },

  // اليوم ١٦-٢٠
  {
    id: 'mission-16',
    day: 16,
    category: 'charity',
    title: 'مشاركة الطعام',
    description: 'ساعد عائلتك في تجهيز طعام إضافي لمشاركته مع جار أو شخص قد يحتاجه.',
    isQuietStar: false
  },
  {
    id: 'mission-17',
    day: 17,
    category: 'home',
    title: 'لطف الصباح الباكر',
    description: 'كن لطيفاً جداً مع عائلتك وقت السحور، حتى لو الكل نعسان. بدون تذمر!',
    isQuietStar: false
  },
  {
    id: 'mission-18',
    day: 18,
    category: 'spiritual',
    title: 'المسامحة',
    description: 'فكر في شخص أنت زعلان منه. في قلبك، حاول أن تسامحه. لا تحتاج أن تخبره.',
    isQuietStar: true  // نجمة هادئة - خاصة
  },
  {
    id: 'mission-19',
    day: 19,
    category: 'social',
    title: 'بطاقة للمريض',
    description: 'ارسم أو اصنع بطاقة لشخص مريض - قريب، جار، أو صديق.',
    isQuietStar: false
  },
  {
    id: 'mission-20',
    day: 20,
    category: 'home',
    title: 'ترتيب مفاجئ',
    description: 'رتّب مكاناً ليس لك - ربما مكان أخيك أو غرفة مشتركة. لا تُعلن عنه، فقط افعله.',
    isQuietStar: false
  },

  // اليوم ٢١-٢٥: العشر الأواخر (تركيز روحي أكثر)
  {
    id: 'mission-21',
    day: 21,
    category: 'spiritual',
    title: 'صلاة الليل',
    description: 'إذا استطعت، اسهر قليلاً وصلِّ صلاة إضافية قصيرة. حتى دقيقتين تُحتسب.',
    isQuietStar: false
  },
  {
    id: 'mission-22',
    day: 22,
    category: 'charity',
    title: 'تحضير هدية العيد',
    description: 'ابدأ التفكير في العيد. اصنع أو حضّر هدية صغيرة لشخص ما. لا يجب أن تكلف شيئاً.',
    isQuietStar: false
  },
  {
    id: 'mission-23',
    day: 23,
    category: 'home',
    title: 'مساعد الوالدين',
    description: 'اسأل أحد والديك: "هل هناك شيء أستطيع مساعدتك فيه اليوم؟" ثم افعله حقاً!',
    isQuietStar: false
  },
  {
    id: 'mission-24',
    day: 24,
    category: 'spiritual',
    title: 'عمل خير سري',
    description: 'افعل شيئاً طيباً لا يراه أحد. فقط أنت والله تعلمان.',
    isQuietStar: true  // نجمة هادئة - خاصة
  },
  {
    id: 'mission-25',
    day: 25,
    category: 'social',
    title: 'شكر المعلم',
    description: 'اشكر معلماً، إماماً، أو أي شخص كبير علّمك شيئاً. أخبره ماذا تعلمت منه.',
    isQuietStar: false
  },

  // اليوم ٢٦-٣٠: الدفعة الأخيرة، التحضير للعيد
  {
    id: 'mission-26',
    day: 26,
    category: 'charity',
    title: 'عُدّ نِعَمك',
    description: 'اكتب قائمة بـ ١٠ أشياء عندك وبعض الأطفال ليست عندهم. اشعر بالامتنان، ثم افعل شيئاً للآخرين.',
    isQuietStar: false
  },
  {
    id: 'mission-27',
    day: 27,
    category: 'spiritual',
    title: 'دعاء الليلة الخاصة',
    description: 'الليلة قد تكون ليلة القدر! ادعُ دعاءً خاصاً للعالم كله - للسلام، للجائعين، للخائفين.',
    isQuietStar: true  // نجمة هادئة - خاصة
  },
  {
    id: 'mission-28',
    day: 28,
    category: 'home',
    title: 'مساعدة تحضيرات العيد',
    description: 'ساعد عائلتك في الاستعداد للعيد. التنظيف، التزيين، الطبخ - أي شيء يحتاجونه.',
    isQuietStar: false
  },
  {
    id: 'mission-29',
    day: 29,
    category: 'social',
    title: 'رسائل العيد',
    description: 'أرسل رسائل "عيد مبارك" للعائلة والأصدقاء. اجعل كل رسالة شخصية، ليست منسوخة.',
    isQuietStar: false
  },
  {
    id: 'mission-30',
    day: 30,
    category: 'charity',
    title: 'الهدية الأخيرة',
    description: 'رمضان ينتهي! تبرع بشيء يعني لك شيئاً. أفضل الصدقة عندما تعطي شيئاً تحبه فعلاً.',
    isQuietStar: true  // نجمة هادئة - خاصة
  }
];

export function getMissionForDay(day: number): KindnessMission | undefined {
  return kindnessMissions.find(mission => mission.day === day);
}

export function getMissionsByCategory(category: string): KindnessMission[] {
  return kindnessMissions.filter(mission => mission.category === category);
}

export function getQuietStarMissions(): KindnessMission[] {
  return kindnessMissions.filter(mission => mission.isQuietStar);
}
