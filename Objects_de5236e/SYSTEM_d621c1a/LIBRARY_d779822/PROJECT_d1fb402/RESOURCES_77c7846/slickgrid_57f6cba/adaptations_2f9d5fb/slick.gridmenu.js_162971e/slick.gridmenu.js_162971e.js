/***
 * A control to add a Grid Menu (hambuger menu on top-right of the grid)
 *
 * USAGE:
 *
 * Add the slick.gridmenu.(js|css) files and register it with the grid.
 *
 * To specify a menu in a column header, extend the column definition like so:
 * var gridMenuControl = new Slick.Controls.GridMenu(columns, grid, options);
 *
 * Available grid options, by defining a gridMenu object:
 *
 *  var options = {
 *    enableCellNavigation: true,
 *    gridMenu: {
 *      customTitle: "Custom Menus",                // default to empty string
 *      columnTitle: "Columns",                     // default to empty string
 *      iconImage: "../images/drag-handle.png",     // this is the Grid Menu icon (hamburger icon)
 *      iconCssClass: "fa fa-bars",                 // you can provide iconImage OR iconCssClass
 *      leaveOpen: false,                           // do we want to leave the Grid Menu open after a command execution? (false by default)
 *      menuWidth: 18,                              // width that will be use to resize the column header container (18 by default)
 *      resizeOnShowHeaderRow: true,                // true by default
 *
 *      // the last 2 checkboxes titles
 *      hideForceFitButton: false,                  // show/hide checkbox near the end "Force Fit Columns"
 *      hideSyncResizeButton: false,                // show/hide checkbox near the end "Synchronous Resize"
 *      forceFitTitle: "Force fit columns",         // default to "Force fit columns"
 *      syncResizeTitle: "Synchronous resize",      // default to "Synchronous resize"
 *
 *      customItems: [
 *        {
 *          // custom menu item options
 *        },
 *        {
 *          // custom menu item options
 *        }
 *      ]
 *    }
 *  };
 *
 *
 * Available custom menu item options:
 *    title:        Menu item text.
 *    disabled:     Whether the item is disabled.
 *    tooltip:      Item tooltip.
 *    command:      A command identifier to be passed to the onCommand event handlers.
 *    iconCssClass: A CSS class to be added to the menu item icon.
 *    iconImage:    A url to the icon image.
 *
 *
 * The plugin exposes the following events:
 *    onBeforeMenuShow:   Fired before the menu is shown.  You can customize the menu or dismiss it by returning false.
 *      * ONLY works with a jQuery event (as per slick.core code), so we cannot notify when it's a button event (when grid menu is attached to an external button, not the hamburger menu)
 *        Event args:
 *            grid:     Reference to the grid.
 *            column:   Column definition.
 *            menu:     Menu options.  Note that you can change the menu items here.
 *
 *    onMenuClose:      Fired when the menu is closing.
 *        Event args:
 *            grid:     Reference to the grid.
 *            column:   Column definition.
 *            menu:     Menu options.  Note that you can change the menu items here.
 *
 *    onCommand:    Fired on menu item click for buttons with 'command' specified.
 *        Event args:
 *            grid:     Reference to the grid.
 *            column:   Column definition.
 *            command:  Button command identified.
 *            button:   Button options.  Note that you can change the button options in your
 *                      event handler, and the column header will be automatically updated to
 *                      reflect them.  This is useful if you want to implement something like a
 *                      toggle button.
 *
 *
 * @param options {Object} Options:
 *    buttonCssClass:   an extra CSS class to add to the menu button
 *    buttonImage:      a url to the menu button image (default '../images/down.gif')
 * @class Slick.Controls.GridMenu
 * @constructor
 */

'use strict';

(function ($) {
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Controls": {
				"GridMenu": SlickGridMenu
			}
		}
	});

	function SlickGridMenu(columns, grid, options) {
		var _grid = grid;
		var _gridUid = (grid && grid.getUID) ? grid.getUID() : '';
		var _isMenuOpen = false;
		var _menuIsClosing = false;
		var _options = options;
		var _self = this;
		var $list;
		var $button;
		var $menu;
		var $container;
		var columnCheckboxes;
		var _defaults = {
			hideForceFitButton: false,
			hideSyncResizeButton: false,
			fadeSpeed: 250,
			forceFitTitle: "Force fit columns",
			menuWidth: 18,
			resizeOnShowHeaderRow: false,
			syncResizeTitle: "Synchronous resize"
		};
		var selectionTimeout;

		function init(grid) {
			var gridMenuWidth = (_options.gridMenu && _options.gridMenu.menuWidth) || _defaults.menuWidth;
			var $header = $('.' + _gridUid + ' .slick-header');

			// subscribe to the grid, when it's destroyed, we should also destroy the Grid Menu
			grid.onBeforeDestroy.subscribe(destroy);

			// if header row is enabled, we need to resize it's width also
			var enableResizeHeaderRow = (_options.gridMenu && _options.gridMenu.resizeOnShowHeaderRow != undefined) ? _options.gridMenu.resizeOnShowHeaderRow : _defaults.resizeOnShowHeaderRow;
			if (enableResizeHeaderRow && _options.showHeaderRow) {
				var $headerrow = $('.slick-headerrow');
				$headerrow.attr('style', 'width: calc(100% - ' + gridMenuWidth + 'px)');
			}

			$button = $('<div id="' + _gridUid + '_button" class="slick-header-columns ui-sortable slick-gridmenu-button-custom"></div>');
			if (_options.gridMenu && _options.gridMenu.iconCssClass) {
				var $btnImage;
				if (_options.gridMenu.iconSVG) {
					// console.log(_options.gridMenu.iconSVG);
					$btnImage = $(_options.gridMenu.iconSVG);
				} else {
					$button.addClass(_options.gridMenu.iconCssClass);
					$btnImage = $('<div style="width:18px; text-align:center;">M</div>');
				}
				$btnImage.appendTo($button);
			} else {
				console.log("Tables: Menu Imagebutton not supported!");
			}
			$button.appendTo($header);

			$menu = $('<div id="' + _gridUid + '_menu" class="slick-gridmenu" style="display: none" />').appendTo($('.' + _gridUid));
			$container = $('<div id="' + _gridUid + '_container" class="slick-gridmenu-container" />').appendTo($menu);

			/*** EXPORT ***/
			if (_options.gridMenu && _options.gridMenu.exportItems && _options.gridMenu.exportTitle) {
				var $exportMenu = $('<div id="' + _gridUid + '_export" class="slick-gridmenu-custom" />');
				$exportMenu.appendTo($container);
				var $title = $('<div class="title"/>').append(_options.gridMenu.exportTitle);
				if (_options.gridMenu.exportItems.length < 1) {
					$title.addClass("title-hidden");
				}
				$title.appendTo($exportMenu);
				populateCustomMenus("export", _options, $exportMenu, options.gridMenu.exportItems);
			}

			/*** COMMANDS ***/
			if (_options.gridMenu && _options.gridMenu.commandItems && _options.gridMenu.commandTitle) {
				var $commandMenu = $('<div id="' + _gridUid + '_command" class="slick-gridmenu-custom" />');
				$commandMenu.appendTo($container);
				var $title = $('<div class="title"/>').append(_options.gridMenu.commandTitle);
				if (_options.gridMenu.commandItems.length < 1) {
					$title.addClass("title-hidden");
				}
				$title.appendTo($commandMenu);
				populateCustomMenus("command", _options, $commandMenu, options.gridMenu.commandItems);
			}

			/*** CUSTOM ***/
			if (_options.gridMenu && _options.gridMenu.customItems && _options.gridMenu.customTitle) {
				var $customMenu = $('<div id="' + _gridUid + '_custom" class="slick-gridmenu-custom" />');
				$customMenu.appendTo($container);
				var $title = $('<div class="title"/>').append(_options.gridMenu.customTitle);
				if (_options.gridMenu.customItems.length < 1) {
					$title.addClass("title-hidden");
				}
				$title.appendTo($customMenu);
				populateCustomMenus("custom", _options, $customMenu, options.gridMenu.customItems);
			}


			if (_options.gridMenu && _options.gridMenu.showMenuPicker) {
				populateColumnPicker();
			}

			// Hide the menu on outside click.
			$(document.body).on("mousedown." + _gridUid, handleBodyMouseDown);

			// add on click handler for the Grid Menu itself
			$button.on("click." + _gridUid, showGridMenu);
		}

		function destroy() {
			/* commons */
			if (selectionTimeout) clearTimeout(selectionTimeout);
			$(document.body).off("mousedown." + _gridUid, handleBodyMouseDown);
			// $("div.slick-gridmenu").hide(_options.fadeSpeed);

			/* unsubscribe events */
			_self.onBeforeMenuShow.unsubscribe();
			_self.onMenuClose.unsubscribe();
			_self.onCommand.unsubscribe();
			_self.onColumnsChanged.unsubscribe();
			_grid.onColumnsReordered.unsubscribe(updateColumnOrder);
			_grid.onBeforeDestroy.unsubscribe();

			/* remove event fkt */
			delete _self.onBeforeMenuShow;
			delete _self.onMenuClose;
			delete _self.onCommand;
			delete _self.onColumnsChanged;

			/* unbind events */
			$button.unbind();
			$menu.unbind();
			$list.unbind();
			$container.unbind();

			/* remove components */
			$button.remove();
			$menu.remove();
			$list.remove();
			$container.remove();
		}

		function populateCustomMenus(id, options, $customMenu, itemsList) {
			// Construct the custom menu items.
			if (!options.gridMenu || !itemsList) {
				return;
			}

			for (var i = 0, ln = itemsList.length; i < ln; i++) {
				var item = itemsList[i];

				if (!item.title && !item.iconImage)
					continue;

				var $li = $('<div id="' + _gridUid + '_' + id + '_' + i + '" class="slick-gridmenu-item"></div>')
					.data("command", item.command || '')
					.data("item", item);

				/** add event if no option or <hr> **/
				if (!item.option && item.title != "<hr>")
					$li.on("click", handleMenuItemClick);

				$li.appendTo($customMenu);

				if (item.disabled) {
					$li.addClass("slick-gridmenu-item-disabled");
				}

				if (item.hidden) {
					$li.addClass("slick-gridmenu-item-hidden");
				}

				if (item.tooltip) {
					$li.attr("title", item.tooltip);
				}

				if (item.iconCssClass || item.iconImage)
					var $icon = $("<div class='slick-gridmenu-icon'></div>")
						.appendTo($li);

				if (item.iconCssClass) {
					$icon.addClass(item.iconCssClass);
				}

				if (item.iconImage) {
					$icon.css("background-image", "url(" + item.iconImage + ")");
				}

				if (item.group) {
					$li.attr("group", item.group);
				}

				if (item.title == "<hr>") {
					/** horizontal line **/
					var $content = $("<span class='hr' style='border-bottom: solid 1px #d6d6d6; height:1px; width: 80%' />")
						.appendTo($li);

				} else if (item.option) {
					/** option **/
					var $content = $("<span class='slick-gridmenu-content'></span>");

					var $label = $('<span />');
					$label.text(item.title);

					item.UI_checkbox_ID = _gridUid + '_' + id + '_' + i + '_' + item.command;

					var $input = $("<input type='checkbox' style='margin:0px; margin-left: 5px; vertical-align: bottom;' />").data("option-id", 0);
					$input.attr("id", item.UI_checkbox_ID);
					$input.attr("scaleEvent", "false");
					$input.data("command", item.command || '');
					$input.data("item", item);

					if(item.checked)
						$input.attr("checked", "checked");

					$input.on("click", handleMenuItemClick);

					$input.appendTo($label);
					$label.appendTo($content);
					$content.appendTo($li);
				} else {
					/** regular item **/
					var $content = $("<span class='slick-gridmenu-content'></span>")
						.text(item.title)
						.appendTo($li);
				}
			}
		}

		/** Build the column picker, the code comes almost untouched from the file "slick.columnpicker.js" */
		function populateColumnPicker() {
			_grid.onColumnsReordered.subscribe(updateColumnOrder);
			_options = $.extend({}, _defaults, _options);

			// user could pass a title on top of the columns list
			if (_options.gridMenu && _options.gridMenu.columnTitle) {
				var $title = $('<div class="title"/>').append(_options.gridMenu.columnTitle);
				$title.appendTo($container);
			}

			$container.on("click", updateColumn);
			$list = $('<span class="slick-gridmenu-list" />');
		}

		function showGridMenu(e) {
			e.preventDefault();

			if (_menuIsClosing == true) {
				_menuIsClosing = false;
				return;
			}

			if (_options.gridMenu && _options.gridMenu.showMenuPicker) {
				$list.empty();
				updateColumnOrder();
				columnCheckboxes = [];
			}

			// notify of the onBeforeMenuShow only works when it's a jQuery event (as per slick.core code)
			// this mean that we cannot notify when the grid menu is attach to a button event
			if (typeof e.isPropagationStopped === "function") {
				if (_self.onBeforeMenuShow.notify({
					"grid": _grid,
					"menu": $menu
				}, e, _self) == false) {
					return;
				}
			}

			if (_options.gridMenu && _options.gridMenu.showMenuPicker) {
				var $li, $input;
				for (var i = 0; i < columns.length; i++) {
					// exclude some columns
					var liTag = '<li />';

					if (columns[i].name == "")
						liTag = '<li style="display:none" />';
					else if ((columns[i].id).indexOf("_detail_selector") > -1)
						liTag = '<li style="display:none" />';
					else if ((columns[i].id).indexOf("atvise_marker") > -1)
						liTag = '<li style="display:none" />';
					else if ((columns[i].name).indexOf("multiactionButton") > -1)
						liTag = '<li style="display:none" />';

					$li = $(liTag).appendTo($list);
					$input = $("<input type='checkbox' />").data("column-id", columns[i].id);
					$input.attr("scaleEvent", "false");
					columnCheckboxes.push($input);

					if (_grid.getColumnIndex(columns[i].id) != null) {
						$input.attr("checked", "checked");
					}

					$('<label id="' + _gridUid + '_column_' + i + '" />')
						.html(columns[i].name)
						.prepend($input)
						.appendTo($li);
				}

			}
			if (_options.gridMenu && (!_options.gridMenu.hideForceFitButton || !_options.gridMenu.hideSyncResizeButton)) {
				$("<hr/>").appendTo($list);
			}

			if (!(_options.gridMenu && _options.gridMenu.hideForceFitButton)) {
				var forceFitTitle = (_options.gridMenu && _options.gridMenu.forceFitTitle) || _defaults.forceFitTitle;
				$li = $("<li />").appendTo($list);
				$input = $("<input type='checkbox' />").data("option", "autoresize");
				$("<label />")
					.text(forceFitTitle)
					.prepend($input)
					.appendTo($li);
				if (_grid.getOptions().forceFitColumns) {
					$input.attr("checked", "checked");
				}
			}

			if (!(_options.gridMenu && _options.gridMenu.hideSyncResizeButton)) {
				var syncResizeTitle = (_options.gridMenu && _options.gridMenu.syncResizeTitle) || _defaults.syncResizeTitle;
				$li = $("<li />").appendTo($list);
				$input = $("<input type='checkbox' />").data("option", "syncresize");
				$("<label />")
					.text(syncResizeTitle)
					.prepend($input)
					.appendTo($li);
				if (_grid.getOptions().syncColumnCellResize) {
					$input.attr("checked", "checked");
				}
			}

			if (!webMI.getClientInfo().isDesktop) {
				var menuContainer = $('.' + _gridUid)[0];

				var screenDimension = {
					w: menuContainer.offsetWidth,
					h: menuContainer.offsetHeight
				};

				/* height max 90% of max available */
				var setHeight = _options.gridMenu.height;
				if (setHeight > screenDimension.h * 0.9)
					setHeight = screenDimension.h * 0.9;

				var screenOffsets = {
					w: (screenDimension.w - parseInt(_options.gridMenu.width, 10)) / 2,
					h: (screenDimension.h - parseInt(setHeight, 10)) / 2,
				}

				$menu
					.css("width", _options.gridMenu.width)
					.css("height", setHeight)
					.css("top", screenOffsets.h + "px")
					// .css("left", screenOffsets.w + "px") // reserved for centered
					.css("right", 25 + "px")
					.fadeIn(_options.fadeSpeed);
			} else {
				$menu
					.css("top", 16)		// .css("top", e.pageY + 10)
					.css("right", 17)	// "left", e.pageX - $menu.width())
					.css("height", _options.gridMenu.height)
					.css("width", _options.gridMenu.width)
					.fadeIn(_options.fadeSpeed);
			}

			$container.css("max-height", _options.gridMenu.height);

			if (_options.gridMenu && _options.gridMenu.showMenuPicker) {
				$list.appendTo($container);
			}
			_isMenuOpen = true;
		}

		function handleBodyMouseDown(e) {
			if (($menu && $menu[0] != e.target && !$.contains($menu[0], e.target) && _isMenuOpen) || e.target.className == "close") {
				if (e.target == $button[0] || $.contains($button[0], e.target)) {
					_menuIsClosing = true;
				}
				hideMenu(e);
			}
		}

		function handleMenuItemClick(e) {
			var command = $(this).data("command");
			var item = $(this).data("item");

			if (item.disabled) {
				return;
			}

			// does the user want to leave open the Grid Menu after executing a command?
			var leaveOpen = ((_options.gridMenu && _options.gridMenu.leaveOpen) || item.option) ? true : false;
			if (!leaveOpen) {
				hideMenu(e);
			}

			if (command != null && command != '') {
				_self.onCommand.notify({
					"grid": _grid,
					"command": command,
					"item": item
				}, e, _self);
			}

			// Stop propagation so that it doesn't register as a header click event.
			e.preventDefault();
			e.stopPropagation();
		}

		function hideMenu(e) {
			if ($menu) {
				$menu.hide(_options.fadeSpeed);
				_isMenuOpen = false;

				if (_self.onMenuClose.notify({
					"grid": _grid,
					"menu": $menu
				}, e, _self) == false) {
					return;
				}
			}
		}

		function updateColumnOrder() {
			// Because columns can be reordered, we have to update the `columns`
			// to reflect the new order, however we can't just take `grid.getColumns()`,
			// as it does not include columns currently hidden by the picker.
			// We create a new `columns` structure by leaving currently-hidden
			// columns in their original ordinal position and interleaving the results
			// of the current column sort.
			var current = _grid.getColumns().slice(0);
			var ordered = new Array(columns.length);
			for (var i = 0; i < ordered.length; i++) {
				if (_grid.getColumnIndex(columns[i].id) === undefined) {
					// If the column doesn't return a value from getColumnIndex,
					// it is hidden. Leave it in this position.
					ordered[i] = columns[i];
				} else {
					// Otherwise, grab the next visible column.
					ordered[i] = current.shift();
				}
			}
			columns = ordered;
		}

		function updateColumn(e) {
			if ($(e.target).data("option") == "autoresize") {
				if (e.target.checked) {
					_grid.setOptions({forceFitColumns: true});
					_grid.autosizeColumns();
				} else {
					_grid.setOptions({forceFitColumns: false});
				}
				return;
			}

			if ($(e.target).data("option") == "syncresize") {
				if (e.target.checked) {
					_grid.setOptions({syncColumnCellResize: true});
				} else {
					_grid.setOptions({syncColumnCellResize: false});
				}
				return;
			}

			if ($(e.target).is(":checkbox")) {
				var visibleColumns = [];
				$.each(columnCheckboxes, function (i, e) {
					if ($(this).is(":checked")) {
						visibleColumns.push(columns[i]);
					}
				});

				if (!visibleColumns.length) {
					$(e.target).attr("checked", "checked");
					return;
				}

				_grid.setColumns(visibleColumns);
				_self.onColumnsChanged.notify({
					"grid": _grid,
					"columns": visibleColumns
				}, e, _self);

				if (selectionTimeout) {
					clearTimeout(selectionTimeout);
				}
				selectionTimeout = setTimeout(function () {
					var selected = _grid.getSelectedRows();
					_grid.setSelectedRows(selected);
				}, 40);

			}
		}

		init(_grid);

		function getAllColumns() {
			return columns;
		}

		function showMenuEntriesByGroup(group) {
			var menuEntries = getMenuEntriesByGroup(group);
			for (var i = 0; i < menuEntries.length; i++) {
				var entry = menuEntries[i];
				entry.classList.remove("slick-gridmenu-item-hidden");
			}
			checkCustomTitle();
		}

		function hideMenuEntriesByGroup(group) {
			var menuEntries = getMenuEntriesByGroup(group);
			for (var i = 0; i < menuEntries.length; i++) {
				var entry = menuEntries[i];
				entry.classList.add("slick-gridmenu-item-hidden");
			}
			checkCustomTitle()
		}

		function disableMenuEntriesByGroup(group) {
			var menuEntries = getMenuEntriesByGroup(group);
			for (var i = 0; i < menuEntries.length; i++) {
				var $entry = $(menuEntries[i]);
				var item = $entry.data("item");
				item.disabled = true;
				$entry.data("item", item);
				$entry.addClass("slick-gridmenu-item-disabled");
			}
		}

		function enableMenuEntriesByGroup(group) {
			var menuEntries = getMenuEntriesByGroup(group);
			for (var i = 0; i < menuEntries.length; i++) {
				var $entry = $(menuEntries[i]);
				var item = $entry.data("item");
				item.disabled = false;
				$entry.data("item", item);
				$entry.removeClass("slick-gridmenu-item-disabled");
			}

		}

		function getMenuEntriesByGroup(group) {
			var customMenu = $container[0].querySelector(".slick-gridmenu-custom");
			return customMenu.querySelectorAll("[group='" + group + "']");
		}

		function checkCustomTitle() {
			var customMenu = $container[0].querySelector(".slick-gridmenu-custom");
			var titleEl = customMenu.querySelector(".title");
			var numberOfVisibleEntries = customMenu.querySelectorAll(".slick-gridmenu-item:not(.slick-gridmenu-item-hidden)").length;

			if (numberOfVisibleEntries < 1) {
				titleEl.classList.add("title-hidden");
			} else {
				titleEl.classList.remove("title-hidden");
			}

		}

		$.extend(this, {
			"init": init,
			"getAllColumns": getAllColumns,
			"destroy": destroy,
			"showGridMenu": showGridMenu,
			"showMenuEntriesByGroup": showMenuEntriesByGroup,
			"hideMenuEntriesByGroup": hideMenuEntriesByGroup,
			"disableMenuEntriesByGroup": disableMenuEntriesByGroup,
			"enableMenuEntriesByGroup": enableMenuEntriesByGroup,
			"onBeforeMenuShow": new Slick.Event(),
			"onMenuClose": new Slick.Event(),
			"onCommand": new Slick.Event(),
			"onColumnsChanged": new Slick.Event()
		});
	}
})(jQuery);