import { formatTemperature, getIconUrl, type WeatherPoint } from "../weather";

type HourlyForecastProps = {
  points: WeatherPoint[];
};

export const HourlyForecast = ({ points }: HourlyForecastProps) => (
  <section className="hourly-list" aria-label="Прогноз на ближайшие часы">
    {points.map((point) => (
      <article
        className="hourly-list__item"
        key={`${point.date}-${point.time}`}
      >
        <span>{point.time}</span>
        <img src={getIconUrl(point.icon)} alt="" />
        <strong>{formatTemperature(point.temp)}</strong>
      </article>
    ))}
  </section>
);
