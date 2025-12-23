/**
 * Creates a new renderer for a given chart. The renderer is responsible for data loading, live data rendering, the moving animation, non stop points and creating and controlling the measuring cursors.
 * @param {object} chart A highcharts chart
 * @param {onErrorCallback} onErrorCallback Callback function that is called if an error occurs.
 * @see {@link TrendControl.onErrorCallback}
 * @constructor
 */
function Renderer(chart, onErrorCallback) {
	var historyIsLoading = false; // << changed by trendcontrol

	this.onErrorCallback = onErrorCallback;
	this.chart = chart;
	this.dataHandler = new DataHandler();
	this.nodeMap = {};
	this.cursor1 = new MeasuringCursor({id: "measuringCursor1", dashStyle: "ShortDashDot"}, chart);
	this.cursor2 = new MeasuringCursor({id: "measuringCursor2", dashStyle: "ShortDashDotDot"}, chart);
	this.continueRender = false;
	this.pauseRenderer = false;

	if (chart.options.atviseOptions) {
		if (
			!chart.options.atviseOptions.source ||
			Datasource.getDatasourceTypes().indexOf(chart.options.atviseOptions.source) === -1
		) {
			this.onErrorCallback(30106, chart.options.atviseOptions.source);
		}

		var sourceOptions = {};
		if (chart.options.atviseOptions.sourceOptions) {
			sourceOptions = chart.options.atviseOptions.sourceOptions;
		}

		this.dataSource = new Datasource({
			type: chart.options.atviseOptions.source,
			nodes: {},
			option: sourceOptions
		});
	}

	this.boundFunctions = {};
	this.boundFunctions.selectionHandler = this._selectionHandler.bind(this);
	this.chart.renderTo.ownerDocument.defaultView["Highcharts"].addEvent(
		this.chart,
		"selection",
		this.boundFunctions.selectionHandler
	);
	this.zoomExtremes = null;
	this.zoomMaxOffset = 0;
	this.zoomMinOffset = 0;

	if (typeof chart._redrawInterval == "undefined") chart._redrawInterval = {};
	chart._redrawInterval[chart.index] = null;

	if (!chart._tickInterval) chart._tickInterval = {};
	chart._tickInterval[chart.index] = null;

	if (!chart._tick) chart._tick = {};
	chart._tick[chart.index] = null;

	if (!chart._interval) chart._interval = {};
	chart._interval[chart.index] = null;

	this.maxTimeLimit = 2145916800000; // 2145916800000 = 01/01/2038 or 18 days before a 32bit processor reach the unix timestamp limit!
}

function filterOutAggregateSeries(dataSourceOptions) {
	var newDataSourceOptions = JSON.parse(JSON.stringify(dataSourceOptions));

	for (var property in dataSourceOptions.aggregateOptions) {
		var value = dataSourceOptions.aggregateOptions[property];

		function isAggregate(value) {
			if (typeof value == "undefined") return false;

			if (typeof value.aggregate == "undefined" || value.aggregate == "" || value.aggregate == "Sampled") return false;

			if (typeof value.interval == "undefined" || value.interval == "") return false;

			var validUnits = ["s", "m", "h", "d", "M"];
			if (typeof value.unit == "undefined" || validUnits.indexOf(value.unit) == -1) return false;

			return true;
		}

		if (isAggregate(value)) {
			delete newDataSourceOptions.nodes[property];
			delete newDataSourceOptions.aggregateOptions[property];
		}
	}

	return dataSourceOptions;
}

/**
 * Starts the continuous rendering. Subscribes all addresses on *chart.series[i].options.address* and *chart.series[i].options.address2* (address2 = high value for range chart types)
 * and starts a moving animation. Never call runContinuousRendering, if the moving animation is already running. Use [updateContinuousRendering ]{@link Renderer#updateContinuousRendering}
 * to subscribe / unsubscribe new addresses and [stopContinuousRendering]{@link Renderer#stopContinuousRendering} to stop the continuous rendering.
 * @returns {object} Is returned only if the series contains an aggregate. In this case the chart should not display live data.
 */
Renderer.prototype.runContinuousRendering = function () {
	this.continueRender = true;

	if (isNaN(this.chart.xAxis[0].options.timeSpan) || isNaN(this.chart.xAxis[0].options.timeSpanUnit)) {
		this.onErrorCallback(20105);
		return;
	}

	var self = this;
	var dataSourceOptions = self._getDataSourceOptions(self.chart.series);
	self.dataSource.updateNodes(filterOutAggregateSeries(dataSourceOptions));

	// Init size of viewport
	updateExtremes();

	// Subscribe and add new data
	self.dataSource.subscribe(subscribeCallback);

	// Init rendering 4 first point
	self.chart._isRedrawComplete = true;

	// Init autoscale
	if (typeof self.chart._isAutoscale == "undefined") {
		self.chart._isAutoscale = {};

		for (var s in self.chart.series) {
			self.chart._isAutoscale[s] = {
				min: !(
					typeof self.chart.series[s].yAxis.userOptions.min == "undefined" ||
					self.chart.series[s].yAxis.userOptions.min == null ||
					!self.chart.series[s].yAxis.options.autoscale
				),
				dataMin: null,
				max: !(
					typeof self.chart.series[s].yAxis.userOptions.max == "undefined" ||
					self.chart.series[s].yAxis.userOptions.max == null ||
					!self.chart.series[s].yAxis.options.autoscale
				),
				dataMax: null
			};
		}
	}

	// Setup animation
	var now = 0;
	var then = Date.now() + self.dataSource.getServerTimeOffset();
	var rendered = false;
	var delta;
	var deltacache = [0, 0 , 0 , 0, 0];
	var lastStep = 0;
	var waiting = false;
	var lastRenderInterval = 0;
	var framerate = self.chart.options.atviseOptions.liveModeFrameRate;
	var throttleInterval = 1000 / framerate;
	var lastUpdateExtremes = 0;

	if (framerate > 1000) {
		self.onErrorCallback(30006, (1 / framerate) * 1000 + " ms");
	}

	// Start animation
	self.chart._interval[self.chart.index] = 1000 / framerate;
	self.chart._tick[self.chart.index] = null;
	self.chart.currentAnimationFrame = window.requestAnimationFrame(renderAnimation);

	/**
	 * Callback subscription
	 * @param dataSourceErrors
	 * @param data
	 */
	function subscribeCallback(dataSourceErrors, data) {
		if (dataSourceErrors) {
			// Handling as verified as correct due to analysis over the course of issue AT-D-11899
			if (dataSourceErrors.message) {
				self.onErrorCallback(20103, dataSourceErrors.message);
				// Former handling: Kept because not known if usable and correct for some other occurrences
			} else {
				for (var key in dataSourceErrors) {
					self.onErrorCallback(20103, dataSourceErrors[key].message);
				}
			}
		}

		for (var dataKey in data) {
			var series = self._getSeries(dataKey);
			if (series) {
				var points = [];
				for (var i = 0; i < data[dataKey].length; i++) {
					var p = self.dataHandler.getPoint(data[dataKey][i], series.options.type, dataKey);
					if (p) {
						points.push(p);
					}
				}

				self.updateInProgress = true;

				var pointLength = points.length;
				if (pointLength > 0) {
					//Remove the right non stop point, than add the new point and then add the left non stop point. This order is important,
					//because highcharts needs sorted data. Otherwise the right non stop point would'nt be the last element of the data array.
					self._removeRightNonStopPoint(series);

					var pointArray = null;
					for (var i = 0; i < pointLength; i++) {
						var drawPoint = i + 1 == pointLength;
						pointArray = points[i];
						if (pointArray) {
							// && series.points) {

							// Make sure area types have 3 dimensions !!!
							if (self._isRangeSeries(series.type) && pointArray.length < 3)
								continue;


							// Add values new in timeline -> newer x than last point
							if (
								typeof series.points == "undefined" ||
								typeof series.points.length == "undefined" ||
								series.points.length == 0 ||
								pointArray[0] > series.points[series.points.length - 1].x
							) {
								series.addLivePoint(pointArray, drawPoint, false);
							} else {
								function binarySearchInSeriesPoints(searchValue, bottomIndex, topIndex) {
									var midIndex = Math.floor((topIndex - bottomIndex) / 2 + bottomIndex);
									if (!series.points[midIndex]) return -1;

									if (series.points[midIndex].x === searchValue) {
										// match
										return midIndex;
									} else if (series.points[midIndex].x < searchValue && topIndex - bottomIndex > 0) {
										// x lower
										return binarySearchInSeriesPoints(searchValue, midIndex + 1, topIndex);
									} else if (series.points[midIndex].x > searchValue && topIndex - bottomIndex > 0) {
										// x higher
										return binarySearchInSeriesPoints(searchValue, 0, midIndex);
									} else {
										return -1;
									}
								}

								var foundPointIndex = -1;
								if (series && !series.isSeriesBoosting && !series.chart.isBoosting) {
									foundPointIndex = binarySearchInSeriesPoints(pointArray[0], 0, series.points.length - 1);
								}

								// If there is old point having same x value as new point -> update
								if (foundPointIndex > -1 && series.chart && !series._historyLoading) {
									series.points[foundPointIndex].update(pointArray);
									if (typeof series._markPointForCleanUpInOriginalData == "function")
										series._markPointForCleanUpInOriginalData(pointArray);
								} else {
									// else -> add
									series.addLivePoint(pointArray, drawPoint, false);
								}
							}
						}
					}

					// Reset pointArray if more than one point available
					if (pointLength != 1) {
						pointArray = null;
					}

					function applyNonStopPoints(series, points, pointArray) {
						if (series._historyLoading == true) {
							setTimeout(function waitForHistoryLoading() {
								applyNonStopPoints(series, points, pointArray);
							}, 100);
							return;
						}

						self._addOrRemoveLeftNonStopPoint(series, pointArray);

						var pointLength = points.length;
						if (pointLength > 0) {
							var point = {
								x: -1,
								y: points[pointLength - 1][1],
								low: points[pointLength - 1][1],
								high: points[pointLength - 1].length > 2 ? points[pointLength - 1][2] : undefined
							};
							self._addRightNonStopPoint(series, point);
						}
					}

					applyNonStopPoints(series, points, pointArray);
				}
			}
		}
	}

	/**
	 * Set min and max of highcharts to move the chart
	 * Note: AT-D-14839 handles fps limitation due boost performance
	 */
	function renderAnimation() {
		if (!self.continueRender) {
			window.cancelAnimationFrame(self.chart.currentAnimationFrame);
			return;
		}

		now = Date.now() + self.dataSource.getServerTimeOffset();
		delta = now - then;
		then = now;
		
		/* dynamic throttling of extremes update  */
		if (rendered) {
			function numSort(a, b) {
				return (a - b);
			}

			deltacache.push(now - lastStep);
			if (deltacache.length > 10)
				deltacache.shift();
	
			var maxDelta = [];
			for (var i in deltacache)
				maxDelta[i] = deltacache[i];

			maxDelta.sort(numSort);
			maxDelta = maxDelta[deltacache.length - 5];
			var poor = self.chart._interval[self.chart.index] < (maxDelta - 50) ? true : false
			
			if (poor) {
				throttleInterval = maxDelta;
				throttleInterval = parseInt(throttleInterval > 10000 ? 10000 : throttleInterval);
				if (Math.min(...deltacache) > 4*self.chart._interval[self.chart.index])
					console.warn("Highcharts: Performance poor. Configured refresh rate cannot be achieved. Actual rate is: " + throttleInterval + " ms" );		
			} else {
				throttleInterval = self.chart._interval[self.chart.index];
			}
		}

		/* handle updates */
		if(now - lastStep > throttleInterval - Math.min(throttleInterval/100*25,100)) {
			rendered = true;		
			lastStep = now;
			
			updateExtremes();
			if (throttleInterval > lastRenderInterval*1.2 || throttleInterval < lastRenderInterval*0.8) {
				lastRenderInterval = throttleInterval;
				setRenderInterval(throttleInterval);
			}
		} else {
			rendered = false;
		}

		/* request next animation frame after dynamic delay */
		if (typeof self.chart._redrawInterval != "undefined") {
			if (self.chart._interval[self.chart.index]) {
				if (waiting)
					return;
					
				waiting = true;
				var int = self.chart._interval[self.chart.index];
				var delay = int - Math.min(int/100*10,100);
					
				if ((throttleInterval/4) > delay)
					delay = throttleInterval/4
				
				setTimeout(function() {
					waiting = false;
					self.chart.currentAnimationFrame = window.requestAnimationFrame(renderAnimation);
				}, delay)
			} else {
				self.chart.currentAnimationFrame = window.requestAnimationFrame(renderAnimation);
			}
		}
	}

	/**
	 * rendering interval depending on available draw aerea
	 */
	function setRenderInterval(renderTime) {
		let index = self.chart.index;

		if(!self.chart._redrawInterval)
			self.chart._redrawInterval = {};

		if(index in self.chart._redrawInterval) {
			clearInterval(self.chart._redrawInterval[index]);
			self.chart._redrawInterval[index] = null;
		}

		self.chart._redrawInterval[index] = setInterval(rendererRedraw, renderTime)
	}

	/**
	 * simple redraw if rendering complete
	 */
	function rendererRedraw() {
		if (self.chart._isRedrawComplete) {
			self.chart._isRedrawComplete = false;

			/* eval series for min/max changes in yAxis */
			for (var s in self.chart.series) {
				var cartMin;
				var cartMax;
				var dataMin;
				var dataMax;
				var skipMinMix = true;

				if (!self.chart._isAutoscale[s]) {
					self.chart._isAutoscale[s] = {
						min: !(
							typeof self.chart.series[s].yAxis.userOptions.min == "undefined" ||
							self.chart.series[s].yAxis.userOptions.min == null ||
							self.chart.series[s].yAxis.options.autoscale
						),
						dataMin: null,
						max: !(
							typeof self.chart.series[s].yAxis.userOptions.max == "undefined" ||
							self.chart.series[s].yAxis.userOptions.max == null ||
							self.chart.series[s].yAxis.options.autoscale
						),
						dataMax: null
					};
				}

				if (self.chart.series[s].yAxis.options.autoscale) {
					if (!self.chart._isAutoscale[s].min || self.chart._isAutoscale[s].min > self.chart.series[s].yAxis.dataMin) {
						cartMin = self.chart.series[s].yAxis.dataMin;
						dataMin = self.chart._isAutoscale[s].dataMin;

						if (cartMin != null && dataMin == null) {
							dataMin = cartMin;
							self.chart._isAutoscale[s].dataMin = cartMin;
							skipMinMix = false;
						} else if (cartMin != null && cartMin != dataMin) {
							dataMin = cartMin;
							self.chart._isAutoscale[s].dataMin = cartMin;
							skipMinMix = false;
						} else if (dataMin == null) {
							dataMin = 0;
							self.chart._isAutoscale[s].dataMin = 0;
							skipMinMix = false;
						}
					}

					if (!self.chart._isAutoscale[s].max || self.chart._isAutoscale[s].max < self.chart.series[s].yAxis.dataMax) {
						cartMax = self.chart.series[s].yAxis.dataMax;
						dataMax = self.chart._isAutoscale[s].dataMax;

						if (cartMax != null && dataMax == null) {
							dataMax = cartMax;
							self.chart._isAutoscale[s].dataMax = cartMax;
							skipMinMix = false;
						} else if (cartMax != null && cartMax != dataMax) {
							dataMax = cartMax;
							self.chart._isAutoscale[s].dataMax = cartMax;
							skipMinMix = false;
						} else if (dataMax == null) {
							dataMax = 0;
							self.chart._isAutoscale[s].dataMax = 0;
							skipMinMix = false;
						}
					}

					if (cartMin == cartMax && dataMin == dataMax) {
						self.chart.series[s].yAxis.setExtremes(dataMin, dataMin + 1);
					}
				}

				if (!skipMinMix && !self.chart._setZoomed) {
					if (!isNaN(dataMin) && dataMin != null && !isNaN(dataMax) && dataMax != null) {
						self.chart.series[s].yAxis.userOptions.min = dataMin;
						self.chart.series[s].yAxis.userOptions.max = dataMax;
						self.chart.series[s].yAxis.setExtremes(dataMin, dataMax);
					}
				}
			}

			self.chart.redraw();
		}
	}

	/**
	 * update min max extremes
	 */
	function updateExtremes() {
		if (typeof self.chart.xAxis != "undefined" && self.chart.xAxis.length > 0) {
			var until = new Date().valueOf() + self.dataSource.getServerTimeOffset();
			var from = until - self.chart.xAxis[0].options.timeSpan * self.chart.xAxis[0].options.timeSpanUnit * 1000;

			var zoomExtremes = self.zoomExtremes !== null && self.zoomExtremes.length > 0;

			if (self.zoomReset) {
				self.zoomReset = false;
				self.zoomMaxOffset = 0;
				self.zoomMinOffset = 0;
				self.zoomExtremes = null;
			} else if (zoomExtremes && self.zoomExtremes[0].min && self.zoomExtremes[0].max) {
				let zoomTimeSpan = self.zoomExtremes[0].max - self.zoomExtremes[0].min;
				self.zoomMaxOffset = 0;
				self.zoomMinOffset = until - from - zoomTimeSpan;
				self.zoomExtremes = null;
			}

			self.chart.xAxis[0].setExtremes(from + self.zoomMinOffset, until + self.zoomMaxOffset, false, false);

			if (lastUpdateExtremes < from - 2500) {
				lastUpdateExtremes = from;
				for (var i = 0; i < self.chart.series.length; i++) {
					var series = self.chart.series[i];
					self._removeOldPoints(series, series.xAxis.getExtremes());
					if (typeof series._setCacheLimitForOriginalData == "function")
						series._setCacheLimitForOriginalData(series.xAxis.getExtremes());
				}
			}
		}
	}
};


/**
 * Refresh min/max for history only!
 */
Renderer.prototype.rendererRedrawHistory = function () {
	var self = this;

	if (self.chart._isRedrawComplete) {
		self.chart._isRedrawComplete = false;

		// Init autoscale
		if (typeof self.chart._isAutoscale == "undefined") {
			self.chart._isAutoscale = {};

			for (var s in self.chart.series) {
				self.chart._isAutoscale[s] = {
					min: !(
						typeof self.chart.series[s].yAxis.userOptions.min == "undefined" ||
						self.chart.series[s].yAxis.userOptions.min == null ||
						!self.chart.series[s].yAxis.options.autoscale
					),
					dataMin: null,
					max: !(
						typeof self.chart.series[s].yAxis.userOptions.max == "undefined" ||
						self.chart.series[s].yAxis.userOptions.max == null ||
						!self.chart.series[s].yAxis.options.autoscale
					),
					dataMax: null
				};
			}
		}

		/* eval series for min/max changes in yAxis */
		for (var s in self.chart.series) {
			var cartMin;
			var cartMax;
			var dataMin;
			var dataMax;
			var skipMinMix = true;

			if (!self.chart._isAutoscale[s]) {
				self.chart._isAutoscale[s] = {
					min: !(
						typeof self.chart.series[s].yAxis.userOptions.min == "undefined" ||
						self.chart.series[s].yAxis.userOptions.min == null ||
						self.chart.series[s].yAxis.options.autoscale
					),
					dataMin: null,
					max: !(
						typeof self.chart.series[s].yAxis.userOptions.max == "undefined" ||
						self.chart.series[s].yAxis.userOptions.max == null ||
						self.chart.series[s].yAxis.options.autoscale
					),
					dataMax: null
				};
			}

			if (self.chart.series[s].yAxis.options.autoscale) {
				if (!self.chart._isAutoscale[s].min || self.chart._isAutoscale[s].min > self.chart.series[s].yAxis.dataMin) {
					cartMin = self.chart.series[s].yAxis.dataMin;
					dataMin = self.chart._isAutoscale[s].dataMin;

					if (cartMin != null && dataMin == null) {
						dataMin = cartMin;
						self.chart._isAutoscale[s].dataMin = cartMin;
						skipMinMix = false;
					} else if (cartMin != null && cartMin != dataMin) {
						dataMin = cartMin;
						self.chart._isAutoscale[s].dataMin = cartMin;
						skipMinMix = false;
					} else if (dataMin == null) {
						dataMin = 0;
						self.chart._isAutoscale[s].dataMin = 0;
						skipMinMix = false;
					}
				}

				if (!self.chart._isAutoscale[s].max || self.chart._isAutoscale[s].max < self.chart.series[s].yAxis.dataMax) {
					cartMax = self.chart.series[s].yAxis.dataMax;
					dataMax = self.chart._isAutoscale[s].dataMax;

					if (cartMax != null && dataMax == null) {
						dataMax = cartMax;
						self.chart._isAutoscale[s].dataMax = cartMax;
						skipMinMix = false;
					} else if (cartMax != null && cartMax != dataMax) {
						dataMax = cartMax;
						self.chart._isAutoscale[s].dataMax = cartMax;
						skipMinMix = false;
					} else if (dataMax == null) {
						dataMax = 0;
						self.chart._isAutoscale[s].dataMax = 0;
						skipMinMix = false;
					}
				}

				if (cartMin == cartMax && dataMin == dataMax) {
					self.chart.series[s].yAxis.setExtremes(dataMin, dataMin + 1);
				}
			}

			if (!skipMinMix && !self.chart._setZoomed) {
				if (!isNaN(dataMin) && dataMin != null && !isNaN(dataMax) && dataMax != null) {
					self.chart.series[s].yAxis.userOptions.min = dataMin;
					self.chart.series[s].yAxis.userOptions.max = dataMax;
					self.chart.series[s].yAxis.setExtremes(dataMin, dataMax);
				}
			}
		}

		self.chart.redraw();
	}
}


/**
 * Removes all points from a given series that are not visible in the chart, except the last one that is not visible,
 * because a line from this point to the next point in the chart may be visible.
 * @param {series} series A highcharts series
 * @private
 */
Renderer.prototype._removeOldPoints = function (series, extremes) {
	if (this.zoomed || series.isSeriesBoosting) return;

	if (typeof extremes == "undefined") extremes = series.xAxis.getExtremes();

	/* clean points */
	var removePointStack = [];
	for (var i in series.points) {
		if (series.points[i] != null) {
			if (series.points[i].x < extremes.min && series.points[i].x > 0) {
				removePointStack.push(i);
			} else if (series.points[i].x >= extremes.min) {
				break;
			}
		}
	}

	// [AT-D-9932] ... leave last point for aggregates
	if (removePointStack.length > 0) removePointStack.pop();

	while (removePointStack.length > 0) {
		var i = removePointStack.pop();
		series.removePoint(i);
	}

	/* clean data */
	var removeDataStack = [];
	for (var i in series.data) {
		if (series.data[i] != null) {
			if (series.data[i].x < extremes.min && series.data[i].x > 0) {
				removeDataStack.push(i);
			} else if (series.data[i].x >= extremes.min) {
				break;
			}
		} else {
		}
	}

	// [AT-D-9932] ... leave last point for aggregates
	if (removeDataStack.length > 0) removeDataStack.pop();

	while (removeDataStack.length > 0) {
		var i = removeDataStack.pop();
		series.data[i].remove();
	}
};

/**
 * Subscribes, unsubscribes or updates added, deleted or changed addresses on all highcharts series.
 */
Renderer.prototype.updateContinuousRendering = function () {
	var dataSourceOptions = this._getDataSourceOptions(this.chart.series);
	this.dataSource.updateNodes(filterOutAggregateSeries(dataSourceOptions));

	// init housekeeping ...
	setTimeout(function () {
		if (self.chart && typeof self.chart._tick != "undefined")
			self.chart._tick[self.chart.index] = null;
	}, 1000);
};

/**
 * Stops the continuous rendering by unsubscribing all subscribed addresses and stopping the moving animation.
 */
Renderer.prototype.stopContinuousRendering = function () {
	this.dataSource.unsubscribe();
	//Stop moving animation
	this.continueRender = false;
};

/**
 * Wrapper determining correct time offset if unit has no present value
 * @param {number} from Time stamp from which points are loaded.
 * @param {number} until Time stamp to which are all points are loaded.
 * @param {onHistoryLoadedCallback} [onHistoryLoadedCallback] Function that is called after the data has been loaded.
 * @param {series} [series] Draw history for this series. If not set, all series are drawn.
 * @see {@Link TrendControl.onHistoryLoadedCallback}
 */
Renderer.prototype.drawHistory = function (from, until, onHistoryLoadedCallback, series) {
	var self = this;

	self.chart.onHistoryLoading();

	// prevent loading while already loading
	if (!self._rendererLoadHistoryInProgress) {
		self._rendererLoadHistoryInProgress = false;
	} else if (self._rendererLoadHistoryInProgress) {
		return;
	}

	self._rendererLoadHistoryInProgress = true;

	if (until === -1) {
		self.dataSource.getServerTimeOffset(function (e) {
			until = new Date().valueOf() + e;
			from =
				until -
				self.chart.xAxis[0].options.timeSpan * self.chart.xAxis[0].options.timeSpanUnit * 1000;
			self.drawLatestHistory(from, until, function (e) {
					self._rendererLoadHistoryInProgress = false;
					self.chart.onHistoryReady();
					onHistoryLoadedCallback(e);
				},
				series
			);
		});
	} else {
		self.drawLatestHistory(from, until, function (e) {
				self._rendererLoadHistoryInProgress = false;
				self.chart.onHistoryReady();
				onHistoryLoadedCallback(e);
			},
			series
		);
	}
};

/**
 * Loads all points for a given series (or all series if *series* not set) between *from* and *until* and draw them
 * on the chart. The chart's minimum and maximum are set to *from* and *until*.
 * @param {number} from Time stamp from which points are loaded.
 * @param {number} until Time stamp to which are all points are loaded.
 * @param {onHistoryLoadedCallback} [onHistoryLoadedCallback] Function that is called after the data has been loaded.
 * @param {series} [series] Draw history for this series. If not set, all series are drawn.
 * @see {@Link TrendControl.onHistoryLoadedCallback}
 */
Renderer.prototype.drawLatestHistory = function (from, until, onHistoryLoadedCallback, series) {
	var self = this;

	clearInterval(self.chart._redrawInterval[self.chart.index]);
	self.chart._redrawInterval[self.chart.index] = null;

	if (isNaN(from)) {
		throw new Error("from must be a number");
		return;
	}
	if (isNaN(until)) {
		throw new Error("until must be a number");
		return;
	}

	this.chart.xAxis[0].setExtremes(from, until, false, false); // *** dnu ***

	// if a series is set, only this series is added to the data source options
	var dataSourceOptions;

	if (series) {
		dataSourceOptions = this._getDataSourceOptions([series]);
		series._historyLoading = true;
		series.setData([], false);
	} else {
		// otherwise all series are added to the dataSourceOptions
		dataSourceOptions = this._getDataSourceOptions(this.chart.series);
		for (var i = 0; i < this.chart.series.length; i++) {
			this.chart.series[i]._historyLoading = true;
			this.chart.series[i].setData([], false);
		}
	}

	/* add 5 secons for slow connections in mixed mode */
	let isMixed = self.chart.userOptions.atviseOptions.mode == "mixed";

	dataSourceOptions.from = from;
	dataSourceOptions.until = until + (isMixed ? 5000 : 0);

	this.dataSource.loadPoints(dataSourceOptions, function (dataSourceErrors, data, more) {
		if (dataSourceErrors) {
			// Handling as verified as correct due to analysis over the course of issue AT-D-11899
			if (dataSourceErrors.message) {
				self.onErrorCallback(20103, dataSourceErrors.message);
				// Former handling: Kept because not known if usable and correct for some other occurrences
			} else {
				for (var key in dataSourceErrors) {
					self.onErrorCallback(20103, dataSourceErrors[key].message);
				}
			}
		}

		if (more) {
			self.onErrorCallback(20107, " Due to the request limitation, not all data could be queried.");
		}

		/** clean up series to remove all artifacts **/
		/** add historical data,  **/
		/** determine gap data and add it again after cleanup **/
		for (var dataKey in data) {
			var series = self._getSeries(dataKey);

			/* gap data (live data) added during loading */
			/* will be removed to prevent artifacts */
			var gapData = [];

			if (series) {
				try {
					if (series.points) {
						series.points.forEach((e) => gapData.push([e.x, e.y]));
					}

					var dataArray = [];
					if (series && data[dataKey].length > 0) {
						dataArray = self.dataHandler.getData(data[dataKey], series.options.type, dataKey);
					}

					series.setData(dataArray, false);
					series.lastAddPoint = undefined;

					/* remove last index of gap if value = null */
					var gapLastIndex = gapData.length - 1;
					if (gapLastIndex && Array.isArray(gapData[gapLastIndex]) && gapData[gapLastIndex][1] == null) {
						gapData.pop();
					}

					dataArray = dataArray.concat(gapData);

					if (dataKey.indexOf("--high-value") == -1 && dataArray.length > 0) {
						var lastIndex = dataArray.length - 1;
						for (var da = 0; da < lastIndex + 1; da++) {
							series.addLivePoint(dataArray[da], da == lastIndex, false, true);
						}
					}

				} catch (ex) {
					console.error("Charts rendering: Series already invalidated: " + ex);
				}
			} else {
				console.error("Charts rendering: No series found!");
			}
		}

		setTimeout(function (e) {
			self.updateNonStop();
			if (onHistoryLoadedCallback) {
				onHistoryLoadedCallback();
			}

			// *** Do not redraw in live/mixed modes! ***
			if(!self.continueRender)
				self.rendererRedrawHistory();
		}, 100);
	});
};


/**
 * Shows measuring cursor 1. If called, and the cursor is already shown, the position of the cursor is set to its default position.
 */
Renderer.prototype.showMeasuringCursor1 = function () {
	var extremes = this.chart.xAxis[0].getExtremes();
	var offset = (extremes.userMax - extremes.userMin) / 5;

	if (offset > 0) {
		this.cursor1.show(extremes.userMin + offset);
	} else {
		this.onErrorCallback(20104);
	}
};

/**
 * Shows measuring cursor 2. If called, and the cursor is already shown, the position of the cursor is set to its default position.
 */
Renderer.prototype.showMeasuringCursor2 = function () {
	var extremes = this.chart.xAxis[0].getExtremes();
	var offset = (extremes.userMax - extremes.userMin) / 5;

	if (offset > 0) {
		this.cursor2.show(extremes.userMax - offset);
	} else {
		this.onErrorCallback(20104);
	}
};

/**
 * Hides measuring cursor 1.
 */
Renderer.prototype.hideMeasuringCursor1 = function () {
	this.cursor1.hide();
};

/**
 * Hides measuring cursor 2.
 */
Renderer.prototype.hideMeasuringCursor2 = function () {
	this.cursor2.hide();
};

/**
 * Adds a new callback to the "OnValueChanged" event of the measuring cursor 1. The callback is fired, if the measured value
 * of the measuring cursor changes. If a new callback is registered and the cursor is visible, the callback is also fired
 * with the current measured values of the cursor.
 * @see {@link MeasuringCursor#registerOnValueChangedCallback}
 * @param {onValueChangedCallback} onValueChangedCallback A callback function
 * @returns {number} The callback ID of the registered callback.
 */
Renderer.prototype.registerMeasuringCursor1Callback = function (onValueChangedCallback) {
	return this.cursor1.registerOnValueChangedCallback(onValueChangedCallback);
};

/**
 * Adds a new callback to the "OnValueChanged" event of the measuring cursor 2. The callback is fired, if the measured value
 * of the measuring cursor changes. If a new callback is registered and the cursor is visible, the callback is also fired
 * with the current measured values of the cursor.
 * @see {@link MeasuringCursor#registerOnValueChangedCallback}
 * @param {onValueChangedCallback} onValueChangedCallback A callback function
 * @returns {number} The callback ID of the registered callback.
 */
Renderer.prototype.registerMeasuringCursor2Callback = function (onValueChangedCallback) {
	return this.cursor2.registerOnValueChangedCallback(onValueChangedCallback);
};

/**
 * Forces the "OnValueChanged" callbacks of both cursors to be fired.
 * @see {@link MeasuringCursor#forceCallbacks}
 */
Renderer.prototype.forceMeasuringCallbacks = function () {
	if (this.cursor1.getIsVisible()) this.cursor1.forceCallbacks();
	if (this.cursor2.getIsVisible()) this.cursor2.forceCallbacks();
};

/**
 * Removes an "OnValueChanged" callback from measuring cursor 1.
 * @see {@Link MeasuringCursor#unregisterOnValueChangedCallback}
 * @param {number} callbackId The ID of the callback that should be removed.
 */
Renderer.prototype.unregisterMeasuringCursor1Callback = function (callbackId) {
	this.cursor1.unregisterOnValueChangedCallback(callbackId);
};

/**
 * Removes an "OnValueChanged" callback from measuring cursor 2.
 * @see {@Link MeasuringCursor#unregisterOnValueChangedCallback}
 * @param {number} callbackId The ID of the callback that should be removed.
 */
Renderer.prototype.unregisterMeasuringCursor2Callback = function (callbackId) {
	this.cursor2.unregisterOnValueChangedCallback(callbackId);
};

/**
 * Returns true, if measuring cursor 1 is visible or false, if not.
 * @see {@Link MeasuringCursor#getIsVisible}
 * @returns {boolean} True, if the cursor is visible on the chart. False, if the cursor is hidden or moved to an invisible position of the chart.
 */
Renderer.prototype.isMeasuringCursor1Visible = function () {
	return this.cursor1.getIsVisible();
};

/**
 * Returns true, if measuring cursor 2 is visible or false, if not.
 * @see {@Link MeasuringCursor#getIsVisible}
 * @returns {boolean} True, if the cursor is visible on the chart. False, if the cursor is hidden or moved to an invisible position of the chart.
 */
Renderer.prototype.isMeasuringCursor2Visible = function () {
	return this.cursor2.getIsVisible();
};

/**
 * Deletes all data from a highcharts series.
 * @param {series} series A highcharts series
 */
Renderer.prototype.deleteSeriesData = function (series) {
	series.setData([]);
};

/**
 * Sets the type of the currently used source like "opcua".
 * @param {string} source Type of the source
 */
Renderer.prototype.setSource = function (source, sourceOptions) {
	this.chart.options.source = source;
	this.chart.options.sourceOptions = sourceOptions;
	this.dataSource = new Datasource({
		type: source,
		nodes: {},
		option: sourceOptions
	});
};

/**
 * Returns an array of all registered source types.
 * @returns {string[]} Array of all registered source types.
 */
Renderer.prototype.getRegisteredSources = function () {
	return Datasource.getDatasourceTypes();
};

/**
 * Shows or hides the left and right non stop points of all series according to the set option at *series.options.nonStop*.
 */
Renderer.prototype.updateNonStop = function () {
	try {
		for (var i = 0; i < this.chart.series.length; i++) {
			var series = this.chart.series[i];
			this._addOrRemoveLeftNonStopPoint(series);
			this._addOrRemoveRightNonStopPoint(series);
		}
	} catch (ex) {
		// data already invalidated
		// console.warn(ex);
	}

	// this.chart.redraw(); *** dnu ***
};

/**
 * Destroys the renderer.
 */
Renderer.prototype.destroy = function () {
	var self = this;
	this.cursor1.destroy();
	this.cursor2.destroy();
	this.continueRender = false;

	this.chart.renderTo.ownerDocument.defaultView["Highcharts"].removeEvent(
		this.chart,
		"selection",
		this.boundFunctions.selectionHandler
	);
	this.boundFunctions = null;
	this.zoomExtremes = null;
	clearInterval(this.chart._redrawInterval[this.chart.index]);
	clearInterval(this.chart._tickInterval[this.chart.index]);
	this.chart._redrawInterval[this.chart.index] = null;
	this.chart._tickInterval[this.chart.index] = null;
	self = null;
};

Renderer.prototype._selectionHandler = function (selectionEvent) {
	if (selectionEvent.resetSelection) {
		this.zoomReset = true;
		this.zoomed = false;
	} else {
		this.zoomExtremes = selectionEvent.xAxis;
		this.zoomed = true;
	}
};

/**
 * Adds or removes the left point on a given series for the "non stop" line according to the options set at series.options.nonStop.
 * @param {series} series A highcharts series
 * @private
 */
Renderer.prototype._addOrRemoveLeftNonStopPoint = function (series, pointValue) {
	if (typeof series.options == "undefined") return;
	var pointId = "leftNonStopPoint-" + series.options.id;
	if (series.options.nonStop && !this.chart.get(pointId) && series.xAxis.getExtremes()) {
		var min = 0; // series.xAxis.getExtremes().min;

		// values are available after complete initialization
		// so if y can read it in the browser - y probably cant access it at first run of this function
		// in that case the pointValue is needed
		// Happy JS - Scopes!
		var firstPoint = {x: series.xData[0], y: series.yData[0]};

		//if(typeof pointValue !== "undefined" && pointValue !== null ) {
		if (typeof firstPoint.x == "undefined" || typeof firstPoint.y == "undefined") {
			if (typeof pointValue !== "undefined" && pointValue !== null) {
				// starting the chart - firstPoint is not reachable - so use the realValues
				series.addLivePoint({id: pointId, x: min, y: pointValue[1]}, true);
			}
		} else if (firstPoint && firstPoint.x > min) {
			//Check if the most left point of the series is visible at the chart (and not too far on the left)
			// series.addPoint({id: pointId, x: min, y: firstPoint.y, low: firstPoint.low, high: firstPoint.high}, true);
			series.addLivePoint(
				{
					id: pointId,
					x: min,
					y: firstPoint.y,
					low: firstPoint.low,
					high: firstPoint.high
				},
				true
			);
		}
	} else if (!series.options.nonStop) {
		try {
			this.chart.get(pointId).remove();
		} catch (ex) {
		}
	}
};

/**
 * Adds or removes the right point on a given series for the "non stop" line according to the options set at series.options.nonStop.
 * @param {series} series A highcharts series
 * @private
 */
Renderer.prototype._addOrRemoveRightNonStopPoint = function (series) {
	if (series.options.nonStop && series.yData.length > 0) {
		var lastPoint = {x: series.xData[series.xData.length - 1], y: series.yData[series.yData.length - 1]};
		if (lastPoint) {
			this._removeRightNonStopPoint(series);
			this._addRightNonStopPoint(series, lastPoint);
		}
	} else if (!series.options.nonStop) {
		this._removeRightNonStopPoint(series);
	}
};

/**
 * Adds the point for the right "non stop" line.
 * Move right point to x: this.maxTimeLimit
 * @param {series} series A highcharts series
 * @param {object} point A point object with x, y, low and high set. The point for the non stop line is set at this point's y, low and high values,
 * but x is overwritten with max from the series's x axis.
 * @private
 */
Renderer.prototype._addRightNonStopPoint = function (series, point) {
	if (typeof series.options == "undefined") return;
	var pointId = "rightNonStopPoint-" + series.options.id;
	if (series.visible) {
		if (series.options.nonStop) {
			if (!this.chart.get(pointId) && series.xAxis.getExtremes()) {
				series.addLivePoint(
					{
						id: pointId,
						x: this.maxTimeLimit,
						y: point.y,
						low: point.low,
						high: point.high
					},
					true
				);
			}
		}
	}
};

/**
 * Removes the right non stop point from a given series.
 * @param {series} series A highcharts series
 * @private
 */
Renderer.prototype._removeRightNonStopPoint = function (series) {
	var pointId = "rightNonStopPoint-" + series.options.id;
	var point = false;
	try {
		point = this.chart.get(pointId);
	} catch (ex) {
	}

	if (!point && series && series.points && series.points.length > 0) {
		var checkPoint = series.points[series.points.length - 1];
		if (checkPoint.x && checkPoint.x == this.maxTimeLimit) {
			point = checkPoint;
		} else if (checkPoint[0] && checkPoint[0] == this.maxTimeLimit) {
			point = checkPoint;
		}
	}

	if (point) {
		point.remove(false);
	} else {
		if (series.options.nonStop && series.xData[series.xData.length - 1] == this.maxTimeLimit) {
			series.yData.splice(series.yData.length - 1, 1);
			series.xData.splice(series.xData.length - 1, 1);
		}
	}
};

/**
 * Updates all right non stop points with the given x value.
 * @param {number} x An x value
 * @private
 */
Renderer.prototype._updateRightNonStopPoints = function (x) {
	var self = this;
	// block updates the next 250ms after a new point is set
	// >>> block calculation depends on frame rate
	var blockValue = Math.ceil(40 / (1000 / this.chart.options.atviseOptions.liveModeFrameRate));

	// block update wen a new right point was set (at incoming data)
	// otherwise highchart will be faster than the point is processed and an error is thrown
	if (typeof self.updateInProgress == "undefined" || typeof self.blockUpdate == "undefined") {
		self.blockUpdate = blockValue;
		self.updateInProgress = false;
	}

	if (self.updateInProgress == true && self.blockUpdate < 0) {
		self.updateInProgress = false;
	} else if (self.updateInProgress != true) {
		for (var i = 0; i < this.chart.series.length; i++) {
			var pointId = "rightNonStopPoint-" + this.chart.series[i].options.id;
			var point = this.chart.get(pointId);
			if (point && point.update) {
				point.update({x: x}, false);
			}
		}
		self.blockUpdate = blockValue * 2;
	} else {
		self.blockUpdate--;
	}
};

/**
 * Returns an dataSourceOptions object with nodes and aggregateOptions set for all series from the given series array.
 * @param {series[]} seriesArray An array of series.
 * @returns {object}
 * @private
 */
Renderer.prototype._getDataSourceOptions = function (seriesArray) {
	var dataSourceOptions = {};
	dataSourceOptions.nodes = {};
	dataSourceOptions.aggregateOptions = {};
	dataSourceOptions.dataArchives = {};
	var self = this;
	seriesArray.forEach(function (seriesElement) {
		self._addSeriesToDataSourceOptions(seriesElement, dataSourceOptions);
	});
	return dataSourceOptions;
};

/**
 * Adds the address and the aggregate options to the dataSourceOptions object. If the series is a range series and address2 is set,
 * an entry with the ending "--high-value" will be added to nodes map of the dataSourceOptions and the aggregate map.
 * @param {series} series A highcharts series
 * @param {object} dataSourceOptions A dataSourceOptions object
 * @private
 */
Renderer.prototype._addSeriesToDataSourceOptions = function (series, dataSourceOptions) {
	if (series.options.address) {
		if (this.dataHandler.hasSupportedSeriesType(series.options.type)) {
			dataSourceOptions.nodes[series.options.id] = series.options.address;
			dataSourceOptions.aggregateOptions[series.options.id] = series.options.aggregate;
			dataSourceOptions.dataArchives[series.options.id] = series.options.dataArchive;
		} else {
			this.onErrorCallback(20100, series.options.type);
		}
	}
	if (this._isRangeSeries(series.options.type) && series.options.address && series.options.address2) {
		dataSourceOptions.nodes[series.options.id + "--high-value"] = series.options.address2;
		dataSourceOptions.aggregateOptions[series.options.id + "--high-value"] = series.options.aggregate2;
		dataSourceOptions.dataArchives[series.options.id + "--high-value"] = series.options.dataArchive2;
	}
};

/** Returns true if the given series type is "arearange", "areasplinerange" or "columnrange", and false, if not.
 * @param {string} seriesType A highcharts series type.
 * @returns {boolean} True, if range type, false if not.
 * @private
 */
Renderer.prototype._isRangeSeries = function (seriesType) {
	return seriesType == "arearange" || seriesType == "areasplinerange" || seriesType == "columnrange";
};

/**
 * Gets the series according to a data key. Usually the data key is equal to the series id, except for range series,
 * because range series have two data source subscriptions: One equal to the series id, and one ending with "--high-value".
 * Returns undefined, if not series is found for the given key.
 * @param {string} key A data key.
 * @returns {series} A highcharts series or undefined.
 * @private
 */
Renderer.prototype._getSeries = function (key) {
	try {
		if (key) {
			if (key.indexOf("--high-value") > -1) {
				key = key.replace("--high-value", "");
			}
			return this.chart.get(key);
		}
	} catch (ex) {
		// data already invalidated
		// console.warn(ex);
	}

	return undefined;
};
