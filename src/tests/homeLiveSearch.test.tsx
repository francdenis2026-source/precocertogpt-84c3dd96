// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeroUserImage2026 } from "../components/home/HeroUserImage2026";
import { buildCatalog } from "../data/catalog";
import { FavoritesProvider } from "../features/favorites/FavoritesProvider";

afterEach(cleanup);

describe("Busca de produtos na homepage", () => {
  it("exibe sugestões com produto, estabelecimento e preço", () => {
    const catalog = buildCatalog();

    render(
      <MemoryRouter>
        <FavoritesProvider>
        <HeroUserImage2026 products={catalog.products} />
        </FavoritesProvider>
      </MemoryRouter>,
    );

    const input = screen.getByRole("combobox", { name: "Produto para comparar" });
    expect(input.id).toBe("price-search");
    const expectedProduct = catalog.products[0];

    fireEvent.change(input, { target: { value: expectedProduct.name } });

    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
    expect(input.closest(".pc26-live-search")?.classList.contains("is-open")).toBe(true);
    expect(options[0].textContent).toContain(expectedProduct.name);
    expect(options[0].textContent).toContain(expectedProduct.establishment);
    expect(options[0].textContent).toContain("R$");
    expect(options[0].querySelector("em")?.getAttribute("style")).toContain("--pc26-store-accent");
  });

  it("mantém os resultados abertos até o usuário clicar em fechar", () => {
    const catalog = buildCatalog();

    render(
      <MemoryRouter>
        <FavoritesProvider>
        <div data-testid="outside">Área externa</div>
        <HeroUserImage2026 products={catalog.products} />
        </FavoritesProvider>
      </MemoryRouter>,
    );

    const input = screen.getByRole("combobox", { name: "Produto para comparar" });
    fireEvent.change(input, { target: { value: catalog.products[0].name } });
    fireEvent.pointerDown(screen.getByTestId("outside"));
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.getByRole("listbox", { name: "Sugestões de produtos" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Fechar resultados da busca" }));
    expect(screen.queryByRole("listbox", { name: "Sugestões de produtos" })).toBeNull();
  });
});
