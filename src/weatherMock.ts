import type { Coordinates, WeatherState } from "./weather";

export const mockCities: Coordinates[] = [
  { name: "Novosibirsk", country: "RU", lat: 55.0415, lon: 82.9346 },
  { name: "London", country: "GB", lat: 51.5073, lon: -0.1277 },
];

const weatherFixtures: Record<string, WeatherState> = {
  novosibirsk: {
    city: mockCities[0],
    current: {
      date: "2026-04-14",
      time: "Now",
      temp: 7,
      feelsLike: 5,
      humidity: 72,
      pressure: 758,
      wind: 5,
      icon: "10d",
      description: "light rain",
      condition: "Rain",
    },
    hourly: [
      { date: "2026-04-14", time: "Now", temp: 7, feelsLike: 5, humidity: 72, pressure: 758, wind: 5, icon: "10d", description: "light rain", condition: "Rain" },
      { date: "2026-04-14", time: "03:00", temp: 6, feelsLike: 4, humidity: 75, pressure: 759, wind: 5.3, icon: "10d", description: "light rain", condition: "Rain" },
      { date: "2026-04-14", time: "06:00", temp: 5, feelsLike: 3, humidity: 78, pressure: 759, wind: 5.5, icon: "10d", description: "light rain", condition: "Rain" },
      { date: "2026-04-14", time: "09:00", temp: 8, feelsLike: 6, humidity: 70, pressure: 758, wind: 5.4, icon: "10d", description: "light rain", condition: "Rain" },
      { date: "2026-04-14", time: "12:00", temp: 9, feelsLike: 7, humidity: 68, pressure: 757, wind: 5.1, icon: "10d", description: "light rain", condition: "Rain" },
      { date: "2026-04-14", time: "15:00", temp: 8, feelsLike: 6, humidity: 70, pressure: 757, wind: 4.9, icon: "10d", description: "light rain", condition: "Rain" },
      { date: "2026-04-14", time: "18:00", temp: 6, feelsLike: 4, humidity: 74, pressure: 758, wind: 5.2, icon: "10d", description: "light rain", condition: "Rain" },
      { date: "2026-04-14", time: "21:00", temp: 5, feelsLike: 3, humidity: 77, pressure: 759, wind: 5.4, icon: "10d", description: "light rain", condition: "Rain" },
    ],
    daily: [
      { date: "2026-04-15", title: "Wed 15", min: 3, max: 8, icon: "10d", description: "light rain" },
      { date: "2026-04-16", title: "Thu 16", min: 2, max: 7, icon: "10d", description: "light rain" },
      { date: "2026-04-17", title: "Fri 17", min: 1, max: 6, icon: "04d", description: "overcast clouds" },
      { date: "2026-04-18", title: "Sat 18", min: 2, max: 7, icon: "04d", description: "overcast clouds" },
      { date: "2026-04-19", title: "Sun 19", min: 3, max: 9, icon: "10d", description: "light rain" },
    ],
    air: {
      index: 2,
      label: "Good",
      components: { pm25: 6.8, pm10: 13.4, co: 230 },
    },
    updatedAt: "2026-04-14T09:00:00.000Z",
    source: "mock",
  },
  london: {
    city: mockCities[1],
    current: {
      date: "2026-04-14",
      time: "Now",
      temp: 13,
      feelsLike: 11,
      humidity: 79,
      pressure: 761,
      wind: 4,
      icon: "09d",
      description: "drizzle",
      condition: "Drizzle",
    },
    hourly: [
      { date: "2026-04-14", time: "Now", temp: 13, feelsLike: 11, humidity: 79, pressure: 761, wind: 4, icon: "09d", description: "drizzle", condition: "Drizzle" },
      { date: "2026-04-14", time: "03:00", temp: 12, feelsLike: 10, humidity: 81, pressure: 762, wind: 4.1, icon: "09d", description: "drizzle", condition: "Drizzle" },
      { date: "2026-04-14", time: "06:00", temp: 11, feelsLike: 9, humidity: 83, pressure: 762, wind: 4.2, icon: "09d", description: "drizzle", condition: "Drizzle" },
      { date: "2026-04-14", time: "09:00", temp: 14, feelsLike: 12, humidity: 77, pressure: 761, wind: 3.9, icon: "09d", description: "drizzle", condition: "Drizzle" },
      { date: "2026-04-14", time: "12:00", temp: 15, feelsLike: 13, humidity: 75, pressure: 760, wind: 3.8, icon: "09d", description: "drizzle", condition: "Drizzle" },
      { date: "2026-04-14", time: "15:00", temp: 14, feelsLike: 12, humidity: 76, pressure: 760, wind: 3.9, icon: "09d", description: "drizzle", condition: "Drizzle" },
      { date: "2026-04-14", time: "18:00", temp: 12, feelsLike: 10, humidity: 80, pressure: 761, wind: 4.1, icon: "09d", description: "drizzle", condition: "Drizzle" },
      { date: "2026-04-14", time: "21:00", temp: 11, feelsLike: 9, humidity: 82, pressure: 762, wind: 4.2, icon: "09d", description: "drizzle", condition: "Drizzle" },
    ],
    daily: [
      { date: "2026-04-15", title: "Wed 15", min: 10, max: 14, icon: "09d", description: "drizzle" },
      { date: "2026-04-16", title: "Thu 16", min: 9, max: 13, icon: "10d", description: "light rain" },
      { date: "2026-04-17", title: "Fri 17", min: 8, max: 12, icon: "10d", description: "light rain" },
      { date: "2026-04-18", title: "Sat 18", min: 9, max: 13, icon: "04d", description: "broken clouds" },
      { date: "2026-04-19", title: "Sun 19", min: 10, max: 15, icon: "03d", description: "scattered clouds" },
    ],
    air: {
      index: 1,
      label: "Excellent",
      components: { pm25: 4.1, pm10: 10.2, co: 205 },
    },
    updatedAt: "2026-04-14T09:00:00.000Z",
    source: "mock",
  },
};

const DEFAULT_CITY_KEY = "novosibirsk";

const cloneWeatherState = (state: WeatherState): WeatherState => ({
  city: { ...state.city },
  current: { ...state.current },
  hourly: state.hourly.map((point) => ({ ...point })),
  daily: state.daily.map((day) => ({ ...day })),
  air: {
    index: state.air.index,
    label: state.air.label,
    components: { ...state.air.components },
  },
  updatedAt: state.updatedAt,
  source: "mock",
});

const normalizeKey = (cityName: string) => cityName.trim().toLowerCase();

export const createMockWeatherForCity = (cityName: string): WeatherState => {
  const key = normalizeKey(cityName);
  const fixture = weatherFixtures[key] ?? weatherFixtures[DEFAULT_CITY_KEY];

  return cloneWeatherState(fixture);
};

export const mockWeather: WeatherState = createMockWeatherForCity("Novosibirsk");
