/*Fix for highcharts event-coordinates*/
(function (H) {
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

}(Highcharts));