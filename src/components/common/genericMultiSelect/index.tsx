import React, { useEffect, useState } from "react";

interface ItemGenerico {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface GenericMultiSelectProps<T extends ItemGenerico> {
  selecionados: T[];
  setSelecionados: (itens: T[]) => void;
  labelRender: (item: T) => string;
  placeholder?: string;
  onBuscar: (termo: string) => Promise<T[]>; // ← função que faz a busca no backend
}

function GenericMultiSelect<T extends ItemGenerico>({
  selecionados,
  setSelecionados,
  labelRender,
  onBuscar,
  placeholder = "Digite para buscar...",
}: GenericMultiSelectProps<T>) {
  const [termoBusca, setTermoBusca] = useState("");
  const [sugestoes, setSugestoes] = useState<T[]>([]);

  useEffect(() => {
    const buscar = async () => {
      if (termoBusca.length >= 1) {
        const resultados = await onBuscar(termoBusca);
        setSugestoes(resultados.filter(r => !selecionados.some(s => s.id === r.id)));
      } else {
        setSugestoes([]);
      }
    };
    buscar();
  }, [termoBusca, onBuscar, selecionados]);

  const adicionarItem = (item: T) => {
    if (!selecionados.some((s) => s.id === item.id)) {
      setSelecionados([...selecionados, item]);
    }
    setTermoBusca("");
  };

  const removerItem = (id: string) => {
    setSelecionados(selecionados.filter((i) => i.id !== id));
  };

  const filtrados = sugestoes;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
        {selecionados.map((item) => (
          <span
            key={item.id}
            style={{
              background: "#f4f4f4",
              padding: "4px 8px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {labelRender(item)}
            <button
              type="button"
              onClick={() => removerItem(item.id)}
              style={{
                marginLeft: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        className="input"
        placeholder={placeholder}
        value={termoBusca}
        onChange={(e) => setTermoBusca(e.target.value)}
        autoComplete="off"
      />

      {termoBusca && filtrados.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "8px",
            border: "1px solid #ddd",
            background: "#fff",
            maxHeight: "150px",
            overflowY: "auto",
          }}
        >
          {filtrados.map((item) => (
            <li
              key={item.id}
              onClick={() => adicionarItem(item)}
              style={{ padding: "4px", cursor: "pointer" }}
            >
              {labelRender(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GenericMultiSelect;