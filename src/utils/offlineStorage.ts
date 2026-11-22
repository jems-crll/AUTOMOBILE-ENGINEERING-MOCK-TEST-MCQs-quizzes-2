import { QuizAttempt, User } from "../types";

const USER_STORAGE_KEY = "omto_current_user";
const ATTEMPTS_CACHE_PREFIX = "omto_cached_attempts_";
const SYNC_QUEUE_PREFIX = "omto_pending_sync_";

export type PendingSyncInput =
  | { type: "save_attempt"; attempt: QuizAttempt }
  | { type: "clear_history" };

export type PendingSyncAction =
  | { id: string; type: "save_attempt"; attempt: QuizAttempt; createdAt: number }
  | { id: string; type: "clear_history"; createdAt: number };

const safeJsonParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeSetItem = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch (err) {
    console.warn(`[OfflineStorage] Failed to write ${key}:`, err);
  }
};

export const getStoredUser = (): User | null => {
  try {
    const sessionRaw = sessionStorage.getItem(USER_STORAGE_KEY);
    const localRaw = localStorage.getItem(USER_STORAGE_KEY);
    const parsed = safeJsonParse<User | null>(sessionRaw || localRaw, null);
    if (!parsed || !parsed.email) return null;

    if (!parsed.role) {
      parsed.role = parsed.email.toLowerCase().includes("admin") ? "admin" : "student";
    }

    // Keep both storages synchronized for instant offline resume
    const serialized = JSON.stringify(parsed);
    safeSetItem(sessionStorage, USER_STORAGE_KEY, serialized);
    safeSetItem(localStorage, USER_STORAGE_KEY, serialized);
    return parsed;
  } catch {
    return null;
  }
};

export const saveStoredUser = (user: User | null) => {
  if (!user) {
    clearStoredUser();
    return;
  }
  const normalized: User = {
    ...user,
    role: user.role || (user.email.toLowerCase().includes("admin") ? "admin" : "student"),
  };
  const serialized = JSON.stringify(normalized);
  safeSetItem(sessionStorage, USER_STORAGE_KEY, serialized);
  safeSetItem(localStorage, USER_STORAGE_KEY, serialized);
};

export const clearStoredUser = () => {
  try {
    sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch (_) {}
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (_) {}
};

const attemptsKey = (email: string) => `${ATTEMPTS_CACHE_PREFIX}${email.toLowerCase().trim()}`;
const syncQueueKey = (email: string) => `${SYNC_QUEUE_PREFIX}${email.toLowerCase().trim()}`;

export const getCachedAttempts = (email: string): QuizAttempt[] => {
  if (!email) return [];
  try {
    const parsed = safeJsonParse<QuizAttempt[]>(localStorage.getItem(attemptsKey(email)), []);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const setCachedAttempts = (email: string, attempts: QuizAttempt[]) => {
  if (!email) return;
  try {
    // Keep up to last 200 attempts in local cache to prevent quota bloat
    const trimmed = Array.isArray(attempts) ? attempts.slice(-200) : [];
    safeSetItem(localStorage, attemptsKey(email), JSON.stringify(trimmed));
  } catch (_) {}
};

export const getPendingSyncQueue = (email: string): PendingSyncAction[] => {
  if (!email) return [];
  try {
    const parsed = safeJsonParse<PendingSyncAction[]>(localStorage.getItem(syncQueueKey(email)), []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setPendingSyncQueue = (email: string, queue: PendingSyncAction[]) => {
  if (!email) return;
  try {
    if (queue.length === 0) {
      localStorage.removeItem(syncQueueKey(email));
    } else {
      safeSetItem(localStorage, syncQueueKey(email), JSON.stringify(queue));
    }
  } catch (_) {}
};

export const enqueueSyncAction = (email: string, action: PendingSyncInput) => {
  if (!email) return;
  const current = getPendingSyncQueue(email);
  const newItem: PendingSyncAction = {
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };

  // If clearing history, drop older pending actions before it
  const next = action.type === "clear_history" ? [newItem] : [...current, newItem];
  setPendingSyncQueue(email, next);
};

export const mergeServerAndLocalAttempts = (
  serverAttempts: QuizAttempt[],
  cachedAttempts: QuizAttempt[],
  pendingQueue: PendingSyncAction[]
): QuizAttempt[] => {
  const hasClearPending = pendingQueue.some((item) => item.type === "clear_history");
  const pendingSaves = pendingQueue
    .filter((item): item is Extract<PendingSyncAction, { type: "save_attempt" }> => item.type === "save_attempt")
    .map((item) => item.attempt);

  const base = hasClearPending ? [] : serverAttempts.length > 0 ? serverAttempts : cachedAttempts;
  const map = new Map<string, QuizAttempt>();

  for (const a of base) {
    if (a && a.id) map.set(a.id, a);
  }
  for (const a of pendingSaves) {
    if (a && a.id) map.set(a.id, a);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const flushPendingSync = async (email: string): Promise<number> => {
  if (!email || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return getPendingSyncQueue(email).length;
  }

  const queue = getPendingSyncQueue(email);
  if (queue.length === 0) return 0;

  const remaining: PendingSyncAction[] = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      if (item.type === "clear_history") {
        const res = await fetch("/api/users/attempts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else if (item.type === "save_attempt") {
        const res = await fetch("/api/users/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, attempt: item.attempt }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      // Stop processing further ordered mutations and keep remaining items
      remaining.push(...queue.slice(i));
      break;
    }
  }

  setPendingSyncQueue(email, remaining);
  return remaining.length;
};
