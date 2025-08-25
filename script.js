// console.log("Hello, World!");

// const API_KEY = "7b7da2c448a40054d66e66affbc8e277";

// async function fetchWeatherData(city) {

//     let city = "goa";
//     const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
//     const data = await response.json();
//     console.log("weather data:", data);

//     let newPara = document.createElement("p");
//     newPara.textContent = '${data?.main?.temp.toFixed(2)}' + "°C";
//     document.body.appendChild(newPara);
//     return data;
// }

 const userTab = document.querySelector("[data-userWeather]");
 const searchTab = document.querySelector("[data-searchWeather]");
 const userContainer = document.querySelector(".weather-container");

 const grantAccessBtn = document.querySelector("[data-grantAccess]");
 const grantAccessContainer = document.querySelector(".grant-location-container");
 const loadingScreen = document.querySelector(".loading-container");
 const userInfoContainer = document.querySelector(".user-info-container");

 const formContainer = document.querySelector(".form-container");
 const searchInput = document.querySelector("[data-searchInput]");
 const searchForm = document.querySelector("[data-searchForm]");
 

 let currentTab = userTab;
 const API_KEY = "7b7da2c448a40054d66e66affbc8e277";
currentTab.classList.add("current-tab");
  getFromSessionStorage();

 function switchTab(clickedTab) {
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        //hide error container on tab switch
        errorContainer.classList.remove("active");

        if(!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // we have to display the weather info
            getFromSessionStorage(); 
        }
    }
 }


 userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
 });

 searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
 });

 //check if coordinates are already present in session storage

 function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        // local coordinates are not available
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates); 
    }
 }

 async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon} = coordinates;
    //make grantntainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");


    //API CALL

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    }

        catch (error) {
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.remove("active");
            console.error("Error fetching user weather info:", error);
        }
 } 

 function renderWeatherInfo(weatherInfo) {
    //firstly we have to fetch the element

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");   
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch info from weatherinfo object and put it in UI elements

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/w320/${weatherInfo?.sys?.country?.toLowerCase()}.png`; 
    desc.innerText = weatherInfo?.weather?.[0]?.description; 
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

grantAccessBtn.addEventListener('click', getLocation);

    function getLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }

    function showPosition(position) {
        const userCoordinates = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }

        sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
        fetchUserWeatherInfo(userCoordinates);
    }
     
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let cityName = searchInput.value;
        if(cityName === "") {
            return;
        } else {
            fetchSearchWeatherInfo(cityName);
        }
    })

    const errorContainer = document.querySelector(".error-container");

   async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");

    try {
        const response =await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");

        if(data.cod === "404"){
            //show error container
            errorContainer.classList.add("active");
        } else{
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data); 
        }
        
    }
    catch (error) {
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        errorContainer.classList.add("active");
        console.error("Error fetching search weather info:", error);
    }
 }
