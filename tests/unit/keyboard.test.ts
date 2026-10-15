import { describe, it, expect } from "vitest";
import { isEditableElement, getShortcutAction } from "@/lib/keyboard";

describe("lib/keyboard", () => {
  it("detects editable elements properly", () => {
    expect(isEditableElement(null)).toBe(false);

    const input = document.createElement("input");
    expect(isEditableElement(input)).toBe(true);

    const textarea = document.createElement("textarea");
    expect(isEditableElement(textarea)).toBe(true);

    const select = document.createElement("select");
    expect(isEditableElement(select)).toBe(true);

    const div = document.createElement("div");
    expect(isEditableElement(div)).toBe(false);

    div.setAttribute("contenteditable", "true");
    expect(isEditableElement(div)).toBe(true);
  });

  it("maps keyboard events to shortcut actions", () => {
    expect(getShortcutAction(new KeyboardEvent("keydown", { code: "Space" }))).toBe("togglePlay");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "ArrowLeft" }))).toBe("rewind");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "ArrowRight" }))).toBe("forward");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "ArrowUp" }))).toBe("prev");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "ArrowDown" }))).toBe("next");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "[" }))).toBe("speedDown");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "]" }))).toBe("speedUp");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "r" }))).toBe("replay");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "s" }))).toBe("toggleStar");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "m" }))).toBe("toggleMute");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "a" }))).toBe("setA");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "b" }))).toBe("setB");
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "x" }))).toBe("clearAB");
  });

  it("ignores shortcuts when modifier keys are pressed", () => {
    // Cmd+R should NOT trigger replay
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "r", metaKey: true }))).toBeNull();
    // Ctrl+S should NOT trigger toggleStar
    expect(getShortcutAction(new KeyboardEvent("keydown", { key: "s", ctrlKey: true }))).toBeNull();
  });
});
