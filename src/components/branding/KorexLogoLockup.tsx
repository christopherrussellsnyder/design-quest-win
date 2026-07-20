import korexIcon from "/korex-icon.png";

interface KorexLogoLockupProps {
  className?: string;
  /** Height in px for the lockup. Icon and text scale together. */
  height?: number;
  /** Height on screens >= 768px. Defaults to `height`. */
  mdHeight?: number;
  /** Height on screens >= 1024px. Defaults to `mdHeight`. */
  lgHeight?: number;
  /** Show the "INTELLIGENCE SYSTEMS" tagline beneath KOREX */
  showTagline?: boolean;
}

/**
 * Official Korex wordmark lockup: 3D K icon + "KOREX" wordmark.
 * Uses the same K icon shown in the favicon / Google search.
 */
export const KorexLogoLockup = ({
  className = "",
  height = 48,
  mdHeight,
  lgHeight,
  showTagline = true,
}: KorexLogoLockupProps) => {
  const base = Math.max(16, height);
  const md = Math.max(16, mdHeight ?? height);
  const lg = Math.max(16, lgHeight ?? md);

  const icon = (h: number) => Math.round(h * 1.25);
  const word = (h: number) => Math.round(icon(h) * 0.55);
  const tagline = (h: number) => Math.max(10, Math.round(icon(h) * 0.10));

  const vars = {
    "--korex-icon-base": `${icon(base)}px`,
    "--korex-icon-md": `${icon(md)}px`,
    "--korex-icon-lg": `${icon(lg)}px`,
    "--korex-word-base": `${word(base)}px`,
    "--korex-word-md": `${word(md)}px`,
    "--korex-word-lg": `${word(lg)}px`,
    "--korex-tagline-base": `${tagline(base)}px`,
    "--korex-tagline-md": `${tagline(md)}px`,
    "--korex-tagline-lg": `${tagline(lg)}px`,
  } as React.CSSProperties;

  return (
    <div
      className={`korex-logo-lockup inline-flex items-center gap-4 md:gap-6 ${className}`}
      style={vars}
    >
      <img
        src={korexIcon}
        alt=""
        aria-hidden="true"
        className="object-contain w-auto"
        style={{ height: "var(--korex-icon-size)" }}
      />
      <div
        className="self-stretch border-l border-primary/40"
        aria-hidden="true"
      />
      <div className="flex flex-col justify-center items-start leading-none">
        <span
          className="font-black tracking-[0.18em] text-foreground inline-block"
          style={{ fontSize: "var(--korex-word-size)" }}
        >
          KOREX
        </span>
        {showTagline && (
          <span
            className="text-primary tracking-[0.5em] mt-[0.36em] inline-block"
            style={{ fontSize: "var(--korex-tagline-size)" }}
          >
            INTELLIGENCE SYSTEMS
          </span>
        )}
      </div>
    </div>
  );
};

export default KorexLogoLockup;
