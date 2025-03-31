import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { FormikProps } from "formik";
import { produce } from "immer";
import { FaTrash } from "react-icons/fa";
import { AutoCompleteInput } from "../autoCompleteInput";


// Definição das tipagens
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Column<T = any> {
  key: string;
  label: string;
  type?: "text" | "checkbox" | "textarea" | "date" | "autocompleteinput";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSearch?: (query: string) => Promise<any[]>; // Apenas para autocomplete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatResult?: (item: any) => string; // Formatação da exibição
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatValue?: (value: any) => string; // Novo: Formatação do valor na célula do grid
  erro?: (item: T, index: number) => string; // ✅ Nova propriedade para exibir erros
  width?: string;
}



interface ChildItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ParentItem<TChild = ChildItem> {
  id: string | null;
  children?: TChild[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface GridComponentProps<T extends ParentItem> {
  parentColumns: Column[];
  childColumns?: Column[]; // ❗️ childColumns opcional
  data: T[];
  setData: (data: T[] | ((prevData: T[]) => T[])) => void;
  formik?: FormikProps<{ items: T[] }>;
  onAddParent?: (newParent: T) => void;
  onAddChild?: (newChild: ChildItem, parentId: string) => void;
  tituloParent?: ReactNode; // Aceita string ou elementos JSX
  tituloBotaoParent?: ReactNode; // Aceita string ou elementos JSX
  tituloChildren?: ReactNode; // Aceita string ou elementos JSX
  tituloBotaoChildren?: ReactNode; // Aceita string ou elementos JSX
  allowDeleteParent?: boolean;
  allowDeleteChildren?: boolean;
  comparadores?: string[]; // Lista de chaves das colunas que devem ser verificadas para duplicação
}

const GridComponent = <T extends ParentItem>({
    parentColumns,
    childColumns,
    data,
    setData,
    formik,
    allowDeleteParent,
    allowDeleteChildren,
    tituloParent,
    tituloBotaoParent,
    tituloChildren,
    tituloBotaoChildren,
    comparadores
  }: GridComponentProps<T>) => {

    const [selectedParent, setSelectedParent] = useState<ParentItem | null>(null);

    const handleParentClick = useCallback((parent: T) => {
      setSelectedParent(parent);
    }, [setSelectedParent]);     

    // Atualiza valores dos filhos
    const handleChildChange = useCallback(
      (childIndex: number, columnKey: string, value: string | boolean) => {
        if (!selectedParent) return;
    
        setData((prevData) =>
          produce(prevData, (draft) => {
            const parent = draft.find((p) => p.id === selectedParent.id);
            if (parent) {
              // Identificar dinamicamente a chave dos filhos
              const childKey = Object.keys(parent).find((key) => Array.isArray(parent[key]));
              if (childKey && Array.isArray(parent[childKey])) {
                (parent[childKey] as ChildItem[])[childIndex][columnKey] = value;
              }
            }
          })
        );
    
        if (formik) {
          formik.setValues((prevValues) =>
            produce(prevValues, (draft) => {
              const parent = draft.items.find((p) => p.id === selectedParent.id);
              if (parent) {
                // Identificar dinamicamente a chave dos filhos no formulário
                const childKey = Object.keys(parent).find((key) => Array.isArray(parent[key]));
                if (childKey && Array.isArray(parent[childKey])) {
                  (parent[childKey] as ChildItem[])[childIndex][columnKey] = value;
                }
              }
            })
          );
        }
      },
      [selectedParent, setData, formik]
    );
  
    // Atualiza valores dos pais
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleParentChange = (parentIndex: number, columnKey: string, value: string | boolean) => {
      if (formik) {
        formik.setValues(
          produce(formik.values, (draft) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mutableParent = draft.items[parentIndex] as unknown as Record<string, any>;
            mutableParent[columnKey] = value;
          })
        );
      } else {
        setData((prev) =>
          produce(prev, (draft) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mutableParent = draft[parentIndex] as unknown as Record<string, any>;
            mutableParent[columnKey] = value;
          })
        );
      }
    };    

    // Adiciona um novo filho
    const handleAddChild = () => {
      if (!selectedParent) return;
    
      const newChild: ChildItem = { id: crypto.randomUUID() };
    
      setData((prevData) =>
        produce(prevData, (draft) => {
          const parent = draft.find((p) => p.id === selectedParent.id);
          if (parent) {
            const childKey = Object.keys(parent).find((key) => Array.isArray(parent[key]));
    
            if (childKey) {
              // Forçando o TypeScript a reconhecer como um array mutável
              (parent[childKey] as ChildItem[]).push(newChild);
            }
          }
        })
      );
    };
     
    const handleDeleteParent = useCallback(
      (parentIndex: number) => {
        setData((prevData) => prevData.filter((_, index) => index !== parentIndex));
      },
      [setData]
    );
  
    const handleDeleteChild = useCallback(
      (childIndex: number) => {
        if (!selectedParent) return;
        setData((prevData) =>
          produce(prevData, (draft) => {
            const parent = draft.find((p) => p.id === selectedParent.id);
            if (parent) {
              const childKey = Object.keys(parent).find((key) => Array.isArray(parent[key]));
              if (childKey) {
                (parent[childKey] as ChildItem[]).splice(childIndex, 1);
              }
            }
          })
        );
      },
      [selectedParent, setData]
    );

    const selectedParentChildren = useMemo(() => {
      if (!selectedParent) return [];
    
      const parent = data.find((p) => p.id === selectedParent.id);
      return parent?.children ?? [];
    }, [selectedParent, data]);

    // Adiciona um novo pai
    const handleAddParent = () => {
      const newParent = {
        children: [],
        ...parentColumns.reduce(
          (acc, col) => ({
            ...acc,
            [col.key]: col.type === "checkbox" ? false : "",
          }),
          {}
        ),
      } as unknown as T;
    
      setData((prevData) => [...prevData, newParent]);
    
      // Aguarda a atualização do estado antes de setar o novo pai
      setTimeout(() => {
        setSelectedParent(newParent);
      }, 0);
    };

    const getDuplicateRows = useMemo(() => {
      if (!comparadores || comparadores.length === 0) return new Set();
    
      const seen = new Map<string, number>();
      const duplicates = new Set<number>();
    
      data.forEach((parent, index) => {
        // Obtém a chave considerando propriedades aninhadas
        const key = comparadores.map(colKey => {
          const keys = colKey.split("."); // Permite acessar propriedades aninhadas como "funcao.codigo"
          return keys.reduce((obj, key) => (obj ? obj[key] : ""), parent) ?? "";
        }).join("|");
    
        if (seen.has(key)) {
          duplicates.add(index);
          duplicates.add(seen.get(key)!);
        } else {
          seen.set(key, index);
        }
      });
    
      return duplicates;
    }, [data, comparadores]);
    

    // Renderiza um campo editável
    const renderCell = useCallback(
      (item: Record<string, unknown>, col: Column, index: number, isParent = false) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const value =
            col.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    
          if (isParent) {
            handleParentChange(index, col.key, value);
          } else {
            handleChildChange(index, col.key, value);
          }
        };
    
        let displayValue = item[col.key] ?? "";
    
        // Se a coluna tem formatValue, formatamos o valor antes de exibir
        if (col.formatValue) {
          displayValue = col.formatValue(item[col.key]);
        } else if (typeof displayValue === "object" && displayValue !== null) {
          displayValue = JSON.stringify(displayValue); // Evita o [object Object]
        }
    
        if (col.type === "checkbox") {
          return (
            <input
              type="checkbox"
              checked={Boolean(item[col.key])}
              onChange={handleChange}
              autoComplete='off'
              style={{ transform: "scale(1.3)", margin: "5px" }}
            />
          );
        } else if (col.type === "textarea") {
          return <textarea className="textarea" value={String(displayValue)} onChange={handleChange} autoComplete='off'/>;
        } else if (col.type === "date") {
          return (
            <input
              type="date"
              className="input"
              autoComplete='off'
              value={item[col.key] ? new Date(String(item[col.key])).toISOString().split("T")[0] : ""}
              onChange={handleChange}
            />
          );
        } else if (col.type === "autocompleteinput" && col.onSearch) {
          return (
            <div>
            <AutoCompleteInput
              id={`autocompleteinput-${col.key}-${index}`}
              name={col.key}
              value={String(displayValue)}
              onSearch={col.onSearch}
              autoComplete='off'
              onSelect={(selectedItem) => {
                if (isParent) {
                  handleParentChange(index, col.key, selectedItem);
                } else {
                  handleChildChange(index, col.key, selectedItem);
                }
              }}
              formatResult={col.formatResult}
            />
            {col.erro && <p className="error-text">{col.erro(item, index)}</p>}
            </div>
          );
        } else {
          return <input type="text" className="input" value={String(displayValue)} onChange={handleChange} />;
        }
      },
      [handleParentChange, handleChildChange]
    );
       

    // eslint-disable-next-line react/display-name
    const MemoizedCell = React.memo(
      ({ item, col, index, isParent }: { item: Record<string, unknown>; col: Column; index: number; isParent?: boolean }) => {
        return renderCell(item, col, index, isParent);
      },
      (prevProps, nextProps) => prevProps.item === nextProps.item && prevProps.col === nextProps.col
    );

    return (
      <div className="container">
        <div className="box">
          <h2 className="title">{tituloParent}</h2>
          <button className="button is-success mb-2" onClick={handleAddParent} type="button">
            {tituloBotaoParent}
          </button>
          <table className="table is-bordered is-striped is-hoverable is-fullwidth">
            <thead>
              <tr>
                {parentColumns.map((col) => (
                  <th key={col.key} style={{ width: col.width || "auto" }}>{col.label}</th>
                ))}
                {allowDeleteParent && <th style={{width:'5%'}}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((parent, parentIndex) => (
                  <tr key={parentIndex} onClick={() => handleParentClick(parent)} className={getDuplicateRows.has(parentIndex) ? "linha-duplicada" : ""}>
                    {parentColumns.map((col) => (
                      <td key={col.key}>{renderCell(parent, col, parentIndex, true)}</td>
                    ))}
                    {allowDeleteParent && (
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <button onClick={() => handleDeleteParent(parentIndex)} type="button">
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={parentColumns.length + (allowDeleteParent ? 1 : 0)}>
                    Nenhum dado disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedParent && childColumns && childColumns.length > 0 && (
          <div className="box">
            <h2 className="title">{tituloChildren}</h2>
            <button className="button is-primary mb-2" onClick={handleAddChild} type="button">
              {tituloBotaoChildren}
            </button>
            <table className="table is-bordered is-fullwidth">
              <thead>
                <tr>
                  {childColumns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  {allowDeleteChildren && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {selectedParentChildren.map((child: ChildItem, index: number) => (
                  <tr key={index}>
                    {childColumns.map((col) => (
                      <td key={col.key}>
                        <MemoizedCell item={child} col={col} index={index} />
                      </td>
                    ))}
                    {allowDeleteChildren && (
                      <td>
                        <button onClick={() => handleDeleteChild(index)} type="button">
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

export default GridComponent;