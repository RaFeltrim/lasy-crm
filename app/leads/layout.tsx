import { AppLayout } from "@/components/AppLayout"

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
