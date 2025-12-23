/** @module Tables */


/**
 * Controller for the extended data flow between client and server with integrated data store.
 *
 * Runtime behavior depends on mode settings. Following modes are available:
 *
 * | option    | description                                                         |
 * | --------- | ------------------------------------------------------------------- |
 * | once      | client loads only the first data packet and ignores further packets |
 * | triggered | client loads the data package only on request by an event           |
 * | continue  | client loads the data packets continuously until the end            |
 * | live      | server sends data to the client                                     |
 * | pause     | internal mode! (not supported in configurations)                    |
 *
 * ---
 * Difference between once and live:
 * The data controller does not distinguish between the once and live mode.
 * The query is only sent once in both cases. In the case of live messages, however,
 * the data is sent from the server after the first request sent to the client continuously.
 * To pass this information on to the user, the mode must be set accordingly.
 * (once for calls, live for subscriptions)
 * @constructor
 */
function DataController() {
	var that = this;
	var internal = {};
	var controllerTimeoutList = [];

	/**
	 * Definition of available data collection modes
	 * @type {{once: string, triggered: string, continue: string, live: string}}
	 */
	internal.modes = {
		once: "client only loads first data package",
		triggered: "client loads data package on event",
		manually: "client loads data package on user request",
		continue: "client loads data packet continuously",
		live: "server sends data to the client",
	};


	/**
	 * Operating mode of the data controller
	 * @type {null}
	 */
	internal.mode = null;


	/**
	 * Settings for continuation points
	 * @type {Array}
	 */
	internal.continuation = [];
	internal.continuation.force = null;
	internal.continuation.CP = null;
	internal.continuation.interval = 250;
	internal.continuation.timeout = null;
	internal.continuation.userEventDelay = 0;


	/**
	 * Data Storage
	 * @type {Array}
	 */
	internal.model = [];
	internal.model.id = 0;
	internal.model.data = {};


	/**
	 * Buffer Settings
	 * @type {Array}
	 */
	internal.buffer = [];
	internal.buffer.stack = [];
	internal.buffer.timeout = 0;
	internal.buffer.interval = 50;
	internal.buffer.lastcall = 0;


	/**
	 * Truncate Settings
	 * @type {Array}
	 */
	internal.truncate = [];
	internal.truncate.start = 0;
	internal.truncate.size = 1000000;
	internal.truncate.reverse = false;
	internal.truncate.overflow = true;
	internal.truncate.isActive = false;


	/**
	 * Trigger
	 * @type {Array}
	 */
	internal.trigger = [];
	internal.trigger.running = false;

	/**
	 * Timeouts start and run requests
	 */
	internal.timeout = [];
	internal.timeout.startTimeout = null;
	internal.timeout.retardmentTimeout = null;

	/**
	 * Adds data to the model and forwards it to the UI
	 * @param {object} data containing continuation and records
	 * @param {object} data.CP Object
	 * @param {string} data.CP.field Custom field name to be returned if continued (e.g. custom request)
	 * @param {string} data.CP.value Custom value to be returned if continued (e.g. custom request)
	 * @param {number} data.continuationpoint Continuation point of the server response
	 * @param {object} data.result Array of Records
	 * @param {UIController} UIController Controller for UI processing (e.g. SlickController)
	 * @returns {Array} id list of added items
	 */
	this.addModelData = function (data, UIController) {

		/* detection of empty records */
		if (data.result.length == 0) {
			console.warn("DataController: Empty recognized value was automatically discarded!");
			return false;
		}

		/* autocorrection for single values */
		var result = data.result;
		if (typeof result[0] == "undefined") {
			result = [];
			result.push(data.result);
		}

		/* check for continuation informations */
		internal.continuation.force = null;
		if (typeof data["CP"] != "undefined") {
			internal.continuation.CP = data["CP"];
			internal.continuation.force = data["CP"] === 0 ? false : true;
		}

		/* remember processed ids */
		var data_id_list = [];

		/** truncate **/
		var isTruncate = false;
		if (internal.truncate.size > 0 && result.length > 0) {
			var spaceUsed = Object.keys(internal.model.data).length;
			var spaceLeft = internal.truncate.size - spaceUsed;

			var addItems = result.length > internal.truncate.size ? internal.truncate.size : result.length;
			if (internal.truncate.overflow)
				addItems = addItems < spaceLeft ? addItems : spaceLeft;

			var removeItems = (addItems - spaceLeft) > 0 && spaceUsed > 0 ? addItems : 0;
			if (removeItems > 0 || addItems < result.length) {
				isTruncate = true;
				internal.truncate.isActive = true;
			}

			if (!internal.truncate.overflow) {
				if (removeItems > 0) {
					var keyList = Object.keys(internal.model.data);
					var deleteList = [];
					UIController.suspendUpdate();
					if (internal.truncate.reverse) {
						ri = 0;
						while (ri < removeItems) {
							UIController.removeData("id_" + keyList[ri], true);
							ri++;
						}
					} else {
						ri = removeItems;
						while (ri > 0) {
							UIController.removeData("id_" + keyList[ri], true);
							ri--;
						}
					}
					UIController.unSuspendUpdate();
				}
			}

			if (addItems > 0 && !internal.truncate.reverse) {
				var pos = 0;
				while (pos < addItems) {
					data_id_list.push(internal._addData(result[pos]));
					pos++;
				}
			} else if (addItems > 0 && internal.truncate.reverse) {
				var pos = 0;
				while (pos < addItems) {
					data_id_list.push(internal._addData(result[result.length - 1 - pos]));
					pos++;
				}
			}

			if (internal.truncate.overflow && isTruncate) {
				internal.mode = "DONE";
			}
		}

		/* send data to the UIController */
		function publishReady(UIController) {
			var data_id_list = internal.buffer.stack;
			internal.buffer.stack = [];
			internal.buffer.lastcall = Date.now();
			UIController.publish(data_id_list, {
					continuation: internal.continuation.force,
					mode: internal.mode,
					truncate: isTruncate
				}
			);
		}

		/* buffer mode */
		if (typeof UIController == "object") {
			var delay = Math.floor((Date.now() - internal.buffer.lastcall));
			internal.buffer.stack.push.apply(internal.buffer.stack, data_id_list);
			if (internal.buffer.interval > 0) {
				if (!internal.buffer.timeout) {
					internal.buffer.timeout = setTimeout(function () {
						internal.buffer.timeout = null;
						publishReady(UIController, internal.buffer.stack);
					}, internal.buffer.interval);
					controllerTimeoutList.push(internal.buffer.timeout);
				}
			} else {
				publishReady(UIController, internal.buffer.stack);
			}
		}

		/** add another round if cp found **/
		if (internal.modes[internal.mode] == internal.modes["continue"] && internal.continuation.force == true) {
			internal.continuation.timeout = setTimeout(
				function () {
					that.run(internal.continuation);
				},
				internal.continuation.interval
			);
			controllerTimeoutList.push(internal.continuation.timeout);
		}

		/** reset trigger, all done **/
		internal.trigger.running = false;

		/* return processed ids */
		return data_id_list;
	};


	/**
	 * Remove all data from the model
	 * @returns {boolean} success of operation
	 */
	this.clearModelData = function () {
		// clear timeouts
		clearTimeout(internal.continuation.timeout);
		internal.continuation.timeout = null;
		//call release function
		if (typeof this.dataRelease == "function")
			this.dataRelease(internal.continuation);
		// clear cp
		internal.continuation = [];
		internal.continuation.force = null;
		internal.continuation.CP = null;
		// clear buffer
		internal.buffer.stack = [];
		// clear model
		internal.model = [];
		internal.model.id = 0;
		internal.model.data = {};
		// clear truncate
		internal.truncate.isActive = false;
		return true;
	};


	/**
	 * Delete data from the model
	 * @param {number} id id of item to be deleted
	 * @returns {boolean} success of operation
	 */
	this.deleteModelData = function (id) {
		var index = id.match(/\d+/)[0];
		if (typeof internal.model.data[index] != "undefined") {
			delete internal.model.data[index];
			return true;
		}
		return false;
	}


	/**
	 * Get data from the data model
	 * @param {number} [id] id of the item to be returned. leave blank to get all the items in the list.
	 * @returns {Array} array of items
	 */
	this.getModelData = function (id) {
		var records = [];
		if (typeof id != "undefined") {
			records[0] = internal._getModelData(id);
		} else {
			for (var recs in internal.model.data)
				records[recs] = internal.model.data[recs];
		}
		return records;
	};


	/**
	 * Return data from a selected area from the data model
	 * @param {Array} id_list ids of items to be returned
	 * @returns {Array} items
	 */
	this.getModelDataByRange = function (id_list) {
		var data = [];
		for (var id in id_list) {
			data.push(internal._getModelData(id_list[id]));
		}
		return data;
	};


	/**
	 * Returning current information abbaut mode, continuation and size
	 * @returns {{mode: string, continuation: boolean, size: number}}
	 */
	this.getStatus = function () {
		return {
			mode: internal.mode,
			continuation: internal.continuation.force,
			size: Object.keys(internal.model.data).length,
			truncate: internal.truncate.isActive
		};
	}


	/**
	 * Enforce a delay between the request (for onClick events, for example)
	 * @param customTimeout
	 */
	this.userEventDelay = function (customTimeout) {
		if (internal.continuation.userEventDelay == 0) {
			if (!customTimeout || customTimeout < 0)
				customTimeout = 1000;
			internal.continuation.userEventDelay = customTimeout;
		}
	}


	/**
	 * Starts the request loop or continues
	 * @param {continuation} [continuation] continuation information todo: add doc
	 */
	this.run = function (continuation) {
		if (internal.mode == null) {
			throw new Error('You have to set mode!');
		}
		// retardment if request function not ready
		if (typeof that.dataRequest == "function" && internal.continuation.userEventDelay == 0) {
			that.dataRequest(continuation);
			internal.continuation.timeout = null;
		} else {
			if (internal.timeout.retardmentTimeout)
				clearTimeout(internal.timeout.retardmentTimeout);

			internal.timeout.retardmentTimeout = setTimeout(function retardmentStart(e) {
				that.run(continuation);
				internal.continuation.userEventDelay = 0;
			}, internal.continuation.userEventDelay ? internal.continuation.userEventDelay : 25);
			controllerTimeoutList.push(internal.timeout.retardmentTimeout);
		}
	};


	/**
	 * Safe start of the controller
	 * @param startCallback
	 */
	this.start = function (startCallback) {
		if (internal.continuation.timeout) {
			internal.timeout.startTimeout = setTimeout(function retardmentStart(e) {
				that.start(startCallback);
			}, internal.continuation.userEventDelay ? internal.continuation.userEventDelay : 25);
			controllerTimeoutList.push(internal.timeout.startTimeout);
		} else {
			if (typeof startCallback == "function")
				startCallback();
			that.run();
		}
	}


	/**
	 * Searches the data model for a specific value in the specified attribute
	 * @param {string} attribute attribute in which to search
	 * @param {string} value value to be sought
	 * @param {boolean} [exact = false] search mode. if true, the value must match exactly, otherwise the occurrence is checked.
	 * @returns {*} items matched
	 */
	this.search = function (attribute, value, exact) {
		var item_list = [];
		var exact = typeof exact != "undefined" ? exact : false;

		if (internal.model.id > 0) {
			for (var pos in internal.model.data) {
				var item = internal.model.data[pos];
				if (typeof item[attribute] != "undefined") {
					if (exact && item[attribute] == value) {
						item_list.push(item);
					} else if (!exact && item[attribute].toString().indexOf(value) > -1) {
						item_list.push(item);
					}
				}
			}
			return item_list;
		} else {
			return false;
		}
	}


	/**
	 * Set the runtime parameters
	 * @param {object} config configuration of the data controller
	 * @param {number} [config.bufferInterval = 50] Time in milliseconds that data is collected before being passed to the UI. 0 to disable buffering of data.
	 * @param {number} [config.continuationInterval = 250] Period between the retrieval of data from the server before publication in milliseconds.
	 * @param {enum} config.mode Runtime specification (e.g. once)
	 * @param {boolean} [config.truncateOverflow = true] Data that exceed the truncated limit will not be processed (true), otherwise the oldest data will be discarded (false).
	 * @param {boolean} [config.truncateReverse = true] Data is truncated at the end (true), on the other hand they are cut off at the beginning (false).
	 * @param {number} [config.truncateSize = 1000000] Elements in the memory before truncation starts. 0 to disable the truncate function.
	 */
	this.setConfig = function (config) {
		/** mandatory **/
		if (typeof internal.modes[config.mode] != "undefined") {
			internal.mode = config.mode;
		} else {
			console.warn('DataController: unknown mode "' + config.mode + '"');
		}
		if (typeof config.continuationInterval != "undefined")
			internal.continuation.interval = config.continuationInterval;
		if (typeof config.bufferInterval != "undefined")
			internal.buffer.interval = config.bufferInterval;
		/** optional **/
		if (typeof config.truncateSize != "undefined" && config.truncateSize > 0)
			internal.truncate.size = config.truncateSize;
		if (typeof config.truncateReverse != "undefined")
			internal.truncate.reverse = config.truncateReverse;
		if (typeof config.truncateOverflow != "undefined")
			internal.truncate.overflow = config.truncateOverflow;
	};


	/**
	 * Changing operation mode at runtime (e.g. switch from trigger to continue mode)
	 * @param {enum} mode Runtime specification (e.g. once, also pause available at this point)
	 */
	this.switchMode = function (mode) {
		if (internal.mode != mode) {
			if (internal.mode == "live" || mode == "live") {
				// all ok
			} else if (internal.mode == "triggered" && !(mode != "force" || mode != "continue" || mode != "pause")) {
				console.warn("DataController: Mode change from " + internal.mode + " to " + mode + " is not permitted!");
				return;
			} else if (internal.mode == "continue" && !(mode != "force" || mode != "triggered" || mode != "pause")) {
				console.warn("DataController: Mode change from " + internal.mode + " to " + mode + " is not permitted!");
				return;
			}
			if (mode == "force") {
				mode = "continue"
				this.run(internal.continuation);
			}
			internal.mode = mode;
		} else {
			// ignore change!
		}
	}


	/**
	 * Triggering of the data request by a trigger condition
	 * @param (boolean) manuallyRequest allow a manual request
	 * @returns {boolean} success of operation
	 */
	this.trigger = function (manuallyRequest) {
		if (internal.mode == "pause")
			return false;

		if (typeof manuallyRequest != "undefined" && manuallyRequest == true) {
			if (internal.modes[internal.mode] == internal.modes["manually"] && internal.continuation.force) {
				this.run(internal.continuation);
			} else if (internal.modes[internal.mode] == internal.modes["manually"] && !internal.continuation.force) {
				return false;
			}
		}

		if (!internal.trigger.running) {
			internal.trigger.running = true;
			if (internal.modes[internal.mode] == internal.modes["triggered"] && internal.continuation.force) {
				this.run(internal.continuation);
			} else if (internal.modes[internal.mode] == internal.modes["triggered"] && !internal.continuation.force) {
				return false;
			} else {
				return false;
			}
		}
		return true;
	};


	/**
	 * Unload function for memory cleanup
	 */
	this.destroy = function () {
		/** clean all timeouts **/
		for (var to in controllerTimeoutList) {
			if (controllerTimeoutList[to] != null) {
				clearTimeout(controllerTimeoutList[to]);
			}
		}

		/** clear all components **/
		for (var component in this) {
			try {
				this[component].destroy();
				this[component] = null;
				delete this[component];
			} catch (ex) {
				this[component] = null;
				delete this[component];
			}
		}
	};


	/**
	 * Replaces the data of a data record with new data
	 * @param {id} id id of the item to be replaced
	 * @param {object} item item to be replaced
	 * @returns {boolean} success of operation
	 */
	this.updateModelData = function (id, item) {
		var index = id.match(/\d+/)[0];
		if (typeof internal.model.data[index] != "undefined") {
			internal.model.data[index] = item;
			return true;
		} else {
			return false;
		}
	};


	/**
	 * Function to be implemented in a new controller
	 * @abstract
	 */
	this.dataRequest = function () {
		throw new Error('You have to implement the method dataRequest!');
	};


	/***************************************************************/
	/********************* PRIVATE METHODS *************************/
	/***************************************************************/


	/**
	 * Add data to model
	 * @param {data} data
	 * @returns {*}
	 * @private
	 */
	internal._addData = function (data) {
		var record = JSON.parse(JSON.stringify(data));
		record["id"] = "id_" + internal.model.id;
		internal.model.data[internal.model.id] = record;
		internal.model.id++;
		return record["id"];
	}


	/**
	 * Returns data by id
	 * @param id
	 * @returns {*}
	 * @private
	 */
	internal._getModelData = function (id) {
		var index = id.match(/\d+/)[0];
		return internal.model.data[index];
	};
}