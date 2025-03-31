'use client'
import React, { useCallback, useState } from "react";
import styles from "./GenericList.module.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item<T = any> = {
  id: string;
  data: T;
  children: Child[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Child<T = any> = {   
  data: T;
};

type GenericListProps<TItem, TChild> = {
  items: Item<TItem>[];
  setItems: (items: Item<TItem>[]) => void;
  columns: string[];
  childColumns: string[];
  renderRow: (item: Item<TItem>, index: number, updateItem: (index: number, field: keyof TItem, value: string) => void) => JSX.Element;
  renderChildRow: (
    child: Child<TChild>,
    childIndex: number,
    itemIndex: number,
    updateChild: (itemIndex: number, childIndex: number, field: keyof TChild, value: TChild[keyof TChild] | null) => void,
    updateChildMultiple?: (itemIndex: number, childIndex: number, updates: Partial<TChild>) => void // <- Adicionando o novo prop opcional
  ) => JSX.Element;
  renderActions?: (item: Item<TItem>, index: number, addChild: (index: number) => void, removeItem?: (index: number) => void, removeChild?: (itemIndex: number, childIndex: number) => void) => JSX.Element;
  renderFooter?: (items: Item<TItem>[]) => JSX.Element; // <- Novo prop para rodapé
  enableRemoveItem?: boolean;
  enableRemoveChild?: boolean;
  updateChildMultiple?: (itemIndex: number, childIndex: number, updates: Partial<TChild>) => void; // <- Prop opcional
  enableCollapseChildren?: boolean; // <-- NOVO: Habilita/Desabilita o collapse
};

export default function GenericList<TItem, TChild>({
  items,
  setItems,
  columns,
  childColumns,
  renderRow,
  renderChildRow,
  renderActions,
  renderFooter,
  enableRemoveItem = false,
  enableRemoveChild = false,
  updateChildMultiple, // <- Agora o componente recebe esse prop opcional
  enableCollapseChildren = false, // <-- NOVO: Prop para habilitar ou não o collapse
}: GenericListProps<TItem, TChild>) {

  // Estado para controlar quais itens estão colapsados
  const [collapsedItems, setCollapsedItems] = useState<Record<number, boolean>>({});

  const addItem = () => {
    setItems([
      ...items,
      {
        id: "",
        data: Object.fromEntries(columns.map((col) => [col, ""])) as TItem,
        children: [],
      },
    ]);
  };

  const addChild = (itemIndex: number) => {
    setItems(
      items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              children: [
                ...item.children,
                {
                  data: Object.fromEntries(childColumns.map((col) => [col, ""])) as TChild, // <- Usa as colunas dinâmicas dos filhos
                },
              ],
            }
          : item
      )
    );
  
    // Expandir automaticamente o pai se ele estiver colapsado
    setCollapsedItems((prev) => ({
      ...prev,
      [itemIndex]: true, // Garante que o item será expandido
    }));
  };

  const removeItem = (itemIndex: number) => {
    setItems(items.filter((_, index) => index !== itemIndex));
  };

  const removeChild = (itemIndex: number, childIndex: number) => {
    setItems(
      items.map((item, index) =>
        index === itemIndex
          ? { ...item, children: item.children.filter((_, cIndex) => cIndex !== childIndex) }
          : item
      )
    );
  };

  const updateItem = useCallback(
    (itemIndex: number, field: keyof TItem, value: string) => {
      setItems(
        items.map((item, index) =>
          index === itemIndex
            ? { ...item, data: { ...item.data, [field]: value } }
            : item
        )
      );
    },
    [items, setItems]
  );

  const updateChild = useCallback(
    (itemIndex: number, childIndex: number, field: keyof TChild, value: TChild[keyof TChild] | null) => { 
      setItems(
        items.map((item, index) =>
          index === itemIndex
            ? {
                ...item,
                children: item.children.map((child, cIndex) =>
                  cIndex === childIndex ? { ...child, data: { ...child.data, [field]: value } } : child
                ),
              }
            : item
        )
      );
    },
    [items, setItems]
  );

  /// Renomeie a função interna
  const _updateChildMultiple = useCallback(
    (itemIndex: number, childIndex: number, updates: Partial<TChild>) => {
      setItems(
        items.map((item, index) =>
          index === itemIndex
            ? {
                ...item,
                children: item.children.map((child, cIndex) =>
                  cIndex === childIndex
                    ? { ...child, data: { ...child.data, ...updates } }
                    : child
                ),
              }
            : item
        )
      );
    },
    [items, setItems]
  );

  // Alterna o estado de colapso do item
  const toggleCollapse = (itemIndex: number) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [itemIndex]: !prev[itemIndex],
    }));
  };

  return (
    <div className={styles.tabelaContainer} style={{ overflow: "visible" }}>
      <table className={`${styles.tabela} table is-fullwidth is-bordered is-striped is-hoverable`}>
        <thead>
          <tr>
            <th className="has-text-centered" style={{ width: "50px" }}>
              <button type='button' onClick={addItem} className="button is-small is-success">
                +
              </button>
            </th>
            {columns.map((col, index) => (
              <th key={index} className="has-text-centered">{col}</th>
            ))}
            <th className="has-text-centered">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, itemIndex) => (
            <React.Fragment key={itemIndex}>
              {/* Linha do Item Pai */}
              <tr>
                <td></td>
                {renderRow(item, itemIndex, updateItem)}
                <td className="has-text-centered">
                  {renderActions ? renderActions(item, itemIndex, addChild, enableRemoveItem ? removeItem : undefined, enableRemoveChild ? removeChild : undefined) : (
                    <>
                      <button 
                        onClick={() => addChild(itemIndex)} 
                        className="button is-small is-primary"
                        type='button'
                      >
                        + Adicionar Item
                      </button>
                      {enableRemoveItem && (
                        <button
                          onClick={() => removeItem(itemIndex)}
                          className="button is-small is-danger ml-2"
                          type='button'
                        >
                          🗑️
                        </button>
                      )}
                    </>
                  )}
                </td>
                <td>
                {/* Botão de Collapse, apenas se a funcionalidade estiver ativada */}
                {enableCollapseChildren && item.children.length > 0 && (
                  <button
                    onClick={() => toggleCollapse(itemIndex)}
                    className="button is-small"
                    type='button'
                  >
                    {collapsedItems[itemIndex] ? "🔼 Recolher" : "🔽 Expandir"}
                  </button>
                )}
              </td>
              </tr>

              {/* Se houver filhos, adiciona uma linha de cabeçalho dinâmica */}
              {collapsedItems[itemIndex] && item.children.length > 0 && (
                <tr className="has-background-light">
                  <td></td>
                  <td></td>
                  {childColumns.map((col, index) => (
                    <th key={index} className="has-text-centered">{col}</th>
                  ))}
                  <td></td> 
                </tr>
              )}

              {/* Renderizando os filhos abaixo do cabeçalho extra */}
              {collapsedItems[itemIndex] && item.children.map((child, childIndex) => (
                <tr key={`${itemIndex}-${childIndex}`} className="has-background-light">
                  <td></td>
                  <td></td>
                  {renderChildRow(child, childIndex, itemIndex, updateChild, updateChildMultiple || _updateChildMultiple)}
                  <td className="has-text-centered">
                    {enableRemoveChild && (
                      <button
                        onClick={() => removeChild(itemIndex, childIndex)}
                        className="button is-small is-danger"
                        type='button'
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          {renderFooter && renderFooter(items)}
        </tfoot>
      </table>
    </div>
  );
}