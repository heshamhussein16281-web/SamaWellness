"use client";
import { useEffect } from "react";

/**
 * Sets <html lang="ar" dir="rtl"> on mount for Arabic pages (SEO & accessibility).
 * Reverts both attributes to their English defaults on unmount so non-Arabic
 * pages are unaffected when navigating between routes.
 */
export default function HtmlLangAr() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", "ar");
    html.setAttribute("dir", "rtl");
    return () => {
      html.setAttribute("lang", "en");
      html.setAttribute("dir", "ltr");
    };
  }, []);
  return null;
}
