// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { StoreRail } from "../components/home/StoreRail";
afterEach(cleanup);
it("never gives loading placeholders the photographic hero overlay class", () => {
  const { container } = render(<MemoryRouter><StoreRail stores={[]} cycle={0} loading /></MemoryRouter>);
  expect(container.querySelector(".pcx-store-placeholder")).not.toBeNull();
  expect(container.querySelector(".pcx-store-hero")).toBeNull();
});
