const NASA_API_KEY = "orR7avVLgSIHlctShMn825UHYNPINYB7iqOj2rAE"; // Terrible practice
const GEO_API_KEY = "40604de622334a63bcab330aff218a62";


function redAlert() {
    function undo(){
        $('#zip').removeClass('has-background-danger');
    }
    $('#zip').addClass('has-background-danger');
    setTimeout(undo, 500);
}

$(document).ready(() => {
    $('#search-btn').on('click', () => {
        zipEntry = zip.value;
        if (zipEntry.length > 4 && zipEntry.length < 12){
            $('#home').hide();
            $('#search-page').show();
            console.log(zipEntry);
            zip.value = "";
        } else {
            redAlert();
        }
    })

    $('#find-me-btn').on('click', () => {
        inSide = datepicker
        $('#home').hide();
        $('#search-page').show();

    })

    $('#go-back').on('click', () => {
        $('#search-page').hide();
        $('#home').show();
    })
    $('#show-img').on('click', () => {
        dayEntry = datepicker.value;
        console.log(dayEntry);
    }
    )

});




$(function(){
    $('#datepicker').datepicker({
        changeMonth: true,
        changeYear: true
    });
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
    return {lon: fetchPromise.lon, lat: fetchPromise.lat}
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

// @ts-ignore
$(async function () {
    let localLocationInfo = await fetchLocalLocationInfo() // Used for "Find me" button
    let locationInfo = await getLocationFromZip("11111")
    

    // Example implementation of backup API
    requestImage(1,1,"2020-06-20").then(data => {
        console.log(data)
    }).catch(async error => {
        console.log("Main API failed, doing backup...")
        // run backup
        try {
            let imgUrl = await requestBackupImage()
            console.log(imgUrl)
        } catch {
            console.log("Backup failed!")
        }
    }) 
})
