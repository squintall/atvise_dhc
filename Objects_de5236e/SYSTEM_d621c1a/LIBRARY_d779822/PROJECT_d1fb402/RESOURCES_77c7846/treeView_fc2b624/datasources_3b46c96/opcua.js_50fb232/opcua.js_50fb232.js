(() => {
	// Here the same name should be used as for the respective highcharts datasource
	const dataSourceName = "opcUA";

	var types = {
		baseVariable: "baseVariable",
		folder: "folder",
		projectVariables: "baseVariable",
		aggregateTemplate: "aggregateTemplate",
		aggregateFunction: "aggregateFunction",
		aggregateFunctionType: "aggregateFunctionType"
	};

	var aggregateOptions = {
		intervalUnit: "interval_unit",
		intervalValue: "interval_value",
		offsetUnit: "offset_unit",
		offsetValue: "offset_value",
		stepped: "stepped",
		aggregateType: "aggregate",
		relatedNodeAddress: "relatedNodeAddress"
	};

	var opcUATypes = {
		baseVariableDataType: "i=63",
		baseVariable: "i=62",
		folder: "i=61",
		project: "ObjectTypes.PROJECT",
		projectVariables: "VariableTypes.PROJECT",
		aggregateTemplate: "ObjectTypes.ATVISE.AggregateTemplate",
		aggregateFunction: "ObjectTypes.ATVISE.AggregateFunction",
		aggregateFunctionType: "i=2340"
	};

	/**
	 * A helper method for parsing the data-item of a node
	 * @param {HTMLElement} node The corresponding DOM-node
	 * @return {string} object The parsed data-item
	 */
	function getDataFromNode(node) {
		if (node) {
			return JSON.parse(node.getAttribute("data-item"));
		} else {
			return undefined;
		}
	}

	/**
	 * A helper method for adding additional data to the data-item of a node
	 * @param {object} item The item (object) to be added
	 * @param {HTMLElement} addData The corresponding DOM-node
	 */
	function addDataToItem(item, addData) {
		var data = JSON.parse(item.getAttribute("data-item"));
		item.setAttribute("data-item", JSON.stringify(mergeData(data, addData)));
	}

	/**
	 * A helper method to merge to objects recursively
	 * @param {object} data The base-object
	 * @param {object} addData The data to add recursively to the base object
	 */
	function mergeData(data, addData) {
		for (var p in addData) {
			try {
				// Property in destination object set; update its value.
				if (addData[p].constructor === Object) {
					data[p] = mergeData(data[p], addData[p]);
				} else {
					data[p] = addData[p];
				}
			} catch (e) {
				// Property in destination object not set; create it and set its value.
				data[p] = addData[p];
			}
		}
		return data;
	}

	/**
	 * A helper functions that gets the related node address of a html element.
	 * @param {HTMLElement} referenceNode A html node that has a data-item attribute.
	 * @return {string} relatedAddress
	 */
	function getRelatedNodeAddress(referenceNode) {
		var currentNode = referenceNode;
		var relatedAddress = getDataFromNode(currentNode).address;

		while (relatedAddress.indexOf("HISTORY") !== -1) {
			currentNode = currentNode.parentNode;
			var nodeData = {};
			for (var i = 0; i < currentNode.childNodes.length; i++) {
				nodeData = getDataFromNode(currentNode.childNodes[i]);
				if (nodeData) {
					relatedAddress = nodeData.address;
					break;
				}
			}
		}

		return relatedAddress;
	}

	/**
	 * A helper functions that searches the response cache for the searchterm.
	 * @param {string} address nodeId of the node to search for.
	 * @param {object} nodeTree A cached response of all nodes in the project.
	 * @return {object} Object conatining the nodes required info
	 */
	function findChildren(address, nodeTree) {
		let result;
		if (nodeTree.address === address) {
			return nodeTree;
		}
		for (let nodeName in nodeTree) {
			if (nodeTree[nodeName].address === address) {
				return nodeTree[nodeName].childs;
			} else {
				if (nodeTree[nodeName].childs) {
					result = findChildren(address, nodeTree[nodeName].childs);
				}
			}

			if (result) return result;
		}
	}

	function TreeViewDatasource(options) {
		const self = this;
		const defaultOptions = {
			renderTo: "",
			startAddress: "AGENT.OBJECTS",
			aggregateAddressPrefix: "AGENT.HISTORY.AGGREGATETEMPLATES",
			selectableTypes: [types.baseVariable, types.aggregateFunction],
			fontSize: 12,
			leafPadding: 2,
			leafIndentation: 15,
			busyIndicatorTolerance: 100,
			expandoOffset: 3,
			searchDepth: 100,
			navigationDepth: 1,
			typeImagePaths: {
				baseVariable: "/treeView/icons/baseVariable.svg",
				folder: "/treeView/icons/folder.svg",
				aggregateFunction: "/treeView/icons/aggregateFunction.svg"
			}
		};

		this.cachedAvailableNodes = false;
		this.buildingNodesCache = false;
		this.browseNodesBacklog = [];

		self.options = {};
		Object.assign(self.options, defaultOptions, options);

		var languageName = "";
		for (var language in project.languages) {
			languageName = language;
			break;
		}
		self.options.languagePrefix = languageName;

        if (this.options.nodeCacheActive) {
            this.fetchAvailableNodeAdresses(() => {
                // Cache is ready.
            });
        }
	}

	/**
	 * A method that fetches all nodes that can be displayed in the treeView and builds an array for tree filtering.
	 * @param {object} self The TreeView instance.
	 * @param {function} dataCallback A callback function that is invoked with all the available nodes.
	 */
	TreeViewDatasource.prototype.fetchAvailableNodeAdresses = function (dataCallback) {
		const self = this;

		if (this.cachedAvailableNodes && this.options.nodeCacheActive) {
			this.buildAddressesArray(function (addresses) {
				var orderedAdresses = [];
				var lastValidAddress = null;

				for (var i = 0; i < addresses.length; i++) {
					var address = webMI.escapeHTML(addresses[i]);
					if (address.indexOf(self.options.aggregateAddressPrefix) === -1) {
						lastValidAddress = address;
						orderedAdresses.push({ address: address });
					} else {
						orderedAdresses.push({ address: lastValidAddress, aggregateReference: address });
					}
				}

				dataCallback(orderedAdresses);
			}, this.cachedAvailableNodes);
			return;
		}

		if (this.buildingNodesCache) {
			this.browseNodesBacklog.push(dataCallback);
			return;
		}

		this.buildingNodesCache = true;

		webMI.data.call(
			"BrowseNodes",
			{
				startAddress: this.options.startAddress,
				endLevel: this.options.searchDepth,
				vTypes: [
					opcUATypes.baseVariableDataType,
					opcUATypes.baseVariable,
					opcUATypes.folder,
					opcUATypes.project,
					opcUATypes.projectVariables,
					opcUATypes.aggregateTemplate,
					opcUATypes.aggregateFunction
				],
				mapping: [
					{alias: "address", keys: ["nodeId", "xml"], removeNsTag: true},
					{alias: "name", keys: ["browseName", "name"]},
					{alias: "type", keys: ["typeDefinition", "xml"], removeNsTag: true}
				],
				includeStartAddress: false
			},
			(response) => {
				this.cachedAvailableNodes = response;
				this.buildAddressesArray(function (addresses) {
					var orderedAdresses = [];
					var lastValidAddress = null;

					for (var i = 0; i < addresses.length; i++) {
						var address = webMI.escapeHTML(addresses[i]);
						if (address.indexOf(self.options.aggregateAddressPrefix) === -1) {
							lastValidAddress = address;
							orderedAdresses.push({ address: address });
						} else {
							orderedAdresses.push({ address: lastValidAddress, aggregateReference: address });
						}
					}

					self.cachedAvailableNodes;

					dataCallback(orderedAdresses);

					self.browseNodesBacklog.forEach((callback) => {
						callback(orderedAdresses);
					});
				}, response);
			}
		);
	};

	/**
	 * Provides the tree view with the data types that actually are selectable instead of just browsable.
	 * @returns {array} Selectable types
	 */
	TreeViewDatasource.prototype.getSelectableTypes = function () {
		return [types.baseVariable, types.aggregateFunction];
	};

	/**
	 * A method that is used by {@link TreeViewDatasource#fetchAvailableNodeAdresses} as a callback.
	 * @param {function} dataCallback The callback function that is invoked with the processed data.
	 * @param {object} nodeStructure The node structure delivered from the server.
	 * @return {Array} addresses
	 */
	TreeViewDatasource.prototype.buildAddressesArray = function (dataCallback, nodeStructure) {
		var addresses = [];

		for (element in nodeStructure) {
			var nodeEntry = nodeStructure[element];

			if (checkIgnoredProperties(nodeEntry) && opcUATypes.aggregateTemplate.indexOf(nodeEntry["type"]) === -1) {
				addresses.push(nodeEntry["address"]);
			}

			if (nodeEntry["childs"] !== null) {
				addresses = addresses.concat(this.buildAddressesArray(null, nodeEntry["childs"]));
			}
		}
		if (typeof dataCallback === "function") {
			dataCallback(addresses);
		}

		return addresses;
	};

	/**
	 * A method that requests the node structure from the server
	 * @param {string} referenceAddress The node address to get the data for
	 * @param {HTMLElement} referenceNode The node the data is requested for
	 */
	TreeViewDatasource.prototype.fetchTreeStructure = function (referenceAddress, referenceNode) {
		return new Promise((resolve, reject) => {
			if (webMI.getMethodSupport().indexOf("BrowseNodes") == -1) {
				return;
			}

			var startAddress = this.options.startAddress;

			if (referenceAddress) {
				startAddress = referenceAddress;
			} else {
				var data = getDataFromNode(referenceNode);
				if (data) {
					startAddress = data.address;
				}
			}

			try {
				var aggregateFunction = startAddress.indexOf("AGENT.HISTORY.AGGREGATETEMPLATES.") > -1;
			} catch (err) {
				console.log(err);
			}

			if (this.cachedAvailableNodes && this.options.nodeCacheActive) {
				let response = findChildren(startAddress, this.cachedAvailableNodes);
				const data = this.parseNodeStructure.bind(this, referenceNode)(response);
				resolve(data, referenceNode);
			} else {
				webMI.data.call(
					"BrowseNodes",
					{
						startAddress: startAddress,
						endLevel: aggregateFunction ? 2 : this.options.navigationDepth,
						vTypes: [
							opcUATypes.baseVariableDataType,
							opcUATypes.baseVariable,
							opcUATypes.folder,
							opcUATypes.project,
							opcUATypes.projectVariables,
							opcUATypes.aggregateFunctionType,
							opcUATypes.aggregateTemplate,
							opcUATypes.aggregateFunction
						],
						mapping: [
							{ alias: "address", keys: ["nodeId", "xml"], removeNsTag: true },
							{ alias: "name", keys: ["browseName", "name"] },
							{ alias: "type", keys: ["typeDefinition", "xml"], removeNsTag: true }
						],
						includeStartAddress: false
					},
					(response) => {
						if (response.error && typeof response.error === "number") {
							reject(response);
						} else {
							const data = this.parseNodeStructure.bind(this, referenceNode)(response);
							resolve(data, referenceNode);
						}
					}
				);
			}
		});
	};

	/**
	 * A method that parses the fetched node structure and requests additional node information
	 * @param {HTMLElement} referenceNode The node the data is requested for
	 * @param {object} nodeStructure The node structure returned from the server
	 */
	TreeViewDatasource.prototype.parseNodeStructure = function (referenceNode, nodeStructure) {
		if (nodeStructure.error && typeof nodeStructure.error === "number") return;

		// Check if two DB spaces exist
		var dbspaces = {};
		for (var property in nodeStructure) {
			if (!isNaN(property.substr(0, property.indexOf(".")))) dbspaces[property.substr(0, property.indexOf("."))] = true;
		}

		if (Object.keys(dbspaces).length > 1) {
			for (var property in nodeStructure) {
				nodeStructure[property].name = nodeStructure[property].address;
			}
		}

		var data = [];
		for (var element in nodeStructure) {
			var nodeEntry = nodeStructure[element];
			var dataID = generateDataID();
			var hasChildren = nodeEntry.childs != null;

			var projectVariableName = false;

			// Workaround fÃ¼r alte Portalversionen, wo BrowseNodes noch kein "type" liefert
			if (typeof nodeEntry.type == "undefined") {
				if (hasChildren) nodeEntry.type = "i=61";
				else nodeEntry.type = "i=62";
			}

			if (nodeEntry.type.indexOf("VariableTypes.PROJECT") === 0) {
				projectVariableName = nodeEntry.type;
			}

			switch (nodeEntry.type) {
				case opcUATypes.baseVariableDataType:
					data.push({
						name: nodeEntry.name,
						address: nodeEntry.address,
						type: types.baseVariable,
						hasChildren: hasChildren,
						children: [],
						dataID: dataID
					});
					break;
				case opcUATypes.baseVariable:
					if (checkIgnoredProperties(nodeEntry)) {
						data.push({
							name: nodeEntry.name,
							address: nodeEntry.address,
							type: types.baseVariable,
							hasChildren: hasChildren,
							children: [],
							dataID: dataID
						});
					}
					break;
				case projectVariableName:
					data.push({
						name: nodeEntry.name,
						address: nodeEntry.address,
						type: types.projectVariables,
						hasChildren: hasChildren,
						children: [],
						dataID: dataID
					});
					break;
				case opcUATypes.folder:
					data.push({
						name: nodeEntry.name,
						address: nodeEntry.address,
						type: types.folder,
						hasChildren: hasChildren,
						children: []
					});
					break;
				case opcUATypes.aggregateTemplate.slice(7):
					data.push({
						name: nodeEntry.name,
						address: nodeEntry.address,
						type: types.folder,
						hasChildren: hasChildren,
						children: []
					});
					break;
				case opcUATypes.aggregateFunction:
					fetchAggregateOptions(nodeEntry, dataID, referenceNode);
					hasChildren = checkChildren(nodeEntry.childs);
					data.push({
						name: nodeEntry.name,
						address: nodeEntry.address,
						type: types.aggregateFunction,
						hasChildren: hasChildren,
						children: hasChildren ? nodeEntry.childs : [],
						dataID: dataID
					});
					break;
				case opcUATypes.aggregateFunctionType:
					break;
				default:
					data.push({
						name: nodeEntry.name,
						address: nodeEntry.address,
						type: types.folder,
						hasChildren: hasChildren,
						children: []
					});
					break;
			}
		}

		// Assign icons
		data.forEach((item) => {
			var icon = document.createElement("img");
			icon.src = this.options.languagePrefix + this.options.typeImagePaths[item.type];
			item.icon = icon;
		});

		return data;
	};

	/**
	 * A helper method that checks if there are children that are worth to be displayed in the tree.
	 * @param {object} children The element of the node structure to check the children for
	 */
	function checkChildren(children) {
		var ignoredNodes = [
			{name: aggregateOptions.offsetUnit, type: opcUATypes.baseVariable},
			{name: aggregateOptions.offsetValue, type: opcUATypes.baseVariable},
			{name: aggregateOptions.intervalUnit, type: opcUATypes.baseVariable},
			{name: aggregateOptions.intervalValue, type: opcUATypes.baseVariable},
			{name: aggregateOptions.stepped, type: opcUATypes.baseVariable},
			{name: "*", type: opcUATypes.aggregateFunctionType}
		];
		var validChildren = false;

		if (children !== "ondemand") {
			for (element in children) {
				var nodeEntry = children[element];
				var ignoreNode = false;
				for (var i = 0; i < ignoredNodes.length; i++) {
					if (
						(nodeEntry.name == ignoredNodes[i].name || ignoredNodes[i].name == "*") &&
						nodeEntry.type == ignoredNodes[i].type
					) {
						ignoreNode = true;
						break;
					}
				}
				if (!ignoreNode) {
					validChildren = true;
					break;
				}
			}
		}

		return validChildren;
	}

	/**
	 * A helper method that checks the base variables that should be ignored for displaying
	 * @param {object} nodeEntry The element of the node structure to be eventually ignored
	 */
	function checkIgnoredProperties(nodeEntry) {
		var isNodeOption = false;
		for (option in aggregateOptions) {
			if (aggregateOptions[option] == nodeEntry.name) {
				isNodeOption = true;
				break;
			}
		}
		return !isNodeOption;
	}

	/**
	 * A helper method that gets the options for nodes that represent aggregate functions
	 * @param {object} nodeEntry The element of the node structure that is an aggregate function
	 */
	function fetchAggregateOptions(nodeEntry, dataID, referenceNode) {
		var relatedNodeAddress = getRelatedNodeAddress(referenceNode);
		var aggregateAddress = nodeEntry.address;

		var aggregateType;
		webMI.data.call(
			"BrowseNodes",
			{
				startAddress: nodeEntry.address,
				endLevel: 1,
				vTypes: [opcUATypes.aggregateFunctionType],
				mapping: [
					{alias: "address", keys: ["nodeId", "xml"], removeNsTag: true},
					{alias: "name", keys: ["browseName", "name"]},
					{alias: "type", keys: ["typeDefinition", "xml"], removeNsTag: true}
				],
				includeStartAddress: false
			},
			function (e) {
				aggregateType = e[Object.keys(e)[0]].name;
				webMI.data.read(
					[
						aggregateAddress + "." + aggregateOptions.intervalValue,
						aggregateAddress + "." + aggregateOptions.intervalUnit,
						aggregateAddress + "." + aggregateOptions.offsetValue,
						aggregateAddress + "." + aggregateOptions.offsetUnit
					],
					function (data) {
						var aggregateData = {aggregateInfo: {}};
						aggregateData.aggregateInfo[aggregateOptions.intervalValue] = data[0].value;
						aggregateData.aggregateInfo[aggregateOptions.intervalUnit] = data[1].value;
						aggregateData.aggregateInfo[aggregateOptions.offsetValue] = data[2].value;
						aggregateData.aggregateInfo[aggregateOptions.offsetUnit] = data[3].value;
						aggregateData.aggregateInfo[aggregateOptions.aggregateType] = aggregateType;
						aggregateData.aggregateInfo[aggregateOptions.relatedNodeAddress] = relatedNodeAddress;
						addDataToItem(referenceNode.parentNode.querySelector("div[data-id='" + dataID + "']"), aggregateData);
					}
				);
			}
		);
	}

	/**
	 * A helper method that generates a unique data-id
	 * @return {string} id A unique data id
	 */
	function generateDataID() {
		var S4 = function () {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
	}

	if (!window.treeViewDatasources) {
		window.treeViewDatasources = {};
	}

	window.treeViewDatasources[dataSourceName] = TreeViewDatasource;
})(window, document);
