import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { getMe, getComics } from "@/lib/api";

export default async function MyComicsPage() {
  const [user, comics] = await Promise.all([getMe(), getComics()]);
  if (!user) return null;
  if (user.role === "TEACHER") redirect("/admin");

  return (
    <div>
      <TopBar user={user} title="My comics" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {comics.map((comic) => (
          <Link
            key={comic.id}
            href={`/read/${comic.id}`}
            className="rounded-card border border-border bg-white p-4 shadow-card transition-transform hover:-translate-y-1"
          >
            {comic.panels[0]?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={comic.panels[0].imageUrl}
                alt={comic.title}
                className="h-28 w-full rounded-panel object-cover"
              />
            ) : (
              <div className="placeholder-art h-28 rounded-panel">
                {comic.title.toLowerCase()}
              </div>
            )}
            <div className="mt-3 font-display font-bold text-ink">
              {comic.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
