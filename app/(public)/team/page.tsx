import type { Metadata } from "next";
import Team from "@/components/Team";

export const metadata: Metadata = {
  title: "The Team | Sama Wellness Therapy",
  description: "Meet the therapists guiding your journey to healing.",
};

export default function TeamPage() {
  return <Team />;
}
