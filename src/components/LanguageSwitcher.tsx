"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <button
        onClick={() => switchLocale("de")}
        className={`px-2 py-1 text-sm ${
          locale === "de"
            ? "font-bold text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        DE
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={() => switchLocale("en")}
        className={`px-2 py-1 text-sm ${
          locale === "en"
            ? "font-bold text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
