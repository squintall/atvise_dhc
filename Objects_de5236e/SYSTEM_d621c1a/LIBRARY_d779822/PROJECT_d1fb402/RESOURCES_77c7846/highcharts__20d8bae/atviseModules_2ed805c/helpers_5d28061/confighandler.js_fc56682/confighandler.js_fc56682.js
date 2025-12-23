/**
 * Configuration properties
 * @type {string[]}
 */
var configProperties = [
	"atviseOptions",
	"boost",
	"configName",
	"chart",
	"exporting",
	"global",
	"plotOptions",
	"series",
	"title",
	"tooltip",
	"xAxis",
	"yAxis"
];

/**
 * Configuration properties for series
 * @type {string[]}
 */
var seriesConfigProperties = [
	"lineWidth",
	"animation",
	"dataLabels",
	"type",
	"tooltip",
	"index",
	"id",
	"name",
	"address",
	"address2",
	"dataArchive",
	"dataArchive2",
	"aggregate",
	"aggregate2",
	"color",
	"dashStyle",
	"nonStop",
	"xAxis",
	"yAxis",
	"connectNulls",
	"step",
	"borderColor",
	"borderWidth",
	"fillColor",
	"marker",
	"zIndex",
	"visible"
];

/**
 * Translation storrage filled by addTranslation Fkt.
 * @type {{}}
 */
var translations = {};

/**
 *
 * @type {boolean}
 */
var isPureWebMIApp = webMI.rootWindow.webMIConfig["frame.displaytype"] === "svg";

/**
 * leave false to prevent elimination of users quotes!
 * @type {boolean}
 */
var unifierRemoveQuotes = false;

/**
 * access control verifications
 */
var accessControlManager = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Access Control Manager");

/**
 * Lock for save operations
 * @type {boolean}
 */
var saveInProgress = false;

/**
 * handle access control responses (e.g. lock functions or ignore error)
 * @param compareRights
 * @param callback
 */
function handleAccessControlResponse(nodeId, compareRights, callback) {
	if (!accessControlManager) {
		callback();
		return;
	}

	var requiredRights = {
		nodeIds: [
			nodeId,
			nodeId,
			nodeId,
			"SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.AddNode",
			"SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.CheckNodeExists"
		],
		rights: ["read", "write", "engineer", "execute", "execute"]
	};

	accessControlManager.getRightsDict(requiredRights.nodeIds, requiredRights.rights, (response) => {
		if (!Array.isArray(compareRights)) compareRights = [compareRights];

		var allRights = [];

		for (var c in compareRights) {
			if (
				typeof response[compareRights[c].node] != "undefined" &&
				typeof response[compareRights[c].node][compareRights[c].right] != "undefined"
			) {
				allRights.push(response[compareRights[c].node][compareRights[c].right]);
			} else {
				allRights.push(false);
			}
		}

		if (!allRights.includes(false)) {
			callback();
		}
	});
}

/**
 * Class Constructor
 * @constructor
 */
function ConfigHandler(chart) {
	if (chart) {
		// Make sure only one ConfigHandler per chart is instantiated.
		if (chart.configHandler) {
			return chart.configHandler;
		} else {
			chart.configHandler = this;
		}

		this.chart = chart;
		this.chartOptions = chart.chart.options;
		this.configNode = chart.chart.options.atviseOptions.configNode;
		this.configFile = chart.chart.options.atviseOptions.configFile;
		this.configName = chart.chart.options.atviseOptions.configName;
		this.saveMethod = chart.chart.options.atviseOptions.saveMethod;
		this.mode = chart.chart.options.atviseOptions.mode;
	}
}

/**
 * Write config to source using quick option of autosave
 * @param chart
 * @param configNode
 * @param configCallback
 */
ConfigHandler.prototype.autosave = function (chart, configNode, configCallback) {
	this.writeConfig(chart, configNode, "autosave", configCallback);
};

/**
 * Create chart config object
 * @param key
 * @param value
 * @param identifier
 */
ConfigHandler.prototype.createConfigObject = function (key, value, identifier) {
	var ret = {};

	if (key == "undefined" || value == "undefined") return;

	ret = mapToChartConfig(key, value);

	function mapToChartConfig(key, value) {
		// converts e.g. the string "xAxis_label_title" to { xAxis: { label: { title: "my title" }}}
		function createConfObjFromString(key, value) {
			var x = key.split("_");
			var y = key.split("-");
			var obj = {},
				o = obj;

			for (var i = 0; i < x.length; i++) {
				if (i < x.length - 1) {
					o = o[x[i]] = {};
				} else {
					if (y.length == 2) {
						// = radiobutton id
						if (y[1] == "true") y[1] = true;
						else if (y[1] == "false") y[1] = false;
						o = o[x[i].substring(0, x[i].search("-" + y[1]))] = y[1];
					} else {
						o = o[x[i]] = value;
					}
				}
			}
			return obj;
		}

		var confObj = createConfObjFromString(key, value);
		return confObj;
	}

	return ret;
};

/**
 * Create configuration nodes
 * @param configNode
 * @param configName
 * @param createCallback
 */
ConfigHandler.prototype.createNode = function (configNode, configName, createCallback) {
	var that = this;

	if (webMI.getMethodSupport().indexOf("AddNode") == -1) {
		createCallback(false);
		return;
	}

	var compareRights = [
		{node: configNode, right: "read"},
		{node: configNode, right: "write"},
		{node: configNode, right: "engineer"},
		{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.AddNode", right: "execute"},
		{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.CheckNodeExists", right: "execute"}
	];

	if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
	else grant();

	function grant() {
		const writeNode = configNode + "." + configName;

		accessControlManager.assist.addNode(
			{
				_parent: configNode,
				address: writeNode,
				typeDefinition: "i=62",
				dataType: "STRING",
				value: "{}",
				nodeClass: "NODECLASS_VARIABLE",
				writePolicy: 2
			},
			function () {
				createCallback(true);
			},
			function (error) {
				console.error(configNode, error);
				createCallback(false);
				return;
			}
		);
	}

	function denied() {
		createCallback(false);
		return;
	}
};

/**
 * Build valid configuration list (only) array
 * @param configs
 * @param configCallback
 * @param sort
 */
ConfigHandler.prototype.buildConfig = function (configs, configName, sort) {
	// function buildConfig(configs, configName, sort) {
	var indexList = [];

	if (configs.length > 0) indexList = configs;

	if (configName && indexList.indexOf(configName) < 0) indexList.push(configName);

	const item = "autosave";

	const index = indexList.indexOf(item);
	if (index !== -1) {
		indexList.splice(index, 1);
	}

	if (sort) {
		indexList.sort();
	}

	indexList.unshift(item);
	return indexList;
};

/**
 * Delete configuration for multiple nodes
 * @param chart
 * @param configNode
 * @param configName
 * @param deleteCallback
 */
ConfigHandler.prototype.deleteConfig = function (chart, configNode, configName, deleteCallback) {
	var that = this;
	that.writeConfig(
		chart,
		configNode,
		configName,
		function (e) {
			deleteCallback(e);
		},
		true
	);
};

/**
 * Delete configuration node using multiple nodes
 * @param configNode
 * @param configName
 * @param deleteCallback
 */
ConfigHandler.prototype.deleteConfigNode = function (configNode, configName, deleteCallback) {
	var that = this;

	var deleteNode = configNode + "." + configName;

	var compareRights = [
		{node: configNode, right: "read"},
		{node: configNode, right: "write"},
		{node: configNode, right: "engineer"},
		{node: deleteNode, right: "read"},
		{node: deleteNode, right: "write"},
		{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.DeleteNode", right: "execute"},
		{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.CheckNodeExists", right: "execute"}
	];

	accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);

	function grant() {
		webMI.data.call("DeleteNode", {address: deleteNode}, function () {
			deleteCallback(true);
		});
	}

	function denied() {
		deleteCallback(false);
	}
};

/**
 * Load configuration list (only)
 * @param configNode
 * @param configMethode
 * @param configCallback
 * @param sort
 */
ConfigHandler.prototype.getConfigList = function (configNode, configMethode, configName, configCallback, sort) {
	var that = this;

	if (!configNode) return;

	if (isPureWebMIApp) {
		configMethode = "localStorage";
	}

	if (configMethode === "localStorage") {
		const stored = window.localStorage.getItem(configNode);
		const index = Object.keys(stored ? JSON.parse(stored) : {});

		// NOTE: If we supported compression in localStorage, we would decompress here...
		const configs = that.buildConfig(index, configName, sort);
		configCallback(configs);
	} else if (configMethode == "single") {
		var compareRights = [{node: configNode, right: "read"}];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			webMI.data.read(configNode, function (e) {
				if (e.error) {
					webMI.data.writePermissionLogEntry("Highcharts Configuration", configNode, e.errorstring);
					configCallback([]);
					return;
				}

				var index = [];
				if (e.value) index = JSON.parse(e.value);

				var indexList = Object.keys(index);
				const configs = that.buildConfig(indexList, configName, sort);
				configCallback(configs);
			});
		}

		function denied() {
			configCallback([]);
		}
	} else if (configMethode == "multiple") {
		var compareRights = [{node: configNode, right: "read"}];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			webMI.data.read(configNode, function (e) {
				if (e.error) {
					webMI.data.writePermissionLogEntry("Highcharts Configuration", configNode, e.errorstring);
					configCallback([]);
					return;
				}

				const index = JSON.parse(e.value);

				if ("highchartsConfigIndex" in index) {
					var indexList = index.highchartsConfigIndex;

					var compareRights = [];
					for (var i in indexList) compareRights.push({node: configNode + "." + indexList[i], right: "read"});

					accessControlManager.assist.getPermissions(compareRights, function (rights) {
						var indexList = [];

						for (var i in rights) if (rights[i].read) indexList.push(i.replace(configNode + ".", ""));

						indexList = that.buildConfig(indexList, configName, sort);
						configCallback(indexList);
					});
				} else {
					configCallback([]);
				}
			});
		}

		function denied() {
			configCallback([]);
		}
	} else if (configMethode == "filesystem") {
		var compareRights = [{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.FilesystemRead", right: "execute"}];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			var filename = "hcconfigs/" + configNode + ".json";
			that.file.read(filename, function (e) {
				const index = e.result != "" ? JSON.parse(e.result) : {};

				var indexList = Object.keys(index);
				const configs = that.buildConfig(indexList, configName, sort);
				configCallback(configs);
			});
		}

		function denied() {
			configCallback([]);
		}
	} else {
		configCallback([]);
	}
};

/**
 * Map chart config object to atvise id
 * @param config
 */
ConfigHandler.prototype.mapToAtviseId = function (config) {
	var atviseKeys = {};

	function setAtviseIdObj(srcObj, atviseIdObj) {
		if (typeof srcObj != "object") return;

		if (typeof atviseIdObj.key == "undefined") return;

		for (var prop in srcObj) {
			atviseIdObj.key = atviseIdObj.key == "" ? prop : atviseIdObj.key + "_" + prop;
			atviseIdObj.val = srcObj[prop];

			if (Array.isArray(srcObj[prop])) {
				atviseIdObj.val = JSON.stringify(srcObj[prop]);
			} else if (typeof srcObj[prop] == "function") {
				atviseIdObj.val = "function";
			} else if (typeof srcObj[prop] == "object") {
				setAtviseIdObj(srcObj[prop], atviseIdObj);
			}
		}
	}

	function createAtviseIdObj(configObj, key) {
		var config = configObj[key];

		for (p in config) {
			if (typeof config[p] == "object" && !Array.isArray(config[p])) {
				var prefixedKey = key + "_" + p;
				var obj = {};
				obj[prefixedKey] = config[p];

				createAtviseIdObj(obj, prefixedKey);
			} else {
				var atviseIdObj = {key: "", val: ""};
				var obj = {};
				obj[key] = {};
				obj[key][p] = config[p];
				setAtviseIdObj(obj, atviseIdObj);

				atviseKeys[atviseIdObj.key] = atviseIdObj.val;
			}
		}
	}

	for (key in config) {
		if (Array.isArray(config[key])) {
			for (var i = 0; i < config[key].length; i++) {
				var prefixedKey = key + i + "_" + key;
				var obj = {};
				obj[prefixedKey] = config[key][i];
				createAtviseIdObj(obj, prefixedKey);
			}
		} else {
			createAtviseIdObj(config, key);
		}
	}

	return atviseKeys;
};

/**
 * Merge sub object source into config object target
 * @param target
 * @param source
 * @param arrayIdx
 * @returns {*}
 */
ConfigHandler.prototype.merger = function (target, source, arrayIdx) {
	var self = this;

	function addAttr(source, srcAttrname) {
		if (typeof arrayIdx == "undefined") {
			if (target[srcAttrname] && typeof target[srcAttrname] == "object" && typeof source[srcAttrname] == "object") {
				// merge src into target object
				self.merger(target[srcAttrname], source[srcAttrname]);
			} else {
				// add new attribute to target object
				target[srcAttrname] = source[srcAttrname];
			}
		} else {
			// multiple objects configuration:
			if (Array.isArray(target[srcAttrname]) && arrayIdx <= target[srcAttrname].length - 1) {
				//merge object to existing object
				self.merger(target[srcAttrname][arrayIdx], source[srcAttrname]);
			} else {
				if (Array.isArray(target[srcAttrname])) {
					//add object to array
					target[srcAttrname].push(source[srcAttrname]);
				} else {
					//create array to store objects.
					target[srcAttrname] = [source[srcAttrname]];
				}
			}
		}
	}

	for (var srcAttrname in source) {
		addAttr(source, srcAttrname);
	}

	return target;
};

/**
 * Prepare config before writing to source
 * @param configName
 * @param chart
 */
ConfigHandler.prototype.prepareConfig = function (configName, chart) {
	var prepare = JSON.parse(JSON.stringify(chart.chart.options));

	/*Workaround for measurement marker errors*/
	if (prepare.xAxis[0] && prepare.xAxis[0].plotLines) {
		for (var i = 0; i < prepare.xAxis[0].plotLines.length; i++) {
			var id = prepare.xAxis[0].plotLines[i].id;
			if (id == "measuringCursor1" || id == "measuringCursor2") prepare.xAxis[0].plotLines.splice(i--, 1);
		}
	}

	prepare.series = [];
	for (var i = 0; i < chart.chart.series.length; i++) {
		var series = chart.chart.series[i];
		var seriesConfig = JSON.parse(JSON.stringify(series.options));
		prepare.series.push(seriesConfig);
	}

	for (var i = 0; i < chart.chart.xAxis.length; i++) {
		if (prepare.xAxis[i]) {
			prepare.xAxis[i].min = chart.chart.xAxis[i].min;
			prepare.xAxis[i].max = chart.chart.xAxis[i].max;

			if (typeof chart.chart.xAxis[i].userMin != "undefined") prepare.xAxis[i].userMin = chart.chart.xAxis[i].userMin;
			if (typeof chart.chart.xAxis[i].userMax != "undefined") prepare.xAxis[i].userMax = chart.chart.xAxis[i].userMax;
		}
	}

	for (var i = 0; i < chart.chart.yAxis.length; i++) {
		if (prepare.yAxis[i]) {
			prepare.yAxis[i].min = chart.chart.yAxis[i].min;
			prepare.yAxis[i].max = chart.chart.yAxis[i].max;
			if (typeof chart.chart.yAxis[i].userMin != "undefined") prepare.yAxis[i].userMin = chart.chart.yAxis[i].userMin;
			if (typeof chart.chart.yAxis[i].userMax != "undefined") prepare.yAxis[i].userMax = chart.chart.yAxis[i].userMax;
			if (prepare.yAxis[i].autoscale || chart.chart.yAxis[i].options.autoscale) {
				prepare.yAxis[i].min = null;
				prepare.yAxis[i].max = null;
				prepare.yAxis[i].userMin = null;
				prepare.yAxis[i].userMax = null;
				prepare.yAxis[i].autoscale = true;
			}
		}
	}

	/* some last checks for required values */
	for (everySeries in prepare.series) {
		/* leave marker undefined or null or an Array is not a good idea */
		if (
			typeof prepare.series[everySeries].marker === "undefined" ||
			prepare.series[everySeries].marker === null ||
			Array.isArray(prepare.series[everySeries].marker)
		) {
			prepare.series[everySeries].marker = {};
		}

		if (
			typeof prepare.series[everySeries].marker.enabled === "undefined" ||
			prepare.series[everySeries].marker.enabled === null
		) {
			prepare.series[everySeries].marker.enabled = false;
		}
	}

	function removeConfigProperties(prepareCopy) {
		for (var p in prepareCopy) {
			if (configProperties.indexOf(p) > -1) {
				if (p == "series" && prepareCopy["series"] !== "undefined") {
					for (var i = 0; i < prepareCopy.series.length; i++) {
						for (var seriesProp in prepareCopy.series[i]) {
							if (seriesConfigProperties.indexOf(seriesProp) == -1) {
								delete prepareCopy.series[i][seriesProp];
							}
						}
					}
				}
			} else {
				delete prepareCopy[p];
			}
		}
	}

	removeConfigProperties(prepare);

	/* always save config with right save parameter! */
	prepare.atviseOptions.configFile = chart.chart.options.atviseOptions.configFile;
	prepare.atviseOptions.configNode = chart.chart.options.atviseOptions.configNode;
	prepare.atviseOptions.configName = configName;
	prepare.atviseOptions.saveCompressed = chart.chart.options.atviseOptions.saveCompressed;
	prepare.atviseOptions.saveMethod = chart.chart.options.atviseOptions.saveMethod;

	var config = {};
	config[configName] = prepare;

	return config;
};

/**
 * Reading config from source by Name
 * @param configNode
 * @param configMethode
 * @param configName
 * @param configCallback
 */
ConfigHandler.prototype.readConfig = function (configNode, configMethode, configName, userConfigCallback, merge) {
	var that = this;

	/**
	 * Wraps the user's callback function in order to fix the yAxis indices before
	 *  passing on the configuration [AT-D-14740]
	 * @param config {object} Configuration to pass through after fixing yAxis
	 * indices
	 */
	function configCallback(config) {
		if (config && config.yAxis && config.yAxis.length) {
			config.yAxis.forEach((yAxisObject, axisIndex) => {
				yAxisObject.index = axisIndex;
			});
		}

		userConfigCallback(config);
	}

	if (!configNode) {
		configCallback({});
		return;
	}

	if (isPureWebMIApp) {
		configMethode = "localStorage";
	}

	if (configMethode === "localStorage") {
		const stored = JSON.parse(window.localStorage.getItem(configNode));

		var config;
		if (configName) {
			config = stored[configName];
			config = config ? that.configurationFix.all(config) : {};
		} else {
			config = stored;
		}

		configCallback(config ? config : {});
	} else if (configMethode == "single") {
		var compareRights = [{node: configNode, right: "read"}];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			webMI.data.read(configNode, function (e) {
				if (e.error) {
					webMI.data.writePermissionLogEntry("Highcharts Configuration", configNode, e.errorstring);
					configCallback({});
					return;
				}

				var stored = {};

				if (e.value) stored = JSON.parse(e.value);

				var config = {};
				if (configName && configName != "") {
					if (stored[configName]) {
						const configStored = that.compressor.decompress(stored, configName);
						config = that.unifier.unify(configStored, false);
						config = that.configurationFix.all(config);
					}
				} else {
					config = stored;
					/*
					for (var key in stored) {
						config[key] = stored[key];

						const configStored = that.compressor.decompress(stored, key);
						var keyConfig = that.unifier.unify(configStored, false);
						keyConfig = that.configurationFix.all(keyConfig);
						config[key] = keyConfig[key];
					}
					*/
				}

				configCallback(config ? config : {});
			});
		}

		function denied() {
			configCallback({});
		}
	} else if (configMethode == "multiple") {
		const readNode = configNode + "." + configName;

		var compareRights = [{node: configName && !Array.isArray(configName) ? readNode : configNode, right: "read"}];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			if (Array.isArray(configName)) {
				const index = configName;
				const currentConfig = index.shift();

				if (currentConfig) {
					that.readConfig(
						configNode,
						configMethode,
						currentConfig,
						function (config) {
							if (config) merge[currentConfig] = config;
							that.readConfig(configNode, configMethode, index, configCallback, merge);
						},
						merge
					);
				} else {
					configCallback(merge ? merge : {});
				}
			} else if (configName && configName != "") {
				webMI.data.read(readNode, function (e) {
					if (e.error) {
						webMI.data.writePermissionLogEntry("Highcharts Configuration", configNode, e.errorstring);
						configCallback({});
						return;
					}

					var stored = {};

					if (e.value) stored = JSON.parse(e.value);

					var config = {};
					const configStored = that.compressor.decompress(stored, configName);
					config = that.unifier.unify(configStored, false);
					config = that.configurationFix.all(config);

					configCallback(config ? config : {});
				});
			} else {
				that.getConfigList(
					configNode,
					configMethode,
					false,
					function (index) {
						that.readConfig(
							configNode,
							configMethode,
							index,
							function (merge) {
								configCallback(merge ? merge : {});
							},
							{}
						);
					},
					true
				);
			}
		}

		function denied() {
			that.createNode(configNode, configName, function (e) {
				if (e) {
					that.updateConfigList(
						configNode,
						configName,
						function () {
							configCallback({});
						},
						false
					);
				} else {
					configCallback({});
				}
			});
		}
	} else if (configMethode == "filesystem") {
		var compareRights = [{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.FilesystemRead", right: "execute"}];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			var filename = "hcconfigs/" + configNode + ".json";
			that.file.read(filename, function (e) {
				const stored = e.result != "" ? JSON.parse(e.result) : {};

				var config;
				if (configName) {
					config = stored[configName];
					config = config ? that.configurationFix.all(config) : {};
				} else {
					config = stored;
				}

				configCallback(config);
			});
		}

		function denied() {
			configCallback({});
		}
	} else {
		configCallback({});
	}
};

/**
 * Update config list for mulitple nodes
 * @param configNode
 * @param configName
 * @param updateCallback
 * @param remove
 */
ConfigHandler.prototype.updateConfigList = function (configNode, configName, updateCallback, remove) {
	webMI.data.read(configNode, function (e) {
		if (e.error) {
			webMI.data.writePermissionLogEntry("Highcharts Configuration", configNode, e.errorstring);
			return;
		}

		const index = e.value && e.value != "" ? JSON.parse(e.value) : {};

		var configIndex = {
			highchartsConfigIndex: []
		};

		if ("highchartsConfigIndex" in index) {
			configIndex.highchartsConfigIndex = index.highchartsConfigIndex;
		}

		if (remove) {
			var itemIndex = configIndex.highchartsConfigIndex.indexOf(configName);
			if (itemIndex > -1) {
				configIndex.highchartsConfigIndex.splice(itemIndex, 1);
			}
		} else {
			configIndex.highchartsConfigIndex.push(configName);
		}

		configIndexSave = JSON.stringify(configIndex);

		webMI.data.write(configNode, configIndexSave, function (e) {
			if (e.error) {
				webMI.data.writePermissionLogEntry("Highcharts Configuration", configNode, e.errorstring);
			}

			updateCallback(configIndex.highchartsConfigIndex);
		});
	});
};

/**
 * Checks whether loaded config and runtime config contain the same values.
 * @param {function(boolean):void} callback Gets called with true or false depending on result of comparison
 */
ConfigHandler.prototype.checkForChanges = function (callback) {
	const getCommonKeys = (loadedConfig, runtimeConfig) =>
		Object.keys(loadedConfig).filter((key) => runtimeConfig.hasOwnProperty(key));

	let areConfigsIdentical = (loadedConfig, runtimeConfig) => {
		let commonKeys = getCommonKeys(loadedConfig, runtimeConfig);

		// Make sure series get compared even if added/removed during runtime.
		if (loadedConfig.series && runtimeConfig.series) {
			if (loadedConfig.series.length !== runtimeConfig.series.length) {
				return false;
			}
		}

		const excludedKeys = {
			history: [""],
			live: ["timeSlotStart", "timeSlotEnd"],
			mixed: ["timeSlotStart", "timeSlotEnd"],
			common: ["_titleKey", "enableMouseTracking"]
		};

		// Account for min and max values when autoscaling is active
		if (commonKeys.includes("autoscale") && loadedConfig.autoscale === true) {
			excludedKeys.common.push("min", "max");
		}

		// Don't compare x-axis position except in "history"-mode
		if (commonKeys.includes("isX") && this.mode !== history) {
			excludedKeys.common.push("min", "max", "userMin", "userMax");
		}

		commonKeys = commonKeys.filter((item) => {
			return !excludedKeys.common.includes(item) && !excludedKeys[this.mode].includes(item);
		});

		let result = commonKeys.every((key) => {
			if (isObject(loadedConfig[key]) && isObject(runtimeConfig[key])) {
				return areConfigsIdentical(loadedConfig[key], runtimeConfig[key]);
			}

			return loadedConfig[key] === runtimeConfig[key];
		});

		return result;
	};

	let isObject = (obj) => obj === Object(obj);

	this.readConfig(this.configNode, this.saveMethod, this.configName, (configs) => {
		let runTimeConfig = this.prepareConfig(this.configName, this.chart)[this.configName];
		let configsAreIdentical = areConfigsIdentical(configs, runTimeConfig);
		callback(configsAreIdentical);
	});
};

/**
 * Write config to source by Name
 * @param chart
 * @param configNode
 * @param configName
 * @param configCallback
 */
ConfigHandler.prototype.writeConfig = function (chart, configNode, configName, configCallback, remove, importedConfig) {
	var that = this;

	if (typeof remove == "undefined") remove = false;

	if (!configNode || !configName) {
		configCallback({});
		return;
	}

	saveInProgress = true;
	this.dataLockHandler.lock(chart);

	if (isPureWebMIApp) {
		configMethode = "localStorage";
	}

	var config = importedConfig ? importedConfig : that.prepareConfig(configName, chart);
	var configMethode = chart.chart.options.atviseOptions.saveMethod;
	var configCompressed = chart.chart.options.atviseOptions.saveCompressed;

	if (configMethode === "localStorage") {
		const stored = JSON.parse(window.localStorage.getItem(configNode));

		if (remove) {
			delete stored[configName];
		} else {
			stored[configName] = config[configName];
		}

		window.localStorage.setItem(configNode, JSON.stringify(stored));

		const index = Object.keys(stored);
		configCallback(Object.keys(index));
		saveInProgress = false;
	} else if (configMethode == "single") {
		var compareRights = [
			{node: configNode, right: "read"},
			{node: configNode, right: "write"}
		];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			that.readConfig(configNode, configMethode, false, function (allConfig) {
				if (remove) {
					delete allConfig[configName];
				} else {
					if (configCompressed) {
						const unify = JSON.parse(JSON.stringify(config[configName]));
						config[configName] = that.unifier.unify(unify, true);
						config = that.compressor.compress(config, configName);
					}

					allConfig[configName] = config[configName];
				}

				var allConfigNames = Object.keys(allConfig);
				allConfig = JSON.stringify(allConfig);

				webMI.data.write(configNode, allConfig, function (e) {
					if (e.error) {
						webMI.data.writePermissionLogEntry("Highcharts Configuration", configNode, e.errorstring);
					}

					var index = that.buildConfig(allConfigNames, false, true);
					configCallback(index);
					saveInProgress = false;
				});
			});
		}

		function denied() {
			configCallback(false);
			saveInProgress = false;
		}
	} else if (configMethode == "multiple") {
		const writeNode = configNode + "." + configName;

		var compareRights = [
			{node: writeNode, right: "read"},
			{node: writeNode, right: "write"}
		];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			if (remove) {
				that.deleteConfigNode(configNode, configName, function (e) {
					if (e) {
						that.updateConfigList(
							configNode,
							configName,
							function (index) {
								configCallback(index);
								saveInProgress = false;
							},
							true
						);
					} else {
						configCallback(false);
						saveInProgress = false;
					}
				});
			} else {
				if (configCompressed) {
					const unify = JSON.parse(JSON.stringify(config[configName]));
					config[configName] = that.unifier.unify(unify, true);
					config = that.compressor.compress(config, configName);
				}

				config = JSON.stringify(config);

				webMI.data.write(writeNode, config, function (e) {
					if (e.error) {
						webMI.data.writePermissionLogEntry("Highcharts Configuration", writeNode, e.errorstring);
					}

					that.getConfigList(
						configNode,
						configMethode,
						configName,
						function (index) {
							configCallback(index);
							saveInProgress = false;
						},
						true
					);
				});
			}
		}

		function denied() {
			if (remove) {
				configCallback(false);
				saveInProgress = false;
			} else {
				that.createNode(configNode, configName, function (e) {
					if (e) {
						that.updateConfigList(
							configNode,
							configName,
							function () {
								that.writeConfig(chart, configNode, configName, configCallback, false, importedConfig);
							},
							false
						);
					} else {
						configCallback(false);
						saveInProgress = false;
					}
				});
			}
		}
	} else if (configMethode == "filesystem") {
		var compareRights = [
			{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.FilesystemRead", right: "execute"},
			{node: "SYSTEM.LIBRARY.ATVISE.WEBMIMETHODS.FilesystemWrite", right: "execute"}
		];

		if (accessControlManager) accessControlManager.assist.handleWithPermissions(compareRights, grant, denied);
		else grant();

		function grant() {
			that.readConfig(configNode, configMethode, false, function (allConfigs) {
				var filename = "hcconfigs/" + configNode + ".json";

				if (remove) {
					delete allConfigs[configName];
				} else {
					allConfigs[configName] = config[configName];
				}

				that.file.save(filename, allConfigs, function (e) {
					const index = Object.keys(allConfigs);
					configCallback(Object.keys(index));
					saveInProgress = false;
				});
			});
		}

		function denied() {
			configCallback(false);
			saveInProgress = false;
		}
	} else {
		configCallback({});
		saveInProgress = false;
	}
};


/* ---------------------------------------------------------------------------- */
/* OBJECTS																		*/
/* Further objects that contain auxiliary functions								*/
/* ---------------------------------------------------------------------------- */

/**
 * Add a translation
 * @param translationObj {key, value}
 */
ConfigHandler.prototype.addTranslation = function (translationObj) {
	translations[translationObj.key] = translationObj.value;
};


/**
 * Change configurations
 * @param chart
 * @param configName
 * @param chartConfig
 * @param options (eg. options[reloadConfig], options[export_right] .... )
 * @returns {boolean}
 */
ConfigHandler.prototype.configurationChange = function (chart, configName, chartConfig, options) {
	var reloadConfig = options["reloadConfig"] ? options["reloadConfig"] : false;
	var export_right = options["export_right"];

	/* fix loadname not configname */
	if ("atviseOptions" in chartConfig && chartConfig.atviseOptions.configName != configName)
		chartConfig.atviseOptions.configName = configName;

	/* fix for old config not having saveMethode stored */
	if ("atviseOptions" in chartConfig && !chartConfig.atviseOptions.saveMethod)
		chartConfig.atviseOptions.saveMethod = configSaveMethode;

	/* disable notification at startup */
	if ("exporting" in chartConfig)
		chartConfig.exporting.buttons.notificationButton.enabled = false;

	/* remove mess cursors if not needed */
	if("atviseOptions" in chartConfig) {
		var showCursor1	= "enableCursor1" in chartConfig["atviseOptions"] && chartConfig["atviseOptions"]["enableCursor1"];
		var showCursor2 = "enableCursor2" in chartConfig["atviseOptions"] && chartConfig["atviseOptions"]["enableCursor2"];

		if(chart.control.isMeasuringCursor1Visible() && !showCursor1) {
			console.error(1);
			chart.control.hideMeasuringCursor1(true);
		}
		if(chart.control.isMeasuringCursor2Visible() && !showCursor2) {
			console.error(2);
			chart.control.hideMeasuringCursor2(true);
		}
	} else {
		chart.control.hideMeasuringCursor1(true);
		chart.control.hideMeasuringCursor2(true);
	}

	/* if no config found reset and return */
	if (Object.keys(chartConfig) < 1) {
		chart.chart.options.atviseOptions.configName = configName;

		if (chart.control.isLiveModeRunning()) {
			chart.control.stopLiveMode();
		}

		/* reset series but leave one x- and y-axis */
		while (chart.chart.series.length > 0)
			chart.chart.series[0].remove();
		while (chart.chart.xAxis.length > 1)
			chart.chart.xAxis[0].remove();
		while (chart.chart.yAxis.length > 1)
			chart.chart.yAxis[0].remove();

		setTimeout(function test() {
			if ("resetLegend" in chart.chart)
				chart.chart.resetLegend();
		}, 100);

		return false;
	}

	for (let seriesNumber in chartConfig.series) {
		// Make sure point and data arrays are valid after every update
		chartConfig.series[seriesNumber].events = {
			afterGeneratePoints: function (e) {
				this.cleanUpIndices();
			}
		};

		// Check marker for wrong initialization (old cfg / wrong setup)
		if (
			typeof chartConfig.series[seriesNumber].marker.enabled === "undefined" ||
			chartConfig.series[seriesNumber].marker.enabled === null
		) {
			chartConfig.series[seriesNumber].marker.enabled = false;
		}
	}

	/* stop live modes if new mode is history */
	if (chartConfig.atviseOptions.mode == "history" && chart.control.isLiveModeRunning()) {
		chart.control.stopLiveMode();
	}

	/* add zoom config */
	var zoomType = (webMI.query["zoomType"] ? webMI.query["zoomType"].replace("axis", "") : "x").trim();

	// set zoom && pann like zoom
	chartConfig.chart.zoomType = zoomType;
	chartConfig.chart.panning = {
		enabled: true,
		type: zoomType
	};

	/* reset chart */
	while (chart.chart.series.length > 0)
		chart.chart.series[0].remove();
	while (chart.chart.xAxis.length > 0)
		chart.chart.xAxis[0].remove();
	while (chart.chart.yAxis.length > 0)
		chart.chart.yAxis[0].remove();

	/* reset legend */
	if ("resetLegend" in chart.chart)
		chart.chart.resetLegend();

	/* update chart */
	for (var i = 0; i < chartConfig.xAxis.length; i++) {
		chart.chart.addAxis(chartConfig.xAxis[i], true);
		if (chart.chart.options.xAxis[i])
			chart.chart.options.xAxis[i] = Object.assign(chart.chart.options.xAxis[i], chartConfig.xAxis[i]);
		else chart.chart.options.xAxis[i] = Object.assign({}, chartConfig.xAxis[i]);
	}

	
	for (var i = 0; i < chartConfig.yAxis.length; i++) {
		chart.chart.addAxis(chartConfig.yAxis[i], false);
		if (chart.chart.options.yAxis[i])
			chart.chart.options.yAxis[i] = Object.assign(chart.chart.options.yAxis[i], chartConfig.yAxis[i]);
		else chart.chart.options.yAxis[i] = Object.assign({}, chartConfig.yAxis[i]);
	}

	chart.chart.options.atviseOptions = chartConfig.atviseOptions;
	chart.chart.update(chartConfig);

	/** check export rights **/
	function check_configExportMenu(permission) {
		if (permission && chartConfig.exporting.enabled == true) {
			chart.chart.update({"exporting": {"enabled": true}});
		} else {
			chart.chart.update({"exporting": {"enabled": false}});
		}
	}

	var right = (export_right == undefined) ? "" : export_right;
	if (right.search(/SYSTEM\.SECURITY\.RIGHTS\./) != -1) {
		right = right.substring(23, right.length); //remove "prefix" SYSTEM.SECURITY.RIGHTS.
	}

	if (right != "") {
		webMI.addEvent(webMI.data, "clientvariableschange", function (e) {
			var hasRight = false;
			if (("username" in e) && (e.username != "")) {
				hasRight = webMI.hasRight(right);
			}
			check_configExportMenu(hasRight);
		});
	} else {
		check_configExportMenu(true);
	}

	for (var i = 0; i < chartConfig.series.length; i++) {
		chartConfig.series[i].data = [];
		chart.chart.addSeries(chartConfig.series[i]);
	}

	chart.chart.redraw();

	chart.control.updated(function (e) {
		if (chart.chart.options.atviseOptions.mode == "history") {
			chart.control.setMode("history");
			chart.control.loadHistory();
		} else {
			chart.control.setMode(chart.chart.options.atviseOptions.mode);
			if (!chart.control.isLiveModeRunning()) {
				chart.control.startLiveMode();
			} else {
				if (reloadConfig) {
					if (reloadConfig) {
						reloadConfig = false;

						chart.control.stopLiveMode(function () {
							chart.control.startLiveMode();
						});
					}
				}
			}
		}
	});

	return true;
}


/**
 * Handlers for fixes to old configurations
 * and other problems caused by version changes
 */
ConfigHandler.prototype.configurationFix = new (function () {
	/**
	 * apply all fixes for configurations
	 * @param config
	 * @param options
	 * @returns {*}
	 */
	this.all = function (config, options) {
		if (Object.keys(config) == 0) return config;

		config = this.firstAxis(config);
		config = this.autoscale(config);
		config = this.export(config);
		config = this.navigation(config);
		config = this.defaultmode(config);
		config = this.axisTicks(config);
		config = this.axisTitles(config);
		config = this.boostThreshold(config);

		return config;
	};

	/**
	 * check vaild axis - or set to first found
	 * @param config
	 * @param options
	 */
	this.firstAxis = function (config, options) {
		var xAxisIndex = Object.keys(config["xAxis"]);
		var yAxisIndex = Object.keys(config["yAxis"]);

		for (var seriesKey in config["series"]) {
			var xAxisAssigned = config["series"][seriesKey]["xAxis"];
			var yAxisAssigned = config["series"][seriesKey]["yAxis"];

			if (typeof xAxisAssigned != "undefined") {
				xAxisAssigned = xAxisAssigned.toString();
				if (xAxisIndex.indexOf(xAxisAssigned) < 0) {
					config["series"][seriesKey]["xAxis"] = parseInt(Object.keys(config["xAxis"])[0]);
				}
			} else {
				config["series"][seriesKey]["xAxis"] = parseInt(Object.keys(config["xAxis"])[0]);
			}

			if (typeof yAxisAssigned != "undefined") {
				yAxisAssigned = yAxisAssigned.toString();
				if (yAxisIndex.indexOf(yAxisAssigned) < 0) {
					config["series"][seriesKey]["yAxis"] = parseInt(Object.keys(config["yAxis"])[0]);
				}
			} else {
				config["series"][seriesKey]["yAxis"] = parseInt(Object.keys(config["yAxis"])[0]);
			}
		}

		return config;
	};

	/**
	 * fix autoscale on load for old configs
	 * @param config
	 * @param options
	 */
	this.autoscale = function (config, options) {
		if (typeof config != "undefined") {
			for (var i = 0; i < config.yAxis.length; i++) {
				if (config.yAxis[i]) {
					if (config.yAxis[i].autoscale) {
						config.yAxis[i].min = null;
						config.yAxis[i].max = null;
						config.yAxis[i].userMin = null;
						config.yAxis[i].userMax = null;
					}

					if (config.yAxis[i].type == "logarithmic") {
						if (typeof config.yAxis[i].userMin != "undefined" && config.yAxis[i].userMin != null) {
							if (config.yAxis[i].userMin <= 0) config.yAxis[i].userMin = 0.1;
							config.yAxis[i].min = config.yAxis[i].userMin;
						}
						if (typeof config.yAxis[i].userMax != "undefined" && config.yAxis[i].userMin != null) {
							if (config.yAxis[i].userMax <= 0) config.yAxis[i].userMax = 1;
							config.yAxis[i].max = config.yAxis[i].userMax;
						}
					}
				}
			}
		}
		return config;
	};

	/**
	 * fix exporting option on load for all configs
	 * @param config
	 * @param options
	 */
	this.export = function (config, options) {
		if (typeof config != "undefined") {
			if (webMI.getClientInfo().browserType.isIE11) {
				config.exporting.buttons.menuItems = [
					"printChart",
					"separator",
					"downloadPNG",
					"downloadJPEG",
					"downloadPDF",
					"downloadSVG",
					"separator",
					"downloadCSV",
					"downloadXLS"
				];

				config.exporting.buttons.contextButton.menuItems = config.exporting.buttons.menuItems;

				delete config.exporting.menuItemDefinitions["downloadXLSX"];
				config.exporting.menuItemDefinitions["downloadXLS"] = {
					textKey: "downloadXLS"
				};
			} else {
				config.exporting.buttons.menuItems = [
					"printChart",
					"separator",
					"downloadPNG",
					"downloadJPEG",
					"downloadPDF",
					"downloadSVG",
					"separator",
					"downloadCSV",
					"downloadXLSX"
				];

				config.exporting.buttons.contextButton.menuItems = config.exporting.buttons.menuItems;

				delete config.exporting.menuItemDefinitions["downloadXLS"];
				config.exporting.menuItemDefinitions["downloadXLSX"] = {
					textKey: "downloadXLSX"
				};
			}
		}

		return config;
	};

	/**
	 * fix mode if not default mode used
	 * @param config
	 * @param options
	 */
	this.defaultmode = function (config, options) {
		try {
			config = JSON.parse(JSON.stringify(config));
			config.atviseOptions.defaultMode = typeof config.atviseOptions.defaultMode == "undefined" ? config.atviseOptions.mode : config.atviseOptions.defaultMode;
			config.atviseOptions.mode = config.atviseOptions.defaultMode;
		} catch (ex) {
			// config not ready ignore it
		}

		return config;
	};

	/**
	 * fix menu height for mobile devices
	 * @param config
	 * @param options
	 */
	this.navigation = function (config, options) {
		try {
			var navigation = {};
			navigation.menuStyle = {};
			navigation.menuStyle.height = "200px";
			navigation.menuStyle.overflow = "auto";

			if (!webMI.getClientInfo().isDesktop) {
				config.navigation = navigation;
			}
		} catch (ex) {
			// config not ready ignore it
		}

		return config;
	};

	/**
	 * fix tick values and defaults when alignTicks is active
	 * @param config
	 * @param options
	 * @returns {*}
	 */
	this.axisTicks = function (config, options) {
		if (config.chart.alignTicks) {
			for (var axis in config.yAxis) {
				config.yAxis[axis]["startOnTick"] = true;
				config.yAxis[axis]["endOnTick"] = true;
				config.yAxis[axis]["tickInterval"] = null;
				config.yAxis[axis]["minorTickInterval"] = null;
			}
		}

		return config;
	};

	/**
	 * fix yaxis titles
	 * @param config
	 * @param options
	 * @returns {*}
	 */
	this.axisTitles = function (config, options) {
		if (config.chart.alignTicks) {
			for (var axis in config.yAxis) {
				if (!("title" in config.yAxis[axis])) {
					config.yAxis[axis]["title"] = {
						align: "middle",
						rotation: 270,
						useHTML: false,
						x: 0,
						y: 0,
						style: {
							color: "#666666"
						},
						text: translations["Y-Axis"] + " " + axis
					};
				}
			}
		}

		return config;
	};

	/**
	 * fix boost options
	 * @param config
	 * @param options
	 * @returns {*}
	 */
	this.boostThreshold = function (config) {
		if (config.boost && config.boost.enabled === true) {
			config.atviseOptions.disableDownSampling = true;
		}

		return config;
	};
})();

/**
 * Handling compression
 */
ConfigHandler.prototype.compressor = new (function () {
	var that = this;

	/**
	 * uncompression configurations
	 * @param config
	 * @param configName
	 * @returns {*}
	 */
	this.decompress = function (config, configName) {
		config = config[configName];

		if (!config) {
			config = {};
		} else {
			const compressed = typeof config["global"] == "undefined";

			if (compressed) {
				config = LZString.decompressFromEncodedURIComponent(config);
				config = JSON.parse(config);
			}
		}

		return config;
	};

	/**
	 * compress configurations
	 * @param config
	 * @param configName
	 * @returns {*}
	 */
	this.compress = function (config, configName) {
		var configString = JSON.stringify(config[configName]);
		config[configName] = LZString.compressToEncodedURIComponent(configString);
		return config;
	};
})();

/**
 * Handle rendering while safe / delete is in progress
 */
ConfigHandler.prototype.dataLockHandler = new (function () {
	var that = this;

	/**
	 * Lock adding points to the chart while changes are in progress
	 * @param chart
	 */
	this.lock = function (chart) {
		for (var s in chart.chart.series) {
			chart.chart.series[s].lockAddPoint(true);
		}
		this.unlock(chart);
	};

	/**
	 * Unlock adding points to the chart after changes are done
	 * @param chart
	 */
	this.unlock = function (chart) {
		var that = this;
		if (saveInProgress) {
			setTimeout(function () {
				that.unlock(chart);
			}, 50);
		} else {
			if (chart && chart.chart && chart.chart.series) {
				for (var s in chart.chart.series) {
					chart.chart.series[s].lockAddPoint(false);
				}
			}
		}
	};
})();

/**
 * Handling file operations
 */
ConfigHandler.prototype.file = new (function () {
	var that = this;

	/**
	 * Creating new file
	 * @param filename
	 * @param callback
	 * @param format
	 */
	this.create = function (filename, callback, format) {
		if (typeof format == "undefined") format = "utf8";
		webMI.data.call(
			"FilesystemCreate",
			{
				file: filename,
				overwrite: true
			},
			function (e) {
				callback(e);
			}
		);
	};

	/**
	 * Read file
	 * @param filename
	 * @param callback
	 * @param format
	 */
	this.read = function (filename, callback, format) {
		if (typeof format == "undefined") format = "utf8";
		webMI.data.call(
			"FilesystemRead",
			{
				file: filename,
				format: "utf8"
			},
			function (e) {
				callback(e);
			}
		);
	};

	/**
	 * Safe file
	 * @param filename
	 * @param content
	 * @param callback
	 * @param format
	 */
	this.save = function (filename, content, callback, format) {
		if (typeof format == "undefined") format = "utf8";
		webMI.data.call(
			"FilesystemWrite",
			{
				file: filename,
				format: format,
				mode: "output",
				content: JSON.stringify(content)
			},
			function (e) {
				console.log("saved config in " + filename);
				saveInProgress = false;
				callback(content);
			}
		);
	};
})();

/**
 * Unifier minifies configuration keys to ensure it doesn't run out of memory space
 */
ConfigHandler.prototype.unifier = new (function () {
	var unifierDB = getUnifierDB();

	/**
	 * unify config string
	 * @param config
	 * @param unify
	 * @returns {any}
	 */
	this.unify = function (config, unify) {
		var config = JSON.parse(JSON.stringify(config));

		function getKey(value, obj) {
			for (var prop in obj) {
				if (obj[prop] === value) return prop;
			}
			return;
		}

		function loopKeys(obj) {
			for (var key in obj) {
				var newKey = unify ? unifierDB[key] : getKey(key, unifierDB);

				if (typeof obj[key] === "object") {
					if (typeof newKey != "undefined") {
						Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, key));
						delete obj[key];

						loopKeys(obj[newKey]);
						continue;
					}
					loopKeys(obj[key]);
				} else {
					if (typeof newKey != "undefined") {
						obj[newKey] = obj[key];
						delete obj[key];
					}
				}
			}
		}

		loopKeys(config);

		return config;
	};

	/**
	 * unifier stringify
	 * @param obj
	 * @returns {string}
	 */
	this.stringify = function (obj) {
		var ret = JSON.stringify(obj);
		ret.replace(/\\"/g, "\uFFFF"); //U+ FFFF
		ret = ret.replace(/\"([^"]+)\":/g, "$1:").replace(/\uFFFF/g, '\\"');
		return ret;
	};

	/**
	 * unifier parse
	 * @param strg
	 * @returns {any}
	 */
	this.parse = function (strg) {
		// Replace "\"" with "'"
		// Replace ":" with "@colon@" if it's between double-quotes
		// Add double-quotes around any tokens before the remaining ":"
		// Turn "@colon@" back into ":"
		strg = strg
			.replace(/\\"/g, "'")
			.replace(/:\s*"([^"]*)"/g, function (match, p1) {
				return ': "' + p1.replace(/:/g, "@colon@") + '"';
			})
			.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')
			.replace(/@colon@/g, ":");

		return JSON.parse(strg);
	};
})();

/* ---------------------------------------------------------------------------- */
/* UNIFIER DB																	*/
/* Existing keys must not be changed!!! 										*/
/* Otherwise this could lead to incompatibilities with existing configurations!	*/
/* ---------------------------------------------------------------------------- */

/**
 * Retuns the unifier DB
 * "global" is used for compression detectiond, so do not unify "global"
 */
function getUnifierDB() {
	return {
		animation: "a",
		duration: "b",
		lineWidth: "c",
		color: "d",
		marker: "e",
		events: "f",
		enabled: "g",
		style: "h",
		lineColor: "i",
		states: "j",
		normal: "k",
		hover: "l",
		lineWidthPlus: "m",
		select: "n",
		fontSize: "o",
		align: "p",
		padding: "q",
		x: "r",
		y: "s",
		fontWeight: "t",
		verticalAlign: "u",
		tooltip: "v",
		dataLabels: "w",
		textOutline: "x",
		formatter: "y",
		allowPointSelect: "z",
		showCheckbox: "aa",
		fillColor: "ab",
		point: "ac",
		cropThreshold: "ad",
		pointRange: "ae",
		softThreshold: "af",
		halo: "ag",
		stickyTracking: "ah",
		turboThreshold: "ai",
		findNearestPointBy: "aj",
		borderColor: "ak",
		enabledThreshold: "al",
		radius: "am",
		radiusPlus: "an",
		borderRadius: "ao",
		size: "ap",
		opacity: "aq",
		threshold: "ar",
		onclick: "as",
		textKey: "at",
		type: "au",
		boostThreshold: "av",
		boostData: "aw",
		brightness: "ax",
		index: "ay",
		position: "az",
		crisp: "ba",
		groupPadding: "bb",
		pointPadding: "bc",
		minPointLength: "bd",
		startFromThreshold: "be",
		width: "bf",
		backgroundColor: "bg",
		text: "bh",
		borderWidth: "bi",
		cursor: "bj",
		valueDecimals: "bk",
		id: "bl",
		address: "bm",
		address2: "bm2",
		aggregate: "bn",
		aggregate2: "bn2",
		name: "bo",
		_colorIndex: "bp",
		_symbolIndex: "bq",
		data: "br",
		trackByArea: "bs",
		shadow: "bt",
		dateTimeLabelFormats: "bu",
		zIndex: "bv",
		height: "bw",
		title: "bx",
		fill: "by",
		xLow: "bz",
		xHigh: "ca",
		yLow: "cb",
		yHigh: "cc",
		symbol: "cd",
		millisecond: "ce",
		second: "cf",
		minute: "cg",
		hour: "ch",
		day: "ci",
		week: "cj",
		month: "ck",
		year: "cl",
		footerFormat: "cm",
		snap: "cn",
		headerFormat: "co",
		pointFormat: "cp",
		pointerEvents: "cq",
		whiteSpace: "cr",
		followTouchMove: "cs",
		background: "ct",
		loading: "cu",
		decimalPoint: "cv",
		printChart: "cw",
		downloadPNG: "cx",
		downloadJPEG: "cy",
		downloadPDF: "cz",
		downloadSVG: "da",
		downloadCSV: "db",
		downloadXLS: "dc",
		openInCloud: "dd",
		viewData: "de",
		theme: "df",
		widthAdjust: "dg",
		showInLegend: "dh",
		whiskerLength: "di",
		medianWidth: "dj",
		whiskerWidth: "dk",
		inside: "dl",
		labels: "dm",
		navigation: "dn",
		userOptions: "do",
		symbolSize: "dp",
		symbolX: "dq",
		symbolY: "dr",
		separator: "ds",
		min: "dt",
		max: "du",
		userMin: "dv",
		userMax: "dw",
		colors: "dx",
		symbols: "dy",
		lang: "dz",
		months: "ea",
		shortMonths: "eb",
		weekdays: "ec",
		numericSymbols: "ed",
		resetZoom: "ee",
		resetZoomTitle: "ef",
		thousandsSep: "eg",
		contextButtonTitle: "eh",
		"*global*": "ei",
		useUTC: "ej",
		time: "ek",
		chart: "el",
		defaultSeriesType: "em",
		ignoreHiddenSeries: "en",
		spacing: "eo",
		resetZoomButton: "ep",
		plotBorderColor: "eq",
		alignTicks: "er",
		panning: "es",
		panKey: "et",
		fontFamily: "eu",
		zoomType: "ev",
		margin: "ew",
		subtitle: "ex",
		plotOptions: "ey",
		line: "ez",
		area: "fa",
		spline: "fb",
		areaspline: "fc",
		column: "fd",
		bar: "fe",
		scatter: "ff",
		pie: "fg",
		allowOverlap: "fh",
		distance: "fi",
		center: "fj",
		clip: "fk",
		colorByPoint: "fl",
		ignoreHiddenPoint: "fm",
		legendType: "fn",
		slicedOffset: "fo",
		arearange: "fp",
		areasplinerange: "fq",
		columnrange: "fr",
		gauge: "fs",
		defer: "ft",
		crop: "fu",
		dial: "fv",
		pivot: "fw",
		boxplot: "fx",
		errorbar: "fy",
		grouping: "fz",
		linkedTo: "ga",
		waterfall: "gb",
		dashStyle: "gc",
		polygon: "gd",
		bubble: "ge",
		fillOpacity: "gf",
		animationLimit: "gg",
		minSize: "gh",
		maxSize: "gi",
		zThreshold: "gj",
		zoneAxis: "gk",
		legend: "gl",
		alignColumns: "gm",
		layout: "gn",
		labelFormatter: "go",
		activeColor: "gp",
		inactiveColor: "gq",
		itemStyle: "gr",
		textOverflow: "gs",
		itemHoverStyle: "gt",
		itemHiddenStyle: "gu",
		itemCheckboxStyle: "gv",
		squareSymbol: "gw",
		symbolPadding: "gx",
		labelStyle: "gy",
		top: "gz",
		textAlign: "ha",
		credits: "hb",
		href: "hc",
		boost: "hd",
		allowForce: "he",
		seriesThreshold: "hf",
		atviseOptions: "hg",
		mode: "hh",
		source: "hi",
		liveModeFrameRate: "hj",
		configNode: "hk",
		configFile: "hl",
		configName: "hm",
		saveMethod: "hn",
		saveCompressed: "ho",
		enableCursor1: "hp",
		enableCursor2: "hq",
		disableDownSampling: "hr",
		exporting: "hs",
		url: "ht",
		printMaxWidth: "hu",
		scale: "hv",
		buttons: "hw",
		contextButton: "hx",
		className: "hy",
		menuClassName: "hz",
		titleKey: "ia",
		menuItems: "ib",
		notificationButton: "ic",
		_titleKey: "id",
		symbolUrl: "ie",
		menuItemDefinitions: "if",
		libURL: "ig",
		csv: "ih",
		columnHeaderFormatter: "ii",
		dateFormat: "ij",
		itemDelimiter: "ik",
		lineDelimiter: "il",
		showTable: "im",
		useMultiLevelHeaders: "in",
		useRowspanHeaders: "io",
		yAxis: "ip",
		autoscale: "iq",
		endOnTick: "ir",
		buttonOptions: "is",
		stroke: "it",
		buttonSpacing: "iu",
		symbolFill: "iv",
		symbolStroke: "iw",
		symbolStrokeWidth: "ix",
		menuStyle: "iy",
		border: "iz",
		menuItemStyle: "ja",
		transition: "jb",
		menuItemHoverStyle: "jc",
		xAxis: "jd",
		timeSpan: "je",
		timeSpanUnit: "jf",
		crosshair: "jg",
		format: "jh",
		gridLineWidth: "ji",
		gridLineColor: "jj",
		minorGridLineWidth: "jk",
		minorGridLineColor: "jl",
		opposite: "jm",
		isX: "jn",
		series: "jo",
		tickInterval: "jp",
		nonStop: "jq",
		downloadXLSX: "jr",
		dataArchive: "js",
		dataArchive2: "jt",
		sourceOptions: "ju"
	};
}
