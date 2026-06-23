import { TopBar } from "@/components/layout/TopBar";
import { CreateFlow } from "@/components/create/CreateFlow";
import { getMe, getCharacters } from "@/lib/api";

export default async function CreatePage() {
  const [user, characters] = await Promise.all([getMe(), getCharacters()]);
  if (!user) return null;

  return (
    <div>
      <TopBar user={user} title="Create a comic" />
      <CreateFlow characters={characters} />
    </div>
  );
}
