import { describe, expect, it } from "vitest";
import { isValidCpf, isValidEmail } from "../lib/cpf";

describe("cpf/email", () => {
  it("valida CPF pelos dígitos verificadores", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
  it("valida formato de e-mail", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
  });
});
