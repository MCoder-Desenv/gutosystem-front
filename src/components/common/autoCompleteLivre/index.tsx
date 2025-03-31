'use client'
import { useState, useEffect, useRef, InputHTMLAttributes } from "react";
import styles from "./AutoCompleteLivre.module.css";

interface AutoCompleteInputProps<T> extends Omit<InputHTMLAttributes<HTMLInputElement>, "onSelect"> {
  id: string;
  erro?: string;
  name: string;
  value: string;
  onSearch: (query: string) => Promise<T[]>; // Retorna objetos com id e label
  onSelect: (item: T | string) => void; // Pode ser um objeto da lista ou um texto digitado
  formatResult?: (item: T) => string;
  placeholder?: string;
}

export const AutoCompleteLivre = <T extends { id: string | number; label: string }>(
  {
    id,
    name,
    value,
    erro,
    onSearch,
    onSelect,
    formatResult,
    placeholder = "Digite para buscar...",
    disabled,
    ...rest
  }: AutoCompleteInputProps<T>
) => {
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [query, setQuery] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousQuery = useRef<string>("");

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmedQuery = query?.trim();
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
  }, [query, onSearch]);

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
    <div className={`${styles.control} custom-autocomplete-height`} ref={containerRef}>
      <input
        id={id}
        name={name}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onBlur={() => {
          // Se o valor digitado não corresponder a nenhum item da lista, aceita como string
          if (!searchResults.some(item => (formatResult ? formatResult(item) : item.label) === query)) {
            onSelect(query); // Aceita entrada livre
          }
        }}
        placeholder={placeholder}
        className={`input ${erro ? "is-danger" : styles["autocomplete-input"]}`}
        disabled={disabled}
        {...rest}
      />
      {isLoading && <div className="loading">Carregando...</div>}
      {showDropdown && searchResults.length > 0 && (
        <ul className={styles.dropdown}>
          {searchResults.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                onSelect(item);
                setQuery(formatResult ? formatResult(item) : item.label);
                setShowDropdown(false);
              }}
              className={styles["dropdown-item"]}
            >
              <span className={styles.code}>{formatResult ? formatResult(item) : item.label}</span>
            </li>
          ))}
        </ul>
      )}
      {erro && <p className="help is-danger">{erro}</p>}
    </div>
  );
};
