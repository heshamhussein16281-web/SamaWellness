"use client";
import { useEffect } from "react";

/**
 * Sets <html lang="ar" dir="rtl"> on mount for Arabic pages.
 * Reverts to lang="en" (no dir) on unmount so English pages are unaffected.
 */
export default function HtmlLangAr() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", "ar");
    html.setAttribute("dir", "rtl");
    return () => {
      html.setAttribute("lang", "en");
      html.removeAttribute("dir");
    };
  }, []);
  return null;
}
