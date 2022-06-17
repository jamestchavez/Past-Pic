// Constants
const NASA_API_KEY = "orR7avVLgSIHlctShMn825UHYNPINYB7iqOj2rAE"; // Terrible practice
const GEO_API_KEY = "40604de622334a63bcab330aff218a62";

// Global Variables
var lon = 0;
var lat = 0;
var currentCache = {};

// Buttons
let findMeButton = $('#find-me-btn')
let backButton = $('#go-back')
let searchButton = $('#search-btn')
let confirmDateButton = $('#confirm-date-btn')

// Geocoding API
//DEPRECATED: Do not use.
async function fetchLocalLocationInfo() { // Fetches lon/lat for the current user.
    let fetchPromise = await fetch("http://ip-api.com/json/").then(response => response.json()); 
    return {lon: fetchPromise.lon, lat: fetchPromise.lat};
}

async function getLocationFromZip(query) { // Fetches lon/lat for a specific zip code.
    let data =  await fetch("https://api.geoapify.com/v1/geocode/search" + makeQueryString({apiKey: GEO_API_KEY, text : query})).then(response => response.json())
    if (data.features && data.features.length > 0) {
        var properties = data.features[0].properties
        return {lon: properties.lon, lat: properties.lat}
    } else {
        return {}
    }
}

// Image API functions

// Makes query string from object
function makeQueryString(paramsObject) {
    var rawQueryString = "?"; 
    var currentIteration = 0;
    let objectLength = Object.keys(paramsObject).length
    for (var key in paramsObject) {
        currentIteration += 1;
        rawQueryString = rawQueryString + key + "=" + paramsObject[key];
        if (currentIteration < objectLength) {
            rawQueryString = rawQueryString + "&"
        }
    }
    return encodeURI(rawQueryString);
}

async function requestImage(lat, lon, dateString) {
    return new Promise((resolve, reject) => {
        setTimeout(reject, 2000)
        let query = makeQueryString({
            api_key : NASA_API_KEY,
            lat : lat,
            lon : lon,
            date : dateString,
            dim : 0.15
        });
        fetch("https://api.nasa.gov/planetary/earth/assets" + query)
            .then(response => {
                if (response.ok == false) {
                    reject();
                } else {
                    return response.json()
                }
            })
            .then(data => resolve(data.url))
            .catch(err => reject(err));
        
    })
}

async function requestBackupImage(dateString = "2020-06-20") {
    let data = await fetch("https://epic.gsfc.nasa.gov/api/natural/date/" + dateString).then(response => response.json())
    if (data[0]) {
        // @ts-ignore
        return "https://epic.gsfc.nasa.gov/archive/natural/" + dateString.replaceAll("-","/") + "/png/" + data[0].image + ".png";
    }
}

let locationImg = $("#location-img")
let warningLabel = $('.oops')

function resetImageDetails() {
    locationImg.attr("src","")
    warningLabel.hide();
}

function setImage(imgUrl) {
    locationImg.attr("src",imgUrl)
}

async function setImageFromAPI(lat, lon, dateString){
    resetImageDetails();
    

    let imgUrl = undefined;
    try {
        imgUrl = await requestImage(lat, lon, dateString)
    } catch (err) {
        console.log("Main API failed, doing backup...")
        // run backup
        try {
            imgUrl = await requestBackupImage(dateString)
        } catch {
            console.log("Backup API failed!") //TODO: Display something if backup also fails.
        } finally {
            if (imgUrl == undefined) {
                warningLabel.show();
            }
        }
    }

    setImage(imgUrl)
    if (imgUrl) {
        let added = addToHistory(dateString, imgUrl);
        if (added == true) {
            addHistoryButton(dateString)
        } 
    }
}
    
// Data getter and setter function for history
function getHistory() { // Fetches the leaderboard data from localStorage
    let historyObject = JSON.parse(localStorage.getItem("history"));
    if (!historyObject) {
        historyObject = {};
    }
    return historyObject
  }
  
function addToHistory(dateString, image) { //Adds a user to the leaderboard
    let historyObject = getHistory();
    let key = lon.toString() + lat.toString()
    if (!historyObject[key]) {
        historyObject[key] = {};
    }
    if (!historyObject[key][dateString]) {
        historyObject[key][dateString] = {
            url : image
        }
        currentCache = historyObject[key];
        localStorage.setItem("history", JSON.stringify(historyObject));
        return true;
    } else {
        return false;
    }
} 
  
// Dynamic HTML functions

let historyList = $("#history")

function addHistoryButton(dateString) { // Adds a button to the history list
    var newListItem = $("<li></li>");
    newListItem.append($('<button class="button is-rounded is-medium" style="width: 100%; margin-top: 10px;">'+ dateString +'</button>'));

    historyList.append(newListItem);
}

function populateHistory() {
    historyList.empty();
    let key = lon.toString() + lat.toString()
    let history = getHistory();
    if (history[key]) {
        for (let dateString in history[key]) {
            addHistoryButton(dateString);
        }
        currentCache = history[key];
    }
    
}

//function to alert the zip code doesn't meet requirements
function redAlert() {
    function undo(){
        $('#zip').removeClass('has-background-danger');
    }
    $('#zip').addClass('has-background-danger');
    setTimeout(undo, 500);
}

//find me function
async function findMe() {
    return new Promise((resolve, reject) => {
        async function success(pos) {
            const crd = pos.coords;
            

            let dayEntry = datepicker.value;
            let location = crd

            lat = location.latitude;
            lon = location.longitude;
            
            await setImageFromAPI(lat, lon, dayEntry);
            findMeButton.removeClass("is-loading");
            populateHistory();
            resolve(true)
        }
        
        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            findMeButton.removeClass("is-loading");
            resolve(false)
        }
        findMeButton.addClass("is-loading");
        navigator.geolocation.getCurrentPosition(success, error,  {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
    
}

//find zip code function
async function zipPass(zip) {
    let getCoord = await getLocationFromZip(zip);
    lat = getCoord.lat;
    lon = getCoord.lon;
    let dayEntry = datepicker.value;
    searchButton.addClass("is-loading");
    await setImageFromAPI(lat, lon, dayEntry);
    searchButton.removeClass("is-loading");
    populateHistory();
}

// Main Init function
$(document).ready(async () => {
    // Calendar
    $('#datepicker').datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd'
    }).datepicker('setDate', 'today');

    //search button on click actions
    searchButton.on('click', async () => {
        zipEntry = zip.value;
        if (zipEntry.length > 4 && zipEntry.length < 12) {
            await zipPass(zipEntry);
            $('#home').hide();
            $('#search-page').show();
            zip.value = "";
        } else {
            redAlert();
        }
    })

    //find my location button on click actions
    findMeButton.on('click', async () => {
        let success = await findMe();
        if (success == true) {
            $('#home').hide();
            $('#search-page').show();
        }
    })

    //go back button
    backButton.on('click', () => {
        $('#search-page').hide();
        $('#home').show();
    })

    //Show new date button
    confirmDateButton.on('click', async () => {
        dayEntry = datepicker.value;
        confirmDateButton.addClass("is-loading");
        await setImageFromAPI(lat, lon, dayEntry);
        confirmDateButton.removeClass("is-loading");
    })

    // Get data from previous searches
    historyList.on("click", "button", function(element) {
        if (currentCache[element.currentTarget.innerText]) {
            resetImageDetails();
            setImage(currentCache[element.currentTarget.innerText].url)
        } else {
            console.log("Not found in current cache",currentCache)
        }
    })
});