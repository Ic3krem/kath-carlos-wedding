/**
 * Single source of truth for the content tables /admin can edit.
 *
 * The specs are shared by the generic API routes (which use them as a column
 * allowlist, so a table name in the URL can never write an arbitrary column)
 * and by the generic editors (which render one input per field). Adding a
 * section to the admin is therefore a matter of adding a spec here.
 */

export type FieldType = 'text' | 'textarea' | 'lines' | 'checkbox' | 'number' | 'color' | 'image';

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
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
    description: 'The dated moments shown down the Our Story timeline.',
    addLabel: 'Add milestone',
    titleKey: 'title',
    subtitleKey: 'era',
    fields: [
      { key: 'era', label: 'Era', type: 'text', hint: 'e.g. Autumn 2019' },
      { key: 'place', label: 'Place', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'quote', label: 'Pull quote', type: 'textarea' },
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'caption', label: 'Image caption', type: 'text' },
      SORT_FIELD,
    ],
  },
  schedule_events: {
    table: 'schedule_events',
    title: 'Weekend schedule',
    description: 'Each card in the itinerary.',
    addLabel: 'Add event',
    titleKey: 'title',
    subtitleKey: 'day_label',
    fields: [
      { key: 'day_label', label: 'Day label', type: 'text', hint: 'e.g. Day II' },
      { key: 'date_label', label: 'Date label', type: 'text', hint: 'e.g. Saturday' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'time_label', label: 'Time', type: 'text', hint: 'Leave empty when using an agenda.' },
      { key: 'body', label: 'Body', type: 'textarea', hint: 'Ignored when an agenda is filled in.' },
      { key: 'attire', label: 'Attire', type: 'text' },
      { key: 'agenda', label: 'Agenda', type: 'lines', hint: 'One row per line, as "3:00 PM|Ceremony".' },
      { key: 'is_highlight', label: 'Highlight this card', type: 'checkbox' },
      SORT_FIELD,
    ],
  },
  theme_colors: {
    table: 'theme_colors',
    title: 'Palette',
    description: 'The colour swatches shown with the dress code.',
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
    description: 'The cards under the gift guide.',
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
    description: 'Who guests can reach, shown in the footer.',
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
} satisfies Record<string, CollectionSpec>;

export const SINGLETONS = {
  logistics: {
    table: 'logistics',
    title: 'Guest notes',
    description: 'Dress code note, where to stay, and how to get there.',
    fields: [
      { key: 'dress_note', label: 'Dress code note', type: 'textarea' },
      { key: 'stay_title', label: 'Stay heading', type: 'text' },
      { key: 'stay_body', label: 'Stay body', type: 'textarea' },
      { key: 'travel_title', label: 'Travel heading', type: 'text' },
      { key: 'travel_body', label: 'Travel body', type: 'textarea' },
    ],
  },
  theme_details: {
    table: 'theme_details',
    title: 'Dress code',
    description: 'The headline and per-guest detail shown beside the palette.',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'note', label: 'Note', type: 'textarea' },
      { key: 'ladies_detail', label: 'For the ladies', type: 'text' },
      { key: 'gentlemen_detail', label: 'For the gentlemen', type: 'text' },
    ],
  },
  gift_guide: {
    table: 'gift_guide',
    title: 'Gift guide intro',
    description: 'The paragraph above the gift options.',
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
    else if (field.type === 'number') row[field.key] = 0;
    else if (field.type === 'image') row[field.key] = null;
    else if (field.type === 'color') row[field.key] = '#8AA2B8';
    else row[field.key] = '';
  }
  return row;
}
