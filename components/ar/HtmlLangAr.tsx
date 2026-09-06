"use client";
import { useEffect } from "react";

/**
 * Sets <html lang="ar"> on mount for Arabic pages (SEO & accessibility).
 * dir="rtl" is intentionally NOT set on <html> — the wrapper <div dir="rtl">
 * in the Arabic layout already handles visual RTL. Setting dir on <html>
 * breaks components (e.g. Hero image) that weren't designed for document-level RTL.
 * Reverts to lang="en" on unmount so English pages are unaffected.
 */
export default function HtmlLangAr() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", "ar");
    return () => {
      html.setAttribute("lang", "en");
    };
  }, []);
  return null;
}
