import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClienteContactHistory from "../ClienteContactHistory";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        { id: 1, tipo: "ligação", descricao: "Contato teste", data: new Date().toISOString() },
      ]),
  })
);

describe("ClienteContactHistory", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("deve renderizar contatos e permitir adicionar novo contato", async () => {
    render(<ClienteContactHistory clienteId={1} />);

    expect(screen.getByText(/Histórico de Contatos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Contato teste/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Tipo de contato/i), {
      target: { value: "email" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Descrição/i), {
      target: { value: "Novo contato" },
    });

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 2,
            tipo: "email",
            descricao: "Novo contato",
            data: new Date().toISOString(),
          }),
      })
    );

    fireEvent.click(screen.getByText(/Adicionar Contato/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
