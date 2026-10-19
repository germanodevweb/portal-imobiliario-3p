import type { CSSProperties, ReactNode } from "react";
import { FOLDER_SEAL_LINES } from "@/lib/folder/suggest-seal";
import { fitDevelopmentTitleTwoLines } from "@/lib/folder/fit-title-two-lines";
import { fitFontSize, truncateEnd } from "@/lib/folder/fit-text";
import { sanitizeNeighborhoodLabel } from "@/lib/folder/sanitize-neighborhood";
import {
  FolderHighlightIcon,
  FolderNearbyIcon,
  IconBed,
  IconMapPin,
} from "@/lib/folder/folder-icons";
import type { FolderNearbyPoint, PropertyFolderVerticalPayload } from "@/lib/folder/types";

const W = 1080;
const H = 1920;
const GREEN = "#1F4D2E";
const CREAM = "#F5EFE3";
const GOLD = "#C9A36A";
const GOLD_LIGHT = "#E8D4B0";
const TOP_SAFE = 250;
const FOOTER_H = 300;
const NEARBY_CIRCLE = 110;

export type VerticalLayoutProps = PropertyFolderVerticalPayload & {
  logoSrc: string;
  framedPhotoUrls: [string, string, string];
};

const flexRow: CSSProperties = {
  display: "flex",
  flexDirection: "row",
};

const flexCol: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

function GoldLine({ width }: { width: number }) {
  return (
    <div
      style={{
        display: "flex",
        height: 1,
        width,
        backgroundColor: GOLD,
      }}
    />
  );
}

function NearbyGrid({ points }: { points: FolderNearbyPoint[] }) {
  const items = points.slice(0, 6);
  if (items.length === 0) return null;

  const row1 = items.slice(0, 3);
  const row2 = items.slice(3, 6);

  const renderRow = (
    row: FolderNearbyPoint[],
    countInRow: number,
    rowIndex: number
  ) => {
    const sidePad =
      countInRow === 1 ? 200 : countInRow === 2 ? 90 : 0;
    return (
      <div
        style={{
          ...flexRow,
          justifyContent: "center",
          marginTop: rowIndex === 0 ? 0 : 16,
          paddingLeft: sidePad,
          paddingRight: sidePad,
        }}
      >
        {row.map((point, idx) => (
          <div
            key={`${point.iconId}-${idx}`}
            style={{
              ...flexCol,
              alignItems: "center",
              width: 200,
              marginLeft: idx === 0 ? 0 : 8,
              marginRight: idx === row.length - 1 ? 0 : 8,
            }}
          >
            <div
              style={{
                display: "flex",
                width: NEARBY_CIRCLE,
                height: NEARBY_CIRCLE,
                borderRadius: NEARBY_CIRCLE / 2,
                backgroundColor: GREEN,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderNearbyIcon iconId={point.iconId} size={42} color="#FFFFFF" />
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 11,
                fontWeight: 600,
                color: GREEN,
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: 170,
              }}
            >
              {truncateEnd(point.label, 28)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ ...flexCol, marginTop: 20 }}>
      {renderRow(row1, row1.length, 0)}
      {row2.length > 0 ? renderRow(row2, row2.length, 1) : null}
    </div>
  );
}

function LocationBlock({
  locationText,
  neighborhood,
}: {
  locationText: string;
  neighborhood: string;
}) {
  const bairro = sanitizeNeighborhoodLabel(neighborhood);
  const fontSize = fitFontSize(
    locationText,
    [
      { maxLen: 100, size: 16 },
      { maxLen: 180, size: 14 },
      { maxLen: 260, size: 13 },
    ],
    12
  );

  let content: ReactNode = locationText;
  if (bairro && locationText.toLowerCase().includes(bairro.toLowerCase())) {
    const idx = locationText.toLowerCase().indexOf(bairro.toLowerCase());
    const before = locationText.slice(0, idx);
    const match = locationText.slice(idx, idx + bairro.length);
    const after = locationText.slice(idx + bairro.length);
    content = (
      <div style={{ ...flexRow, flexWrap: "wrap", maxWidth: 560 }}>
        {before ? (
          <div style={{ display: "flex", fontSize, color: GREEN }}>{before}</div>
        ) : null}
        <div style={{ display: "flex", fontSize, fontWeight: 700, color: GREEN }}>
          {match}
        </div>
        {after ? (
          <div style={{ display: "flex", fontSize, color: GREEN }}>{after}</div>
        ) : null}
      </div>
    );
  } else {
    content = (
      <div
        style={{
          display: "flex",
          fontSize,
          color: GREEN,
          lineHeight: 1.4,
          maxWidth: 560,
        }}
      >
        {locationText}
      </div>
    );
  }

  return (
    <div style={{ ...flexRow, alignItems: "flex-start" }}>
      <div style={{ display: "flex", marginTop: 2 }}>
        <IconMapPin size={24} color={GREEN} />
      </div>
      <div style={{ display: "flex", marginLeft: 10, flex: 1 }}>{content}</div>
    </div>
  );
}

export function PropertyFolderVerticalLayout(props: VerticalLayoutProps) {
  const titleLayout = fitDevelopmentTitleTwoLines(props.developmentName);
  const subtitle = props.subtitle.trim().toUpperCase();
  const subtitleSize = fitFontSize(
    subtitle,
    [
      { maxLen: 24, size: 14 },
      { maxLen: 36, size: 12 },
    ],
    11
  );
  const seal = FOLDER_SEAL_LINES[props.seal];
  const neighborhood = sanitizeNeighborhoodLabel(props.neighborhood);
  const bedroomCount = Math.max(0, props.bedrooms);
  const bedroomNumber = bedroomCount >= 4 ? "4+" : String(bedroomCount);
  const bedroomWord = bedroomCount === 1 ? "QUARTO" : "QUARTOS";

  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: GREEN,
        fontFamily: "Montserrat",
      }}
    >
      {/* Fundo decorativo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: "flex",
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g>
            <path
              d="M0 0 H398 V228 Q458 258 398 318 H0 Z"
              fill={CREAM}
            />
            <path
              d="M0 1230 H710 V1588 Q780 1620 710 1620 H0 Z"
              fill={CREAM}
            />
            <path d="M0 1620 H1080 V1920 H0 Z" fill={GREEN} />
          </g>
        </svg>
      </div>

      {/* Conteúdo principal */}
      <div
        style={{
          ...flexCol,
          marginTop: TOP_SAFE + 8,
          paddingLeft: 32,
          paddingRight: 32,
          flex: 1,
        }}
      >
        {/* Cabeçalho: logo (creme) + título (verde) */}
        <div style={{ ...flexRow, height: 168 }}>
          <div style={{ ...flexCol, width: 390 }}>
            <img src={props.logoSrc} width={380} height={120} alt="" />
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 14,
                fontWeight: 700,
                color: GREEN,
              }}
            >
              Consultoria Imobiliária
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 4,
                fontSize: 12,
                fontWeight: 600,
                color: GREEN,
              }}
            >
              CRECI 1317J
            </div>
          </div>
          <div
            style={{
              ...flexCol,
              flex: 1,
              alignItems: "flex-end",
              marginLeft: 16,
              paddingTop: 4,
            }}
          >
            <div
              style={{
                ...flexCol,
                alignItems: "flex-end",
                maxWidth: 620,
              }}
            >
              {titleLayout.lines.map((line, i) => (
                <div
                  key={`title-line-${i}`}
                  style={{
                    display: "flex",
                    fontFamily: "Playfair",
                    fontSize: titleLayout.fontSize,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    textAlign: "right",
                    lineHeight: 1.08,
                    marginTop: i === 0 ? 0 : 4,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            {subtitle ? (
              <div
                style={{
                  ...flexRow,
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <GoldLine width={32} />
                <div
                  style={{
                    display: "flex",
                    marginLeft: 8,
                    marginRight: 8,
                    fontSize: subtitleSize,
                    fontWeight: 700,
                    color: GOLD,
                    letterSpacing: 3,
                  }}
                >
                  {truncateEnd(subtitle, 40)}
                </div>
                <GoldLine width={32} />
              </div>
            ) : null}
            <div
              style={{
                ...flexRow,
                alignItems: "center",
                marginTop: subtitle ? 10 : 12,
                backgroundColor: GOLD_LIGHT,
                borderRadius: 999,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 16,
                paddingRight: 18,
              }}
            >
              <div style={{ display: "flex" }}>
                <IconMapPin size={18} color={GREEN} strokeWidth={2.5} />
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  color: GREEN,
                }}
              >
                {truncateEnd(neighborhood, 32)}
              </div>
            </div>
          </div>
        </div>

        {/* Fotos */}
        <div style={{ ...flexRow, marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              width: 520,
              height: 700,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            }}
          >
            <img
              src={props.framedPhotoUrls[0]}
              width={520}
              height={700}
              alt=""
            />
          </div>
          <div style={{ ...flexCol, marginLeft: 18, width: 470 }}>
            <div
              style={{
                display: "flex",
                transform: "rotate(-2deg)",
                backgroundColor: "#FFFFFF",
                padding: 10,
                borderRadius: 10,
                boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
              }}
            >
              <img
                src={props.framedPhotoUrls[1]}
                width={450}
                height={300}
                alt=""
              />
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                transform: "rotate(2deg)",
                backgroundColor: "#FFFFFF",
                padding: 10,
                borderRadius: 10,
                boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
              }}
            >
              <img
                src={props.framedPhotoUrls[2]}
                width={450}
                height={300}
                alt=""
              />
            </div>
          </div>
        </div>

        {/* Localização + pontos | quartos + diferenciais */}
        <div style={{ ...flexRow, marginTop: 22, flex: 1 }}>
          <div style={{ ...flexCol, width: 650 }}>
            <LocationBlock
              locationText={props.locationText}
              neighborhood={neighborhood}
            />
            <NearbyGrid points={props.nearbyPoints} />
          </div>

          <div style={{ ...flexCol, marginLeft: 20, width: 350 }}>
            <div style={{ ...flexRow, alignItems: "center" }}>
              <div style={{ display: "flex" }}>
                <IconBed size={30} color={GREEN} />
              </div>
              <div style={{ ...flexCol, marginLeft: 10 }}>
                <div style={{ display: "flex", fontSize: 13, color: GREEN }}>
                  Unidade de
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 700,
                    color: GREEN,
                    letterSpacing: 0.5,
                  }}
                >
                  {bedroomNumber} {bedroomWord}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 4,
                    height: 3,
                    width: 130,
                    backgroundColor: GOLD,
                  }}
                />
              </div>
            </div>
            {props.highlights.map((h, idx) => (
              <div
                key={`${h.iconId}-${idx}`}
                style={{ ...flexCol, marginTop: idx === 0 ? 16 : 12 }}
              >
                <div style={{ ...flexRow, alignItems: "flex-start" }}>
                  <div style={{ display: "flex" }}>
                    <FolderHighlightIcon iconId={h.iconId} size={22} color={GREEN} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginLeft: 10,
                      fontSize: fitFontSize(
                        h.text,
                        [
                          { maxLen: 28, size: 13 },
                          { maxLen: 44, size: 11 },
                        ],
                        10
                      ),
                      fontWeight: 600,
                      color: GREEN,
                      lineHeight: 1.25,
                      maxWidth: 280,
                    }}
                  >
                    {truncateEnd(h.text, 56)}
                  </div>
                </div>
                {idx < props.highlights.length - 1 ? (
                  <div
                    style={{
                      display: "flex",
                      marginTop: 10,
                      height: 1,
                      width: 300,
                      backgroundColor: GOLD,
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selo — pincelada SVG */}
      <div
        style={{
          position: "absolute",
          left: 28,
          bottom: FOOTER_H + 36,
          width: 360,
          height: 150,
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 360,
            height: 150,
          }}
        >
          <svg width={360} height={150} viewBox="0 0 360 150">
            <g>
              <path
                d="M6 78 Q38 32 128 42 T302 36 Q344 52 354 82 Q348 118 296 128 Q188 142 68 128 Q22 118 6 78 Z"
                fill={GREEN}
              />
            </g>
          </svg>
          <div
            style={{
              position: "absolute",
              top: 38,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: "rotate(-4deg)",
            }}
          >
          <div
            style={{
              display: "flex",
              fontFamily: "Kaushan",
              fontSize: 28,
              color: "#FFFFFF",
            }}
          >
            {seal.line1}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 2,
              fontFamily: "Kaushan",
              fontSize: 40,
              color: GOLD,
            }}
          >
            {seal.line2}
          </div>
          </div>
        </div>
      </div>

      {/* Rodapé (conteúdo acima da zona inferior de 300px) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: W,
          height: FOOTER_H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 28,
          backgroundColor: GREEN,
        }}
      >
        <div style={{ ...flexRow, alignItems: "center" }}>
          <GoldLine width={72} />
          <div
            style={{
              display: "flex",
              marginLeft: 14,
              marginRight: 14,
              fontSize: fitFontSize(
                props.footerPhrase,
                [
                  { maxLen: 28, size: 15 },
                  { maxLen: 40, size: 13 },
                ],
                11
              ),
              fontWeight: 700,
              color: CREAM,
              letterSpacing: 3,
              maxWidth: 720,
            }}
          >
            {truncateEnd(props.footerPhrase.toUpperCase(), 48)}
          </div>
          <GoldLine width={72} />
        </div>
        {props.showWhatsApp ? (
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 13,
              fontWeight: 600,
              color: CREAM,
            }}
          >
            Consulte condições: (85) 98937-9295
          </div>
        ) : null}
      </div>
    </div>
  );
}
