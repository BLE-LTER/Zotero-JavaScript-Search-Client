# Zotero-JavaScript-Search-Client
Example HTML, CSS, and JavaScript for searching for items within a public Zotero group

[See a live demo at RawGit](https://cdn.rawgit.com/twhiteaker/Zotero-JavaScript-Search-Client/master/zotero.html)

## Motivation

To help users discover your publications, you can add them to an online database like Zotero and then present a search interface to that database on your website. Modules for doing so have been written for WordPress and Drupal, but I hadn't seen one for static HTML sites, so I wrote this example to test how feasible a static HTML Zotero client would be to implement. My ultimate goal is to find a bibliography search solution for the website for my Long Term Ecological Research (LTER) project.

## Usage

Open the HTML file in your browser and enter a search term like Groundwater. When you click Search, the application searches a Zotero group called Water Project (ID 1586722) which makes their items publicly available, and writes results as formatted by Zotero to the page. 

You can click Search with no terms specified to show the entire catalog, which is the default behavior when you load the page. 

Zotero limits the number of results returned in a single request, so the page supports pagination to get additional results.

To use this for your own project, you will need a free Zotero account into which you include your publications, and obviously you'll need to adapt the HTML, CSS, etc., for your particular website.

## Customization

To change parameters such as how many search results to show at a time, see the ZOTERO_CONFIG variable in zotero.js.

If you prefer to always require a search term, you can check that the query parameter has been set before performing a search with something like:

```javascript
if (query != "" && query != null) {
    // Do the search, etc.
}
```
