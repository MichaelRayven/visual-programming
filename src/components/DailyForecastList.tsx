import { formatTemperature, getIconUrl, type DailyForecast } from "../weather";

type DailyForecastListProps = {
  days: DailyForecast[];
};

export const DailyForecastList = ({ days }: DailyForecastListProps) => (
  <section className="daily-list" aria-label="Прогноз на несколько дней">
    <h2>Ближайшие дни</h2>
    {days.map((day) => (
      <article className="daily-list__item" key={day.date}>
        <span>{day.title}</span>
        <img src={getIconUrl(day.icon)} alt={day.description} />
        <strong>
          {formatTemperature(day.max)} / {formatTemperature(day.min)}
        </strong>
      </article>
    ))}
  </section>
);
