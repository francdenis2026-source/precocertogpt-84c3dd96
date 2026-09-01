// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeroUserImage2026 } from "../components/home/HeroUserImage2026";
import { buildCatalog } from "../data/catalog";

afterEach(cleanup);

describe("Busca de produtos na homepage", () => {
  it("exibe sugestões com produto, estabelecimento e preço", () => {
    const catalog = buildCatalog();

    render(
      <MemoryRouter>
        <HeroUserImage2026 products={catalog.products} />
      </MemoryRouter>,
    );

    const input = screen.getByRole("combobox", { name: "Produto para comparar" });
    expect(input.id).toBe("price-search");

    fireEvent.change(input, { target: { value: "arroz" } });

    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
    expect(input.closest(".pc26-live-search")?.classList.contains("is-open")).toBe(true);
    expect(options[0].textContent).toContain("Arroz");
    expect(options[0].textContent).toContain("Central Super");
    expect(options[0].textContent).toContain("R$");
    expect(options[0].querySelector("em")?.getAttribute("style")).toContain("--pc26-store-accent");
  });
});
