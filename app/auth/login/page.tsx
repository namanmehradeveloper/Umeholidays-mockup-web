import type { Metadata } from 'next';
import { CalendarCheck, Heart, MessageSquareText } from 'lucide-react';

import AuthForm from '../../../components/auth/AuthForm';
import AuthLayout from '../../../components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Sign in',
};

const perks = [
  { label: 'Track your bookings', icon: CalendarCheck },
  { label: 'Save journeys to your wishlist', icon: Heart },
  { label: 'Follow up on trip enquiries', icon: MessageSquareText },
];

export default function Page() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to manage your bookings, wishlist and enquiries."
      image="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
      imageAlt="Amer Fort, Jaipur"
      panelTitle="Your Rajasthan journeys, all in one place."
      perks={perks}
    >
      <AuthForm mode="login" className="w-full" />
    </AuthLayout>
  );
}
