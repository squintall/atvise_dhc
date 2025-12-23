// Plot line options. More at http://api.highcharts.com/highcharts/xAxis.plotLines
var highChartsMeasuringCursorOptions = {
	id: "", //needs to be set via the options in the constructor of MeasuringCursor.
	color: "#004a80",
	dashStyle: "Dash",
	width: 2,
	value: 0,
	zIndex: 1000,
	mouseDistance: 10,
	touchDistance: 50
};

/**
 * Creates a new measuring cursor. Call the function [show]{@link MeasuringCursor#show} to set the cursor visible.
 * @param {object} optionsPlotLine plot line options object as described at the [highcharts documentation]{@Link http://api.highcharts.com/highcharts/xAxis.plotLines}.
 * **id** must be set and unique for each measuring cursor.
 * @param {object} chart The chart instance on which the measuring cursor is shown.
 * @constructor
 */
function MeasuringCursor(optionsPlotLine, chart) {
	this.plotLine = this._mergeData(highChartsMeasuringCursorOptions, optionsPlotLine);
	this.chart = chart;
	this.isPointerOverMe = false;
	this.isPointerDownOnMe = false;
	this.registeredOnValueChangedCallbacks = [];
	this.isVisible = false;
	this.measuredData = {};

	this.boundFunctions = {};
	this.boundFunctions.moveHandler = this._moveHandler.bind(this);
	this.boundFunctions.downHandler = this._downHandler.bind(this);
	this.boundFunctions.upHandler = this._upHandler.bind(this);
	this.boundFunctions.trendEventHandler = this._trendEventHandler.bind(this);
}

/**
 * Shows the cursors on the chart at the given position. Can be used to move the cursor to a specific position. It uses capture phase to prevent highcharts zoom.
 * @param {number} plotLineValue A value of the x axis at which the cursor should be placed.
 */
MeasuringCursor.prototype.show = function (plotLineValue) {
	if (this.isVisible) {
		this.chart.xAxis[0].removePlotLine(this.plotLine.id);
	}
	this.plotLine.value = plotLineValue;
	//Notify all callback functions about the new plot line value.
	this._handleValueChanges(plotLineValue, true);
	this.chart.xAxis[0].addPlotLine(this.plotLine);
	if (!this.isVisible) {
		//Use capture phase to prevent highcharts zoom.
		this.chart.renderTo.addEventListener("mousemove", this.boundFunctions.moveHandler, true);
		this.chart.renderTo.addEventListener("mousedown", this.boundFunctions.downHandler, true);
		this.chart.renderTo.addEventListener("mouseup", this.boundFunctions.upHandler, true);
		this.chart.renderTo.addEventListener("touchmove", this.boundFunctions.moveHandler, true);
		this.chart.renderTo.addEventListener("touchstart", this.boundFunctions.downHandler, true);
		this.chart.renderTo.addEventListener("touchend", this.boundFunctions.upHandler, true);
		this.chart.renderTo.addEventListener("trendSetVisible", this.boundFunctions.trendEventHandler);
		this.chart.renderTo.addEventListener("trendSeriesUpdate", this.boundFunctions.trendEventHandler);
		this.chart.renderTo.addEventListener("trendSetData", this.boundFunctions.trendEventHandler);
		this.isVisible = true;
	}
};

/**
 * Hides the cursor.
 */
MeasuringCursor.prototype.hide = function () {
	// Remove cursor point
	this._handleValueChanges(null, true);

	if (this.isVisible) {
		this.chart.renderTo.removeEventListener("mousemove", this.boundFunctions.moveHandler, true);
		this.chart.renderTo.removeEventListener("mousedown", this.boundFunctions.downHandler, true);
		this.chart.renderTo.removeEventListener("mouseup", this.boundFunctions.upHandler, true);
		this.chart.renderTo.removeEventListener("touchmove", this.boundFunctions.moveHandler, true);
		this.chart.renderTo.removeEventListener("touchstart", this.boundFunctions.downHandler, true);
		this.chart.renderTo.removeEventListener("touchend", this.boundFunctions.upHandler, true);
		this.chart.renderTo.removeEventListener("trendSetVisible", this.boundFunctions.trendEventHandler);
		this.chart.renderTo.removeEventListener("trendSeriesUpdate", this.boundFunctions.trendEventHandler);
		this.chart.renderTo.removeEventListener("trendSetData", this.boundFunctions.trendEventHandler);
		this.chart.xAxis[0].removePlotLine(this.plotLine.id);
		this.isVisible = false;
	}
};

/**
 * Force firing all _handleValueChanges callbacks
 */
MeasuringCursor.prototype.forceCallbacks = function () {
	this._handleValueChanges(this.plotLine.value, true)
}

/**
 * Callback that is triggered if the measuring cursor measures new values (e.g. if the cursor has been dragged).
 * @param {object} Object Object with *series-ids* as key and the current nearest point object of the highcharts series.
 * @callback onValueChangedCallback
 */

/**
 * Adds a new callback to the "OnValueChanged" event of the measuring cursor. The callback is fired, if the measured value
 * of the measuring cursor changes. If a new callback is registered and the cursor is visible, the callback is also fired
 * with the current measured values of the cursor.
 * @param {onValueChangedCallback} onValueChangedCallback A callback function
 * @returns {number} The callback ID of the registered callback.
 */
MeasuringCursor.prototype.registerOnValueChangedCallback = function (onValueChangedCallback) {
	if (typeof onValueChangedCallback === "function") {
		var arrayLength = this.registeredOnValueChangedCallbacks.push(onValueChangedCallback);
		var callbackId = arrayLength - 1;
		//After registering the callback return the current value via the callback if the measuring cursor is visible.
		if (this.isVisible) {
			this._handleValueChanges(this.plotLine.value, true, callbackId);
		}
		return callbackId;
	} else {
		throw (new Error("The first parameter must be a valid function"));
	}
};

/**
 * Removes an "OnValueChanged" callback.
 * @param {number} callbackId The ID of the callback that should be removed.
 */
MeasuringCursor.prototype.unregisterOnValueChangedCallback = function (callbackId) {
	if (typeof callbackId === "number") {
		//Use delete, because we don't want the array to reindex.
		delete this.registeredOnValueChangedCallbacks[callbackId];
	} else {
		throw (new Error("The first parameter must be the id of the callback."));
	}
};

/**
 * Returns true, if the measuring cursor is visible or false, if not.
 * @returns {boolean} True, if the cursor is visible on the chart. False, if the cursor is hidden or moved to an invisible position of the chart.
 */
MeasuringCursor.prototype.getIsVisible = function () {
	var extremes = this.chart.xAxis[0].getExtremes();
	var currentValue = this.plotLine.value;
	if (extremes) {
		return this.isVisible && currentValue > extremes.min && currentValue < extremes.max;
	} else {
		return false;
	}
};

/**
 * Hides the cursor and deletes all registered callbacks.
 */
MeasuringCursor.prototype.destroy = function () {
	var self = this;
	if (this.isVisible) {
		this.hide();
	}
	delete this.boundFunctions;
	delete this.registeredOnValueChangedCallbacks;
	self = null;
};

/**
 * Handles mouse or touche move events. Changes the mouse cursor and drags the plot line, if mouse or touch is down in the measuring cursor.
 * @param {object} e Event from event handler
 * @private
 */
MeasuringCursor.prototype._moveHandler = function (e) {
	if (this._isEventTriggeredOnChart(e)) {
		e.preventDefault();
		var xAxis = this.chart.xAxis[0];
		var pageX = e.touches ? e.touches[0].pageX : e.pageX;
		var pageY = e.touches ? e.touches[0].pageY : e.pageY;
		var clickTolerance = e.touches ? this.plotLine.touchDistance : this.plotLine.mouseDistance;
		var xPosition = this._getXPosition(pageX, pageY);
		var xValue = xAxis.toValue(xPosition, false);

		this._checkDragTolerance(xPosition, clickTolerance);
		//Drag the plot line on pointer down
		var extremes = xAxis.getExtremes();
		if (this.isPointerDownOnMe && xValue > extremes.min && xValue < extremes.max) {
			xAxis.removePlotLine(this.plotLine.id);
			this.plotLine.value = xValue;
			xAxis.addPlotLine(this.plotLine);
			this._handleValueChanges(this.plotLine.value, false);
			e.stopImmediatePropagation();
		}
	} else {
		this._setMouseCursorStyle('default');
	}
};

/**
 * Handles mouse or touche down events. If the pointer is over the measuring cursor, set *this.isPointerDownOnMe = true*  to allow the [moveHandler]{MeasuringCursor#_moveHandler} to drag this measuring cursor.
 * @param {object} e Event from event handler
 * @private
 */
MeasuringCursor.prototype._downHandler = function (e) {
	if (e.touches) {
		var xAxis = this.chart.xAxis[0];
		var pageX = e.touches ? e.touches[0].pageX : e.pageX;
		var pageY = e.touches ? e.touches[0].pageY : e.pageY;
		var clickTolerance = e.touches ? this.plotLine.touchDistance : this.plotLine.mouseDistance;
		this._checkDragTolerance(this._getXPosition(pageX, pageY), clickTolerance);
	}

	//Prevent that multiple cursors are dragged if they are close together
	if (MeasuringCursor._CurrentMeasuringCursorsDragged === 0) {
		//Btn 0 - left mouse button
		if ((e.touches || e.button === 0) && this.isPointerOverMe) {
			this.isPointerDownOnMe = true;
			MeasuringCursor._CurrentMeasuringCursorsDragged = 1;
			e.stopImmediatePropagation();
		}
	}
};

/**
 * Handles mouse or touche up events and set *this.isPointerDownOnMe = false* to stop at the [moveHandler]{MeasuringCursor#_moveHandler} the dragging this measuring cursor.
 */
MeasuringCursor.prototype._upHandler = function () {
	this.isPointerDownOnMe = false;
	MeasuringCursor._CurrentMeasuringCursorsDragged = 0;
};

/**
 * A callback that is invoked by trendEvents.
 * @listens trendSetVisible
 * @listens trendSetData
 * @listens trendSeriesUpdate
 * @private
 */
MeasuringCursor.prototype._trendEventHandler = function () {
	this._handleValueChanges(this.plotLine.value);
};

/**
 * Handles value changes of the measuring cursor, e.g. if the cursor has been moved. For each series, the nearest point to the plot line {before or after the plot line} is calculated.
 * If any point has changed, the "OnValueChangedCallback" for all registered callbacks is fired.
 * @param {number} plotLineValue The current set value of the plot line.
 * @param {boolean} forceFireCallbacks If true, callbacks are event fired if nothing has changed since the last firing.
 * @param {number} [callbackId] An id of an callback that should be called. If not set, all registered callbacks are called.
 * @private
 */
MeasuringCursor.prototype._handleValueChanges = function (plotLineValue, forceFireCallbacks, callbackId) {
	if (this.registeredOnValueChangedCallbacks.length > 0) {
		var newMeasuredData = {};
		var hasDataChanged = false;

		for (var s = 0; s < this.chart.series.length; s++) {
			var series = this.chart.series[s];
			if (series.xData && series.yData && series.visible) {

				if (plotLineValue) {
					// Find the first point of the series that is bigger than the plot line value.
					var pointAfterPlotLine;
					var i = 0; //index of the first point that is bigger.
					for (i; i < series.xData.length; i++) {
						pointAfterPlotLine = series.xData[i];
						if (pointAfterPlotLine >= plotLineValue) {
							break;
						}
					}

					var pointBeforePlotLine;
					if (i > 0) {
						pointBeforePlotLine = series.xData[i - 1];
						i--;
					}

					// AT-D-11716 >> nearest point is ALWAYS the point before the plot line!
					var nearestPoint = pointBeforePlotLine;

					// Point can be undefined if no data is loaded
					var yPoint = series.yData[i];
					if (nearestPoint !== null && typeof yPoint != "undefined" && yPoint !== null) {
						//Check if this point hasn't been measured before or if it has changed since last measuring.
						if (!this.measuredData[series.options.id] || this.measuredData[series.options.id].x !== nearestPoint || this.measuredData[series.options.id].y !== yPoint) {
							hasDataChanged = true;
							newMeasuredData[series.options.id] = {x: nearestPoint, y: yPoint};
						}
					}

				} else {
					// Remove if no value exists
					newMeasuredData[series.options.id] = {x: null, y: null};
				}
			}
		}

		//Return data via registered callbacks.
		if ((Object.getOwnPropertyNames(newMeasuredData).length > 0) && (hasDataChanged || forceFireCallbacks)) {
			if (callbackId !== undefined && callbackId !== null) {
				this.registeredOnValueChangedCallbacks[callbackId](newMeasuredData);
			} else {
				for (index in this.registeredOnValueChangedCallbacks) {
					if (this.registeredOnValueChangedCallbacks[index]) {
						this.registeredOnValueChangedCallbacks[index](newMeasuredData);
					}
				}
			}
			//Deep copy newMeasuredData to this.measuredData. Can't use JSON.parse(JSON.stringify()) because highcharts points have a circular structure.
			this.measuredData = {};
			for (key in newMeasuredData) {
				this.measuredData[key] = {x: newMeasuredData[key].x, y: newMeasuredData[key].y};
			}
		}
	}
};

/**
 * Calculates the x position relative to the highcharts container.
 * @param {number} pageX Event coordinate x relative to the document.
 * @param {number} pageY Event coordinate y relative to the document.
 * @returns {number} x position relative to the highcharts container.
 * @private
 */
MeasuringCursor.prototype._getXPosition = function (pageX, pageY) {
	var eventCoords = webMI.gfx.scaleEventCoordinates(this.chart.renderTo, pageX, pageY);
	var offsetLeft = webMI.gfx.getAbsoluteOffset("left", true, this.chart.renderTo);
	return eventCoords.x - offsetLeft;
};

/**
 * Checks if the plot line is on a given x position, considering a given tolerance.
 * @param {number} xPosition x position relative to the highcharts container.
 * @param {number} tolerance touch or click tolerance in pixel.
 * @private
 */
MeasuringCursor.prototype._checkDragTolerance = function (xPosition, tolerance) {
	var xAxis = this.chart.xAxis[0];
	var plotLineX = xAxis.toPixels(this.plotLine.value);

	//Show the right cursor on mouse hover
	var clickDistance = Math.abs(plotLineX - xPosition);
	if (clickDistance <= tolerance) {
		this._setMouseCursorStyle("col-resize");
		this.isPointerOverMe = true;
	} else if (clickDistance > tolerance && this.isPointerOverMe) {
		this._setMouseCursorStyle("default");
		this.isPointerOverMe = false;
	}
};

/**
 * Sets the mouse cursor the given mouse cursor style.
 * @param {string} mouseCursorStyle
 * @private
 */
MeasuringCursor.prototype._setMouseCursorStyle = function (mouseCursorStyle) {
	document.getElementsByTagName("BODY")[0].style.cursor = mouseCursorStyle;
};

/**
 * A helper method to merge to objects recursively
 * @param {Object} data The base-object
 * @param {Object} addData The data to add recursively to the base object
 * @private
 */
MeasuringCursor.prototype._mergeData = function (data, addData) {
	var baseData = JSON.parse(JSON.stringify(data));
	for (var p in addData) {
		try {
			// Property in destination object set; update its value.
			if (addData[p].constructor == Object) {
				baseData[p] = mergeData(baseData[p], addData[p]);
			} else {
				baseData[p] = addData[p];
			}
		} catch (e) {
			// Property in destination object not set; create it and set its value.
			baseData[p] = addData[p];
		}
	}
	return baseData;
};

/**
 * Returns true, if the event's target is on the chart (and not an overlay).
 * @param {object} e Event from event handler
 * @returns {boolean} True, if the event's target is on the the chart, and false, if not.
 * @private
 */
MeasuringCursor.prototype._isEventTriggeredOnChart = function (e) {
	var targetElement = e.target;

	if (this.chart.container === targetElement || this.chart.container.contains(targetElement)) {
		return true;
	} else {
		return false;
	}
};

//Private static property indicating the number of current cursors dragged (need to prevent dragging of multiple cursors)
MeasuringCursor._CurrentMeasuringCursorsDragged = 0;
