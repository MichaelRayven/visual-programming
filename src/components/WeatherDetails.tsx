import { formatTemperature, type WeatherPoint } from "../weather";

type WeatherDetailsProps = {
  point: WeatherPoint;
};

export const WeatherDetails = ({ point }: WeatherDetailsProps) => (
  <section className="details-grid" aria-label="Подробности погоды">
    <div>
      <span>Ощущается</span>
      <strong>{formatTemperature(point.feelsLike)}</strong>
    </div>
    <div>
      <span>Влажность</span>
      <strong>{point.humidity}%</strong>
    </div>
    <div>
      <span>Ветер</span>
      <strong>{Math.round(point.wind)} м/с</strong>
    </div>
    <div>
      <span>Давление</span>
      <strong>{point.pressure} мм</strong>
    </div>
  </section>
);
