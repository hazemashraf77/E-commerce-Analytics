import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("Bootstrap");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <p className="text-6xl font-bold text-neutral-300">404</p>
      <p className="text-neutral-600">{t("title")}</p>
    </div>
  );
}
