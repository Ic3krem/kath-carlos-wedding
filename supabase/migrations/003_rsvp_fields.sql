-- Run this in the Supabase SQL Editor.
-- Extra RSVP fields for the inline RSVP section.

alter table rsvps add column if not exists guest_names text;
alter table rsvps add column if not exists allergies text;
alter table rsvps add column if not exists song_request text;
