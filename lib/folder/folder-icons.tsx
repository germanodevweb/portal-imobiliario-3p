import type { ReactNode } from "react";
import type { FolderHighlightIconId } from "@/lib/folder/types";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

function LucideSvg({
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g>{children}</g>
    </svg>
  );
}

export function IconBed(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M12 4v6" />
      <path d="M2 18h20" />
    </LucideSvg>
  );
}

function iconPool(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </LucideSvg>
  );
}

function iconCar(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.3A2 2 0 0 0 13.7 6H10.3a2 2 0 0 0-1.6.7L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </LucideSvg>
  );
}

const HIGHLIGHT_MAP: Record<
  FolderHighlightIconId,
  (p: IconProps) => ReactNode
> = {
  balcony: iconPool,
  leisure: iconPool,
  security: iconPool,
  parking: iconCar,
  elevator: iconPool,
  sea_view: iconPool,
  suite: iconPool,
  furnished: iconPool,
  pet: iconPool,
};

export function FolderHighlightIcon({
  iconId,
  ...props
}: IconProps & { iconId: FolderHighlightIconId }) {
  const Render = HIGHLIGHT_MAP[iconId];
  return Render(props);
}
