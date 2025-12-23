(function (H) {
	/**
	 * Fired when the highcharts *series.update* method was invoked.
	 * @event trendSeriesUpdate
	 * @type {object}
	 * @property {object} detail
	 * @property {object} detail.options The options object the highcharts *series.update* method was called with.
	 */
	H.wrap(H.Series.prototype, 'update', function (proceed) {
		proceed.apply(this, Array.prototype.slice.call(arguments, 1));

		var seriesUpdateEvent = new CustomEvent('trendSeriesUpdate', {
			detail: {
				options: Array.prototype.slice.call(arguments, 1)[0]
			}
		});

		this.chart.renderTo.dispatchEvent(seriesUpdateEvent);
	});


	/**
	 * Fired when the highcharts *redraw* method was invoked.
	 * @event trendSetData
	 * @type {object}
	 * @property {object} detail
	 * @property {object} detail.data The data object the highcharts *addPoint* method was called with.
	 */
	H.wrap(H.Series.prototype, 'redraw', function (proceed) {
		proceed.apply(this, Array.prototype.slice.call(arguments, 1));

		var setRedrawEvent = new CustomEvent('trendRedrawPoint', {
			detail: {
				chart: this,
				data: Array.prototype.slice.call(arguments, 1)[0]
			}
		});

		this.chart.renderTo.dispatchEvent(setRedrawEvent);
	});


	/**
	 * Fired when the highcharts *setVisible* method was invoked.
	 * @event trendSetVisible
	 * @type {object}
	 * @property {object} detail
	 * @property {Boolean} detail.visible A boolean that indicates if a series is hidden or shown.
	 */
	H.wrap(H.Series.prototype, 'setVisible', function (proceed) {
		proceed.apply(this, Array.prototype.slice.call(arguments, 1));

		var setVisible = new CustomEvent('trendSetVisible', {
			detail: {
				visible: Array.prototype.slice.call(arguments, 1)[0]
			}
		});

		this.chart.renderTo.dispatchEvent(setVisible);
		this.chart.redraw(false);
	});
}(Highcharts));


