/*Set options for Highcharts globally*/

var atviseDefaults = {
	global: {
		useUTC: false
	},
	boost: {
		enabled: true && !!webgl_support() // Prevents setting boost to true if webgl is not supported
	},
	plotOptions: {
		// series: {
		//	turboThreshold: 0,
		//  boostThreshold: 1000
		// },
		line: {
			type: 'line'
		}
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	/*The highcharts-objectdisplay is overwriting the predefined atviseOptions */
	atviseOptions: {
		mode: 'mixed',
		source: 'opcUA',
		sourceOptions: "{}",
		downsamplingFactor: 1,
		liveModeFrameRate: 60 // [1 ... 60]fps
	},
	legend: {
		enabled: true
	},
	credits: {
		enabled: false
	},
	chart: {
		alignTicks: true,
		events: {
			redraw: function () {
				try {
					this._setRedrawComplete();
				} catch (ex) {
				}
			},
			selection: function (event) {
				if(event.xAxis || event.yAxis) {
					/* store original x axis time values */
					if(!this._zoomResetMinX && this._zoomResetMinX !== 0)
						this._zoomResetMinX = this.xAxis[0].min;
					if(!this._zoomResetMaxX && this._zoomResetMaxX !== 0)
						this._zoomResetMaxX = this.xAxis[0].max;

					/* store original y axis time values */
					if(!this._zoomResetMinY)
						this._zoomResetMinY = [];
					if(!this._zoomResetMaxY)
						this._zoomResetMaxY = [];

					for(var i in this.yAxis) {
						if(!this._zoomResetMinY[i] && this._zoomResetMinY[i] !== 0)
							this._zoomResetMinY[i] = JSON.parse(JSON.stringify(this.yAxis[i].min));
						if(!this._zoomResetMaxY[i] && this._zoomResetMaxY[i] !== 0)
							this._zoomResetMaxY[i] = JSON.parse(JSON.stringify(this.yAxis[i].max));
					}

					/* store original ticks */
					if(!this._zoomResetTickX)
						this._zoomResetTickX = this.xAxis[0].tickInterval;

					var newTickInterval = this.xAxis[0].tickInterval * (event.width / this.plotWidth);
					this.xAxis[0].tickInterval = newTickInterval;
					this.xAxis[0].update({
						tickInterval: newTickInterval
					});

					/* proceed zoom */
					this._setZoomed = true;

					/* hook into some display functions */
					if(typeof this._setZoomExtremes === "function") {
						this._setZoomExtremes(true);
					}

					if(typeof this._setZoomLocks === "function") {
						this._setZoomLocks(true);
					}
				} else {
					/* restore original x axis time values */
					this.xAxis[0].userMin = this._zoomResetMinX;
					this.xAxis[0].userMax = this._zoomResetMaxX;
					this.xAxis[0].options.userMin = this._zoomResetMinX;
					this.xAxis[0].options.userMax = this._zoomResetMaxX;
					this.xAxis[0].setExtremes(this._zoomResetMinX, this._zoomResetMaxX);

					this._zoomResetMinX = false;
					this._zoomResetMaxX = false;

					/* restore original y axis time values */
					for(var i in this.yAxis) {
						this.yAxis[i].min = this._zoomResetMinY[i];
						this.yAxis[i].max = this._zoomResetMaxY[i];

						this.yAxis[i].setExtremes(this._zoomResetMinY[i], this._zoomResetMaxY[i]);

						this._zoomResetMinY[i] = false;
						this._zoomResetMaxY[i] = false;
					}

					/* restore original ticks */
					this.xAxis[0].tickInterval = this._zoomResetTickX;
					this.xAxis[0].update({
						tickInterval: this._zoomResetTickX
					});

					this._zoomResetTickX = false;

					/* proceed reset zoom */
					this._setZoomed = false;

					try {
						this.resetZoomButton.destroy();
					} catch(ex) {
					}

					try {
						delete this.resetZoomButton;
					} catch(ex) {
					}

					/* hook into some display functions */
					if(typeof this._setZoomExtremes === "function") {
						this._setZoomExtremes(false);
					}

					if(typeof this._setZoomLocks === "function") {
						this._setZoomLocks(false);
					}

					event.preventDefault();
				}
			}
		},
		panKey: 'shift',
		style: {
			fontFamily: "Arial",
			fontSize: 20
		}
	},
	loading: {
		style: {
			position: 'absolute',
			opacity: 0.5,
			textAlign: 'center',
			zIndex: 10,
			backgroundImage: 'url("data:image/gif;base64,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")',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			backgroundPositionY: '55%'
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
				width: 30,
				height: 30,
				symbolSize: 30
			}
		},
		fallbackToExportServer: false,
		libURL: "/highcharts/lib/"
	},
	tooltip: {
		useHTML: true,
		followTouchMove: true,
		formatter: function () {
			var dateFormat = '%A, %e %b, %H:%M:%S';
			if (this.point.id && this.point.id.indexOf("rightNonStopPoint") > -1) {
				dateFormat = '%e %b %H:%M:%S';
			}

			var pointKey = this.point.key ? this.point.key : this.point.x;
			var header = '<span style="font-size: 20px"><b>' + Highcharts.dateFormat(dateFormat, pointKey) + '</b></span><br/>';

			var prefix = "", suffix = "", value = this.point.y;
			if (this.series.options.tooltip) {
				prefix = this.series.options.tooltip.valuePrefix ? this.series.options.tooltip.valuePrefix : "";
				suffix = this.series.options.tooltip.valueSuffix ? this.series.options.tooltip.valueSuffix : "";
				value = this.series.options.tooltip.valueDecimals && typeof this.point.y.toFixed == "function" ? this.point.y.toFixed(this.series.options.tooltip.valueDecimals) : this.point.y;
			}
			var text = '<span style="font-size:20px;color:' + this.series.color + '">\u25CF ' + this.series.name + ': <b>' + prefix + value +' '+ suffix + '</b></span><br/>';
			return header + text;
		}
	},
	xAxis: {
		events: {
			setExtremes: function () {
				try {
					this.chart._setExtremesComplete();
				} catch (ex) {
				}
			}
		},
		lineColor: '#ccd6eb',
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
		lineColor: '#ccd6eb',
		lineWidth: 1,
		minorGridLineColor: "#eeeeee",
		minorGridLineWidth: 1,
		opposite: false,
		startOnTick: true		
	}
};

if (!webMI.getClientInfo().isDesktop) {
	atviseDefaults.navigation = {
		"menuStyle": {height: "300px",width:"300px", overflow: "auto"}
	};
}

// Helper function

function webgl_support() {
	try {
		var canvas = document.createElement("canvas");
		return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
	} catch (e) {
		return false;
	}
}
