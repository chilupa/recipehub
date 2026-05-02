-- Home feed: one RPC returns a page of recipes + author + likes + is_liked for the viewer.

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
