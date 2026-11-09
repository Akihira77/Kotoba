import type { ExamPaper, ExamResult } from "@/lib/exam-engine";

const ACTIVE_KEY = "kotoba.exam.active.v1";
const RESULT_KEY = "kotoba.exam.result.v1";

export interface ActiveExam {
  paper: ExamPaper;
  startedAt: string;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Penyimpanan sesi penuh atau diblokir; alur tetap berjalan tanpa pemulihan. */
  }
}

export function readActiveExam(): ActiveExam | null {
  const value = readJson<ActiveExam>(ACTIVE_KEY);
  if (!value?.paper?.sections?.length || !value.startedAt) return null;
  return value;
}

export function saveActiveExam(value: ActiveExam): void {
  writeJson(ACTIVE_KEY, value);
}

export function clearActiveExam(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* abaikan */
  }
}

export function readExamResult(): ExamResult | null {
  const value = readJson<ExamResult>(RESULT_KEY);
  if (!value?.paper?.sections?.length || !value.answers) return null;
  return value;
}

export function saveExamResult(value: ExamResult): void {
  writeJson(RESULT_KEY, value);
}

export function clearExamResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(RESULT_KEY);
  } catch {
    /* abaikan */
  }
}
