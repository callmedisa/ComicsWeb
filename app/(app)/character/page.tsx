import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { CharacterFlow } from "@/components/character/CharacterFlow";
import { getMe } from "@/lib/api";

export default async function CharacterPage() {
  const user = (await getMe())!;

  return (
    <div>
      <TopBar user={user} title="Create a character" />
      <p className="mb-7 -mt-3 max-w-2xl text-sm text-muted-2">
        Characters you save here show up as picks on the{" "}
        <Link href="/create" className="font-bold text-primary underline">
          Create a comic
        </Link>{" "}
        screen — select one (or more) and the story will star them by name, with
        matching art across every panel.
      </p>
      <CharacterFlow />
    </div>
  );
}
