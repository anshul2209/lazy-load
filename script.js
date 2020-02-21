//Globals to keep track of current page till which data has been loaded and total images to show
let page = 1;
const initialImageCount = 24;
const url = "https://www.urbanclap.com/api/v1/seo_media/getSeoImages";

//Function to handle select
const handleSelect = function () {
    initialImageCount = document.getElementById("totalimageSelect").value;
}

//Debounce function to prevent unnecessary firing of scroll event 
const debounce = function (func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

//Function to dynamically create slides and append to the DOM
const createImages = function (mediaFiles, callback) {
    for (let i = 0; i < mediaFiles.length; i++) {
        const currentMedia = mediaFiles[i];
        const newDiv = document.createElement("div");
        const description = document.createElement("p");
        const text = document.createTextNode(currentMedia.description || 'weddings');
        description.setAttribute('class', 'imageDescription');
        description.appendChild(text);
        const imageElement = document.createElement("img");
        imageElement.setAttribute("src", currentMedia.url);
        newDiv.appendChild(imageElement);
        newDiv.appendChild(description);
        newDiv.setAttribute('class', 'mediawrapper')
        const currentDiv = document.getElementById("wrapper");
        currentDiv.appendChild(newDiv);
    }
    callback();
}

//Function to fetch images from API
const getImages = function (pageNumber, callback) {
    const http = new XMLHttpRequest();
    const params = JSON.stringify({
        "url": "https://www.urbanclap.com/weddings/ideas/candid-photography",
        "page_number": pageNumber,
        "no_fetch_filters": false
    });
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/json");
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            const repsonse = JSON.parse(http.responseText);
            const mediaFiles = repsonse.success.data.media;
            callback(mediaFiles);
        }
    }
    http.send(params);
}

//Initial Loading the page with default page 1 with 24 slides
getImages(1, function (files) {
    createImages(files, function () {
        document.getElementById('totalimages').innerHTML = document.querySelectorAll('.mediawrapper').length + ' slides are present on screen till page ' + page;
    })
});

//Function to handle loading when end of window is reached
window.onscroll = debounce(function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // Display loading till the time data has not been loaded to screen
        document.getElementById('loading').style.display = 'block';
        let allmedia = [];
        let pageNumber = [];

        //calculate the pages to fetch the data
        const number = parseInt(initialImageCount / 24, 10);
        for (let i = 1; i <= number; i++) {
            pageNumber.push(page + i);
        }

        // Keep a local counter to count the number of async calls
        let count = 0;
        pageNumber.forEach(function (page_no) {
            getImages(page_no, function (files) {
                allmedia = allmedia.concat(files);
                count++;
                if (count === pageNumber.length) { //All the async calls have been finished, handle the final callback
                    page = pageNumber.slice(-1)[0];
                    createImages(allmedia, function () {
                        document.getElementById('loading').style.display = 'none';
                        document.getElementById('totalimages').innerHTML = document.querySelectorAll('.mediawrapper').length + ' slides are present on screen till page ' + page;
                    });
                }
            });
        })
    }
}, 100);