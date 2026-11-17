import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirestoreDb, isFirebaseConfigured } from "../lib/firebase";
import { useAuth } from "./AuthContext";

export type ActivityItem = {
  id: string;
  read: boolean;
  createdAt: string;
  recipeId: string;
  recipeTitle: string;
  actorName: string;
  type: string;
};

type NotificationContextValue = {
  items: ActivityItem[];
  loading: boolean;
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const enabled = Boolean(user) && isFirebaseConfigured();

  const mapDocsToItems = useCallback(async (docs: Array<{ id: string; data: () => Record<string, unknown> }>) => {
    const rows = docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        read: Boolean(data.read),
        created_at: String(data.created_at ?? ""),
        recipe_id: String(data.recipe_id ?? ""),
        actor_id: String(data.actor_id ?? ""),
        type: String(data.type ?? "favorite"),
      };
    });

    const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))];
    const recipeIds = [...new Set(rows.map((r) => r.recipe_id).filter(Boolean))];
    const db = getFirestoreDb();

    const actorNames = new Map<string, string>();
    await Promise.all(
      actorIds.map(async (id) => {
        const snap = await getDoc(doc(db, "profiles", id));
        const name = snap.exists()
          ? String(snap.data().display_name ?? "").trim()
          : "";
        actorNames.set(id, name || "Someone");
      }),
    );

    const recipeTitles = new Map<string, string>();
    await Promise.all(
      recipeIds.map(async (id) => {
        const snap = await getDoc(doc(db, "recipes", id));
        const title = snap.exists()
          ? String(snap.data().title ?? "").trim()
          : "";
        recipeTitles.set(id, title || "Recipe");
      }),
    );

    return rows.map((r) => ({
      id: r.id,
      read: r.read,
      createdAt: r.created_at,
      recipeId: r.recipe_id,
      recipeTitle: recipeTitles.get(r.recipe_id) ?? "Recipe",
      actorName: actorNames.get(r.actor_id) ?? "Someone",
      type: r.type,
    }));
  }, []);

  const load = useCallback(async () => {
    if (!user || !enabled) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(getFirestoreDb(), "notifications"),
        where("user_id", "==", user.id),
        orderBy("created_at", "desc"),
        limit(100),
      );
      const snap = await getDocs(q);
      setItems(await mapDocsToItems(snap.docs));
    } catch (error) {
      console.error("Error loading notifications:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, enabled, mapDocsToItems]);

  useEffect(() => {
    if (!user || !enabled) {
      void load();
      return;
    }
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load, user, enabled]);

  useEffect(() => {
    if (!user?.id || !enabled) return;

    const q = query(
      collection(getFirestoreDb(), "notifications"),
      where("user_id", "==", user.id),
      orderBy("created_at", "desc"),
      limit(100),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        void mapDocsToItems(snap.docs).then(setItems);
      },
      (error) => {
        console.error("notifications snapshot:", error);
      },
    );

    return () => unsub();
  }, [user?.id, enabled, mapDocsToItems]);

  const markRead = useCallback(
    async (id: string) => {
      if (!user || !enabled) return;
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      try {
        await updateDoc(doc(getFirestoreDb(), "notifications", id), { read: true });
      } catch (error) {
        console.error("markRead:", error);
        void load();
      }
    },
    [user?.id, enabled, load],
  );

  const markAllRead = useCallback(async () => {
    if (!user || !enabled) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const unread = items.filter((n) => !n.read);
      const db = getFirestoreDb();
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, "notifications", n.id), { read: true });
      });
      if (unread.length > 0) await batch.commit();
    } catch (error) {
      console.error("markAllRead:", error);
      void load();
    }
  }, [user?.id, enabled, load, items]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      unreadCount,
      refresh: load,
      markRead,
      markAllRead,
    }),
    [items, loading, unreadCount, load, markRead, markAllRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
};
