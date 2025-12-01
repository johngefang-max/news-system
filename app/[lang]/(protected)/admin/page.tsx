import { redirect } from 'next/navigation';

export default function AdminIndex({ params: { lang } }: { params: { lang: string } }) {
  redirect(`/${lang}/admin/dashboard`);
}
