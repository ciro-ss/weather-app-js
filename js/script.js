const key = "96b6147eef50080c2a6fc3b55ae4a076";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

const getWeather = async (city) => {
	try {
		const response = await fetch(
			`${weatherUrl}?q=${city}&appid=${key}&units=metric&lang=pt_br`
		);
		const data = await response.json();

		if (data.cod === "404") {
			return { error: true, message: "Cidade não encontrada" };
		}

		const temperature = Math.round(data.main.temp);
		const iconCode = data.weather[0].icon;
		const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
		const humidity = data.main.humidity;
		const windSpeed = data.wind.speed;

		updateWeatherDOM(
			data.name,
			temperature,
			data.weather[0].description,
			iconUrl,
			humidity,
			windSpeed
		);

		await getForecast(city);

		return { error: false };
	} catch (error) {
		return { error: true, message: error.message };
	}
};

const getForecast = async (city) => {
	try {
		const forecastResponse = await fetch(
			`${forecastUrl}?q=${city}&appid=${key}&units=metric&lang=pt_br`
		);
		const forecastData = await forecastResponse.json();

		if (forecastData.cod !== "200") {
			showError("Não foi possível obter a previsão.");
			return;
		}

		const dailyForecasts = forecastData.list
			.filter((forecast) => forecast.dt_txt.includes("12:00:00"))
			.slice(0, 4);
		updateForecastDOM(dailyForecasts);
	} catch (error) {
		console.error("Erro ao buscar dados de previsão", error);
		showError("Ocorreu um erro ao buscar dados de previsão.");
	}
};

const updateWeatherDOM = (
	cityName,
	temperature,
	description,
	iconUrl,
	humidity,
	windSpeed
) => {
	document.querySelector("#city").innerText = cityName;
	document.querySelector("#temperature").innerText = `${temperature}°C`;
	document.querySelector("#description").innerText = description;
	document.querySelector("#weather-icon").src = iconUrl;
	document.querySelector("#weather-icon").alt = description;
	document.querySelector("#humidity").innerText = `Umidade: ${humidity}%`;

	const now = new Date();
	const dateString = now.toLocaleDateString("pt-BR", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
	document.querySelector("#date").innerText = dateString;

	const windSpeedKmH = (windSpeed * 3.6).toFixed(1);
	document.querySelector(
		"#wind-speed"
	).innerText = `Vento: ${windSpeedKmH}km/h`;
};

const createForecastCard = (forecast) => {
	const card = document.createElement("div");
	card.classList.add("forecast-card");

	const dateElement = document.createElement("p");
	dateElement.classList.add("day");
	const date = new Date(forecast.dt_txt).toLocaleDateString("pt-BR", {
		weekday: "long",
	});
	dateElement.innerText = date;
	card.appendChild(dateElement);

	const iconElement = document.createElement("img");
	const iconCode = forecast.weather[0].icon;
	iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
	iconElement.alt = forecast.weather[0].description;
	card.appendChild(iconElement);

	const tempElement = document.createElement("p");
	tempElement.classList.add("temp");
	const temperature = Math.round(forecast.main.temp);
	tempElement.innerText = `${temperature} °C`;
	card.appendChild(tempElement);

	return card;
};

const updateForecastDOM = (forecasts) => {
	const forecastContainer = document.querySelector(".forecast");
	forecastContainer.innerHTML = "";

	forecasts.forEach((forecast) => {
		const card = createForecastCard(forecast);
		forecastContainer.appendChild(card);
	});
};

const showError = (message) => {
	const errorElement = document.getElementById("error-message");

	if (message) {
		errorElement.style.display = "block";
		errorElement.innerText = message;
	} else {
		errorElement.style.display = "none";
	}
};

const searchWeather = async () => {
	const city = cityInput.value.trim();

	if (!city) {
		showError("Por favor, insira o nome de uma cidade!");
		cityInput.value = "";
		cityInput.focus();
		return;
	}

	const loadingContainer = document.querySelector(".loading-container");
	const loading = document.querySelector(".loading");
	loading.style.display = "flex";

	try {
		const result = await getWeather(city);

		if (result.error) {
			showError(result.message || "Cidade não encontrada. Tente novamente");
		} else {
			showError();
			loadingContainer.classList.add("hide");
			document.querySelector("main").classList.remove("hide");
		}
	} catch (error) {
		showError("Ocorreu um erro ao buscar o clima. Tente novamente!");
	} finally {
		loading.style.display = "none";
	}

	cityInput.value = "";
	cityInput.focus();
};

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

searchBtn.addEventListener("click", searchWeather);
cityInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		searchWeather();
	}
});
