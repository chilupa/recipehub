
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
