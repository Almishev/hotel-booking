import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rooms - Browse All Available Rooms",
  description: "Browse all available rooms at Phegon Hotel. Find the perfect accommodation for your stay. Filter by room type and check availability.",
  openGraph: {
    title: "Browse All Available Rooms at Phegon Hotel",
    description: "Find the perfect room for your stay. Filter by room type and check availability.",
  },
};

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

