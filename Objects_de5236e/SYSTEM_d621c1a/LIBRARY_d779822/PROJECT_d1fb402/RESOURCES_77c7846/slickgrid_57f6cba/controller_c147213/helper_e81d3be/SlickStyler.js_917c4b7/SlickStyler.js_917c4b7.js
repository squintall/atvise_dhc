/**
 * Style list for the SlickStyler
 * @memberOf SlickStyler
 * @enum {string} style
 */
var style = {
	filter: "css map for custom filter",
	footer: "css map for footer",
	table: "css map for table",
};


/**
 * Styling parameter for the SlickStyler
 * @memberOf SlickStyler
 * @enum {string} styling
 */
var styling = {
	/* detail */
	detail_cell_color: "Background color for unfolded detail information",
	detail_text_color: "Text color for unfolded detail information",
	detail_text_size: "Text size for unfolded detail information",
	/* footer */
	footer_cell_color: "Background color for footer",
	footer_text_color: "Text color for footer",
	footer_text_size: "Text size for footer",
	footer_mode_color: "Color for mode informations",
	/* font */
	font_family: "Family of font",
	/* header */
	header_border_color: "Color of the header border",
	header_cell_color: "Background color for header, slider (scrollbar), custom filter, status bar",
	header_height: "Height of the header",
	header_text_color: "Text color for header, slider background (scrollbar), custom filter, status bar",
	header_text_size: "Text size for header, custom filter, status bar",
	header_text_vertical: "Text align vertical",
	header_text_horizontal: "Text align horizontal",
	/* hover */
	hover_cell_color: "Background color for hovered cells",
	hover_text_color: "Text color for hovered cells",
	/* rows */
	row_border_color: "Color of the row border",
	row_cell_color_even: "Background color for even rows",
	row_cell_color_odd: "Background color for odd rows",
	row_height: "Height of the rows",
	row_text_color_even: "Text color for even rows",
	row_text_color_odd: "Text color for odd rows",
	row_text_size: "Text size for rows",
	/* scrollbar */
	scrollbar_color: "Color for scroll bar",
	scrollbar_tumb_color: "Color for scroll bar tumb",
	/* selection */
	selection_cell_color: "Background color for selected rows",
	selection_text_color: "Text color for selected rows",
	/* theme */
	themeClass: "Class for custom css",
	/** @type {boolean} */
	linebreak: "Switch for linebreak mode (true / false)"
};

/**
 * Helper class for overriding the default css with builder or configuration variables.
 * @constructor
 * @private
 */
var SlickStyler = function () {
	var internal = [];
	internal.styleSheets = [];

	/**
	 * Generate inline CSS code
	 * @param {String} container UI Element id of target container
	 * @param {SlickStyler.styling} styling Styling parameter (e.g. builder parameter)
	 * @param {SlickStyler.style} [style = table] Style mapping to apply
	 */
	this.generate = function (container, styling, style) {
		var cssCode = "";

		/** add some class to the container **/
		var element = document.getElementById(container);
		webMI.rootWindow.jQuery(element).addClass(container);
		webMI.rootWindow.jQuery(element).addClass(styling.themeClass);

		/** check choosen style map **/
		if (typeof style == "undefined") {
			style = "table";
		}
		var useMap = internal._mapping[style];

		/** loop mapping, generate css code **/
		for (var key in styling) {
			if (typeof useMap[key] != "undefined") {
				for (var pos in useMap[key]) {
					var value = styling[key];
					if (value != null) {
						var path = useMap[key][pos].path;
						var attr = useMap[key][pos].attr;
						var post = useMap[key][pos].post;
						if (typeof useMap[key][pos].fixV != "undefined") {
							value = useMap[key][pos].fixV(value);
						}
						for (var p in path)
							cssCode += "." + container + " " + path[p] + " { " + attr + ": " + value + post + " } \n";
					}
				}
			}
		}

		/** additional icon styling (e.g. sort indicators) **/
		if (style == "table") {
			// slick-sort-indicator
			var icon_sizes = styling.header_text_size * 0.60;
			var margin_top = (styling.header_height - icon_sizes) / 2;
			cssCode += "." + container + " " + ".slick-sort-indicator" + " { " + "top" + ": " + 0 + "px" + " } \n";
			cssCode += "." + container + " " + ".slick-sort-indicator" + " { " + "margin-top" + ": " + margin_top + "px" + " } \n";
			cssCode += "." + container + " " + ".slick-sort-indicator.slick-sort-indicator-asc " + "{ " + "border-bottom" + ": " + icon_sizes + "px solid" + " } \n";
			cssCode += "." + container + " " + ".slick-sort-indicator.slick-sort-indicator-desc" + " { " + "border-top   " + ": " + icon_sizes + "px solid" + " } \n";
			cssCode += "." + container + " " + ".slick-sort-indicator.slick-sort-indicator-asc " + " { " + "border-left  " + ": " + icon_sizes + "px solid transparent" + " } \n";
			cssCode += "." + container + " " + ".slick-sort-indicator.slick-sort-indicator-asc " + " { " + "border-right " + ": " + icon_sizes + "px solid transparent" + " } \n";
			cssCode += "." + container + " " + ".slick-sort-indicator.slick-sort-indicator-desc" + " { " + "border-left  " + ": " + icon_sizes + "px solid transparent" + " } \n";
			cssCode += "." + container + " " + ".slick-sort-indicator.slick-sort-indicator-desc" + " { " + "border-right " + ": " + icon_sizes + "px solid transparent" + " } \n";
		}

		/** apply patch for chrome and mobile scoller **/
		if (webMI.getConfig("frame.scaletype") == "zoom") {
			/* bg color */
			var scrollbar_color_parm = typeof styling.scrollbar_color != "undefined" && styling.scrollbar_color != null ? styling.scrollbar_color : false;
			var scrollbar_fallback = typeof styling.header_text_color != "undefined" && styling.header_text_color != null ? styling.header_text_color : "#e6e6e6";
			var scrollFrontColor = scrollbar_color_parm ? scrollbar_color_parm : scrollbar_fallback;
			/* fg color tumb */
			var scrollbar_tumb_color_parm = typeof styling.scrollbar_tumb_color != "undefined" && styling.scrollbar_tumb_color != null ? styling.scrollbar_tumb_color : false;
			var scrollbar_tumb_fallback = typeof styling.header_cell_color != "undefined" && styling.header_cell_color != null ? styling.header_cell_color : "#555555";
			var scrollBackgroundColor = scrollbar_tumb_color_parm ? scrollbar_tumb_color_parm : scrollbar_tumb_fallback;
			cssCode += " ::-webkit-scrollbar { -webkit-appearance: none; width: 16px !important; } \n";
			if (style == "table") {
				cssCode += "." + container + " ::-webkit-scrollbar { background-color: " + scrollFrontColor + "; border: 0px solid " + scrollBackgroundColor + "; } ";
				cssCode += "." + container + " ::-webkit-scrollbar-thumb { background-color: " + scrollBackgroundColor + "; border: 2px solid " + scrollFrontColor + "; } \n";
			}
		}

		/** add css to the dom **/
		if (cssCode != "") {
			var css = document.createElement("style");
			css.id = container + "_builder_css";
			css.type = "text/css";
			css.innerHTML = cssCode;
			document.head.appendChild(css);
			internal.styleSheets.push(css.id);
		}
	};

	/**
	 * Returns a css class name that formats a slickgrid row with the given parameters
	 * The returned class can be set to certain table rows via the slickgrid rowFormatter
	 * !!Caution!! Function has to be called after SlickStyler.generate, otherwise it won't work
	 * @param {string} fontColor - HTML color code for the font. If set to null or "", the font color will remain the row's original one.
	 * @param {integer} fontFlashInterval - Flash interval for the row's text in milliseconds. Set to 0 to disable flashing.
	 * @param {string} fillColor - HTML color code for the row's background. If set to null or "", the background color will remain the row's original one.
	 * @param {integer} fillFlashInterval - Flash interval for the row's background in milliseconds. Set to 0 to disable flashing.
	 * @returns a css class name
	 */
	this.getRowStyle = function (container, fontColor, fontFlashInterval, fillColor, fillFlashInterval) {
		//escapeHTML because values are used as innerHTML
		fontColor = webMI.escapeHTML(fontColor);
		fontFlashInterval = webMI.escapeHTML(fontFlashInterval);
		fontFlashInterval = parseInt(fontFlashInterval, 10);
		fillColor = webMI.escapeHTML(fillColor);
		fillFlashInterval = webMI.escapeHTML(fillFlashInterval);
		fillFlashInterval = parseInt(fillFlashInterval, 10);

		var cssClassName = fontColor + fontFlashInterval + fillColor + fillFlashInterval;
		cssClassName = window.btoa(cssClassName).replace(/=/g, ""); //convert to base64 and remove all =

		var cssElement = document.getElementById("slickgrid-row-styles");
		if (!cssElement) {
			//if cssElement does not exist, create it and add a keyframe for text flashing (same for every fontColor -> fill flashing needs one keyframe per fillColor)
			cssElement = document.createElement("style");
			cssElement.id = "slickgrid-row-styles";
			cssElement.type = "text/css";
			cssElement.innerHTML = "@keyframes atv-row-style--flash-font{50%{color:rgba(0,0,0,0)}}\n";
			document.head.appendChild(cssElement);
			internal.styleSheets.push(cssElement.id);
		}

		//if the class is not in the style code, then create a new css class for this combination
		//of fontColor, fontFlashInterval, fillColor, fillFlashInterval and add it to the dom.
		if (cssElement.innerHTML.indexOf("." + container + " .slick-row." + cssClassName) == -1) {
			var cssFontColor = "";
			if (fontColor)
				cssFontColor = "color:" + fontColor + ";";

			var cssBackground = "";
			if (fillColor && !fillFlashInterval)  //if fillFlashInterval = true, fillColor is set via keyframe
				cssBackground = "background:" + fillColor + ";";

			var cssFontFlashInterval = "";
			if (fontFlashInterval)
				cssFontFlashInterval = "atv-row-style--flash-font " + fontFlashInterval + "ms step-start infinite";

			var cssFillFlashInterval = "", cssFillFlashIntervalKeyFrame = "";
			if (fillFlashInterval) {
				cssFillFlashInterval = cssClassName + "--flash-fill " + fillFlashInterval + "ms step-start infinite";
				if (!fillColor) //if no fill color is set, flash white
					fillColor = "white";

				cssFillFlashIntervalKeyFrame = "@keyframes " + cssClassName + "--flash-fill{50%{background:" + fillColor + "}}";
			}

			var cssAnimation = "";
			if (fontFlashInterval && fillFlashInterval)
				cssAnimation = "animation:" + cssFontFlashInterval + "," + cssFillFlashInterval;
			else if (fontFlashInterval)
				cssAnimation = "animation:" + cssFontFlashInterval;
			else if (fillFlashInterval)
				cssAnimation = "animation:" + cssFillFlashInterval;

			//the prefix ".{container} .slick-row." is needed because otherwise "{container}.slick_table_panel .slick-row.even" or ".{container} .slick-row.odd" are stronger
			//and !important does not work with animations in firefox (see: https://tosbourn.com/firefox-honours-important-in-css-animations-no-one-else-seems-to/)
			var css = "." + container + " .slick-row." + cssClassName + "{" + cssFontColor + cssBackground + cssAnimation + "}" + cssFillFlashIntervalKeyFrame + "\n" +
				"." + container + " .slick-row.even." + cssClassName + "{" + cssFontColor + cssBackground + cssAnimation + "}" + cssFillFlashIntervalKeyFrame + "\n" +
				"." + container + " .slick-row.odd." + cssClassName + "{" + cssFontColor + cssBackground + cssAnimation + "}" + cssFillFlashIntervalKeyFrame + "\n";

			cssElement.innerHTML += css;
		}
		return cssClassName;
	};

	/**
	 * Removes the css code created by the getRowStyle method.
	 */
	this.unload = function () {
		for (var s in internal.styleSheets) {
			var cssElement = document.getElementById(internal.styleSheets[s]);
			if (cssElement) {
				cssElement.parentNode.removeChild(cssElement);
			}
		}
		internal = null;
	};

	/***************************************************************/
	/********************* PRIVATE METHODS *************************/

	/***************************************************************/


	/**
	 * color inverter
	 * @param hexTripletColor
	 * @returns {*}
	 * @private
	 */
	function _invertColor(hexTripletColor) {
		var color = hexTripletColor;
		color = color.substring(1); // remove #
		color = parseInt(color, 16); // convert to integer
		color = 0xFFFFFF ^ color; // invert three bytes
		color = color.toString(16); // convert to hex
		color = ("000000" + color).slice(-6); // pad with leading zeros
		color = "#" + color; // prepend #
		return color;
	}


	/**
	 * Mapping the builder parameters to CSS paths
	 * @type object
	 * @private
	 */
	internal._mapping = {
		"table": {
			/** HEADER **/
			"header_height": [{
				"path": [".slick-header", ".slick-header-columns", ".slick-headerrow", ".slick-headerrow-columns"],
				"attr": "height",
				"post": "px"
			}, {
				"path": [".slick-header-column", ".slick-headerrow-column"],
				"attr": "height",
				"post": "px",
				"fixV": function (v) {
					return (v - 8);
				} // correction for padding 4px;
			}],
			"header_border_color": [{
				"path": [".slick-header", ".slick-header-column", ".slick-header-columns", ".ui-sortable-handle"],
				"attr": "border-color",
				"post": ""
			}],
			"header_cell_color": [{
				"path": [".ui-state-default", ".slick-header", ".slick-header-columns", ".slick-header-column", ".slick-gridmenu"],
				"attr": "background",
				"post": ""
			}, {
				"path": [".slick-sort-indicator"],
				"attr": "background",
				"post": "",
			}],
			"header_text_size": [{
				"path": [".ui-state-default", ".slick-header", ".slick-header-columns", ".slick-header-column", ".slick-gridmenu"],
				"attr": "font-size",
				"post": "px"
			}, {
				"path": [".slick-header-column"],
				"attr": "line-height",
				"post": "%",
				"fixV": function (v) {
					return 110;
				}
			}, {
				"path": ["input.filterbarInput"],
				"attr": "font-size",
				"post": "px",
				"fixV": function (v) {
					return (v - 2);
				}
			}, {
				"path": ["input.filterbarInput[type=checkbox]"],
				"attr": "transform",
				"post": "",
				"fixV": function (v) {
					return "scale(" + (1 + (v / 12 - 1) * 0.75) + ")";
				}
			}, {
				"path": [".slick-gridmenu .title"],
				"attr": "font-size",
				"post": "px",
			}, {
				"path": [".dataMode"],
				"attr": "font-size",
				"post": "px",
				"fixV": function (v) {
					return (v - 2);
				}
			}],
			"header_text_color": [{
				"path": [".ui-state-default", ".slick-header", ".slick-header-columns", ".slick-header-column", ".slick-gridmenu"],
				"attr": "color",
				"post": ""
			}, {
				"path": [".slick-gridmenu"],
				"attr": "border",
				"post": "",
				"fixV": function (v) {
					return ("1px solid " + v);
				}
			}],
			"header_text_vertical": [{
				"path": [".slick-header-column"],
				"attr": "display",
				"post": "",
				"fixV": function (v) {
					return "inline-flex";
				}
			}, {
				"path": [".slick-header-column"],
				"attr": "align-items",
				"post": "",
			}],
			"header_text_horizontal": [{
				"path": [".slick-header-column"],
				"attr": "justify-content",
				"post": "",
			}],
			/** hover **/
			"hover_cell_color": [{
				"path": [".slick-cell:hover"],
				"attr": "background",
				"post": ""
			}],
			/** hover **/
			"hover_text_color": [{
				"path": [".slick-cell:hover"],
				"attr": "color",
				"post": ""
			}],
			/** ROWS **/
			"row_height": [{
				"path": [".slick-row", ".slick-row-column", ".detail-head", ".detail-line"],
				"attr": "height",
				"post": "px"
			}],
			"row_text_size": [{
				"path": [".slick-row", ".slick-row-column", ".slick-cell", ".slick-row.even", ".slick-row.odd", ".slick-pager", ".slick-gridmenu", ".right"],
				"attr": "font-size",
				"post": "px"
			}, {
				"path": [".slick-cell-item input[type=checkbox]"],
				"attr": "transform",
				"post": "",
				"fixV": function (v) {
					return "scale(" + (1 + (v / 12 - 1) * 0.75) + ")";
				}
			}, {
				"path": [".detailView-toggle.expand"],
				"attr": "border-left-width",
				"post": "px",
				"fixV": function (v) {
					return (v * 2 / 3);
				}
			}, {
				"path": [".detailView-toggle.expand"],
				"attr": "border-right-width",
				"post": "px",
				"fixV": function (v) {
					return (v * 2 / 3);
				}
			}, {
				"path": [".detailView-toggle.expand"],
				"attr": "border-bottom-width",
				"post": "px",
				"fixV": function (v) {
					return (v * 2 / 3);
				}
			}, {
				"path": [".detailView-toggle.collapse"],
				"attr": "border-width",
				"post": "px",
				"fixV": function (v) {
					return (v * 2 / 3 / 2);
				}
			}],
			"row_cell_color_odd": [{
				"path": [".slick-row.odd"],
				"attr": "background",
				"post": ""
			}],
			"row_cell_color_even": [{
				"path": [".slick-row.even"],
				"attr": "background",
				"post": ""
			}],
			"row_text_color_odd": [{
				"path": [".slick-row.odd"],
				"attr": "color",
				"post": ""
			}],
			"row_text_color_even": [{
				"path": [".slick-row.even"],
				"attr": "color",
				"post": ""
			}],
			"row_border_color": [{
				"path": [".slick-cell"],
				"attr": "border-bottom-color",
				"post": ""
			}, {
				"path": [".slick-cell"],
				"attr": "border-right-color",
				"post": ""
			}],
			/** COMMON **/
			"font_family": [{
				"path": [".slick-header-column", ".slick-cell", ".slick-cell-item", ".detail-container", ".detail-view", ".slick-gridmenu"],
				"attr": "font-family",
				"post": "",
				"fixV": function (v) {
					var family = {
						"Arial": 'Arial, Helvetica, sans-serif',
						"Courier": '"Courier New", Courier, monospace',
						"Tahoma": 'Tahoma, Geneva, sans-serif',
						"Verdana": "Verdana, Geneva, sans-serif"
					};
					return family[v];
				}
			}],

			/** DETAIL ROWS **/
			"detail_cell_color": [{
				"path": [".detail-container", ".detail-view", ".dynamic-cell-detail"],
				"attr": "background",
				"post": ""
			}],
			"detail_text_color": [{
				"path": [".detail-container", ".detail-view", ".dynamic-cell-detail", ".detail-line"],
				"attr": "color",
				"post": ""
			}],
			"detail_text_size": [{
				"path": [".detail-container", ".detail-view", ".dynamic-cell-detail", ".detail-head", ".detail-line"],
				"attr": "font-size",
				"post": "px"
			}],

			/** SELECTED ROWS **/
			"selection_cell_color": [{
				"path": [".slick-cell.selected"],
				"attr": "background",
				"post": ""
			}],
			"selection_text_color": [{
				"path": [".slick-cell.selected"],
				"attr": "color",
				"post": ""
			}],
			"table_icon_color": [{
				"path": [".table-icon line", ".table-icon polygon", ".table-icon polyline", ".table-icon rect"],
				"attr": "stroke",
				"post": ""
			}, {
				"path": [".table-icon polygon", ".table-icon polyline"],
				"attr": "fill",
				"post": ""
			}],

			/** MULTI LINE **/
			"linebreak": [{
				"path": [".slick-cell-item"],
				"attr": "white-space",
				"fixV": function (v) {
					if (v == "true") return "normal; word-break: break-all; max-height:100%; ";
					else return "nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; max-width: 100%; ";
				},
				"post": ""
			}],
		},
		"footer": {
			"footer_cell_color": [{
				"path": [".footerContainer"],
				"attr": "background",
				"post": ""
			}],
			"footer_text_size": [{
				"path": [".footerContainer"],
				"attr": "font-size",
				"post": "px"
			}, {
				"path": [".footerContainer .contentArea .pagingInput input[type=text]", ".footerContainer .contentArea .pagingInput input[type=button]"],
				"attr": "font-size",
				"post": "px",
				"fixV": function (v) {
					return (v - 2);
				}
			}],
			"footer_text_color": [{
				"path": [".footerContainer"],
				"attr": "color",
				"post": ""
			}],
			"footer_mode_color": [{
				"path": [".footerContainer .contentArea .dataTextMode.active"],
				"attr": "color",
				"post": ""
			}],
			"font_family": [{
				"path": [".footerContainer", ".footerContainer .statusText", ".footerContainer input", ".footerContainer select"],
				"attr": "font-family",
				"post": "",
				"fixV": function (v) {
					var family = {
						"Arial": 'Arial, Helvetica, sans-serif',
						"Courier": '"Courier New", Courier, monospace',
						"Tahoma": 'Tahoma, Geneva, sans-serif',
						"Verdana": "Verdana, Geneva, sans-serif"
					};
					return family[v];
				}
			}],
			"table_icon_color": [{
				"path": [".footerContainer .contentArea .pagingButton"],
				"attr": "color",
				"post": "",
			}, {
				"path": [".footerContainer .contentArea .pagingButton"],
				"attr": "border-color",
				"post": "",
			}, {
				"path": [".footerContainer .contentArea .searchButton"],
				"attr": "color",
				"post": "",
			}],
			"table_icon_inactive": [{
				"path": [".footerContainer .contentArea .pagingButton.disabled"],
				"attr": "color",
				"post": "",
			}, {
				"path": [".footerContainer .contentArea .pagingButton.disabled"],
				"attr": "border-color",
				"post": "",
			}, {
				"path": [".footerContainer .contentArea .searchButton.active"],
				"attr": "color",
				"post": "",
				"fixV": function (v) {
					return '#ffffff';
				}
			}],
		},
		"filter": {
			"header_height": [{
				"path": [".slick-custom-filter"],
				"attr": "height",
				"post": "px"
			}],
			"header_cell_color": [{
				"path": [".slick-custom-filter"],
				"attr": "background",
				"post": ""
			}],
			"header_text_size": [{
				"path": [".slick-custom-filter"],
				"attr": "font-size",
				"post": "px"
			}],
			"header_text_color": [{
				"path": [".slick-custom-filter"],
				"attr": "color",
				"post": ""
			}],
			"font_family": [{
				"path": [".slick-custom-filter", ".slick-custom-filter input", ".slick-custom-filter select"],
				"attr": "font-family",
				"post": "",
				"fixV": function (v) {
					var family = {
						"Arial": 'Arial, Helvetica, sans-serif',
						"Courier": '"Courier New", Courier, monospace',
						"Tahoma": 'Tahoma, Geneva, sans-serif',
						"Verdana": "Verdana, Geneva, sans-serif"
					};
					return family[v];
				}
			}],
		}
	};
};