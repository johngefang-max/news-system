import { redirect } from 'next/navigation';

export default function AdminManageUsers({ params: { lang } }: { params: { lang: string } }) {
  redirect(`/${lang}/admin/users`);
}
