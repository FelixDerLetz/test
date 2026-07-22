export type ContentKind =
  | "url"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms"
  | "geo"
  | "text";

export interface WifiInfo {
  ssid: string;
  password?: string;
  encryption?: string;
}

export interface VCardInfo {
  name?: string;
  phone?: string;
  email?: string;
  org?: string;
}

export interface DetectedContent {
  kind: ContentKind;
  raw: string;
  wifi?: WifiInfo;
  vcard?: VCardInfo;
  email?: string;
  phone?: string;
  smsBody?: string;
  geo?: { lat: string; lng: string };
}

/**
 * Analysiert den rohen Scan-Wert und erkennt bekannte Formate,
 * um dem Nutzer direkt die richtige Aktion anzubieten (statt nur Rohtext).
 */
export function detectContent(value: string): DetectedContent {
  const trimmed = value.trim();

  // WLAN-QR-Code, Format: WIFI:T:WPA;S:MeinNetz;P:MeinPasswort;;
  if (/^WIFI:/i.test(trimmed)) {
    const get = (key: string) => {
      const match = trimmed.match(new RegExp(`${key}:([^;]*)`, "i"));
      return match ? match[1] : undefined;
    };
    return {
      kind: "wifi",
      raw: trimmed,
      wifi: {
        ssid: get("S") ?? "",
        password: get("P"),
        encryption: get("T"),
      },
    };
  }

  // vCard, Format: BEGIN:VCARD ... FN:Name ... TEL:... EMAIL:... END:VCARD
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    const nameMatch = trimmed.match(/FN:(.*)/i);
    const telMatch = trimmed.match(/TEL[^:]*:(.*)/i);
    const emailMatch = trimmed.match(/EMAIL[^:]*:(.*)/i);
    const orgMatch = trimmed.match(/ORG:(.*)/i);
    return {
      kind: "vcard",
      raw: trimmed,
      vcard: {
        name: nameMatch?.[1]?.trim(),
        phone: telMatch?.[1]?.trim(),
        email: emailMatch?.[1]?.trim(),
        org: orgMatch?.[1]?.trim(),
      },
    };
  }

  // Geo-Standort, Format: geo:52.5200,13.4050
  const geoMatch = trimmed.match(/^geo:(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (geoMatch) {
    return {
      kind: "geo",
      raw: trimmed,
      geo: { lat: geoMatch[1], lng: geoMatch[2] },
    };
  }

  // SMS, Format: SMSTO:+491234:Nachrichtentext  oder sms:+491234
  const smsMatch = trimmed.match(/^SMSTO:([^:]*):?(.*)$/i);
  if (smsMatch) {
    return {
      kind: "sms",
      raw: trimmed,
      phone: smsMatch[1],
      smsBody: smsMatch[2],
    };
  }

  // E-Mail, Format: mailto:... oder reine E-Mail-Adresse
  if (/^mailto:/i.test(trimmed)) {
    return { kind: "email", raw: trimmed, email: trimmed.replace(/^mailto:/i, "") };
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { kind: "email", raw: trimmed, email: trimmed };
  }

  // Telefonnummer, Format: tel:+491234 oder reine Nummer
  if (/^tel:/i.test(trimmed)) {
    return { kind: "phone", raw: trimmed, phone: trimmed.replace(/^tel:/i, "") };
  }
  if (/^\+?[0-9\s\-()]{6,}$/.test(trimmed)) {
    return { kind: "phone", raw: trimmed, phone: trimmed };
  }

  // URL
  if (/^https?:\/\//i.test(trimmed)) {
    return { kind: "url", raw: trimmed };
  }

  return { kind: "text", raw: trimmed };
}

export function contentKindLabel(kind: ContentKind): string {
  switch (kind) {
    case "url":
      return "Link";
    case "wifi":
      return "WLAN-Zugang";
    case "vcard":
      return "Kontakt";
    case "email":
      return "E-Mail";
    case "phone":
      return "Telefonnummer";
    case "sms":
      return "SMS";
    case "geo":
      return "Standort";
    default:
      return "Text";
  }
}
