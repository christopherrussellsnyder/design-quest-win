import korexIcon from "/korex-icon.png";

interface KorexLogoLockupProps {
  className?: string;
  /** Height in px for the lockup. Icon and text scale together. */
  height?: number;
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
  showTagline = true,
}: KorexLogoLockupProps) => {
  const iconSize = Math.round(height * 1.25);
  const wordSize = Math.round(iconSize * 0.55);
  const taglineSize = Math.max(10, Math.round(iconSize * 0.10));

  return (
    <div
      className={`inline-flex items-center gap-6 ${className}`}
      style={{ height: iconSize }}
    >
      <img
        src={korexIcon}
        alt=""
        aria-hidden="true"
        style={{ height: iconSize, width: "auto" }}
        className="object-contain"
      />
      <div
        className="self-stretch border-l border-primary/40"
        aria-hidden="true"
      />
      <div className="flex flex-col justify-center items-start leading-none">
        <span
          className="font-black tracking-[0.18em] text-foreground inline-block"
          style={{ fontSize: wordSize }}
        >
          KOREX
        </span>
        {showTagline && (
          <span
            className="text-primary tracking-[0.5em] mt-[0.36em] inline-block"
            style={{ fontSize: taglineSize }}
          >
            INTELLIGENCE SYSTEMS
          </span>
        )}
      </div>
    </div>
  );
};

export default KorexLogoLockup;
