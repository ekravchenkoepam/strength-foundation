import Link from "next/link";
import { headers } from "next/headers";
import { Button, ButtonTypeEnum } from "@/app/components/shared";

function getLocaleFromUrl() {
  const headersList = headers();

  const pathname =
    headersList.get("x-pathname") ||
    headersList.get("next-url") ||
    "";

  const match = pathname.match(/^\/(uk|en)(\/|$)/);
  return match?.[1] ?? "uk";
}

export default function NotFound() {
  const locale = getLocaleFromUrl();

  return (
    <div className="h-[60vh] flex flex-col justify-center text-center">
      <div>
        <h2 className="text-[64px]">😕</h2>

        <h1 className="text-[7.5rem] font-medium mb-[24px]">404</h1>

        <div className="text-[24px] mb-[32px] mt-[24px]">
          Вибачте! Такої сторінки не знайдено
        </div>

        <Link href={`/${locale}`}>
          <Button
            label="Повернутись назад"
            type={ButtonTypeEnum.Secondary}
          />
        </Link>
      </div>
    </div>
  );
}
