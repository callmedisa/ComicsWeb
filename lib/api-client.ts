"use client";

import { ArtStyle, Character, CharacterType, Comic, ComicLength } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function createComic(input: {
  topic: string;
  style: ArtStyle;
  length: ComicLength;
  characterIds?: string[];
}): Promise<Comic> {
  const res = await fetch(`${API_URL}/comics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to create comic: ${res.status}`);
  }
  return res.json();
}

export async function fetchComic(id: string): Promise<Comic> {
  const res = await fetch(`${API_URL}/comics/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch comic ${id}: ${res.status}`);
  return res.json();
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");

  const res = await fetch(`${API_URL}/speech/transcribe`, {
    method: "POST",
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
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.warn("Failed to record speech attempt", err);
  }
}
