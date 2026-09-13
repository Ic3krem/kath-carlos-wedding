-- Run this in the Supabase SQL Editor.
-- Existing entourage rows predate the role categories, so they all sit in
-- 'other' and fall into the catch-all block instead of their own card groups.
-- This reads each row's role_label and files it under the right category.

-- Safety net: re-assert the widened category list in case 004 has not run.
alter table entourage_members drop constraint if exists entourage_members_category_check;
alter table entourage_members add constraint entourage_members_category_check
  check (category in (
    'parents', 'godparents', 'best_man', 'maid_of_honor', 'groomsmen',
    'bridesmaids', 'flower_girls', 'ring_bearer', 'coin_bearer',
    'bible_bearer', 'other'
  ));

update entourage_members set category = case
  when role_label ilike '%maid of honor%'  or role_label ilike '%matron of honor%' then 'maid_of_honor'
  when role_label ilike '%best man%'                                               then 'best_man'
  when role_label ilike '%bridesmaid%'                                             then 'bridesmaids'
  when role_label ilike '%groomsman%'      or role_label ilike '%groomsmen%'        then 'groomsmen'
  when role_label ilike '%flower girl%'                                            then 'flower_girls'
  when role_label ilike '%ring bearer%'                                            then 'ring_bearer'
  when role_label ilike '%coin bearer%'                                            then 'coin_bearer'
  when role_label ilike '%bible bearer%'                                           then 'bible_bearer'
  when role_label ilike '%ninong%' or role_label ilike '%ninang%'
       or role_label ilike '%sponsor%' or role_label ilike '%godparent%'           then 'godparents'
  when role_label ilike '%father%' or role_label ilike '%mother%'
       or role_label ilike '%parent%'                                              then 'parents'
  else category
end
where category = 'other';

-- Side drives the left/right columns; fill it in where the label makes it obvious.
update entourage_members set side = 'bride'
where side is null and (
  category in ('bridesmaids', 'flower_girls')
  or role_label ilike '%ninang%'
  or role_label ilike '%of the bride%'
);

update entourage_members set side = 'groom'
where side is null and (
  category in ('groomsmen', 'ring_bearer', 'coin_bearer', 'bible_bearer')
  or role_label ilike '%ninong%'
  or role_label ilike '%of the groom%'
);
