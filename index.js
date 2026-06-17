document.addEventListener("DOMContentLoaded", () => {
  const searchFormElement = document.querySelector("#search-form");
  searchFormElement.addEventListener("submit", handleSearchSubmit);

  searchCity("Berlin");
});

function refreshWeather(response) {
  const temperatureElement = document.querySelector("#temperature");
  const cityElement = document.querySelector("#city");
  const descriptionElement = document.querySelector("#description");
  const humidityElement = document.querySelector("#humidity");
  const windSpeedElement = document.querySelector("#wind-speed");
  const timeElement = document.querySelector("#time");
  const iconElement = document.querySelector("#icon");


  if (!response || !response.data) return;

  const temperature = response.data.temperature?.current ?? null;
  const date = new Date((response.data.time ?? Date.now() / 1000) * 1000);

  cityElement.textContent = response.data.city ?? "";
  timeElement.textContent = formatDate(date);
  descriptionElement.textContent = response.data.condition?.description ?? "";
  humidityElement.textContent = `${response.data.temperature?.humidity ?? ""}%`;
  windSpeedElement.textContent = `${response.data.wind?.speed ?? ""} km/h`;
  temperatureElement.textContent = temperature !== null ? Math.round(temperature) : "";

  const iconUrl = response.data.condition?.icon_url ?? "";
  iconElement.innerHTML = iconUrl ? `<img src="${iconUrl}" class="weather-app-icon" alt="weather icon" />` : "";

  // request forecast for the same city
  getForecast(response.data.city);
}

function formatDate(date) {
  let minutes = date.getMinutes();
  let hours = date.getHours();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[date.getDay()];

  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  return `${day} ${hours}:${minutes}`;
}

function searchCity(city) {
  const apiKey = "66db02e29ab4305o5a5c75fc1b23aet8";
  const apiUrl = `https://api.shecodes.io/weather/v1/current?query=${encodeURIComponent(city)}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(refreshWeather).catch((err) => {
    console.error("Current weather request failed:", err);
  });
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const searchInput = document.querySelector("#search-form-input");
  const q = searchInput.value.trim();
  if (!q) return;
  searchCity(q);
}

function formatDay(timestamp) {
  const date = new Date(timestamp * 1000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function getForecast(city) {
  const apiKey = "66db02e29ab4305o5a5c75fc1b23aet8";

  const apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${encodeURIComponent(city)}&key=${apiKey}&units=metric`;
  axios
    .get(apiUrl)
    .then(displayForecast)
    .catch((err) => {
      console.error("Forecast request failed:", err);
    });

}

function displayForecast(response) {
  if (!response || !response.data || !Array.isArray(response.data.daily)) {
    console.warn("No forecast data available");
    return;
  }

  let forecastHtml = "";

  response.data.daily.forEach(function (day, index) {
    if (index < 5) {
      const dayName = formatDay(day.time);
      const iconUrl = day.condition?.icon_url ?? "";
      const maxTemp = Math.round(day.temperature?.maximum ?? "");
      const minTemp = Math.round(day.temperature?.minimum ?? "");

      forecastHtml += `
      <div class="weather-forecast-day">
        <div class="weather-forecast-date">${dayName}</div>
        <img src="${iconUrl}" class="weather-forecast-icon" alt="forecast icon"/>
        <div class="weather-forecast-temperatures">
          <div class="weather-forecast-temperature">
            <strong>${maxTemp}º</strong>
          </div>
          <div class="weather-forecast-temperature">${minTemp}º</div>
        </div>
      </div>
    `;
    }
  });

  const forecastElement = document.querySelector("#forecast");
  forecastElement.innerHTML = forecastHtml;
}
