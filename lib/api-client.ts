"use client";

import { ArtStyle, Character, CharacterType, Comic, ComicLength, Panel } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function register(name: string, password: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to register: ${res.status}`);
  }
  return res.json();
}

export async function login(name: string, password: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to log in: ${res.status}`);
  }
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function createComic(input: {
  topic: string;
  style: ArtStyle;
  length: ComicLength;
  characterIds?: string[];
}): Promise<Comic> {
  const res = await fetch(`${API_URL}/comics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to create comic: ${res.status}`);
  }
  return res.json();
}

export async function fetchComic(id: string): Promise<Comic> {
  const res = await fetch(`${API_URL}/comics/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch comic ${id}: ${res.status}`);
  return res.json();
}

export async function regeneratePanelImage(comicId: string, panelId: string): Promise<Panel> {
  const res = await fetch(`${API_URL}/comics/${comicId}/panels/${panelId}/regenerate-image`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to regenerate image: ${res.status}`);
  }
  return res.json();
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");

  const res = await fetch(`${API_URL}/speech/transcribe`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
  const body = await res.json();
  return body.transcript ?? "";
}

export async function previewCharacter(input: {
  type: CharacterType;
  name: string;
  traits: string[];
  color: string;
}): Promise<{ imageUrl: string | null }> {
  const res = await fetch(`${API_URL}/characters/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to generate preview: ${res.status}`);
  }
  return res.json();
}

export async function saveCharacter(input: {
  type: CharacterType;
  name: string;
  traits: string[];
  color: string;
  imageUrl?: string | null;
}): Promise<Character> {
  const res = await fetch(`${API_URL}/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to save character: ${res.status}`);
  }
  return res.json();
}

export async function recordAttempt(input: {
  lineId: string;
  transcript: string;
  score: number;
}): Promise<void> {
  try {
    await fetch(`${API_URL}/speech/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.warn("Failed to record speech attempt", err);
  }
}
