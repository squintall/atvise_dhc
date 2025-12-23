(() => {
	// Here the same name should be used as for the respective highcharts datasource
	const dataSourceName = "scope";

	if (!window.treeViewDatasources) {
		window.treeViewDatasources = {};
	}

	// If the class for this datasource has already been created, abort.
	if (window.treeViewDatasources[dataSourceName]) return;

	// NOTE: Here comes the Scope Proxy

	/**
	 * Form-urlencodes an object so it can be sent via AJAX.
	 * @param {{}} obj The object to encode.
	 * @param {string} [prefix] Used internally when encoding multi-level objects.
	 * @return {string} The serialized object.
	 */
	function serialize(obj, prefix) {
		const parts = []; // eslint-disable-next-line no-restricted-syntax

		for (const p in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, p)) {
				const k = prefix ? "".concat(prefix, "[").concat(p, "]") : p;
				const v = obj[p];
				parts.push(
					typeof v === "object" ? serialize(v, k) : "".concat(encodeURIComponent(k), "=").concat(encodeURIComponent(v))
				);
			}
		}

		return parts.join("&");
	}

	/**
	 * Start the proxy by giving it a Scope host address.
	 * @param {string} host The scope address to proxy.
	 * @param {number} [port] The port to proxy defaults to current location port.
	 * @example <caption>Basic usage</caption>
	 * ScopeProxy.use('10.200.300.400');
	 */
	function use(host) {
		let port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : location.port;
		const original = webMI.data.call;
		var protocol = "//";

		if (host && host.length > 0) {
		  host = host.toLowerCase();

		  if (host.indexOf("http://") > 0 || host.indexOf("https://") > 0) {
			throw new Error('Invalid host specified for scope proxy function.');
		  }

		  if (host.indexOf("http://") == 0) {
			protocol = "http://";
			host = host.replace(protocol, "");
		  } else if (host.indexOf("https://") == 0) {
			protocol = "https://";
			host = host.replace(protocol, "");
		  } else if (host.indexOf("//") == 0) {
			host = host.replace(protocol, "");
		  }

		  if (host.indexOf(":") > -1) {
			port = host.split(":")[1];
			host = host.split(":")[0];

			if (port.match(/[a-z,/,\\\\]/g)) {
			  throw new Error('Invalid port specified for scope proxy function.');
			}
		  }
		} else {
		  return; // return on invalid host
		}

		webMI.data.call = function call(originalPath, originalOptions, callback) {
		  var _this = this;

		  const path = originalPath;
		  const options = originalOptions;
		  const m = path.match(/^m1(.+)/); // scope_

		  if (m !== null) {
			const xhttp = new XMLHttpRequest();
			const address = protocol.concat(host, ":", port);

			xhttp.onreadystatechange = () => {
			  if (xhttp.readyState === 4) {
				callback.call(this, xhttp.status === 200 ? JSON.parse(xhttp.responseText) : {
				  error: 1,
				  errorstring: "ScopeProxy could not connect to ".concat(address)
				});
			  }
			};

			xhttp.open('POST', address.concat("/webMI/?", m[0]), true);
			xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhttp.send(serialize(options));
		  } else {
			// No proxy needed
			original.apply(this, [path, options, function () {
			  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			  }

			  callback.apply(_this, args);
			}]);
		  }
		};
	}

	// NOTE: End of the Scope Proxy

	// Scope helper functions

	/**
	 * Returns all recorders available.
	 * @param [callback] Called with an array of recorder descriptions on success.
	 * @param callback.result An array of recorder descriptions.
	 */
	function getRecorders(callback) {
		return promisify(callback, (c) => webMI.data.call("m1scope_getrecorder", {}, (e) => eventCallback(e, c)));
	}

	/**
	 * Returns all channels for a recorder.
	 * @param recorder Recorder name.
	 */
	function getChannels(recorder, callback) {
		return promisify(callback, (c) =>
			webMI.data.call("m1scope_getchannel", { recname: recorder }, (e) => eventCallback(e, c))
		);
	}

	function promisify(callback, fn) {
		if (callback) {
			return fn(callback);
		}

		return new Promise((resolve, reject) => fn((error, result) => (error ? reject(error) : resolve(result))));
	}

	/**
	 * Creates a node.js-style callback from a webMi.data-event.
	 * @param e The original event.
	 * @param callback The function to call with.
	 * @param [options] Options to normalize the callback arguments.
	 * @param options.arrayArgument Normalize the callback results if a non-array is passed to this argument.
	 */
	function eventCallback(e, callback, options) {
		if (options && options.arrayArgument && !isArray(options.arrayArgument) && e.result) {
			// eslint-disable-next-line no-param-reassign
			e = e.result[0];
		}

		let error = null;

		if (e.error === undefined) {
			// array result object
			for (let i = 0; i < e.result.length; i++) {
				const r = e.result[i];
				let out = r.result;

				if (r.error > 0) {
					if (error === null) {
						out = error = new Error(r.errorstring);
					} else {
						out = new Error(r.errorstring);

						error = new ScopeMultipleError(error);
						error.addError(out);
					}
				}

				// eslint-disable-next-line no-param-reassign
				e.result[i] = out;
			}
		} else if (e.error > 0) {
			error = new Error(e.errorstring);
		}

		callback(error, e.result || e);
	}

	// Scope helper functions End

	var types = {
		recorder: "folder",
		channel: "channel"
	};

	function TreeViewDatasourceScope(options) {
		const self = this;

		self.options = {
			host: options.host || "",
			startAddress: options.startAddress || "",
			selectableTypes: [types.channel],
			typeImagePaths: {
				channel: "/treeView/icons/baseVariable.svg"
			}
		};

		use(self.options.host);
	}

	/**
	 * Provides the tree view with the data types that actually are selectable instead of just browsable.
	 * @returns {array} Selectable types
	 */
	TreeViewDatasourceScope.prototype.getSelectableTypes = function () {
		return this.options.selectableTypes;
	};

	/**
	 * A method that requests the node structure from the server
	 */
	TreeViewDatasourceScope.prototype.fetchTreeStructure = async function (node) {
		if (!node) {
			const recorders = await getRecorders();

			return recorders.map((recorder) => ({
				name: recorder.recname,
				id: recorder.recname,
				type: types.recorder,
				icon: this.options.typeImagePaths.recorder,
				hasChildren: true,
				address: recorder.recname
			}));
		}

		if (node.channel) return [];

		const channels = await getChannels(node);

		return channels.map((channel) => ({
			id: this.stringifyChannelAddress(node, channel.name),
			address: this.stringifyChannelAddress(node, channel.name),
			name: channel.name,
			type: types.channel,
			icon: this.options.typeImagePaths.channel
		}));
	};

	/**
	 * A method that fetches all nodes that can be displayed in the treeView and builds an array for tree filtering.
	 * @param {function} dataCallback A callback function that is invoked with all the available nodes.
	 */
	TreeViewDatasourceScope.prototype.fetchAvailableNodeAdresses = async function (dataCallback) {
		const self = this;
		const addressList = [];
		const recorders = await self.fetchTreeStructure();

		for (const recorder of recorders) {
			addressList.push(recorder.id);
		}

		for (const recorder of recorders) {
			let channels = [];

			try {
				channels = await self.fetchTreeStructure(recorder.id);
			} catch (err) {
				// Some recorders will throw an 'Invalid State' error.
				continue;
			}

			for (const channel of channels) {
				addressList.push(channel.id);
			}
		}

		// Transform to expected structure
		let orderedAdresses = addressList.map((address) => {
			return { address: address };
		});

		dataCallback(orderedAdresses);
	};

	/** @private */
	TreeViewDatasourceScope.prototype.stringifyChannelAddress = function (recorder, channel) {
		return `${recorder}:${channel}`;
	};

	// Register class globally
	window.treeViewDatasources[dataSourceName] = TreeViewDatasourceScope;
})();
