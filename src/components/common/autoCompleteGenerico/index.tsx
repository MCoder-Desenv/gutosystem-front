'use client'
import { useState, useEffect, useRef, InputHTMLAttributes } from "react";
import styles from "./styles.module.css";

interface AutoCompleteProps<T> extends Omit<InputHTMLAttributes<HTMLInputElement>, "onSelect"> {
  id: string;
  label: string;
  erro?: string;
  name: string;
  value: string;
  onClear?: () => void; // 👉 Adiciona essa linha aqui
  onSearch: (query: string) => Promise<T[]>;
  onSelect: (item: T) => void; // Mantemos o onSelect correto
  formatResult?: (item: T) => string;
  placeholder?: string;
}


export const AutoCompleteGenerico = <T extends { id: string | number }>({
  id,
  label,
  name,
  value,
  erro,
  onSearch,
  onSelect,
  formatResult,
  placeholder = "Digite para buscar...",
  disabled,
  onClear,
  ...rest
}: AutoCompleteProps<T>) => {
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [query, setQuery] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousQuery = useRef<string>("");

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // useEffect(() => {
  //   if (isSelecting) {
  //     setIsSelecting(false);
  //     return;
  //   }

  //   const handler = setTimeout(() => {
  //     const trimmedQuery = query?.trim();

  //     if (trimmedQuery === previousQuery.current) return;

  //     previousQuery.current = trimmedQuery;

  //     if (!trimmedQuery) {
  //       setSearchResults([]);
  //       return;
  //     }

  //     setIsLoading(true);
  //     onSearch(trimmedQuery)
  //       .then((results) => setSearchResults(results))
  //       .finally(() => setIsLoading(false));
  //   }, 300);

  //   return () => clearTimeout(handler);
  // }, [query, onSearch, isSelecting]);

  useEffect(() => {
  if (isSelecting) {
    setIsSelecting(false);
    return;
  }

  const handler = setTimeout(() => {
    const trimmedQuery = typeof query === 'string' ? query.trim() : '';

    if (trimmedQuery === previousQuery.current) return;

    previousQuery.current = trimmedQuery;

    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    onSearch(trimmedQuery)
      .then((results) => setSearchResults(results))
      .finally(() => setIsLoading(false));
  }, 300);

  return () => clearTimeout(handler);
}, [query, onSearch, isSelecting]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="column">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className={`${styles.control} custom-autocomplete-height`} ref={containerRef}>
        <input
          id={id}
          name={name}
          type="text"
          value={query}
          onChange={(e) => {
            const newValue = e.target.value;
            setQuery(newValue);
            setShowDropdown(true);
          
            if (newValue.trim() === '') {
              // Quando o usuário apaga tudo, notifica que limpou
              onClear?.();
            }
          }}          
          placeholder={placeholder}
          className={`input ${erro ? "is-danger" : styles["autocomplete-input"]}`}
          disabled={disabled}
          {...rest} // Passa os outros atributos padrão do input
        />
        {isLoading && <div className="loading">Carregando...</div>}
        {showDropdown && searchResults.length > 0 && (
          <ul className={styles.dropdown}>
            {searchResults.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  setIsSelecting(true);
                  onSelect(item);
                  setQuery(formatResult ? formatResult(item) : String(item));
                  setShowDropdown(false);
                }}
                className={styles["dropdown-item"]}
              >
                <span
                  className={styles.code}
                  dangerouslySetInnerHTML={{
                    __html: formatResult ? formatResult(item) : String(item),
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        {erro && <p className="help is-danger">{erro}</p>}
      </div>
    </div>
  );
};