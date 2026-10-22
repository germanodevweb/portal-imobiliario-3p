import type { CSSProperties, ReactNode } from "react";
import { fitFolderHeaderBlock } from "@/lib/folder/fit-bebas-bar-title";
import type { FolderPhoneDisplay } from "@/lib/folder/folder-phone";
import { FolderHighlightIcon, IconBed } from "@/lib/folder/folder-icons";
import {
  FOLDER_LAYOUT_METRICS,
  getFolderVideoBlurStripHeights,
  type FolderLayoutMetrics,
} from "@/lib/folder/folder-frame-metrics";
import type { FolderVariant } from "@/lib/folder/types";

const GREEN = "#1E6B38";
const GREEN_DEEP = "#14502A";
const GOLD = "#E2C48E";
const WHITE = "#FFFFFF";

const METRICS = FOLDER_LAYOUT_METRICS;

function WhatsIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={WHITE}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type FactProps = {
  icon: ReactNode;
  big: string;
  small: string;
  m: FolderLayoutMetrics;
};

function Fact({ icon, big, small, m }: FactProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: m.factColWidth,
      }}
    >
      <div
        style={{
          display: "flex",
          height: m.factIconBox,
          alignItems: "center",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Bebas",
          fontSize: m.factBigFont,
          color: WHITE,
          marginTop: variantMarginTop(m),
          lineHeight: 1,
        }}
      >
        {big}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: m.factSmallFont,
          color: GOLD,
          letterSpacing: 5,
          marginTop: 6,
        }}
      >
        {small}
      </div>
    </div>
  );
}

function variantMarginTop(m: FolderLayoutMetrics): number {
  return m.factBigFont >= 64 ? 8 : 6;
}

type HighlightFact = {
  key: string;
  icon: ReactNode;
  big: string;
  small: string;
};

function buildHighlightFacts(
  bedrooms: number,
  showLeisure: boolean,
  garage: number,
  m: FolderLayoutMetrics
): HighlightFact[] {
  const out: HighlightFact[] = [];
  const sw = 1.7;

  if (bedrooms > 0) {
    const n = bedrooms >= 4 ? "4+" : String(bedrooms);
    out.push({
      key: "bed",
      icon: <IconBed size={m.factIconSize} color={GOLD} strokeWidth={sw} />,
      big: n,
      small: bedrooms === 1 ? "QUARTO" : "QUARTOS",
    });
  }

  if (showLeisure) {
    out.push({
      key: "leisure",
      icon: (
        <FolderHighlightIcon
          iconId="leisure"
          size={m.factIconSize}
          color={GOLD}
          strokeWidth={sw}
        />
      ),
      big: "LAZER",
      small: "DE CLUBE",
    });
  }

  if (garage > 0) {
    const n = String(garage);
    out.push({
      key: "garage",
      icon: (
        <FolderHighlightIcon
          iconId="parking"
          size={m.factIconSize}
          color={GOLD}
          strokeWidth={sw}
        />
      ),
      big: n,
      small: garage === 1 ? "VAGA" : "VAGAS",
    });
  }

  return out;
}

export type FolderPhotoSlotMode = "image" | "transparent";

export type ApprovedFolderLayoutProps = {
  variant: FolderVariant;
  logoSrc: string;
  logoWhiteSrc: string;
  blurredBgUrl: string;
  mainPhotoUrl: string;
  /** Moldura para vídeo: slot vazio e blur só fora do retângulo da foto. */
  photoSlot?: FolderPhotoSlotMode;
  developmentName: string;
  locationLine: string;
  sealBannerText: string;
  highlightBedrooms: number;
  showLeisure: boolean;
  highlightGarage: number;
  phone: FolderPhoneDisplay;
};

export function ApprovedFolderLayout(props: ApprovedFolderLayoutProps) {
  const m = METRICS[props.variant];
  const photoSlot = props.photoSlot ?? "image";
  const blurStrips =
    photoSlot === "transparent"
      ? getFolderVideoBlurStripHeights(props.variant)
      : null;
  const seal = props.sealBannerText.trim().toUpperCase();
  const local = props.locationLine.trim();
  const header = fitFolderHeaderBlock({
    developmentName: props.developmentName,
    sealBannerText: seal,
    locationLine: local,
    variant: props.variant,
  });
  const titleLayout = header.title;
  const facts = buildHighlightFacts(
    props.highlightBedrooms,
    props.showLeisure,
    props.highlightGarage,
    m
  );

  const barStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 34,
    padding: "10px 56px 4px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  };

  return (
    <div
      style={{
        display: "flex",
        width: m.width,
        height: m.height,
        position: "relative",
        fontFamily: "Montserrat",
        backgroundColor: photoSlot === "transparent" ? "transparent" : WHITE,
      }}
    >
      {blurStrips ? (
        <>
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: 0,
              top: 0,
              width: m.width,
              height: blurStrips.topHeight,
              overflow: "hidden",
            }}
          >
            <img
              src={props.blurredBgUrl}
              width={m.width}
              height={m.height}
              style={{ position: "absolute", left: 0, top: 0 }}
              alt=""
            />
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: 0,
              top: blurStrips.bottomTop,
              width: m.width,
              height: blurStrips.bottomHeight,
              overflow: "hidden",
            }}
          >
            <img
              src={props.blurredBgUrl}
              width={m.width}
              height={m.height}
              style={{
                position: "absolute",
                left: 0,
                top: -blurStrips.bottomTop,
              }}
              alt=""
            />
          </div>
        </>
      ) : (
        <img
          src={props.blurredBgUrl}
          width={m.width}
          height={m.height}
          style={{ position: "absolute", left: 0, top: 0 }}
          alt=""
        />
      )}
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 0,
          top: 0,
          width: m.width,
          height: m.whiteVeilHeight,
          backgroundColor: "rgba(255,255,255,0.80)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 0,
          top: m.greenVeilTop,
          width: m.width,
          height: m.greenVeilHeight,
          backgroundColor: "rgba(20,80,42,0.92)",
        }}
      />

      <img
        src={props.logoSrc}
        width={m.logoW}
        height={m.logoH}
        style={{ position: "absolute", left: m.logoLeft, top: m.logoTop }}
        alt=""
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: 0,
          top: m.headerZoneTop,
          width: m.width,
          height: m.headerZoneHeight,
          gap: header.stackGap,
        }}
      >
        {seal ? (
          <div
            style={{
              display: "flex",
              fontSize: header.sealFontSize,
              fontWeight: 700,
              color: GREEN_DEEP,
              letterSpacing: header.sealLetterSpacing,
              lineHeight: 1.1,
            }}
          >
            {seal}
          </div>
        ) : null}
        <div style={barStyle}>
          {titleLayout.lines.map((line, i) => (
            <div
              key={`title-${i}`}
              style={{
                display: "flex",
                fontFamily: "Bebas",
                fontSize: titleLayout.fontSize,
                color: WHITE,
                letterSpacing: 2,
                lineHeight: 1,
                marginTop: i === 0 ? 0 : 2,
              }}
            >
              {line}
            </div>
          ))}
        </div>
        {local ? (
          <div
            style={{
              display: "flex",
              fontSize: header.localFontSize,
              fontWeight: 700,
              color: GREEN_DEEP,
              letterSpacing: header.localLetterSpacing,
              lineHeight: 1.1,
            }}
          >
            {local}
          </div>
        ) : null}
      </div>

      {photoSlot === "image" ? (
        <img
          src={props.mainPhotoUrl}
          width={m.width}
          height={m.photoHeight}
          style={{ position: "absolute", left: 0, top: m.photoTop }}
          alt=""
        />
      ) : null}

      {facts.length > 0 ? (
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 0,
            top: m.factsTop,
            width: m.width,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {facts.map((fact, index) => (
            <div
              key={fact.key}
              style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
            >
              {index > 0 ? (
                <div
                  style={{
                    display: "flex",
                    width: 2,
                    height: m.factDividerH,
                    backgroundColor: GOLD,
                    opacity: 0.5,
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                />
              ) : null}
              <Fact icon={fact.icon} big={fact.big} small={fact.small} m={m} />
            </div>
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 0,
          top: m.contactTop,
          width: m.width,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: m.contactLabelSize, color: WHITE }}>
          informações
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
          <WhatsIcon size={m.whatsIconSize} />
          <div
            style={{
              display: "flex",
              fontFamily: "Bebas",
              fontSize: m.whatsDddSize,
              color: WHITE,
              margin: "0 10px 0 18px",
              alignSelf: "flex-start",
              marginTop: 4,
            }}
          >
            {props.phone.ddd}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Bebas",
              fontSize: m.whatsNumberSize,
              color: WHITE,
              lineHeight: 1,
              letterSpacing: 2,
            }}
          >
            {props.phone.numberLine}
          </div>
        </div>
      </div>

      <img
        src={props.logoWhiteSrc}
        width={m.logoWhiteW}
        height={m.logoWhiteH}
        style={{
          position: "absolute",
          left: m.logoWhiteLeft,
          top: m.logoWhiteTop,
          opacity: 0.95,
        }}
        alt=""
      />
    </div>
  );
}
