const NASA_API_KEY = "orR7avVLgSIHlctShMn825UHYNPINYB7iqOj2rAE"; // Terrible practice
const GEO_API_KEY = "40604de622334a63bcab330aff218a62";
//@ts-check
var lon = 0;
var lat = 0;

//function to alert the zip code doesn't meet requirements
function redAlert() {
    function undo(){
        $('#zip').removeClass('has-background-danger');
    }
    $('#zip').addClass('has-background-danger');
    setTimeout(undo, 500);
}

$(document).ready(async () => {
    //search button on click actions
    $('#search-btn').on('click', async () => {
        zipEntry = zip.value;
        if (zipEntry.length > 4 && zipEntry.length < 12){
            $('#home').hide();
            $('#search-page').show();
            zipPass(zipEntry);
            zip.value = "";
        } else {
            redAlert();
        }
    })

    //find my location button on click actions
    $('#find-me-btn').on('click', () => {
        $('#home').hide();
        $('#search-page').show();
        findMe();
        
        

    })

    //go back button
    $('#go-back').on('click', () => {
        $('#search-page').hide();
        $('#home').show();
    })

    //Show new date button
    $('#show-img').on('click', () => {
        dayEntry = datepicker.value;
        console.log(dayEntry);
    }
    )

});

//find me function
async function findMe(){
    dayEntry = datepicker.value;
    let location = await fetchLocalLocationInfo();
    lat = location.lat;
    lon = location.lon;
    requestImage(lat, lon, dayEntry);
}

//find zip code function
async function zipPass(zip) {
    let getCoord = await getLocationFromZip(zip);
    lat = getCoord.lat;
    lon= getCoord.lon;
    dayEntry = datepicker.value;
    requestImage(lat, lon, dayEntry);
}

//calendar function
$(function(){
    $('#datepicker').datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd'
    }).datepicker('setDate', 'today');
});


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

async function fetchLocalLocationInfo() {
    let fetchPromise = await fetch("http://ip-api.com/json/").then(response => response.json());
    return {lon: fetchPromise.lon, lat: fetchPromise.lat};
}

async function getLocationFromZip(query) {
    let data =  await fetch("https://api.geoapify.com/v1/geocode/search" + makeQueryString({apiKey: GEO_API_KEY, text : query})).then(response => response.json())
    if (data.features && data.features.length > 0) {
        var properties = data.features[0].properties
        return {lon: properties.lon, lat: properties.lat}
    } else {
        return {}
    }
}


async function requestImage(lat, lon, dateString) {
    return new Promise((resolve, reject) => {
        setTimeout(reject, 2000)
        console.log(lat, lon, dateString);
        let query = makeQueryString({
            api_key : NASA_API_KEY,
            lat : lat,
            lon : lon,
            date : dateString
        });
        fetch("https://api.nasa.gov/planetary/earth/imagery" + query).then(response => response.json())
            .then(data => resolve(data))
        
    })
}

async function requestBackupImage(dateString = "2020-06-20") {
    let data = await fetch("https://epic.gsfc.nasa.gov/api/natural/date/" + dateString).then(response => response.json())
    
    if (data[0]) {
        // @ts-ignore
        return "https://epic.gsfc.nasa.gov/archive/natural/" + dateString.replaceAll("-","/") + "/png/" + data[0].image + ".png";
    }
}

// // @ts-ignore
// $(async function () {
    
    
//     let localLocationInfo = await fetchLocalLocationInfo() // Used for "Find me" button
//     let locationInfo = await getLocationFromZip("11111")
    

//     // Example implementation of backup API

//     let locationImg = $("#location-img")

//     requestImage(1,1,"2020-06-20").then(data => {
//         console.log(data) // Dunno what this API responds with since its broken
//     }).catch(async error => {
//         console.log("Main API failed, doing backup...")
//         // run backup
//         try {
//             let imgUrl = await requestBackupImage()
//             console.log(imgUrl)
//             locationImg.attr("src",imgUrl)
//         } catch {
//             console.log("Backup failed!") //TODO: Display something if backup also fails.
//         }
//     }) 
// })
