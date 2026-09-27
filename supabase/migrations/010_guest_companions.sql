-- Run this in the Supabase SQL Editor.
-- Guest list: store how many companions each invitee may bring, as its own
-- column, so it reads plainly in the Table Editor:
--   name = 'Maria Santos', companions_allowed = 2  ->  Maria + up to 2 guests.
-- On the RSVP form the invitee then picks 0..companions_allowed.

alter table invite_allocations add column if not exists companions_allowed int;

-- Carry over existing rows: max_guests counted the invitee too.
update invite_allocations
set companions_allowed = greatest(coalesce(max_guests, 1) - 1, 0)
where companions_allowed is null;

alter table invite_allocations alter column companions_allowed set default 0;
alter table invite_allocations alter column companions_allowed set not null;
alter table invite_allocations drop constraint if exists invite_allocations_companions_check;
alter table invite_allocations add constraint invite_allocations_companions_check
  check (companions_allowed between 0 and 20);

-- max_guests (party size incl. the invitee) is kept in sync automatically,
-- including for edits made directly in the Table Editor.
create or replace function invite_allocations_sync_max() returns trigger as $$
begin
  new.max_guests := new.companions_allowed + 1;
  return new;
end;
$$ language plpgsql;

drop trigger if exists invite_allocations_sync_max on invite_allocations;
create trigger invite_allocations_sync_max
  before insert or update on invite_allocations
  for each row execute function invite_allocations_sync_max();
