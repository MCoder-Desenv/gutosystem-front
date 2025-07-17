import React, { SelectHTMLAttributes } from "react";
import { FormikProps } from "formik";

interface SelectListProps<T> extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  name: string;
  label: string;
  erro?: string;
  options: T[];
  displayFields: (keyof T)[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>;
  loading?: boolean;
}

const SelectList = <T,>({
  id,
  label,
  erro,
  name,
  options,
  displayFields,
  formik,
  loading,
  ...rest
}: SelectListProps<T>) => {
  const formatOptionLabel = (item: T) =>
    displayFields.map((field) => item[field]).filter(Boolean).join(", ");

  // const errorMessage =
  //   typeof formik.errors[name] === "string" ? formik.errors[name] : undefined;

  return (
    <div className="column">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="control">
        <div className="select is-fullwidth">
          <select
            id={id}
            name={name}
            value={formik.values[name] || ""}
            onChange={(e) => formik.setFieldValue(name, e.target.value)}
            disabled={loading}
            aria-disabled={loading}
            {...rest}
          >
            <option value="" disabled>
              {loading ? "Carregando..." : `Selecione um ${label.toLowerCase()}`}
            </option>
            {options.map((item, index) => (
              <option key={index} value={formatOptionLabel(item)}>
                {formatOptionLabel(item)}
              </option>
            ))}
          </select>
          {erro && (
                    <p className="help is-danger" style={{
                        marginTop: "4px", // Pequeno espaço para evitar tocar no input
                        position: "absolute",
                        bottom: "-20px", // Mantém o erro abaixo do input sem afetar o layout
                    }}>{erro}</p>
          )}
          {/* {formik.touched[name] && errorMessage && (
            <p className="help is-danger">{errorMessage}</p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default SelectList;