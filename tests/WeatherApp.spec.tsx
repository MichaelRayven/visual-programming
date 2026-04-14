import { beforeEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import App from "../src/App";
import { AirQualityCard, CitySearch, CurrentWeather } from "../src/components";
import {
  createMockWeatherForCity,
  mockCities,
  mockWeather,
} from "../src/weatherMock";
import * as weatherModule from "../src/weather";

vi.mock("../src/weather", async () => {
  const actual = await vi.importActual<typeof import("../src/weather")>(
    "../src/weather",
  );
  const weatherMockModule =
    await vi.importActual<typeof import("../src/weatherMock")>(
      "../src/weatherMock",
    );

  return {
    ...actual,
    loadWeather: vi.fn(async (cityName: string) =>
      weatherMockModule.createMockWeatherForCity(cityName),
    ),
    loadCitySuggestions: vi.fn(async (query: string) => {
      const normalized = query.trim().toLowerCase();

      if (normalized.length < 2) {
        return [];
      }

      return weatherMockModule.mockCities.filter((city) =>
        city.name.toLowerCase().includes(normalized),
      );
    }),
  };
});

describe("Weather app", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders current weather city and temperature", async () => {
    const londonWeather = createMockWeatherForCity("London");
    const { getByText } = await render(
      <CurrentWeather weather={londonWeather} />,
    );

    await expect.element(getByText("London, GB")).toBeVisible();
    await expect
      .element(
        getByText(weatherModule.formatTemperature(londonWeather.current.temp)),
      )
      .toBeVisible();
  });

  test("renders air pollution data", async () => {
    const { getByText } = await render(
      <AirQualityCard air={mockWeather.air} />,
    );

    await expect.element(getByText("AQI 2")).toBeVisible();
    await expect
      .element(getByText(mockWeather.air.components.pm10.toFixed(1)))
      .toBeVisible();
  });

  test("selects visual mood class by weather condition", () => {
    expect(weatherModule.getWeatherMood("Rain")).toBe("weather-app--rain");
    expect(weatherModule.getWeatherMood("Snow")).toBe("weather-app--snow");
    expect(weatherModule.getWeatherMood("Clear")).toBe("weather-app--clear");
  });

  test("uses mocked weather response on initial app load", async () => {
    const loadWeatherMock = vi.mocked(weatherModule.loadWeather);
    loadWeatherMock.mockResolvedValueOnce(createMockWeatherForCity("London"));
    const { getByText } = await render(<App />);

    await expect.element(getByText("London, GB")).toBeVisible();
    expect(loadWeatherMock).toHaveBeenCalledWith("Novosibirsk");
  });

  test("shows loading state while initial weather request is pending", async () => {
    const loadWeatherMock = vi.mocked(weatherModule.loadWeather);
    loadWeatherMock.mockImplementationOnce(
      () => new Promise(() => undefined),
    );
    const { getByText } = await render(<App />);

    await expect.element(getByText("Loading forecast...")).toBeVisible();
  });

  test("changes mocked forecast when city changes", async () => {
    const loadWeatherMock = vi.mocked(weatherModule.loadWeather);
    const { getByLabelText, getByText } = await render(<App />);

    const cityInput = getByLabelText("Город");
    await cityInput.click();
    await cityInput.fill("Lo");
    await getByText("London").click();

    await expect.element(getByText("London, GB")).toBeVisible();
    expect(loadWeatherMock).toHaveBeenCalledWith("London");
  });

  test("returns complete mock weather with hourly and daily forecast", () => {
    const londonWeather = createMockWeatherForCity("London");

    expect(londonWeather.hourly).toHaveLength(8);
    expect(londonWeather.daily).toHaveLength(5);
    expect(londonWeather.source).toBe("mock");
    expect(londonWeather.city.name).toBe("London");
  });

  test("renders city suggestions from weather mock", async () => {
    const { getByLabelText, getByText } = await render(
      <CitySearch
        city="Lo"
        disabled={false}
        onChange={() => undefined}
      />,
    );

    const cityInput = getByLabelText("Город");
    await cityInput.click();
    await cityInput.fill("Lo");

    await expect.element(getByText("London")).toBeVisible();
    expect(mockCities.some((city) => city.name === "London")).toBe(true);
  });
});
