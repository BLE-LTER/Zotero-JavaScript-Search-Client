# Zotero-JavaScript-Search-Client
Example HTML, CSS, and JavaScript for searching for items within a public Zotero
user or group library

Some live demos:

* [Basic example](https://ble-lter.github.io/Zotero-JavaScript-Search-Client/minimal.html)
* [Complete example](https://ble-lter.github.io/Zotero-JavaScript-Search-Client/complete.html)

## Motivation

To help users discover your publications, you can add them to an online database like Zotero and then present a search interface to that database on your website. Modules for doing so have been written for WordPress and Drupal, but I hadn't seen one for static HTML sites, so I wrote this example to test how feasible a static HTML Zotero client would be to implement.

## Usage

Open the zotero.html file in your browser and enter a search term like
`coastal`. Click the search button and see results as formatted by Zotero to the page.

You can click Search with no terms specified to show the entire catalog, which is the default behavior when you load the page.

Zotero limits the number of results returned in a single request, so the page supports pagination to get additional results.

To use this for your own project, you will need a free Zotero account into which you include your publications, and obviously you'll need to adapt the HTML, CSS, etc., for your particular website.

## Customization

The code finds elements via their HTML id attribute values, so in general you'll
want to start with one of the example HTML documents and adapt it to your needs.

To change parameters such as how many search results to show at a time, see the
`ZOTERO_CONFIG` variable in `zotero.js`.  See comments in the code for a brief
explanation and example values, or the text below for additional details.

### What To Search

You can search a user library, a group, or a collection within a user library or
group.

* `zotId` - The user or group identifier. You can find your group identifier by
  browsing to your group page and copying the number in the URL. To find your
  user identifier, click **Settings**, and then click **Feeds/API**.
* `zotIdType` - Indicates whether `zotId` is for a `group` or a `user`.
* `collectionKey` - Supply a value for this if you want to limit search to a
  particular collection.  Otherwise leave it as an empty string, "".  You can
  find your collection identifier by browsing to the collection's page and copying the
  collection key from the URL.
* `filterTags` - Use this to restrict results to items matching this tag filter,
  or leave the value as an emptry string, "", if no tag filtering is desired.
  Since the Zotero API supports several ways of writing a tag filter, the entire tag parameter including the preceeding ampersand is required for
  this value, as in `&tag=FeaturedArticle`.  See the [API
  documentation](https://www.zotero.org/support/dev/web_api/v3/basics) for
  examples.

### Results Table

Results are displayed in a table with up to four columns: `Year`, `Citation`,
`Item Type`, and a special column (we'll refer to it as `ShowTags`) showing the
presence of particular tags.

* `resultsElementId` - The id of the HTML element to contain the results table.
  This element must already exist in your HTML document.
* `includeCols` - Array of column names to include in the output table, other than
  `Citation` which is always included.  The full set is `Year`, `Type`, and
  `ShowTags`. If you leave a column name out in this array, then it will not
  appear in the result table. If you leave all columns out (i.e., the array is
  empty), then only the citations are shown, and no column header is shown.
* `showTags`: Array of tags to show, if present, for each result item.  Use this
  to categorize your items if Zotero doesn't support the categories you need out
  of the box.  For example, you could tag your items based on their relationship
  to your LTER site, indicating whether the item is a foundational paper for the
  site (`Fondational`), was funded by the site (`LTER-Funded`), or was written by someone outside of your site
  who used your site's data (`LTER-Enabled`). If an item has one of the tags
  you specify, the tag will be shown in the `ShowTags` column. Obviously, if you
  want to use this functionality, make sure the text `ShowTags` is included in
  `includeCols`.
* `showTagColName` - The name to be used for the `ShowTags` column in the
  results table, since I can't predict what kind of categories your tags
  represent.  `Relationship to LTER Site` would work for the example tags
  mentioned above.
* `style` - The bibliography display style for the citations, e.g., apa. Leave
  blank for the default which is chicago-note-bibliography.

### Result Counts and Pagination

You can provide HTML id attribute values for elements that will contain result
counts, pagination links, and so on.  In general, if you do not want to show one
of these elements, then provide an empty string, "", as the identifier. If the
code does not find a matching element, it will skip it.

* `limit` - Max number of results to retrieve per page. A value of 10 is a good
  starting point.  As you approach 100, Zotero gets awfully slow.
* `urlElementId` - Supply this if your HTML document has an element in which
  you'd like to display the URL that was used to fetch results from Zotero.
* `countElementId` - Element in your HTML document for showing the total number
  of results.
* `pagesTopElementId` - Element to display result page links above results.
* `pagesBotElementId` - Element to display result page links below results.
* `showPages` - Max number of page links to show. The code assumes this is an
  odd number!

### Advanced Search Controls

The Zotero API has very limited advanced search functionality, though the
developers say they are planning to add more features.  Currently you
can only filter by item type.  Thus, `zotero.html` includes a collapsible
**Advanced** section in which the user can choose to filter by item type.  See
the HTML if you're curious, but for now I suggest leaving the advanced section
out until more advanced functionality is supported.

### Sorting

The Zotero API supports sorting results. If you want to allow the user to sort
results, you must include an HTML `select` control with the identifier
`visibleSort` and with options matching the allowable Zotero sort values.  See
the section on sorting and pagination parameters in the [Zotero API
documentation](https://www.zotero.org/support/dev/web_api/v3/basics) for
allowable values.  See `zotero.html` for an example of what the `select` element
should look like.  This element should be contained within a `div` element,
which is used to hide the control if no results were returned from the search.

If you do not want to allow the user to change the sorting option, then leave
these HTML elements out of your document.

* `sortDiv` - Identifier of the HTML element containing the `select` control
  allowing interactive sort options.
