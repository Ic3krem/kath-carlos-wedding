-- Run this in the Supabase SQL Editor.
-- RSVPs: an invitee who cannot come may send a proxy in their place.
-- proxy_name is filled only for those RSVPs; the seat is then the proxy's.

alter table rsvps add column if not exists proxy_name text;
