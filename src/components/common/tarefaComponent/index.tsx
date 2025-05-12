'use client';
import React from 'react';
import styles from './FormGridComponent.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormGridComponentItem<T = any> = {
  id: string | number | null;
  data: T;
};

type FormGridComponentProps<TItem> = {
  items: FormGridComponentItem<TItem>[];
  setItems: (items: FormGridComponentItem<TItem>[]) => void;
  createNewItem: () => TItem;
  renderRow: (
    item: FormGridComponentItem<TItem>,
    index: number,
    updateItem: (index: number, field: keyof TItem, value: TItem[keyof TItem]) => void,
    updateItemObject: (index: number, newFields: Partial<TItem>) => void
  ) => JSX.Element;
  collapsedRow?: (
    item: FormGridComponentItem<TItem>,
    index: number
  ) => JSX.Element;
  enableRemoveItem?: boolean;
};

export default function FormGridComponent<TItem>({
  items,
  setItems,
  createNewItem,
  renderRow,
  collapsedRow,
  enableRemoveItem = false,
}: FormGridComponentProps<TItem>) {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const addItem = () => {
    const newItem = {
      id: '',
      data: createNewItem(),
    };
    setItems([...items, newItem]);
    setExpandedIndex(items.length); // Expande o novo e recolhe os demais
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
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

  const updateItemObject = (index: number, newFields: Partial<TItem>) => {
    setItems(
      items.map((item, i) =>
        i === index
          ? { ...item, data: { ...item.data, ...newFields } }
          : item
      )
    );
  };
  

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={styles.formListContainer}>
      <div className="mb-2">
        <button type="button" onClick={addItem} className="button is-small is-success">
          + Adicionar
        </button>
      </div>

      {items.map((item, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <div key={index} className={`${styles.itemContainer} box mb-3`}>
            <div className="is-flex is-justify-content-space-between is-align-items-start">
              <div className="is-flex-grow-1">
                <button
                  type="button"
                  className="button is-small is-light mb-2"
                  onClick={() => toggleExpand(index)}
                >
                  {isExpanded ? 'Recolher ▲' : 'Expandir ▼'}
                </button>

                {isExpanded
                  ? renderRow(item, index, updateItem, updateItemObject)
                  : collapsedRow?.(item, index)}
              </div>
              {enableRemoveItem && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="button is-small is-danger ml-2"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
