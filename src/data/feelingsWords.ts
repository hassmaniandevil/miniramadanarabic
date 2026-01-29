// مفردات المشاعر للتحقق اليومي
// اختيار متنوع - كل يوم يعرض ٦-٨ كلمات

export interface FeelingWord {
  word: string;
  emoji: string;
  category: 'physical' | 'emotional' | 'spiritual';
}

export const allFeelingWords: FeelingWord[] = [
  // جسدية
  { word: 'متعب', emoji: '😴', category: 'physical' },
  { word: 'جائع', emoji: '🍽️', category: 'physical' },
  { word: 'قوي', emoji: '💪', category: 'physical' },
  { word: 'نشيط', emoji: '⚡', category: 'physical' },
  { word: 'نعسان', emoji: '🥱', category: 'physical' },
  { word: 'عطشان', emoji: '💧', category: 'physical' },
  { word: 'مرتاح', emoji: '😌', category: 'physical' },

  // عاطفية
  { word: 'فخور', emoji: '🌟', category: 'emotional' },
  { word: 'سعيد', emoji: '😊', category: 'emotional' },
  { word: 'هادئ', emoji: '🧘', category: 'emotional' },
  { word: 'متقلب', emoji: '🌊', category: 'emotional' },
  { word: 'شجاع', emoji: '🦁', category: 'emotional' },
  { word: 'متحمس', emoji: '🎉', category: 'emotional' },
  { word: 'قلق', emoji: '😰', category: 'emotional' },
  { word: 'راضٍ', emoji: '☺️', category: 'emotional' },
  { word: 'مُصمّم', emoji: '🎯', category: 'emotional' },
  { word: 'محبوب', emoji: '💕', category: 'emotional' },
  { word: 'مُعتنى به', emoji: '🤗', category: 'emotional' },

  // روحانية
  { word: 'ممتن', emoji: '🙏', category: 'spiritual' },
  { word: 'مطمئن', emoji: '☮️', category: 'spiritual' },
  { word: 'متفائل', emoji: '🌈', category: 'spiritual' },
  { word: 'صبور', emoji: '🐢', category: 'spiritual' },
  { word: 'متصل بالله', emoji: '🔗', category: 'spiritual' },
  { word: 'مُبارك', emoji: '✨', category: 'spiritual' },
  { word: 'شاكر', emoji: '💝', category: 'spiritual' },
  { word: 'متأمل', emoji: '🪞', category: 'spiritual' },
];

// الحصول على كلمات ليوم معين (تدور عبر التركيبات)
export function getWordsForDay(day: number): FeelingWord[] {
  const wordsPerDay = 8;
  const words: FeelingWord[] = [];

  // دائماً نُضمّن مزيجاً من كل فئة
  const physical = allFeelingWords.filter(w => w.category === 'physical');
  const emotional = allFeelingWords.filter(w => w.category === 'emotional');
  const spiritual = allFeelingWords.filter(w => w.category === 'spiritual');

  // اختر ٢-٣ من كل فئة بناءً على اليوم
  const physicalCount = 2 + (day % 2);
  const emotionalCount = 3;
  const spiritualCount = wordsPerDay - physicalCount - emotionalCount;

  const physicalStart = (day - 1) % physical.length;
  const emotionalStart = (day - 1) % emotional.length;
  const spiritualStart = (day - 1) % spiritual.length;

  for (let i = 0; i < physicalCount; i++) {
    words.push(physical[(physicalStart + i) % physical.length]);
  }
  for (let i = 0; i < emotionalCount; i++) {
    words.push(emotional[(emotionalStart + i) % emotional.length]);
  }
  for (let i = 0; i < spiritualCount; i++) {
    words.push(spiritual[(spiritualStart + i) % spiritual.length]);
  }

  return words;
}
