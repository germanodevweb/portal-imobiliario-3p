import type { CSSProperties } from "react";
import { FOLDER_SEAL_LINES } from "@/lib/folder/suggest-seal";
import { fitFontSize, truncateEnd } from "@/lib/folder/fit-text";
import {
  FolderHighlightIcon,
  FolderNearbyIcon,
  greenCircleIconWrap,
  IconBed,
  IconMapPin,
} from "@/lib/folder/folder-icons";
import type { PropertyFolderVerticalPayload } from "@/lib/folder/types";

const W = 1080;
const H = 1920;
const GREEN = "#1F4D2E";
const CREAM = "#F5EFE3";
const GOLD = "#C9A36A";
const GOLD_LIGHT = "#E8D4B0";

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

export function PropertyFolderVerticalLayout(props: VerticalLayoutProps) {
  const nameSize = fitFontSize(
    props.developmentName,
    [
      { maxLen: 22, size: 44 },
      { maxLen: 32, size: 38 },
      { maxLen: 42, size: 32 },
    ],
    28
  );
  const name = truncateEnd(props.developmentName, 48);
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
  const bedroomLabel =
    props.bedrooms >= 4 ? "4+" : String(Math.max(0, props.bedrooms));

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
            <path d="M0 0 H420 V300 Q520 380 1080 260 V0 Z" fill={CREAM} />
            <path
              d="M0 1180 H720 Q860 1220 1080 1160 V1920 H0 Z"
              fill={CREAM}
            />
            <path d="M0 1780 Q540 1720 1080 1760 V1920 H0 Z" fill={GREEN} />
          </g>
        </svg>
      </div>

      <div
        style={{
          ...flexCol,
          paddingTop: 260,
          paddingBottom: 320,
          paddingLeft: 36,
          paddingRight: 36,
        }}
      >
        <div style={{ ...flexRow, justifyContent: "space-between" }}>
          <div style={{ ...flexCol, width: 380 }}>
            <img src={props.logoSrc} width={140} height={48} alt="" />
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 13,
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
                color: GREEN,
              }}
            >
              CRECI 1317J
            </div>
          </div>

          <div style={{ ...flexCol, alignItems: "flex-end", width: 580 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Playfair",
                fontSize: nameSize,
                fontWeight: 700,
                color: "#FFFFFF",
                textAlign: "right",
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            {subtitle ? (
              <div
                style={{
                  ...flexRow,
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <GoldLine width={36} />
                <div
                  style={{
                    display: "flex",
                    marginLeft: 10,
                    marginRight: 10,
                    fontSize: subtitleSize,
                    fontWeight: 700,
                    color: GOLD,
                    letterSpacing: 3,
                  }}
                >
                  {truncateEnd(subtitle, 40)}
                </div>
                <GoldLine width={36} />
              </div>
            ) : null}
            <div
              style={{
                ...flexRow,
                alignItems: "center",
                marginTop: 12,
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
                {truncateEnd(props.neighborhood, 32)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...flexRow, marginTop: 36 }}>
          <div
            style={{
              display: "flex",
              width: 520,
              height: 780,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            }}
          >
            <img
              src={props.framedPhotoUrls[0]}
              width={520}
              height={780}
              alt=""
            />
          </div>
          <div style={{ ...flexCol, marginLeft: 20, width: 460 }}>
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
                width={440}
                height={320}
                alt=""
              />
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                transform: "rotate(2deg)",
                backgroundColor: "#FFFFFF",
                padding: 10,
                borderRadius: 10,
                boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
              }}
            >
              <img
                src={props.framedPhotoUrls[2]}
                width={440}
                height={320}
                alt=""
              />
            </div>
          </div>
        </div>

        <div style={{ ...flexRow, marginTop: 28 }}>
          <div style={{ ...flexCol, width: 620 }}>
            <div style={{ ...flexRow, alignItems: "flex-start" }}>
              <div style={{ display: "flex" }}>
                <IconMapPin size={22} color={GREEN} />
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: 10,
                  fontSize: fitFontSize(
                    props.locationText,
                    [
                      { maxLen: 80, size: 16 },
                      { maxLen: 120, size: 14 },
                    ],
                    12
                  ),
                  color: GREEN,
                  lineHeight: 1.35,
                  maxWidth: 560,
                }}
              >
                {props.locationText}
              </div>
            </div>
            {props.nearbyPoints.length > 0 ? (
              <div style={{ ...flexCol, marginTop: 16 }}>
                {props.nearbyPoints.slice(0, 6).map((point, idx) => (
                  <div
                    key={`${point.iconId}-${idx}`}
                    style={{
                      ...flexRow,
                      alignItems: "center",
                      marginTop: idx === 0 ? 0 : 12,
                    }}
                  >
                    <div style={greenCircleIconWrap}>
                      <FolderNearbyIcon iconId={point.iconId} size={18} color="#FFFFFF" />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        marginLeft: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: GREEN,
                      }}
                    >
                      {truncateEnd(point.label, 28)}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ ...flexCol, marginLeft: 24, width: 360 }}>
            <div style={{ ...flexRow, alignItems: "center" }}>
              <div style={{ display: "flex" }}>
                <IconBed size={28} color={GREEN} />
              </div>
              <div style={{ ...flexCol, marginLeft: 10 }}>
                <div style={{ display: "flex", fontSize: 13, color: GREEN }}>
                  Unidade de
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 36,
                    fontWeight: 700,
                    color: GREEN,
                  }}
                >
                  {bedroomLabel} QUARTOS
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 4,
                    height: 3,
                    width: 120,
                    backgroundColor: GOLD,
                  }}
                />
              </div>
            </div>
            {props.highlights.map((h, idx) => (
              <div
                key={`${h.iconId}-${idx}`}
                style={{ ...flexCol, marginTop: idx === 0 ? 14 : 12 }}
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
                      width: 280,
                      backgroundColor: GOLD,
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...flexRow, marginTop: 20 }}>
          <div
            style={{
              ...flexCol,
              alignItems: "center",
              justifyContent: "center",
              width: 340,
              minHeight: 120,
              paddingTop: 16,
              paddingBottom: 16,
              backgroundColor: GREEN,
              borderRadius: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Kaushan",
                fontSize: 26,
                color: "#FFFFFF",
              }}
            >
              {seal.line1}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 4,
                fontFamily: "Kaushan",
                fontSize: 38,
                color: GOLD,
              }}
            >
              {seal.line2}
            </div>
          </div>
        </div>

        <div style={{ ...flexCol, alignItems: "center", marginTop: 24 }}>
          <div style={{ ...flexRow, alignItems: "center" }}>
            <GoldLine width={80} />
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
            <GoldLine width={80} />
          </div>
          {props.showWhatsApp ? (
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 14,
                fontWeight: 600,
                color: CREAM,
              }}
            >
              WhatsApp (85) 98937-9295
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
