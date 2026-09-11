import type { GalleryImage } from '@/lib/types';

export function Gallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-serif text-5xl text-primary sm:text-6xl lg:text-7xl">Gallery</h2>
      <div className="grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.id}
            src={image.image_url}
            alt={image.caption ?? 'Gallery photo'}
            className="aspect-square w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </section>
  );
}
