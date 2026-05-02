
-- Profiles: display name and avatar (synced from auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- Recipes: one per user (owner)
create table if not exists public.recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  ingredients jsonb default '[]'::jsonb,
  instructions jsonb default '[]'::jsonb,
  prep_time int default 0,
  cook_time int default 0,
  servings int default 0,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists recipes_user_id_idx on public.recipes (user_id);
create index if not exists recipes_created_at_idx on public.recipes (created_at desc);
create index if not exists recipes_servings_idx on public.recipes (servings);
create index if not exists recipes_total_time_idx
  on public.recipes ((coalesce(prep_time, 0) + coalesce(cook_time, 0)));

-- List recipes where prep_time + cook_time equals p_total (for total-time filter links)
create or replace function public.recipes_with_total_minutes(p_total int)
returns setof public.recipes
language sql
stable
security invoker
set search_path = public
as $$
  select r.*
  from public.recipes r
  where coalesce(r.prep_time, 0) + coalesce(r.cook_time, 0) = p_total
  order by r.created_at desc
  limit 200;
$$;

grant execute on function public.recipes_with_total_minutes(int) to authenticated;
grant execute on function public.recipes_with_total_minutes(int) to anon;

-- Favorites: which user favorited which recipe (heart/like in the app)
create table if not exists public.favorites (
  user_id uuid references auth.users on delete cascade not null,
  recipe_id uuid references public.recipes on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, recipe_id)
);

create index if not exists favorites_recipe_id_idx on public.favorites (recipe_id);

-- RLS: enable
alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.favorites enable row level security;

-- Profiles: anyone can read; users can update own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Recipes: anyone can read; only owner can insert/update/delete
create policy "Recipes are viewable by everyone"
  on public.recipes for select using (true);

create policy "Users can insert own recipe"
  on public.recipes for insert with check (auth.uid() = user_id);

create policy "Users can update own recipe"
  on public.recipes for update using (auth.uid() = user_id);

create policy "Users can delete own recipe"
  on public.recipes for delete using (auth.uid() = user_id);

-- Favorites: anyone can read; users can add/remove own
create policy "Favorites are viewable by everyone"
  on public.favorites for select using (true);

create policy "Users can add own favorite"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Users can remove own favorite"
  on public.favorites for delete using (auth.uid() = user_id);

-- Trigger: update recipes.updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists recipes_updated_at on public.recipes;
create trigger recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

-- In-app notifications (e.g. someone favorited your recipe)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  actor_id uuid not null references auth.users on delete cascade,
  recipe_id uuid not null references public.recipes on delete cascade,
  type text not null default 'favorite',
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_no_self_notify check (user_id <> actor_id)
);

create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Recipients see only their notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Mark as read
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Favoriter creates a row for the recipe owner (validated against recipes)
create policy "Users can notify recipe owner on favorite"
  on public.notifications for insert
  with check (
    auth.uid() = actor_id
    and type = 'favorite'
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.user_id = user_id
    )
  );

-- Enable Realtime for this table: Supabase Dashboard → Database → Publications → supabase_realtime → add `notifications`.

-- Search: one RPC returns recipes + author + like counts + is_liked (see migrations for canonical version).
CREATE OR REPLACE FUNCTION public.search_recipes_enriched(
  p_query text,
  p_viewer_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  ingredients jsonb,
  instructions jsonb,
  prep_time int,
  cook_time int,
  servings int,
  tags jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  author text,
  likes bigint,
  is_liked boolean
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF btrim(p_query) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH q AS (
    SELECT btrim(p_query) AS t, lower(btrim(p_query)) AS ql
  ),
  candidate AS (
    SELECT r.*
    FROM public.recipes r
    CROSS JOIN q
    WHERE
      r.title ILIKE '%' || q.t || '%'
      OR COALESCE(r.description, '') ILIKE '%' || q.t || '%'
      OR r.tags @> jsonb_build_array(q.ql)
  ),
  fallback AS (
    SELECT r.*
    FROM public.recipes r
    WHERE NOT EXISTS (SELECT 1 FROM candidate)
    ORDER BY r.created_at DESC
    LIMIT 300
  ),
  unioned AS (
    SELECT * FROM candidate
    UNION ALL
    SELECT * FROM fallback
  ),
  scored AS (
    SELECT
      u.*,
      (
        CASE
          WHEN lower(trim(u.title)) = (SELECT ql FROM q) THEN 400
          WHEN lower(trim(u.title)) LIKE (SELECT ql FROM q) || '%' THEN 300
          WHEN lower(u.title) LIKE '%' || (SELECT ql FROM q) || '%' THEN 200
          WHEN u.tags @> jsonb_build_array((SELECT ql FROM q)) THEN 150
          WHEN lower(COALESCE(u.tags, '[]'::jsonb)::text) LIKE '%' || (SELECT ql FROM q) || '%' THEN 100
          WHEN lower(COALESCE(u.description, '')) LIKE '%' || (SELECT ql FROM q) || '%' THEN 80
          WHEN lower(COALESCE(u.ingredients, '[]'::jsonb)::text) LIKE '%' || (SELECT ql FROM q) || '%' THEN 60
          WHEN lower(COALESCE(u.instructions, '[]'::jsonb)::text) LIKE '%' || (SELECT ql FROM q) || '%' THEN 40
          ELSE 0
        END
      )::int AS score
    FROM unioned u
  )
  SELECT
    s.id,
    s.user_id,
    s.title,
    s.description,
    s.ingredients,
    s.instructions,
    s.prep_time,
    s.cook_time,
    s.servings,
    s.tags,
    s.created_at,
    s.updated_at,
    COALESCE(p.display_name, 'Chef') AS author,
    COALESCE(fc.cnt, 0)::bigint AS likes,
    EXISTS (
      SELECT 1
      FROM public.favorites f
      WHERE f.recipe_id = s.id AND f.user_id = p_viewer_id
    ) AS is_liked
  FROM scored s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.favorites f
    WHERE f.recipe_id = s.id
  ) fc ON true
  WHERE s.score > 0
  ORDER BY s.score DESC, s.created_at DESC
  LIMIT 200;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_recipes_enriched(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.search_recipes_enriched(text, uuid) TO authenticated;

-- Home feed: paginated list + author + likes + is_liked (see migrations for canonical version).
CREATE OR REPLACE FUNCTION public.list_recipes_feed(
  p_limit int,
  p_offset int,
  p_viewer_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  ingredients jsonb,
  instructions jsonb,
  prep_time int,
  cook_time int,
  servings int,
  tags jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  author text,
  likes bigint,
  is_liked boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.ingredients,
    r.instructions,
    r.prep_time,
    r.cook_time,
    r.servings,
    r.tags,
    r.created_at,
    r.updated_at,
    COALESCE(p.display_name, 'Chef') AS author,
    COALESCE(fc.cnt, 0)::bigint AS likes,
    EXISTS (
      SELECT 1
      FROM public.favorites f
      WHERE f.recipe_id = r.id AND f.user_id = p_viewer_id
    ) AS is_liked
  FROM public.recipes r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.favorites f
    WHERE f.recipe_id = r.id
  ) fc ON true
  ORDER BY r.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

GRANT EXECUTE ON FUNCTION public.list_recipes_feed(int, int, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.list_recipes_feed(int, int, uuid) TO authenticated;
