'use client';

import type { FieldSpec, Row } from '@/lib/admin/schema';
import { ImageUploader } from './ImageUploader';

const INPUT_CLASS = 'rounded-md border border-black/20 px-3 py-2';

interface FieldInputProps {
  field: FieldSpec;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** Renders the one input a field spec calls for. */
export function FieldInput({ field, value, onChange }: FieldInputProps) {
  if (field.type === 'image') {
    return (
      <div className="flex flex-col gap-1">
        <ImageUploader
          label={field.label}
          value={(value as string | null) ?? null}
          onUploaded={(url) => onChange(url)}
        />
        {value ? (
          <button type="button" onClick={() => onChange(null)} className="w-fit text-xs text-red-600">
            Remove image
          </button>
        ) : null}
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{field.label}</label>
      {field.type === 'textarea' || field.type === 'lines' ? (
        <textarea
          className={`min-h-24 ${INPUT_CLASS}`}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'color' ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="h-10 w-14 rounded-md border border-black/20"
            value={(value as string) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            className={`flex-1 ${INPUT_CLASS}`}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : field.type === 'number' ? (
        <input
          type="number"
          className={INPUT_CLASS}
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : (
        <input
          className={INPUT_CLASS}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.hint && <p className="text-xs text-black/50">{field.hint}</p>}
    </div>
  );
}

/** Every field of a row, in spec order. */
export function FieldList({
  fields,
  row,
  onChange,
}: {
  fields: FieldSpec[];
  row: Row;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <>
      {fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={row[field.key]}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </>
  );
}
