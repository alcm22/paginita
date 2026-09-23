import { describe, expect, it } from "vitest";
import { classNames } from "../../lib/utils";

describe("classNames", () => {
  it("combina únicamente los valores de clase definidos", () => {
    expect(classNames("base", false, "active", undefined)).toBe("base active");
  });
});
