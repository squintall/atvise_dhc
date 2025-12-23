/**
 * This class provides data handling for different types of series.
 * @constructor
 */
function DataHandler() {
	//Map chart name to data handling function
	this.seriesTypes = {
		"line": this._simpleDataHandling,
		"spline": this._simpleDataHandling,
		"area": this._simpleDataHandling,
		"areaspline": this._simpleDataHandling,
		"arearange": this._rangeDataHandling.bind(this),
		"areasplinerange": this._rangeDataHandling.bind(this),
		"column": this._simpleDataHandling/*,
		"columnrange": this._rangeDataHandling.bind(this),
		"pie: this._pieDataHandling*/

	};

	//Puffer for range data handling
	this.rangeData = {};
}

/**
 * Data handling for chart types like ["line"]{@Link https://www.highcharts.com/demo/line-basic}, "area", "spline", "splinearea" and "column".
 * Because the data is already in a usable form for highcharts, no processing or calculation is done.
 * @param {number[]} dataElement An array representing a point: [x, y]
 * @returns {number[]} An array representing a point in a [highcharts series]{@Link https://www.highcharts.com/docs/chart-concepts/series}: [x, y]
 * @private
 */
DataHandler.prototype._simpleDataHandling = function (dataElement) {
	if(typeof dataElement.y === "boolean") {
		dataElement.y = dataElement.y ? 1 : 0;
		if(typeof dataElement.low === "boolean") {
			dataElement.low = dataElement.low ? 1 : 0;
		}
		if(typeof dataElement.high === "boolean") {
			dataElement.high = dataElement.high ? 1 : 0;
		}
	} else if(typeof dataElement[1] === "boolean") {
		dataElement[1] = dataElement[1] ? 1 : 0;
		if(typeof dataElement[2] === "boolean") {
			dataElement[2] = dataElement[2] ? 1 : 0;
		}
	}
		
	return dataElement;
};

/**
 * Data handling for chart types like ["arearange"]{@Link https://www.highcharts.com/demo/arearange}, "areasplinerange" and "columnrange".
 * The rangeDataHandling function will match two points with equal x value. Non matched points will be saved an a puffer array.
 * <br>**Example:** If you call this function with data element [1, 2] for the series "series-1", and no data with x value 1 is found in the puffer array,
 * the data element will be stored in the buffer array and *undefined* is returned.
 * <br> If you call this function after that with [1, 4] for the series "series-1--high-value", the array [1, 2, 4] will be returned and the data will be removed from the puffer array.
 * @param {number[]} dataElement An array representing a point: [x, y]
 * @param dataKey {string} Data key for the current handled series. Keys for the "high" value must end if with "--high-value".
 * @param {number} [maxRangeDataSize = 100] Maximum size of elements stored in the rangeData array. If more than maxRangeDataSize
 * elements are in the array, the oldest ones will be removed.
 * @returns {?number[]} An array representing a point for a [highcharts range series]{@Link https://www.highcharts.com/docs/chart-and-series-types/range-series}: [x, low, high]
 * @private
 */
DataHandler.prototype._rangeDataHandling = function (dataElement, dataKey, maxRangeDataSize) {
	if (!maxRangeDataSize) {
		maxRangeDataSize = 100;
	}
	var isUpperValue = dataKey.indexOf("--high-value") > -1;
	dataKey = dataKey.replace("--high-value", "");
	var pointArray;
	if (!this.rangeData[dataKey]) {
		this.rangeData[dataKey] = {};
	}
	if (!this.rangeData[dataKey][dataElement[0]]) {
		this.rangeData[dataKey][dataElement[0]] = {};
		if (isUpperValue) {
			this.rangeData[dataKey][dataElement[0]].high = dataElement[1];
		} else {
			this.rangeData[dataKey][dataElement[0]].low = dataElement[1];
		}
		//Remove first object of range data if more than maxRangeDataSize (default: 100) values are in range data,
		//because it is very unlikely that a matching upper or lower value will arrive.
		if (Object.keys(this.rangeData[dataKey]).length > maxRangeDataSize) {
			for (key in this.rangeData[dataKey]) {
				delete this.rangeData[dataKey][key];
				break;
			}
		}
		return undefined;
	} else {
		if (this.rangeData[dataKey][dataElement[0]].high !== undefined && !isUpperValue) {
			pointArray = [dataElement[0], dataElement[1], this.rangeData[dataKey][dataElement[0]].high];
			delete this.rangeData[dataKey][dataElement[0]];
		} else if (this.rangeData[dataKey][dataElement[0]].low !== undefined && isUpperValue) {
			pointArray = [dataElement[0], this.rangeData[dataKey][dataElement[0]].low, dataElement[1]];
			delete this.rangeData[dataKey][dataElement[0]];
		}
		return pointArray;
	}
};

/**
 * Transforms an data from an array [x,y] to an array representing a point of a highcharts series like [x,y] or [x, low, high], according to the given series type.
 * @param {number[]} dataElement An array representing a point: [x, y]
 * @param seriesType {string} Type of the series like ["line"]{@Link https://www.highcharts.com/demo/line-basic} or ["arearange"]{@Link https://www.highcharts.com/demo/arearange}.
 * @param seriesId {string} Series id for the current handled series. Series Ids for the "high" value must end if with "--high-value".
 * @param {number} [maxRangeDataSize] Maximum size of elements stored in the rangeData array. If more than maxRangeDataSize
 * elements are in the array, the oldest ones will be removed. Used only on [highcharts range series]{@Link https://www.highcharts.com/docs/chart-and-series-types/range-series}.
 * @returns {?number[]} An array representing a point for a highcharts series.
 */
DataHandler.prototype.getPoint = function (dataElement, seriesType, seriesId, maxRangeDataSize) {
	if (this.hasSupportedSeriesType(seriesType)) {
		return this.seriesTypes[seriesType](dataElement, seriesId, maxRangeDataSize);
	} else {
		throw new Error("Series type not set or supported. Series type: " + seriesType);
	}
};

/**
 * Transforms an data from an array [[x,y], [x,y], ...] to an array representing the data of a highcharts series like [[x,y], [x,y], ...] or [[x,low, high], [x,low, high], ...],
 * according to the given series type.
 * @param {number[][]} dataArray An data array like [[x,y], [x,y], ...]
 * @param seriesType {string} Type of the series like ["line"]{@Link https://www.highcharts.com/demo/line-basic} or ["arearange"]{@Link https://www.highcharts.com/demo/arearange}.
 * @param dataKey {string} Data key for the current handled series. Keys for the "high" value must end if with "--high-value".
 * @returns {number[][]} An array representing the data for a highcharts series.
 */
DataHandler.prototype.getData = function (dataArray, seriesType, dataKey) {
	var pointArray = [];
	if (this.hasSupportedSeriesType(seriesType)) {
		//Clear range data buffer
		if (this.rangeData[dataKey]) {
			this.rangeData[dataKey] = {};
		}
		for (i = 0; i < dataArray.length; i++) {
			var point = this.getPoint(dataArray[i], seriesType, dataKey, dataArray.length);
			if (point) {
				pointArray.push(point);
			}
		}

		pointArray.sort(function(a,b) {
			return a["0"] - b["0"];
		});

		return pointArray;
	} else {
		throw new Error("Series type not set or supported. Series type: " + seriesType);
	}
};

/**
 * Checks whether a given series type is supported by the data handler.
 * @param seriesType {string} Type of the series like ["line"]{@Link https://www.highcharts.com/demo/line-basic} or ["arearange"]{@Link https://www.highcharts.com/demo/arearange}.
 * @returns {boolean} True, if series type is supported by the data handler. False otherwise.
 */
DataHandler.prototype.hasSupportedSeriesType = function (seriesType) {
	return this.seriesTypes.hasOwnProperty(seriesType);
};
