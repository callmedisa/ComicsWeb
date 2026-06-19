import { Character, Comic, UserProfile } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export function getMe() {
  return apiFetch<UserProfile>("/me");
}

export function getComics() {
  return apiFetch<Comic[]>("/comics");
}

export function getComic(id: string) {
  return apiFetch<Comic>(`/comics/${id}`);
}

export function getCharacters() {
  return apiFetch<Character[]>("/characters");
}
