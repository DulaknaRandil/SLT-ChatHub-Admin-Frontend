import FuturisticLayout from '@/components/FuturisticLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FuturisticLayout>{children}</FuturisticLayout>;
}
