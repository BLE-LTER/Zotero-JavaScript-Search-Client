// Requires cors.js to be loaded first

"use strict";

var ZOTERO_CONFIG = {
   "zotId": "2211939", // ID of group or user library to search in Zotero, e.g., 2211939, 2055673
   "zotIdType": "group", // group or user
   "collectionKey": "KHTHLKB5", // Key of collection within library to search, e.g., "KHTHLKB5", or "" if no collection
   "filterTags": "", // For filtering results by tag(s), e.g., "&tag=LTER-Funded".  See examples at https://www.zotero.org/support/dev/web_api/v3/basics
   "resultsElementId": "searchResults", // Element to contain results
   "includeCols": ["Year", "Type", "ShowTags"], // Array of columns to include in the output table, other than Citation. The full set is ["Year", "Type", "ShowTags"]
   "showTags": ["Foundational", "LTER-Funded", "LTER-Enabled"], // Include a column showing this tag if present for each item
   "showTagColName": "Relationship", // Name for the column in HTML table under which the showTags will appear
   "style": "", // Bibliography display style, e.g., apa. Leave blank for default which is chicago-note-bibliography.
   "limit": 10, // Max number of results to retrieve per page
   "urlElementId": "searchUrl", // Element to display search URL
   "countElementId": "resultCount", // Element showing number of results
   "pagesTopElementId": "paginationTop", // Element to display result page links above results
   "pagesBotElementId": "paginationBot", // Element to display result page links below results
   "showPages": 5, // MUST BE ODD NUMBER! Max number of page links to show
   "sortDiv": "sortDiv" // Element with interactive sort options
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
   function parseYear(text) {
      function isYear(yearText) {
         // Assumes year is between 1000 and current year + 5
         try {
            var yr = parseInt(yearText);
            var maxAllowable = (new Date().getFullYear()) + 5;
            return (String(yr) === yearText && yr >= 1000 && yr <= maxAllowable)
         } catch (err) {
            return false;
         }
      }

      if (text) {
         if (isYear(text.slice(0, 4))) {
            return text.slice(0, 4);
         } else if (isYear(text.slice(-4))) {
            return text.slice(-4);
         } else {
            return text;
         }
      } else {
         return "";
      }
   }

   function parseType(text) {
      switch (text) {
         case "artwork":
            return "Artwork";
         case "audioRecording":
            return "Audio Recording";
         case "bill":
            return "Bill";
         case "blogPost":
            return "Blog Post";
         case "book":
            return "Book";
         case "bookSection":
            return "Book Section";
         case "case":
            return "Case";
         case "computerProgram":
            return "Computer Program";
         case "conferencePaper":
            return "In Proceedings";
         case "dictionaryEntry":
            return "Dictionary Entry";
         case "document":
            return "Document";
         case "email":
            return "Email";
         case "encyclopediaArticle":
            return "Encyclopedia Article";
         case "film":
            return "Film";
         case "forumPost":
            return "Forum Post";
         case "hearing":
            return "Hearing";
         case "instantMessage":
            return "Instant Message";
         case "interview":
            return "Interview";
         case "journalArticle":
            return "Journal Article";
         case "letter":
            return "Letter";
         case "magazineArticle":
            return "Magazine Article";
         case "manuscript":
            return "Manuscript";
         case "map":
            return "Map";
         case "newspaperArticle":
            return "Newspaper Article";
         case "patent":
            return "Patent";
         case "podcast":
            return "Podcast";
         case "presentation":
            return "Presentation";
         case "radioBroadcast":
            return "Radio Broadcast";
         case "report":
            return "Report";
         case "statute":
            return "Statute";
         case "thesis":
            return "Thesis";
         case "tvBroadcast":
            return "TV Broadcast";
         case "videoRecording":
            return "Video Recording";
         case "webpage":
            return "Web Page";
         case "note":
            return "Note";
         default:
            return "Other"
      }
   }

   function parseShowTags(tags) {
      function objToString(tagObj) {
         return tagObj["tag"];
      }
      var tagArray = tags.map(objToString);
      var matches = tagArray.filter(function (n) {
         return ZOTERO_CONFIG["showTags"].indexOf(n) !== -1;
      });
      return matches.join(", ");
   }

   function parseDataLinks(extra) {
      if (extra) {
         var dois = extra.split(/\r?\n/);
         var urls = [];
         for (var i = 0; i < dois.length; i++) {
            var doi = dois[i];
            if (doi.startsWith("https://doi.org/")) {
               urls.push(doi);
            }
         }
         var links = [];
         if (urls.length == 0) {
            return "";
         } else if (urls.length == 1) {
            links.push(' <a href="' + urls[0] + '" target="_blank" rel="noopener" aria-label="open data in new tab">Data link.</a>');
         } else {
            for (var i = 0; i < urls.length; i++) {
               var url = urls[i];
               var j = i + 1;
               links.push(' <a href="' + url + '" target="_blank" rel="noopener" aria-label="open data in new tab">Data link ' + j + '.</a>');
            }   
         }
         return links.join(" ");
      } else {
         return "";
      }
   }

   function parseItemLink(url) {
      if (url)
         return '<a href="' + url + '" target="_blank" rel="noopener" aria-label="open item in new tab">Item link.</a>';
      else
         return "";
   }

   var results = JSON.parse(resultText);
   var sortDiv = document.getElementById(ZOTERO_CONFIG["sortDiv"]);
   if (sortDiv) {
      if (results.length)
         sortDiv.style.display = "block";
      else
         sortDiv.style.display = "none";
   }
   if (!results.length) {
      return "<p>Your search returned no results.</p>";
   }

   var header = '<div class="table-responsive-xl"><table class="table table-striped table-sm">';
   var showYear = (ZOTERO_CONFIG["includeCols"].indexOf("Year") !== -1);
   var showType = (ZOTERO_CONFIG["includeCols"].indexOf("Type") !== -1);
   var showTags = (ZOTERO_CONFIG["includeCols"].indexOf("ShowTags") !== -1);
   if (ZOTERO_CONFIG["includeCols"].length > 0) {
      header += "<thead><tr>";
      if (showYear) {
         header += "<th>Year</th>";
      }
      header += "<th>Citation</th>";
      if (showType) {
         header += "<th>Type</th>";
      }
      if (showTags) {
         header += "<th>" + ZOTERO_CONFIG["showTagColName"] + "</th>";
      }
      header += "</tr></thead><tbody>";
   }

   var rows = [header];

   for (var i = 0; i < results.length; i++) {
      var result = results[i];
      var year = parseYear(result["data"]["date"]);
      if (!year) {
         year = parseYear(result["data"]["issueDate"]);
      }
      var itemType = parseType(result["data"]["itemType"]);
      var tagsToShow = parseShowTags(result["data"]["tags"]);
      var itemLink = parseItemLink(result["data"]["url"]);
      var dataLinks = parseDataLinks(result["data"]["extra"]);
      var row = "<tr>";
      if (showYear) {
         row += "<td>" + year + "</td>";
      }
      row += "<td>" + result["bib"] + itemLink + " " + dataLinks + "</td>";
      if (showType) {
         row += "<td>" + itemType + "</td>";
      }
      if (showTags) {
         row += "<td>" + tagsToShow + "</td>";
      }
      row += "</tr>"
      rows.push(row);
   }
   rows.push("</tbody></table></div>");
   return rows.join("");
}


function showLoading(isLoading) {
   var x = document.getElementById("loading-div");
   if (isLoading) {
      document.body.style.cursor = "wait";
      x.style.display = "block";
   } else {
      document.body.style.cursor = "default";
      x.style.display = "none";
   }
}


// Function to call if CORS request is successful
function successCallback(headers, response) {
   showLoading(false);

   // Write results to page
   var resultHtml = parseZoteroResults(response);
   var elementId = ZOTERO_CONFIG["resultsElementId"];
   document.getElementById(elementId).innerHTML = resultHtml;

   // Add links to additional search result pages if necessary
   var currentStart = getParameterByName("start");
   if (!currentStart) {
      currentStart = 0;
   } else {
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
   showLoading(false);
   alert("There was an error making the request.");
}


// Writes CORS request URL to the page so user can see it
function showUrl(url) {
   var element = document.getElementById(ZOTERO_CONFIG["urlElementId"]);
   if (!element) return;
   var txt = '<a href="' + url + '" target="_blank">' + url + '</a>';
   element.innerHTML = txt;
}


function encodeStyle(style) {
   return style.replace(/\//g, '%3A').replace(/:/g, '%2F');
}


// Passes search URL and callbacks to CORS function
function searchZotero(query, itemType, sort, start) {
   var zotId = (ZOTERO_CONFIG["zotIdType"] === "group") ? "groups/" + ZOTERO_CONFIG["zotId"] : "users/" + ZOTERO_CONFIG["zotId"];
   var collection = (ZOTERO_CONFIG["collectionKey"] === "") ? "" : "/collections/" + ZOTERO_CONFIG["collectionKey"];
   var base = "https://api.zotero.org/" + zotId + collection + "/items?v=3&include=bib,data";
   var style = (ZOTERO_CONFIG["style"] === "") ? "" : "&style=" + encodeStyle(ZOTERO_CONFIG["style"]);
   var params = "&q=" + encodeURI(query) + "&itemType=" + itemType +
      "&sort=" + sort + "&start=" + start + ZOTERO_CONFIG["filterTags"];
   var limit = "&limit=" + ZOTERO_CONFIG["limit"];
   var url = base + params + style + limit;
   showUrl(url);
   showLoading(true);
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
// control, then first index is used. Returns actual selected value.  If
// control is not present, input value is returned.
function setSelectValue(elId, desiredValue) {
   var el = document.getElementById(elId);
   if (!el || !el.length) return desiredValue;
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
   var itemTypeParam = getParameterByName("itemType") || "-attachment || note";
   var expanded = Boolean(getParameterByName("expanded"));
   var pageStart = getParameterByName("start") || 0;
   var sortParam = getParameterByName("sort") || "date";

   document.forms.zoteroSearchForm.q.value = query;
   var itemType = setSelectValue("itemType", itemTypeParam);
   var sort = setSelectValue("visibleSort", sortParam);
   var sortHiddenInput = document.getElementById("sort");
   if (sortHiddenInput) {
      document.forms.zoteroSearchForm.sort.value = sort;
   }

   initForm("zoteroSearchForm", expanded);

   searchZotero(query, itemType, sort, pageStart);
};
