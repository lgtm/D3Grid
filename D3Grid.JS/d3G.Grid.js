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
