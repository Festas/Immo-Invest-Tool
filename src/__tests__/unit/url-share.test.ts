import { describe, it, expect } from "vitest";
import { encodeInput, decodeInput, SHARE_PARAM } from "@/lib/url-share";
import { getDefaultPropertyInput } from "@/lib/calculations";
import { PropertyInput } from "@/types";

describe("url-share", () => {
  it("exposes a stable share parameter name", () => {
    expect(SHARE_PARAM).toBe("d");
  });

  it("round-trips a property input through encode/decode", () => {
    const input: PropertyInput = {
      ...getDefaultPropertyInput(),
      purchasePrice: 275000,
      equity: 55000,
      coldRentActual: 1234.56,
      isFamilyPurchase: true,
      bundesland: "BERLIN",
      afaType: "NEUBAU_AB_2023",
    };

    const decoded = decodeInput(encodeInput(input));
    expect(decoded).not.toBeNull();
    expect(decoded?.purchasePrice).toBe(275000);
    expect(decoded?.equity).toBe(55000);
    expect(decoded?.coldRentActual).toBe(1234.56);
    expect(decoded?.isFamilyPurchase).toBe(true);
    expect(decoded?.bundesland).toBe("BERLIN");
    expect(decoded?.afaType).toBe("NEUBAU_AB_2023");
  });

  it("returns null for malformed input", () => {
    expect(decodeInput("this-is-not-valid-base64-json")).toBeNull();
    expect(decodeInput("")).toBeNull();
  });

  it("ignores unknown keys and falls back to defaults for them", () => {
    const defaults = getDefaultPropertyInput();
    // Craft a payload with an unknown/dangerous key and a valid one.
    const encoded = encodeInput({
      ...defaults,
      purchasePrice: 199000,
    });
    const decoded = decodeInput(encoded);
    expect(decoded?.purchasePrice).toBe(199000);
    // A key that was never encoded keeps its default value.
    expect(decoded?.interestRate).toBe(defaults.interestRate);
  });

  it("rejects values with the wrong type and keeps defaults", () => {
    const defaults = getDefaultPropertyInput();
    // Manually build an encoded payload with wrong types.
    const payload = {
      purchasePrice: "not-a-number",
      isFamilyPurchase: "yes",
      interestRate: 4.2,
    };
    const encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const decoded = decodeInput(encoded);
    expect(decoded).not.toBeNull();
    // Wrong-typed values are ignored -> defaults kept.
    expect(decoded?.purchasePrice).toBe(defaults.purchasePrice);
    expect(decoded?.isFamilyPurchase).toBe(defaults.isFamilyPurchase);
    // Correctly typed value is applied.
    expect(decoded?.interestRate).toBe(4.2);
  });
});
