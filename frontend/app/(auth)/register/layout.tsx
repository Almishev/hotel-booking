import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Register - Create Your Account",
  description: "Create your Phegon Hotel account to start booking rooms and managing your reservations.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

