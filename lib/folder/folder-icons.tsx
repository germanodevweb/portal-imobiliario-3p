import type { CSSProperties, ReactNode } from "react";
import type { FolderHighlightIconId, FolderNearbyIconId } from "@/lib/folder/types";

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

export function IconMapPin(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <path d="M12 10h.01" />
    </LucideSvg>
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

function iconShopping(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </LucideSvg>
  );
}

function iconCart(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </LucideSvg>
  );
}

function iconDumbbell(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 6 3-3" />
      <path d="m6 18-3 3" />
      <path d="M12 6 9 9" />
      <path d="M12 18l-3-3" />
      <path d="M18 12l-3 3" />
    </LucideSvg>
  );
}

function iconPill(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </LucideSvg>
  );
}

function iconUtensils(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v8" />
      <path d="M21 15v7" />
    </LucideSvg>
  );
}

function iconBus(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M8 6v6" />
      <path d="M15 6v6" />
      <path d="M2 12h19.6" />
      <path d="M18 18h3s-1-1.5-1-4.5V8a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v5.5C2 16.5 1 18 1 18h3" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </LucideSvg>
  );
}

function iconSchool(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
    </LucideSvg>
  );
}

function iconHospital(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M12 6v4" />
      <path d="M14 14h-4" />
      <path d="M14 18h-4" />
      <path d="M14 8h-4" />
      <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
      <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
    </LucideSvg>
  );
}

function iconWaves(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </LucideSvg>
  );
}

function iconTrees(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
      <path d="M7 16v6" />
      <path d="M13 19v3" />
      <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.2 1.5" />
    </LucideSvg>
  );
}

function iconGraduation(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </LucideSvg>
  );
}

function iconLandmark(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M10 18v-7" />
      <path d="M14 18v-7" />
      <path d="M18 18v-7" />
      <path d="M6 18v-7" />
      <path d="M2 11h20" />
      <path d="M12 4 22 11H2z" />
    </LucideSvg>
  );
}

const NEARBY_MAP: Record<
  FolderNearbyIconId,
  (p: IconProps) => ReactNode
> = {
  shopping: iconShopping,
  supermarket: iconCart,
  gym: iconDumbbell,
  pharmacy: iconPill,
  restaurant: iconUtensils,
  transport: iconBus,
  school: iconSchool,
  hospital: iconHospital,
  beach: iconWaves,
  park: iconTrees,
  university: iconGraduation,
  bank: iconLandmark,
};

export function FolderNearbyIcon({
  iconId,
  ...props
}: IconProps & { iconId: FolderNearbyIconId }) {
  const Render = NEARBY_MAP[iconId];
  return Render(props);
}

function iconBalcony(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4 8 4v14" />
      <path d="M9 21v-4h6v4" />
    </LucideSvg>
  );
}

function iconPool(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M2 12h20" />
      <path d="M2 17h20" />
      <path d="M2 7h20" />
    </LucideSvg>
  );
}

function iconShield(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M20 13c0 5-3.5 7.5-8 7.5s-8-2.5-8-7.5V5l8-3 8 3z" />
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

function iconElevator(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M12 3v18" />
      <path d="m8 7 4-4 4 4" />
      <path d="m8 17 4 4 4-4" />
    </LucideSvg>
  );
}

function iconSun(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </LucideSvg>
  );
}

function iconBath(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M10 4 8 6" />
      <path d="M17 19v2" />
      <path d="M2 12h20" />
      <path d="M7 19v2" />
      <path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    </LucideSvg>
  );
}

function iconSofa(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M20 11a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
    </LucideSvg>
  );
}

function iconPaw(props: IconProps) {
  return (
    <LucideSvg {...props}>
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 0-5 5v3.5a3.5 3.5 0 0 0 6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </LucideSvg>
  );
}

const HIGHLIGHT_MAP: Record<
  FolderHighlightIconId,
  (p: IconProps) => ReactNode
> = {
  balcony: iconBalcony,
  leisure: iconPool,
  security: iconShield,
  parking: iconCar,
  elevator: iconElevator,
  sea_view: iconSun,
  suite: iconBath,
  furnished: iconSofa,
  pet: iconPaw,
};

export function FolderHighlightIcon({
  iconId,
  ...props
}: IconProps & { iconId: FolderHighlightIconId }) {
  const Render = HIGHLIGHT_MAP[iconId];
  return Render(props);
}

export const NEARBY_ICON_LABELS: Record<FolderNearbyIconId, string> = {
  shopping: "Shopping",
  supermarket: "Supermercado",
  gym: "Academia",
  pharmacy: "Farmácia",
  restaurant: "Restaurante",
  transport: "Transporte",
  school: "Escola",
  hospital: "Hospital",
  beach: "Praia",
  park: "Parque",
  university: "Universidade",
  bank: "Banco",
};

export const HIGHLIGHT_ICON_LABELS: Record<FolderHighlightIconId, string> = {
  balcony: "Varanda",
  leisure: "Lazer / Piscina",
  security: "Segurança",
  parking: "Vaga de garagem",
  elevator: "Elevador",
  sea_view: "Vista mar",
  suite: "Suíte",
  furnished: "Mobiliado",
  pet: "Pet friendly",
};

export const greenCircleIconWrap: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#1F4D2E",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
