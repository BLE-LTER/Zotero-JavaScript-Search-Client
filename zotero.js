// Requires cors.js to be loaded first

"use strict";

var ZOTERO_CONFIG = {
   "publicGroupId": "2055673",  // ID of public group to search in Zotero
   "limit": 10,  // Max number of results to retrieve per page
   "resultsElementId": "searchResults",  // Element to contain results
   "urlElementId": "searchUrl",  // Element to display search URL
   "countElementId": "resultCount",  // Element showing number of results
   "pagesTopElementId": "paginationTop",  // Element to display result page links above results
   "pagesBotElementId": "paginationBot",  // Element to display result page links below results
   "showPages": 5,  // MUST BE ODD NUMBER! Max number of page links to show
   "sortDiv": "sortDiv"  // Element with interactive sort options
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
   var sortDiv = document.getElementById(ZOTERO_CONFIG["sortDiv"]);
   if (sortDiv) {
      if (results.length)
         sortDiv.style.display = "block";
      else
         sortDiv.style.display = "none";
   }
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
   var pageTopElementId = ZOTERO_CONFIG["pagesTopElementId"];
   var pageBotElementId = ZOTERO_CONFIG["pagesBotElementId"];
   showPageLinks(count, limit, showPages, currentStart, pageTopElementId);
   showPageLinks(count, limit, showPages, currentStart, pageBotElementId);
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
   var element = document.getElementById(ZOTERO_CONFIG["urlElementId"]);
   if (!element) return;
   var txt = '<a href="' + url + '" target="_blank">' + url + '</a>';
   element.innerHTML = txt;
}


// Passes search URL and callbacks to CORS function
function searchZotero(query, itemType, sort, start) {
   var base = "https://api.zotero.org/groups/" +
      ZOTERO_CONFIG["publicGroupId"] + "/items?v=3&include=bib";
   var params = "&q=" + encodeURI(query) + "&itemType=" + itemType +
      "&sort=" + sort + "&start=" + start;
   var limit = "&limit=" + ZOTERO_CONFIG["limit"];
   var url = base + params + limit;
   showUrl(url);
   show_loading(true);
   makeCorsRequest(url, successCallback, errorCallback);
}


function initCollapsible(expanded) {
   // Handles collapsible sections
   function showHide(el, show) {
      if (show) el.style.maxHeight = "900px";
      else el.style.maxHeight = null;
   }

   // Expand if user tabs into hidden element
   function listenForFocus(collapsibleEl, toggle) {
      function addFocusListener(collapsibleEl, tagName, toggle) {
         var els = collapsibleEl.getElementsByTagName(tagName);
         var i;
         for (i = 0; i < els.length; i++) {
            els[i].onfocus = function () {
               if (!toggle.checked) toggle.click();
            };
         };
      }
      addFocusListener(collapsibleEl, "SELECT", toggle);
      addFocusListener(collapsibleEl, "INPUT", toggle);
   }

   // Collapse when checked
   var els = document.getElementsByClassName("collapse-toggle");
   var i;
   for (i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type && el.type === 'checkbox') {
         el.checked = expanded;
         var target = document.getElementById(el.getAttribute("aria-controls"));
         listenForFocus(target, el);
         showHide(target, expanded);
         el.setAttribute("aria-expanded", expanded.toString());
         el.onchange = function () {
            showHide(target, this.checked);
            this.setAttribute("aria-expanded", this.checked.toString());
         };
      }
   }
   // Toggle checkbox when user presses space or enter on label
   els = document.getElementsByClassName("lbl-toggle");
   for (i = 0; i < els.length; i++) {
      var label = els[i];
      label.onkeydown = function (e) {
         if (e.which === 32 || e.which === 13) {
            e.preventDefault();
            this.click();
         };
      };
   };
}

function initForm(formId, expanded) {
   initCollapsible(expanded);

   var sortControl = document.getElementById("visibleSort");
   if (sortControl) {
      sortControl.onchange = function () {
         var hiddenSortControl = document.getElementById("sort");
         hiddenSortControl.value = this.options[this.selectedIndex].value;
         var form = document.getElementById(formId);
         form.submit();
      };
   }
}


// Selects the desired value in the Select control. If value is not in the
// control, then first index is used. Returns actual selected value.
function setSelectValue(elId, desiredValue) {
   var el = document.getElementById(elId);
   if (!el || !el.length) return null;
   var result = el[0].value;
   for (var i = 0; i < el.length; i++) {
      if (desiredValue === el[i].value) {
         el[i].selected = true;
         result = desiredValue;
         break;
      }
   }
   return result;
}


// When the window loads, read query parameters and perform search
window.onload = function () {
   var query = getParameterByName("q") || "";
   var itemTypeParam = getParameterByName("itemType");
   var expanded = Boolean(getParameterByName("expanded"));
   var pageStart = getParameterByName("start") || 0;
   var sortParam = getParameterByName("sort");

   document.forms.zoteroSearchForm.q.value = query;
   var itemType = setSelectValue("itemType", itemTypeParam);
   var sort = setSelectValue("visibleSort", sortParam);
   document.forms.zoteroSearchForm.sort.value = sort;

   initForm("zoteroSearchForm", expanded);

   searchZotero(query, itemType, sort, pageStart);
};