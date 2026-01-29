import type { Metadata, Viewport } from "next";
import { Tajawal, Changa } from "next/font/google";
import { SyncProvider } from "@/components/providers/SyncProvider";
import "./globals.css";

// Tajawal - A rounded, friendly Arabic font perfect for children
const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

// Changa - A playful Arabic font as backup
const changa = Changa({
  variable: "--font-arabic-alt",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ميني رمضان - اجعل رمضان سحرياً لعائلتك | تطبيق للأطفال من ٤-١٢ سنة",
  description: "التطبيق الوحيد المصمم للعائلات المسلمة لتجربة رمضان معاً. قصص إسلامية يومية، مهمات الإحسان، متتبع الصيام ومكافآت السماء المرصعة بالنجوم. انضم لآلاف العائلات التي تجعل رمضان لا يُنسى للأطفال من ٤-١٢ سنة.",
  keywords: [
    "رمضان للأطفال",
    "أنشطة رمضان للأطفال",
    "تطبيق إسلامي للأطفال",
    "أطفال مسلمين رمضان",
    "أنشطة رمضان العائلية",
    "كيف تعلم الأطفال عن رمضان",
    "العد التنازلي لرمضان للأطفال",
    "متتبع صيام الأطفال",
    "قصص رمضان للنوم إسلامية",
    "تطبيق العائلة المسلمة",
    "رمضان 2026",
    "التعليم الإسلامي للأطفال",
    "ألعاب رمضان للأطفال",
    "تحضيرات العيد للأطفال",
  ],
  authors: [{ name: "ميني رمضان" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ميني رمضان",
  },
  openGraph: {
    title: "ميني رمضان - اجعل رمضان سحرياً لعائلتك",
    description: "التطبيق الوحيد للعائلات المسلمة. قصص يومية، مهمات إحسان وسماء مرصعة بالنجوم تنمو مع كل عمل طيب. للأطفال من ٤-١٢ سنة. صنع بواسطة آباء مسلمين، للآباء المسلمين.",
    type: "website",
    locale: "ar_SA",
    siteName: "ميني رمضان",
  },
  twitter: {
    card: "summary_large_image",
    title: "ميني رمضان - اجعل رمضان سحرياً لعائلتك",
    description: "قصص إسلامية يومية، مهمات إحسان ومكافآت السماء المرصعة بالنجوم. تطبيق رمضان المصاحب للعائلات المسلمة مع أطفال من ٤-١٢ سنة.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className={`${tajawal.variable} ${changa.variable} font-arabic antialiased`}
      >
        <SyncProvider>
          {children}
        </SyncProvider>
      </body>
    </html>
  );
}
