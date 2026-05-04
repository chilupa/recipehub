-- Track recipe shares (one row per user per recipe) and expose counts on feed/search RPCs.

create table if not exists public.recipe_shares (
  user_id uuid references auth.users on delete cascade not null,
  recipe_id uuid references public.recipes on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, recipe_id)
);

create index if not exists recipe_shares_recipe_id_idx on public.recipe_shares (recipe_id);

alter table public.recipe_shares enable row level security;

drop policy if exists "Recipe shares are viewable by everyone" on public.recipe_shares;
drop policy if exists "Users can record own share" on public.recipe_shares;

create policy "Recipe shares are viewable by everyone"
  on public.recipe_shares for select using (true);

create policy "Users can record own share"
  on public.recipe_shares for insert
  to authenticated
  with check (auth.uid() = user_id);

drop function if exists public.list_recipes_feed(int, int, uuid);
drop function if exists public.search_recipes_enriched(text, uuid);

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
  image_url text,
  author text,
  likes bigint,
  is_liked boolean,
  shares bigint
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
    r.image_url,
    COALESCE(p.display_name, 'Chef') AS author,
    COALESCE(fc.cnt, 0)::bigint AS likes,
    EXISTS (
      SELECT 1
      FROM public.favorites f
      WHERE f.recipe_id = r.id AND f.user_id = p_viewer_id
    ) AS is_liked,
    COALESCE(sc.cnt, 0)::bigint AS shares
  FROM public.recipes r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.favorites f
    WHERE f.recipe_id = r.id
  ) fc ON true
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.recipe_shares sh
    WHERE sh.recipe_id = r.id
  ) sc ON true
  ORDER BY r.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

GRANT EXECUTE ON FUNCTION public.list_recipes_feed(int, int, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.list_recipes_feed(int, int, uuid) TO authenticated;

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
  image_url text,
  author text,
  likes bigint,
  is_liked boolean,
  shares bigint
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
    s.image_url,
    COALESCE(p.display_name, 'Chef') AS author,
    COALESCE(fc.cnt, 0)::bigint AS likes,
    EXISTS (
      SELECT 1
      FROM public.favorites f
      WHERE f.recipe_id = s.id AND f.user_id = p_viewer_id
    ) AS is_liked,
    COALESCE(shc.cnt, 0)::bigint AS shares
  FROM scored s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.favorites f
    WHERE f.recipe_id = s.id
  ) fc ON true
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.recipe_shares sh
    WHERE sh.recipe_id = s.id
  ) shc ON true
  WHERE s.score > 0
  ORDER BY s.score DESC, s.created_at DESC
  LIMIT 200;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_recipes_enriched(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.search_recipes_enriched(text, uuid) TO authenticated;
