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
  const desktopHeight = lgHeight ?? mdHeight ?? height;
  const tabletHeight = mdHeight ?? height;

  return (
    <div className={`inline-flex items-center gap-4 md:gap-6 ${className}`}>
      <img
        src={korexIcon}
        alt=""
        aria-hidden="true"
        className="object-contain h-16 md:h-24 lg:h-36 w-auto"
      />
      <div
        className="self-stretch border-l border-primary/40"
        aria-hidden="true"
      />
      <div className="flex flex-col justify-center items-start leading-none">
        <span className="font-black tracking-[0.18em] text-foreground inline-block text-[2.1rem] md:text-[3.3rem] lg:text-[5rem]">
          KOREX
        </span>
        {showTagline && (
          <span className="text-primary tracking-[0.5em] mt-[0.36em] inline-block text-[0.55rem] md:text-[0.85rem] lg:text-[1.25rem]">
            INTELLIGENCE SYSTEMS
          </span>
        )}
      </div>
    </div>
  );
};

export default KorexLogoLockup;
