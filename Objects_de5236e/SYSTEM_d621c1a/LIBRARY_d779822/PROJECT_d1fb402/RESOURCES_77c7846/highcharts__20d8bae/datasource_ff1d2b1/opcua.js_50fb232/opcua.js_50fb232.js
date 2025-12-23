/* global Datasource ,webMI, Promise */

(function (win) {
	"use strict";

	/**
	 * Provides data fetching methods for the opcUA channel.
	 * @module opcUAData
	 * @extends Datasource
	 */

	var Datasource = win.Datasource;

	/**
	 * @alias module:opcUAData
	 */
	var opcUA = Datasource.register("opcUA", function () {
		//subscribe is only resubscribing nodes that have not been subscribed already
		this._lazyResubscribe = false;

		//interval for subscription callback invocation
		this.subscriptionCallbackInterval = 50;

		//initialize subscriptions variables
		this.subscriptions = [];
		this.subscriptionErrors = {};
		this.subscriptionValues = {};
		this.valuesUpdated = false;
	});

	/**
	 * OpcUA specific implementation to listen on value changes of registered nodes.
	 * @see    Datasource#_loadPoints
	 */
	opcUA.prototype._loadPoints = function (options, callback) {
		var from = options.from;
		var until = options.until;
		var nodes = options.nodes;
		var dataArchives = options.dataArchives;

		function validateAggregateOptions(options) {
			if (typeof options == "undefined") return {};

			for (var i in options) {
				if (typeof options[i] == "undefined") {
					options[i] = "";
					continue;
				}

				var aggregate = options[i].aggregate;
				var interval = options[i].interval;
				var unit = options[i].unit;
				var validUnits = ["s", "m", "h", "d", "M"];

				if (typeof aggregate == "undefined" || typeof interval == "undefined" || typeof unit == "undefined")
					options[i] = "";
				else if (aggregate == "" || interval == "" || validUnits.indexOf(unit) == -1) options[i] = "";
			}

			return options;
		}

		var aggregateOptions = validateAggregateOptions(options.aggregateOptions);
		var queries = [];

		forEachNode(nodes, function (key, address) {
			var slashPosition = address.indexOf("/");
			if (slashPosition > 0) address = address.substr(slashPosition + 1);

			var filter = createFilter(address, aggregateOptions[key], from, until, dataArchives[key]);
			queries.push(
				new Promise(function (resolve, reject) {
					webMI.data.queryFilter(filter, processHistoryData.bind(null, resolve, reject, address, key));
				})
			);
		});

		Promise.all(queries).then(processQueryResults.bind(null, callback), function (error) {
			callback(error, null);
		});
	};

	/**
	 * OpcUA specific implementation to listen on value changes of registered nodes.
	 * @see    Datasource#_subscribe
	 */
	opcUA.prototype._subscribe = function (options, callback) {
		var self = this;
		var nodes = options.options.nodes;

		subscribeNodes(this, options);

		if (this.intervalID === null || this.intervalID === undefined) {
			this.intervalID = window.setInterval(function subscribeValueUpdate() {
				if (self.valuesUpdated) {
					callback(isEmptyObject(self.subscriptionErrors) ? null : self.subscriptionErrors, self.subscriptionValues);
					self.subscriptionErrors = {};
					self.subscriptionValues = {};
					self.valuesUpdated = false;
				}
			}, this.subscriptionCallbackInterval);
		}
	};

	/**
	 * OpcUA specific implementation to stop listening on value changes of registered nodes.
	 * @see    Datasource#_unsubscribe
	 */
	opcUA.prototype._unsubscribe = function () {
		if (this.intervalID !== null && this.intervalID !== undefined) {
			window.clearInterval(this.intervalID);
			this.intervalID = null;
		}

		unsubscribeNodes(this.subscriptions);

		this.subscriptions = [];
		this.subscriptionErrors = {};
		this.subscriptionValues = {};
		this.valuesUpdated = false;
	};

	/**
	 * Processes the node update and subscribes new nodes when a subscription is currently active.
	 * @see    Datasource#_updateNodes
	 */
	opcUA.prototype._updateNodes = function (options) {
		var self = this;
		var nodes = options.nodes;
		var currentNodeMap = options.currentNodeMap;

		for (var key in this.subscriptions) {
			var index = this.subscriptions[key].id;
			unsubscribeNodes(this.subscriptions[key]);
		}

		this.subscriptions = [];

		if (this._activeSubscription) {
			subscribeNodes(this, options);
		}
	};

	/**
	 * Fetches the source time from the opcUA target.
	 * @see    Datasource#_getTime
	 */
	opcUA.prototype._getTime = function (callback) {
		//TODO: MIGO implement correct server time fetch
		var time = new Date().getTime();
		callback(null, time);
	};

	/**
	 * Set the subscription callback interval.
	 * @see    Datasource#_setSubscriptionCallbackInterval
	 */
	opcUA.prototype._setSubscriptionCallbackInterval = function (interval) {
		this.subscriptionCallbackInterval = interval;
	};

	/**managerSubscribe
	 * Determination correct server offset
	 * @param callback fkt
	 */
	opcUA.prototype._getServerTimeOffset = function (callback) {
		var self = this;
		if (typeof this.serverTimeOffset == "undefined") {
			this.serverTimeOffset = 0;
			webMI.addEvent(webMI.data, "servertimeoffsetchanged", function (offset) {
				self.serverTimeOffset = offset;
			});
		}

		if (callback) {
			callback(this.serverTimeOffset);
		} else {
			return this.serverTimeOffset;
		}
	};

	//Private Methods
	function subscribeNodes(self, options) {
		subscribeNodeFunction(self, options);

		function subscribeNodeFunction(self, options) {
			var nodes = options.options.nodes;
			forEachNode(nodes, function (key, address) {
				var aggregate = false;
				if (typeof options.options.aggregateOptions != "undefined") aggregate = options.options.aggregateOptions[key];
				if (!nodeIsSubscribed(self.subscriptions, key, address, aggregate)) {
					var subscriptionID = managerSubscribe(address, aggregate, processLiveData.bind(self, key));
					self.subscriptions.push({ id: subscriptionID, index: key, address: address, aggregate: aggregate });
				}
			});
		}

		function managerSubscribe(nodeAddress, nodeAggregate, createCallback) {
			if (!isAggregate(nodeAggregate)) {
				return webMI.data.subscribe(nodeAddress, createCallback);
			} else {
				var AggregateConfig = [];
				AggregateConfig["address"] = nodeAddress;
				AggregateConfig["aggregate"] = nodeAggregate["aggregate"];
				AggregateConfig["interval_value"] = nodeAggregate["interval"];
				AggregateConfig["interval_unit"] = nodeAggregate["unit"];
				return AggregateManager.subscribeAggregate(AggregateConfig, createCallback);
			}
		}

		function isAggregate(nodeAggregate) {
			if (!nodeAggregate || nodeAggregate == "") return false;
			if (nodeAggregate.aggregate != "" && nodeAggregate.interval != "" && nodeAggregate.unit != "") return true;
			return false;
		}
	}

	function unsubscribeNodes(subscriptions) {
		if (!webMI) {
			return; //when page is refreshed webMI is not defined anymore
		}

		if (Array.isArray(subscriptions)) {
			for (var i = 0; i < subscriptions.length; i++) {
				var hasAggregate =
					typeof subscriptions[i]["aggregate"] != "undefined" &&
					subscriptions[i]["aggregate"] != "" &&
					subscriptions[i]["aggregate"]["aggregate"] != "";

				if (subscriptions[i].id && !hasAggregate) {
					webMI.data.unsubscribe(subscriptions[i].id);
				} else if (subscriptions[i].aggregate) {
					if (!AggregateManager.unsubscribeAggregate(subscriptions[i].id)) {
						webMI.data.unsubscribeFilter(subscriptions[i].id);
					}
				}
			}
		} else {
			if (subscriptions.id && (!subscriptions.aggregate || subscriptions.aggregate == "")) {
				webMI.data.unsubscribe(subscriptions.id);
			} else if (subscriptions.aggregate) {
				if (!AggregateManager.unsubscribeAggregate(subscriptions.id)) {
					webMI.data.unsubscribeFilter(subscriptions.id);
				}
			}
		}
	}

	function processLiveData(nodeMapIndex, data) {
		if (isBadStatus(data)) return;

		if (data.error) {
			this.subscriptionErrors[nodeMapIndex] = new Error(data.errorstring);
		} else {
			delete this.subscriptionErrors[nodeMapIndex];
			// don't override old subscriptionvalues if not processed yet
			if (typeof this.subscriptionValues[nodeMapIndex] === "undefined") {
				this.subscriptionValues[nodeMapIndex] = [];
			}
			this.subscriptionValues[nodeMapIndex].push(mapNodeData(data));
		}
		this.valuesUpdated = true;
	}

	function processHistoryData(resolve, reject, node, key, e) {
		if (e.error) {
			resolve({ points: [], key: key, more: false });
			console.warn("The reading of historicized data is not supported by the server");
			// reject(new Error('ErrorCode: ' + e.error + '\n' + e.errorText));
		} else if (e.result.length < 1) {
			//resolve({points: [], key: key, error: new Error('History data for Node ' + node + ' could not be loaded')});	//Fire also error if no points are available
			resolve({ points: [], key: key, more: false });
		} else {
			var nodeData = e.result;
			var more = e.More;
			resolve({ points: mapNodeData(nodeData), key: key, more: more });
		}
	}

	function processQueryResults(callback, results) {
		var fetchedData = {};
		var loadErrors = {};
		var errors = false;
		var more = false;
		for (var i = 0; i < results.length; i++) {
			var data = results[i];
			fetchedData[data.key] = data.points;
			if (data.error) {
				errors = true;
				loadErrors[data.key] = data.error;
			}
			more = more ? more : data.more;
		}
		callback(errors ? loadErrors : null, fetchedData, more);
	}

	function createFilter(nodeAddress, aggregateOptions, from, until, dataArchive) {
		var exactMatchPrefix = "v:";
		var valuePairPrefix = "n:";
		var filter = {};
		filter.type = ["v:1"];
		if (language) filter.language = [exactMatchPrefix + language];

		filter.address = [exactMatchPrefix + nodeAddress];
		if (from && until) {
			filter.timestamp = [valuePairPrefix + ">=" + from + "<" + until];
		} else if (from) {
			filter.timestamp = [valuePairPrefix + ">=" + from];
		} else if (until) {
			filter.timestamp = [valuePairPrefix + "<=" + until];
		}
		if (aggregateOptions) {
			filter.aggregate = [exactMatchPrefix + aggregateOptions.aggregate];
			filter.interval = [exactMatchPrefix + aggregateOptions.interval];
			filter.unit = [exactMatchPrefix + aggregateOptions.unit];
		}
		if (dataArchive && dataArchive != "") {
			filter.archive = [exactMatchPrefix + dataArchive];
		}

		return filter;
	}

	function mapNodeData(nodeData) {
		var points = [];
		if (Array.isArray(nodeData)) {
			for (var i = 0; i < nodeData.length; i++) {
				var dataPoint = nodeData[i];
				points.push([dataPoint.timestamp, dataPoint.value]);
			}
		} else {
			points = [nodeData.timestamp, nodeData.value];
		}
		return points;
	}

	function nodeIsSubscribed(subscriptions, nodeMapIndex, nodeAddress, aggregate) {
		for (var i = 0; i < subscriptions.length; i++) {
			var sameAggregateParameter = JSON.stringify(subscriptions[i].aggregate) === JSON.stringify(aggregate);
			if (
				subscriptions[i].index === nodeMapIndex &&
				subscriptions[i].address === nodeAddress &&
				sameAggregateParameter
			) {
				return true;
			}
		}
		return false;

		/*
		for (var i = 0; i < subscriptions.length; i++) {
			if (subscriptions[i].index === nodeMapIndex && subscriptions[i].address === nodeAddress) {
				return true;
			}
		}
		return false;
		*/
	}

	function nodeInMap(nodeMap, nodeKey, nodeAddress) {
		var entryFound = false;
		forEachNode(nodeMap, function (nodeMapKey, address) {
			if (nodeKey === nodeMapKey && nodeAddress === address) {
				entryFound = true;
				return false;
			}
		});

		return entryFound;
	}

	function getSubscriptionEntry(subscriptions, nodeMapIndex, nodeAddress) {
		for (var i = 0; i < subscriptions.length; i++) {
			if (subscriptions[i].index === nodeMapIndex && subscriptions[i].address === nodeAddress) {
				return subscriptions[i];
			}
		}
		return -1;
	}

	function forEachNode(nodeMap, callback) {
		for (var key in nodeMap) {
			if (callback(key, nodeMap[key]) === false) {
				break;
			}
		}
	}

	function isEmptyObject(arg) {
		var empty = true;
		for (var i in arg) {
			empty = false;
		}
		return empty;
	}

	function isBadStatus(e) {
		return "status" in e && !isGoodStatus(e);
	}

	function isGoodStatus(e) {
		return "status" in e && (e.status & 0xc0000000).toString(16) == 0;
	}
})(window);
