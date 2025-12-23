/*jshint unused:false*/
var AggregateManager = null;
try {
	AggregateManager = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Aggregate Manager");
	webMI.addOnunload(function() {
		AggregateManager.destroy();
		AggregateManager = null;
	});
} catch(ex){
	console.log("AggregateManager extensions not available for unit tests");
}

(function (win) {
	'use strict'

	var _registeredDatasources = {};

	/**
	 * A nodeMap is a an assignment of node-entry to node address.
	 * @typedef {object} nodeMap
	 * @property {integer} nodeEntry
	 * @property {string} nodeAddress
	 */

	/**
	 * @callback {function} Datasource#loadPointsCb
	 * @param {object} errors Errors for a specific node that came up during the load process.
	 * @param {object} data The fetched archive data for the nodes that have been processed successfully.
	 */

	/**
	 * @callback {function} Datasource#subscribeCb
	 * @param {object} errors Errors for a specific node that came up during the subscription process.
	 * @param {object} data The data changes for the nodes that have been subscribed successfully.
	 */

	/**
	 * @callback {function} Datasource#sourceTimeCb
	 * @param {object} errors
	 * @param {time} sourcetime
	 */

	/**
	 * Creates a Datasource, that provides methods to fetch data from different datasources.
	 * @param {object} options
	 * @param {string} options.type The type of datasource that should be used.
	 * @param {nodeMap} options.nodes The nodes that should be used for subscribing on datachanges. They have to be specified in the form of a nodeMap e.g. {0:"ADDRESS1",1:"ADDRESS2"}
	 * @class
	 * @alias Datasource
	 */
	function Datasource(options) {
		if (options.type) {
			var type = options.type;

			if (_registeredDatasources[type]) {
				var childOpts = options;
				childOpts.type = false;

				return new _registeredDatasources[type](childOpts);
			}

			throw new Error(['Unknown datasource type', type].join(' '));
		}

		// Handle options
		this.nodeMap = options.nodes;
		if (!nodeMapValid(this.nodeMap)) {
			throw(new Error("Nodes have to be specified as nodeMap object!"));
		}

		// Set default values
		this._activeSubscription = false;
		this._lazyResubscribe = true; //unsubscribe all nodes before resubscribing - potential data loss!

		this._option = options.option;
		try {
			this._option = JSON.parse(options.option);
		} catch(ex) {
			// could not validate as json, use as string
		}
	}


	/**
	 * Registers the data modules on the datasource class to make them available to the user.
	 * @param {string} type Datasource type that the data module provides
	 * @param {function} ctor Constructor of data module (sub-class).
	 */
	Datasource.register = function (type, ctor) {
		var DatasourceChildClass = function ChildClass(options) {
			Datasource.call(this, options);
			ctor.call(this, options);
		};

		DatasourceChildClass.prototype = Object.create(Datasource.prototype);
		DatasourceChildClass.prototype.constructor = DatasourceChildClass;
		//TODO: auslesbar machen
		_registeredDatasources[type] = DatasourceChildClass;

		return DatasourceChildClass;
	};

	/**
	 * Returns an array of all registered datasource types
	 */
	Datasource.getDatasourceTypes = function() {
		return Object.keys(_registeredDatasources);
	}

	/**
	 * Loads data from the archive, starting at a specific point in time.
	 * @param {object} options
	 * @param {number} options.from The point in time the history query should start at.
	 * @param {number} options.until The point in time the history query should end at.
	 * @param {Datasource#loadPointsCb} callback The function that is invoked with the archive values.
	 * @async
	 */
	Datasource.prototype.loadPoints = function (options, callback) {
		if (!validateCallbackFunction(callback)) {
			throw(new Error("Callback not from type function!"));
		}

		if (!nodeMapValid(options.nodes)) {
			throw(new Error("Nodes have to be specified as nodeMap object!"));
		}

		if (!options.from) {
			callback(new Error('option from must be set'));
		}

		this._loadPoints({
			from: options.from,
			until: options.until,
			nodes: options.nodes || this.nodeMap,
			aggregateOptions: options.aggregateOptions,
			dataArchives: options.dataArchives
		}, callback);
	};

	/**
	 * Subscribes on value changes for the stored nodeMap.
	 * @param {Datasource#subscribeCb} callback The function that is invoked with the updated values.
	 */
	Datasource.prototype.subscribe = function (callback) {
		if (!validateCallbackFunction(callback)) {
			throw(new Error("Callback not from type function!"));
		}

		if (this._activeSubscription && this._lazyResubscribe) {
			this.unsubscribe();
		}

		this._subscribe({
			options: this.optionMap
		}, callback);

		this._activeSubscription = true;
	};

	/**
	 * Unsubscribes from value changes for the stored nodeMap.
	 */
	Datasource.prototype.unsubscribe = function () {
		if (!this._activeSubscription) {
			return;
		}

		this._unsubscribe();

		this._activeSubscription = false;
	};

	/**
	 * Updates the internally stored nodeMap.
	 * @param options
	 * @param options.nodes The new nodeMap that should be used.
	 * @return {nodeMap} updated nodemap
	 */
	Datasource.prototype.updateNodes = function (options) {
		if (!nodeMapValid(options.nodes)) {
			throw(new Error("Nodes have to be specified as nodeMap object!"));
		}

		this._updateNodes(
			{
				currentNodeMap: this.nodeMap,
				options: options
			});

		this.optionMap = options;
		return this.optionMap;
	};

	/**
	 * Returns the time at the datasource, through a callback.
	 * @param {Datasource#sourceTimeCb} callback
	 */
	Datasource.prototype.getTime = function (callback) {
		if (!validateCallbackFunction(callback)) {
			throw(new Error("Callback not from type function!"));
		}

		this._getTime(callback);
	};


	/**
	 * Returns server offset time or execute callback
	 * @param callback
	 * @returns {number}
	 */
	Datasource.prototype.getServerTimeOffset = function(callback) {
		return this._getServerTimeOffset(callback);
	}


	/**
	 * Set the subscription callback interval. The subscription callback interval defines the intervals
	 * of passing the value changes of subscribed nodes to the renderer.
	 */
	Datasource.prototype.setSubscriptionCallbackInterval = function (interval) {
		this._setSubscriptionCallbackInterval(interval);
	};


	/**
	 * Fetches the source time from the target.
	 * @param {Datasource#sourceTimeCb} callback
	 * @todo Override this method in a source module.
	 * @abstract
	 */
	Datasource.prototype._getTime = function (callback) {
		callback(null, (new Date()).getTime());
	};


	/**
	 * Fetches the history data from the target.
	 * @param {object} options
	 * @param {number} options.from The point in time the history query should start at.
	 * @param {number} options.until The point in time the history query should end at.
	 * @param {Datasource#loadPointsCb} callback The function that is invoked with the archive values.
	 * @todo Override this method in a source module.
	 * @abstract
	 */
	Datasource.prototype._loadPoints = function (options, callback) {
		callback(new Error('Datasource#_loadPoints must be implemented by all subclasses'));
	};

	/**
	 * Executes the subscription on the target source.
	 * @param {object} options
	 * @param {object} options.nodes The nodes that should be subscribed on the target.
	 * @param {Datasource#subscribeCb} callback The function that is invoked with the updated values.
	 * @todo Override this method in a source module.
	 * @abstract
	 */
	Datasource.prototype._subscribe = function (options, callback) {
		callback(new Error('Datasource#_subscribe must be implemented by all subclasses'));
	};

	/**
	 * Method that must be overriden by a child-class.
	 * Executes the unsubscription on the target source.
	 * @abstract
	 */
	Datasource.prototype._unsubscribe = function () {
		callback(new Error('Datasource#_unsubscribe must be implemented by all subclasses'));
	};

	/**
	 * Processes node-update on the target.
	 * @param options
	 * @param options.nodes The new nodeMap that should be used.
	 * @todo Override this method in a source module.
	 * @abstract
	 */
	Datasource.prototype._updateNodes = function (options) {
		callback(new Error('Datasource#_updateNodes must be implemented by all subclasses'));
	};

	/**
	 * Get time offset of datasource or execute callback
	 * @returns {number}
	 * @todo Override this method in a source module.
	 * @abstract
	 */
	Datasource.prototype._getServerTimeOffset = function(callback) {
		new Error('Datasource#_getServerTimeOffset must be implemented by all subclasses');
		return 0;
	}

	/**
	 * Method that must be overriden by a child-class.
	 * Executes the unsubscription on the target source.
	 * @abstract
	 */
	Datasource.prototype._setSubscriptionCallbackInterval = function (interval) {
		callback(new Error('Datasource#_setSubscriptionCallbackInterval must be implemented by all subclasses'));
	};


	function nodeMapValid(nodeMap) {
		for (var key in nodeMap) {
			if (typeof nodeMap[key] !== "string") {
				return false;
			}
		}
		return true;
	}


	function validateCallbackFunction(callback) {
		if (typeof callback !== "function") {
			return false;
		}
		return true;
	}

	win.Datasource = Datasource;
})(window);
