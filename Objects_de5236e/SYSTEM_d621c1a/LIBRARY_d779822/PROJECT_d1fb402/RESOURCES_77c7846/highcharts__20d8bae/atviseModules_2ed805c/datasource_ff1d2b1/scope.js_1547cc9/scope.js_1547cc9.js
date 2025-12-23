
/*
  The Highcharts Datasource for Scope
  Also includes the modules Scope SDK (v1.0.3), Scope Proxy (v1.0.1)
*/
(function () {
  'use strict';

  // Use original document
              var document = top.document;

  // NOTE: Here comes the Scope Proxy

  /* eslint-disable import/prefer-default-export */

  /* global webMI:false */

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
        parts.push(typeof v === 'object' ? serialize(v, k) : "".concat(encodeURIComponent(k), "=").concat(encodeURIComponent(v)));
      }
    }

    return parts.join('&');
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

  /**
   * A callback is a function with an error and a generic result type as parameters.
   * When the callback is invoked and the error parameter is defined that means
   * an operation associated with the callback was unsuccessful and caused an error.
   * When the callback is invoked and the result is defined it will
   * indicate that an operation associated with the callback was successful.
   */


  /**
   * @param callback when callback was specified the return value will be the return value of the callback function
   * @param fn when no callback was specified the return value will be a {@link Promise}
   */
  function promisify(callback, fn) {

    if (callback) {
      return fn(callback);
    }

    return new Promise((resolve, reject) =>
      fn((error, result) => (error ? reject(error) : resolve(result)))
    );
  }

  // NOTE: Here comes the Scope SDK


  /** @module Scope */

  /**
   * Thrown if multiple errors occurred in an async operation.
   */
  class ScopeMultipleError extends Error {
    /**
     * Creates an error based on another error.
     * @param {Error} firstError The first error that occurred.
     */
    constructor(firstError) {
      super('Multiple Errors occurred');ScopeMultipleError.prototype.__init.call(this);
      this.addError(firstError);
    }

     __init() {this.errors = [];}

    /**
     * Adds another error.
     * @param error Another error that occurred.
     */
    addError(error) {
      this.errors.push(error);
    }
  }

  /**
   * Returns true if param `any` is an array.
   * @param {{}} any The variable to type-check.
   * @return {boolean} True if `any` is an array.
   */
  function isArray(any) {
    return Array.isArray(any);
  }

  /**
   * Returns true if param `any` is a number.
   * @param {{}} any The variable to type-check.
   * @return {boolean} True if `any` is a valid number.
   */
  function isNumeric(any) {
    return typeof any === 'number';
  }

  /**
   * Returns true if param `any` is a timestamp.
   * @param {{}} any The variable to type-check.
   * @return {boolean} True if `any` is a valid timestamp.
   */
  function isTimestamp(any) {
    return isNumeric(any);
  }

  /**
   * Returns `true` if the passed webMI data result is an error.
   * @param result The webMI data call result.
   * @return If the provided result is an error.
   */
  function isErrorResult(result) {
    return result.error > 0;
  }

  /**
   * Creates a node.js-style callback from a webMi.data-event.
   * @param e The original event.
   * @param callback The function to call with.
   * @param [options] Options to normalize the callback arguments.
   * @param options.arrayArgument Normalize the callback results if a non-array is passed to this argument.
   */
  function eventCallback(
    e,
    callback,
    options
  ) {
    if (options && options.arrayArgument && !isArray(options.arrayArgument) && e.result) {
      // eslint-disable-next-line no-param-reassign
      e = e.result[0];
    }

    let error = null;

    if (e.error === undefined) {
      // array result object
      for (let i = 0; i < (e.result ).length; i++) {
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
      error = new Error((e ).errorstring);
    }

    callback(error, (e.result || e) );
  }

  /**
   * Get all {@link Recorder}s available on a scope server.
   */


  function getRecorders(callback) {
    return promisify(callback, (c) =>
      webMI.data.call('m1scope_getrecorder', {}, (e) => eventCallback(e, c))
    );
  }

  /**
   * Get {@link Timestamp} of the scope-server environment (device, operating system, runtime).
   */


  function getTime(callback) {
    return promisify(callback, (c) =>
      webMI.data.call('m1gettime', {}, (e) => eventCallback(e, c))
    );
  }

  /**
   * Get all {@link Channel}s associated with a Recorder.
   * With the result of this function it is possible to display the {@link Channel}s a Recorder has.
   * @param recorder The name of an existing {@link Recorder}.
   */


  function getChannels(recorder, callback) {
    return promisify(callback, (c) =>
      webMI.data.call('m1scope_getchannel', { recname: recorder }, (e) =>
        eventCallback(e, c)
      )
    );
  }

  /**
   *  *Command* can change the state of a recorder when used with the {@link runCommand} function. Keep in mind
   *  that state and command must conform with the state machine (see {@link RecorderState} for more information on the state machine),
   *  otherwise no state transition will occur.
   */
  var Command; (function (Command) {
    /**  Initializes a recorder. */
    const InitRecorder = 1; Command[Command["InitRecorder"] = InitRecorder] = "InitRecorder";
    /**  Starts a recorder. */
    const StartRecorder = 2; Command[Command["StartRecorder"] = StartRecorder] = "StartRecorder";
    /**  Stops a recorder. */
    const StopRecorder = 3; Command[Command["StopRecorder"] = StopRecorder] = "StopRecorder";
    /**  Deinitializes a recorder. */
    const DeinitRecorder = 4; Command[Command["DeinitRecorder"] = DeinitRecorder] = "DeinitRecorder";
    /**  Manual start trigger. */
    const StartTrigger = 6; Command[Command["StartTrigger"] = StartTrigger] = "StartTrigger";
    /**  Manual stop trigger. */
    const StopTrigger = 7; Command[Command["StopTrigger"] = StopTrigger] = "StopTrigger";
  })(Command || (Command = {}));

  /**
   * The limit that is used implicitly when not specified explicitly in {@link QueryOptions.limit}.
   * This will limit the number of samples that should be returned by a query when the {@link query} function is called.
   * @type {number}
   */
  const DefaultLimit = 1000;

  /**
   * When the {@link query} function is used the so called *QueryOptions* and its properties specify the query behaviour for a specific {@link QueryResult}.
   */

















































  function query(
    recorder,
    options,
    callback
  ) {
    return promisify(callback, (c2) => {
      if (!options || (!isArray(options.from) && !isTimestamp(options.from))) {
        throw new Error('options.from is required');
      }

      // eslint-disable-next-line no-param-reassign
      options.until = options.until || new Date(8640000000000000).getTime(); // Highest date ever

      if (isArray(options.from) && !isArray(options.until)) {
        const u = [];

        for (let i = 0; i < options.from.length; i++) {
          u.push(options.until);
        }

        // eslint-disable-next-line no-param-reassign
        options.until = u;
      }

      const loadRemaining = !isNumeric(options.limit);

      const q = {
        recname: recorder,
        timestart: options.from,
        timeend: options.until,
        limit: options.limit || DefaultLimit,
      };

      const onProgress =
        options.onProgress ||
        ((progress) => console.log(`Load progress: ${Math.floor(progress * 100)}%.`));

      if (options.channels) {
        q.channel = options.channels;
      }

      // FIXME: Should continue loading if no limit was set and e.remaining (per recorder) is > 0
      let cachedResults;
      let totalSamples;
      let loadedSamples = 0;

      const c = loadRemaining
        ? (err, results) => {
            if (err) {
              c2(err);
            } else {
              if (isArray(results)) {
                throw new Error('lazy loading is not implemented for an array of recorders');
              }
              if (results.remaining > 0) {
                const newSamples = results.samples.length;

                if (cachedResults) {
                  cachedResults.samples = cachedResults.samples.concat(results.samples);
                } else {
                  totalSamples = newSamples + results.remaining;
                  cachedResults = results;
                }

                loadedSamples += newSamples;
                onProgress(loadedSamples / totalSamples);
                // eslint-disable-next-line no-use-before-define
                q.timestart = getLatestTimestampFromQueryResult(results);

                webMI.data.call('m1scope_querytime', q, (e) =>
                  eventCallback(e, c, {
                    arrayArgument: recorder,
                  })
                );
              } else {
                if (cachedResults) {
                  cachedResults.samples = cachedResults.samples.concat(results.samples);
                }

                c2(err, cachedResults || results);
              }
            }
          }
        : c2;

      webMI.data.call('m1scope_querytime', q, (e) =>
        eventCallback(e, c, {
          arrayArgument: recorder,
        })
      );
    });
  }

  /**
   * The interval in milliseconds that is used implicitly when not specified explicitly in {@link SubscribeOptions}
   * when the {@link subscribe} function is used.
   * @type {number}
   */
  const DefaultUpdateInterval = 500;



  /**
   * A so called *Subscription* object is returned by calling the {@link subscribe} function.
   * Later in time this *Subscription* object can be used to cancel an active subscription by calling the {@link cancelSubscription} function.
   */
  class Subscription {
    /** The timeoutHandle. */
    

    /** If the subscription is active. */
     __init2() {this.active = true;}

    /** `true` if the subscription is active. */
    get isActive() {
      return this.active;
    }

    /**
     * Creates a new subscription from an interval handle.
     * @param [timeoutHandle] The interval handle.
     */
    constructor(timeoutHandle) {Subscription.prototype.__init2.call(this);
      this._handle = timeoutHandle;
    }

    /**
     * Registers a new timeout.
     * @param callback The function to call.
     * @param ms The milliseconds to wait.
     */
     setTimeout(callback, ms) {
      this._handle = setTimeout(callback, ms);
    }

    /**
     * Call this method to cancel a subscription.
     */
    cancel() {
      clearTimeout(this._handle);
      this.active = false;
    }
  }

  /**
   * Takes the last/latest timestamp from a Scope.query result.
   * @param result The Scope.query-Result to take the last timestamp of.
   * @return {Timestamp|Timestamp[]} The last timestamp or an array of the last timestamps per recorder.
   */
  function getLatestTimestampFromQueryResult(result) {
    if (isArray(result)) {
      // The minimum last timestamp for all recorders
      const max = [];
      for (let i = 0; i < result.length; i++) {
        max.push(getLatestTimestampFromQueryResult(result[i]) );
      }

      return max;
    }

    const s = result.samples;
    return s.length > 0 ? s[s.length - 1].t : undefined;
  }

  /**
   * As a request always takes the previous request's last timestamp as a first timestamp
   * we have to remove the first sample (for each recorder) to prevent adding points twice.
   * @param result The original results.
   * @return The results without first sample(s).
   */
  function removeFirstSamplesFromQueryResult(result) {
    if (isArray(result)) {
      for (let i = 0; i < result.length; i++) {
        result[i].samples.shift();
      }
      return result;
    }

    result.samples.shift();

    return result;
  }

  /**
   * When the {@link subscribe} function is called to continuously retrieve sampling data from the recorder,
   * the *QueryOptions* parameter must be specified.
   * @from Specifies at which point in time the sampling data should be retrieved. Keep in mind that valid values are the current time of the controller (see {@link getTime}), or a timestamp that is smaller/in the past of {@link getTime}. When it is not specified ```new Date().getTime();``` will be used.
   * @interval When a query returns, the next query will be executed after this interval in milliseconds. If it is not specified {@link DefaultUpdateInterval} will be used.
   */





  /**
   * After calling the subscribe function, the {@link query} function will be called
   * in regular intervals using the query of the SubscribeOptions argument.
   * The corresponding response of the scope server will continuously provide data via the callback function.
   * This can be used to continuously update data in a graph display.
   * To interrupt this polling mechanism use the {@link Subscription} object returned by this function
   * in conjunction with the {@link cancelSubscription} function.
   * @param recorder A single or array of recorder names.
   * @param options The query option contains the query itself and additional subscribe options.
   * @param callback Will be called continuously with the query results on success.
   * @return The newly created Subscription. Can be used to cancel the *subscription*, see also {@link cancelSubscription}.
   */
  function subscribe(
    recorder,
    options,
    callback
  ) {
    const interval = options.interval || DefaultUpdateInterval;

    let latestTimestamp = options.from || new Date().getTime();
    const subscription = new Subscription();
    let initialCall = true;

    let pendingRequest = false;
    let awaitingResponse = false;

    let triggeredIntervalWarning = false;

    /**
     * Called in regular intervals.
     * Calls getData if there is no pending getData-Request.
     */
    function nextTick() {
      if (initialCall || subscription.isActive) {
        if (pendingRequest) {
          if (!triggeredIntervalWarning) {
            console.warn(
              'A request takes longer than the update interval. Consider incrementing it.'
            );
            triggeredIntervalWarning = true;
          }
          awaitingResponse = true;
        } else {
          awaitingResponse = false;
          // eslint-disable-next-line no-use-before-define
          getData();
          subscription.setTimeout(nextTick, interval);
        }
      } else {
        throw new Error('nextTick() called without an active subscription');
      }
    }

    /**
     * Calls Scope.query with dynamic filters.
     */
    function getData() {
      const limits = options;
      limits.from = latestTimestamp;

      pendingRequest = true;
      query(recorder, limits, (err, result) => {
        if (subscription.isActive) {
          // If an error occurred throw it and cancel the subscription to prevent memory leak
          if (err) {
            subscription.cancel();
            callback(err);
            return;
          }

          latestTimestamp = getLatestTimestampFromQueryResult(result) || limits.from;

          if (!initialCall) {
            // eslint-disable-next-line no-param-reassign
            result = removeFirstSamplesFromQueryResult(result);
          }

          callback(err, result);

          initialCall = false;
          pendingRequest = false;

          // If nextTick should already have been called immediately invoke it
          if (awaitingResponse) {
            nextTick();
          }
        }
      });
    }

    if (options.from) {
      nextTick();
    } else {
      webMI.data.call('m1gettime', {}, (e) => {
        if (isErrorResult(e)) {
          throw new Error(e.errorstring);
        }

        latestTimestamp = e.timestamp;
        nextTick();
      });
    }

    return subscription;
  }


  // NOTE: End of the Scope SDK

  const ScopeDatasource = Datasource.register('scope', function (options) {
    this._recorderSubscriptions = {};
    this.updateProxy();

    console.log('Created datasource with options', options, this, this.getHostFromAdvancedOptions());
  });

  /** @private */
  ScopeDatasource.prototype.getHostFromAdvancedOptions = function () {
    if (typeof this._option === 'string') return this._option;
    if (typeof this._option === 'object') return this._option.host;

    return undefined;
  };

  /** @private */
  ScopeDatasource.prototype.stringifyChannelAddress = function (recorder, channel) {
    return `${recorder}:${channel}`;
  };

  /** @private */
  ScopeDatasource.prototype.parseChannelAddress = function (address) {
    const [recorder, ...channelParts] = address.split(':');

    return channelParts.length === 0
      ? { channel: recorder }
      : { recorder, channel: channelParts.join(':') };
  };

  ScopeDatasource.prototype.suggestName = function (address) {
    const parts = this.parseChannelAddress(address).channel.split('/');

    return parts[parts.length - 1];
  };

  ScopeDatasource.prototype.browse = async function (node) {
    if (!node) {
      const recorders = await getRecorders();

      return recorders.map((recorder) => ({ recorder, name: recorder.recname, isLeaf: false }));
    }

    if (node.channel) return [];

    const channels = await getChannels(node.recorder.recname);

    return channels.map((channel) => ({
      address: this.stringifyChannelAddress(node.recorder.recname, channel.name),
      recorder: node.recorder,
      channel,
      name: channel.name,
      isLeaf: true,
    }));
  };

  /** @private */
  ScopeDatasource.prototype.updateProxy = function (
    host = this.getHostFromAdvancedOptions()
  ) {
    console.log('Directing scope proxy to', host || location.hostname);
    use(host || location.hostname);
  };

  // Implement Datasource

  // private recorderChannelsMap: RecorderChannelsMap;
  // private recorder: string;

  /** @private */
  ScopeDatasource.prototype.updateRecorderChannelsMap = function (nodes) {
    const map = {};

    Object.keys(nodes).forEach((series) => {
      const address = nodes[series];

      const { recorder = this.recorder, channel } = this.parseChannelAddress(address);

      (map[recorder] || (map[recorder] = {}))[channel] = { channel, series };
    });

    return (this.recorderChannelsMap = map);
  };

  /** @private */
  ScopeDatasource.prototype.eachRecorder = function eachRecorder(
    map,
    callback
  ) {
    const recorders = Object.keys(map);

    const all = recorders.map((recorder) => callback(recorder, map[recorder]));

    return Promise.all(all);
  };

  /** @private */
  ScopeDatasource.prototype._handleSubscriptionResults = function (
    results,
    options
  ) {
    const channelsMap =
      'channels' in options ? options.channels : this.recorderChannelsMap[options.recorder];

    if (!channelsMap) {
      // Ignore old subscription results
      return {};
    }

    const channelSeries = results.channels
      .filter((channel) => channelsMap[channel]) // Ignore old subscription results
      .map((channel) => channelsMap[channel].series);

    const samplesBySeries = channelSeries.reduce(
      (r, series) => Object.assign(r, { [series]: [] }),
      {}
    );

    results.samples.forEach(({ t, v }) => {
      v.forEach((value, seriesIndex) => {
        samplesBySeries[channelSeries[seriesIndex]].push([t, value]);
      });
    });

    return samplesBySeries;
  };

  ScopeDatasource.prototype._loadPoints = function (options, callback) {
    this.updateProxy();

    const map = this.recorderChannelsMap || this.updateRecorderChannelsMap(options.nodes);

    const eachResult = this.eachRecorder(map, (recorder, channels) =>
      query(recorder, {
        from: options.from,
        until: options.until,
        channels: Object.keys(channels),
      }).then((results) => this._handleSubscriptionResults(results, { channels }))
    );

    eachResult
      .then((results) =>
        callback(
          null,
          // Combine results
          results.reduce((soFar, result) => ({ ...soFar, ...result }), {})
        )
      )
      .catch((error) => callback(error));
  };

  ScopeDatasource.prototype._getTime = function (callback) {
    webMI.data.call(
      'm1gettime',
      {},
      function (e) {
        callback(e.error ? new Error(e.errorstring) : null, e.timestamp);
      }
    );
  };

  ScopeDatasource.prototype._updateNodes = function ({ options, ...others }) {
    this.updateRecorderChannelsMap(options.nodes);
    this.updateProxy();
  };

  // private _recorderSubscriptions: { [recorder: string]: Scope.Subscription } = {};

  ScopeDatasource.prototype._subscribe = function ({ options }, callback) {
    this.eachRecorder(this.recorderChannelsMap, (recorder, channelsMap) => {
      const channels = Object.keys(channelsMap);

      this._recorderSubscriptions[recorder] = subscribe(
        recorder,
        {
          from: options.from,
          channels,
        },
        (err, res) => {
          const processed = this._handleSubscriptionResults(res, { channels: channelsMap });

          return callback(err, processed);
        }
      );
    });
  };

  ScopeDatasource.prototype._unsubscribe = function () {
    Object.keys(this._recorderSubscriptions).forEach((recorder) => {
      this._recorderSubscriptions[recorder].cancel();
      delete this._recorderSubscriptions[recorder];
    });
  };

  ScopeDatasource.prototype._getServerTimeOffset = function () {
    this._serverTimeOffset = 0;

    this._serverTimeOffsetRequest = getTime().then(({ timestamp }) => {
      return (this._serverTimeOffset = timestamp - Date.now());
    });
  };

  ScopeDatasource.prototype.getServerTimeOffset = function (callback) {
    if (this._serverTimeOffset === undefined) this._getServerTimeOffset();

    if (callback) {
      return this._serverTimeOffsetRequest.then(callback);
    }

    return this._serverTimeOffset;
  };

}());
