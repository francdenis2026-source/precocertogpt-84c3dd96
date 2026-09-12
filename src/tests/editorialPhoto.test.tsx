// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { EditorialPhoto } from "../components/EditorialPhoto";
afterEach(cleanup);
it("uses responsive, dimensioned images and labels generated photography", () => {
  const { container, getByText } = render(<EditorialPhoto scene="receipt" priority />);
  const img = container.querySelector("img")!;
  expect(img.getAttribute("srcset")).toContain("640w");
  expect(img.getAttribute("width")).toBe("1536");
  expect(img.getAttribute("loading")).toBe("eager");
  expect(getByText("Imagem ilustrativa gerada por IA")).toBeTruthy();
});
