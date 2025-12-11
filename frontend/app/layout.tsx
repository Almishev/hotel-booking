import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import I18nProvider from "@/components/providers/I18nProvider";
import StructuredData from "@/components/common/StructuredData";

export const metadata: Metadata = {
  title: {
    default: "Phegon Hotel - Book Your Perfect Stay",
    template: "%s | Phegon Hotel"
  },
  description: "Experience luxury and comfort at Phegon Hotel. Book your perfect room with our easy online booking system. Enjoy premium amenities including AC, WiFi, parking, and mini bar.",
  keywords: ["hotel", "booking", "accommodation", "luxury hotel", "Phegon Hotel", "room reservation", "hotel booking system"],
  authors: [{ name: "Phegon Hotel" }],
  creator: "Phegon Hotel",
  publisher: "Phegon Hotel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'bg': '/bg',
      'el': '/el',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Phegon Hotel",
    title: "Phegon Hotel - Book Your Perfect Stay",
    description: "Experience luxury and comfort at Phegon Hotel. Book your perfect room with our easy online booking system.",
    images: [
      {
        url: "/assets/images/hotel.webp",
        width: 1200,
        height: 630,
        alt: "Phegon Hotel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phegon Hotel - Book Your Perfect Stay",
    description: "Experience luxury and comfort at Phegon Hotel. Book your perfect room with our easy online booking system.",
    images: ["/assets/images/hotel.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StructuredData />
        <I18nProvider>
          <Navbar />
          <div className="content">
            {children}
          </div>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
