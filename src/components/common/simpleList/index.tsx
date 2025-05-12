'use client'
import React from "react";
import styles from "./SimpleList.module.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SimpleItem<T = any> = {
  id: string;
  data: T;
};

type ColumnDefinition<TItem> = {
  header: string; // título que aparece no cabeçalho
  field: keyof TItem; // nome real da propriedade do objeto
};


type SimpleListProps<TItem> = {
  items: SimpleItem<TItem>[];
  setItems: (items: SimpleItem<TItem>[]) => void;
  columns: ColumnDefinition<TItem>[];
  renderRow: (
    item: SimpleItem<TItem>,
    index: number,
    updateItem: (index: number, field: keyof TItem, value: TItem[keyof TItem]) => void
  ) => JSX.Element;
  enableRemoveItem?: boolean;
};

export default function SimpleList<TItem>({
  items,
  setItems,
  columns,
  renderRow,
  enableRemoveItem = false,
}: SimpleListProps<TItem>) {
  const addItem = () => {
    setItems([
      ...items,
      {
        id: "",
        data: Object.fromEntries(columns.map((col) => [col.field, ""])) as TItem,
      },
    ]);
  };  

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TItem, value: TItem[keyof TItem]) => {
    setItems(
      items.map((item, i) =>
        i === index
          ? { ...item, data: { ...item.data, [field]: value } }
          : item
      )
    );
  };

  return (
    <div className={styles.tabelaContainer}>
      <table className={`${styles.tabela} table is-fullwidth is-bordered is-striped is-hoverable`}>
        <thead>
          <tr>
            <th style={{ width: "50px" }}>
              <button type="button" onClick={addItem} className="button is-small is-success">
                +
              </button>
            </th>
            {columns.map((col, i) => (
              <th key={i} className="has-text-centered">{col.header}</th>
            ))}
            {enableRemoveItem && <th className="has-text-centered">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td></td>
              {renderRow(item, index, updateItem)}
              {enableRemoveItem && (
                <td className="has-text-centered">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="button is-small is-danger"
                  >
                    🗑️
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
