import { redirect } from "next/navigation";

/**
 * Root locale page — redirects to Executive Dashboard for preview.
 */
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard`);
}
