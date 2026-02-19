import { useEffect, useState } from "react";
import { getWeatherByCity } from "../../utils/weatherService";


function WeatherCard() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await getWeatherByCity("Iritty");
      setWeather(data);
    };

    fetchWeather();
  }, []);

  if (!weather) return <p>Loading weather...</p>;

  return (
    <div className="weather-card">
      <h3>🌦  Weather</h3>
      <p>🌡 Temp: {weather.main.temp}°C</p>
      <p>💧 Humidity: {weather.main.humidity}%</p>
      <p>🌥 Condition: {weather.weather[0].description}</p>
    </div>
  );
}

export default WeatherCard;
