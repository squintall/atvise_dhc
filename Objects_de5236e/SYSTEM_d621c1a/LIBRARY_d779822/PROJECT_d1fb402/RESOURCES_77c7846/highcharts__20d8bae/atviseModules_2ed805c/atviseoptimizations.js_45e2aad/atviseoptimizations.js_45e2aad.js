/*Fix for highcharts event-coordinates*/
(function (H) {

	Object.defineProperty(H.Chart.prototype, 'pixelWidth', {
		get: function () {
			if (this._scale) {
				return this.clipBox.width * this._scale;
			}

			if (webMI.gfx.getAbsoluteScaleFactor) {
				this._scale = webMI.gfx.getAbsoluteScaleFactor(true, this.container);
				return this.pixelWidth;
			}

			// Scale polyfill
			var currentElement = this.container;
			var scale = currentElement.getBoundingClientRect().width / currentElement.offsetWidth;

			if (currentElement.style.zoom !== undefined) {
				do {
					if (currentElement.style) {
						var elementZoom = parseFloat(currentElement.style.zoom);

						if (!isNaN(elementZoom)) {
							scale *= elementZoom;
						}
					}

					currentElement = currentElement.parentNode;
				} while (currentElement);
			}

			this._scale = scale;

			return this.pixelWidth;
		},
	});


	H.Chart.prototype._setRedrawComplete = function () {
		this._isRedrawComplete = true;
	}


	H.Chart.prototype._setExtremesComplete = function () {
		this._isExtremesComplete = true;
	}


	/**
	 * start handle some loading callbacks
	 */
	H.Chart.prototype.onHistoryLoadingRegister = function (callback) {
		if (!this._onHistoryLoadingCallbacks) {
			this._onHistoryLoadingCallbacks = [];
		}

		this._onHistoryLoadingCallbacks.push(callback);
		return this._onHistoryLoadingCallbacks.length - 1;
	}

	H.Chart.prototype.onHistoryLoadingUnregister = function (id) {
		if (!this._onHistoryLoadingCallbacks)
			return;
		else
			this._onHistoryLoadingCallbacks[id] = null;
	}

	H.Chart.prototype.onHistoryLoading = function () {
		for (var olc in this._onHistoryLoadingCallbacks)
			if (typeof this._onHistoryLoadingCallbacks[olc] === "function")
				this._onHistoryLoadingCallbacks[olc]();
	}

	H.Chart.prototype.onHistoryReadyRegister = function (callback) {
		if (!this._onHistoryReadyCallbacks) {
			this._onHistoryReadyCallbacks = [];
		}

		this._onHistoryReadyCallbacks.push(callback);
		return this._onHistoryReadyCallbacks.length - 1;
	}

	H.Chart.prototype.onHistoryReadyUnregister = function (id) {
		if (!this._onHistoryReadyCallbacks)
			return;
		else
			this._onHistoryReadyCallbacks[id] = null;
	}

	H.Chart.prototype.onHistoryReady = function () {
		for (var olc in this._onHistoryReadyCallbacks)
			if (typeof this._onHistoryReadyCallbacks[olc] === "function")
				this._onHistoryReadyCallbacks[olc]();
	}
	/**
	 * end handle some loading callbacks
	 */


	var axisUpdateTimeout = null;
	H.wrap(H.Axis.prototype, 'update', function (proceed, optionsObj, redraw, timeout) {
		var that = this;
		if (!redraw)
			redraw = true;
		if (!timeout)
			timeout = 1000;

		for (var s in this.chart.series) {
			this.chart.series[s]._lockForOtherFunctions = true;
		}

		if (axisUpdateTimeout)
			clearTimeout(axisUpdateTimeout);

		axisUpdateTimeout = setTimeout(function () {
			try {
				for (var s in that.chart.series) {
					that.chart.series[s]._lockForOtherFunctions = false;
				}
			} catch (ex) {
				// console.error("chart already invalidated");
			}
		}, timeout);

		proceed.apply(this, [optionsObj]);
	});


	H.wrap(H.Pointer.prototype, 'normalize', function (proceed, event, chartPosition) {
		var doc = this.chart.container.ownerDocument;
		var win = doc.defaultView;
		var docElem = doc.documentElement;
		var correctedClientRect = webMI.gfx.getBoundingClientRect(this.chart.container);
		var correctedChartPosition = {
			top: correctedClientRect.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
			left: correctedClientRect.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0),
			scaleX: 1,
			scaleY: 1
		};
		/*Highcharts Pointer.js: check if overriding of the chartPosition is possible (line 125)*/
		var extendedEvent = proceed.call(this, event, correctedChartPosition);
		var scaleFactor = webMI.gfx.getAbsoluteScaleFactor(true, this.chart.container);
		extendedEvent.chartX = Math.round(extendedEvent.chartX / scaleFactor);
		extendedEvent.chartY = Math.round(extendedEvent.chartY / scaleFactor);
		return extendedEvent;
	});

	H.wrap(H.Series.prototype, "update", function (proceed) {
		// Remember series order so we can restore it after making an update, since Highcharts will shuffle them.
		let seriesOrderSnapshot = this.chart.series.map((s) => {
			return s;
		});

		// Now apply the original function with the original arguments,
		// which are sliced off this function's arguments
		proceed.apply(this, Array.prototype.slice.call(arguments, 1));

		// Take the previously taken snapshot and apply it to the Highcharts instance
		seriesOrderSnapshot.forEach((s, index) => {
			this.chart.series[index] = s;
		});
	});


	H.Series.prototype.lockAddPoint = function (lock) {
		this.chart._lockForOtherFunctions = lock;
	}


	H.wrap(H.Series.prototype, 'update', function (proceed, options, redraw, callback, timeout) {
		if (!redraw)
			redraw = false;
		if (!timeout)
			timeout = 1000;
		if (callback)
			setTimeout(callback, timeout);
		proceed.apply(this, [options, redraw]);
	});


	H.wrap(H.Series.prototype, 'addPoint', function (proceed, point, redraw, animate) {
		/* ignore points below min or add point */
		if (this.chart._startWithExtremMin > 0 && this.chart._startWithExtremMin > point[0] && point[0] > 0) {
			/* skip point console.warn(this.chart._startWithExtremMin); */
		} else if (this.lastAddPoint && this.lastAddPoint[0] >= point[0] && this.lastAddPoint[0] != 2145916800000) {
			/* already in */
		} else {
			/* proceed */
			if (!(point.id && point.id.indexOf('NonStopPoint') > 0))
				this.lastAddPoint = point;
			proceed.apply(this, [point, false]);
		}
	});


	H.wrap(H.Series.prototype, 'setData', function (proceed, data) {
		/* declare some nessesary propertys for types */
		var typeDeclaration = {
			line: {hasX: true, hasY: true},
			spline: {hasX: true, hasY: true},
			area: {hasX: true, hasY: true},
			areaspline: {hasX: true, hasY: true},
			column: {hasX: false, hasY: true},
			bar: {hasX: false, hasY: true},
			pie: {hasX: false, hasY: true},
			scatter: {hasX: true, hasY: true},
			gauge: {hasX: false, hasY: true},
			solidgauge: {hasX: false, hasY: true},
			arearange: {hasX: true, hasY: true},
			areasplinerange: {hasX: true, hasY: true},
			// columnrange: !highcharts defines data to be array!
		}

		/* remove wrong points */
		var cleanArray = [];
		for (var key in data) {
			var records = data[key];

			try {
				if (Array.isArray(records)) {
					cleanArray.push(records);
				} else if (records && typeof records === "object") {
					var type = "type" in this.userOptions ? this.userOptions.type : this.chart.userOptions.chart.type;
					var declaration = typeDeclaration[type];

					var hasX = true;
					var hasY = true;

					if (declaration) {
						if (declaration.hasX && !("x" in records))
							hasX = false;
						if (declaration.hasY && !("y" in records))
							hasY = false;
					}

					if ((hasX && hasY) || (!hasX && !hasY)) {
						cleanArray.push(records);
					}
				} else if (typeof records === "number") {
					cleanArray.push(records);
				}
			} catch (ex) {
				console.error(ex, records, key)
			}
		}

		data = cleanArray;

		this.lastAddPoint = undefined;
		if (typeof this.chart._lockForSetData == "undefined") {
			this.chart._lockForSetData = [];
		}

		/* lock live point stack */
		this.chart._lockForSetData[this.options.id] = true;

		/* remove old live points from stack */
		if(this.chart._addLivePointStack && this.options.id in this.chart._addLivePointStack)
			this.chart._addLivePointStack[this.options.id] = [];

		this.watchDataReady();

		/* AT-D-14176 done by trendcontroll
		if (typeof this.xAxis != "undefined" && this.xAxis.getExtremes().min)
			if (this.xAxis.getExtremes().min)
				this.chart._startWithExtremMin = this.xAxis.getExtremes().min - 5000;
		*/
		proceed.apply(this, Array.prototype.slice.call(arguments, 1));
	});


	H.Series.prototype.watchDataReady = function () {
		var that = this;
		this.setDataSize = -1;

		var checkLockInterval = 100;
		if (!that.forceUnlock)
			that.forceUnlock = 1000;

		if (!this.chart._watchDataReadyStack)
			this.chart._watchDataReadyStack = [];

		if (this.options.id) {
			var watchDataReadyID = setInterval(function () {
				try {
					var currentSize = that.data ? that.data.length : null;
					if (that.setDataSize == currentSize) {
						that.chart._lockForSetData[that.options.id] = false;
					} else if (that.data == 0 && that.forceUnlock <= 0) {
						that.chart._lockForSetData[that.options.id] = false;
					} else if (that.data) {
						that.forceUnlock = that.forceUnlock - checkLockInterval;
					}
					if (currentSize != null)
						that.setDataSize = currentSize;
				} catch (ex) {
					clearInterval(watchDataReadyID);
				}
			}, checkLockInterval);
			this.chart._watchDataReadyStack.push([this.options.id, watchDataReadyID]);
		}
	}

	/**
	 * Reorders the points and data arrays after point generation because there might be
	 * index gaps due to frequent timeline updates which caused an uncaught exception.
	 * [AT-D-13612]
	 */
	H.Series.prototype.cleanUpIndices = function cleanUpIndices() {
		const lineSeries = this;
		const pointsCopy = [];
		const dataCopy = [];
		let indicesMissing = false;1

		for (let i = 0; i < lineSeries.points.length; ++i) {
			if (!lineSeries.points[i]) {
				indicesMissing = true;
			}
		}

		if (indicesMissing) {
			for (let i = 0; i < lineSeries.points.length; ++i) {
				if (lineSeries.points[i]) {
					// Highcharts needs the index for internal management.
					lineSeries.points[i].index = i;

					pointsCopy.push(lineSeries.points[i]);
					dataCopy.push(lineSeries.data[i]);
				}
			}

			lineSeries.points = pointsCopy;
			lineSeries.data = dataCopy;
		}
	};

	H.Series.prototype.addLivePoint = function (pointArray, arg2, arg3, highPoint) {
		var that = this;

		/* --------------------------------------------------------------------- */
		/* Return if chart not available                                         */
		if(!this.chart)
			return;

		/* --------------------------------------------------------------------- */
		/* Create stack and add valid points to stack                            */
		if (!this.chart._addLivePointStack)
			this.chart._addLivePointStack = {};

		if (!this.chart._addLivePointStack[this.options.id])
			this.chart._addLivePointStack[this.options.id] = [];

		if (pointArray && pointArray.length > 0)
			this.chart._addLivePointStack[this.options.id].push([pointArray, arg2, arg3]);

		/* --------------------------------------------------------------------- */
		/* Initialization of further necessary variables for live point handling */
		if (typeof this.chart._lockForSetData == "undefined") {
			this.chart._lockForSetData = [];
		}

		if (typeof this.chart._lockForSetData[this.options.id] == "undefined") {
			this.chart._lockForSetData[this.options.id] = true;
		}

		if (typeof this.chart._lockForOtherFunctions == "undefined") {
			this.chart._lockForOtherFunctions = false;
		}

		if (false && highPoint)
			this.chart._lockForSetData[this.options.id] = false;

		/* --------------------------------------------------------------------- */
		/* Add nonstop values â€‹â€‹and continue                                       */
		var checkID = pointArray.id;
		if (checkID) {
			if (checkID.indexOf('NonStopPoint') !== -1) {
				this.addPoint(pointArray, arg2, arg3);
				return;
			}
		}

		/* --------------------------------------------------------------------- */
		/* Check whether the historical reading of data is finished              */
		if (!this.chart._lockForSetData[this.options.id] && this.chart._watchDataReadyStack.length) {
			for (var s in this.chart._watchDataReadyStack) {
				var tOut = this.chart._watchDataReadyStack[s];
				if (tOut[0] == this.options.id) {
					clearInterval(tOut[1]);
					delete this.chart._watchDataReadyStack[s];
				}
			}
		}

		/* --------------------------------------------------------------------- */
		/* Check whether termination conditions exist                            */
		var data;
		var mode = this.chart.options.atviseOptions.mode;
		var isHistoryDataReady = !this.chart._lockForSetData[this.options.id] && !this.chart._lockForOtherFunctions;
		var isLiveDataReady = true;

		var isAddDataReady =
			mode == "live" ? isLiveDataReady :
				mode == "mixed" ? isHistoryDataReady && isLiveDataReady :
					mode == "history" ? isHistoryDataReady : false;

		var isConfigurationInactive = !this.chart._lockForConfiguration;
		var isRedrawComplete = this.chart._isRedrawComplete;

		/* --------------------------------------------------------------------- */
		/* slow down add point if configuration is open                          */
		if (typeof this.chart._configurationBypass == "undefined") {
			this.chart._configurationBypass = [];
		}

		var currentTime = Date.now();
		if (typeof this.chart._configurationBypass[this.options.id] == "undefined") {
			this.chart._configurationBypass[this.options.id] = currentTime;
		}

		if (!isConfigurationInactive) {
			var currentRenderTiming = this.chart.timespan / this.chart.pixelWidth > 5000 ? 20000 : this.chart.timespan / this.chart.pixelWidth * 4;
			if(currentTime - this.chart._configurationBypass[this.options.id] > currentRenderTiming) {
				isConfigurationInactive = true;
				this.chart._configurationBypass[this.options.id] = currentTime;
			}
		}

		/* --------------------------------------------------------------------- */
		/* insert points if condition met                                        */
		while (this.chart._addLivePointStack[this.options.id].length > 0 && isAddDataReady && isConfigurationInactive && this.chart._isRedrawComplete) {
			data = this.chart._addLivePointStack[this.options.id].shift();

			var oLastPoint = 0;
			var isCache = typeof this.chart._originalDataCache != "undefined";
			var isEmpty = isCache ? typeof this.chart._originalDataCache[this.options.id] == "undefined" : true;
			var isLength = !isEmpty ? this.chart._originalDataCache[this.options.id].length : false;

			if (isCache && !isEmpty && isLength > 0) {
				oLastPoint = this.chart._originalDataCache[this.options.id][this.chart._originalDataCache[this.options.id].length - 1];
				oLastPoint = oLastPoint ? oLastPoint[0] : 0;
			}

			if (oLastPoint < data[0][0]) {
				this.addPoint(data[0], false);
			}
		}
	}

	if (!Date.now) {
		Date.now = function () {
			return new Date().getTime();
		}
	}

	var utils = {};
	var lastErrorTimestamp = {};

	H.error = function (code, stop, chart) {

		if (typeof lastErrorTimestamp[code] == "undefined" || Date.now() - lastErrorTimestamp[code] > 2500) {
			lastErrorTimestamp[code] = Date.now();
			reportNotification = function () {
				var chartInstance = chart ? chart : Highcharts.charts[Highcharts.hoverChartIndex];
				if (chartInstance) {
					if (typeof utils[chartInstance] == "undefined") {
						utils[chartInstance] = new Utils(chartInstance);
					}
					utils[chartInstance].reportNotification(code, "", true);
				}
			}
			var msg = H.isNumber(code) ?
				'Highcharts error #' + code + ': www.highcharts.com/errors/' +
				code : code,
				defaultHandler = function () {
					reportNotification();
					if (stop) {
						throw new Error(msg);
					}

				};

			if (chart) {
				H.fireEvent(
					chart, 'displayError', {code: code, message: msg}, defaultHandler
				);
			} else {
				defaultHandler();
			}
		}
	};


	H.getStyle = function (el, prop, toInt) {

		var style;

		// For width and height, return the actual inner pixel size (#4913)
		if (prop === 'width') {

			function checkForTransform(element, hasTransform) {
				if (hasTransform == undefined) hasTransform = false;
				if (!element || element.tagName === 'BODY' || hasTransform === true) return hasTransform;
				if (H.getStyle(element, 'transform', false) !== 'none') hasTransform = true;
				checkForTransform(element.parentNode);
			}

			return Math.max(
				0, // #8377
				(
					Math.min(
						el.offsetWidth,
						el.scrollWidth,
						(
							el.getBoundingClientRect &&
							// #9871, getBoundingClientRect doesn't handle
							// transforms, so avoid that
							checkForTransform(el) === true
						) ?
							Math.floor(el.getBoundingClientRect().width) : // #6427
							Infinity
					) -
					H.getStyle(el, 'padding-left') -
					H.getStyle(el, 'padding-right')
				)
			);
		}

		if (prop === 'height') {
			return Math.max(
				0, // #8377
				Math.min(el.offsetHeight, el.scrollHeight) -
				H.getStyle(el, 'padding-top') -
				H.getStyle(el, 'padding-bottom')
			);
		}

		if (!H.win.getComputedStyle) {
			// SVG not supported, forgot to load oldie.js?
			H.error(27, true);
		}

		// Otherwise, get the computed style
		style = H.win.getComputedStyle(el, undefined);
		if (style) {
			style = style.getPropertyValue(prop);
			if (H.pick(toInt, prop !== 'opacity')) {
				style = H.pInt(style);
			}
		}
		return style;
	};

}(Highcharts));