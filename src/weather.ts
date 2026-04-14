const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

export const REFRESH_INTERVAL = 3 * 60 * 60 * 1000;

export type Coordinates = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};

export type WeatherPoint = {
  date: string;
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  wind: number;
  icon: string;
  description: string;
  condition: string;
};

export type DailyForecast = {
  date: string;
  title: string;
  min: number;
  max: number;
  icon: string;
  description: string;
};

export type AirQuality = {
  index: number;
  label: string;
  components: {
    pm25: number;
    pm10: number;
    co: number;
  };
};

export type WeatherState = {
  city: Coordinates;
  current: WeatherPoint;
  hourly: WeatherPoint[];
  daily: DailyForecast[];
  air: AirQuality;
  updatedAt: string;
  source: "api" | "mock";
};

type OpenWeatherForecast = {
  city?: {
    timezone: number;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      description: string;
      icon: string;
      main: string;
    }>;
    wind: {
      speed: number;
    };
  }>;
};

type OpenWeatherAir = {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      pm2_5: number;
      pm10: number;
      co: number;
    };
  }>;
};

type OpenWeatherCity = Coordinates & {
  local_names?: Record<string, string>;
};

const aqiLabels = [
  "",
  "Отличное",
  "Хорошее",
  "Умеренное",
  "Плохое",
  "Очень плохое",
];

export const formatTemperature = (value: number) =>
  `${Math.round(value) > 0 ? "+" : ""}${Math.round(value)}\u00b0`;

export const getIconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

export const getWeatherMood = (condition: string) => {
  const normalized = condition.toLowerCase();

  if (normalized.includes("rain") || normalized.includes("drizzle")) {
    return "weather-app--rain";
  }
  if (normalized.includes("snow")) {
    return "weather-app--snow";
  }
  if (normalized.includes("thunder")) {
    return "weather-app--storm";
  }
  if (normalized.includes("cloud")) {
    return "weather-app--clouds";
  }
  return "weather-app--clear";
};

const toShiftedDate = (timestamp: number, timezoneOffsetSeconds: number) =>
  new Date((timestamp + timezoneOffsetSeconds) * 1000);

const toIsoDate = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const formatDayTitle = (timestamp: number, timezoneOffsetSeconds: number) =>
  new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(toShiftedDate(timestamp, timezoneOffsetSeconds));

const formatTime = (timestamp: number, timezoneOffsetSeconds: number) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(toShiftedDate(timestamp, timezoneOffsetSeconds));

const toWeatherPoint = (
  item: OpenWeatherForecast["list"][number],
  index: number,
  timezoneOffsetSeconds: number,
): WeatherPoint => ({
  date: toIsoDate(toShiftedDate(item.dt, timezoneOffsetSeconds)),
  time: index === 0 ? "Сейчас" : formatTime(item.dt, timezoneOffsetSeconds),
  temp: item.main.temp,
  feelsLike: item.main.feels_like,
  humidity: item.main.humidity,
  pressure: Math.round(item.main.pressure * 0.75006),
  wind: item.wind.speed,
  icon: item.weather[0]?.icon ?? "01d",
  description: item.weather[0]?.description ?? "ясно",
  condition: item.weather[0]?.main ?? "Clear",
});

const buildHourlyForecast = (
  list: OpenWeatherForecast["list"],
  timezoneOffsetSeconds: number,
): WeatherPoint[] => {
  return list
    .slice(0, 8)
    .map((item, index) =>
      toWeatherPoint(item, index + 1, timezoneOffsetSeconds),
    );
};

const buildDailyForecast = (
  list: OpenWeatherForecast["list"],
  timezoneOffsetSeconds: number,
): DailyForecast[] => {
  const days = new Map<string, WeatherPoint[]>();

  list
    .map((item, index) =>
      toWeatherPoint(item, index + 1, timezoneOffsetSeconds),
    )
    .forEach((point) => {
      const day = days.get(point.date) ?? [];
      day.push(point);
      days.set(point.date, day);
    });

  return Array.from(days.entries())
    .slice(1, 6)
    .map(([date, points]) => {
      const noonPoint =
        points.find((point) => point.time.startsWith("12")) ??
        points[Math.floor(points.length / 2)];
      const temperatures = points.map((point) => point.temp);

      return {
        date,
        title: formatDayTitle(Date.parse(date) / 1000, timezoneOffsetSeconds),
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
        icon: noonPoint.icon,
        description: noonPoint.description,
      };
    });
};

const fetchJson = async <T>(url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OpenWeather request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const firstOrThrow = <T>(items: T[], message: string): T => {
  const item = items[0];

  if (!item) {
    throw new Error(message);
  }

  return item;
};

const toCoordinates = (city: OpenWeatherCity): Coordinates => ({
  name: city.local_names?.ru ?? city.name,
  country: city.country,
  lat: city.lat,
  lon: city.lon,
});

const uniqueCities = (cities: Coordinates[]) => {
  const seen = new Set<string>();

  return cities.filter((city) => {
    const key = `${city.name.toLowerCase()}-${city.country}-${(city as any).state}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const loadCitySuggestions = async (
  query: string,
): Promise<Coordinates[]> => {
  const normalized = query.trim().toLowerCase();

  if (normalized.length < 2) {
    return [];
  }

  const cities = await fetchJson<OpenWeatherCity[]>(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`,
  );

  return uniqueCities(cities.map(toCoordinates));
};

const searchCity = async (query: string): Promise<Coordinates> => {
  const cities = await fetchJson<OpenWeatherCity[]>(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`,
  );

  if (!cities[0]) {
    throw new Error("Город не найден");
  }

  return {
    ...toCoordinates(cities[0]),
  };
};

export const loadWeather = async (cityName: string): Promise<WeatherState> => {
  const city = await searchCity(cityName);
  const params = `lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=ru`;
  const [forecast, air] = await Promise.all([
    fetchJson<OpenWeatherForecast>(
      `https://api.openweathermap.org/data/2.5/forecast?${params}`,
    ),
    fetchJson<OpenWeatherAir>(
      `https://api.openweathermap.org/data/2.5/air_pollution?${params}`,
    ),
  ]);
  const current = firstOrThrow(
    forecast.list,
    "OpenWeather forecast response is empty",
  );
  const airData = firstOrThrow(
    air.list,
    "OpenWeather air pollution response is empty",
  );
  const timezoneOffsetSeconds = forecast.city?.timezone ?? 0;

  return {
    city,
    current: toWeatherPoint(current, 0, timezoneOffsetSeconds),
    hourly: buildHourlyForecast(forecast.list, timezoneOffsetSeconds),
    daily: buildDailyForecast(forecast.list, timezoneOffsetSeconds),
    air: {
      index: airData.main.aqi,
      label: aqiLabels[airData.main.aqi] ?? "Нет данных",
      components: {
        pm25: airData.components.pm2_5,
        pm10: airData.components.pm10,
        co: airData.components.co,
      },
    },
    updatedAt: new Date().toISOString(),
    source: "api",
  };
};
