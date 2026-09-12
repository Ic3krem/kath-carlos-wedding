import { RsvpTrigger } from './RsvpTrigger';

export function Rsvp({ weddingDate }: { weddingDate: string }) {
  const formatted = new Date(weddingDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <section id="rsvp" className="flex w-full flex-col items-center gap-6 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">RSVP</h2>
      <p className="max-w-xl text-center text-black/55">
        We would love to celebrate with you on {formatted}. Kindly let us know if you can make it so we can save
        you a seat.
      </p>
      <RsvpTrigger className="rounded-lg bg-black px-8 py-3 font-semibold uppercase tracking-wide text-white" />
    </section>
  );
}
