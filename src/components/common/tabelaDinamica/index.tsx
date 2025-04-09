import React from "react";

export interface Column {
  label: string;
  key: string;
  type?: "checkbox" | "textarea" | "text";
  className?: string;
  width?: string;
  disabled?: boolean; // Adicionado para desabilitar inputs
}

interface Row {
  [key: string]: string | { value: string; placeholder?: string } | JSX.Element;
}

interface TabelaDinamicaProps {
  columns: Column[];
  data: Row[];
  values?: { [key: string]: string };
  setValues?: (newValues: { [key: string]: string }) => void;
  className?: {
    container?: string;
    table?: string;
  };
}

const TabelaDinamica: React.FC<TabelaDinamicaProps> = ({
  columns,
  data,
  values = {},
  setValues,
  className,
}) => {
  const handleChange = (name: string, value: string) => {
    if (setValues) {
      setValues({
        ...values,
        [name]: value,
      });
    }
  };

  const isObjectWithValue = (
    data: unknown
  ): data is { value: string; placeholder?: string } => {
    return (
      typeof data === "object" &&
      data !== null &&
      !React.isValidElement(data) &&
      "value" in data
    );
  };

  return (
    <div className={className?.container || ""}>
      <table className={className?.table || ""}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={col.className || ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => {
                const cellData = row[col.key];

                let value = "";
                let placeholder = "";
                let cellKey: string = `${col.key}-${rowIndex}`;

                if (isObjectWithValue(cellData)) {
                  value = values[cellData.value] || "";
                  placeholder = cellData.placeholder || "";
                  cellKey = cellData.value;
                }

                return (
                  <td key={colIndex} className={col.className || ""}>
                    {col.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        autoComplete='off'
                        name={cellKey}
                        className="checkbox"
                        checked={values[cellKey] === "Sim"}
                        onChange={(e) => handleChange(cellKey, e.target.checked ? "Sim" : "Não")}
                        disabled={col.disabled} // Aplicando disabled
                      />
                    ) : col.type === "textarea" ? (
                      <textarea
                        name={cellKey}
                        autoComplete='off'
                        className="textarea"
                        value={value}
                        onChange={(e) => handleChange(cellKey, e.target.value)}
                        placeholder={placeholder}
                        disabled={col.disabled} // Aplicando disabled
                      />
                    ) : col.type === "text" ? (
                      <input
                        type="text"
                        autoComplete='off'
                        className="input"
                        name={cellKey}
                        value={value}
                        onChange={(e) => handleChange(cellKey, e.target.value)}
                        placeholder={placeholder}
                        disabled={col.disabled} // Aplicando disabled
                      />
                    ) : (
                      React.isValidElement(cellData) ? (
                        cellData
                      ) : isObjectWithValue(cellData) ? (
                        cellData.value
                      ) : (
                        cellData
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaDinamica;
