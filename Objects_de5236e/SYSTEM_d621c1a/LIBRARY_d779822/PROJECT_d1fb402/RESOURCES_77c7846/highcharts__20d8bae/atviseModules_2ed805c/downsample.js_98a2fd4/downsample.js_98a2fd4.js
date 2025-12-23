/* eslint-disable no-param-reassign */

(function (H) {
	H.Chart.prototype.setSamplingFactor = function (samplingFactor) {
		this.options.atviseOptions.downsamplingFactor = samplingFactor;
		this.redraw(false);
	};

	H.Chart.prototype.getSamplingFactor = function () {
		return this.options.atviseOptions.downsamplingFactor || 1;
	};

	H.Chart.prototype._downsample = function () {
		for (var i = 0; i < this.series.length; i++) {
			this.series[i].setData(this.series[i].chart._originalDataCache[this.series[i].options.id], false, false);
		}
		this.redraw(false);
	};

	Object.defineProperty(H.Chart.prototype, 'timespan', {
		get: function () {
			var axis = this.xAxis[0];
			var useTimespan = axis.userOptions.timeSpan * axis.userOptions.timeSpanUnit * 1000;

			if (!isNaN(axis.min) && !isNaN(axis.max)) {
				useTimespan = axis.max - axis.min
			}

			return useTimespan;
		},
	});

	// Enable / disable
	H.Chart.prototype._enableDownsampling = function () {
		// by boost
		if (typeof this.options.boost != "undefined") {
			if (this.options.boost.enabled) {
				this._downsamplingEnabled = false;
				return;
			}
		}

		// by atvise
		this._downsamplingEnabled = true;

		for (var i = 0; i < this.series.length; i++) {
			var series = this.series[i];
			series.lockAddPoint(true);
		}

		for (var i = 0; i < this.series.length; i++) {
			var serie = this.series[i];

			if (typeof serie.area == "undefined") { // Deactivation for areas ... [AT-D-10514]
				if (typeof serie.chart._originalDataCache == "undefined")
					serie.chart._originalDataCache = [];

				if (typeof serie.chart._originalDataCache[serie.options.id] == "undefined")
					serie.chart._originalDataCache[serie.options.id] = [];

				/* boost or no boost */
				if (serie.isSeriesBoosting) {
					serie.chart._originalDataCache[serie.options.id] = [];
					for (var p in serie.processedXData) {
						serie.chart._originalDataCache[serie.options.id].push([serie.processedXData[p], serie.processedYData[p]]);
					}
				} else if (serie.points) {
					serie.chart._originalDataCache[serie.options.id] = [];
					for (var p in serie.points) {
						serie.chart._originalDataCache[serie.options.id].push([serie.points[p].x, serie.points[p].y]);
					}
				}
				if (serie.chart._originalDataCache[serie.options.id]) {
					serie.setData(serie.chart._originalDataCache[serie.options.id], false, false);
				}
			}
			serie.chart._lastDownsampledIndex[serie.options.id] = 0;
		}

		for (var i = 0; i < this.series.length; i++) {
			var serie = this.series[i];
			serie.lockAddPoint(false);
		}
	};


	H.Chart.prototype._disableDownsampling = function () {
		// by boost
		if (typeof this.options.boost != "undefined") {
			if (this.options.boost.enabled) {
				this._downsamplingEnabled = false;
				return;
			}
		}

		// by atvise
		this._downsamplingEnabled = false;

		for (var i = 0; i < this.series.length; i++) {
			var series = this.series[i];
			series.lockAddPoint(true);
		}

		for (var i = 0; i < this.series.length; i++) {
			var series = this.series[i];
			if (typeof series.area == "undefined") { // Deactivation for areas ... [AT-D-10514]
				if (series.chart._originalDataCache && typeof series.chart._originalDataCache[series.options.id] != "undefined") { // downsampled before
					series.setData(series.chart._originalDataCache[series.options.id]);
				}
			}
		}

		for (var i = 0; i < this.series.length; i++) {
			var series = this.series[i];
			series.lockAddPoint(false);
		}
	};


	H.Chart.prototype.setDownsamplingEnabled = function (enabled) {
		// by boost
		if (typeof this.options.boost != "undefined") {
			if (this.options.boost.enabled) {
				this._downsamplingEnabled = false;
				return;
			}
		}

		// by atvise
		if (enabled === this._downsamplingEnabled) {
			return;
		}

		if (enabled) {
			this._enableDownsampling();
		} else {
			this._disableDownsampling();
		}
	};

	// Initialize
	H.Chart.prototype.callbacks.push(function (chart) {
		// Enable downsampling if: [AT-D-10284]
		//  - options.atviseOptions are given
		//  - options.atviseOptions.disableDownsampling false

		var enable = typeof chart.options.atviseOptions == "undefined" ? false : chart.options.atviseOptions.disableDownSampling === false;
		this.setDownsamplingEnabled(enable);

		H.addEvent(chart.xAxis[0], 'afterSetExtremes', function (e) {
			if (!e.trigger || e.trigger !== 'pan') {
				var old = chart._downsampleValueSpan;

				chart._downsampleValueSpan = (chart.timespan / chart.pixelWidth);

				if (this._downsamplingEnabled && old !== chart._downsampleValueSpan) {
					chart._downsample();
				}
			}
		});
	});

	Object.defineProperty(H.Series.prototype, 'compression', {
		get: function () {
			return this.chart._downsamplingEnabled ?
				(this.chart._originalDataCache[this.options.id].length / this.data.length) :
				1;
		},
	});


	H.Series.prototype._downsample = function (point) {
		if (!this.chart._downsampleValueSpan) {
			return this.chart._originalDataCache[this.options.id];
		}

		var checkSamplePeriode = this.chart.timespan / this.chart.pixelWidth;
		if(this.chart._downsampleValueSpan != checkSamplePeriode)
			this.chart._downsampleValueSpan = checkSamplePeriode;

		if (point && point.length > 0) {
			var sampleFactor = this.chart.getSamplingFactor();
			var samplePeriode = Math.floor(this.chart._downsampleValueSpan);

			if (this.chart._lastDownsampledPoint[this.options.id] === undefined)
				this.chart._lastDownsampledPoint[this.options.id] = point;

			var startTime = this.chart._lastDownsampledPoint[this.options.id][0];
			var endTime = this.chart._lastDownsampledPoint[this.options.id][0] + samplePeriode * sampleFactor;

			if (point[0] < endTime) {
				return [];
			} else {
				if (this.chart._lastDownsampledIndex[this.options.id] === undefined)
					this.chart._lastDownsampledIndex[this.options.id] = 0;

				if (typeof this.newExtremMin === "undefined" || this.newExtremMin > point[0]) {
					this.newExtremMin = point[0];
				}

				/* cleanup cache befor sampling */
				if (typeof this.newExtremMin != "undefined") {
					var hasCache = typeof this.chart._originalDataCache[this.options.id];
					var hasData = this.chart._originalDataCache[this.options.id].length;
					if (hasCache != "undefined" && hasData > -1) {
						var isClean = false;
						while (!isClean) {
							try {
								var useExtremMin = this.newExtremMin;
								if (this.chart._originalDataCache[this.options.id][0][0] < useExtremMin) {
									var data = this.chart._originalDataCache[this.options.id].shift();
									this.chart._lastDownsampledIndex[this.options.id]--;
								} else {
									isClean = true;
									break;
								}
							} catch (ex) {
								console.log(hasCache, hasData);
								isClean = true;
								break;
							}
						}
						/* todo: optimize */
						if (typeof this.cleanUpPointStack != "undefined") {
							var search = true, found = false;
							while (search) {
								var cleanupPoint = this.cleanUpPointStack.shift();
								if (cleanupPoint) {
									var searchIndex = this.chart._originalDataCache[this.options.id].length - 1;
									while (!found && searchIndex > -1) {
										var currentPoint = this.chart._originalDataCache[this.options.id][searchIndex]
										if (currentPoint[0] == cleanupPoint[0]) {
											found = true;
										}
										searchIndex--;
									}
								} else {
									search = false;
								}
							}
						}
					}
				}

				var index = this.chart._lastDownsampledIndex[this.options.id];
				if (index < 0)
					index = 0;

				/* get min and max in sample range */
				var pointMin = this.chart._originalDataCache[this.options.id][index];
				var pointMax = this.chart._originalDataCache[this.options.id][index];

				if (typeof this.chart._originalDataCache[this.options.id][index] != "undefined" && this.chart._originalDataCache[this.options.id][index].length > -1) {
					while (this.chart._originalDataCache[this.options.id][index][0] < endTime) {
						var comparePoint = this.chart._originalDataCache[this.options.id][index];
						if (comparePoint[1] < pointMin[1])
							pointMin = comparePoint;
						if (comparePoint[1] > pointMax[1])
							pointMax = comparePoint;

						index++;
					}
				}
				this.chart._lastDownsampledIndex[this.options.id] = index;
				this.chart._lastDownsampledPoint[this.options.id] = point;

				if (typeof pointMin == "undefined" || typeof pointMax == "undefined") {
					return [];
				}

				if (pointMax[0] == pointMin[0])
					return [pointMax];
				else if (pointMax[0] < pointMin[0])
					return [pointMax, pointMin];
				else
					return [pointMin, pointMax];
			}
		} else {
			return [];
		}
	}


	H.wrap(H.Series.prototype, 'setData', function (proceed, data) {
		if (typeof this.chart._lockForSetData == "undefined") {
			this.chart._lockForSetData = [];
		}
		this.chart._lockForSetData[this.options.id] = true;

		var downsamplingEnabled = this.chart._downsamplingEnabled;
		if (typeof this.chart.options.atviseOptions != "undefined" && typeof this.chart.options.atviseOptions.disableDownSampling != "undefined")
			downsamplingEnabled = !this.chart.options.atviseOptions.disableDownSampling;

		if (typeof this.area != "undefined") { // Deactivation for areas ... [AT-D-10514]
			proceed.apply(this, Array.prototype.slice.call(arguments, 1));
			return;
		}

		if (!downsamplingEnabled) {
			proceed.apply(this, Array.prototype.slice.call(arguments, 1));
			return;
		}

		var leftNonStopPoint;
		var rightNonStopPoint;
		if (data && data.length > 0 && data[0] && data[0].id && data[0].id.indexOf('NonStopPoint') !== -1) {
			leftNonStopPoint = data[0];
			data.shift();
		}

		if (data && data.length > 0 && data[data.length - 1] && data[data.length - 1].id &&
			data[data.length - 1].id.indexOf('NonStopPoint') !== -1) {
			rightNonStopPoint = data[data.length - 1];
			data.pop();
		}

		if (typeof this.chart._lastDownsampledPoint == "undefined")
			this.chart._lastDownsampledPoint = [];
		if (typeof this.chart._lastDownsampledIndex == "undefined")
			this.chart._lastDownsampledIndex = [];

		this.chart._lastDownsampledPoint[this.options.id] = undefined;
		this.chart._lastDownsampledIndex[this.options.id] = undefined;
		if (typeof this.chart._originalDataCache == "undefined")
			this.chart._originalDataCache = [];
		this.chart._originalDataCache[this.options.id] = data;

		var dataPoints = [];
		for (var d in data) {
			var sample = this._downsample(data[d]);
			for (var s = 0; s < sample.length; s++) {
				dataPoints.push(sample[s]);
			}
		}

		proceed.apply(this, [dataPoints].concat(Array.prototype.slice.call(arguments, 2)));
	});


	H.wrap(H.Series.prototype, 'addPoint', function (proceed, point, redraw, animate) {
		var isNonStopPoint = point.id && point.id.indexOf('NonStopPoint') !== -1;

		if (typeof this.area != "undefined") { // Deactivation for areas ... [AT-D-10514]
			proceed.apply(this, [point, redraw ? redraw : false]);
			return point;
		}

		if (!this.chart._downsamplingEnabled || isNonStopPoint) {
			proceed.apply(this, [point, redraw ? redraw : false]);
			return;
		}

		/* ignore points below min or add point */
		if (this.chart._startWithExtremMin > 0 && this.chart._startWithExtremMin > point[0] && point[0] > 0) {
			/* skip point console.warn(this.chart._startWithExtremMin); */
		} else {
			try {
				var newData = [];

				if(!(this.options.id in this.chart._originalDataCache))
					this.chart._originalDataCache[this.options.id] = [];

				this.chart._originalDataCache[this.options.id].push(point);
				newData = this._downsample(point);

				if (newData.length) {
					for (var key in newData) {
						proceed.apply(this, [newData[key], redraw ? redraw : false, animate ? animate : false]);
					}
				} else if(redraw){
					this.chart.redraw();
				}
			} catch(ex) {
				// console.error("Highcharts: Downsample failure with " + this.options.id + "! Series allready invalidate!");
			}
		}
	});


	// NOTE: This implmentation assumes that data point are only removed from the beginning
	H.wrap(H.Series.prototype, 'removePoint', function (proceed, index) {
		proceed.apply(this, [index, false]); // *** dnu ***
	});


	H.Series.prototype._setCacheLimitForOriginalData = function (extremes) {
		this.newExtremMin = extremes.min;
	}


	H.Series.prototype._markPointForCleanUpInOriginalData = function (point) {
		if (!this.cleanUpPointStack)
			this.cleanUpPointStack = [];
		this.cleanUpPointStack.push(point);
	}


	/* why downsample already downsampled data
	H.wrap(H.Chart.prototype, 'reflow', function () {
		if (this._downsamplingEnabled) {
			this._scale = false;
			this._downsample();
		}
	});
	*/
})(Highcharts);