(() => {
	// Here the same name should be used as for the respective highcharts datasource
	const dataSourceName = "TemplateForTreeViewDatasource";

	var types = {
		folderishType: "folderishType",
		leafishType: "leafishType"
	};

	const mockedTreeStruct = [
		{
			id: "root",
			type: types.folderishType,
			children: [
				{
					id: "folder1",
					type: types.folderishType,
					children: [
						{
							id: "leaf1inFolder1",
							type: types.leafishType
						},
						{
							id: "leaf2inFolder1",
							type: types.leafishType
						},
						{
							id: "leaf3inFolder1",
							type: types.leafishType
						}
					]
				},
				{
					id: "folder2",
					type: types.folderishType,
					children: [
						{
							id: "folder1inFolder2",
							type: types.folderishType,
							children: [
								{
									id: "leaf1infolder1inFolder2",
									type: types.leafishType
								},
								{
									id: "leaf2infolder1inFolder2",
									type: types.leafishType
								},
								{
									id: "leaf3infolder1inFolder2",
									type: types.leafishType
								}
							]
						},
						{
							id: "leaf1inFolder2",
							type: types.leafishType
						},
						{
							id: "leaf2inFolder2",
							type: types.leafishType
						},
						{
							id: "leaf3inFolder2",
							type: types.leafishType
						}
					]
				}
			]
		}
	];

	function TreeViewDatasourceTemplate() {
		const self = this;

		self.options = {
			startAddress: "AGENT.OBJECTS",
			selectableTypes: [types.folderishType, types.leafishType],
			typeImagePaths: {
				folderishType: "/treeView/icons/folder.svg",
				leafishType: "/treeView/icons/baseVariable.svg"
			}
		};

		var languageName = "";
		for (var language in project.languages) {
			languageName = language;
			break;
		}
		self.options.languagePrefix = languageName;
	}

	/**
	 * Provides the tree view with the data types that actually are selectable instead of just browsable.
	 * @returns {array} Selectable types
	 */
	TreeViewDatasourceTemplate.prototype.getSelectableTypes = function () {
		return [types.baseVariable, types.aggregateFunction];
	};

	/**
	 * A method that requests the node structure from the server
	 * @param {string} browseNodeId The node address to get the data for
	 */
	TreeViewDatasourceTemplate.prototype.fetchTreeStructure = function (browseNodeId) {
		return new Promise((resolve, reject) => {
			const treeStructure = [];

			if (!browseNodeId) {
				browseNodeId = "root";
			}

			function findById(treeStructure, browseNodeId) {
				for (let node of treeStructure) {
					if (node.id === browseNodeId) return node;

					if (node.children) {
						let desiredNode = findById(node.children, browseNodeId);
						if (desiredNode) return desiredNode;
					}
				}
				return false;
			}

			let subTree = findById(mockedTreeStruct, browseNodeId);

			subTree.children.forEach((item) => {
				var iconElement = document.createElement("img");
				iconElement.src = this.options.languagePrefix + this.options.typeImagePaths[item.type];

				treeStructure.push({
					name: item.id,
					address: item.id,
					type: item.type,
					hasChildren: !!(item.children && item.children.length),
					children: item.children || [],
					dataID: generateDataID(),
					icon: iconElement
				});
			});

			if (treeStructure.error) {
				reject(treeStructure);
			} else {
				resolve(treeStructure);
			}
		});
	};

	/**
	 * A helper method that generates a unique data-id
	 * @return {string} id A unique data id
	 * @memberOf TreeView
	 * @private
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
