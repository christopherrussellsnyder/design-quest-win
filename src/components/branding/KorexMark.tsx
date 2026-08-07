import korexIcon from "/korex-icon.png";

interface KorexMarkProps {
  /** Tailwind sizing classes, e.g. "w-8 h-8" */
  className?: string;
  /** Tailwind background utility used to fill the mark. Defaults to brand green. */
  colorClassName?: string;
  title?: string;
}

/**
 * The Korex tower mark rendered as a masked silhouette so it stays
 * legible on both light and dark backgrounds.
 */
export const KorexMark = ({
  className = "w-8 h-8",
  colorClassName = "bg-primary",
  title = "Korex",
}: KorexMarkProps) => (
  <div
    role="img"
    aria-label={title}
    className={`${colorClassName} ${className}`}
    style={{
      WebkitMaskImage: `url(${korexIcon})`,
      maskImage: `url(${korexIcon})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

export default KorexMark;
