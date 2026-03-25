import React from "react";
import "./AssetCard.css";

const pick = (obj, keys, fallback = "—") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
};

const pretty = (s) =>
  String(s || "")
    .replace(/[\s-]+/g, "_")
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const normalizeType = (t) =>
  String(t || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

/** ✅ Map asset type -> EXACT filename in /public/vehicle-icons/ */
const typeToIconFile = (type) => {
  const t = normalizeType(type);

  // ===== matches your downloaded filenames exactly =====
  if (t.includes("concrete_plant") || t === "plant") return "concrete plant.png";
  if (t.includes("tower_crane") || t.includes("towercrane")) return "towercrane.png";
  if (t.includes("road_roller") || t.includes("roller")) return "road roller.png";
  if (t.includes("wheel_loader") || (t.includes("loader") && !t.includes("backhoe")))
    return "wheelloader.png";
  if (t.includes("concrete_pump") || t.includes("pump")) return "concrete pump.png";

  if (t.includes("backhoe_loader") || t.includes("backhoe")) return "backhoe loader.png";
  if (t.includes("bulldozer")) return "bulldozer.png";
  if (t.includes("compactor")) return "compactor.png";
  if (t.includes("grader")) return "grader.png";
  if (t.includes("paver")) return "paver.jpg";

  if (t.includes("crawler_crane") || t.includes("crawlercrane")) return "crawlercrane.png";
  if (t.includes("mobile_crane") || t.includes("mobilecrane")) return "mobilecrane.png";

  if (t.includes("dump_truck") || t.includes("dumptruck") || t.includes("dump")) return "dumptruck.png";
  if (t.includes("forklift")) return "forklift.png";
  if (t.includes("excavator")) return "excavator.jpg";
  if (t.includes("telehandler")) return "telehandler.jpg";

  // fallback
  return "compactor.png";
};

const Icon = {
  track: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22s7-4.5 7-12a7 7 0 10-14 0c0 7.5 7 12 7 12z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5l4 4L8 20l-5 1 1-5L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 6l1 16h8l1-16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

const AssetCard = ({ asset, onEdit, onDelete, onTrack }) => {
  const status = pick(asset, ["status"], "unknown");
  const type = pick(asset, ["asset_type", "type"], "other");
  const assetId = pick(asset, ["asset_id", "assetId"], "-");

  const fileName = typeToIconFile(type);
  const iconSrc = encodeURI(`/vehicle-icons/${fileName}`); // ✅ spaces safe

  return (
    <div className="asset-card2">
      <div className="asset-header2">
        <div className="asset-left2">
          <div className="asset-iconBox2" aria-hidden="true">
            <img
              className="asset-iconImg2"
              src={iconSrc}
              alt={pretty(type)}
              onError={(e) => {
                e.currentTarget.src = encodeURI("/vehicle-icons/compactor.png");
              }}
            />
          </div>

          <div className="asset-headText2">
            <div className="asset-title2">Asset {assetId}</div>
            <div className="asset-subtitle2">{pretty(type)}</div>
          </div>
        </div>

        <span className="asset-statusChip2">{pretty(status)}</span>
      </div>

      <div className="asset-details2">
        <div><span>Make</span><strong>{pick(asset, ["make"])}</strong></div>
        <div><span>Model</span><strong>{pick(asset, ["model"])}</strong></div>
        <div><span>Year</span><strong>{pick(asset, ["year"])}</strong></div>
        <div><span>License Plate</span><strong>{pick(asset, ["license_plate", "licensePlate"])}</strong></div>
        <div><span>VIN</span><strong>{pick(asset, ["vin"])}</strong></div>
        <div><span>Color</span><strong>{pick(asset, ["color"])}</strong></div>

        {asset?.description ? (
          <div className="full-row2">
            <span>Description</span>
            <strong>{asset.description}</strong>
          </div>
        ) : null}
      </div>

      {/* ✅ same buttons you already have */}
      <div className="asset-actions2">
        {onTrack && (
          <button className="ac-btn ac-btn--primary" onClick={() => onTrack(asset)}>
            {Icon.track} <span>Track</span>
          </button>
        )}
        {onEdit && (
          <button className="ac-btn ac-btn--ghost" onClick={() => onEdit(asset)}>
            {Icon.edit} <span>Edit</span>
          </button>
        )}
        {onDelete && (
          <button className="ac-btn ac-btn--danger" onClick={() => onDelete(asset)}>
            {Icon.trash} <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetCard;