"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api-client";
import {
  emptySnapshot,
  readCachedSnapshot,
  writeCachedSnapshot,
} from "@/lib/progress-defaults";
import { applyTheme, preferredTheme } from "@/lib/theme";
import { downloadJson } from "@/lib/utils";
import type {
  AddCardPayload,
  CultureFavoritePayload,
  ExamPayload,
  GameAttemptPayload,
  LessonPayload,
  ProgressSnapshot,
  QuizAttemptPayload,
  ReviewPayload,
  SavedCollectionPayload,
  SavedItemPayload,
  SessionPayload,
  Settings,
  StoryPayload,
  WritingPayload,
} from "@/lib/types";
import { useToast } from "./toast-provider";

interface ProgressApi {
  snapshot: ProgressSnapshot;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  recordSession: (payload: SessionPayload) => Promise<void>;
  recordReview: (payload: ReviewPayload) => Promise<void>;
  addCard: (payload: AddCardPayload) => Promise<void>;
  recordKana: (payload: { char: string; script: "hiragana" | "katakana"; correct: boolean }) => Promise<void>;
  recordLesson: (payload: LessonPayload) => Promise<void>;
  recordExam: (payload: ExamPayload) => Promise<void>;
  recordQuiz: (payload: QuizAttemptPayload) => Promise<void>;
  recordGame: (payload: GameAttemptPayload) => Promise<void>;
  recordWriting: (payload: WritingPayload) => Promise<void>;
  recordStory: (payload: StoryPayload) => Promise<void>;
  toggleCultureFavorite: (articleId: string, favorite: boolean) => Promise<void>;
  saveItem: (payload: SavedItemPayload) => Promise<void>;
  saveCollection: (payload: SavedCollectionPayload) => Promise<void>;
  saveSettings: (next: Partial<Settings>) => Promise<void>;
  rename: (name: string) => Promise<void>;
  reset: () => Promise<void>;
  importSnapshot: (data: unknown) => Promise<void>;
  exportSnapshot: () => Promise<void>;
}

const ProgressContext = createContext<ProgressApi | null>(null);

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.";
}

export function useProgress(): ProgressApi {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress harus dipakai di dalam ProgressProvider");
  return context;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  // Always start from the SSR-safe empty snapshot. The cached snapshot is
  // applied after mount to avoid a server/client hydration mismatch.
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(() => emptySnapshot());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  const applySnapshot = useCallback((next: ProgressSnapshot) => {
    setSnapshot(next);
    writeCachedSnapshot(next);
    applyTheme(preferredTheme(next.profile.settings.theme));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await api.getProgress();
      applySnapshot(next);
      setError(null);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setLoading(false);
      hydrated.current = true;
    }
  }, [applySnapshot]);

  useEffect(() => {
    // Apply the local cache and fetch after mount, not during the effect's
    // synchronous phase. Reading localStorage during render breaks hydration.
    const timer = window.setTimeout(() => {
      const cached = readCachedSnapshot();
      if (cached) setSnapshot(cached);
      void refresh();
    }, 0);
    const onOnline = () => void refresh();
    window.addEventListener("online", onOnline);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [refresh]);

  useEffect(() => {
    const theme = preferredTheme(snapshot.profile.settings.theme);
    applyTheme(theme);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [snapshot.profile.settings.theme]);

  const mutate = useCallback(
    async (promise: Promise<ProgressSnapshot>, options: { silent?: boolean } = {}) => {
      setSyncing(true);
      try {
        const next = await promise;
        applySnapshot(next);
        setError(null);
      } catch (cause) {
        const message = messageOf(cause);
        setError(message);
        if (!options.silent) toast.error(message);
        throw cause;
      } finally {
        setSyncing(false);
      }
    },
    [applySnapshot, toast],
  );

  const recordSession = useCallback(async (payload: SessionPayload) => {
    await mutate(api.recordSession(payload), { silent: true });
  }, [mutate]);

  const recordReview = useCallback(async (payload: ReviewPayload) => {
    await mutate(api.recordReview(payload), { silent: true });
  }, [mutate]);

  const addCard = useCallback(async (payload: AddCardPayload) => {
    await mutate(api.addCard(payload), { silent: true });
  }, [mutate]);

  const recordKana = useCallback(async (payload: { char: string; script: "hiragana" | "katakana"; correct: boolean }) => {
    await mutate(api.recordKana(payload), { silent: true });
  }, [mutate]);

  const recordLesson = useCallback(async (payload: LessonPayload) => {
    await mutate(api.recordLesson(payload), { silent: true });
  }, [mutate]);

  const recordExam = useCallback(async (payload: ExamPayload) => {
    await mutate(api.recordExam(payload), { silent: true });
  }, [mutate]);

  const recordQuiz = useCallback(async (payload: QuizAttemptPayload) => {
    await mutate(api.recordQuiz(payload), { silent: true });
  }, [mutate]);

  const recordGame = useCallback(async (payload: GameAttemptPayload) => {
    await mutate(api.recordGame(payload), { silent: true });
  }, [mutate]);

  const recordWriting = useCallback(async (payload: WritingPayload) => {
    await mutate(api.recordWriting(payload), { silent: true });
  }, [mutate]);

  const recordStory = useCallback(async (payload: StoryPayload) => {
    await mutate(api.recordStory(payload), { silent: true });
  }, [mutate]);

  const toggleCultureFavorite = useCallback(async (articleId: string, favorite: boolean) => {
    const payload: CultureFavoritePayload = { articleId, favorite };
    await mutate(api.toggleCultureFavorite(payload));
    toast.success(favorite ? "Artikel disimpan ke favorit." : "Artikel dihapus dari favorit.");
  }, [mutate, toast]);

  const saveItem = useCallback(async (payload: SavedItemPayload) => {
    await mutate(api.saveItem(payload));
    if (payload.remove) toast.success("Materi dihapus dari kamus pribadi.");
    else if (payload.note === undefined) toast.success("Materi disimpan ke kamus pribadi.");
    else toast.success("Catatan pribadi diperbarui.");
  }, [mutate, toast]);

  const saveCollection = useCallback(async (payload: SavedCollectionPayload) => {
    await mutate(api.saveCollection(payload));
    if (payload.remove) toast.success("Koleksi dihapus.");
    else if (payload.id) toast.success("Koleksi diperbarui.");
    else toast.success("Koleksi baru dibuat.");
  }, [mutate, toast]);

  const saveSettings = useCallback(
    async (next: Partial<Settings>) => {
      const merged: Settings = { ...snapshot.profile.settings, ...next };
      const optimistic: ProgressSnapshot = {
        ...snapshot,
        profile: { ...snapshot.profile, settings: merged },
      };
      applySnapshot(optimistic);
      try {
        const saved = await api.updateSettings(merged);
        applySnapshot(saved);
        setError(null);
      } catch (cause) {
        setError(messageOf(cause));
        toast.info("Preferensi disimpan di perangkat ini saja karena server tidak terjangkau.");
      }
    },
    [applySnapshot, snapshot, toast],
  );

  const rename = useCallback(async (name: string) => {
    await mutate(api.renameProfile(name));
    toast.success("Nama profil diperbarui.");
  }, [mutate, toast]);

  const reset = useCallback(async () => {
    await mutate(api.resetProgress());
    toast.success("Progres belajar berhasil direset.");
  }, [mutate, toast]);

  const importSnapshot = useCallback(async (data: unknown) => {
    await mutate(api.importProgress(data));
    toast.success("Data progres berhasil diimpor.");
  }, [mutate, toast]);

  const exportSnapshot = useCallback(async () => {
    try {
      const full = await api.exportProgress();
      downloadJson(`kotoba-progress-${new Date().toISOString().slice(0, 10)}.json`, full);
      toast.success("Berkas progres diunduh.");
    } catch (cause) {
      toast.error(messageOf(cause));
    }
  }, [toast]);

  const value = useMemo<ProgressApi>(
    () => ({
      snapshot,
      loading,
      syncing,
      error,
      refresh,
      recordSession,
      recordReview,
      addCard,
      recordKana,
      recordLesson,
      recordExam,
      recordQuiz,
      recordGame,
      recordWriting,
      recordStory,
      toggleCultureFavorite,
      saveItem,
      saveCollection,
      saveSettings,
      rename,
      reset,
      importSnapshot,
      exportSnapshot,
    }),
    [
      snapshot, loading, syncing, error, refresh, recordSession, recordReview, addCard, recordKana,
      recordLesson, recordExam, recordQuiz, recordGame, recordWriting, recordStory, toggleCultureFavorite, saveItem, saveCollection, saveSettings, rename, reset, importSnapshot, exportSnapshot,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}