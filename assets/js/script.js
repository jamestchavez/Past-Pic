
const NASA_API_KEY = "orR7avVLgSIHlctShMn825UHYNPINYB7iqOj2rAE"; // Terrible practice
const GEO_API_KEY = "40604de622334a63bcab330aff218a62";

// Makes query string from objject
function makeQueryString(paramsObject) {
    var rawQueryString = "?"; 
    var currentInteration = 0;
    let objectLength = Object.keys(paramsObject).length
    for (var key in paramsObject) {
        currentInteration += 1;
        rawQueryString = rawQueryString + key + "=" + paramsObject[key];
        if (currentInteration < objectLength) {
            rawQueryString = rawQueryString + "&"
        }
    }
    return encodeURI(rawQueryString);
}

async function fetchLocationInfo() {
    let fetchPromise = await fetch("http://ip-api.com/json/").then(response => response.json());
    return {lon: fetchPromise.lon, lat: fetchPromise.lat}
}

async function getLocation(query) {
    let data =  await fetch("https://api.geoapify.com/v1/geocode/search" + makeQueryString({apiKey: GEO_API_KEY, text : query})).then(response => response.json())
    if (data.features && data.features.length > 0) {
        var properties = data.features[0].properties
        return {lon: properties.lon, lat: properties.lat}
    } else {
        return {}
    }
}

async function requestImage(lat, lon, dateString) {
    let query = makeQueryString({
        api_key : API_KEY,
        lat : lat,
        lon : lon,
        date : dateString
    });
    return fetch("https://api.nasa.gov/planetary/earth/imagery" + query)
}

$(async function () {
    let ip = await fetchLocationInfo()
    console.log(await getLocation("78258"))
})