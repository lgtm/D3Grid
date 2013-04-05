D3Grid
======

a simple javascript table builder that supports server-side paged datasets, features client-side page caching (per page load), and is built on top of d3.js.

## Data Format
```
{
	"rows": [
		{
			"OrderId": 0,
			"Name": "Order 0"
		},
		...
	],
	"columns": [
		{
			"name": "OrderId",
			"label": "Order Id",
			"sortColumnName": "OrderId",
			"index": "0",
			"isSortable": false,
			"includeType": "Column",
			"format": "PlainText"
		},
		...
	],
	"totalRowCount": 100,
	"footerText": "This is a footer note about this data."
}
```

### Column Include Types
1. `Column` - data will be displayed to the viewer as a column within your table
2. `HiddenData` - data will available to the d3g js at render time but will not be used for display purposes (this is useful for stashing data relevant to a row that does not need to be displayed but could be used for javascript events, like identifiers)

### Column sortability
if the `isSortable` flag is set to true then the column is understood to be sortable; i.e. the column will support click to sort behavior (ascending and descending).
the `sortColumnName` should also be set to a value that represents the column key that should be passed back to the server when fetching new pages. The sorting will not take place in d3g js but this data will be used to configure the UI and events for the column.

### Column Format types
1. `PlainText` - plain text (the default)
2. `Html` - raw html
3. `Currency` - formats the value with currency symbol and commas
4. `Handlebars` - a client-side handlebars formatter; e.g. `"{{#if CanEdit}}&lt;a href='/order/edit/{{OrderId}}'&gt;Edit&lt;/a&gt;{{/if}}"`


## Contributing
1. install nodejs (with npm)
2. install jshint (http://jshint.com/install/)
3. open visual studio and go!