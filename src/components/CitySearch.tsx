import { useEffect, useState, type FocusEvent, type FormEvent } from "react";
import { loadCitySuggestions, type Coordinates } from "../weather";

const SEARCH_THROTTLE_MS = 350;

type CitySearchProps = {
  city?: string;
  disabled: boolean;
  onChange: (city: string) => void;
};

const useThrottledValue = (value: string, delay: number) => {
  const [throttledValue, setThrottledValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => setThrottledValue(value), delay);

    return () => window.clearTimeout(timerId);
  }, [delay, value]);

  return throttledValue;
};

export const CitySearch = ({
  disabled,
  onChange,
  city = "",
}: CitySearchProps) => {
  const [query, setQuery] = useState(city);
  const throttledQuery = useThrottledValue(query, SEARCH_THROTTLE_MS);
  const [suggestions, setSuggestions] = useState<Coordinates[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setQuery(city);
  }, [city]);

  useEffect(() => {
    const cleanQuery = throttledQuery.trim();

    if (cleanQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    loadCitySuggestions(cleanQuery)
      .then((nextSuggestions) => {
        setSuggestions(nextSuggestions);
      })
      .catch(() => {
        setSuggestions([]);
      });
  }, [throttledQuery]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanQuery = query.trim();

    if (cleanQuery.length === 0 || disabled) {
      return;
    }

    onChange(cleanQuery);
    setShowSuggestions(false);
  };

  const dismissSuggestions = (event: FocusEvent<HTMLFormElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      !nextFocusedElement ||
      !event.currentTarget.contains(nextFocusedElement)
    ) {
      setShowSuggestions(false);
    }
  };

  return (
    <form
      className="city-search"
      onBlur={dismissSuggestions}
      onSubmit={submitSearch}
    >
      <label htmlFor="city">Город</label>
      <div className="city-search__row">
        <input
          id="city"
          type="search"
          value={query}
          placeholder="Например, Novosibirsk"
          disabled={disabled}
          onFocus={() => setShowSuggestions(true)}
          aria-autocomplete="list"
          aria-controls={suggestions.length ? "city-suggestions" : undefined}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowSuggestions(true);
          }}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="city-suggestions" id="city-suggestions" role="listbox">
          {suggestions.map((suggestion) => (
            <li
              key={`${suggestion.name}-${suggestion.country}-${suggestion.lat}-${suggestion.lon}`}
              role="option"
            >
              <button
                type="button"
                onClick={() => {
                  onChange(suggestion.name);
                  setQuery(suggestion.name);
                  setShowSuggestions(false);
                }}
              >
                <span>{suggestion.name}</span>
                <small>{suggestion.country}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};
