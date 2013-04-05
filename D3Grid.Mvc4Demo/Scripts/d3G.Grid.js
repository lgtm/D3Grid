/// <reference path="../jquery-1.9.1.intellisense.js" />
/// <reference path="../d3.v3.js" />

var d3G = d3G || {};
d3G.Grid = (function ($, undefined) {

	function _ensureOptions(options) {
		if (typeof options.dataUrl !== 'string') {
			throw 'd3G.Grid: `dataUrl` must be a string (url)!';
		}
	}

	function _create(opt) {

		d3.select(opt.containerSelector).classed("gcgrid-container loading-content-container", true);

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
			d3G.Modals.Loading.show({ showCurtain: false, selector: opt.containerSelector });

			pageAndSortParameters = pageAndSortParameters || _getPageAndSortParameters();

			$.ajax({
				url: opt.dataUrl,
				data: pageAndSortParameters,
				dataType: 'json',
				traditional: true,
				type: 'POST'
			}).done(function (data) {
				pageCache[pageAndSortParameters.PageIndex] = data;
				_finishDataLoad(data);
			}).fail(function () {
				_dataLoadFailed();
			});
		}

		function _finishDataLoad(gridData) {
			d3G.Modals.Loading.hide({ showCurtain: false, selector: opt.containerSelector });

			table.render(gridData);
			pager.render(gridData);
		}

		function _dataLoadFailed() {
			d3G.Modals.Loading.hide({ showCurtain: false, selector: opt.containerSelector });

			d3G.Modals.AlertMessage.show({ text: 'An error occurred. Please try again.' });
		}

		table.sortColumnChanged.addHandler(function () {
			pageCache = {};
			pager.reset();
			_startDataLoad();
		});

		function changePage() {
			var pageAndSortParameters = _getPageAndSortParameters();

			if (pageCache[pageAndSortParameters.PageIndex]) {
				_finishDataLoad(pageCache[pageAndSortParameters.PageIndex]);
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

	return {
		create: _create
	};

})(jQuery);
