import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Holiday Packages - Special Offers at Phegon Hotel",
  description: "Discover our exclusive holiday packages and special offers at Phegon Hotel. Book all-inclusive packages with fixed dates and special prices. Perfect for holidays, celebrations, and special occasions.",
  keywords: "holiday packages, special offers, hotel deals, vacation packages, all-inclusive packages, hotel promotions",
  openGraph: {
    title: "Holiday Packages & Special Offers at Phegon Hotel",
    description: "Discover exclusive holiday packages with special prices. Book all-inclusive deals for your perfect stay.",
    type: "website",
  },
  alternates: {
    canonical: "/packages",
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
