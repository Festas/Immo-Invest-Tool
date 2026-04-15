/**
 * AfA (depreciation) rates according to German tax law (§ 7 EStG)
 */

import type { AfAType } from "@/types";

export const AfARates: Record<AfAType, { rate: number; label: string }> = {
  ALTBAU_VOR_1925: { rate: 2.5, label: "Altbau vor 1925 (2,5%)" },
  ALTBAU_AB_1925: { rate: 2.0, label: "Altbau ab 1925 (2%)" },
  NEUBAU_AB_2023: { rate: 3.0, label: "Neubau ab 2023 (3%)" },
  DENKMALSCHUTZ: { rate: 9.0, label: "Denkmalschutz (9%)" },
};
