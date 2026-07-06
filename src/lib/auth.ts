import { useEffect, useState, useCallback } from "react";
import { DEFAULT_USER, type UserProfile } from "./mock-data";
import { onFirebaseAuth, firebaseSignOut, type FbUser } from "./firebase";

const KEY = "sprint-auth-v1";

function read(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function write(u: UserProfile | null) {
  if (typeof window === "undefined") return;
  if (u) window.localStorage.setItem(KEY, JSON.stringify(u));
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("sprint-auth"));
}

function fromFirebase(fb: FbUser): UserProfile {
  const existing = read();
  const base = existing ?? DEFAULT_USER;
  return {
    ...base,
    id: fb.uid,
    name: fb.displayName || existing?.name || fb.email?.split("@")[0] || "Sprint user",
    email: fb.email || existing?.email || "",
    photo: fb.photoURL || existing?.photo || "",
  };
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(read());
    const sync = () => setUser(read());
    window.addEventListener("sprint-auth", sync);
    window.addEventListener("storage", sync);

    const unsub = onFirebaseAuth((fb) => {
      if (fb) {
        const next = fromFirebase(fb);
        write(next);
        setUser(next);
      } else {
        // Firebase says signed out — clear our mirror (if any).
        if (read()) write(null);
        setUser(null);
      }
      setReady(true);
    });

    return () => {
      window.removeEventListener("sprint-auth", sync);
      window.removeEventListener("storage", sync);
      unsub?.();
    };
  }, []);


  const signIn = useCallback((over: Partial<UserProfile> = {}) => {
    const next = { ...DEFAULT_USER, ...over };
    write(next);
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    try { await firebaseSignOut(); } catch {}
    write(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : { ...DEFAULT_USER, ...patch };
      write(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((eventId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const has = prev.bookmarkedEventIds.includes(eventId);
      const next = {
        ...prev,
        bookmarkedEventIds: has
          ? prev.bookmarkedEventIds.filter((x) => x !== eventId)
          : [...prev.bookmarkedEventIds, eventId],
      };
      write(next);
      return next;
    });
  }, []);

  const registerForEvent = useCallback((eventId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (prev.joinedEventIds.includes(eventId)) return prev;
      const next = { ...prev, joinedEventIds: [...prev.joinedEventIds, eventId] };
      write(next);
      return next;
    });
  }, []);

  const followCollege = useCallback((collegeId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const has = prev.followedCollegeIds.includes(collegeId);
      const next = {
        ...prev,
        followedCollegeIds: has
          ? prev.followedCollegeIds.filter((x) => x !== collegeId)
          : [...prev.followedCollegeIds, collegeId],
      };
      write(next);
      return next;
    });
  }, []);

  return { user, ready, isAuthed: !!user, signIn, signOut, updateProfile, toggleBookmark, registerForEvent, followCollege };
}
