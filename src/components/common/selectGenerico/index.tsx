// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SelectGenericoProps<T extends Record<string, any>> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: T | null;
  onChange: (item: T | null) => void;
  items: T[];
  getLabel: (item: T) => string;
  getId: (item: T) => string;
  label: string;
  error?: string;
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SelectGenerico = <T extends Record<string, any>>({
  value,
  onChange,
  items,
  getLabel,
  getId,
  label,
  error,
  loading,
  className,
  ...rest
}: SelectGenericoProps<T>) => {
  return (
    <div className="column">
      <label className="label">{label}</label>
      <div className="select is-fullwidth">
        <select
          value={value ? getId(value) : ""}
          onChange={(e) => {
            const selectedItem = items.find((item) => getId(item) === e.target.value) || null;
            onChange(selectedItem);
          }}
          className={`select ${error ? "is-danger" : ""} ${className || ""}`}
          disabled={loading}
          {...rest} // Passa os atributos adicionais
        >
          <option value="" disabled>
            {loading ? "Carregando..." : `Selecione um ${label.toLowerCase()}`}
          </option>
          {items.map((item) => (
            <option key={getId(item)} value={getId(item)}>
              {getLabel(item)}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="help is-danger">{error}</p>}
    </div>
  );
};
