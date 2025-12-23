/*Set options for Highcharts globally*/
var atviseDefaults = {
	global: {
		useUTC: false
	},
	boost: {
		enabled: true && !!webgl_support() // Prevents setting boost to true if webgl is not supported
	},
	accessibility: {
		enabled: false
	},
	plotOptions: {
		// series: {
		//	turboThreshold: 0,
		//  boostThreshold: 1000
		// },
		line: {
			type: "line"
		},
		series: {
			point: {
				events: {
					click: function () {
						webMI.trigger.fire("com.atvise.highcharts.point.click", this);
					}
				}
			}
		}
	},
	title: {
		text: ""
	},
	subtitle: {
		text: ""
	},
	/*The highcharts-objectdisplay is overwriting the predefined atviseOptions */
	atviseOptions: {
		mode: "mixed",
		source: "opcUA",
		sourceOptions: "{}",
		downsamplingFactor: 1,
		liveModeFrameRate: 20 // [1 ... 60]fps
	},
	legend: {
		enabled: true
	},
	credits: {
		enabled: false
	},
	chart: {
		alignTicks: true,
		backgroundColor: null,
		events: {
			afterGetContainer: function (event) {
				zoomWheel(this, event);
			},
			redraw: function () {
				try {
					this._setRedrawComplete();
				} catch (ex) {}
			},
			selection: function (event) {
				if (event.xAxis || event.yAxis) {
					zoomStart(this, event);
				} else {
					zoomEnd(this, event);
				}
			}
		},
		panKey: "shift",
		panning: {
			enabled: true,
			type: "xy"
		},
		style: {
			fontFamily: "Arial"
		}
	},
	loading: {
		style: {
			position: "absolute",
			opacity: 0.5,
			textAlign: "center",
			zIndex: 10,
			backgroundImage:
				'url("data:image/gif;base64,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")',
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center",
			backgroundPositionY: "55%"
		}
	},
	/* Highcharts default is to generate documents on a highcharts server. this requires an internet connection	    */
	/* -- fallbackToExportServer: true, this will allow the fallback to the highchart server        			    */
	/*							  false, this will prevent the connection									        */
	/* -- libURL: some browser can use local libraries to generate the documents (firefox and chrome)               */
	/*            these browser will have a look at these path (default: /highcharts/lib/)						    */
	/* please note: the list of current browsers supporting highchart exports can be requested through our support. */
	exporting: {
		buttons: {
			contextButton: {
				width: 28,
				height: 28,
				symbolSize: 23
			}
		},
		fallbackToExportServer: false,
		libURL: "/highcharts/lib/"
	},
	tooltip: {
		useHTML: true,
		followTouchMove: false,
		formatter: function () {
			return formatter_tooltips(this);
		}
	},
	xAxis: {
		events: {
			setExtremes: function () {
				try {
					this.chart._setExtremesComplete();
				} catch (ex) {}
			}
		},
		lineColor: "#ccd6eb",
		lineWidth: 1
	},
	yAxis: {
		autoscale: false,
		crosshair: {
			color: "#ff0000",
			dashStyle: "solid",
			snap: true,
			width: 0
		},
		endOnTick: true,
		gridLineColor: "#888888",
		gridLineWidth: 1,
		labels: {
			align: "center",
			x: -15
		},
		lineColor: "#ccd6eb",
		lineWidth: 1,
		labels: {
			formatter: function () {
				return formatter_yaxis(this);
			}
		},
		minorGridLineColor: "#eeeeee",
		minorGridLineWidth: 1,
		opposite: false,
		startOnTick: true
	}
};

if (!webMI.getClientInfo().isDesktop) {
	atviseDefaults.navigation = {
		menuStyle: { height: "200px", overflow: "auto" }
	};
}

/**
 * Helper function
 */
function webgl_support() {
	try {
		var canvas = document.createElement("canvas");
		return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
	} catch (e) {
		return false;
	}
}

/**
 * Zoom start, store original extremes of x- & y-axis
 * @param chart
 * @param event
 */
function zoomStart(chart, event) {
	/* disable zoom if wheel used */
	if (chart._zoom && chart._zoom.wheelZoomed) return;

	/* store original x axis time values */
	if (!chart._zoomResetMinX && chart._zoomResetMinX !== 0) chart._zoomResetMinX = chart.xAxis[0].min;
	if (!chart._zoomResetMaxX && chart._zoomResetMaxX !== 0) chart._zoomResetMaxX = chart.xAxis[0].max;

	/* store original y axis time values */
	if (!chart._zoomResetMinY) chart._zoomResetMinY = [];
	if (!chart._zoomResetMaxY) chart._zoomResetMaxY = [];

	for (var i in chart.yAxis) {
		if (!chart._zoomResetMinY[i] && chart._zoomResetMinY[i] !== 0)
			chart._zoomResetMinY[i] = saveJSONparse(JSON.stringify(chart.yAxis[i].min));
		if (!chart._zoomResetMaxY[i] && chart._zoomResetMaxY[i] !== 0)
			chart._zoomResetMaxY[i] = saveJSONparse(JSON.stringify(chart.yAxis[i].max));
	}

	/* store original ticks */
	if (!chart._zoomResetTickX) chart._zoomResetTickX = chart.xAxis[0].tickInterval;

	/* Check if event.xAxis[0] and its properties are defined */
	if (
		event.xAxis &&
		event.xAxis[0] &&
		typeof event.xAxis[0].max !== "undefined" &&
		typeof event.xAxis[0].min !== "undefined"
	) {
		var rangeBeforeZoom = chart.xAxis[0].max - chart.xAxis[0].min;
		var rangeAfterZoom = event.xAxis[0].max - event.xAxis[0].min;

		// Prevent division by zero
		if (rangeAfterZoom !== 0) {
			var newTickInterval = chart._zoomResetTickX * (rangeBeforeZoom / rangeAfterZoom);

			chart.xAxis[0].tickInterval = newTickInterval;
			chart.xAxis[0].update({
				tickInterval: newTickInterval
			});
		}
	}

	/* proceed zoom */
	chart._setZoomed = true;

	/* hook into some display functions */
	if (typeof chart._setZoomExtremes === "function") {
		chart._setZoomExtremes(true);
	}

	if (typeof chart._setZoomLocks === "function") {
		chart._setZoomLocks(true);
	}
}

/**
 * Zoom end, restore original extremes on x- & y-axis
 * @param chart
 * @param event
 */
function zoomEnd(chart, event) {
	/* check if panning is active and disable pan */
	if (chart._panning) {
		chart._panning = false;
		if (!chart._setZoomed) return;
	}

	/* disable zoom if wheel used */
	if (chart._zoom && chart._zoom.wheelZoomed) return;

	/* restore original x axis time values */
	chart.xAxis[0].userMin = chart._zoomResetMinX;
	chart.xAxis[0].userMax = chart._zoomResetMaxX;
	chart.xAxis[0].options.userMin = chart._zoomResetMinX;
	chart.xAxis[0].options.userMax = chart._zoomResetMaxX;
	chart.xAxis[0].setExtremes(chart._zoomResetMinX, chart._zoomResetMaxX);

	chart._zoomResetMinX = false;
	chart._zoomResetMaxX = false;

	/* restore original y axis time values */
	for (var i in chart.yAxis) {
		var yMin = chart.yAxis[i].logarithmic ? Math.pow(10, chart._zoomResetMinY[i]) : chart._zoomResetMinY[i];
		var yMax = chart.yAxis[i].logarithmic ? Math.pow(10, chart._zoomResetMaxY[i]) : chart._zoomResetMaxY[i];

		chart.yAxis[i].min = yMin;
		chart.yAxis[i].max = yMax;

		chart.yAxis[i].setExtremes(yMin, yMax);

		chart._zoomResetMinY[i] = false;
		chart._zoomResetMaxY[i] = false;
	}

	/* restore original ticks */
	chart.xAxis[0].tickInterval = chart._zoomResetTickX;
	chart.xAxis[0].update({
		tickInterval: chart._zoomResetTickX
	});

	chart._zoomResetTickX = false;

	/* proceed reset zoom */
	chart._setZoomed = false;

	try {
		chart.resetZoomButton.destroy();
	} catch (ex) {}

	try {
		delete chart.resetZoomButton;
	} catch (ex) {}

	/* hook into some display functions */
	if (typeof chart._setZoomExtremes === "function") {
		chart._setZoomExtremes(false);
	}

	if (typeof chart._setZoomLocks === "function") {
		chart._setZoomLocks(false);
	}

	event.preventDefault();
}

/**
 * Zoom with mousewheel, react on wheel events
 * @param chart
 * @param event
 */
function zoomWheel(chart, event) {
	chart._zoom = {
		wheel: 0,
		wheelExtremesY: null,
		wheelExtremesY: {},
		wheelExtremesDeltaY: {}
	};

	/* wait for charts initialized */
	setTimeout(function () {
		if (!chart.container) return; // Chart has been removed before is has been fully initialized

		chart.container.addEventListener("wheel", function (event) {
			/* disable wheel if zoomed */
			if (chart._setZoomed) return;

			chart._zoom.wheel = chart._zoom.wheel + event.wheelDelta;
			chart._zoom.wheelFactor = chart._zoom.wheel / 1000;

			/* set x-Axis */
			if (typeof chart._zoom.wheelExtremesX == "undefined" || chart._zoom.wheelExtremesX === null) {
				chart._zoom.wheelExtremesX = chart.xAxis[0].getExtremes();
				chart._zoom.wheelExtremesDeltaX = chart._zoom.wheelExtremesX.max - chart._zoom.wheelExtremesX.min;
				chart._zoom.wheelTick = chart.xAxis[0].tickInterval;
				chart._zoom.wheelTimeSpan = chart.xAxis[0].options.timeSpan;
				chart._zoom.wheelTimeUnit = chart.xAxis[0].options.timeSpanUnit;
				chart._zoom.zoomType = chart.zooming.type;
				chart._zoom.panning = chart.options.chart.panning;
			}

			let wheelMinX = chart._zoom.wheelExtremesX.min + chart._zoom.wheelExtremesDeltaX * chart._zoom.wheelFactor;
			let wheelMaxX = chart._zoom.wheelExtremesX.max - chart._zoom.wheelExtremesDeltaX * chart._zoom.wheelFactor;

			chart.xAxis[0].userMin = wheelMinX;
			chart.xAxis[0].userMax = wheelMaxX;
			chart.xAxis[0].options.userMin = wheelMinX;
			chart.xAxis[0].options.userMax = wheelMaxX;
			chart.xAxis[0].options.timeSpan = (wheelMaxX - wheelMinX) / 1000;
			chart.xAxis[0].options.timeSpanUnit = 1;
			chart.xAxis[0].setExtremes(wheelMinX, wheelMaxX);

			var tickInterval = (wheelMaxX - wheelMinX) / 5;
			chart.xAxis[0].tickInterval = tickInterval;
			chart.xAxis[0].update({
				tickInterval: tickInterval
			});

			/* set y-Axis */
			for (var i in chart.yAxis) {
				var axis_wheelFactor = chart.yAxis[i].logarithmic ? chart._zoom.wheelFactor / 100 : chart._zoom.wheelFactor;

				if (typeof chart._zoom.wheelExtremesY[i] == "undefined" || chart._zoom.wheelExtremesY[i] === null) {
					chart._zoom.wheelExtremesY[i] = {
						min: chart.options.yAxis[0].userMin,
						max: chart.options.yAxis[0].userMax
					};

					chart._zoom.wheelExtremesDeltaY[i] = chart._zoom.wheelExtremesY[i].max - chart._zoom.wheelExtremesY[i].min;
				}

				let wheelMinY = chart._zoom.wheelExtremesY[i].min + chart._zoom.wheelExtremesDeltaY[i] * axis_wheelFactor;
				let wheelMaxY = chart._zoom.wheelExtremesY[i].max - chart._zoom.wheelExtremesDeltaY[i] * axis_wheelFactor;

				if (chart.yAxis[i].logarithmic && wheelMinY < 0) {
					wheelMinY = 0.0000000001;
				}

				if (wheelMaxY < wheelMinY) {
					wheelMaxY = 0.0000000001 + wheelMinY;
				}

				chart.yAxis[i].userMin = wheelMinY;
				chart.yAxis[i].userMax = wheelMaxY;
				chart.yAxis[i].options.userMin = wheelMinY;
				chart.yAxis[i].options.userMax = wheelMaxY;
				chart.yAxis[i].setExtremes(wheelMinY, wheelMaxY);
			}

			/* add reset button if not already set */
			if (chart._zoom.wheelZoomed || this._setZoomed) return;

			let button = chart.renderer.button("Reset zoom", chart.chartWidth - 104, 20);
			chart._zoom.wheelZoomed = true;

			/* hook into some display functions */
			if (typeof chart._setZoomExtremes === "function") {
				chart._setZoomExtremes(true);
			}

			if (typeof chart._setZoomLocks === "function") {
				chart._setZoomLocks(true);
			}

			/* disable mouse zoom & enable xy panning */
			chart.zooming.type = false;

			button
				.attr({ zIndex: 3 })
				.on("click", function () {
					/* restore x-Axis */
					let minX = chart._zoom.wheelExtremesX.min;
					let maxX = chart._zoom.wheelExtremesX.max;

					chart.xAxis[0].userMin = minX;
					chart.xAxis[0].userMax = maxX;
					chart.xAxis[0].options.userMin = minX;
					chart.xAxis[0].options.userMax = maxX;
					chart.xAxis[0].options.timeSpan = chart._zoom.wheelTimeSpan;
					chart.xAxis[0].options.timeSpanUnit = chart._zoom.wheelTimeUnit;
					chart.xAxis[0].setExtremes(minX, maxX);

					var tickInterval = chart._zoom.wheelTick;
					chart.xAxis[0].tickInterval = tickInterval;
					chart.xAxis[0].update({
						tickInterval: tickInterval
					});

					/* restore y-Axis */
					for (var i in chart.yAxis) {
						let minY = chart._zoom.wheelExtremesY[i].min;
						let maxY = chart._zoom.wheelExtremesY[i].max;

						chart.yAxis[i].userMin = minY;
						chart.yAxis[i].userMax = maxY;
						chart.yAxis[i].options.userMin = minY;
						chart.yAxis[i].options.userMax = maxY;
						chart.yAxis[i].setExtremes(minY, maxY);
					}

					/* reset wheel */
					chart._zoom.wheel = 0;
					chart._zoom.wheelFactor = 0;
					chart._zoom.wheelExtremesX = null;
					chart._zoom.wheelExtremesY = {};
					chart._zoom.wheelZoomed = false;

					/* hook into some display functions */
					if (typeof chart._setZoomExtremes === "function") {
						chart._setZoomExtremes(false);
					}

					if (typeof chart._setZoomLocks === "function") {
						chart._setZoomLocks(false);
					}

					/* reset mouse zoom & reset panning */
					chart.zooming.type = chart._zoom.zoomType;
					chart.options.chart.panning = chart._zoom.panning;

					button.destroy();
				})
				.add();
		});
	}, 1000);
}

/**
 * Prevent JSON Errors when parsing native strings or other values
 * @param value
 */
function saveJSONparse(value) {
	let tmp = {};

	if (typeof value === "string" || value instanceof String) {
		try {
			tmp = JSON.parse(value);
		} catch (ex) {}
	}

	return tmp;
}

/**
 * Tooltip formatter
 */
function formatter_tooltips(data) {
	var dateFormat = "%A, %d/%m/%Y %H:%M:%S";
	Highcharts.setOptions({
  lang: {
    weekdays: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
             'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  }
});

	if (data.point.id && data.point.id.indexOf("rightNonStopPoint") > -1) {
	var dateFormat = "%A, %d/%m/%Y %H:%M:%S";
	}

	var pointKey = data.point.key ? data.point.key : data.point.x;
	var header = '<span style="font-size: 20px; font-weight: bold;">' + 
             Highcharts.dateFormat(dateFormat, pointKey) + 
             "</span><br/>";

	var prefix = "",
		suffix = "",
		value = data.point.y;

	if (value && data.series.options.tooltip) {
		try {
			prefix = data.series.options.tooltip.valuePrefix ? data.series.options.tooltip.valuePrefix : "";
			suffix = data.series.options.tooltip.valueSuffix ? data.series.options.tooltip.valueSuffix : "";
			value =
				data.series.options.tooltip.valueDecimals && typeof data.point.y.toFixed == "function"
					? data.point.y.toFixed(data.series.options.tooltip.valueDecimals)
					: data.point.y;
			if (data.series.options.tooltip.valueExponential) value = webMI.sprintf("%.2e", value);
		} catch (ex) {
			console.error("Value conversion for " + value + " is not possible!");
		}
	}

	var text =
    '<span style="font-size: 18px; color:' +
    data.series.color +
    '">\u25CF</span> ' +
    '<span style="font-size: 18px;">' +
    data.series.name +
    ': <b>' +
    prefix +
    value +
    suffix +
    '</b></span><br/>';

	return header + text;
}

/**
 * yAxis formatter
 */
function formatter_yaxis(data) {
	var f = data.axis.options.labels.format;
	var value = data.value;

	if (typeof f == "undefined") f = "{value}";

	if (f.indexOf("value:") > -1) {
		f = f.split(/(.*)\{(.*)\:(.*)\}(.*)/g);

		for (var i in f) {
			if (f[i] == "value") f[i] = "%";
		}

		f = f.join("");

		value = webMI.sprintf(f, value);
	} else {
		value = f.replace("{value}", value);
	}

	return value;
}
