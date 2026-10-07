import type { Metadata } from 'next';
import { CalendarCheck, Heart, MessageSquareText } from 'lucide-react';

import AuthForm from '../../../components/auth/AuthForm';
import AuthLayout from '../../../components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Create account',
};

const perks = [
  { label: 'Book journeys and track them in one place', icon: CalendarCheck },
  { label: 'Save favourite journeys to your wishlist', icon: Heart },
  { label: 'Follow up on trip enquiries with our team', icon: MessageSquareText },
];

export default function Page() {
  return (
    <AuthLayout
      title="Create your account"
      description="Join UME Holidays to plan, book and manage your Rajasthan trips."
      image="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
      imageAlt="Hawa Mahal, Jaipur"
      panelTitle="Start planning your Rajasthan story."
      perks={perks}
    >
      <AuthForm mode="register" className="w-full" />
    </AuthLayout>
  );
}
