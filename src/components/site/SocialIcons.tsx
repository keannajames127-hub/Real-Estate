import type { ComponentType, SVGProps } from "react";

/**
 * Brand marks are hand-drawn inline SVG rather than imported from lucide-react,
 * which intentionally ships no trademarked logos.
 */

type IconProps = SVGProps<SVGSVGElement>;

const BASE: IconProps = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": "true",
  focusable: "false",
};

export function InstagramIcon({ className, ...props }: IconProps) {
  return (
    <svg {...BASE} className={className} {...props}>
      <path d="M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.79.22 2.43.47.66.25 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.36.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.79-.47 2.43-.25.66-.6 1.22-1.15 1.77-.55.55-1.11.9-1.77 1.15-.64.25-1.36.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.36-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.79.47-2.43.25-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.45 2.53c.64-.25 1.36-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.98.04-1.5.2-1.86.34-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.3.88-.34 1.86-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.98.2 1.5.34 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.88.3 1.86.34 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.98-.04 1.5-.2 1.86-.34.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.3-.88.34-1.86.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.98-.2-1.5-.34-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.36-.14-.88-.3-1.86-.34-1.05-.05-1.37-.06-4.04-.06Zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28Zm0 1.8a3.34 3.34 0 1 0 0 6.68 3.34 3.34 0 0 0 0-6.68Zm5.34-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
    </svg>
  );
}

export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg {...BASE} className={className} {...props}>
      <path d="M14.02 21.5v-8.2h2.77l.41-3.2h-3.18V8.06c0-.93.26-1.56 1.59-1.56h1.7V3.64c-.3-.04-1.32-.13-2.5-.13-2.47 0-4.16 1.51-4.16 4.28v2.31H7.87v3.2h2.78v8.2h3.37Z" />
    </svg>
  );
}

export function LinkedinIcon({ className, ...props }: IconProps) {
  return (
    <svg {...BASE} className={className} {...props}>
      <path d="M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 21h-3.37v-6.08c0-1.45-.52-2.44-1.81-2.44-.99 0-1.58.67-1.84 1.31-.09.23-.12.55-.12.87V21H9.93s.05-11.34 0-12.5h3.37v1.77c.45-.69 1.25-1.68 3.04-1.68 2.22 0 3.89 1.45 3.89 4.57V21Z" />
    </svg>
  );
}

export function YoutubeIcon({ className, ...props }: IconProps) {
  return (
    <svg {...BASE} className={className} {...props}>
      <path d="M21.58 7.19a2.51 2.51 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77A26.2 26.2 0 0 0 2 12c0 1.63.1 3.26.42 4.81a2.51 2.51 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77c.32-1.55.42-3.18.42-4.81 0-1.63-.1-3.26-.42-4.81ZM9.94 15.02V8.98L15.19 12l-5.25 3.02Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className, ...props }: IconProps) {
  return (
    <svg {...BASE} className={className} {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.14c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.25-8.23 8.25Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.98-.14.16-.29.18-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.24-.02-.37.11-.49.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

/** Renders whichever social profiles the brokerage has configured. */
export function SocialLinks({
  links,
  className,
  iconClassName,
}: {
  links: Record<string, string>;
  className?: string;
  iconClassName?: string;
}) {
  const entries: Array<{ key: string; href: string; label: string; Icon: ComponentType<IconProps> }> = [
    { key: "instagram", href: links.instagram ?? "", label: "Instagram", Icon: InstagramIcon },
    { key: "facebook", href: links.facebook ?? "", label: "Facebook", Icon: FacebookIcon },
    { key: "linkedin", href: links.linkedin ?? "", label: "LinkedIn", Icon: LinkedinIcon },
    { key: "youtube", href: links.youtube ?? "", label: "YouTube", Icon: YoutubeIcon },
  ].filter((entry) => Boolean(entry.href?.trim()));

  if (entries.length === 0) return null;

  return (
    <ul className={className}>
      {entries.map(({ key, href, label, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex items-center justify-center transition-colors duration-300"
          >
            <Icon className={iconClassName ?? "h-4 w-4"} />
          </a>
        </li>
      ))}
    </ul>
  );
}
