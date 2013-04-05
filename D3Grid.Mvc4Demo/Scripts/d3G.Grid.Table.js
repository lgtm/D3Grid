/// <reference path="../jquery-1.9.1.intellisense.js" />
/// <reference path="../d3.v3.js" />
/// <reference path="d3G.Grid.js" />

var d3G = d3G || {};
d3G.Grid = d3G.Grid || {};

d3G.Grid.Table = (function ($, d3, undefined) {
	
	function createHeader(opt){
		if(opt.tableTitle ) {
			var headerContainer = d3.select(opt.containerSelector)
				.insert('div', opt.tableSelector)
				.classed('gcgrid-header', true)
				.append('span')
				.attr('id', opt.tableSelector.replace(/#/gi, '') + 'Header')
				.html(opt.tableTitle);
		}
	}
	
	function getTableStyling(opt){
		var data = opt.tableStyling;
		var stylingClasses = 'table gcgrid-table';

		var bordered 	=	(typeof data !== 'undefined' && typeof data.bordered !== 'undefined') ? data.bordered : true;
		var condensed 	=	(typeof data !== 'undefined' && typeof data.bordered !== 'undefined') ? data.condensed : false;
		var striped 	=	(typeof data !== 'undefined' && typeof data.striped !== 'undefined') ? data.striped : true;
		var hovered 	=	(typeof data !== 'undefined' && typeof data.hovered !== 'undefined') ? data.hovered : true;
		
		stylingClasses += (bordered) ? ' table-bordered' : '';
		stylingClasses += (condensed) ? ' table-condensed' : '';
		stylingClasses += (striped) ? ' table-striped' : '';
		stylingClasses += (hovered) ? ' table-hovered' : '';

		return stylingClasses; 
	}
	
	function _create(opt) {
		createHeader(opt);
		$(opt.tableSelector).wrap('<div class="gcgrid-table-wrapper" />');
		var sortChangedCallbacks = $.Callbacks(),
			sortColumnName = opt.defaultSortColumn || '',
			sortAscending = (opt.defaultSortDirection && opt.defaultSortDirection === 'Descending') ? false : true,
			formatters = {
				PlainText: function (txt) { return txt; },
				Number: function (txt) { return txt; },
				Currency: function (txt) { return txt; },
				Html: function (txt) { return $('<div />').html(txt).text(); },
				Handlebars: (function () {
					var templates = {};

					return function(str, obj) {
						var f = templates[str] || (templates[str] = Handlebars.compile($('<div />').html(str).text()));
						return f(obj);
					};
				})()
			};

		formatters = $.extend(opt.formatters || {}, formatters);

		$(opt.tableSelector).on('click', 'th.gcgrid-sortable', function () {
			var $selectedColumn = $(this),
				selectedColumnName = $selectedColumn.data('sort-column'),
				isActiveSort = $selectedColumn.hasClass('gcgrid-sort-active');

			// handle tracking sort column and direction here.
			sortColumnName = selectedColumnName;
			sortAscending = isActiveSort ? !sortAscending : true;

			sortChangedCallbacks.fire();
		});

		if (opt.onCellClick){
			$(opt.tableSelector).on('click', 'tbody tr td', function () {
				var cell = this;
				opt.onCellClick(cell);
			});
		}

		return {
			render: function (data) {
				
				var visibleColumns = $.grep(data.columns, function (column) { return column.includeType == 'Column'; });
				
				var $table = $(opt.tableSelector);
				$table.empty();	
				var tableStyling = getTableStyling(opt);

				var table = d3.select(opt.tableSelector)
					.classed(tableStyling, true),

					tableHeader = table
						.append('thead')
						.classed('gcgrid-table-header', true)
						.append('tr')
						.selectAll('th')
						.data(visibleColumns)
						.enter()
						.append('th')
						.attr('class', function (d) {

							var classValues = 'gc-header-' + d.index;

							if (d.isSortable === true) {
								classValues = classValues + ' gcgrid-sortable';
							}

							if (d.sortColumnName == sortColumnName) {
								classValues = classValues + ' gcgrid-sort-active';

								if (sortAscending) {
									classValues = classValues + ' gcgrid-sort-asc';
								} else {
									classValues = classValues + ' gcgrid-sort-desc';
								}
							}

							return classValues;
						})
						.attr('data-sort-column', function (d) {
							if (d.isSortable === true) {
								return d.sortColumnName;
							}
						})
						.html(function (d) {
							var content = d.label;
							// add sort icon
							if (d.isSortable === true) {
								content += '<span class="text-icon gcgrid-sort-icon"></span>';
							}
							return content;
							
						}),

					tableBody = table
						.append('tbody'),

					rows = tableBody.selectAll('tr')
						.data(data.rows)
						.enter()
						.append('tr'),

					cells = rows.selectAll('td')
						.data(visibleColumns)
						.enter()
						.append('td')
						.attr('class', function(d){return 'gc-content-' + d.index})
						.html(function (d, columnIndex, rowIndex) {

							var columnName = d.name,
								rowData = data.rows[rowIndex],
								datum = rowData[columnName],
								customFormatter;

							// check for a custom formatter from the create options
							if (formatters.custom) {
								customFormatter = formatters.custom[columnName];

								if (typeof customFormatter === 'function')
									return customFormatter(datum, rowData);
							}

							// check for a custom formatter on the column object.
							customFormatter = d.formatter;
							if (typeof customFormatter === 'function')
								return customFormatter(datum, rowData);

							return formatters[d.format](datum, rowData);
						});
			},
			
			sortColumnChanged: {
				addHandler: function (cb) { sortChangedCallbacks.add(cb); },
				removeHandler: function (cb) { sortChangedCallbacks.remove(cb); }
			},
			getSortParameters: function () {
				return {
					SortColumnName: sortColumnName,
					SortOrder: sortAscending ? 'Ascending' : 'Descending',
				};
			}
		};
	}

	return {
		create: _create,
	};

})(jQuery, d3);
