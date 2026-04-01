"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Board, Issue, User } from "../helpers/type";


// ---------------------------------------------------------------------------
// What the context exposes
// ---------------------------------------------------------------------------
export interface JiraMetaData {
  epics:   Issue[];
  users:      User[];
  // Sprint creation (changes more often — has its own refetch)
  boards:    Board[];
  // State
  loading:          boolean;
  boardsLoading:   boolean;
  error:            string | null;
  // Actions
  refetchAll:       () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Config passed into the Provider
// ---------------------------------------------------------------------------
export interface JiraDataConfig {
  /** Your workspace / cloud ID — passed to every API call */
  workspaceId: string;
  /** Optional: extra params forwarded to /api/meta (e.g. boardId) */
  extraParams?: Record<string, string>;
  /** Cache TTL in ms. Defaults: meta = 1hr, sprints = 5min */
  metaTtl?:    number;
  sprintsTtl?: number;
}

// ---------------------------------------------------------------------------
// Cache helpers (localStorage, gracefully degraded)
// ---------------------------------------------------------------------------
const CACHE_KEY_META    = (wsId: string) => `jira_meta_${wsId}`;

function readCache<T>(key: string, ttl: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as { data: T; ts: number };
    if (Date.now() - ts > ttl) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

function clearCache(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Build query string from config
// ---------------------------------------------------------------------------
function buildParams(config: JiraDataConfig): string {
  const params = new URLSearchParams({
    workspaceId: config.workspaceId,
    ...config.extraParams,
  });
  return params.toString();
}

// ---------------------------------------------------------------------------
// Empty / default state
// ---------------------------------------------------------------------------
const DEFAULT_DATA: Omit<JiraMetaData, "refetchBoards" | "refetchAll"> = {
  users:          [],
  boards:         [],
  epics:          [],
  boardsLoading:  false,
  loading:        true,
  error:          null,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const JiraDataContext = createContext<JiraMetaData>({
  ...DEFAULT_DATA,
  refetchAll:     async () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function JiraDataProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: JiraDataConfig;
}) {
  const {
    metaTtl    = 60 * 60 * 1000,       // 1 hour
    sprintsTtl = 5  * 60 * 1000,       // 5 minutes
  } = config;

  const [state, setState] = useState<
    Omit<JiraMetaData, "refetchBoards" | "refetchAll">
  >(DEFAULT_DATA);

  // Prevent duplicate in-flight requests
  const metaFetching    = useRef(false);

  // ── Fetch meta (projects, users, issueTypes, priorities, labels, statuses)
  const fetchMeta = useCallback(async (force = false) => {
    if (metaFetching.current) return;

    if (!force) {
      const cached = readCache<typeof DEFAULT_DATA>(
        CACHE_KEY_META(config.workspaceId),
        metaTtl,
      );
      if (cached) {
        setState(prev => ({ ...prev, ...cached, loading: false, error: null }));
        return;
      }
    }

    metaFetching.current = true;
    try {
      const res = await fetch(`/api/meta?${buildParams(config)}`);
      if (!res.ok) throw new Error(`Meta fetch failed: ${res.status}`);
      const data = await res.json() as {
        epics:   Issue[];
        users:      User[];
        boards:    Board[];
      };
      writeCache(CACHE_KEY_META(config.workspaceId), data);
      setState(prev => ({ ...prev, ...data, loading: false, error: null }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load Jira metadata";
      setState(prev => ({ ...prev, loading: false, error: message }));
    } finally {
      metaFetching.current = false;
    }
  }, [config, metaTtl]);


  const refetchAll = useCallback(async () => {
    clearCache(CACHE_KEY_META(config.workspaceId));
    await fetchMeta(true);
  }, [fetchMeta, config.workspaceId]);

  // ── Bootstrap on mount — parallel, non-blocking
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta ]);

  return (
    <JiraDataContext.Provider value={{ ...state, refetchAll }}>
      {children}
    </JiraDataContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useJiraData(): JiraMetaData {
  const ctx = useContext(JiraDataContext);
  if (!ctx) throw new Error("useJiraData must be used inside <JiraDataProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Convenience selector hooks (avoid re-renders from unrelated data changes)
// ---------------------------------------------------------------------------

export function useUsers()      { return useJiraData().users;       }
export function useBoards()     { return useJiraData().boards;      }
export function useEpics()      { return useJiraData().epics;       }