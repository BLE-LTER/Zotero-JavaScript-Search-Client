// Requires cors.js to be loaded first

"use strict";

var ZOTERO_CONFIG = {
    "publicGroupId": "2055673",  // ID of public group to search in Zotero
    "limit": 10,  // Max number of results to retrieve per page
    "resultsElementId": "searchResults",  // Element to contain results
    "urlElementId": "searchUrl",  // Element to display search URL
    "countElementId": "resultCount",  // Element showing number of results
    "pagesElementId": "pagination",  // Element to display result page links
    "showPages": 5  // MUST BE ODD NUMBER! Max number of page links to show
};


// Get URL arguments
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// Parse Zotero search results into HTML
function parseZoteroResults(resultText) {
    var results = JSON.parse(resultText);
    var html = [];
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        html.push(result["bib"]);
    }
    if (html.length) {
        return html.join("<br>");
    }
    else {
        return "<p>Your search returned no results.</p>";
    }
}


function show_loading(isLoading) {
    var x = document.getElementById("loading-div");
    if (isLoading) {
        document.body.style.cursor = "wait";
        x.style.display = "block";
    }
    else {
        document.body.style.cursor = "default";
        x.style.display = "none";
    }
}


// Function to call if CORS request is successful
function successCallback(headers, response) {
    show_loading(false);

    // Write results to page
    var resultHtml = parseZoteroResults(response);
    var elementId = ZOTERO_CONFIG["resultsElementId"];
    document.getElementById(elementId).innerHTML = resultHtml;

    // Add links to additional search result pages if necessary
    var currentStart = getParameterByName("start");
    if (!currentStart) {
        currentStart = 0;
    }
    else {
        currentStart = parseInt(currentStart);
    }
    var count = parseInt(headers["total-results"]);
    var limit = parseInt(ZOTERO_CONFIG["limit"]);
    var showPages = parseInt(ZOTERO_CONFIG["showPages"]);
    var pageElementId = ZOTERO_CONFIG["pagesElementId"];
    showPageLinks(count, limit, showPages, currentStart, pageElementId);
    var query = getParameterByName("q");
    showResultCount(query, count, limit, currentStart, ZOTERO_CONFIG["countElementId"]);
}


// Function to call if CORS request fails
function errorCallback() {
    show_loading(false);
    alert("There was an error making the request.");
}


// Writes CORS request URL to the page so user can see it
function showUrl(url) {
    var txt = '<a href="' + url + '" target="_blank">' + url + '</a>';
    var element = document.getElementById(ZOTERO_CONFIG["urlElementId"]);
    element.innerHTML = txt;
}


// Passes search URL and callbacks to CORS function
function searchZotero(query, publicGroupId, start) {
    var base = "https://api.zotero.org/groups/";
    var params = "/items?v=3&include=bib&sort=date&itemType=-attachment&q=";
    var limit = "&limit=" + ZOTERO_CONFIG["limit"];
    if (start === undefined) start = "0";
    start = "&start=" + start;
    var url = base + publicGroupId + params + query + limit + start;
    showUrl(url);
    show_loading(true);
    makeCorsRequest(url, successCallback, errorCallback);
}


// When the window loads, read query parameters and perform search
window.onload = function() {
    var query = getParameterByName("q");
    var start = getParameterByName("start");
    if (query == null) {
        query = "";
    }
    document.forms.zoteroSearchForm.q.value = query;
    if (!start) {
        start = 0;
    }
    searchZotero(query, ZOTERO_CONFIG["publicGroupId"], start);
};