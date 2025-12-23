/**
 * Helper for filter
 */

/**
 * Create a filter
 * @param dataView
 * @param grid
 * @param filterOptions
 * @param callbackOpenDialogs
 * @constructor
 * @private
 */
function SlickFiltering(dataView, grid, filterOptions, callbackOpenDialogs){

    /**
     * Timeouts
     * @private
     */
    var controllerTimeoutList = [];

    var externalFilterParams = {};
    var internalFilterParams = {};
    var suspendInternalFilterParams = false;
    var filterBarValues = {};
    var tabHandler = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Tab Handler");
    var filterExtensionObj = {};

    /**
     * Filter initialization
     */
    this.init  = function () {
        _updateFilterParameters();
        dataView.setFilter(_filter);

        if(filterOptions.showFilterBar){
            var columns = grid.getColumns();
            for (var i = 0; i < columns.length; i++) {
                var filterbarNode = grid.getHeaderRowColumn(i);
                _appendFilterBarInput(columns[i], filterbarNode);
            }

            grid.onHeaderRowCellRendered.subscribe(function (e, args) {
                _appendFilterBarInput(args.column, args.node);
            });

            grid.onBeforeHeaderRowCellDestroy.subscribe(function (e, args) {
                var inputEl = args.node.querySelector("input");

                if(inputEl !== null) {
                    inputEl.removeEventListener("keyup", _inputKeyUpListener);
                    inputEl.removeEventListener("focus", _inputFocusListener);
                    inputEl.removeEventListener("blur", _inputBlurListener);
                }
            });
        }
    };

    /**
     * connect external filter
     * @param criteria
     * @param matchMode
     * @param id
     */
    this.setFilter = function (criteria, matchMode, id) {
        if (id === "internal") {
            console.warn("ID " + id + "can not be used!");
            return;
        } else if (id === "" || id === undefined) {
            console.warn("Specify a valid filter ID!");
            return;
        }

        if (externalFilterParams[id] === undefined) {
            externalFilterParams[id] = {};
        }
        externalFilterParams[id].criteria = criteria;
        externalFilterParams[id].matchMode = matchMode;

        _updateFilterParameters();
    };


    /**
     * connet internal filter with filter bar updates for known types
     * @param field
     * @param searchString
     */
    this.setFilterBar = function (field, searchString) {
        var searchField = webMI.rootWindow.jQuery('[field="' + field + '"]');
        var searchClass = searchField.attr('class');

        if (searchClass == "filterbarInput") {
            searchField.val(searchString);
        } else if (filterExtensionObj[field].type == "checkbox") {
            searchField.removeClass(searchClass);
            if (filterExtensionObj[field].search == searchString) {
                searchField.addClass(filterExtensionObj[field].active);
            } else {
                searchField.addClass(filterExtensionObj[field].inactive);
            }
        } else {
            console.warn("Visual update of the filter bar is currently not supported for type " + filterExtensionObj[field].type + "!");
            console.warn("Regardless, the filter has been applied.");
        }


        if (internalFilterParams.criteria === undefined) {
            internalFilterParams.criteria = {};
        }
        internalFilterParams.criteria[field] = searchString;
        internalFilterParams.matchMode = "all";

        _updateFilterParameters();
    }


    /**
     * clear external filter
     * @param id
     */
    this.clearFilterByID = function (id) {
        delete externalFilterParams[id];
        _updateFilterParameters();
    };

    /**
     * clear all external filter
     */
    this.clearFilters = function () {
        externalFilterParams = {};
        _updateFilterParameters();
    };


    /**
     * toogle internal slick grid filterbar
     */
    this.toggleFilterBarVisibility = function() {
        //only toggle if filterbar was enabled initially
        if (filterOptions.showFilterBar) {
            var visibility = !grid.getOptions().showHeaderRow;
            grid.setHeaderRowVisibility(visibility);

            if (!visibility) {
                suspendInternalFilterParams = true;
            } else {
                suspendInternalFilterParams = false;
            }
        }
        _updateFilterParameters();
    };


    /**
     * return external filter values
     * @returns {{}}
     */
    this.getFilters = function () {
        return externalFilterParams;
    };

    /**
     * resets the internal filter values
     */
	this.resetInternalFilterParams = function () {
		internalFilterParams = {};
	}

    /**
     * destruction
     */
    this.destroy = function () {
        /** clean all timeouts **/
        for(var to in controllerTimeoutList){
            if(controllerTimeoutList[to] != null) {
                clearTimeout(controllerTimeoutList[to]);
            }
        }
        tabHandler = null;
        externalFilterParams = null;
        internalFilterParams = null;
        suspendInternalFilterParams = false;
        filterBarValues = {};
        inputTimeout = null;
        filterExtensionObj = {};
    };


    /**
     * deactivate internal filterbar tabhandler
     * @param e
     * @private
     */
    function _inputFocusListener (e) {
        tabHandler.setAcceptKeys(false);
    }

    /**
     * activate internal filterbar tabhandler
     * @param e
     * @private
     */
    function _inputBlurListener (e) {
        tabHandler.setAcceptKeys(true);
    }

    /**
     * internal filterbar click listener
     * @param e
     * @private
     */
    function _clickListener(e){
        var openDialogs = callbackOpenDialogs();
        if(openDialogs){
            e.target.blur();
        } else {
            var inputEl = e.target;
            var field = inputEl.getAttribute("field");

            var filterExtension = false;
            if(typeof(filterExtensionObj[field]) != "undefined")
                filterExtension = true;

            if(filterExtension) {
				var currentClass = webMI.rootWindow.jQuery(inputEl).attr('class');
				webMI.rootWindow.jQuery(inputEl).removeClass(currentClass);

                var assignClass = filterExtensionObj[field]["inactive"];
                if(currentClass === filterExtensionObj[field]["inactive"])
                    assignClass = filterExtensionObj[field]["active"];
				webMI.rootWindow.jQuery(inputEl).addClass(assignClass);

                var searchString = assignClass === filterExtensionObj[field]["active"] ? filterExtensionObj[field]["search"] : "";

                filterBarValues[field] = searchString;
                if (searchString !== "" && searchString.length >= filterOptions.filterLength) {
                    if (internalFilterParams.criteria === undefined) {
                        internalFilterParams.criteria = {};
                    }
                    internalFilterParams.criteria[field] = searchString;
                    internalFilterParams.matchMode = "all";
                } else {
                    if (typeof internalFilterParams.criteria !== "undefined")
                        delete internalFilterParams.criteria[field];
                }
                _updateFilterParameters();
            }
        }
    }


    /**
     * internal filterbar key listener
     * @param e
     * @private
     */
    var inputTimeout = null;
    var inputTimeout = null;
    function _inputKeyUpListener (e) {
        if(inputTimeout){
            clearTimeout(inputTimeout);
        }
        if(e.keyCode==13){
            _filterValue(e);
        } else if(filterOptions.filterDelay > 0) {
            inputTimeout = setTimeout(
                function() {
                    _filterValue(e);
                }, filterOptions.filterDelay);
            controllerTimeoutList.push(inputTimeout);
        }
    }


    /**
     * internal filter function
     * @param e
     * @private
     */
    function _filterValue(e){
        var inputEl = e.target;
        var searchString = inputEl.value;
        var field = inputEl.getAttribute("field");
        filterBarValues[field] = searchString;
        if (searchString !== "" && searchString.length >= filterOptions.filterLength) {
            if (internalFilterParams.criteria === undefined) {
                internalFilterParams.criteria = {};
            }
            internalFilterParams.criteria[field] = searchString;
            internalFilterParams.matchMode = "all";
        } else {
            if (typeof internalFilterParams.criteria !== "undefined")
                delete internalFilterParams.criteria[field];
        }

        _updateFilterParameters();

    }

    /**
     * add inputfields to filterbar
     * @param column
     * @param parentNode
     * @private
     */
    function _appendFilterBarInput (column, parentNode) {
        if(typeof column.filter !== "undefined"){
            var inputDIV = document.createElement("div");
            webMI.rootWindow.jQuery(inputDIV).addClass("filterbarInputContainer");

            var filterExtension = false;
            if(typeof column.filterExtension != "undefined") {
                filterExtensionObj[column.field] = column.filterExtension;
                filterExtension = true;
            }

            if(column.field == "atvise_marker"){
                filterExtensionObj[column.field] = {
                    "type": "checkbox",
                    "active": "fas fa-check-square",
                    "inactive": "far fa-square",
                    "search": "true"
                };
                filterExtension = true;
            }

            var inputEl;
            if(filterExtension){
				inputDIV.style.width = "90%";
				inputDIV.style.textAlign = "center";
				inputEl = document.createElement("i");
                inputEl.setAttribute("class", filterExtensionObj[column.field]["inactive"]);
            } else {
				inputEl = document.createElement("input");
                inputEl.setAttribute("type", "text");
				webMI.rootWindow.jQuery(inputEl).addClass("filterbarInput");
            }
            inputEl.setAttribute("field", column.field);
            inputEl.value = filterBarValues[column.field] !== undefined ? filterBarValues[column.field] : "";

            if (column.filter === false) {
                inputEl.disabled = true;
            }

            inputDIV.appendChild(inputEl);
            parentNode.appendChild(inputDIV);

            inputEl.addEventListener("keyup", _inputKeyUpListener);
            inputEl.addEventListener("focus", _inputFocusListener);
            inputEl.addEventListener("blur", _inputBlurListener);
            inputEl.addEventListener("click", _clickListener);
			inputEl.addEventListener("change", _inputKeyUpListener);

        }
    }

    /**
     * arguments for filter method
     * @private
     */
    function _updateFilterParameters() {
        dataView.setFilterArgs({
            filterSets: window.jQuery.extend({}, externalFilterParams, suspendInternalFilterParams ? {internal:{}} : {internal: internalFilterParams}),
            filterRegExp: filterOptions.filterRegExp,
            filterCaseSensitive: filterOptions.filterCaseSensitive,
			filterStar: filterOptions.filterStar,
			filterConversion: filterOptions.filterConversion
        });
        dataView.refresh();
        grid.invalidate();
        grid.render();
    }

    /**
     * filter method
     * @param item
     * @param config
     * @returns {*}
     * @private
     */
    function _filter (item, config) {
        var searchItem = item;

        if (typeof item._parent != "undefined") {
            searchItem = item._parent; // JSON.parse(JSON.stringify(item._parent));
        }

        var filterSets = config.filterSets;

        for (var filterID in filterSets) {

            var filterConfig = filterSets[filterID];
            var filterParams = filterConfig.criteria;
            var matchMode = filterConfig.matchMode;

            var result;
            if (window.jQuery.isEmptyObject(filterParams)) {
                result = true;
            } else {
                result = matchMode === "all";
            }

            fieldValidation:
                for (var fieldName in filterParams) {
                    var searchString = filterParams[fieldName];

                    if (searchItem[fieldName] !== undefined) {
                        var cellValue = typeof searchItem[fieldName] !== "string" ? searchItem[fieldName].toString() : searchItem[fieldName];

						if(config.filterConversion != false && typeof config.filterConversion[fieldName] != "undefined"){
							if (config.filterConversion[fieldName][0]=="datetime") {
								if (typeof cellValue == "string" && cellValue.indexOf("-") == -1)		//ignore already formatted values
									var date = new Date(parseInt(cellValue, 10));
								cellValue = webMI.sprintf("%d-%02d-%02d %02d:%02d:%02d.%03d", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
							}
						}

                        if (config.filterRegExp) {
                            var regExp = new RegExp(searchString, !config.filterCaseSensitive ? "i" : "");
                            if (regExp.test(cellValue)) {
                                result = true;
                                if (matchMode === "single") {
                                    break fieldValidation;
                                }
                            } else {
                                result = false;
                                break fieldValidation;
                            }
                        } else {
                            var parts = "";
                            var matchParts = true;
                            var starSearch = config.filterStar ? true : false;
                            if (starSearch) {
                                var realStarSearchSplitPlaceHolder = "[<-@@->]"; // tiebomber attack the stars
                                var searchString = searchString.replace("\\\*", realStarSearchSplitPlaceHolder);
                                if (config.filterCaseSensitive) {
                                    parts = searchString.split("*");
                                } else {
                                    parts = searchString.toUpperCase().split("*");
                                }
                            } else {
                                parts = [searchString];
                            }
                            var last = -1;
                            for(var p in parts){
                                if(starSearch) {
                                    parts[p] = parts[p].replace(realStarSearchSplitPlaceHolder, '*');
                                }
                                if(parts[p]!="") {
                                    if(config.filterCaseSensitive && cellValue.indexOf(parts[p], last) > last) {
                                        last = cellValue.indexOf(parts[p], last) + parts[p].length -1;
                                    } else if(!config.filterCaseSensitive && cellValue.toUpperCase().indexOf(parts[p].toUpperCase(), last) > last) {
                                        last = cellValue.toUpperCase().indexOf(parts[p].toUpperCase(), last) + parts[p].length -1;
                                    } else {
                                        matchParts = false;
                                        break;
                                    }
                                }
                            }
                            if (config.filterCaseSensitive && matchParts) {
                                result = true;
                                if (matchMode === "single") {
                                    break fieldValidation;
                                }
                            } else if(!config.filterCaseSensitive && matchParts) {
                                result = true;
                                if (matchMode === "single") {
                                    break fieldValidation;
                                }
                            } else {
                                result = false;
                                if (matchMode === "all") {
                                    break fieldValidation;
                                }
                            }
                        }
                    } else {
                        config.lastHide = searchItem;
                        result = false;
                    }
                }
            if (!result) {
                return result;
            }
        }
        return true;
    }
}