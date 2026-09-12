export function MapEmbed({ address, embedUrl }: { address: string | null; embedUrl: string | null }) {
  if (!embedUrl) return null;

  return (
    <section className="flex w-full flex-col items-center gap-6 px-4 py-5 sm:px-8 sm:py-7 lg:px-16">
      <h2 className="font-serif text-5xl text-primary sm:text-6xl lg:text-7xl">Venue</h2>
      {address && <p className="text-center text-black/70">{address}</p>}
      <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Venue map"
        />
      </div>
    </section>
  );
}
