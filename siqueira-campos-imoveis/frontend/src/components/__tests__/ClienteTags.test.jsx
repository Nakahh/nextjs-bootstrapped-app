import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClienteTags from "../ClienteTags";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        { id: 1, nome: "VIP" },
      ]),
  })
);

describe("ClienteTags", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("deve renderizar tags e permitir adicionar nova tag", async () => {
    render(<ClienteTags clienteId={1} />);

    expect(screen.getByText(/Segmentação por Tags/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/VIP/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Nome da tag/i), {
      target: { value: "Novo Tag" },
    });

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 2,
            nome: "Novo Tag",
          }),
      })
    );

    fireEvent.click(screen.getByText(/Adicionar Tag/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
