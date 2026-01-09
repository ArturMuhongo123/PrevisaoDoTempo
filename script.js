//  CHAVE DA API INSERIDA — USO LOCAL APENAS!
const API_KEY = '729a516a1fb4eeef64fa09675f0586f4';

const BASE_URL_CURRENT = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_URL_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

const QUICK_CITIES = [
  "Luanda", "Lisboa", "Paris", "Tokyo", "New York",
  "São Paulo", "Cairo", "Sydney", "Berlin", "Mumbai"
];

const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const currentWeatherEl = document.getElementById('current-weather');
const hourlyEl = document.getElementById('hourly-forecast');
const dailyEl = document.getElementById('daily-forecast');

const cityNameEl = document.getElementById('city-name');
const dateTimeEl = document.getElementById('date-time');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');

const hourlyContainer = document.getElementById('hourly-container');
const dailyContainer = document.getElementById('daily-container');
const quickCitiesButtons = document.getElementById('quick-cities-buttons');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Renderiza botões de cidades rápidas
QUICK_CITIES.forEach(city => {
  const btn = document.createElement('button');
  btn.className = 'city-btn';
  btn.textContent = city;
  btn.onclick = () => fetchWeatherData(city);
  quickCitiesButtons.appendChild(btn);
});

// Carrega última cidade ou padrão
window.addEventListener('DOMContentLoaded', () => {
  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    cityInput.value = lastCity;
    fetchWeatherData(lastCity);
  } else {
    fetchWeatherData("Lisbon");
  }

  // Aplica modo escuro salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  }
  updateThemeIcon();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    showError("Por favor, digite o nome de uma cidade.");
    return;
  }
  fetchWeatherData(city);
});

async function fetchWeatherData(city) {
  showLoading();
  hideError();

  try {
    const currentRes = await fetch(
      `${BASE_URL_CURRENT}?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    if (!currentRes.ok) {
      const err = await currentRes.json();
      throw new Error(err.message || `Cidade "${city}" não encontrada.`);
    }
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `${BASE_URL_FORECAST}?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    if (!forecastRes.ok) {
      throw new Error("Falha ao carregar previsão do tempo.");
    }
    const forecastData = await forecastRes.json();

    displayCurrentWeather(currentData);
    displayHourlyForecast(forecastData.list.slice(0, 8));
    displayDailyForecast(forecastData.list);

    localStorage.setItem('lastCity', city);
  } catch (err) {
    console.error("Erro:", err);
    showError(err.message || "Erro ao buscar dados meteorológicos.");
  } finally {
    hideLoading();
  }
}

function displayCurrentWeather(data) {
  const country = data.sys.country;
  cityNameEl.textContent = `${data.name}, ${country}`;
  dateTimeEl.textContent = new Date().toLocaleString('pt-BR');
  temperatureEl.textContent = Math.round(data.main.temp);
  feelsLikeEl.textContent = Math.round(data.main.feels_like);
  humidityEl.textContent = data.main.humidity;
  windSpeedEl.textContent = data.wind.speed.toFixed(1);
  descriptionEl.textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  currentWeatherEl.classList.remove('hidden');
}

function displayHourlyForecast(list) {
  hourlyContainer.innerHTML = '';
  list.forEach(item => {
    const time = new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit' });
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;

    const div = document.createElement('div');
    div.className = 'forecast-item';
    div.innerHTML = `
      <div class="forecast-time">${time}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Clima" />
      <div class="forecast-temp">${temp}°</div>
    `;
    hourlyContainer.appendChild(div);
  });
  hourlyEl.classList.remove('hidden');
}

function displayDailyForecast(list) {
  dailyContainer.innerHTML = '';
  const daily = {};

  list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR');
    if (!daily[date]) {
      daily[date] = { min: item.main.temp_min, max: item.main.temp_max, icon: item.weather[0].icon };
    } else {
      daily[date].min = Math.min(daily[date].min, item.main.temp_min);
      daily[date].max = Math.max(daily[date].max, item.main.temp_max);
    }
  });

  const days = Object.entries(daily).slice(0, 7);
  days.forEach(([date, data]) => {
    const div = document.createElement('div');
    div.className = 'forecast-item';
    div.innerHTML = `
      <div class="forecast-day">${date}</div>
      <img src="https://openweathermap.org/img/wn/${data.icon}.png" alt="Clima" />
      <div class="forecast-temp">${Math.round(data.min)}° / ${Math.round(data.max)}°</div>
    `;
    dailyContainer.appendChild(div);
  });

  dailyEl.classList.remove('hidden');
}

function showLoading() {
  loadingEl.classList.remove('hidden');
  [currentWeatherEl, hourlyEl, dailyEl].forEach(el => el.classList.add('hidden'));
}

function hideLoading() {
  loadingEl.classList.add('hidden');
}

function showError(message) {
  errorText.textContent = message;
  errorEl.classList.remove('hidden');
  [currentWeatherEl, hourlyEl, dailyEl].forEach(el => el.classList.add('hidden'));
}

function hideError() {
  errorEl.classList.add('hidden');
}

// === Modo Escuro Manual ===
function updateThemeIcon() {
  const icon = themeToggle.querySelector('i');
  if (body.classList.contains('dark-mode')) {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
});