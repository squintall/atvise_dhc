/**
 * Cell alignment
 * @memberOf SlickController
 * @enum {string} alignment
 */
var alignment = {
	"top-left": "top-left",
	"left": "left",
	"bottom-left": "bottom-left",
	"top-center": "top-center",
	"center": "center",
	"bottom-center": "bottom-center",
	"top-right": "top-right",
	"right": "right",
	"bottom-right": "bottom-right"
};

/**
 * Cell text style
 * @memberOf SlickController
 * @enum {string} textoption
 */
var textoption = {
	'normal': 'text-normal',
	'italic': 'text-italic',
	'small-caps': 'text-small-caps',
	'bold': 'text-bold',
	'bold-italic': 'text-bold-italic',
	'bold-small-caps': 'text-bold-small-caps',
	'bolder': 'text-bolder',
	'bolder-italic': 'text-bolder-italic',
	'bolder-small-caps': 'text-bolder-small-caps',
	'lighter': 'text-lighter',
	'lighter-italic': 'text-lighter-italic',
	'lighter-small-caps': 'text-lighter-small-caps'
};


/**
 * A module that covers the functionality of the SlickGrid library and additional feature implementations.
 *
 * Even if the configuration of the slick controller is directly possible,
 * we still recommend using the slickconfigurator to create a valid configuration
 *
 * @param {object} DataController Instance of the dataController module
 *
 * @param {object} config Configuration of the table.
 * @param {array} config.columns Column definitions of the table
 * @param {alignment} config.columns.n.alignment Alignment of cell contents (Overrides css class!)
 * @param {string} config.columns.n.cssClass CSS class for columns (Will be overwritten by alignment!)
 * @param {string} config.columns.n.field ID of the data element (field id)
 * @param {boolan} [config.columns.n.filter = true] Enable filtering for the column. Does not affect custom filters!
 * @param {function} config.columns.n.formatter Function for formatting column contents (see SlickFormatter helper)
 * @param {string} config.columns.n.headerCssClass CSS class for header
 * @param {string} config.columns.n.id ID of the column
 * @param {number} config.columns.n.maxWidth Maximum column width in px
 * @param {number} config.columns.n.minWidth Minimum column width in px
 * @param {number} config.columns.n.name Display column title in the header
 * @param {boolan} [config.columns.n.resizable = true] Enables the change of column width
 * @param {boolan} [config.columns.n.sortable = true] Enable sorting for the column
 * @param {boolan} config.columns.n.sortByDefaultAsc Marks the column for â€‹â€‹automatically sorting (true asc, false desc)
 * @param {string} config.columns.n.textoption Style of cell text
 * @param {array} config.columns.n.type Definition of custom formatting
 * @param {array} config.columns.n.type.0 Conversion type (e.g. datetime)
 * @param {array} config.columns.n.type.1 Optional conversion parameter (e.g. "s" for seconds)
 * @param {boolan} config.columns.n.visible Defines column visibile by default
 * @param {number} config.columns.n.width column width in px
 *
 * @param {string} containerID ID of the slickgrid container provided by document.getElementById(displayid).getAttribute("id");
 *
 * @param {object} config.data Data configuration (see DataController)
 * @param {number} [config.data.bufferInterval = 50] Time in milliseconds
 * @param {number} [config.renderInterval = 100] Time interval in which data is rendered
 * @param {number} [config.data.continuationInterval = 250] Period between the retrieval of data
 * @param {function} config.data.customComparer Custom filter function
 * @param {function} config.data.dataRequestFunction Function used to retrieve the data and thus populate the table
 * @param {function} config.data.dataReleaseFunction Function used to release the continuation point on data deletion
 * @param {enum} config.data.mode Runtime specification (e.g. once)
 * @param {boolean} [config.data.truncateOverflow = true] Data that exceed the truncated limit will not be processed
 * @param {boolean} [config.data.truncateReverse = true] Data is truncated at the end (true)
 * @param {number} [config.data.truncateSize = 1000000] Elements in the memory before truncation starts
 *
 * @param {object} config.feature Features implemented
 * @param {object} config.feature.columnReorder Enable column reorder by controller
 * @param {function} config.feature.detailRowCallback Function to be executed when clicking on the header
 * @param {function} [config.feature.detailRowExclude] Function for exclude items from the detail view.
 * @param {string} config.feature.detailRowHeader Custom header for the detail row column
 * @param {function} [config.feature.detailRowTemplate] Function for formatting the detail view.
 * @param {number} [config.feature.detailRows = 0] Number of reserved lines for the detail view. (0 disables the detail view)
 * @param {number} [config.feature.filterDelay = 1000] Input delay until the filter function is executed (0 to switch off)
 * @param {number} [config.feature.filterLength = 1] Minimal length of the text to filter for
 * @param {boolean} [config.feature.filterRegExp = false] Use regular expressions for filtering
 * @param {boolean} [config.feature.filterCaseSensitive] Case-sensitive filtering
 * @param {boolean} [config.feature.filterStar = false] Activation of the "star" placeholder in the search function
 * @param {object} [settings.filterConversion = false] Custom conversion for values
 * @param {boolean} [config.feature.multiselect = false] Allow the selection of multiple rows
 * @param {boolean} [config.feature.multicellselect = false] Allow the selection of multiple rows by cell click
 * @param {onClickCallback} [config.feature.onClickCallback] Function that is invoked when the user clicks on the table "function(clickinfo)"
 * @param {onHeaderClickCallback} [config.feature.onHeaderClickCallback] Function that is invoked when the user clicks on the table header "function(clickinfo)"
 *
 * @param {object} config.feature.onClickCallback.clickInfo Information provided to the function
 * @param {object} config.feature.onClickCallback.clickInfo.item clicked table item
 * @param {number} config.feature.onClickCallback.clickInfo.rowIndex clicked row-index
 * @param {object} config.feature.onClickCallback.clickInfo.column the column configuration object of the clicked column
 *
 * @param {boolean} [config.feature.paging = false] Enable paging functionality
 * @param {function} config.feature.rowFormatter ...
 * @param {boolean} [config.feature.showMode = true] Show runtime mode in the status bar, if available
 * @param {object} config.feature.tableMenu Configuration for the table menu
 * @param {array} config.feature.tableMenu.commandMenuEntries Provided by the SlickConfigurator
 * @param {string} config.feature.tableMenu.commandMenuEntries.n.command Click command
 * @param {boolan} config.feature.tableMenu.commandMenuEntries.n.disabled Disabled in the menu
 * @param {string} config.feature.tableMenu.commandMenuEntries.n.group Command group name
 * @param {boolean} config.feature.tableMenu.commandMenuEntries.n.hidden Hidden in the menu
 * @param {string} config.feature.tableMenu.commandMenuEntries.n.title Text in the menu
 * @param {array} config.feature.tableMenu.customMenuEntries User defined items (structure like commandMenuEntries)
 * @param {string} config.feature.tableMenu.customMenuEntries.n.command Click command
 * @param {boolan} config.feature.tableMenu.customMenuEntries.n.disabled Disabled in the menu
 * @param {string} config.feature.tableMenu.customMenuEntries.n.group Command group name
 * @param {boolean} config.feature.tableMenu.customMenuEntries.n.hidden Hidden in the menu
 * @param {string} config.feature.tableMenu.customMenuEntries.n.title Text in the menu
 * @param {array} config.feature.tableMenu.exportMenuEntries Provided by the SlickConfigurator
 * @param {string} config.feature.tableMenu.exportMenuEntries.n.command Click command
 * @param {boolan} config.feature.tableMenu.exportMenuEntries.n.disabled Disabled in the menu
 * @param {string} config.feature.tableMenu.exportMenuEntries.n.group Command group name
 * @param {boolean} config.feature.tableMenu.exportMenuEntries.n.hidden Hidden in the menu
 * @param {string} config.feature.tableMenu.exportMenuEntries.n.title Text in the menu
 * @param {number} config.feature.tableMenu.menuHeight Height of the menu
 * @param {number} config.feature.tableMenu.menuWidth Width of the menu
 * @param {boolean} config.feature.tableMenu.showMenu En-/Disable menu
 * @param {string} config.feature.tableMenu.showMenuCommandTitle Title of command menu part
 * @param {string} config.feature.tableMenu.showMenuCustomTitle Title of custom menu part
 * @param {string} config.feature.tableMenu.showMenuExportTitle Title of export menu part
 * @param {boolean} config.feature.tableMenu.showMenuPicker Display of the columns in the menu for fading in and out
 * @param {string} config.feature.tableMenu.showMenuPickerTitle Title of column picker menu part
 *
 * @param {object} config.icons Optional symbols for use in the Visu
 * @param {object} config.icons.burger Symbol for opening and closing the menu (SVG Icon)
 * @param {object} config.icons.selected *reserved* (SVG Icon)
 * @param {object} config.icons.selector Symbol for the quick selection of all markings (SVG Icon)
 *
 * @param {boolean} config.isReady Status of the configuration
 *
 * @param {boolean} config.language General language settings
 *
 * @param {object} config.options SlickGrid specific options
 * @param {boolean} config.options.alwaysShowVerticalScroll Display of the vertical scrollbar
 * @param {boolean} config.options.enableCellNavigation Appears to enable cell virtualisation for optimised speed with large datasets
 * @param {boolean} config.options.enableColumnReorder Enable column reordering by slick grid (important, set this param to false)
 * @param {boolean} config.options.forceFitColumns Force column sizes to fit into the container (preventing horizontal scrolling).
 * @param {object} config.options.gridMenu Configuration for the table menu
 * @param {array} config.options.gridMenu.commandMenuEntries Provided by the SlickConfigurator
 * @param {string} config.options.gridMenu.commandMenuEntries.n.command Click command
 * @param {boolan} config.options.gridMenu.commandMenuEntries.n.disabled Disabled in the menu
 * @param {string} config.options.gridMenu.commandMenuEntries.n.group Command group name
 * @param {boolean} config.options.gridMenu.commandMenuEntries.n.hidden Hidden in the menu
 * @param {string} config.options.gridMenu.commandMenuEntries.n.title Text in the menu
 * @param {array} config.options.gridMenu.customMenuEntries User defined items (structure like commandMenuEntries)
 * @param {string} config.options.gridMenu.customMenuEntries.n.command Click command
 * @param {boolan} config.options.gridMenu.customMenuEntries.n.disabled Disabled in the menu
 * @param {string} config.options.gridMenu.customMenuEntries.n.group Command group name
 * @param {boolean} config.options.gridMenu.customMenuEntries.n.hidden Hidden in the menu
 * @param {string} config.options.gridMenu.customMenuEntries.n.title Text in the menu
 * @param {array} config.options.gridMenu.exportMenuEntries Provided by the SlickConfigurator
 * @param {string} config.options.gridMenu.exportMenuEntries.n.command Click command
 * @param {boolan} config.options.gridMenu.exportMenuEntries.n.disabled Disabled in the menu
 * @param {string} config.options.gridMenu.exportMenuEntries.n.group Command group name
 * @param {boolean} config.options.gridMenu.exportMenuEntries.n.hidden Hidden in the menu
 * @param {string} config.options.gridMenu.exportMenuEntries.n.title Text in the menu
 * @param {number} config.options.gridMenu.menuHeight Height of the menu
 * @param {number} config.options.gridMenu.menuWidth Width of the menu
 * @param {boolean} config.options.gridMenu.showMenu En-/Disable menu
 * @param {string} config.options.gridMenu.showMenuCommandTitle Title of command menu part
 * @param {string} config.options.gridMenu.showMenuCustomTitle Title of custom menu part
 * @param {string} config.options.gridMenu.showMenuExportTitle Title of export menu part
 * @param {boolean} config.options.gridMenu.showMenuPicker Display of the columns in the menu for fading in and out
 * @param {string} config.options.gridMenu.showMenuPickerTitle Title of column picker menu part
 *
 * @param {number} config.options.headerRowHeight Height of the header
 * @param {boolean} config.options.rowHeight Height of the data lines
 * @param {object} config.options.showHeaderRow Display of the filter line
 * @param {number} config.options.topPanelHeight
 *
 * @param {object} config.style table styling (rever to SlickStyler)
 * @param {color} config.style.detail_cell_color: Background color for unfolded detail information
 * @param {color} config.style.detail_text_color: Text color for unfolded detail information
 * @param {number} config.style.detail_text_size: Text size for unfolded detail information
 * @param {string} config.style.font_family Family of font (Arial, Courier ...)
 * @param {color} config.style.footer_cell_color Background color for footer
 * @param {color} config.style.footer_mode_color Color for mode informations
 * @param {color} config.style.footer_text_color Text color for footer
 * @param {number} config.style.footer_text_size "Text size for footer"
 * @param {color} config.style.header_border_color Color of the header border
 * @param {color} config.style.header_cell_color Background color for header, slider (scrollbar), custom filter, status bar
 * @param {number} config.style.header_height Height of the header
 * @param {color} config.style.header_text_color Text color for header, slider background (scrollbar), custom filter, status bar
 * @param {color} config.style.header_text_size Text size for header, custom filter, status bar
 * @param {color} config.style.hover_cell_color Background color for hovered cells
 * @param {color} config.style.hover_text_color Text color for hovered cells
 * @param {color} config.style.row_border_color Color of the row border
 * @param {color} config.style.row_cell_color_even Background color for even rows
 * @param {color} config.style.row_cell_color_odd Background color for odd rows
 * @param {number} config.style.row_height Height of the rows
 * @param {color} config.style.row_text_color_even Text color for even rows
 * @param {color} config.style.row_text_color_odd Text color for odd rows
 * @param {number} config.style.row_text_size Text size for rows
 * @param {color} config.style.scrollbar_color Color for scroll bar
 * @param {color} config.style.scrollbar_tumb_color Color for scroll bar tumb
 * @param {color} config.style.selection_cell_color Background color for selected rows
 * @param {color} config.style.selection_text_color Text color for selected rows
 * @param {color} config.style.table_icon_color Color for symbols
 * @param {color} config.style.themeClass Class for custom css
 * @param {color} config.style.linebreak Switch for linebreak mode (true / false)
 *
 * @param {object} config.translation Object with translation informations (eg. for tooltip)
 *
 * @constructor
 */
function SlickController(DataController, config) {
	var ENABLE_CONTOLLER_DEBUG = false;
	var that = this;

	/**
	 * Internal Parameter
	 * @type {Array}
	 * @private
	 */
	var _internal = [];

	/**
	 * Timeouts
	 * @type {Array}
	 * @private
	 */
	_internal.controllerTimeoutList = [];


	/**
	 * Flag for clear event happend
	 * @type {boolean}
	 * @private
	 */
	_internal.clearEvent = false;
	_internal.clearEventTimer = 100;
	_internal.clearEventTimeout = null;
	_internal.clearPublishTimeout = null;

	/**
	 * Flag for click event happend
	 * @type {boolean}
	 * @private
	 */
	_internal.clickEvent = false;
	_internal.clickEventTimeout = null;

	/**
	 * Delete items timeout
	 * @type {null}
	 * @private
	 */
	_internal.deleteTimeout;
	_internal.deleteLastCall = 50;
	_internal.deleteQueue = [];

	/**
	 * Expand items
	 * @type {Array}
	 * @private
	 */
	_internal.expandItems = [];
	_internal.expandTimeout;
	_internal.expandItemList = [];
	_internal.expandRestoreList = [];

	/**
	 * Store of open/close dialogs
	 * @type {null}
	 * @private
	 */
	_internal.openDialogs = null;

	/**
	 * original column config
	 * @private
	 */
	_internal.originColumnConfig = false;

	/**
	 * publishStack
	 * @type {Array}
	 * @private
	 */
	_internal.publishStack = [];

	/**
	 * rendering options
	 * @type {Array}
	 * @private
	 */
	_internal.rendering = [];
	_internal.rendering.update = null;
	_internal.rendering.render = null;
	_internal.rendering.forceTimeout = null;
	_internal.rendering.forceTimeoutMaximum = 333;
	_internal.rendering.lastCall = 0;
	_internal.rendering.nextCall = 0;

	/**
	 * resize timeout
	 * @type {null}
	 * @private
	 */
	_internal.resizeTimeout = null;

	/**
	 * datacontroller restart after selection updates
	 * @private
	 */
	_internal.restartDataControllerTimeout;

	/**
	 * datacontroller delay start (prevent interaction with clear table)
	 * @private
	 */
	_internal.startEventTimeout = null;

	/**
	 * Selected items
	 * @type {Array}
	 * @private
	 */
	_internal.selectionList = [];
	_internal.selectionTimeout = false;

	/**
	 * Flag for click event happend
	 * @type {boolean}
	 * @private
	 */
	_internal.sortIE11 = !!window.MSInputMethodContext && !!document.documentMode;

	/**
	 * Marked items
	 * @type {Array}
	 * @private
	 */
	_internal.storeMarker = [];

	/**
	 * timeout for preventing double triggering
	 * @private
	 */
	_internal.triggerRunning = false;
	_internal.triggerTimeout = false;

	/**
	 * Update timeout
	 * @type {Array}
	 * @private
	 */
	_internal.updateQueue = [];
	_internal.updateTimeout;

	/**
	 * Skip resort if data not updated
	 * @type {boolean}
	 */
	_internal.forceResort = false;

	/**
	 * Add data to the data model and get an array with ids, that represent the added dataSets.
	 * @param {object} data containing continuation and records
	 * @param {object} data.CP Object
	 * @param {string} data.CP.field Custom field name to be returned if continued (e.g. custom request)
	 * @param {string} data.CP.value Custom value to be returned if continued (e.g. custom request)
	 * @param {number} data.continuationpoint Continuation point of the server response
	 * @param {object} data.result Array of Records
	 * @param {boolean} [autoPublish = true] Option to disable the automatic forwarding of data to the ui
	 * @returns {*}
	 */
	this.addData = function (data, autoPublish) {
		_internal.forceResort = true;

		if (typeof autoPublish === "undefined")
			autoPublish = true;

		// check for conversions and add atvise marker
		var conversions = [];
		for (var c in that.columns) {
			if (typeof that.columns[c].type != "undefined") {
				conversions[that.columns[c].field] = that.columns[c].type;
			}
		}
		if (typeof data.result[0] == "undefined") {
			data.result.atvise_marker = false;
			if (typeof config.feature.detailRowExclude === "function" && config.feature.detailRowExclude(data.result)) {
				data.result.atvise_expand = -1;
			} else {
				data.result.atvise_expand = false;
			}
		} else {
			for (var pos in data.result) {
				data.result[pos].atvise_marker = false;
				data.result[pos].atvise_expand = false;
				if (typeof config.feature.detailRowExclude === "function" && config.feature.detailRowExclude(data.result[pos])) {
					data.result[pos].atvise_expand = -1;
				} else {
					data.result[pos].atvise_expand = false;
				}
			}
		}

		// add data
		if (autoPublish == true) {
			return DataController.addModelData(data, that);
		} else {
			return DataController.addModelData(data);
		}
	};


	/**
	 *
	 */
	this.clearControllerTimeout = function (controllerTimeout) {
		var newControllerTimeoutList = [];
		for (var key in _internal.controllerTimeoutList)
			if (_internal.controllerTimeoutList[key] != controllerTimeout) {
				newControllerTimeoutList.push(_internal.controllerTimeoutList[key]);
			}
		_internal.controllerTimeoutList = newControllerTimeoutList;
		newControllerTimeoutList = null;
		return window.clearTimeout(controllerTimeout);
	}

	/**
	 * Deletes all data from table and data model
	 */
	this.clearData = function () {
		_internal.forceResort = true;

		_internal.clearEvent = true;
		_internal.selectionList = [];
		_internal.storeMarker = [];
		_internal.expandItemList = [];
		this.grid.setSelectedRows([]);
		DataController.clearModelData();
		this.dataView.setItems([]);

		_internal.clearEventTimeout = setTimeout(function clearDone() {
			_internal.clearEvent = false;
		}, _internal.clearEventTimer);

		_internal.controllerTimeoutList.push(_internal.clearEventTimeout);
	};


	/**
	 * Remove a certain filter by its id, previously set by [setFilter]{@Link SlickController.setFilter}
	 * @param {string} id
	 */
	this.clearFilterByID = function (id) {
		this.filter.clearFilterByID(id);
	};


	/**
	 * Clear all filters (except internal filter-bar)
	 */
	this.clearFilters = function () {
		this.filter.clearFilters();
	};


	/**
	 * Start a single data query manually
	 */
	this.continueDataRequest = function () {
		DataController.trigger(true);
	}


	/**
	 * Delete all data by attribute with value
	 * @param {string} attribute Attribute of a data element
	 * @param {string} value Value to search for
	 * @param {boolean} [exact = true] Match the search value with the found data value
	 */
	this.delete = function (attribute, value, exact) {
		var exact = typeof exact != "undefined" ? exact : true;
		var items = DataController.search(attribute, value, exact);
		for (var i in items) {
			this.removeData(items[i].id);
		}
	}


	/**
	 * Disable menu items that are assigned to a certain group.
	 * @param {string} group
	 */
	this.disableMenuEntriesByGroup = function (group) {
		if (typeof this.feature.tableMenu !== "undefined") {
			this.gridMenu.disableMenuEntriesByGroup(group);
		} else {
			console.warn("SlickController: TableMenu is no enabled!");
		}
	};


	/**
	 * Adding the "shift" event listener prevents duplicate event calls from marking rows.
	 * This ensures the internal marking function of slickgrid.
	 */
	var isShift = false;

	function shiftPressedFunction(e) {
		isShift = (e.key == "Shift");
	}

	function shiftReleaseFunction(e) {
		var shift = e.key == "Shift";
		if (shift) isShift = false;
	}

	function shiftState() {
		return isShift;
	}

	document.addEventListener('keydown', shiftPressedFunction);
	document.addEventListener('keyup', shiftReleaseFunction);


	/**
	 * Destroy sub-modules and clear internal memory
	 */
	this.destroy = function () {
		/** detache some events **/
		try {
			document.removeEventListener('keydown', shiftPressedFunction);
			document.removeEventListener('keyup', shiftReleaseFunction);
		} catch (ex) {
			// event not available in all configs
		}

		/** clean up rendering interval **/
		if (this.renderingInterval) {
			clearInterval(this.renderingInterval);
			this.renderingInterval = null;
		}

		/** clean all timeouts **/
		for (var to in _internal.controllerTimeoutList) {
			if (_internal.controllerTimeoutList[to] != null) {
				window.clearTimeout(_internal.controllerTimeoutList[to]);
			}
		}

		/** clean slick internal stylesheet **/
		var uid = this.grid.getUID();
		var sheets = document.querySelectorAll("style");
		for (var i in sheets) {
			var element = sheets[i];
			if (typeof element.innerHTML != "undefined") {
				if (element.innerHTML.indexOf(uid) > -1) {
					element.parentNode.removeChild(element);
				}
			}
		}

		/** clean up all columns **/
		if("columns" in this) {
			for(var key in this.columns) {
				for(var subkey in this.columns[key])
					delete this.columns[key][subkey];
				delete this.columns[key]
			}
			delete this.columns;
		}

		/** remove dialoges **/
		if("dialogs" in this) {
			for(var key in this.dialogs)
				delete this[key];
			delete this.dialogs;
		}

		/** remove detailTemplate **/
		if("detailTemplate" in this) {
			for(var key in this.detailTemplate)
				delete this.detailTemplate[key];
			delete this.detailTemplate;
		}

		/* debug line
		for(var key in this)
			console.error(key);
		*/


		/** reset tabHandler **/
		this.tabHandler = null;

		/** clear all components **/
		for (var component in this) {
			try {
				this[component].destroy();
				this[component] = null;
				delete this[component];
			} catch (ex) {
				this[component] = null;
				delete this[component];
			}
		}

		/** clean left internals **/
		for (var component in _internal) {
			try {
				_internal[component].destroy();
				_internal[component] = null;
				delete _internal[component];
			} catch (ex) {
				_internal[component] = null;
				delete _internal[component];
			}
		}

		/** reset data controller **/
		DataController.destroy();
	};


	/**
	 * Enable menu items that are assigned to a certain group.
	 * @param {string} group
	 */
	this.enableMenuEntriesByGroup = function (group) {
		if (typeof this.feature.tableMenu !== "undefined") {
			this.gridMenu.enableMenuEntriesByGroup(group);
		} else {
			console.warn("SlickController: TableMenu is no enabled!");
		}
	};


	/**
	 * Force rendering (e.g. after bulk imports or updates)
	 */
	this.forceRendering = function (grid) {
		try {
			that.dataView.beginUpdate();
			if (_internal.forceResort)
				that.dataView.reSort();
			that.dataView.endUpdate();
			grid.invalidate();
			grid.render();
			// that.updateLock = true;
		} catch (ex) {
			// table already invalidated
		}
	}


	/**
	 * Get a data-item from a specific id.
	 * @param {id} [id = undefined] Model ID; leave blank to retrieve the full model data
	 * @returns {array} Array of items
	 * @property {Array} array
	 * @property {object} array.n.item
	 */
	this.getData = function (id) {
		if (typeof id != "undefined") {
			var item = DataController.getModelData(id);
			if (typeof item[0] != "undefined") {
				item[0]["atvise_row"] = this.dataView.getRowById(id);
			}
			return item;
		}
		var items = DataController.getModelData();
		for (var key in items) {
			items[key]["atvise_row"] = this.dataView.getRowById(items[key]["id"]);
		}
		return items;
	};


	/**
	 * Get all filters, that are set currently (except internal filter-bar)
	 * @returns {*|{}}
	 */
	this.getFilters = function () {
		return this.filter.getFilters();
	};


	/**
	 * Returns an object, that provides information about the current paging state.
	 * (totalRows - Argument is set by Slick - stands for the rows that are currently filtered and displayed, not all the rows that are available)
	 * @returns {object_with_paging_information}
	 * @property {Object} object
	 * @property {object} object.dataView slickgrid dataview
	 * @property {number} object.pageNum Current page number
	 * @property {number} object.pageSize Current items on page
	 * @property {number} object.totalPages Total pages
	 * @property {number} object.totalRows Total items
	 */
	this.getPagingInfo = function () {
		return this.dataView.getPagingInfo();
	};


	/**
	 * Get a row of data-item with id.
	 * @param id Model ID
	 * @returns {number} Rownumber of item
	 */
	this.getRowById = function (id) {
		return this.dataView.getRowById(id);
	};


	/**
	 * Retrieves the elements or performs a callback function on the selected data.
	 * @param {function} [callback = undefined] Optional callback to be executed instead of returning an array
	 * @returns {array_with_items} Returns an array of selected elements or true when the callback is executed
	 * @property {Array} array
	 * @property {object} array.n.item
	 */
	this.getSelectedItems = function (callback) {
		var selectedRows = this.grid.getSelectedRows();
		var selectedItems = [];

		for (var index in selectedRows) {
			selectedItems.push(this.grid.getDataItem(selectedRows[index]));
		}

		if (typeof callback == "function") {
			callback(selectedItems);
			return true;
		} else {
			return selectedItems;
		}
	};


	/**
	 * Go to the first page.
	 */
	this.gotoFirstPage = function () {
		this.paging.gotoFirstPage();
	};


	/**
	 * Go to the last page.
	 */
	this.gotoLastPage = function () {
		this.paging.gotoLastPage();
	};


	/**
	 * Go to the next page.
	 */
	this.gotoNextPage = function () {
		this.paging.gotoNextPage();
	};


	/**
	 * Go to a certain page by number.
	 * @param {number} pageNumber Page number to jump to
	 * @returns {boolean} Success of the page change
	 */
	this.gotoPageByNumber = function (pageNumber) {
		return this.paging.gotoPageByNumber(pageNumber);
	};


	/**
	 * Go to the previous page.
	 */
	this.gotoPreviousPage = function () {
		this.paging.gotoPreviousPage();
	};


	/**
	 * Hide a specific column by its (field) name.
	 * @param {string} column Name of column to be hidden
	 * @param {boolean} execute Prevention of execution (for example, if several columns are to be hidden one after the other)
	 */
	this.hideColumn = function (column, execute) {
		if (typeof execute == "undefined") {
			execute = true;
		}
		// todo: hide if cell expands
		this.columnsHideList[column] = true;
		var updateVisibleColumns = [];
		for (var col in this.columns) {
			var id = this.columns[col].id;
			if (!this.columnsHideList[id]) {
				updateVisibleColumns.push(this.columns[col]);
			}
		}
		if (execute) {
			this.grid.setColumns(updateVisibleColumns);
		}
	};


	/**
	 * Hide menu items that are assigned to a certain group.
	 * @param {string} group
	 */
	this.hideMenuEntriesByGroup = function (group) {
		if (typeof this.feature.tableMenu !== "undefined") {
			this.gridMenu.hideMenuEntriesByGroup(group);
		} else {
			console.warn("SlickController: TableMenu is no enabled!");
		}
	};


	/**
	 * Initialisierung des Controllers
	 * @param {function} initializationCallback Callback after completion of the initialization
	 */
	this.init = function (initializationCallback) {
		_setVars.call(this);

		this.containerID = config["containerID"];
		this.columns = config["columns"];
		this.feature = config["feature"];
		this.options = config["options"];
		this.icons = config["icons"];

		this.renderInterval = !isNaN(config["data"]["renderInterval"]) && config["data"]["renderInterval"] > 50 ? config["data"]["renderInterval"] : 50;

		/* raise row buffer for tables with detail rows */
		this.options["minRowBuffer"] = ("detailRows" in this.feature) ? this.feature.detailRows + 5 : 5;

		_internal.originColumnConfig = JSON.parse(JSON.stringify(this.columns));

		/** add internal formatter for text adjustment **/
		for (var c = 0; c < this.columns.length; c++) {
			if (typeof this.columns[c].formatter == "undefined") {
				this.columns[c].formatter = (new webMI.rootWindow.SlickStyler()).AtviseCellItem;
			}
		}

		DataController.setConfig(config["data"]);

		if (typeof config["data"]["dataRequestFunction"] === "function") {
			DataController.dataRequest = config["data"]["dataRequestFunction"].bind(this);
		}
		if (typeof config["data"]["dataReleaseFunction"] === "function") {
			DataController.dataRelease = config["data"]["dataReleaseFunction"].bind(this);
		}

		if (typeof config.feature.detailRowTemplate === "function") {
			this.detailTemplate = config.feature.detailRowTemplate;
		} else {
			this.feature.detailRows = 0;
		}

		_loadLibaries(function () {
			that.libsReady = true;
			_configureSlickTable.call(that, config);
			if (that.deferredDataStart) {
				that.startDataRequest();
			}
			if (typeof  initializationCallback === "function") {
				initializationCallback();
			}
		});
	};

	/**
	 * Perform a predefined conversion (datetime) to a value
	 * @param {object} format object
	 * @param {number} value to convert
	 */
	this.makeConversions = function (format, value) {
		return _makeConversions(format, value);
	};


	/**
	 * Hands over the elements from the data model to the table.
	 * @param {array} ids Array of ids to be transfered
	 * @param {object} status
	 * @param {boolean} status.continuation Information if continuation is active
	 * @param {string} status.mode Runtimemode
	 * @param {boolean} status.truncate Information if truncate point is reached
	 */
	this.publish = function (ids, status) {
		/** delaey publish if clear in progress **/
		if (_internal.clearEvent) {
			_internal.clearPublishTimeout = setTimeout(function delayPublish() {
				that.publish(ids, status);
			}, _internal.clearEventTimer + 25);
			_internal.controllerTimeoutList.push(_internal.clearPublishTimeout);
			return;
		}

		if (this.libsReady && this.slickReady) {
			/* push ids on stack to break publish in case of user actions */
			for (var i in ids)
				_internal.publishStack.push(ids[i]);
			if (_internal.clickEvent) {
				_internal.triggerRunning = false;
				return;
			}

			/* continue publish if no user action happend */
			this.suspendUpdate();
			var data = typeof _internal.publishStack !== "undefined" ? DataController.getModelDataByRange(_internal.publishStack) : DataController.getModelData(_internal.publishStack);
			_internal.publishStack = [];
			for (var i in data) {
				if (typeof data[i] != "undefined") // if not already deleted
					this.dataView.addItem(data[i]);
			}
			this.unSuspendUpdate(status.mode != "continue");

			var itemsLoaded = this.dataView.getItems().length;
			var itemsFiltered = this.dataView.getPagingInfo().totalRows;

			/* update only last round due no render updates */
			if (ids.length == 0) for (var i = 0; i < this.onItemCountChangedCallbacks.length; i++) {
				this.onItemCountChangedCallbacks[i]({
					itemsFiltered: itemsFiltered,
					itemsLoaded: status.continuation && (status.mode == "continue" || status.mode == "triggered") ? "more" : itemsLoaded,
					mode: status.continuation || status.mode == "live" ? status.mode : "DONE",
					truncate: status.truncate
				});
			}

			if (!status.continuation && _internal.openDialogs != null) {
				_internal.openDialogs.close();
			}

			_internal.triggerRunning = false;
		} else {
			if (ENABLE_CONTOLLER_DEBUG)
				console.warn("SlickController Readystate: libsready " + this.libsReady + " slickReady " + this.slickReady);
		}
	};


	/**
	 * Remove data by id
	 * @param {number} id ID of item to be removed out of the model and table
	 * @param {boolean} suspendRendering Suspend the rendering of multiple elements which are removed one after the other
	 * @returns {boolean} Success of removal
	 */
	this.removeData = function (id, suspendRendering) {
		var success = DataController.deleteModelData(id);
		if (success == true) {
			_internal.deleteQueue.push(id);

			if (_internal.deleteTimeout) {
				_internal.deleteTimeout = that.clearControllerTimeout(_internal.deleteTimeout);
			}

			_internal.deleteTimeout = setTimeout(function () {
				_internal.forceResort = true;

				if (typeof that.feature != "undefined" && typeof that.feature['detailRows'] != "undefined" && that.feature["detailRows"] > 0) {
					_internal.expandItems = _getCurrentExpanded();
					_collapseAll();
				}

				for (var key in _internal.deleteQueue) {
					var item = that.dataView.getItemById(_internal.deleteQueue[key]);
					if (typeof item != "undefined")
						that.dataView.deleteItem(_internal.deleteQueue[key]);
					delete _internal.expandItemList[_internal.deleteQueue[key]];
					delete _internal.storeMarker[_internal.deleteQueue[key]];
				}
				_internal.deleteQueue = [];
				_internal.deleteLastCall = config.data.bufferInterval;
				_internal.deleteTimeout = that.clearControllerTimeout(_internal.deleteTimeout);

			}, _internal.deleteLastCall);

			_internal.controllerTimeoutList.push(_internal.deleteTimeout);

			if (_internal.deleteLastCall > 5)
				_internal.deleteLastCall -= 5;
			else
				_internal.deleteLastCall = 5;

		}
		return success;
	};


	/**
	 * Resizing the table
	 * @param {object} dimension object with the dimensions
	 * @param {number} dimension.width width
	 * @param {number} dimension.height height
	 */
	this.resize = function (dimension) {
		try {
			if (typeof dimension.width != "undefined")
				webMI.rootWindow.jQuery('#' + this.containerID).width(dimension.width);
			if (typeof dimension.height != "undefined")
				webMI.rootWindow.jQuery('#' + this.containerID).height(dimension.height);

			if (_internal.resizeTimeout) {
				_internal.resizeTimeout = that.clearControllerTimeout(_internal.resizeTimeout);
			}

			if (!this.grid) {
				_internal.resizeTimeout = setTimeout(function () {
					that.resize(dimension);
				}, 250);
				_internal.controllerTimeoutList.push(_internal.resizeTimeout);
			} else {
				this.grid.resizeCanvas();
			}
		} catch (e) {
		}
	};


	/**
	 * Searches the data model for a specific value in the specified attribute
	 * @param (string) attribute attribute in which to search
	 * @param {string} value value to be sought
	 * @param (boolean) [exact = false] search mode. if true, the value must match exactly, otherwise the occurrence is checked.
	 * @returns {*} items matched
	 */
	this.search = function (attribute, value, exact) {
		return DataController.search(attribute, value, exact);
	}


	/**
	 * Set an external filter to only show certain rows that match the specified filter-criteria.
	 * @param {object} criteria
	 * @param {('all'|'single')} matchMode
	 * @param {string} id
	 */
	this.setFilter = function (criteria, matchMode, id) {
		this.filter.setFilter(criteria, matchMode, id);
	};


	/**
	 * Set an internal filter and apply change to bar for known field types
	 * @param field
	 * @param searchString
	 */
	this.setFilterBar = function (field, searchString) {
		this.filter.setFilterBar(field, searchString);
	};


	/**
	 * Send message to notification if notification is available
	 * @param messageText Text to display
	 */
	this.setMessage = function (messageText) {
		if (typeof that.notification == "object") {
			this.notification.addNotification(messageText);
		}
	}


	/**
	 * Set the number of rows, displayed on a single page.
	 * @param pageSize
	 * @deprecated
	 */
	this.setPageSize = function (pageSize) {
		console.warn("SlickController: The function setPageSize is deprecated!")
		this.paging.setPageSize(pageSize);
	};


	/**
	 * Show a specific column by its (field) name.
	 * @param {string} column
	 */
	this.showColumn = function (column) {
		// todo: show by cell expands
		this.columnsHideList[column] = false;

		var updateVisibleColumns = [];
		for (var col in this.columns) {
			var id = this.columns[col].id;
			if (!this.columnsHideList[id]) {
				updateVisibleColumns.push(this.columns[col]);
			}
		}
		this.grid.setColumns(updateVisibleColumns);
	};


	/**
	 * Show menu items that are assigned to a certain group.
	 * @param {string} group
	 */
	this.showMenuEntriesByGroup = function (group) {
		if (typeof this.feature.tableMenu !== "undefined") {
			this.gridMenu.showMenuEntriesByGroup(group);
		} else {
			console.warn("SlickController: TableMenu is no enabled!");
		}
	};


	/**
	 * Start the data fetching process in the dataController.
	 */
	this.startDataRequest = function () {
		_internal.startEventTimeout = setTimeout(function startDelay() {
			if (that.slickReady && that.libsReady) {
				DataController.start(function startCallback() {
					that.clearData();
				});
			} else {
				that.deferredDataStart = true;
			}
		}, _internal.clearEventTimer + 25);

		_internal.controllerTimeoutList.push(_internal.startEventTimeout);
	};


	/**
	 * Set a callback to get a notification when new rows have been added to the table.
	 * @param {function} callback
	 */
	this.subscribeOnItemCountChange = function (callback) {
		if (typeof callback === "function") {
			this.onItemCountChangedCallbacks.push(callback);
		}
	};


	/**
	 * Suspend rendering (e.g. bevor bulk imports or updates)
	 */
	this.suspendUpdate = function () {
		this.updateLock = true;
		this.dataView.beginUpdate();
	}


	/**
	 * Changes the highlighting status of a table element and performs an optional callback.
	 * @param item
	 * @param callback
	 * @internal This is an unsupported internal feature.
	 * @internal Use without implementation of corresponding limitations can lead to considerable performance problems.
	 */
	this.toggleSelectedItem = function (item, callback) {

		_internal.selectionList[item.id] = !_internal.selectionList[item.id];
		_saveSelection(item.id, _internal.selectionList[item.id]);

		if (_internal.selectionTimeout)
			clearTimeout(_internal.selectionTimeout);

		_internal.selectionTimeout = setTimeout(function () {
				_updateSelectionUI(_internal.selectionList);
			}, 125
		);

		_internal.controllerTimeoutList.push(_internal.selectionTimeout);

		if (typeof callback == "function") {
			callback(selectedItems);
			return true;
		} else {
			return true;
		}

		/* create current visible list */
		function createVisibleList() {
			var convertList = [];
			var list = that.dataView.getFilteredItems();
			for (var l in list)
				convertList[list[l].id] = true;
			return convertList;
		}

		/* change in values */
		function _saveSelection(id, value) {
			var item = DataController.getModelData(id)[0];
			if (item) {
				if (value == true) {
					item.atvise_marker = value;
				} else {
					item.atvise_marker = false;
				}
				that.updateData(id, item, false, false);
			}
		}

		/* update ui */
		function _updateSelectionUI(rowSelectionList) {
			that.rowSelectionUpdateRunning = true;

			var selection = [];
			var visibleList = createVisibleList();
			that.grid.setSelectedRows(selection);
			for (var row in rowSelectionList) {
				if (rowSelectionList[row] == true && visibleList[row])
					selection.push(that.dataView.getRowById(row));
			}
			that.grid.setSelectedRows(selection);
			that.rowSelectionUpdateRunning = false;
		}
	}


	/**
	 * Force data request (e.g. switch from trigger to continue mode)
	 */
	this.triggerForceRequests = function () {
		DataController.switchMode("force");
	}

	/**
	 * Force data request (e.g. switch from trigger to continue mode)
	 */
	this.triggerContinueRequests = function () {
		DataController.switchMode("continue");
	}


	/**
	 * Force data request (e.g. switch from trigger to continue mode)
	 */
	this.triggerLiveRequests = function () {
		DataController.switchMode("live");
	}


	/**
	 * Force pause mode (e.g. switch from trigger to continue mode)
	 */
	this.triggerPauseRequests = function () {
		DataController.switchMode("pause");
	}


	/**
	 * Stop data request (e.g. switch from trigger to continue mode)
	 */
	this.triggerStopRequests = function () {
		DataController.switchMode("triggered");
	}


	/**
	 * Stop data request (e.g. switch from trigger to continue mode)
	 */
	this.triggerTriggeredRequests = function () {
		DataController.switchMode("triggered");
	}


	/**
	 * Stop data request (e.g. switch from trigger to continue mode)
	 */
	this.triggerManuallyRequests = function () {
		DataController.switchMode("manually");
	}


	/**
	 * Reenable rendering (e.g. after bulk imports or updates)
	 * Please note that ie11 can not effectively sort large amounts of data !!!
	 */
	this.unSuspendUpdate = function (forceIE11) {
		var millis = Date.now();
		if (_internal.rendering.update == null || millis - _internal.rendering.update > that.renderInterval) {
			if (!_internal.sortIE11) {
				this.dataView.reSort();
			} else if (forceIE11) {
				if (DataController.getStatus().size > 25000)
					_internal.openDialogs = that.dialogs.sorting.running();
				setTimeout(function () {
					try {
						that.dataView.reSort();
						if (_internal.openDialogs)
							_internal.openDialogs.close();
					} catch (ex) {
					}
				}, 1000); // due to ambivalent behavior of ie11
			}
			this.dataView.endUpdate();
			_internal.rendering.update = millis;
		}
		this.updateLock = false;
	}


	/**
	 * Update the data stored tagged by a specific id.
	 * @param {number} id ID of item to be removed out of the model and table
	 * @param data
	 * @param (boolean) forceConversion Use internal conversation tool for e.g. formatting timestamps (default: false)
	 * @param (boolean) ignoreDetails Ignore detail when render result (default: false), changing is not recommend
	 * @returns {boolean} success of update
	 */
	this.updateData = function (id, data, forceConversion, ignoreDetails) {
		if (typeof forceConversion == "undefined")
			forceConversion = false;
		if (typeof ignoreDetails == "undefined")
			ignoreDetails = false;

		/* restore marker flag on old records or accept new value */
		if (typeof data.atvise_marker == "undefined" && typeof _internal.storeMarker[data.id] != "undefined") {
			data.atvise_marker = _internal.storeMarker[data.id];
		} else {
			_internal.storeMarker[data.id] = data.atvise_marker;
		}

		/* restore expand flag on old records or accept new value */
		if (typeof config.feature.detailRowExclude === "function" && config.feature.detailRowExclude(data.result)) {
			data.atvise_expand = -1;
		}
		if (typeof _internal.expandItemList[data.id] != "undefined") {
			data.atvise_expand = _internal.expandItemList[data.id];
		} else {
			data.atvise_expand = false;
		}

		if (DataController.updateModelData(id, data)) {
			_internal.updateQueue.push({id: id, data: data});

			if (_internal.updateTimeout) {
				_internal.updateTimeout = that.clearControllerTimeout(_internal.updateTimeout);
			}

			_internal.updateTimeout = setTimeout(function () {
				_internal.forceResort = true;

				that.suspendUpdate();

				while ((queueData = _internal.updateQueue.shift()) !== undefined) {
					var id = queueData.id;
					var data = queueData.data;

					// check for marker and details
					data["atvise_marker"] = _internal.storeMarker[data.id];
					data["atvise_details"] = _internal.expandItemList[data.id];

					/* due updates data could already invalid so try & catch */
					if (id.indexOf(".") < 0) {
						try {
							that.dataView.updateItem(id, data);
						} catch (ex) {
							// already invalidated
						}
					}
				}


				_internal.updateQueue = [];
				that.unSuspendUpdate();

				_internal.updateTimeout = that.clearControllerTimeout(_internal.updateTimeout);
			}, (config.data.bufferInterval - 5) > 5 ? (config.data.bufferInterval - 5) : 5);

			_internal.controllerTimeoutList.push(_internal.updateTimeout);

			return true;
		}
		return false;
	};

	/**************************************************************/
	/********************* PRIVATE METHODS ************************/

	/**************************************************************/

	/**
	 * Load all the necessary dependencies for the table.
	 * @param {function} readyCallback
	 * @private
	 */
	function _loadLibaries(readyCallback) {
		webMI.libraryLoader.load(
			["jquery/jquery-ui-1.13.1.min.js",
				"jquery/jquery.ui.touch-punch.min.js",
				"jquery/jquery.event.drag-2.3.0.js",
				"slickgrid/library/slick.core.js",
				"slickgrid/library/slick.grid.js",
				"slickgrid/library/slick.dataview.js",
				"slickgrid/library/slick.groupitemmetadataprovider.js",
				"slickgrid/adaptations/slick.gridmenu.js",
				"slickgrid/adaptations/slick.rowselectionmodel.js",
				"slickgrid/adaptations/slick.autotooltips.js",
				"slickgrid/library/plugins/slick.cellcopymanager.js",
				"slickgrid/library/plugins/slick.cellrangeselector.js",
				"slickgrid/library/plugins/slick.cellrangedecorator.js",
				"slickgrid/controller/helper/SlickFiltering.js",
				"slickgrid/controller/helper/SlickPaging.js",
				"slickgrid/controller/helper/SlickExport.js"
			],
			["jquery/jquery-ui-1.11.3.custom.css",
				"slickgrid/library/slick.grid.css",
				"slickgrid/library/controls/slick.pager.css",
				"slickgrid/library/controls/slick.gridmenu.css",
				"slickgrid/library/plugins/slick.rowdetailview.css",
				"slickgrid/controller/SlickController.css",
				"slickgrid/config/custom.css"
			],
			function () {
				readyCallback();
			}
		);
	}


	/**
	 * Configure and run the SlickTable library.
	 * @param {object} config
	 * @private
	 */
	function _configureSlickTable() {

		// --------------------------------------------
		// Prevent losing click events at fast intervals
		// --------------------------------------------
		var onClickElements = [
			"slick-cell",
			"slick-cell-item",
			"atvise-item",
			/* AT-D-14860 add class for icons due firefox bubble fail */
			/* AT-D-15043 add further class for header icon */
			/* Note: Classes that are used both in the header and in the content may interact in unwanted effects, */
			/* so you should always use your own or additional classes in header! */
			"atvise_header_marker",
			"atvise_header_marker_checked",
			"far fa-caret-square-down",
			"fas fa-caret-square-up"
		];

		var container = document.getElementById(this.containerID);
		if (!container)
			return;

		container.addEventListener('mousedown', function (e) {
			_trackClickEvent();

			function isValidClickClass(target) {
				var valid = false;
				var onClickElements = [
					"slick-cell",
					"slick-cell-item",
					"atvise-item",
					/* AT-D-14860 add class for icons due firefox bubble fail */
					/* AT-D-15043 add further class for header icon */
					/* Note: Classes that are used both in the header and in the content may interact in unwanted effects, */
					/* so you should always use your own or additional classes in header! */
					"atvise_header_marker",
					"atvise_header_marker_checked",
					"far fa-caret-square-down",
					"fas fa-caret-square-up"
				];
				for (var key in onClickElements) {
					if (target.indexOf(onClickElements[key]) > -1) {
						valid = true;
						break;
					}
				}
				return valid;
			}

			if (typeof e.target.className != "object" && isValidClickClass(e.target.className)) {
				e.target.click();
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		}, false);

		// --------------------------------------------
		// set vertical scrolling due menu button
		// --------------------------------------------
		this.options["alwaysShowVerticalScroll"] = true;

		// --------------------------------------------
		// define registration of plugins
		// --------------------------------------------
		var register_grouping_plugin = false;


		// --------------------------------------------
		// multi selection add to config
		// --------------------------------------------
		if (typeof this.feature['multiselect'] != "undefined" && this.feature["multiselect"] == true) {

			var fallbackOrName = "X"
			if (typeof this.icons != "undefined") {
				fallbackOrName = '<i class="fas fa-check-square"></i>';
			}

			var tooltipOrName = "Marks";
			if (typeof config.translation.tooltip_marks != "undefined")
				tooltipOrName = config.translation.tooltip_marks;

			var atvise_marker = {
				alignment: "center",
				id: "atvise_marker",
				name: fallbackOrName,
				field: "atvise_marker",
				sortable: false,
				filter: true,
				visible: true,
				formatter: new webMI.rootWindow.SlickFormatter(language).AtviseCellItem,
				type: {0: "atvise_marker"},
				toolTip: tooltipOrName,
				minWidth: 30,
				maxWidth: 30,
				alignment: "center",
			};
			this.columns.unshift(atvise_marker);
		}


		// --------------------------------------------
		// setup dataview
		// --------------------------------------------
		this.dataView = new webMI.rootWindow.Slick.Data.DataView({inlineFilters: true});

		/** !unsupported! grouping feature **/
		if (typeof that.feature["groupBy"] != "undefined" && that.feature["groupBy"] != false) {
			var groupItemMetadataProvider = new webMI.rootWindow.Slick.Data.GroupItemMetadataProvider();
			this.dataView.setGrouping([{
				getter: that.feature["groupBy"],
				formatter: function (g) {
					return that.feature["groupBy"] + g.value + "  <span>(" + g.count + " items)</span>";
				},
				lazyTotalsCalculation: true
			}]);
			register_grouping_plugin = true;
		}

		var onRowCountChangedTimeout;
		this.dataView.onRowCountChanged.subscribe(function (e, args) {
			if (onRowCountChangedTimeout) {
				onRowCountChangedTimeout = that.clearControllerTimeout(onRowCountChangedTimeout);
			}

			onRowCountChangedTimeout = setTimeout(function () {
				if (!that.rowSelectionRunning)
					that.dataView.syncGridSelection(that.grid, true);
				that.grid.updateRowCount();
				onRowCountChangedTimeout = that.clearControllerTimeout(onRowCountChangedTimeout);
			}, 250);

			_internal.controllerTimeoutList.push(onRowCountChangedTimeout);
			that.renderLoops++;
		});

		var onRowChangedTimeout;
		this.dataView.onRowsChanged.subscribe(function (e, args) {
			if (onRowChangedTimeout) {
				onRowChangedTimeout = that.clearControllerTimeout(onRowChangedTimeout);
			}

			onRowChangedTimeout = setTimeout(function () {
				if (!that.rowSelectionRunning)
					that.dataView.syncGridSelection(that.grid, true);
				that.grid.updateRowCount();
				onRowChangedTimeout = that.clearControllerTimeout(onRowChangedTimeout);
			}, 250);

			_internal.controllerTimeoutList.push(onRowChangedTimeout);
			that.renderLoops++;
		});

		if (typeof that.feature["rowFormatter"] == "function") {
			this.dataView.getItemMetadata = _getItemMetadataProvider(this.dataView.getItemMetadata);
		}


		// --------------------------------------------
		// enable detail row
		// --------------------------------------------
		if (typeof this.feature['detailRows'] != "undefined" && this.feature["detailRows"] > 0) {
			if (ENABLE_CONTOLLER_DEBUG)
				console.log("SlickController: detailrow on");

			var tooltipOrName = "Details";
			if (typeof config.translation.tooltip_details != "undefined")
				tooltipOrName = config.translation.tooltip_details;

			var detailColumnConfig = {
				cssClass: "detailView-toggle",
				field: "atvise_expand",
				formatter: detailSelectionFormatter,
				id: "atvise_expand",
				maxWidth: 30,
				minWidth: 30,
				name: this.feature["detailRowHeader"] ? this.feature["detailRowHeader"] : "",
				resizable: false,
				sortable: false,
				toolTip: tooltipOrName,
				width: 30,
			}
			this.columns.unshift(detailColumnConfig);

			this.grid = new webMI.rootWindow.Slick.Grid("#" + this.containerID, this.dataView, this.columns, this.options);
			this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));

			/* check detailrow config */
			var availableRows = this.grid.getViewport().bottom - 3;
			if (this.feature["detailRows"] > availableRows) {
				console.warn("SlickController: The configuration of the available detail rows had to be corrected!");
				this.feature["detailRows"] = availableRows;
			}

			/* click on detail_selector */
			this.grid.onClick.subscribe(function (e, args) {
				_trackClickEvent()
				var item = that.dataView.getItem(args.row);
				var isDetailClick = that.grid.getColumns()[args.cell].field == "atvise_expand" && item.atvise_expand != -1;
				if (isDetailClick) {
					if (typeof item.atvise_expand && item.atvise_expand == true) {
						_closeDetails(item);
					} else {
						_openDetails(item);
					}
					that.renderLoops++;
				}
			});

			function detailSelectionFormatter(row, cell, value, columnDef, dataContext) {

				var item = that.dataView.getItem(row);

				if (item.id.indexOf(".") < 0) {
					var rows = config.feature.detailRows;
					var height = config.style.row_height;
					var content = config.feature.detailRowTemplate(dataContext);

					if (typeof item.atvise_expand && item.atvise_expand == true) {
						var html = [];
						var topHeight = height;
						var rowHeight = rows * Math.floor(height);
						html.push("<div class='detailView-toggle' style='width: 90%;text-align: center;'><i class='fas fa-caret-square-up'></i></div></div>");
						html.push("<div id='cellDetailView_" + dataContext.id + "' class='dynamic-cell-detail' style='top: " + topHeight + "px; height: " + rowHeight + "px; z-index:100;'>");
						html.push("<div id='detailViewContainer_" + dataContext.id + "' class='detail-container'>");
						html.push("<div id='innerDetailView_" + dataContext.id + "'>");
						html.push(content);
						html.push("</div>");
						html.push("</div>");
						return html.join("");
					} else if (typeof item.atvise_expand && item.atvise_expand == false) {
						return "<div class='detailView-toggle' style='width: 90%;text-align: center;'><i class='far fa-caret-square-down'></i></div>";
					} else {
						return "<div></div>";
					}
				}
				return null;
			}

		} else {
			if (ENABLE_CONTOLLER_DEBUG)
				console.log("SlickController: detailrow off");
			this.grid = new webMI.rootWindow.Slick.Grid("#" + this.containerID, this.dataView, this.columns, this.options);
			this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
		}


		// --------------------------------------------
		// multi selection - add click handling
		// --------------------------------------------
		if (typeof this.feature['multiselect'] != "undefined" && this.feature["multiselect"] == true) {
			if (ENABLE_CONTOLLER_DEBUG)
				console.log("SlickController: multiselect on");

			var enableCellClick = typeof that.feature['multicellselect'] != "undefined" && that.feature["multicellselect"] == true;

			//var selectionList = [];
			/* click on header */
			this.grid.onHeaderClick.subscribe(function (e, args) {
				_trackClickEvent()

				if (args.column.id == "atvise_expand" && that.feature.detailRowCallback) {
					that.feature.detailRowCallback(e, args);
				}

				if (args.column.field == "atvise_marker") {
					that.rowSelectionRunning = true;

					/* collapse rows before update */
					_collapseAll();

					var items = that.dataView.getFilteredItems();

					/* eval mode select all or deselect */
					var selectMode = true;
					for (var i in items) {
						var item = items[i];
						if (typeof _internal.selectionList[item.id] != "undefined" && _internal.selectionList[item.id]) {
							selectMode = false;
							break;
						}
					}

					that.suspendUpdate();
					for (var i in items) {
						var item = items[i];
						_internal.selectionList[item.id] = selectMode;
					}
					_saveSelectionList(_internal.selectionList);

					that.unSuspendUpdate();
					_updateSelectionUI(_internal.selectionList);

					/* restore collapsed items */
					while ((item = _internal.expandRestoreList.shift()) != undefined)
						_openDetails(item);
					that.rowSelectionRunning = false;
				}

				that.renderLoops++;
			});
			/* click on marker */
			var lastClickID = null;
			this.grid.onClick.subscribe(function (e, args) {
				_trackClickEvent();
				var item = that.dataView.getItem(args.row);
				var isMarkerClick = that.grid.getColumns()[args.cell].field == "atvise_marker";
				var isDetailClick = that.grid.getColumns()[args.cell].field == "atvise_expand";
				var isButton = that.grid.getColumns()[args.cell].type == "button";

				/* isButton then no further action required */
				if (isButton)
					return;

				/* prevent double clicks */
				var clickID = item.id;
				if (that.rowSelectionRunning || lastClickID == clickID)
					return;

				lastClickID = clickID;
				/* reset last click id */
				setTimeout(function releaseClick() {
					try {
						lastClickID = null;
					} catch (ex) {
					}
				}, 500);

				if (isMarkerClick || (enableCellClick && !isDetailClick && !isButton)) {
					/* ignore clicks with shift */
					if (shiftState())
						return;

					if (typeof _internal.selectionList[item.id] == "undefined") {
						_internal.selectionList[item.id] = false;
					}

					var reopenDetails = false;
					if (_internal.expandItemList[item.id]) {
						reopenDetails = true;
						_closeDetails(item);
					}

					_internal.selectionList[item.id] = !_internal.selectionList[item.id];
					_saveSelection(item.id, _internal.selectionList[item.id]);
					_updateSelectionUI(_internal.selectionList);

					if (reopenDetails) {
						_openDetails(item);
					}
				}

				that.renderLoops++;
			});
			/* range selections */
			var onSelectedRowsChangedTimeout;
			this.grid.onSelectedRowsChanged.subscribe(function (e, args) {
				_trackClickEvent()
				if (!that.rowSelectionUpdateRunning) {
					if (!that.rowSelectionRunning && !that.rowSelectionIgnoreFilter && args.rows.length) {
						that.rowSelectionRunning = true;
						that.suspendUpdate();

						/* clear old selection */
						var visibleList = createVisibleList();
						for (var sid in _internal.selectionList) {
							if (visibleList[sid]) {
								_internal.selectionList[sid] = false;
							}
							_saveSelection(sid, _internal.selectionList[sid]);
						}

						/* make new selection */
						for (var a in args.rows) {
							var item = that.dataView.getItem(args.rows[a]);
							if (typeof _internal.selectionList[item.id] == "undefined") {
								_internal.selectionList[item.id] = false;
							}
							_internal.selectionList[item.id] = true;
							_saveSelection(item.id, _internal.selectionList[item.id]);
						}
						_updateSelectionUI(_internal.selectionList);
						that.rowSelectionRunning = false;
						that.unSuspendUpdate();
					}

					if (that.rowSelectionIgnoreFilter && !that.rowSelectionRunning) {
						that.rowSelectionRunning = true;
						_updateSelectionUI(_internal.selectionList);
						that.rowSelectionRunning = false;
						rowSelectionIgnoreFilterTimeout = setTimeout(function () {
							that.rowSelectionIgnoreFilter = false;
						}, 100);
						_internal.controllerTimeoutList.push(rowSelectionIgnoreFilterTimeout);
					}
				}

				that.renderLoops++;
			});

			/* create current visible list */
			function createVisibleList() {
				var convertList = [];
				var list = that.dataView.getFilteredItems();
				for (var l in list)
					convertList[list[l].id] = true;
				return convertList;
			}

			/* change in values */
			function _saveSelection(id, value) {
				var item = DataController.getModelData(id)[0];
				if (item) {
					if (value == true) {
						item.atvise_marker = value;
					} else {
						item.atvise_marker = false;
					}
					that.updateData(id, item, false, false);
				}
			}

			function _saveSelectionList(list) {
				var data = DataController.getModelData();
				for (var key in data) {
					var item = data[key];
					if (list[item.id]) {
						item.atvise_marker = list[item.id];
					} else {
						item.atvise_marker = false;
					}
				}

				for (var key in data) {
					var item = data[key];
					that.updateData(item.id, item, false, false);
				}
			}

			/* update ui */
			function _updateSelectionUI(rowSelectionList) {
				that.rowSelectionUpdateRunning = true;

				var selection = [];
				var visibleList = createVisibleList();
				that.grid.setSelectedRows(selection);
				for (var row in rowSelectionList) {
					if (rowSelectionList[row] == true && visibleList[row])
						selection.push(that.dataView.getRowById(row));
				}
				that.grid.setSelectedRows(selection);
				that.rowSelectionUpdateRunning = false;
			}
		}


		// --------------------------------------------
		// enable paging
		// --------------------------------------------
		if (typeof this.feature["paging"] != "undefined" && this.feature["paging"] != false) {
			this.paging = new SlickPaging(this, this.dataView, this.grid, {pageSize: this.feature.pageSize});
			this.paging.init();
		}


		// --------------------------------------------
		// enable sorting (always on)
		// --------------------------------------------
		var defaultSortInConfig = false;
		var indexColumn = null;
		for (var c in this.columns) {
			if (this.columns[c].id == "id")
				indexColumn = this.columns[c];
			if (typeof this.columns[c].sortByDefaultAsc != "undefined") {
				var item = this.columns[c];
				var asc = this.columns[c].sortByDefaultAsc;
				if (item.sortByDefault) {
					defaultSortInConfig = true;
					this.grid.setSortColumn(item.id, asc);
					var args = [];
					args.grid = this.grid;
					args.multiColumnSort = false;
					args.sortAsc = asc;
					args.sortCol = item;
					_sortData.call(that, null, args);
				}
			}
		}

		if (!defaultSortInConfig && indexColumn != null) {
			var asc = true;
			this.grid.setSortColumn(indexColumn.id, asc);
			var args = [];
			args.grid = this.grid;
			args.multiColumnSort = false;
			args.sortAsc = asc;
			args.sortCol = indexColumn;
			_sortData.call(that, null, args);
		}

		this.grid.onSort.subscribe(function (e, args) {
			var status = DataController.getStatus();
			if (status.mode == "triggered" && status.continuation) {
				_internal.openDialogs = that.dialogs.triggered.search();
			}

			if (typeof that.feature != "undefined" && typeof that.feature['detailRows'] != "undefined" && that.feature["detailRows"] > 0) {
				_internal.expandItems = _getCurrentExpanded();
			}
			if (!that.rowSelectionRunning)
				that.dataView.syncGridSelection(that.grid, true);

			if (!_internal.sortIE11) {
				_collapseAll();
				_sortData.call(that, e, args);
				while ((item = _internal.expandRestoreList.shift()) != undefined)
					_openDetails(item);
			} else {
				_internal.isOpenDialog = false;
				if (status.size > 25000 && status.mode != "Live") {
					_internal.openDialogs = that.dialogs.sorting.running();
					_internal.isOpenDialog = true;
				}

				// due to ambivalent behavior of ie11
				setTimeout(function () {
					try {
						_collapseAll();
						_sortData.call(that, e, args);
						_internal.isOpenDialog = false;
					} catch (ex) {
					}
				}, 2000);

				function closeDialog() {
					if (!_internal.isOpenDialog) {
						_internal.openDialogs.close();
					}
					if (!_internal.openDialogs && _internal.intervalSortDialog) {
						clearInterval(_internal.intervalSortDialog);
						_internal.intervalSortDialog = null;
					}
				}

				if (!_internal.intervalSortDialog)
					_internal.intervalSortDialog = setInterval(closeDialog, 1000);
			}

			that.renderLoops++;
		});


		// --------------------------------------------
		// enable onClickCallback
		// --------------------------------------------
		if (this.feature["onClickCallback"] !== undefined && typeof this.feature["onClickCallback"] === "function") {
			this.grid.onClick.subscribe(function (e, clickInfo) {
				_trackClickEvent();
				var item = that.grid.getDataItem(clickInfo.row);
				var column = that.grid.getColumns()[clickInfo.cell];
				that.feature.onClickCallback(e, {item: item, rowIndex: clickInfo.row, column: column});
				that.renderLoops++;
			});
		}

		if (this.feature["onHeaderClickCallback"] !== undefined && typeof this.feature["onHeaderClickCallback"] === "function") {
			this.grid.onHeaderClick.subscribe(function (e, clickInfo) {
				_trackClickEvent();
				that.feature.onHeaderClickCallback(e, {column: clickInfo.column});
				that.renderLoops++;
			});
		}


		// --------------------------------------------
		// instantiate filtering
		// --------------------------------------------
		this.filter = new SlickFiltering(this.dataView, this.grid,
			{
				filterRegExp: this.feature.filterRegExp,
				filterCaseSensitive: this.feature.filterCaseSensitive,
				filterLength: this.feature.filterLength,
				filterDelay: this.feature.filterDelay,
				filterStar: this.feature.filterStar,
				filterConversion: this.feature.filterConversion,
				showFilterBar: this.options["showHeaderRow"]
			},
			function filterCallbackFunction() {
				var status = DataController.getStatus();
				if (status.mode == "triggered" && status.continuation) {
					_internal.openDialogs = that.dialogs.triggered.filter();
				} else if (status.mode == "continue" && status.continuation) {
					_internal.openDialogs = that.dialogs.continuation.filter();
				} else {
					_collapseAll();
					return false;
				}
				return true;
			}
		);
		this.filter.init();

		this.dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
			var status = DataController.getStatus();
			that.rowSelectionIgnoreFilter = true;

			var detailCorrection = that.dataView.getItems().length - status.size;
			var itemsFiltered = that.dataView.getPagingInfo().totalRows - detailCorrection;
			var itemsIsMore = status.continuation && (status.mode == "continue" || status.mode == "triggered");
			var itemsLoaded = itemsIsMore ? "more" : that.dataView.getItems().length - detailCorrection
			if (typeof that.changeItemCount == "function")
				that.changeItemCount({
					itemsFiltered: itemsFiltered,
					itemsLoaded: itemsLoaded,
					mode: status.continuation || status.mode == "live" ? status.mode : "DONE",
					truncate: status.truncate
				});
			if (typeof that.feature["paging"] != "undefined" && that.feature["paging"] != false && typeof that.updatePagingInformation == "function")
				that.updatePagingInformation(that.paging.updateInformation(that.grid.getViewport()))
		});

		// --------------------------------------------
		// instantiate Export
		// --------------------------------------------
		this.Export = new SlickExport(this.dataView, this.grid, this.columns);
		this.ExportOptions = {
			timestamp: false,
			milliseconds: true
		}

		for (var fte in this.feature.tableMenu.exportMenuEntries) {
			var cmdName = this.feature.tableMenu.exportMenuEntries[fte].command;
			if (cmdName && cmdName == "export-option-timestamp")
				this.feature.tableMenu.exportMenuEntries[fte].checked = this.ExportOptions.timestamp;
			if (cmdName && cmdName == "export-option-milliseconds")
				this.feature.tableMenu.exportMenuEntries[fte].checked = this.ExportOptions.milliseconds;
		}


		// --------------------------------------------
		// hide columns default not visible
		// --------------------------------------------
		for (var col in this.columns) {
			if (typeof this.columns[col].visible != "undefined" && this.columns[col].visible == false)
				this.hideColumn(this.columns[col].id, false);
		}
		this.hideColumn(null, true);


		// --------------------------------------------
		// grid menu - add the control ::: todo > cleanup an csv export
		// --------------------------------------------
		if (this.feature.tableMenu && this.feature.tableMenu.showMenu) {

			this.options["gridMenu"] = {
				exportTitle: this.feature.tableMenu.showMenuExportTitle,
				commandTitle: this.feature.tableMenu.showMenuCommandTitle,
				columnTitle: this.feature.tableMenu.showMenuPickerTitle,
				customTitle: this.feature.tableMenu.showMenuCustomTitle,
				hideForceFitButton: true,
				hideSyncResizeButton: true,
				iconCssClass: "slick-menu-button",
				iconSVG: config.icons.burger,
				showMenuPicker: this.feature.tableMenu.showMenuPicker,
				leaveOpen: false,
				exportItems: this.feature.tableMenu.exportMenuEntries,
				commandItems: this.feature.tableMenu.commandMenuEntries,
				customItems: this.feature.tableMenu.customMenuEntries,
				height: this.feature.tableMenu.menuHeight,
				width: this.feature.tableMenu.menuWidth
			};
			this.gridMenu = new webMI.rootWindow.Slick.Controls.GridMenu(this.columns, this.grid, this.options);

			// subscribe to Grid Menu event(s)
			this.gridMenu.onCommand.subscribe(function (e, args) {
				if (args.command === "toggle-filterbar") {

					that.filter.toggleFilterBarVisibility();
					/* recalculate page size */
					if (typeof that.feature["paging"] != "undefined" && that.feature["paging"] != false) {
						setTimeout(function () {
							that.paging.revalSize();
						}, 150);
					}

				} else if (args.command === "clear-filterbar") {

					webMI.rootWindow.jQuery('.filterbarInput').val('');
					webMI.rootWindow.jQuery('.pagingInputElement').val('');
					that.filter.resetInternalFilterParams();

					that.dataView.setFilterArgs({
						filterSets: null,
						filterRegExp: that.feature.filterRegExp,
						filterCaseSensitive: that.feature.filterCaseSensitive,
						filterLength: that.feature.filterLength,
						filterDelay: that.feature.filterDelay,
					});
					that.dataView.refresh();
				} else if (args.command === "export-csv") {

					that.Export.exportAsCSV({
						timestamp: that.ExportOptions.timestamp,
						milliseconds: that.ExportOptions.milliseconds
					});

				} else if (args.command === "export-csv-hidden") {

					that.Export.exportAsCSV({
						includeHidden: true,
						timestamp: that.ExportOptions.timestamp,
						milliseconds: that.ExportOptions.milliseconds
					});

				} else if (args.command === "export-csv-marked") {

					that.Export.exportAsCSV({
						onlyMarked: true,
						includeHidden: false,
						timestamp: that.ExportOptions.timestamp,
						milliseconds: that.ExportOptions.milliseconds
					});

				} else if (args.command === "export-csv-marked-hidden") {

					that.Export.exportAsCSV({
						onlyMarked: true,
						includeHidden: true,
						timestamp: that.ExportOptions.timestamp,
						milliseconds: that.ExportOptions.milliseconds
					});

				} else if (args.command === "export-option-timestamp") {

					setTimeout(function () {
						var uiid = args.item.UI_checkbox_ID;
						if (uiid) {
							if ($("#" + uiid).is(':checked')) {
								$("#" + uiid).prop('checked', false);
								that.ExportOptions.timestamp = false;
							} else {
								$("#" + uiid).prop('checked', true);
								that.ExportOptions.timestamp = true;
							}
						}
					}, 0);

				} else if (args.command === "export-option-milliseconds") {

					setTimeout(function () {
						var uiid = args.item.UI_checkbox_ID;
						if (uiid) {
							if ($("#" + uiid).is(':checked')) {
								$("#" + uiid).prop('checked', false);
								that.ExportOptions.milliseconds = false;
							} else {
								$("#" + uiid).prop('checked', true);
								that.ExportOptions.milliseconds = true;
							}
						}
					}, 0);

				} else {

					for (var i = 0; i < that.feature.tableMenu.customMenuEntries.length; i++) {
						var customMenuEntry = that.feature.tableMenu.customMenuEntries[i];
						if (customMenuEntry.command === args.command && typeof customMenuEntry.clickHandler === "function") {
							customMenuEntry.clickHandler(e);
						}
					}

				}
			});

			// subscribe to event when column visibility is changed via the menu
			this.gridMenu.onColumnsChanged.subscribe(function (e, args) {
				var cols = that.grid.getColumns();
				for (var c in cols) {
					for (var o in _internal.originColumnConfig) {
						if (cols[c].id == _internal.originColumnConfig[o].id) {
							cols[c].width = _internal.originColumnConfig[o].width;
							break;
						}
					}
				}
				that.grid.setColumns(cols);
				that.grid.autosizeColumns();
			});
			// subscribe to event when menu is closing
			this.gridMenu.onMenuClose.subscribe(function (e, args) {
				if (ENABLE_CONTOLLER_DEBUG)
					console.log('SlickController: Menu closing');
			});

		}

		// --------------------------------------------
		// finally register some plugins
		// --------------------------------------------
		if (register_grouping_plugin) {
			this.grid.registerPlugin(groupItemMetadataProvider);
		}
		this.grid.registerPlugin(new webMI.rootWindow.Slick.AutoTooltips({enableForHeaderCells: true}));


		// --------------------------------------------
		// add scrolling trigger
		// --------------------------------------------
		var scrollerRenderTimeout;
		this.grid.onScroll.subscribe(function (e, args) {
				if (typeof that.feature["paging"] != "undefined" && that.feature["paging"] != false && typeof that.updatePagingInformation == "function") {
					that.updatePagingInformation(that.paging.updateInformation(that.grid.getViewport()));
				}

				var item = [];
				item.bottom = that.grid.getViewport().bottom;
				item.total = that.grid.getDataLength();
				item.switch = Math.floor(item.total * 10 / 100);
				item.left = item.total - item.bottom;
				if (item.left < item.switch && item.total > 0 && !_internal.triggerRunning) {
					_internal.triggerRunning = true;
					DataController.trigger();
				}

				if (scrollerRenderTimeout) {
					scrollerRenderTimeout = that.clearControllerTimeout(scrollerRenderTimeout);
				}

				scrollerRenderTimeout = setTimeout(function () {
					scrollerRenderTimeout = that.clearControllerTimeout(scrollerRenderTimeout);
				}, 40);

				_internal.controllerTimeoutList.push(scrollerRenderTimeout);
			}
		);


		// --------------------------------------------
		// add column reorder
		// --------------------------------------------
		if (this.options["enableColumnReorder"]) {
			throw new Error('slick grid internal column reorder has to be set to false');
		} else if (this.feature["columnReorder"]) {
			if (ENABLE_CONTOLLER_DEBUG)
				console.log("SlickController: column reorder by controller on");
			var fullID = document.getElementById(this.containerID).getAttribute("id");
			webMI.rootWindow.jQuery('#' + fullID + ' .slick-header-columns').sortable({
				containment: "parent",
				distance: 3,
				axis: "x",
				cursor: "default",
				tolerance: webMI.getConfig("frame.scaletype") == "zoom" ? "intersect" : "pointer",
				helper: "clone",
				placeholder: "slick-sortable-placeholder ui-state-default slick-header-column",
				start: function (e, ui) {
					ui.placeholder.width(ui.helper.outerWidth()); //  - headerColumnWidthDiff);
					$(ui.helper).addClass("slick-header-column-active");
					$(ui.helper).width($(ui.helper).width() * 0.75);
				},
				beforeStop: function (e, ui) {
					$(ui.helper).removeClass("slick-header-column-active");
				},
				stop: function (e) {
					if (!that.grid.getEditorLock().commitCurrentEdit()) {
						$(this).sortable("cancel");
						return;
					}
					var reorderedIds = webMI.rootWindow.jQuery('#' + fullID + ' .slick-header-columns').sortable("toArray");
					var reorderedColumns = [];
					var columns = that.grid.getColumns();
					for (var i = 0; i < reorderedIds.length; i++) {
						reorderedColumns.push(columns[that.grid.getColumnIndex(reorderedIds[i].replace(that.grid.getUID(), ""))]);
					}
					that.grid.setColumns(reorderedColumns);

					// trigger(self.onColumnsReordered, {grid: self});
					e.stopPropagation();
					// that.grid.setupColumnResize();
				},
				sort: function (e, ui) {
					var scaleType = webMI.getConfig("frame.scaletype");
					if (scaleType != "native" && scaleType != "zoom") {
						var pageX = e.pageX;
						var pageY = e.pageY;
						var eventCoords = webMI.gfx.scaleEventCoordinates(that.containerID, pageX, pageY);
						var offsetLeft = webMI.gfx.getAbsoluteOffset("left", true, that.containerID);
						var newLeft = 1000 + eventCoords.x - offsetLeft;
						ui.helper.css({
							left: newLeft
						});
					}
				}
			});
		} else {
			if (ENABLE_CONTOLLER_DEBUG)
				console.log("SlickController: column reorder by controller off");
		}


		// --------------------------------------------
		// config option force touchmove on slow displays
		// --------------------------------------------
		if (typeof that.feature["forceTouchmove"] != "undefined" &&
			typeof that.feature["forceTouchmove"].active != "undefined" &&
			that.feature["forceTouchmove"].active != false) {

			var touchStartY = 0;
			var touchStopY = 0;
			var touchMoveAction = false;
			var touchMoveTimeout = null;
			webMI.addEvent(this.containerID, "touchstart", function (e) {
				touchStartY = e.changedTouches[0].clientY;
			});

			webMI.addEvent(this.containerID, "touchend", function (e) {
				touchStopY = e.changedTouches[0].clientY;
				if (touchMoveAction) {
					if (touchMoveTimeout) {
						touchMoveTimeout = that.clearControllerTimeout(touchMoveTimeout);
					}

					touchMoveTimeout = setTimeout(function () {
						var touchDirectionY = true;
						if (touchStartY > touchStopY)
							touchDirectionY = false;

						if (touchDirectionY) {
							that.gotoPreviousPage();
						} else {
							that.gotoNextPage();
						}
						touchMoveTimeout = that.clearControllerTimeout(touchMoveTimeout);
					}, that.feature["forceTouchmove"].delay);

					_internal.controllerTimeoutList.push(touchMoveTimeout);
				}
				touchMoveAction = false;
			});

			webMI.addEvent(this.containerID, "touchmove", function (e) {
				var touchPosY = e.changedTouches[0].clientY;
				if (Math.abs(touchStartY - touchPosY) > that.feature["forceTouchmove"].distance)
					touchMoveAction = true;
			});
		}


		// --------------------------------------------
		// start auto post rendering
		// --------------------------------------------
		if (this.renderInterval > 0) {
			this.renderLoops = 0;
			this.maxLoops = 500 / this.renderInterval;

			this.renderingInterval = setInterval(function () {
				/* do not render more than maxLoops */
				if(that.renderLoops > that.maxLoops)
					that.renderLoops = that.maxLoops;

				if (typeof DataController.getStatus == "function") {
					if (that.renderLoops > 0) {
						that.unSuspendUpdate();
						that.forceRendering (that.grid);
						that.renderLoops--;
					} else {
					}
				} else {
				}
			}, this.renderInterval);
		}


		// --------------------------------------------
		// slick is ready
		// --------------------------------------------
		this.slickReady = true;
	}


	/**
	 * closing a detail item
	 * @param item
	 * @private
	 */
	function _closeDetails(item, suspend) {
		if (typeof suspend == "undefined")
			suspend = true;
		_internal.expandItemList[item.id] = false;
		item.atvise_expand = false;

		if (suspend) {
			that.dataView.beginUpdate();
		}
		that.dataView.updateItem(item.id, item);
		var addItem = {};
		for (var i = 0; i < that.feature["detailRows"]; i++) {
			addItem = JSON.parse(JSON.stringify(item));
			addItem.id = item.id + "." + (i + 1);
			try {
				that.dataView.deleteItem(addItem.id);
			} catch (ex) {
				// item already gone
			}
		}
		if (suspend) {
			that.dataView.reSort();
			that.dataView.endUpdate();
			try {
				that.grid.invalidate();
				that.grid.render();
			} catch (e) {
			}
			var millis = Date.now();
			_internal.rendering.render = millis;
			_internal.rendering.update = millis;
		}
	}


	/**
	 * closing all detail items
	 * @returns {Array}
	 * @private
	 */
	function _collapseAll() {
		_internal.expandRestoreList = [];
		for (var key in _internal.expandItemList) {
			if (_internal.expandItemList[key]) {
				var item = that.dataView.getItemById(key);
				_internal.expandRestoreList.push(item);
				_closeDetails(item);
			}
		}
		return true;
	}


	/**
	 * opening a detail item
	 * @param item
	 * @private
	 */
	function _openDetails(item, suspend) {
		if (_internal.expandItemList[item.id])
			return

		if (typeof suspend == "undefined")
			suspend = true;

		_internal.expandItemList[item.id] = true;
		item.atvise_expand = true;

		if (suspend) {
			that.dataView.beginUpdate();
		}

		var addItem = {};
		for (var i = 0; i < that.feature["detailRows"]; i++) {
			addItem = JSON.parse(JSON.stringify(item));
			addItem.id = item.id + "." + (i + 1);
			that.dataView.addItem(addItem);
		}
		that.dataView.updateItem(item.id, item);

		if (suspend) {
			that.dataView.reSort();
			that.dataView.endUpdate();
			try {
				that.grid.invalidate();
				that.grid.render();
			} catch (e) {
			}
			var millis = Date.now();
			_internal.rendering.render = millis;
			_internal.rendering.update = millis;
		}
	}


	/**
	 * return list of detail items
	 * @returns {Array}
	 * @private
	 */
	function _getCurrentExpanded() {
		var ids = [];
		for (var key in _internal.expandItemList)
			if (_internal.expandItemList[key])
				ids.push(key);
		return ids;
	}


	/**
	 * Clear the internal memory.
	 * @private
	 */
	function _setVars() {
		this.libsTimeout = 500;
		this.libsReady = false;
		this.slickReady = false;
		this.containerID = false;
		this.columns = false;
		this.feature = false;
		this.columnsHideList = [];
		this.rowSelectedAll = false;
		this.rowSelectionRunning = false;
		this.rowSelectionUpdateRunning = false;
		this.rowSelectionIgnoreFilter = false;
		this.grid = null;
		this.open_detail_view = false;
		this.dataView = null;
		this.checkboxSelector = null;
		this.columnpicker = null;
		this.deferredDataStart = false;
		this.onItemCountChangedCallbacks = [];
		this.renderInterval = 250;
	}


	/**
	 * additional css class
	 * @param baseFunction
	 * @returns {Function}
	 * @private
	 */
	function _getItemMetadataProvider(baseFunction) {
		return function (row) {
			var item = this.getItem(row);
			var ret = (baseFunction(row) || {});

			if (item) {
				var additionalCSSClasses = that.feature["rowFormatter"](item, row);
				ret.cssClasses = '';
				for (var i = 0; i < additionalCSSClasses.length; i++) {
					ret.cssClasses += ' ';
					ret.cssClasses += additionalCSSClasses[i];
				}
			}

			return ret;
		}
	}


	/**
	 * Internal conversation of datetime
	 * @param format
	 * @param value
	 * @returns {*}
	 * @private
	 */
	function _makeConversions(format, value) {
		if (format[0] == "datetime") {
			if (value) {
				if (typeof value == "string" && value.indexOf("-") > -1)		//ignore already formatted values
					return value;

				var date = new Date(parseInt(value, 10));
				value = webMI.sprintf("%d-%02d-%02d %02d:%02d:%02d.%03d", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
			} else {
				value = "";
			}
		}
		return '<div class="slick-cell-item">' + value + '</div>';
	}


	/**
	 * Internal sorting algorithm.
	 * @param e
	 * @param args
	 * @private
	 */
	function _sortData(e, args) {
		var comparer;
		if (typeof config.data.customComparer === "function") {
			comparer = function (a, b) {
				return config.data.customComparer(a, b, args)
			};
		} else {
			comparer = function (a, b) {
				var atype = typeof a[args.sortCol.field] == "object";
				var btype = typeof b[args.sortCol.field] == "object";
				var checkType = atype || btype;
				if (checkType)
					console.error("SlickController: To sort objects, please declare the function customComparer!");

				var compareA = a[args.sortCol.field];
				var compareB = b[args.sortCol.field];

				if (typeof compareA == "undefined")
					compareA = null;

				if (typeof compareB == "undefined")
					compareB = null;

				if (compareA == compareB || args.sortCol.field == "id" || checkType) {
					var aid = parseFloat(a.id.replace("id_", ""));
					var bid = parseFloat(b.id.replace("id_", ""));

					function isFloat(n) {
						return Number(n) === n && n % 1 !== 0;
					}

					if (!args.sortAsc && (isFloat(aid) || isFloat(bid)) && Math.floor(aid) == Math.floor(bid))
						return (aid > bid) ? -1 : 1;
					return (aid > bid) ? 1 : -1;
				}

				return (compareA > compareB) ? 1 : -1;
			};
		}

		this.dataView.sort(comparer, args.sortAsc);
	}


	/**
	 * Internal tracking of user clicks
	 * @private
	 */
	function _trackClickEvent() {
		_internal.clickEvent = true;
		if (_internal.clickEventTimeout)
			that.clearControllerTimeout(_internal.clickEventTimeout);

		_internal.clickEventTimeout = setTimeout(function resetClickEvent() {
			try {
				_internal.clickEvent = false;
			} catch (ex) {
			}
		}, 100);
		_internal.controllerTimeoutList.push(_internal.deleteTimeout);
	}
}