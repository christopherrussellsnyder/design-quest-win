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

  const iconH = `h-[${icon(base)}px] md:h-[${icon(md)}px] lg:h-[${icon(lg)}px]`;
  const wordCls = `text-[${word(base)}px] md:text-[${word(md)}px] lg:text-[${word(lg)}px]`;
  const taglineCls = `text-[${tagline(base)}px] md:text-[${tagline(md)}px] lg:text-[${tagline(lg)}px]`;

  return (
    <div
      className={`inline-flex items-center gap-4 md:gap-6 ${className}`}
      style={{ height: icon(base) }}
    >
      <img
        src={korexIcon}
        alt=""
        aria-hidden="true"
        className={`object-contain w-auto ${iconH}`}
      />
      <div
        className="self-stretch border-l border-primary/40"
        aria-hidden="true"
      />
      <div className="flex flex-col justify-center items-start leading-none">
        <span
          className={`font-black tracking-[0.18em] text-foreground inline-block ${wordCls}`}
        >
          KOREX
        </span>
        {showTagline && (
          <span
            className={`text-primary tracking-[0.5em] mt-[0.36em] inline-block ${taglineCls}`}
          >
            INTELLIGENCE SYSTEMS
          </span>
        )}
      </div>
    </div>
  );
};

export default KorexLogoLockup;
