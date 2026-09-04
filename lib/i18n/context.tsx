"use client";
import { createContext, useContext } from "react";

export type Locale = "en" | "ar";

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <I18nContext.Provider value={{ locale, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { locale: "en" as Locale, dir: "ltr" as const };
  }
  return ctx;
}
