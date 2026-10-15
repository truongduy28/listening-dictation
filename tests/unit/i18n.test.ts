import { describe, it, expect } from "vitest";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

function extractLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...extractLeafKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n translations & keys parity", () => {
  it("has 100% key parity between vi.json and en.json", () => {
    const viKeys = extractLeafKeys(viMessages).sort();
    const enKeys = extractLeafKeys(enMessages).sort();

    const missingInEn = viKeys.filter((k) => !enKeys.includes(k));
    const missingInVi = enKeys.filter((k) => !viKeys.includes(k));

    expect(missingInEn).toEqual([]);
    expect(missingInVi).toEqual([]);
    expect(viKeys).toEqual(enKeys);
  });

  it("replaces parameters accurately in translations", () => {
    const template = "Đang ở câu {index} trên tổng số {count}";
    const replaced = template
      .replace(/\{index\}/g, "5")
      .replace(/\{count\}/g, "100");
    expect(replaced).toBe("Đang ở câu 5 trên tổng số 100");
  });
});
