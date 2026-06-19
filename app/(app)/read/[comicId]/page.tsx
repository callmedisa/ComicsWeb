import { notFound } from "next/navigation";
import { ReadingFlow } from "@/components/reading/ReadingFlow";
import { getComic } from "@/lib/api";
import { Comic } from "@/lib/types";

async function loadComic(id: string): Promise<Comic | null> {
  try {
    return await getComic(id);
  } catch {
    return null;
  }
}

export default async function ReadPage({ params }: { params: { comicId: string } }) {
  const comic = await loadComic(params.comicId);
  if (!comic || comic.panels.length === 0) notFound();

  return <ReadingFlow comic={comic} />;
}
