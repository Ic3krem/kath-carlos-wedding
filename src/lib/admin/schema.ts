/**
 * Single source of truth for the content tables /admin can edit.
 *
 * The specs are shared by the generic API routes (which use them as a column
 * allowlist, so a table name in the URL can never write an arbitrary column)
 * and by the generic editors (which render one input per field). Adding a
 * section to the admin is therefore a matter of adding a spec here.
 */

export type FieldType = 'text' | 'textarea' | 'lines' | 'checkbox' | 'number' | 'color' | 'image' | 'select';

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  /** Choices for a 'select' field. */
  options?: readonly string[];
}

export interface CollectionSpec {
  table: string;
  /** Heading shown above the editor. */
  title: string;
  description: string;
  /** Label for the add form submit button, e.g. "Add milestone". */
  addLabel: string;
  fields: FieldSpec[];
  /** Which field names the row in the list. */
  titleKey: string;
  /** Optional second line under the row title. */
  subtitleKey?: string;
}

export interface SingletonSpec {
  table: string;
  title: string;
  description: string;
  fields: FieldSpec[];
}

import { TIMELINE_ICONS } from '@/lib/types';

const SORT_FIELD: FieldSpec = {
  key: 'sort_order',
  label: 'Order',
  type: 'number',
  hint: 'Lower numbers appear first.',
};

export const COLLECTIONS = {
  story_milestones: {
    table: 'story_milestones',
    title: 'Story milestones',
    description: 'Each photo-and-text block in Our Story, alternating left and right.',
    addLabel: 'Add milestone',
    titleKey: 'title',
    subtitleKey: 'era',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'era', label: 'Era', type: 'text', hint: 'For your reference, e.g. Summer 2021 (not shown).' },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'quote', label: 'Pull quote', type: 'textarea' },
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'caption', label: 'Image description', type: 'text', hint: 'Read aloud by screen readers.' },
      SORT_FIELD,
    ],
  },
  timeline_items: {
    table: 'timeline_items',
    title: 'Wedding timeline',
    description: 'The icon cards under When & Where.',
    addLabel: 'Add timeline item',
    titleKey: 'label',
    subtitleKey: 'time_label',
    fields: [
      { key: 'time_label', label: 'Time', type: 'text', hint: 'e.g. 3:00 PM' },
      { key: 'label', label: 'What happens', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'select', options: TIMELINE_ICONS },
      SORT_FIELD,
    ],
  },
  theme_colors: {
    table: 'theme_colors',
    title: 'Palette',
    description: 'The colour swatches under the attire illustration.',
    addLabel: 'Add colour',
    titleKey: 'name',
    subtitleKey: 'hex',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'hex', label: 'Colour', type: 'color' },
      SORT_FIELD,
    ],
  },
  gift_options: {
    table: 'gift_options',
    title: 'Gift options',
    description: 'Optional cards under the gift guide text (e.g. bank details). Leave empty for text only.',
    addLabel: 'Add option',
    titleKey: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'detail', label: 'Detail', type: 'textarea' },
      { key: 'lines', label: 'Details', type: 'lines', hint: 'One per line, e.g. an account number.' },
      SORT_FIELD,
    ],
  },
  contacts: {
    table: 'contacts',
    title: 'Contacts',
    description: 'Not shown on the current design; kept for your records.',
    addLabel: 'Add contact',
    titleKey: 'name',
    subtitleKey: 'role',
    fields: [
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      SORT_FIELD,
    ],
  },
  invite_allocations: {
    table: 'invite_allocations',
    title: 'Guest list',
    description:
      'Only people on this list can RSVP. Guests start typing their name on the RSVP form and pick it from the suggestions; the seats here cap how many companions they can bring.',
    addLabel: 'Add invitee',
    titleKey: 'name',
    subtitleKey: 'max_guests',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', hint: 'As printed on the invitation.' },
      { key: 'max_guests', label: 'Seats (including the guest)', type: 'number', hint: '1 = just them, 3 = them plus two companions.' },
      SORT_FIELD,
    ],
  },
} satisfies Record<string, CollectionSpec>;

export const SINGLETONS = {
  theme_details: {
    table: 'theme_details',
    title: 'Attire guide',
    description: 'The text beside the attire illustration.',
    fields: [
      { key: 'life_godparents_detail', label: 'Entourage — life godparents', type: 'text' },
      { key: 'godparents_gentlemen_detail', label: 'Entourage — gentlemen', type: 'text' },
      { key: 'godparents_ladies_detail', label: 'Entourage — ladies', type: 'text' },
      { key: 'guest_note', label: 'Guests — opening note (optional)', type: 'textarea' },
      { key: 'avoid_note', label: 'Guests — what to avoid', type: 'textarea' },
      { key: 'comfort_note', label: 'Guests — comfort note', type: 'textarea' },
      { key: 'note', label: 'Small note under the illustration', type: 'text' },
    ],
  },
  gift_guide: {
    table: 'gift_guide',
    title: 'Gift guide intro',
    description: 'The Gift Guide paragraph. Leave a blank line between paragraphs.',
    fields: [{ key: 'intro', label: 'Intro', type: 'textarea' }],
  },
} satisfies Record<string, SingletonSpec>;

export type CollectionName = keyof typeof COLLECTIONS;
export type SingletonName = keyof typeof SINGLETONS;

export function getCollectionSpec(name: string): CollectionSpec | null {
  return (COLLECTIONS as Record<string, CollectionSpec>)[name] ?? null;
}

export function getSingletonSpec(name: string): SingletonSpec | null {
  return (SINGLETONS as Record<string, SingletonSpec>)[name] ?? null;
}

export type Row = Record<string, unknown>;

/** Coerces one submitted value to the shape its column expects. */
function coerce(field: FieldSpec, value: unknown): unknown {
  switch (field.type) {
    case 'number': {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    case 'checkbox':
      return value === true || value === 'true';
    case 'image':
      return typeof value === 'string' && value.length > 0 ? value : null;
    case 'select':
      return field.options?.includes(String(value)) ? String(value) : (field.options?.[0] ?? '');
    default:
      if (typeof value === 'string') return value;
      return value == null ? '' : String(value);
  }
}

/** Keeps only the columns in the spec, so a body cannot touch anything else. */
export function pickFields(fields: FieldSpec[], body: Row): Row {
  const picked: Row = {};
  for (const field of fields) {
    picked[field.key] = coerce(field, body[field.key]);
  }
  return picked;
}

/** A blank row for the add form. */
export function emptyRow(fields: FieldSpec[], sortOrder = 0): Row {
  const row: Row = {};
  for (const field of fields) {
    if (field.key === 'sort_order') row[field.key] = sortOrder;
    else if (field.type === 'checkbox') row[field.key] = false;
    else if (field.key === 'max_guests') row[field.key] = 1;
    else if (field.type === 'number') row[field.key] = 0;
    else if (field.type === 'image') row[field.key] = null;
    else if (field.type === 'color') row[field.key] = '#8AA2B8';
    else if (field.type === 'select') row[field.key] = field.options?.[0] ?? '';
    else row[field.key] = '';
  }
  return row;
}
