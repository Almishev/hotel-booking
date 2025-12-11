import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home - Welcome to Phegon Hotel",
  description: "Welcome to Phegon Hotel! Experience luxury and comfort. Book your perfect room with our easy online booking system. Enjoy premium amenities including AC, WiFi, parking, and mini bar.",
  openGraph: {
    title: "Welcome to Phegon Hotel",
    description: "Experience luxury and comfort at Phegon Hotel. Book your perfect room with our easy online booking system.",
    images: ["/assets/images/hotel.webp"],
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

