const API_ORIGIN = (import.meta.env.VITE_SOCKET_URL || "http://localhost:5000").replace(/\/$/, "");

export function getAssetUrl(assetUrl) {
  if (!assetUrl) {
    return "";
  }

  if (assetUrl.startsWith("http://") || assetUrl.startsWith("https://")) {
    return assetUrl;
  }

  return `${API_ORIGIN}${assetUrl}`;
}

export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) {
    return "?";
  }

  return parts.map((part) => part[0].toUpperCase()).join("");
}
