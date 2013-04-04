var GCS = GCS || {};
GCS.Grid = GCS.Grid || {};

GCS.Grid.Pager = (function ($, d3, undefined) {

	function _create(opt) {

		var page_size_options = [10, 20, 50],
			pageIndex = 0,
			pageSize = page_size_options[0],
			pageChangedCallbacks = $.Callbacks(),
			pageSizeChangedCallbacks = $.Callbacks(),
			totalPages = 0,
			currentPage = 0;

		function _createPageSizer(pagerContainer) {
			var pagerSizerWrapperObj = { classed :"gc-pager-sizer-wrapper" },
				pagerSizerMessageObj = { classed :"gc-pager-sizer-text" },
				pagerSizerSelectObj = { classed :"gc-pager-sizer-select-wrapper" },
				pagerSizerSelectElementObj = { classed :"gc-pager-sizer" },
				pagerSizerAppendedObj = {classed : 'gc-pager-sizer-text-prepend'};

			var pagerSizer = createSingleDomElement(pagerContainer, pagerSizerWrapperObj);

			var pagerSizerPrependedLabel = createSingleDomElement(pagerSizer, pagerSizerMessageObj, "span");
			pagerSizerPrependedLabel
				.text('Showing');

			var pagerSizerSelect = createSingleDomElement(pagerSizer, pagerSizerSelectObj);

			var pagerSizerSelectElement = createSingleDomElement(pagerSizerSelect, pagerSizerSelectElementObj, "select");

			pagerSizerSelectElement			
				.on("change", function () {
					d3.event.preventDefault();
					pageSize = $(this).val();
					pageSizeChangedCallbacks.fire();
				})
				.selectAll("option")
				.data(page_size_options)
				.enter()
				.append("option")
				.attr("val", function (d) { return d; })
				.text(function (d) { return d; })
				.filter(function(d){ return d == pageSize;})
				.attr('selected', "selected");

			var pagerSizerAppendedLabel = createSingleDomElement(pagerSizer, pagerSizerAppendedObj, "span");
			pagerSizerAppendedLabel
				.text("per page");
		}

		function _createPageNavigation(pagerContainer) {
			var navigationWrapperObj = {classed : "gc-pager-nav"};
			var buttons = [
				{ Label: 'First', Icon: "gcgrid-first", UpdatePageIndex: function () { pageIndex = 0; } },
				{ Label: 'Previous', Icon: "gcgrid-previous", UpdatePageIndex: function () { if (pageIndex != 0) pageIndex -= 1; } },
				{ Label: 'Next', Icon: "gcgrid-next", UpdatePageIndex: function () { if(pageIndex != totalPages-1) pageIndex += 1; } },
				{ Label: 'Last', Icon: "gcgrid-last", UpdatePageIndex: function () { pageIndex = totalPages-1; } }
			];

			var pagerNav = createSingleDomElement(pagerContainer, navigationWrapperObj);

			// appending the buttons
			pagerContainer.select('.gc-pager-nav')
				.selectAll("a")
				.data(buttons)
				.enter()
				.append("a")
				.attr("href", "#")
				.attr("class", function (d) { return "text-icon " + d.Icon; })
				.text(function (d) { return d.Label; })
				.on("click", function (button) {
					d3.event.preventDefault();
					button.UpdatePageIndex();
					pageChangedCallbacks.fire();
				});
		}

		function _createFullScreenModeButton(pagerContainer){
			var pagerFullscreenWrapperObj = { classed : "gc-pager-fullscreen" },
				pagerFullscreenMessageObj = { classed : "gc-pager-fullscreen-message" };

			var pagerFullScreen = createSingleDomElement(pagerContainer, pagerFullscreenWrapperObj, "a");

			pagerFullScreen
				.classed('icon', true) 
				.text("fullscreen Mode")
				.on('click',function(button){
					d3.event.preventDefault();
					var container = $(this).parents('.gcgrid-container');
					container.toggleClass('gcgrid-fullscreen');
					
					$(window).bind('resize', function () { 
    					setTableWrapperHeight(container);
					});

					if(container.hasClass('gcgrid-fullscreen')){
						setTableWrapperHeight(container);
					}
					else{
						$('.gcgrid-table-wrapper').css('height', 'auto');
						$(window).unbind('resize');
					}
				});	

			var pagerFullScreenMessage = createSingleDomElement(pagerContainer, pagerFullscreenMessageObj );
			pagerFullScreenMessage.text("Press 'ESC' To Exit Fullscreen Mode");

			// 'ESC' Exits from fullscreen mode
			$(document).keyup(function(e) {
				if (e.keyCode == 27) {
                	$('.gcgrid-container').removeClass('gcgrid-fullscreen');
            	}
			});

		}

		function _createCurrentPageMessage(pagerContainer, data) {

			var pagerMessageWrapperObj = {classed : "gc-pager-message"};

			var pageMessage = createSingleDomElement(pagerContainer, pagerMessageWrapperObj);

			var pageData = [
				{ Selector: 'gc-pager-message-title', Content: "Page " },
				{ Selector: 'gc-pager-message-input', Content: currentPage },
				{ Selector: 'gc-pager-seperator', Content: " of " },
				{ Selector: 'gc-pager-message-total-pages', Content: totalPages }
			];


			var items = pageMessage.selectAll("span")
				.data(pageData);
			items
				.enter()
				.append("span")
				.attr("class", function(d) { return d.Selector; });
			items
				.text(function(d) {
					return d.Content;
				});
		}
		
		function _createFooterToolbar(pagerContainer, data){
				var footerToolbarObj = {classed: "gcgrid-pager-toolbar"},
				toolsWrapperClassObj =  {classed: "gcgrid-pager-toolbar-tools"};

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
		function _createFooterText(pagerContainer, content){
			var wrapperClassObj = { classed : "gcgrid-pager-footer-text", "content": content },
				footerTextContainer = {};
			
			var footerTextContainer = createSingleDomElement(pagerContainer, wrapperClassObj);
			footerTextContainer.text(wrapperClassObj.content);

		}

		/*
		 * Helper: Sets the max height of the table wrapper (for fullscreen mode)
		 *
		 */
		function setTableWrapperHeight(container){
			// max height for the table container
			var accesoriesHeight = $(opt.pagerSelector).height();
			var gcHeader = $('.gcgrid-header');

			if(gcHeader){
				accesoriesHeight += gcHeader.height();
			}

			var tableMaxHeight = $(window).height() - accesoriesHeight;

			container.find('.gcgrid-table-wrapper').css('height', tableMaxHeight);
		}


		/*
		 * Helper: Includes d3Container, data = {'classed' = "class-name"}
		 *and options elementName string (defaults to 'div')
		 *
		 */
		function createSingleDomElement(container, data, elementName){

			elementName = elementName || 'div';

			var domElement = container
				.selectAll('.' + data.classed)
				.data([data]);

			domElement
			   	.enter()
			   	.append(elementName)
			   	.attr( "class", function (d) { return d.classed; });

			return domElement;
		}


		return {
			render: function (data) {
				var pagerContainer = {},
					wrapperPagerObject = [{ classed : "gcgrid-pager-wrapper" }],
					topWrapperObject = { classed : "gcgrid-pager-top-wrapper"},
					pagerTopWrapper = {};

				pagerContainer = d3.select(opt.pagerSelector)
					.classed('gcgrid-pager', true)
					.selectAll("div")
					.data(wrapperPagerObject);
				pagerContainer
					.enter()
					.append('div')
					.attr( "class", function (d) { return d.classed; })


				pagerTopWrapper =  createSingleDomElement(pagerContainer, topWrapperObject);
				
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

	return {
		create: _create,
	};

})(jQuery, d3);