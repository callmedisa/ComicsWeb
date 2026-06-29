import Link from "next/link";
import { notFound } from "next/navigation";
import { MangaPageView } from "@/components/reading/MangaPageView";
import { getComic } from "@/lib/api";
import { Comic } from "@/lib/types";

async function loadComic(id: string): Promise<Comic | null> {
  try {
    return await getComic(id);
  } catch {
    return null;
  }
}

export default async function ComicMangaViewPage({ params }: { params: { comicId: string } }) {
  const comic = await loadComic(params.comicId);
  if (!comic || comic.panels.length === 0) notFound();

  return (
    <div className="min-h-screen bg-ink px-6 py-10">
      <div className="mx-auto mb-6 flex max-w-xl items-center justify-between">
        <Link href={`/read/${comic.id}`} className="text-sm font-bold text-white hover:text-primary">
          ← Back to practice
        </Link>
        <span className="label-caps text-[#7FB8B1]">{comic.genre}</span>
      </div>
      <h1 className="mx-auto mb-6 max-w-xl text-center font-display text-2xl font-extrabold text-white">
        {comic.title}
      </h1>
      <MangaPageView comic={comic} />
    </div>
  );
}
