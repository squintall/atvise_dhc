/**
 * Helper for valid configurations
 */


/**
 * Slick Configuration Helper
 *
 * The Slick Configurator is a helper for configuring and creating valid data and slick configurations
 *
 * @param {object} config Configuration of the table.
 * @param {number} config.bufferInterval Time interval in which data arriving at the data is collected
 * @param {number} config.renderInterval Time interval in which data is rendered
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
 * @param {boolan} config.columns.n.visible
 * @param {number} config.columns.n.width column width in px
 * @param {number} config.continuationInterval  Interval between two continuation request
 * @param {function} config.dataRequestFunction Function used to retrieve the data and thus populate the table
 * @param {function} config.detailRowSettings.callback Function to be executed when clicking on the header
 * @param {function} config.detailRowSettings.exclude Function for exclude items from the detail view
 * @param {string} config.detailRowSettings.header Custom header for the detail row column
 * @param {function} [config.detailRowSettings.template] Function for formatting the detail view.
 * @param {number} [config.detailRowSettings.rows = 0] Number of reserved lines for the detail view. (0 disables the detail view)
 * @param {boolean} config.isReady Status of the configuration
 * @param {enum} config.mode Runtime specification (e.g. once)
 * @param {boolean} [config.truncateOverflow = true] Data that exceed the truncated limit will not be processed
 * @param {boolean} [config.truncateReverse = true] Data is truncated at the end (true)
 * @param {number} [config.truncateSize = 1000000] Elements in the memory before truncation starts
 * @param {onClickCallback} [config.onClickCallback] Function that is invoked when the user clicks on the table "function(clickinfo)"
 * @param {onHeaderClickCallback} [config.onHeaderClickCallback] Function that is invoked when the user clicks on the table header "function(clickinfo)"
 *
 * @param {object} settings
 * @param {object} [settings.columnReorder = true] Allow the columns to move. Does not affect the change of the columns width.
 * @param {color} settings.detail_cell_color: Background color for unfolded detail information
 * @param {color} settings.detail_text_color: Text color for unfolded detail information
 * @param {number} settings.detail_text_size: Text size for unfolded detail information
 * @param {object} settings.filterBar Enable filter bar in the table header
 * @param {number} [settings.filterDelay = 1000] Input delay until the filter function is executed (0 to switch off)
 * @param {number} [settings.filterLength = 1] Minimal length of the text to filter for
 * @param {boolean} [settings.filterRegExp = false] Use regular expressions for filtering
 * @param {boolean} [settings.filterCaseSensitive] Case-sensitive filtering
 * @param {boolean} [settings.filterStar = false] Activation of the "star" placeholder in the search function
 * @param {object} [settings.filterConversion = false] Custom conversion for values
 * @param {string} settings.font_family Family of font (Arial, Courier ...)
 * @param {color} settings.footer_cell_color Background color for footer
 * @param {color} settings.footer_mode_color Color for mode informations
 * @param {color} settings.footer_text_color Text color for footer
 * @param {number} settings.footer_text_size "Text size for footer"*
 * @param {color} settings.header_border_color Color of the header border
 * @param {color} settings.header_cell_color Background color for header, slider (scrollbar), custom filter, status bar
 * @param {number} settings.header_height Height of the header
 * @param {color} settings.header_text_color Text color for header, slider background (scrollbar), custom filter, status bar
 * @param {color} settings.header_text_size Text size for header, custom filter, status bar
 * @param {color} settings.header_text_vertical Text vertical position (default center)
 * @param {color} settings.header_text_horizontal Text horizontal position (default center)
 * @param {color} settings.hover_cell_color Background color for hovered cells
 * @param {color} settings.hover_text_color Text color for hovered cells
 * @param {object} settings.icons Optional symbols for use in the Visu
 * @param {object} settings.icons.burger Symbol for opening and closing the menu (SVG Icon)
 * @param {object} settings.icons.selected *reserved* (SVG Icon)
 * @param {object} settings.icons.selector Symbol for the quick selection of all markings (SVG Icon)
 * @param {object} settings.paging Enable paging
 * @param {color} settings.row_border_color Color of the row border
 * @param {color} settings.row_cell_color_even Background color for even rows
 * @param {color} settings.row_cell_color_odd Background color for odd rows
 * @param {number} settings.row_height Height of the rows
 * @param {color} settings.row_text_color_even Text color for even rows
 * @param {color} settings.row_text_color_odd Text color for odd rows
 * @param {number} settings.row_text_size Text size for rows
 * @param {color} settings.scrollbar_color Color for scroll bar
 * @param {color} settings.scrollbar_tumb_color Color for scroll bar tumb
 * @param {color} settings.selection_cell_color Background color for selected rows
 * @param {color} settings.selection_text_color Text color for selected rows
 * @param {boolean} settings.showMenu En-/Disable menu
 * @param {object} settings.showMenuHeight Height of the menu
 * @param {object} settings.showMenuPicker Display of the columns in the menu for fading in and out
 * @param {object} settings.showMenuWidth Width of the menu
 * @param {object} settings.showMode Show runtime mode in the status bar, if available
 * @param {color} settings.table_icon_color Color for symbols
 * @param {color} settings.table_icon_inactive Color for symbols
 * @param {color} settings.themeClass Class for custom css
 * @param {object} settings.translation Translation object
 * @param {string} settings.translation.export_csv Translation for csv export in menu
 * @param {string} settings.translation.export_csv_m Translation for csv export in menu (marked)
 * @param {string} settings.translation.export_csv_mwh Translation for csv export in menu (marked with hidden)
 * @param {string} settings.translation.export_csv_wh Translation for csv export in menu (hidden)
 * @param {string} settings.translation.export_option_timestamp Translation for export with timestamp
 * @param {string} settings.translation.export_option_milliseconds Translation for csv export with milliseconds
 * @param {string} settings.translation.filter_clear Translation for reset filter in menu
 * @param {string} settings.translation.filter_show_hide Translation for show hide filter in menu
 * @param {string} settings.translation.language Genaral language setting
 * @param {string} settings.translation.sort_clear *reserverd*
 * @param {string} settings.translation.title_command  Translation for the title of the custom commands in the menu
 * @param {string} settings.translation.title_export Translation for the title of the export in the menu
 * @param {string} settings.translation.title_picker Translation for the title of the column selection in the menu
 * @param {boolan} settings.linebreak Switch for linebreak mode (true / false)
 * @param {boolan} settings.multiselect Switch for linebreak mode (true / false)
 * @param {boolan} settings.linebreak Switch for linebreak mode (true / false)
 *
 * @param {object} fallback
 * @param {color} fallback.globalBorderColor Border color that is used if it is not defined in the styling
 * @param {color} fallback.globalFillColor Fill color that is used if it is not defined in the styling
 * @param {color} fallback.globalFontColor Font color that is used if it is not defined in the styling
 * @param {color} fallback.globalSymbolColor Symbol color that is used if it is not defined in the styling
 * @param {color} fallback.globalInactiveColor Symbol color that is used if it is not defined in the styling
 * @constructor
 */
var SlickConfigurator = function (config, settings, fallback) {
	var that = this;

	/* general language settings */
	var language = settings.translation.language ? settings.translation.language : false;

	/*check if builderparameters do exist - if not set default value*/
	var parameters = {
		columnReorder: settings["columnReorder"] ? settings["columnReorder"] : true,
		filterBar: settings["filterBar"] ? settings["filterBar"] : false,
		filterRegExp: settings["filterRegExp"] ? settings["filterRegExp"] : false,
		filterCaseSensitive: settings["filterCaseSensitive"] ? settings["filterCaseSensitive"] : true,
		filterLength: settings["filterLength"] ? settings["filterLength"] : 1,
		filterDelay: settings["filterDelay"] ? settings["filterDelay"] : 1000,
		filterStar: settings["filterStar"] ? settings["filterStar"] : false,
		filterConversion: settings["filterConversion"] ? settings["filterConversion"] : config["filterConversion"] ? config["filterConversion"] : false,
		groupBy: settings["groupBy"] ? settings["groupBy"] : false,
		paging: settings["paging"] ? settings["paging"] : false,
		multiselect: settings["multiselect"] ? settings["multiselect"] : false,
		multicellselect: settings["multicellselect"] ? settings["multicellselect"] : false,
		showMenu: settings["showMenu"] ? settings["showMenu"] : true,
		showMenuWidth: settings["showMenuWidth"] ? settings["showMenuWidth"] : "250",
		showMenuHeight: settings["showMenuHeight"] ? settings["showMenuHeight"] : "300",
		showMenuPicker: settings["showMenuPicker"] ? settings["showMenuPicker"] : true,
		showMenuFilter: settings["showMenuFilter"] ? settings["showMenuFilter"] : true,
		showMenuExport: settings["showMenuExport"] ? settings["showMenuExport"] : true,
		showMode: settings["showMode"] ? settings["showMode"] : false,
		style: {
			font_family: settings["font_family"] ? settings["font_family"] : null,
			detail_cell_color: settings["detail_cell_color"] ? settings["detail_cell_color"] : null,
			detail_text_color: settings["detail_text_color"] ? settings["detail_text_color"] : null,
			detail_text_size: settings["detail_text_size"] ? settings["detail_text_size"] : null,
			footer_text_size: settings["footer_text_size"] ? settings["footer_text_size"] : null,
			footer_text_color: settings["footer_text_color"] ? settings["footer_text_color"] : fallback.globalFontColor,
			footer_cell_color: settings["footer_cell_color"] ? settings["footer_cell_color"] : fallback.globalFillColor,
			footer_mode_color: settings["footer_mode_color"] ? settings["footer_mode_color"] : null,
			header_border_color: settings["header_border_color"] ? settings["header_border_color"] : fallback.globalBorderColor,
			header_cell_color: settings["header_cell_color"] ? settings["header_cell_color"] : fallback.globalFillColor,
			header_height: settings["header_height"] ? settings["header_height"] : 30,
			header_text_color: settings["header_text_color"] ? settings["header_text_color"] : fallback.globalFontColor,
			header_text_size: settings["header_text_size"] ? settings["header_text_size"] : null,
			header_text_vertical: settings["header_text_vertical"] ? settings["header_text_vertical"] : "center",
			header_text_horizontal: settings["header_text_horizontal"] ? settings["header_text_horizontal"] : "center",
			hover_cell_color: settings["hover_cell_color"] ? settings["hover_cell_color"] : fallback.globalFillColor,
			hover_text_color: settings["hover_text_color"] ? settings["hover_text_color"] : fallback.globalFontColor,
			row_border_color: settings["row_border_color"] ? settings["row_border_color"] : fallback.globalBorderColor,
			row_cell_color_even: settings["row_cell_color_even"] ? settings["row_cell_color_even"] : null,
			row_cell_color_odd: settings["row_cell_color_odd"] ? settings["row_cell_color_odd"] : null,
			row_height: settings["row_height"] ? settings["row_height"] : 20,
			row_text_color_odd: settings["row_text_color_odd"] ? settings["row_text_color_odd"] : fallback.globalFontColor,
			row_text_color_even: settings["row_text_color_even"] ? settings["row_text_color_even"] : fallback.globalFontColor,
			row_text_size: settings["row_text_size"] ? settings["row_text_size"] : null,
			scrollbar_color: settings["scrollbar_color"] ? settings["scrollbar_color"] : null,
			scrollbar_tumb_color: settings["scrollbar_tumb_color"] ? settings["scrollbar_tumb_color"] : null,
			selection_cell_color: settings["selection_cell_color"] ? settings["selection_cell_color"] : fallback.globalFillColor,
			selection_text_color: settings["selection_text_color"] ? settings["selection_text_color"] : fallback.globalFontColor,
			table_icon_color: settings["table_icon_color"] ? settings["table_icon_color"] : fallback.globalSymbolColor,
			table_icon_inactive: settings["table_icon_inactive"] ? settings["table_icon_inactive"] : fallback.globalInactiveColor,
			themeClass: settings["theme_class"] ? settings["theme_class"] : "atviseTheme",
			linebreak: settings["linebreak"] ? settings["linebreak"] : false,
		},
		icons: {
			burger: typeof settings.icons.burger == "undefined" ? false : settings.icons.burger,
			selected: typeof settings.icons.selected == "undefined" ? false : settings.icons.selected,
			selector: typeof settings.icons.selector == "undefined" ? false : settings.icons.selector,
		},
		notification: {
			notification: settings["notification"] ? settings["notification"] : false,
		}
	};


	/* column config section */
	var columns = config["columns"];
	if (!columns) {
		console.warn("Table: No columns set!");
	} else {
		for (var c = 0; c < columns.length; c++) {
			if (typeof columns[c].formatter == "undefined") {
				columns[c].formatter = new webMI.rootWindow.SlickFormatter(language).AtviseCellItem;
			}
			if (typeof columns[c].cssClass == "undefined") {
				var properties = [];
				if (typeof columns[c].alignment != "undefined")
					properties.push("text-" + columns[c].alignment);
				if (typeof columns[c].textoption != "undefined")
					properties.push("text-" + columns[c].textoption);
				columns[c].cssClass = properties.join(" ");
			}
		}
	}


	/* dataRequestFunction config section */
	var mode = config["mode"];
	if (!mode) {
		console.warn("Table: No mode set! Setting is limited to once!");
		mode = "once";
	}


	/* dataRequestFunction config section */
	var dataRequestFunction = config["dataRequestFunction"];
	if (!dataRequestFunction) {
		console.warn("Table: No dataRequestFunction set!");
	}

	/* dataReleaseFunction config section */
	var dataReleaseFunction = config["dataReleaseFunction"];

	/* custom comparer config section */
	var customComparer = config["customComparer"];
	if (!customComparer) {
		customComparer = false;
	}


	/* prepare custom menu */
	var evalCustomMenue = getValue(config, "customMenuEntries", []);


	/* table menu config */
	var tableMenu = {
		showMenu: vallidateParam(parameters["showMenu"]),
		showMenuPicker: vallidateParam(parameters["showMenuPicker"]),
		showMenuCustomTitle: getValue(evalCustomMenue, "title", undefined),
		showMenuPickerTitle: settings.translation.title_picker,
		customMenuEntries: getValue(evalCustomMenue, "items", undefined),
		menuWidth: parameters["showMenuWidth"],
		menuHeight: parameters["showMenuHeight"]
	};


	/** add export menu and commands **/
	if (!webMI.isMobileTouchDevice()) {

		if (parameters.showMenuExport == "true" || parameters.showMenuExport == true) {
			tableMenu.showMenuExportTitle = settings.translation.title_export;
			tableMenu.exportMenuEntries = [
				{
					iconImage: "",
					title: settings.translation.export_csv,
					disabled: false,
					hidden: false,
					command: "export-csv",
					group: "csv-commands"
				},
				{
					iconImage: "",
					title: settings.translation.export_csv_wh,
					disabled: false,
					hidden: false,
					command: "export-csv-hidden",
					group: "csv-commands"
				},
				{
					iconImage: "",
					title: settings.translation.export_csv_m,
					disabled: false,
					hidden: false,
					command: "export-csv-marked",
					group: "csv-commands"
				},
				{
					iconImage: "",
					title: settings.translation.export_csv_mwh,
					disabled: false,
					hidden: false,
					command: "export-csv-marked-hidden",
					group: "csv-commands"
				},
				{
					iconImage: "",
					title: "<hr>",
					disabled: true,
					hidden: false,
					group: "csv-commands"
				},
				{
					iconImage: "",
					title: settings.translation.export_option_timestamp,
					disabled: false,
					hidden: false,
					command: "export-option-timestamp",
					group: "csv-commands",
					option: true,
					checked: true
				},
				{
					iconImage: "",
					title: settings.translation.export_option_milliseconds,
					disabled: false,
					hidden: false,
					command: "export-option-milliseconds",
					group: "csv-commands",
					option: true,
					checked: false
				}
			];
		}

		if (parameters.showMenuFilter == "true" || parameters.showMenuFilter == true) {
			tableMenu.showMenuCommandTitle = settings.translation.title_command;
			tableMenu.commandMenuEntries = [
				{
					iconImage: "",
					title: settings.translation.filter_show_hide,
					disabled: false,
					hidden: false,
					command: "toggle-filterbar",
					group: "cmd-commands"
				}, {
					iconImage: "",
					title: settings.translation.filter_clear,
					disabled: false,
					hidden: false,
					command: "clear-filterbar",
					group: "cmd-commands"
				},
			];
		}
	}


	/** custom menu entries **/
	if (typeof tableMenu.showMenuCustomTitle !== "undefined") {
		if (!Array.isArray(tableMenu["customMenuEntries"])) {
			tableMenu.customMenuEntries = [];
		}
		tableMenu.customMenuEntries = tableMenu.customMenuEntries.concat([]);
	}


	/* standard slickgrid configuration */
	var options = {
		enableCellNavigation: true,
		enableColumnReorder: false, // important set false so the controller can takes care!
		forceFitColumns: true,
		headerRowHeight: parseInt(parameters.style["header_height"]),
		topPanelHeight: 25,
		showHeaderRow: vallidateParam(parameters["filterBar"]),
		rowHeight: parseInt(parameters.style["row_height"])
	};


	/* check detail row config */
	var detailRowEnable = config["detailRowSettings"] !== undefined ? true : false;


	/* optional features depending on other display components */
	var feature = {
		"paging": vallidateParam(parameters["paging"]),
		"pageSize": parseInt(parameters["pageSize"]),
		"showMode": vallidateParam(parameters["showMode"]),
		"detailRows": detailRowEnable && config["detailRowSettings"].rows > 0 ? config["detailRowSettings"].rows : false,
		"detailRowHeader": detailRowEnable && config["detailRowSettings"].header !== undefined ? config["detailRowSettings"].header : "",
		"detailRowTemplate": detailRowEnable && config["detailRowSettings"].template !== undefined ? config["detailRowSettings"].template : null,
		"detailRowCallback": detailRowEnable && config["detailRowSettings"].callback !== undefined ? config["detailRowSettings"].callback : null,
		"detailRowExclude": detailRowEnable && config["detailRowSettings"].exclude !== undefined ? config["detailRowSettings"].exclude : null,
		"multiselect": vallidateParam(parameters["multiselect"]),
		"multicellselect": vallidateParam(parameters["multicellselect"]),
		"filterRegExp": vallidateParam(parameters["filterRegExp"]),
		"filterCaseSensitive": vallidateParam(parameters["filterCaseSensitive"]),
		"filterLength": parseInt(parameters["filterLength"]),
		"filterDelay": parseInt(parameters["filterDelay"]),
		"filterStar": vallidateParam(parameters["filterStar"]),
		"filterConversion": parameters["filterConversion"],
		"groupBy": parameters["groupBy"],
		"onClickCallback": config["onClickCallback"],
		"onHeaderClickCallback": config["onHeaderClickCallback"],
		"rowFormatter": config["rowFormatter"],
		"tableMenu": tableMenu,
		"columnReorder": vallidateParam(parameters["columnReorder"]),
		"forceTouchmove": vallidateParam(config["forceTouchmove"]),
	};


	/* create the config */
	var tableConfig = {
		"containerID": config["containerID"],
		"columns": columns,
		"data": {
			"mode": mode,
			"dataRequestFunction": dataRequestFunction,
			"dataReleaseFunction": dataReleaseFunction,
			"customComparer": customComparer,
			"continuationInterval": config["continuationInterval"],
			"bufferInterval": config["bufferInterval"],
			"renderInterval": config["renderInterval"],
			"truncateSize": config["truncateSize"],
			"truncateOverflow": config["truncateOverflow"],
			"truncateReverse": config["truncateReverse"],
		},
		"feature": feature,
		"icons": parameters["icons"],
		"language": language,
		"notification": parameters["notification"],
		"options": options,
		"style": parameters["style"],
		"translation": settings.translation,
	};


	/**
	 * returning the config
	 * @returns {}
	 */
	this.getConfig = function () {
		return tableConfig
	}


	/**
	 * internal validation for true and false
	 * @param paramValue
	 * @returns {boolean}
	 * @private
	 */
	function vallidateParam(paramValue) {
		return paramValue === "true" || paramValue === true ? true : false;
	}


	/**
	 * internal validation for value
	 * @param param
	 * @param key
	 * @param fallback
	 * @private
	 */
	function getValue(param, key, fallback) {
		if (typeof param[key] != "undefined")
			return param[key];
		else
			return fallback;
	}
};
