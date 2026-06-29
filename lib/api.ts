import { cookies } from "next/headers";
import {
  AdminOverview,
  Character,
  Comic,
  CourseSummary,
  StudentDetail,
  StudentSummary,
  TeacherProfile,
  UserProfile,
} from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

function cookieHeader(): string {
  return cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader() },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export async function getMe(): Promise<UserProfile | null> {
  try {
    return await apiFetch<UserProfile>("/me");
  } catch {
    return null;
  }
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

export function getCourses() {
  return apiFetch<CourseSummary[]>("/courses");
}

export function getStudents() {
  return apiFetch<StudentSummary[]>("/admin/students");
}

export function getAdminOverview() {
  return apiFetch<AdminOverview>("/admin/overview");
}

export function getStudentDetail(id: string) {
  return apiFetch<StudentDetail>(`/admin/students/${id}`);
}

export function getTeachers() {
  return apiFetch<TeacherProfile[]>("/teachers");
}
