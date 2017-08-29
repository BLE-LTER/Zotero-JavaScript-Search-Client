// Requires cors.js to be loaded first

"use strict";

var ZOTERO_CONFIG = {
    "publicGroupId": "1586722",  // ID of public group to search in Zotero
    "limit": 15,  // Max number of results to retrieve per page
    "resultsElementId": "searchResults",  // Element to contain results
    "urlElementId": "searchUrl",  // Element to display search URL
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


// https://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf("?") !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, "$1" + key + "=" + value + "$2");
  }
  else {
    return uri + separator + key + "=" + value;
  }
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


function makePageLink(currentUrl, currentStart, start, linkText) {
    var uri = updateQueryStringParameter(currentUrl, "start", start);
    var tagStart = '<a href="';
    if (currentStart == start) {
        uri = "#";
        if (!linkText.toString().startsWith("&")) {
            tagStart = '<a class="active" href="';
        }
    }
    var link = tagStart + uri + '">' + linkText + '</a>';
    return link;
}


// Creates links to additional pages of search results.
// Requires a start URI argument indicating start index of search results
// as passed to the server providing the search results.
function makePageLinks(total, limit, showPages) {
    if (total <= limit) {
        return "";
    }

    var currentUrl = window.location.href;
    var currentStart = getParameterByName("start");
    if (!currentStart) {
        currentStart = 0;
    }
    else {
        currentStart = parseInt(currentStart);
    }
    var numPages = Math.ceil(total / limit);
    var currentPage = Math.floor(currentStart / limit) + 1;
    var pagesLeftRight = Math.floor(showPages / 2);
    var startPage = currentPage - pagesLeftRight;
    var endPage = currentPage + pagesLeftRight;

    if (endPage > numPages) {
        endPage = numPages;
        startPage = endPage - showPages + 1;
    }
    if (startPage <= 0) {
        startPage = 1;
        endPage = showPages;
        if (endPage > numPages) {
            endPage = numPages;
        }
    }

    var link_list = [];
    link_list.push(makePageLink(currentUrl, currentStart, 0, "&laquo;"));
    for (var i = startPage; i <= endPage; i++) {
        var startIndex = (i - 1) * limit;
        link_list.push(makePageLink(currentUrl, currentStart, startIndex, i));
    }
    var lastIndex = (numPages - 1) * limit;
    link_list.push(
        makePageLink(currentUrl, currentStart, lastIndex, "&raquo;"));

    return link_list.join("");
}

// Function to call if CORS request is successful
function successCallback(headers, response) {
    document.body.style.cursor = "default";

    // Write results to page
    var resultHtml = parseZoteroResults(response);
    var elementId = ZOTERO_CONFIG["resultsElementId"];
    document.getElementById(elementId).innerHTML = resultHtml;

    // Add links to additional search result pages if necessary
    var count = parseInt(headers["Total-Results"]);
    var limit = parseInt(ZOTERO_CONFIG["limit"]);
    var showPages = parseInt(ZOTERO_CONFIG["showPages"]);
    var pageLinkHtml = makePageLinks(count, limit, showPages);
    var pageElementId = ZOTERO_CONFIG["pagesElementId"];
    document.getElementById(pageElementId).innerHTML = pageLinkHtml;
}


// Function to call if CORS request fails
function errorCallback() {
    document.body.style.cursor = "default";
    alert("There was an error making the request.");
}


// Writes CORS request URL to the page so user can see it
function showUrl(url) {
    var txt = '<a href="' + url + '" target="_blank">' + url + '</a>';
    var element = document.getElementById(ZOTERO_CONFIG["urlElementId"]);
    element.innerHTML = txt;
}


// Passes search URL and callbacks to CORS function
function searchZotero(query, publicGroupId, start=0) {
    var base = "https://api.zotero.org/groups/";
    var params = "/items?v=3&include=bib&sort=date&q=";
    var limit = "&limit=" + ZOTERO_CONFIG["limit"];
    start = "&start=" + start;
    var url = base + publicGroupId + params + query + limit + start;
    showUrl(url);
    document.body.style.cursor = "wait";
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