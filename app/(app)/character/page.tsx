import { TopBar } from "@/components/layout/TopBar";
import { CharacterFlow } from "@/components/character/CharacterFlow";
import { getMe } from "@/lib/api";

export default async function CharacterPage() {
  const user = await getMe();

  return (
    <div>
      <TopBar user={user} title="Create a character" />
      <CharacterFlow />
    </div>
  );
}
