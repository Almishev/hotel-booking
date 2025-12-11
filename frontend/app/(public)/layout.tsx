import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Phegon Hotel - Book Your Perfect Stay",
  description: "Experience luxury and comfort at Phegon Hotel. Book your perfect room with our easy online booking system.",
  openGraph: {
    type: "website",
    siteName: "Phegon Hotel",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

