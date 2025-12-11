import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Find Your Booking",
  description: "Find your booking at Phegon Hotel using your confirmation code. Check your reservation details and status.",
};

export default function FindBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

