import { redirect } from 'next/navigation';

/** Legacy compatibility route. Company settings is the canonical admin settings page. */
export default function SettingsPage() {
  redirect('/admin/settings/company');
}
