export type LogoProps = {
  /** Size in pixels or any valid CSS size string (e.g. 24, "1.5rem", "24px") */
  size?: number | string;
  className?: string; // classes applied to the image
  containerClassName?: string; // classes applied to the wrapper if showText is used
  alt?: string;
  /** Show the app name text. If `true`, uses the default app name 'Ordura'. If string, displays that string. */
  showText?: boolean | string;
};

/**
 * Simple Logo component that renders the app icon located in /public.
 * - `size` accepts a number (interpreted as px) or a CSS size string
 * - `className` can be used for Tailwind utility classes (e.g. "w-6 h-6")
 * - `showText` when provided displays the app name next to the logo using the brand font
 */
export function Logo({
  size = 32,
  className = "",
  containerClassName = "",
  alt = "App logo",
  showText,
}: LogoProps) {
  // Support semantic size tokens (and alias 'sn' for 'sm') in addition to numeric and CSS strings.
  const sizeTokens: Record<string, number> = {
    xs: 12,
    sm: 16,
    sn: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const sizeValue =
    typeof size === "number"
      ? `${size}px`
      : typeof size === "string" && size in sizeTokens
        ? `${sizeTokens[size] /* eslint-disable-line @typescript-eslint/ban-ts-comment */}px`
        : size;

  const textSizeClassMap: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    sn: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  let textStyle: { fontSize?: string } | undefined;
  if (typeof size === "number") {
    // make the text roughly half the logo size, with a minimum
    textStyle = { fontSize: `${Math.max(10, Math.round(size / 1.18))}px` };
  } else if (typeof size === "string" && !(size in textSizeClassMap)) {
    // for arbitrary CSS size strings, use calc to compute half
    textStyle = { fontSize: `calc(${size} / 2)` };
  }

  const textToShow =
    showText === true
      ? "Ordura"
      : typeof showText === "string"
        ? showText
        : null;

  if (!textToShow) {
    return (
      <img
        src="/Icon.png"
        alt={alt}
        style={{
          width: sizeValue,
          height: sizeValue,
          objectFit: "contain",
          objectPosition: "center",
        }}
        className={`${className} select-none pointer-events-none object-contain`}
        loading="lazy"
        draggable={false}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 ${containerClassName}`}
      aria-label="logo-with-text"
    >
      <img
        src="/Icon.png"
        alt={alt}
        style={{
          width: sizeValue,
          height: sizeValue,
          objectFit: "contain",
          objectPosition: "center",
        }}
        className={`${className} select-none pointer-events-none object-contain`}
        loading="lazy"
        draggable={false}
      />
      <span
        className="font-brand text-primary text-2xl font-medium leading-none"
        style={textStyle}
      >
        {textToShow}
      </span>
    </div>
  );
}

export default Logo;
