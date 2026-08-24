-- ============================================================================
-- Guarantee every profile has an avatar
--
-- Guests were landing with an empty avatar. `signInAnonymously()` inserts the
-- auth user first — which fires handle_new_user and writes the profile row —
-- and only then does the client call `updateUser` to set the avatar metadata.
-- That second call touches auth.users alone, so profiles.avatar_url stayed
-- NULL forever. The same happens for any OAuth provider that returns no
-- picture.
--
-- Fixing it in the client alone would leave the gap open for every future
-- signup path, so the fallback lives in the trigger: if the metadata carries
-- no avatar, generate a deterministic one from the user id. This mirrors
-- `defaultAvatar()` in src/constants/app.ts — keep the two in sync.
-- ============================================================================

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Player'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username', 'Player'),
    new.email,
    -- Providers use different keys; fall back to a generated avatar so the
    -- column is never empty.
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', ''),
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id || '&backgroundColor=transparent'
    )
  );
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Backfill everyone who is already sitting with an empty avatar.
-- Prefer whatever the account metadata holds before generating one.
-- ----------------------------------------------------------------------------
update public.profiles p
   set avatar_url = coalesce(
         nullif(u.raw_user_meta_data->>'avatar_url', ''),
         nullif(u.raw_user_meta_data->>'picture', ''),
         'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.id || '&backgroundColor=transparent'
       )
  from auth.users u
 where u.id = p.id
   and (p.avatar_url is null or p.avatar_url = '');

commit;
