const themeToggle = document.getElementById("themeToggle");
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");

const locationName = document.getElementById("locationName");
const temperature = document.getElementById("temperature");
const conditionText = document.getElementById("conditionText");
const weatherIcon = document.getElementById("weatherIcon");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const recentList = document.getElementById("recentList");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "Light" : "Dark";
});

function getWeatherInfo(code) {
  const weatherCodes = {
    0: { text: "Clear sky", icon: "☀️" },
    1: { text: "Mainly clear", icon: "🌤️" },
    2: { text: "Partly cloudy", icon: "⛅" },
    3: { text: "Overcast", icon: "☁️" },
    45: { text: "Fog", icon: "🌫️" },
    48: { text: "Rime fog", icon: "🌫️" },
    51: { text: "Light drizzle", icon: "🌦️" },
    53: { text: "Drizzle", icon: "🌦️" },
    55: { text: "Heavy drizzle", icon: "🌧️" },
    61: { text: "Light rain", icon: "🌧️" },
    63: { text: "Rain", icon: "🌧️" },
    65: { text: "Heavy rain", icon: "⛈️" },
    71: { text: "Light snow", icon: "🌨️" },
    73: { text: "Snow", icon: "🌨️" },
    75: { text: "Heavy snow", icon: "❄️" },
    80: { text: "Rain showers", icon: "🌦️" },
    81: { text: "Rain showers", icon: "🌧️" },
    82: { text: "Heavy showers", icon: "⛈️" },
    95: { text: "Thunderstorm", icon: "⛈️" },
  };

  return weatherCodes[code] || { text: "Unknown conditions", icon: "🌡️" };
}

async function getCityCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

  const response = await fetch(geoUrl);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Please try another city.");
  }

  return data.results[0];
}

async function getWeatherData(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;

  const response = await fetch(weatherUrl);

  if (!response.ok) {
    throw new Error("Weather data could not be loaded.");
  }

  return response.json();
}

function saveRecentCities() {
  localStorage.setItem("recentCities", JSON.stringify(recentCities));
}

function renderRecentCities() {
  recentList.innerHTML = "";

  recentCities.forEach((city) => {
    const button = document.createElement("button");
    button.className = "recent-city";
    button.textContent = city;

    button.addEventListener("click", () => {
      cityInput.value = city;
      updateWeather(city);
    });

    recentList.appendChild(button);
  });
}

function addRecentCity(city) {
  recentCities = recentCities.filter(
    (savedCity) => savedCity.toLowerCase() !== city.toLowerCase()
  );

  recentCities.unshift(city);

  if (recentCities.length > 5) {
    recentCities.pop();
  }

  saveRecentCities();
  renderRecentCities();
}

async function updateWeather(city) {
  try {
    message.textContent = "Loading weather data...";

    const cityData = await getCityCoordinates(city);
    const weatherData = await getWeatherData(cityData.latitude, cityData.longitude);
    const current = weatherData.current;
    const weatherInfo = getWeatherInfo(current.weather_code);

    locationName.textContent = `${cityData.name}, ${cityData.country_code}`;
    temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
    conditionText.textContent = weatherInfo.text;
    weatherIcon.textContent = weatherInfo.icon;
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    humidity.textContent = `${current.relative_humidity_2m}%`;
    windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

    message.textContent = "";
    addRecentCity(cityData.name);
  } catch (error) {
    message.textContent = error.message;
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    message.textContent = "Please enter a city name.";
    return;
  }

  updateWeather(city);
});

renderRecentCities();
updateWeather("London");