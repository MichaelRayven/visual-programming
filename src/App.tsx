import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AirQualityCard,
  CitySearch,
  CurrentWeather,
  DailyForecastList,
  HourlyForecast,
  WeatherDetails,
} from "./components";
import {
  getWeatherMood,
  loadWeather,
  REFRESH_INTERVAL,
  type WeatherState,
} from "./weather";
import "./App.css";

const INITIAL_CITY = "Novosibirsk";

const App = () => {
  const [selectedCity, setSelectedCity] = useState(INITIAL_CITY);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshWeather = useCallback(
    async (cityName = selectedCity) => {
      setLoading(true);
      setError("");

      try {
        const nextWeather = await loadWeather(cityName);

        setWeather(nextWeather);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load forecast",
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedCity],
  );

  useEffect(() => {
    refreshWeather();
    const timerId = window.setInterval(
      () => refreshWeather(),
      REFRESH_INTERVAL,
    );

    return () => window.clearInterval(timerId);
  }, [refreshWeather]);

  const moodClass = useMemo(
    () =>
      weather ? getWeatherMood(weather.current.condition) : "weather-app--clear",
    [weather],
  );
  const updatedAt = weather
    ? new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(weather.updatedAt))
    : "";

  const handleSearch = (nextCity: string) => {
    if (nextCity === selectedCity) {
      refreshWeather(nextCity);
      return;
    }

    setSelectedCity(nextCity);
  };

  return (
    <main className={`weather-app ${moodClass}`}>
      <div className="weather-shell">
        <CitySearch
          disabled={loading}
          onChange={handleSearch}
          city={selectedCity}
        />

        {error && (
          <p className="notice" role="status">
            {error}
          </p>
        )}

        {!weather && loading && (
          <p className="notice" role="status">
            Loading forecast...
          </p>
        )}

        {weather && (
          <>
            <CurrentWeather weather={weather} />
            <HourlyForecast points={weather.hourly} />
            <WeatherDetails point={weather.current} />

            <div className="secondary-grid">
              <DailyForecastList days={weather.daily} />
              <AirQualityCard air={weather.air} />
            </div>

            <p className="source-note">
              Updated at {updatedAt}. Source: {weather.source === "api" ? "OpenWeather" : "mock"}.
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export default App;
