import Image from "next/image";
import { profileUrl, type TMDBCredits } from "@/lib/tmdb";

type Props = {
  credits: TMDBCredits | null;
  error?: string | null;
};

// Key crew roles to surface, in display order. Only roles present in the
// TMDB response are shown - nothing is invented.
const CREW_ROLES: { label: string; jobs: string[] }[] = [
  { label: "Director", jobs: ["Director"] },
  { label: "Screenplay", jobs: ["Screenplay"] },
  { label: "Writer", jobs: ["Writer", "Story"] },
  { label: "Producer", jobs: ["Producer", "Executive Producer"] },
  { label: "Music", jobs: ["Original Music", "Music"] },
];

const MAX_CAST = 12;
const MAX_NAMES_PER_ROLE = 3;

export default function CastCrew({ credits, error }: Props) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <h3 className="text-sm font-semibold text-red-200">Couldn&apos;t load cast &amp; crew</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/60">{error}</p>
      </div>
    );
  }

  const cast = (credits?.cast ?? []).slice(0, MAX_CAST);
  const crew = credits?.crew ?? [];

  const crewRows = CREW_ROLES.map(({ label, jobs }) => {
    const names: string[] = [];
    for (const member of crew) {
      if (jobs.includes(member.job) && !names.includes(member.name)) {
        names.push(member.name);
        if (names.length >= MAX_NAMES_PER_ROLE) break;
      }
    }
    return names.length > 0 ? { label, names } : null;
  }).filter((row): row is { label: string; names: string[] } => row !== null);

  if (cast.length === 0 && crewRows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-white/50">No cast &amp; crew listed for this title on TMDB yet.</p>
      </div>
    );
  }

  return (
    <div>
      {cast.length > 0 && (
        <div className="flex max-w-full gap-3 overflow-x-auto pb-2 touch-pan-x sm:gap-4">
          {cast.map((member) => {
            const photo = profileUrl(member.profile_path, "w185");
            return (
              <article
                key={member.id}
                className="w-28 shrink-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] sm:w-32"
              >
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#1a1033] to-[#0f172a]">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={member.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/40"
                      role="img"
                      aria-label={`No photo for ${member.name}`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="truncate text-xs font-semibold text-white" title={member.name}>
                    {member.name}
                  </h3>
                  <p className="mt-0.5 truncate text-[11px] text-white/50" title={member.character || undefined}>
                    {member.character || "—"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {crewRows.length > 0 && (
        <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {crewRows.map((row) => (
            <div key={row.label} className="flex gap-3 text-sm">
              <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-white/40">
                {row.label}
              </dt>
              <dd className="text-sm text-white/80">{row.names.join(", ")}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
