import type { Metadata } from "next";
import AskCounselorSama from "@/components/AskCounselorSama";

export const metadata: Metadata = {
  title: "Ask Counselor Sama | Sama Wellness Therapy",
  description: "Share a wellness question and get authentic guidance.",
};

export default function AskSamaPage() {
  return <AskCounselorSama />;
}
