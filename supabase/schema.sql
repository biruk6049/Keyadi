-- Run this in Supabase SQL Editor (Project > SQL Editor)

-- 1. Enable PostGIS for geo queries
create extension if not exists postgis;

-- 2. Saved trackers: a user's saved keyword + location search
create table if not exists trackers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  keyword text not null,
  lat double precision not null,
  lng double precision not null,
  radius_m integer not null default 3000,
  location geography(Point, 4326) generated always as (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) stored,
  created_at timestamptz default now()
);

create index if not exists trackers_location_idx on trackers using gist (location);

-- 3. Alert history: matches found for a tracker over time
create table if not exists tracker_matches (
  id uuid primary key default gen_random_uuid(),
  tracker_id uuid references trackers(id) on delete cascade not null,
  place_name text not null,
  place_lat double precision not null,
  place_lng double precision not null,
  source_place_id text, -- Google Places place_id, for de-duping
  found_at timestamptz default now()
);

-- 4. Row Level Security: users only see their own trackers
alter table trackers enable row level security;
alter table tracker_matches enable row level security;

create policy "Users can view their own trackers"
  on trackers for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trackers"
  on trackers for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own trackers"
  on trackers for delete
  using (auth.uid() = user_id);

create policy "Users can view matches for their trackers"
  on tracker_matches for select
  using (
    exists (
      select 1 from trackers
      where trackers.id = tracker_matches.tracker_id
      and trackers.user_id = auth.uid()
    )
  );

-- Example: find all trackers within their radius of a given point
-- (used by the background job that re-checks for new matches)
-- select * from trackers
-- where ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, radius_m);
