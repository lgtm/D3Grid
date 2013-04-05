/* d3G.Grid.js */
/*jshint undef:true, es5:true */
/*global window */

/// <reference path="Scripts/jquery-1.9.1.intellisense.js" />
/// <reference path="Scripts/d3.v3.js" />

(function ($, d3, d3G, window, undefined) {

	function _ensureOptions(options) {
		if (typeof options.dataUrl !== 'string') {
			throw 'd3G.Grid: `dataUrl` must be a string (url)!';
		}
	}

	function _create(opt) {

		d3.select(opt.containerSelector).classed("d3g-container loading-content-container", true);

		_ensureOptions(opt);

		var table = d3G.Grid.Table.create(opt),
			pager = d3G.Grid.Pager.create(opt),
			pageCache;

		function _getPageAndSortParameters() {
			var pageAndSortParams = $.extend({}, table.getSortParameters(), pager.getPageParameters());

			if (typeof opt.customParams === 'function') {
				pageAndSortParams = opt.customParams(pageAndSortParams);
			}

			return pageAndSortParams;
		}

		function _startDataLoad(pageAndSortParameters) {
			//d3G.Modals.Loading.show({ showCurtain: false, selector: opt.containerSelector });

			pageAndSortParameters = pageAndSortParameters || _getPageAndSortParameters();

			$.ajax({
				url: opt.dataUrl,
				data: pageAndSortParameters,
				dataType: 'json',
				traditional: true,
				type: 'POST'
			}).done(function (data) {
				pageCache[pageAndSortParameters.PageIndex] = data;
				
				//d3G.Modals.Loading.hide({ showCurtain: false, selector: opt.containerSelector });

				table.render(data);
				pager.render(data);
			}).fail(function () {
				//d3G.Modals.Loading.hide({ showCurtain: false, selector: opt.containerSelector });
				//d3G.Modals.AlertMessage.show({ text: 'An error occurred. Please try again.' });
			});
		}

		table.sortColumnChanged.addHandler(function () {
			pageCache = {};
			pager.reset();
			_startDataLoad();
		});

		function changePage() {
			var pageAndSortParameters = _getPageAndSortParameters();

			if (pageCache[pageAndSortParameters.PageIndex]) {
				var gridData = pageCache[pageAndSortParameters.PageIndex];
				
				//d3G.Modals.Loading.hide({ showCurtain: false, selector: opt.containerSelector });
				table.render(gridData);
				pager.render(gridData);
			} else {
				_startDataLoad(pageAndSortParameters);
			}
		}

		pager.pageChanged.addHandler(function () {
			changePage();
		});

		pager.pageSizeChanged.addHandler(function () {
			pageCache = {};
			pager.reset();
			_startDataLoad();
		});

		return {
			table: table,
			pager: pager,
			render: function () {
				pageCache = {};
				pager.reset();
				_startDataLoad();
			}
		};
	}

	d3G.Grid = {
		create: _create
	};

}(window.jQuery, window.d3, window.d3G || {}, window));
/* d3G.Grid.Table.js */
/*jshint undef:true, es5:true, unused:false */
/*global window */

/// <reference path="Scripts/d3.v3.js" />
/// <reference path="Scripts/jquery-1.9.1.intellisense.js" />
/// <reference path="d3G.Grid.js" />

(function ($, d3, d3G, handlebars, window, undefined) {

	function createHeader(opt) {
		if (opt.tableTitle) {
			d3.select(opt.containerSelector)
				.insert('div', opt.tableSelector)
				.classed('d3g-header', true)
				.append('span')
				.attr('id', opt.tableSelector.replace(/#/gi, '') + 'Header')
				.html(opt.tableTitle);
		}
	}

	function getTableStyling(opt) {
		var data = opt.tableStyling || {};
		var stylingClasses = 'table d3g-table';

		var bordered = typeof data.bordered !== 'undefined' ? data.bordered : true;
		var condensed = typeof data.bordered !== 'undefined' ? data.condensed : false;
		var striped = typeof data.striped !== 'undefined' ? data.striped : true;
		var hovered = typeof data.hovered !== 'undefined' ? data.hovered : true;

		stylingClasses += (bordered) ? ' table-bordered' : '';
		stylingClasses += (condensed) ? ' table-condensed' : '';
		stylingClasses += (striped) ? ' table-striped' : '';
		stylingClasses += (hovered) ? ' table-hovered' : '';

		return stylingClasses;
	}

	function _create(opt) {
		createHeader(opt);
		$(opt.tableSelector).wrap('<div class="d3g-table-wrapper" />');

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

					return function (str, obj) {
						var f = templates[str] || (templates[str] = handlebars.compile($('<div />').html(str).text()));
						return f(obj);
					};
				})()
			};

		formatters = $.extend(opt.formatters || {}, formatters);

		$(opt.tableSelector).on('click', 'th.d3g-sortable', function () {
			var $selectedColumn = $(this),
				selectedColumnName = $selectedColumn.data('sort-column'),
				isActiveSort = $selectedColumn.hasClass('d3g-sort-active');

			// handle tracking sort column and direction here.
			sortColumnName = selectedColumnName;
			sortAscending = isActiveSort ? !sortAscending : true;

			sortChangedCallbacks.fire();
		});

		if (opt.onCellClick) {
			$(opt.tableSelector).on('click', 'tbody tr td', function () {
				var cell = this;
				opt.onCellClick(cell);
			});
		}

		return {
			render: function (data) {

				var visibleColumns = $.grep(data.columns, function (column) { return column.includeType === 'Column'; });

				var $table = $(opt.tableSelector);
				$table.empty();
				var tableStyling = getTableStyling(opt);

				var table = d3.select(opt.tableSelector)
					.classed(tableStyling, true),

					tableHeader = table
						.append('thead')
						.classed('d3g-table-header', true)
						.append('tr')
						.selectAll('th')
						.data(visibleColumns)
						.enter()
						.append('th')
						.attr('class', function (d) {

							var classValues = 'd3g-header-' + d.index;

							if (d.isSortable === true) {
								classValues = classValues + ' d3g-sortable';
							}

							if (d.sortColumnName === sortColumnName) {
								classValues = classValues + ' d3g-sort-active';

								if (sortAscending) {
									classValues = classValues + ' d3g-sort-asc';
								} else {
									classValues = classValues + ' d3g-sort-desc';
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
								content += '<span class="text-icon d3g-sort-icon"></span>';
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
						.attr('class', function (d) { return 'd3g-content-' + d.index; })
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
					SortOrder: sortAscending ? 'Ascending' : 'Descending'
				};
			}
		};
	}

	d3G.Grid.Table = {
		create: _create
	};

}(window.jQuery, window.d3, window.d3G, window.Handlebars || {}, window));
/* d3G.Grid.Pager.js */
/*jshint undef:true, es5:true */
/*global window */

/// <reference path="Scripts/d3.v3.js" />
/// <reference path="Scripts/jquery-1.9.1.intellisense.js" />
/// <reference path="d3G.Grid.js" />
/// <reference path="d3G.Grid.Table.js" />

var d3G = d3G || {};
d3G.Grid = d3G.Grid || {};

d3G.Grid.Pager = (function ($, d3, d3G, window, undefined) {

	function _create(opt) {

		var page_size_options = [10, 20, 50],
			pageIndex = 0,
			pageSize = page_size_options[0],
			pageChangedCallbacks = $.Callbacks(),
			pageSizeChangedCallbacks = $.Callbacks(),
			totalPages = 0,
			currentPage = 0;

		function _createPageSizer(pagerContainer) {
			var pagerSizerWrapperObj = { classed: 'd3g-pager-sizer-wrapper' },
				pagerSizerMessageObj = { classed: 'd3g-pager-sizer-text' },
				pagerSizerSelectObj = { classed: 'd3g-pager-sizer-select-wrapper' },
				pagerSizerSelectElementObj = { classed: 'd3g-pager-sizer' },
				pagerSizerAppendedObj = { classed: 'd3g-pager-sizer-text-prepend' };

			var pagerSizer = createSingleDomElement(pagerContainer, pagerSizerWrapperObj);

			var pagerSizerPrependedLabel = createSingleDomElement(pagerSizer, pagerSizerMessageObj, 'span');
			pagerSizerPrependedLabel
				.text('Showing');

			var pagerSizerSelect = createSingleDomElement(pagerSizer, pagerSizerSelectObj);

			var pagerSizerSelectElement = createSingleDomElement(pagerSizerSelect, pagerSizerSelectElementObj, 'select');

			pagerSizerSelectElement
				.on('change', function () {
					d3.event.preventDefault();
					pageSize = $(this).val();
					pageSizeChangedCallbacks.fire();
				})
				.selectAll('option')
				.data(page_size_options)
				.enter()
				.append('option')
				.attr('val', function (d) { return d; })
				.text(function (d) { return d; })
				.filter(function (d) { return d === pageSize; })
				.attr('selected', 'selected');

			var pagerSizerAppendedLabel = createSingleDomElement(pagerSizer, pagerSizerAppendedObj, 'span');
			pagerSizerAppendedLabel
				.text('per page');
		}

		function _createPageNavigation(pagerContainer) {
			var navigationWrapperObj = { classed: 'd3g-pager-nav' };
			var buttons = [
				{ Label: 'First', Icon: 'd3g-first', UpdatePageIndex: function () { pageIndex = 0; } },
				{ Label: 'Previous', Icon: 'd3g-previous', UpdatePageIndex: function () { if (pageIndex !== 0) pageIndex -= 1; } },
				{ Label: 'Next', Icon: 'd3g-next', UpdatePageIndex: function () { if (pageIndex !== totalPages - 1) pageIndex += 1; } },
				{ Label: 'Last', Icon: 'd3g-last', UpdatePageIndex: function () { pageIndex = totalPages - 1; } }
			];

			var pagerNav = createSingleDomElement(pagerContainer, navigationWrapperObj);

			// appending the buttons
			pagerContainer.select('.d3g-pager-nav')
				.selectAll('a')
				.data(buttons)
				.enter()
				.append('a')
				.attr('href', '#')
				.attr('class', function (d) { return 'text-icon ' + d.Icon; })
				.text(function (d) { return d.Label; })
				.on('click', function (button) {
					d3.event.preventDefault();
					button.UpdatePageIndex();
					pageChangedCallbacks.fire();
				});
		}

		function _createFullScreenModeButton(pagerContainer) {
			var pagerFullscreenWrapperObj = { classed: 'd3g-pager-fullscreen' },
				pagerFullscreenMessageObj = { classed: 'd3g-pager-fullscreen-message' };

			var pagerFullScreen = createSingleDomElement(pagerContainer, pagerFullscreenWrapperObj, 'a');

			pagerFullScreen
				.classed('icon', true)
				.text('fullscreen Mode')
				.on('click', function (button) {
					d3.event.preventDefault();
					var container = $(this).parents('.d3g-container');
					container.toggleClass('d3g-fullscreen');

					$(window).bind('resize', function () {
						setTableWrapperHeight(container);
					});

					if (container.hasClass('d3g-fullscreen')) {
						setTableWrapperHeight(container);
					} else {
						$('.d3g-table-wrapper').css('height', 'auto');
						$(window).unbind('resize');
					}
				});

			var pagerFullScreenMessage = createSingleDomElement(pagerContainer, pagerFullscreenMessageObj);
			pagerFullScreenMessage.text('Press `ESC` To Exit Fullscreen Mode');

			// 'ESC' Exits from fullscreen mode
			$(window).keyup(function (e) {
				if (e.keyCode === 27) {
					$('.d3g-container').removeClass('d3g-fullscreen');
				}
			});

		}

		function _createCurrentPageMessage(pagerContainer, data) {

			var pagerMessageWrapperObj = { classed: 'd3g-pager-message' };

			var pageMessage = createSingleDomElement(pagerContainer, pagerMessageWrapperObj);

			var pageData = [
				{ Selector: 'd3g-pager-message-title', Content: 'Page ' },
				{ Selector: 'd3g-pager-message-input', Content: currentPage },
				{ Selector: 'd3g-pager-seperator', Content: ' of ' },
				{ Selector: 'd3g-pager-message-total-pages', Content: totalPages }
			];


			var items = pageMessage.selectAll('span')
				.data(pageData);
			items
				.enter()
				.append('span')
				.attr('class', function (d) { return d.Selector; });
			items
				.text(function (d) {
					return d.Content;
				});
		}

		function _createFooterToolbar(pagerContainer, data) {
			var footerToolbarObj = { classed: 'd3g-pager-toolbar' },
			toolsWrapperClassObj = { classed: 'd3g-pager-toolbar-tools' };

			var footerToolbarContainer = createSingleDomElement(pagerContainer, footerToolbarObj);

			var footerToolsContainer = createSingleDomElement(footerToolbarContainer, toolsWrapperClassObj);

			if (data.footerText) {
				_createFooterText(footerToolbarContainer, data.footerText);
			}

			var fullscreen = (typeof opt.canFullScreen !== 'undefined') ? opt.fullscreen : true;
			if (fullscreen) {
				_createFullScreenModeButton(footerToolsContainer);
			}
			// add excel toolbar
		}
		
		function _createFooterText(pagerContainer, content) {
			var wrapperClassObj = { classed: 'd3g-pager-footer-text', 'content': content },
				footerTextContainer = {};

			footerTextContainer = createSingleDomElement(pagerContainer, wrapperClassObj);
			footerTextContainer.text(wrapperClassObj.content);

		}

		/*
		 * Helper: Sets the max height of the table wrapper (for fullscreen mode)
		 *
		 */
		function setTableWrapperHeight(container) {
			// max height for the table container
			var accesoriesHeight = $(opt.pagerSelector).height();
			var gcHeader = $('.d3g-header');

			if (gcHeader) {
				accesoriesHeight += gcHeader.height();
			}

			var tableMaxHeight = $(window).height() - accesoriesHeight;

			container.find('.d3g-table-wrapper').css('height', tableMaxHeight);
		}


		/*
		 * Helper: Includes d3Container, data = {'classed' = 'class-name'}
		 *and options elementName string (defaults to 'div')
		 *
		 */
		function createSingleDomElement(container, data, elementName) {

			elementName = elementName || 'div';

			var domElement = container
				.selectAll('.' + data.classed)
				.data([data]);

			domElement
				.enter()
				.append(elementName)
				.attr('class', function (d) { return d.classed; });

			return domElement;
		}


		return {
			render: function (data) {
				var pagerContainer = {},
					wrapperPagerObject = [{ classed: 'd3g-pager-wrapper' }],
					topWrapperObject = { classed: 'd3g-pager-top-wrapper' },
					pagerTopWrapper = {};

				pagerContainer = d3.select(opt.pagerSelector)
					.classed('d3g-pager', true)
					.selectAll('div')
					.data(wrapperPagerObject);
				
				pagerContainer
					.enter()
					.append('div')
					.attr('class', function(d) { return d.classed; });


				pagerTopWrapper = createSingleDomElement(pagerContainer, topWrapperObject);

				totalPages = Math.ceil(data.totalRowCount / pageSize);
				currentPage = pageIndex + 1; //taking into account the zeroth page

				_createPageNavigation(pagerTopWrapper);
				_createPageSizer(pagerTopWrapper);
				_createCurrentPageMessage(pagerTopWrapper, data);
				_createFooterToolbar(pagerContainer, data);
			},
			pageChanged: {
				addHandler: function (cb) { pageChangedCallbacks.add(cb); },
				removeHandler: function (cb) { pageChangedCallbacks.remove(cb); }
			},
			pageSizeChanged: {
				addHandler: function (cb) { pageSizeChangedCallbacks.add(cb); },
				removeHandler: function (cb) { pageSizeChangedCallbacks.remove(cb); }
			},

			getPageParameters: function () {
				return {
					PageIndex: pageIndex,
					PageSize: pageSize,
				};
			},

			reset: function () {
				totalPages = 0;
				currentPage = 1;
				pageIndex = 0;
			}
		};
	}

	d3G.Grid.Pager = {
		create: _create
	};

}(window.jQuery, window.d3, window.d3G, window));
