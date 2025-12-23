/**
 * Help class for paging
 *
 * This class organizes the paging functionality of the table.
 *
 * @param tableController
 * @param dataView
 * @param grid
 * @param options
 * @constructor
 * @private
 */
function SlickPaging(tableController, dataView, grid, options) {


	/**
	 * store some page information
	 * @type {Array}
	 * @private
	 */
	var page = [];
	page.current = [];
	page.current.floor = 0;
	page.current.break = true;
	page.current.ceil = 0;
	page.current.top = 0;
	page.size = 0;
	page.total = 0;
	page.grid = grid;
	page.ui = [];

	/**
	 * parameter
	 * @type {boolean}
	 * @private
	 */
	var _preventViewport = true;

	/**
	 * Clean navigation callbacks
	 */
	this.destroy = function () {
		page = null;
		_preventViewport = null;
	};


	/**
	 * Initialization of the paging
	 */
	this.init = function () {
		var vp = grid.getViewport();
		page.size = vp.bottom - vp.top - 1;
		page.total = grid.getDataLength();
		dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
			page.total = grid.getDataLength(); // Math.ceil(grid.getDataLength() / page.size);
		});
	};


	/**
	 * Reevaluation of size in case of ui changes (e.g. show hide filterbar)
	 */
	this.revalSize = function() {
		var back = page.current.top;
		page.grid.scrollRowToTop(0, true);
		var vp = grid.getViewport();
		page.size = vp.bottom; // - vp.top -1;
		page.grid.scrollRowToTop(back, true);
	}


	/**
	 * Moving to first page
	 */
	this.gotoFirstPage = function () {
		page.current.top = 0;
		_preventViewport = true;
		page.grid.scrollRowToTop(page.current.top, true);
	};


	/**
	 * Moving to last page
	 */
	this.gotoLastPage = function () {
		// page.current.top = Math.floor(page.total / page.size) * page.size;
		page.current.top = page.total - page.size;
		_preventViewport = true;
		page.grid.scrollRowToTop(page.current.top, true);
	};


	/**
	 * Moving to next page
	 */
	this.gotoNextPage = function () {
		var next = page.current.ceil;
		if ((next * page.size) < page.total) {
			page.current.top = next * page.size;
			_preventViewport = true;
			page.grid.scrollRowToTop(page.current.top, true);
		}
		if ((next * page.size) >= page.total) {
			page.current.top = next * page.size;
			_preventViewport = true;
			page.grid.scrollRowToTop(page.total, true);
		}
	};


	/**
	 * Moving to specified page
	 * @param pageNumber specific page number
	 * @returns {boolean}
	 */
	this.gotoPageByNumber = function (pageNumber) {
		var goToPage = (pageNumber-1) * page.size;
		if (goToPage >= 0 && goToPage <= page.total) {
			page.current.top = goToPage;
			_preventViewport = true;
			page.grid.scrollRowToTop(page.current.top, false);
			return true;
		} else {
			return false;
		}
	};


	/**
	 * Moving to previous page
	 */
	this.gotoPreviousPage = function () {
		var prev = page.current.floor > 0 ? page.current.floor : 0;
		if ((prev * page.size) >= 0) {
			page.current.top = prev * page.size;
			_preventViewport = true;
			page.grid.scrollRowToTop(page.current.top, true);
			page.current.lastVaildPosition = prev;
		}
	};


	/**
	 * Paging informations for ui components
	 * @param viewport
	 * @returns {*}
	 */
	this.updateInformation = function (viewport) {
		_currentPage(viewport);
		page.total = grid.getDataLength();
		page.ui.total = Math.ceil(page.total / page.size);
		page.ui.current = page.current.page + 1;
		page.ui.first = page.current.first < 1;
		page.ui.last = (page.current.last + 1) >= page.total;
		return page.ui;
	}


	/**
	 * Get the current status of the navigation
	 * @returns {*}
	 * @private
	 */
	function _getNavState() {
		var cannotLeaveEditMode = !Slick.GlobalEditorLock.commitCurrentEdit();
		var pagingInfo = dataView.getPagingInfo();
		var lastPage = pagingInfo.totalPages - 1;

		return {
			canGotoFirst: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum > 0,
			canGotoLast: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum != lastPage,
			canGotoPrev: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum > 0,
			canGotoNext: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum < lastPage,
			pagingInfo: pagingInfo
		}
	}


	/**
	 * calculation of current page informations
	 * @param viewport slick grid viewport informations
	 * @private
	 */
	function _currentPage(viewport){
		var gridSize = grid.getDataLength();

		if(typeof viewport != "undefined" && !_preventViewport){
			page.current.top = viewport.top < 1 ? viewport.top : viewport.top +1;
		}

		/* correction for scrolling over last page top element */
		/* !DO NOT USE BOTTOM IN CALCULATION! */
		/* bottoms counts partial (visible) lines if only 1px is show = thatÂ´s already the boarder! */
		if(page.current.top > gridSize - page.size - 1) {
			page.current.top = gridSize - page.size;
		}

		// Fix for half lines
		var scaleType = webMI.getConfig("frame.scaletype");
		var top;
		if (webMI.getClientInfo().browserType.isChrome && scaleType == "zoom")
			top = page.current.top;
		else
			top = page.current.top < viewport.top ? page.current.top : viewport.top;

		// Fix for half lines @ bottom
		if(typeof viewport != "undefined") {
			if(viewport.bottom >= gridSize){
				top++;
				page.current.page++;
			}
		}

		var bottom = top + page.size;
		var size = page.size;
		page.current.page = Math.floor(top / size);
		page.current.floor = page.current.page -1;
		page.current.ceil = page.current.page +1;
		page.current.break = page.current.page == top / size;
		if(!page.current.break) {
			page.current.floor++;
		}
		page.current.first = top;
		page.current.last = bottom-1;
		_preventViewport = false;
	}

	/**
	 * Set the page size
	 * @param n number of items on page
	 * @private
	 */
	function _setPageSize(n) {
		dataView.setRefreshHints({
			isFilterUnchanged: true
		});

		if (n > 0) {
			dataView.setPagingOptions({pageSize: n});
		} else {
			var vp = grid.getViewport();
			dataView.setPagingOptions({pageSize: (vp.bottom - vp.top - 1)});
		}
	}
}