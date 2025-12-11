import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login - Access Your Account",
  description: "Login to your Phegon Hotel account to manage your bookings and profile.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

