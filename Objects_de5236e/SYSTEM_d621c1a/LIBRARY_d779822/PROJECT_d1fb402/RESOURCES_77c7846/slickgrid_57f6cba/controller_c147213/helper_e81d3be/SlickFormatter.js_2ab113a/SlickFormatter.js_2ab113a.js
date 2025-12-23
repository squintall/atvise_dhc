/**
 * Helper class for cell formatting
 *
 * This helper class is automatically added as default formatter by the slick configurator.
 * This helper class is automatically added as the default format by the Slick Configurator and adds a surrounding div
 * container to the value. For the formatting of the value, it also accesses the attribute format of the column config.
 *
 * ---
 * Note:
 * If a custom formatter is used, it overwrites the slick formatter.
 * @constructor
 */
var SlickFormatter = function (language) {
    var internal = [];
	this.language = language ? language : false;

    /**
     * Formatting of the cell content
     * @param row !predefined by slick grid!
     * @param cell !predefined by slick grid!
     * @param value !predefined by slick grid!
     * @param columnDef !predefined by slick grid!
     * @param dataContext !predefined by slick grid!
     * @returns {string}
     */
    this.AtviseCellItem = function (row, cell, value, columnDef, dataContext) {
		var tooltip = ' title="' + value + '"';

        value = typeof value != "undefined" ? value : "";
        if (typeof columnDef.type != "undefined") {
			value = internal._formatValue(columnDef.id, value, columnDef.type, dataContext, this.language);
        }

		var style = "";
		if(columnDef.alignment == "center")
			style = ' style="width: 90%;text-align: center;"';

		return '<div class="slick-cell-item center"' + style + tooltip + '>' + value + '</div>';
    }

    /**
     * Formatting values
     * @param value
     * @param format
     * @returns {*}
     * @private
     */
	internal._formatValue = function (id, value, format, data, language) {

		function _makeConversions(format, value) {
			if (format[0] == "datetime") {
				if (value) {
					if (typeof value == "string" && value.indexOf("-") > -1)		//ignore already formatted values
						return value;
					var date = new Date(parseInt(value, 10));
					value = webMI.sprintf("%d-%02d-%02d %02d:%02d:%02d.%03d", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
					if (format[1] == "s" && value.indexOf(".") > -1)
						value = value.substring(0,value.indexOf("."));
				} else {
					value = "";
				}
			}
			return '<div class="slick-cell-item">'+value+'</div>';
		}

		function findValue(data, path){
			if(typeof data == "undefined")
				return "";
			var cD = JSON.parse(JSON.stringify(data));
			var cP = JSON.parse(JSON.stringify(path));
			var key = cP.shift();
			var retval = cD[key];
			if(cP.length > 0){
				var retval = findValue(cD[key], cP);
			}
			if(typeof retval == "undefined")
				retval = "";
			return retval;
		}


        if (typeof format[0] != "undefined") {
			/* [AT-D-11524] fallback for string in numbers */
			if(format[0] == "number" && !parseInt(value,10) && !parseFloat(value, 10)){
				format = [];
				format[0] = "string"
			}

			switch (format[0]) {
                case "number":
                    var diggest = 0;
                    if (typeof format[1] != "undefined") {
                        diggest = parseInt(format[1], 10);
                    }
                    value = parseFloat(value).toFixed(diggest);
                    if (isNaN(value)) {
                        value = "";
                    }
                    break;
                case "atvise_marker":
					if (value)
						value = '<i class="fas fa-check-square atvise_header_marker_checked"></i>';
					else
						value = '<i class="far fa-square atvise_header_marker"></i>';
					break;
                case "datetime":
					value = _makeConversions(format, value);
					break;
				case "string":
					var search = format[1] ? format[1] : false;
					var path = format[2] ? format[2].split('.') : false;
					for(var p in path)
						if(path[p] == "*" && language)
							path[p] = language;
					if (typeof data[id] != "undefined" && search && path) {
						var text = data[id];
						var replace = findValue(data, path); // data[type1];
						try {
							if(search == "*")
								value = replace;
							else
							value = webMI.sprintf(text, replace, search);
						} catch (err) {
							console.error(id + ": " + text + "\n error: " + err);
						}
					}
                    break;
				case "localized":
					var translateTo = format[1] ? format[1] : language;
					if (data[id]) {
						var text = typeof data[id] === "string" ? data[id] : data[id][translateTo];
						try {
							value = webMI.sprintf(text, data, translateTo);
						} catch (err) {
							console.error(id + ": " + text + "\n error: " + err);
						}
					}
					break;
                default:
                    return value;
            }
            return value;
        } else {
            console.warn("SlickFormatter: Invalid format definition");
            return value;
        }
    }
}
