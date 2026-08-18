import type { Metadata } from "next";
import RoomsEnvironment from "@/components/RoomsEnvironment";

export const metadata: Metadata = {
  title: "Our Therapy Spaces | Sama Wellness Therapy",
  description: "Thoughtfully designed environments for healing.",
};

export default function RoomsPage() {
  return <RoomsEnvironment />;
}
