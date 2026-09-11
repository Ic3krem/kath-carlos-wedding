'use client';

interface StoryModalProps {
  open: boolean;
  title: string;
  fullStory: string;
  onClose: () => void;
}

export function StoryModal({ open, title, fullStory, onClose }: StoryModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-secondary p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-3xl text-primary sm:text-4xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none">
            &times;
          </button>
        </div>
        <p className="whitespace-pre-line text-black/70">{fullStory}</p>
      </div>
    </div>
  );
}
