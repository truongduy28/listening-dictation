import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "@/components/ui/switch";
import { SliderField } from "@/components/ui/slider-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Modal } from "@/components/ui/modal";

describe("components/ui atomic components", () => {
  it("Switch toggles on click and reflects aria-checked", () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Switch checked={false} onCheckedChange={onCheckedChange} ariaLabel="Test Switch" />
    );

    const switchBtn = screen.getByRole("switch");
    expect(switchBtn.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(switchBtn);
    expect(onCheckedChange).toHaveBeenCalledWith(true);

    rerender(<Switch checked={true} onCheckedChange={onCheckedChange} ariaLabel="Test Switch" />);
    expect(switchBtn.getAttribute("aria-checked")).toBe("true");
  });

  it("SliderField updates value on change", () => {
    const onChange = vi.fn();
    render(
      <SliderField
        label="Volume"
        min={0}
        max={100}
        value={50}
        displayValue="50%"
        onChange={onChange}
      />
    );

    const slider = screen.getByRole("slider");
    expect(slider).toBeDefined();
    fireEvent.change(slider, { target: { value: "80" } });
    expect(onChange).toHaveBeenCalledWith(80);
  });

  it("SegmentedControl renders options and handles click", () => {
    const onChange = vi.fn();
    const options = [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
    ];
    render(
      <SegmentedControl options={options} value="a" onChange={onChange} />
    );

    const btnB = screen.getByText("Option B");
    fireEvent.click(btnB);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("Modal renders when open and closes on ESC", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText("Modal Content")).toBeNull();

    rerender(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText("Modal Content")).toBeDefined();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
