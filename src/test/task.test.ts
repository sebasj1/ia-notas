import { describe, it, expect } from "vitest";
import { isValidTaskTitle } from "../lib/taskValidation";

describe("Validación de tareas", () => {
  it("acepta un título válido", () => {
    expect(isValidTaskTitle("Estudiar React")).toBe(true);
  });

  it("rechaza un título vacío", () => {
    expect(isValidTaskTitle("")).toBe(false);
  });

  it("rechaza un título con solo espacios", () => {
    expect(isValidTaskTitle("   ")).toBe(false);
  });
});
