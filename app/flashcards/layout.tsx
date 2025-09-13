import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards | StudyAI",
  description: "Transform your notes into AI-powered flashcards for effective studying",
};

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}