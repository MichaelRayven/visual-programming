import { formatTemperature, getIconUrl, type WeatherState } from "../weather";

type CurrentWeatherProps = {
  weather: WeatherState;
};

export const CurrentWeather = ({ weather }: CurrentWeatherProps) => (
  <section className="current-weather" aria-label="Текущая погода">
    <div>
      <p className="eyebrow">
        {new Intl.DateTimeFormat("ru-RU", { dateStyle: "full" }).format(
          new Date(),
        )}
      </p>
      <h1>
        {weather.city.name}, {weather.city.country}
      </h1>
      <p className="current-weather__temp">
        {formatTemperature(weather.current.temp)}
      </p>
      <p className="current-weather__desc">{weather.current.description}</p>
    </div>
    <img
      src={getIconUrl(weather.current.icon)}
      alt={weather.current.description}
    />
  </section>
);
