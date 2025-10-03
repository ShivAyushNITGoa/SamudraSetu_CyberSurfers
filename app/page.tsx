import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to website home page for all users
  // Authentication and role-based routing will be handled by the website pages
  redirect('/website');
}