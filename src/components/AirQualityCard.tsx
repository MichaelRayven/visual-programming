import type { AirQuality } from "../weather";

type AirQualityCardProps = {
  air: AirQuality;
};

export const AirQualityCard = ({ air }: AirQualityCardProps) => (
  <section className="air-card" aria-label="Загрязнение воздуха">
    <div>
      <p className="eyebrow">Качество воздуха</p>
      <h2>{air.label}</h2>
    </div>
    <div className="air-card__index">AQI {air.index}</div>
    <dl>
      <div>
        <dt>PM2.5</dt>
        <dd>{air.components.pm25.toFixed(1)}</dd>
      </div>
      <div>
        <dt>PM10</dt>
        <dd>{air.components.pm10.toFixed(1)}</dd>
      </div>
      <div>
        <dt>CO</dt>
        <dd>{Math.round(air.components.co)}</dd>
      </div>
    </dl>
  </section>
);
