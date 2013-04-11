/*jshint undef:true, es5:true, camelcase:true, forin:true, curly:true, eqeqeq:true */
/*global window */

/// <reference path="Scripts/d3.v3.js" />
/// <reference path="Scripts/jquery-1.9.1.intellisense.js" />
/// <reference path="d3G.Grid.js" />
/// <reference path="d3G.Grid.Table.js" />

(function ($, d3, d3G, window, undefined) {

	function _create(opt) {

		var pageSizeOptions = [10, 20, 50],
			pageIndex = 0,
			pageSize = pageSizeOptions[0],
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
				.data(pageSizeOptions)
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
				{ Label: 'Previous', Icon: 'd3g-previous', UpdatePageIndex: function () { if (pageIndex !== 0) { pageIndex -= 1; } } },
				{ Label: 'Next', Icon: 'd3g-next', UpdatePageIndex: function () { if (pageIndex !== totalPages - 1) { pageIndex += 1; } } },
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
