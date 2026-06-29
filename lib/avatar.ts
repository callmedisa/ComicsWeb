const EMOJIS = ["🦊", "🐱", "🐼", "🦁", "🐸", "🐵", "🦉", "🐯"];
const BACKGROUNDS = ["#FFE6D5", "#E2F5F0", "#E5F1FF", "#FCE7F3", "#FFF1DF", "#EDE6FF"];

function hashCode(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function avatarFor(id: string): { emoji: string; bg: string } {
  const hash = hashCode(id);
  return {
    emoji: EMOJIS[hash % EMOJIS.length],
    bg: BACKGROUNDS[hash % BACKGROUNDS.length],
  };
}
