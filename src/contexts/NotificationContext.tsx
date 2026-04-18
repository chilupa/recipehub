import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";

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

type Row = {
  id: string;
  read: boolean;
  created_at: string;
  recipe_id: string;
  actor_id: string;
  type: string;
  recipes: { title: string } | { title: string }[] | null;
};

type ProfileNameRow = {
  id: string;
  display_name: string | null;
};

function toNotificationRows(data: unknown): Row[] {
  return Array.isArray(data) ? (data as Row[]) : [];
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const enabled =
    Boolean(user) && isSupabaseConfigured() && !useMockData;

  const load = useCallback(async () => {
    if (!user || !enabled) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, read, created_at, recipe_id, actor_id, type, recipes(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error loading notifications:", error);
        setItems([]);
        return;
      }

      const rows = toNotificationRows(data);
      const actorIds = [...new Set(rows.map((r) => r.actor_id))];
      let actorNames = new Map<string, string>();

      if (actorIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", actorIds);

        const profileRows = (profs ?? []) as ProfileNameRow[];
        actorNames = new Map(
          profileRows.map((p) => [
            p.id,
            p.display_name?.trim() || "Chef",
          ]),
        );
      }

      const recipeTitle = (r: Row): string => {
        const rec = r.recipes;
        if (!rec) return "Recipe";
        const row = Array.isArray(rec) ? rec[0] : rec;
        return row?.title?.trim() || "Recipe";
      };

      setItems(
        rows.map((r) => ({
          id: r.id,
          read: r.read,
          createdAt: r.created_at,
          recipeId: r.recipe_id,
          recipeTitle: recipeTitle(r),
          actorName: actorNames.get(r.actor_id) ?? "Someone",
          type: r.type,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user?.id || !enabled) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, enabled, load]);

  const markRead = useCallback(
    async (id: string) => {
      if (!user || !enabled) return;
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        console.error("markRead:", error);
        void load();
      }
    },
    [user?.id, enabled, load],
  );

  const markAllRead = useCallback(async () => {
    if (!user || !enabled) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    if (error) {
      console.error("markAllRead:", error);
      void load();
    }
  }, [user?.id, enabled, load]);

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
