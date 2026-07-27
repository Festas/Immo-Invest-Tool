/**
 * URL sharing utilities.
 *
 * Encodes the currently opened property input into a compact, URL-safe string
 * so that a calculation can be shared with others simply by copying the URL.
 * There is no server or account involved – everything the recipient needs is
 * contained in the link itself.
 */

import { PropertyInput } from "@/types";
import { getDefaultPropertyInput } from "@/lib/calculations";

/** Query parameter that carries the encoded property input. */
export const SHARE_PARAM = "d";

/** Maximum accepted length for string values to avoid abuse via crafted URLs. */
const MAX_STRING_LENGTH = 64;

type FieldType = "number" | "boolean" | "string";

/**
 * Whitelist of the fields that may be encoded into / decoded from the URL,
 * together with their expected primitive type. Only these keys are ever read
 * from an incoming URL, which prevents prototype pollution and injection of
 * unexpected properties.
 */
const FIELD_SCHEMA: Record<keyof PropertyInput, FieldType> = {
  purchasePrice: "number",
  brokerPercent: "number",
  notaryPercent: "number",
  propertyTransferTaxPercent: "number",
  renovationCosts: "number",
  isFamilyPurchase: "boolean",
  marketValue: "number",
  bundesland: "string",
  equity: "number",
  loanAmount: "number",
  interestRate: "number",
  repaymentRate: "number",
  fixedInterestPeriod: "number",
  coldRentActual: "number",
  coldRentTarget: "number",
  nonRecoverableCosts: "number",
  maintenanceReserve: "number",
  vacancyRiskPercent: "number",
  personalTaxRate: "number",
  buildingSharePercent: "number",
  afaType: "string",
  movableAssetsValue: "number",
  movableAssetsDepreciationYears: "number",
  expectedAppreciationPercent: "number",
  expectedRentIncreasePercent: "number",
};

const SHARE_KEYS = Object.keys(FIELD_SCHEMA) as (keyof PropertyInput)[];

/** Encode a UTF-8 string to a URL-safe base64 representation. */
function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode a URL-safe base64 representation back to a UTF-8 string. */
function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Encode a property input into a compact, URL-safe string.
 */
export function encodeInput(input: PropertyInput): string {
  const payload: Record<string, unknown> = {};
  for (const key of SHARE_KEYS) {
    const value = input[key];
    if (value !== undefined) {
      payload[key] = value;
    }
  }
  return toBase64Url(JSON.stringify(payload));
}

/**
 * Decode a shared string back into a complete, validated PropertyInput.
 *
 * Unknown keys are ignored and each known value is type-checked against the
 * schema. Returns null when the input cannot be decoded at all.
 */
export function decodeInput(encoded: string): PropertyInput | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const source = parsed as Record<string, unknown>;
  const result: PropertyInput = getDefaultPropertyInput();

  for (const key of SHARE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const value = source[key];
    const expected = FIELD_SCHEMA[key];

    if (expected === "number") {
      if (typeof value === "number" && Number.isFinite(value)) {
        (result[key] as number) = value;
      }
    } else if (expected === "boolean") {
      if (typeof value === "boolean") {
        (result[key] as boolean) = value;
      }
    } else if (expected === "string") {
      if (typeof value === "string" && value.length <= MAX_STRING_LENGTH) {
        (result[key] as string) = value;
      }
    }
  }

  return result;
}

/**
 * Build a shareable absolute URL for the given property input, based on the
 * current page location.
 */
export function buildShareUrl(input: PropertyInput): string {
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_PARAM, encodeInput(input));
  return url.toString();
}

/**
 * Read and decode a shared property input from the current URL, if present.
 */
export function readSharedInputFromUrl(): PropertyInput | null {
  if (typeof window === "undefined") return null;
  const encoded = new URLSearchParams(window.location.search).get(SHARE_PARAM);
  if (!encoded) return null;
  return decodeInput(encoded);
}
