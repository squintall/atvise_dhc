/***
 * Contains extentend custom SlickGrid editors.
 * @module Editors
 * @namespace Slick
 */

function valueChanged(value, isNodeEditor){
	webMI.trigger.fire("tableCellValueChanged", value);
}

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Recipe": {
        "Editors": {
          "Number": NumberEditor,
          "Range": NumberRangeEditor,
          "String": StringEditor,
          "Bool": BoolEditor,
          "Options": OptionsEditor,
          "Node": NodeEditor,
          "IndividualType" : IndividualTypeEditor,
          "TypeSelectEditor" : TypeSelectEditor
        }
      }
    }
  });

  function NumberEditor(args) {
    var $element;
    var $input;
    var $inputRange;
    var defaultValue;
    var scope = this;
    var settings = {};
    var tabHandler = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Tab Handler");

    this.init = function () {
    
      var navOnLR = args.grid.getOptions().editorCellNavOnLRKeys;
      $element = $("<div class='editor-number-wrapper'></div>")
          .appendTo(args.container);
      $input = $("<INPUT type='number' class='editor-number' />")
          .appendTo($element)
          .on("keydown.nav", navOnLR ? handleKeydownLRNav : handleKeydownLRNoNav)
          .focus()
          .select(); 
      $($input).on('blur', function(e) {
		if (e.relatedTarget && $(e.relatedTarget).hasClass('editor-number-buttons')) {
			//Do not focus out on trying to use relatedd input control fields
			e.preventDefault;
			 return;
		}
	    webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
	  });  
      $buttons = $("<div class='editor-number-buttons' tabindex='0'></div>")
		  .appendTo($element);
		  
	  $($buttons).on('blur', function(e) {
			  webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
	  });
      $btnUp = $("<div class='editor-number-button editor-number-up'><span class='slick-sort-indicator slick-sort-indicator-asc'></span></div>")
		  .appendTo($buttons);
      $btnUp.on('click', function(e) {
		  $input[0].stepUp();
      });
      $btnDown = $("<div class='editor-number-button editor-number-down'><span class='slick-sort-indicator slick-sort-indicator-desc'></span></div>")
		  .appendTo($buttons);
      $btnDown.on('click', function(e) {
		  $input[0].stepDown();
      });
          
      tabHandler.setAcceptKeys(false); //deactivate tabHandler while editing to make backspace work
    };

    this.destroy = function () {
      $element.remove();
      tabHandler.setAcceptKeys(true);
    };

    this.focus = function () {
      $input.focus();
    };

    this.getValue = function () {
      return $input.val();
    };

    this.setValue = function (val) {
      $input.val(val);
    };

	this.loadValue = function (item) {
	  defaultValue = item[args.column.field];
	  $input.val(defaultValue);
	  $input[0].defaultValue = defaultValue;
	  
		if(item.hasOwnProperty(args.column.field + "-editorSettings")){
			settings = item[args.column.field + "-editorSettings"];
		}
		
		/*------set properties of html input element----*/
		if(settings.hasOwnProperty("min")){
			$input.attr({
				"min" : settings.min
			});

		}
		if(settings.hasOwnProperty("max")){
			$input.attr({
				"max" : settings.max
			});
		}
		if(settings.hasOwnProperty("step")){
			$input.attr({
				"step" : settings.step
			});
		}
		/*----------------*/
		
	  setTimeout(function(e){$input.select();},10);
	};

    this.serializeValue = function () {
      return $input.val();
    };

    this.applyValue = function (item, state) {
      valueChanged(state);
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      if (args.column.validator) {
        var validationResults = args.column.validator($input.val());
        if (!validationResults.valid) {
          return validationResults;
        }
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function NumberRangeEditor(args) {
    var $element;
    var $input;
    var $inputRange;
    var defaultValue;
    var scope = this;
    var settings = { min: 0, max: 100 };
    var tabHandler = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Tab Handler");

    this.init = function () {
    
      var navOnLR = args.grid.getOptions().editorCellNavOnLRKeys;
      $element = $("<div class='editor-number-wrapper'></div>")
          .appendTo(args.container);
      $input = $("<INPUT type='number' class='editor-number' />")
          .appendTo($element)
          .on("keydown.nav", navOnLR ? handleKeydownLRNav : handleKeydownLRNoNav)
          .focus()
          .select();
          
	   $($input).on('blur', function(e) {	
		if(e.relatedTarget && $(e.relatedTarget).hasClass('editor-number-range')) {
			//Do not focus out on trying to use relatedd input control fields
			e.preventDefault;
			 return;
		}
	    webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
	  });
      $inputRange = $("<INPUT type='range' class='editor-number-range'/>")
          .appendTo($element);
       $($inputRange).on('blur', function(e) {
			  webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
	  });
		tabHandler.setAcceptKeys(false); //deactivate tabHandler while editing to make backspace work
    };
	
    this.destroy = function () {
      $element.remove();
      tabHandler.setAcceptKeys(true);
    };

    this.focus = function () {
      $input.focus();
    };

    this.getValue = function () {
      return $input.val();
    };

    this.setValue = function (val) {
      $input.val(val);
    };

	this.loadValue = function (item) {
		defaultValue = item[args.column.field];
		$input.val(defaultValue);
		$inputRange.val(defaultValue);
		$input[0].defaultValue = defaultValue;
		
		$inputRange.on('input', function(e) {
			$input.val($inputRange.val());
		}); 
		
		$inputRange.on('change', function(e) {
			$input.focus();
			$input.select();
		}); 
		
		if(item.hasOwnProperty(args.column.field + "-editorSettings")){
			settings = item[args.column.field + "-editorSettings"];
		}
		
		/*------set properties of html input element----*/
		if(settings.hasOwnProperty("min")){
			$input.attr({
				"min" : settings.min
			});
			$inputRange.attr({
				"min" : settings.min
			});
		}
		if(settings.hasOwnProperty("max")){
			$input.attr({
				"max" : settings.max
			});
			$inputRange.attr({
				"max" : settings.max
			});
		}
		if(settings.hasOwnProperty("step")){
			$input.attr({
				"step" : settings.step
			});
			$inputRange.attr({
				"step" : settings.step
			});
		}
		/*----------------*/
		
		setTimeout(function(e){$input.select();},10);
	};
	
    this.serializeValue = function () {
      return $input.val();
    };

    this.applyValue = function (item, state) {
      valueChanged(state);
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      if (args.column.validator) {
        var validationResults = args.column.validator($input.val());
        if (!validationResults.valid) {
          return validationResults;
        }
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

function StringEditor(args) {

    var $input;
    var defaultValue;
    var scope = this;
    var tabHandler = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Tab Handler");

    this.init = function () {
      var navOnLR = args.grid.getOptions().editorCellNavOnLRKeys;
      $input = $("<INPUT type='text' class='editor-string' />")
          .appendTo(args.container)
          .on("keydown.nav", navOnLR ? handleKeydownLRNav : handleKeydownLRNoNav)
          .focus()
          .select();
		tabHandler.setAcceptKeys(false); //deactivate tabHandler while editing to make backspace work
    };

    this.destroy = function () {
      $input.remove();
      tabHandler.setAcceptKeys(true);
    };

    this.focus = function () {
      $input.focus();
    };

    this.getValue = function () {
      return $input.val();
    };

    this.setValue = function (val) {
      $input.val(val);
    };

    this.loadValue = function (item) {
      defaultValue = item[args.column.field] || "";
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      setTimeout(function(e){
        $input.select();
        $($input).on('blur', function() {
          webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
        });  
      },10);
    };

    this.serializeValue = function () {
      return $input.val();
    };

    this.applyValue = function (item, state) {
	  valueChanged(state);
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      if (args.column.validator) {
        var validationResults = args.column.validator($input.val());
        if (!validationResults.valid) {
          return validationResults;
        }
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }
  function NodeEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;
	var tabHandler = webMI.callExtension("SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.Tab Handler");

    this.init = function () {
    
      var navOnLR = args.grid.getOptions().editorCellNavOnLRKeys;
      var width = args.container.offsetWidth-14;
      var height = args.container.offsetHeight;
		  $tree = $("<div id='treeView' style='color: black; padding: 4px; position: absolute; width: "+width+"px; height: 200px; top: "+height+"px; overflow: hidden; background-color: white; border: 1px solid black'></div> ")
			  .appendTo(args.container)
			  .on("keydown.nav", navOnLR ? handleKeydownLRNav : handleKeydownLRNoNav)
			  .focus()
			  .select();
			  
		  $grid = $(".grid-canvas");
			if($tree.offset().top + $tree.height() > $grid.offset().top + $grid.height() + 10){
			  $tree.offset({top: $tree.offset().top - $tree.height() - height - 10});
		  }  
		  
		  $input = $("<INPUT type='text' class='editor-string' />")
          .appendTo(args.container)
          .on("keydown.nav", navOnLR ? handleKeydownLRNav : handleKeydownLRNoNav)
             .focus()
			  .select();
          
		var treeViewToUse = 'SYSTEM.LIBRARY.ATVISE.QUICKDYNAMICS.TreeView';
		startAddress = args.item.startAddr;
		
		// FIXME: Implement opcua datasource and use UniversalTreeView for both opcua and scope
		var treeView = top.webMI.callExtension(treeViewToUse, {
			"busyIndicatorTolerance": "100",
			"expandoOffset": "3",
			"fontSize": "12",
			"id": "address_treeview",
			"imagePaths": "{\"baseVariableImage\":\"/treeView/icons/baseVariable.svg\",\"folderImage\":\"/treeView/icons/folder.svg\",\"aggregateFunctionImage\":\"/treeView/icons/aggregateFunction.svg\",\"collapsedLeafImage\":\"/treeView/icons/leafCollapsed.svg\",\"expandedLeafImage\":\"/treeView/icons/leafExpanded.svg\"}",
			"leafIndentation": "15",
			"leafPadding": "2",
			"renderTo": "treeView",
			"selectableTypes": "[\"baseVariable\", \"aggregateFunction\"]",
			"startAddress": startAddress
			//"datasource": datasource
		});
		$(treeView).attr('tabindex','0');
		var	that = this;
		treeView.on("expand", function (e) {
			$input.focus();
		});
		treeView.on("collapse", function (e) {
			$input.focus();
		});
		treeView.on("select", function (e) {
			 $input.val(treeView.getSelectedNode().address.replace("AGENT.OBJECTS.", ""));
			
			 treeView.destroy();
			 $tree.remove();
			 webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
		}); 

		tabHandler.setAcceptKeys(false); //deactivate tabHandler while editing to make backspace work    
    };
   
	

    this.destroy = function () {
      $input.remove();
      tabHandler.setAcceptKeys(true);
    };

    this.focus = function () {
      $input.focus();
    };

    this.getValue = function () {
      return $input.val();
    };

    this.setValue = function (val) {
      $input.val(val);
    };

    this.loadValue = function (item) {
      defaultValue = item[args.column.field] || "";
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $(document).on('click', clickHandler);
    };
    
    function clickHandler(e) {
      if ($input.parent() && $(e.target).closest($input.parent()).length === 0) {
        if($(e.target).parent().length > 0) {
          $(document).off('click', clickHandler);
          webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
        }
      }
    }

    this.serializeValue = function () {
      return $input.val();
    };

    this.applyValue = function (item, state) {
	  valueChanged(state);
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      if (args.column.validator) {
        var validationResults = args.column.validator($input.val());
        if (!validationResults.valid) {
          return validationResults;
        }
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function BoolEditor(args) {
    var $select;
    var defaultValue;
    var scope = this;

    this.init = function () {
      $select = $("<SELECT class='editor-bool'><OPTION value='true'>true</OPTION><OPTION value='false'>false</OPTION></SELECT>");
      $select.appendTo(args.container);
      $select.focus();
      
      	$($select).on('blur', function() {
				webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
		});  
    };

    this.destroy = function () {
      $select.remove();
    };

    this.focus = function () {
      $select.focus();
    };

    this.loadValue = function (item) {
      $select.val((defaultValue = item[args.column.field]) ? "true" : "false");
      $select.select();
    };

    this.serializeValue = function () {
      return ($select.val() == "true");
    };

    this.applyValue = function (item, state) {
      valueChanged(state);
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return ($select.val() != defaultValue);
    };

    this.validate = function () {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function OptionsEditor(args) {
    var $select;
    var defaultValue;
    var scope = this;

    this.init = function () {
      $select = $("<SELECT class='editor-options'></SELECT>");
      $select.appendTo(args.container);
      (args.item.options || "").split(";").forEach(function(option) {
        $("<OPTION value='" + option + "'>" + option + "</OPTION>").appendTo($select);
      });
      $select.focus();
      
      $($select).on('blur', function() {
        webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
      });
    };

    this.destroy = function () {
      $select.remove();
    };

    this.focus = function () {
      $select.focus();
    };

    this.loadValue = function (item) {
      defaultValue = item[args.column.field] || "";
      $select.val(defaultValue);
      $select[0].defaultValue = defaultValue;
      setTimeout(function(e){$select.select();},10);
    };

    this.serializeValue = function () {
      return $select.val();
    };

    this.applyValue = function (item, state) {
      valueChanged(state);
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return ($select.val() != defaultValue);
    };

    this.validate = function () {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

	function IndividualTypeEditor(args){	
		var typeSetting;
		var type;
		var editor;
		
		if(args.item.hasOwnProperty(args.column.field + "-editorType")){
			typeSetting = args.item[args.column.field + "-editorType"];

			if(typeSetting.hasOwnProperty("field")){ //use value of another field for type
				type = args.item[typeSetting.field];		
			}else{ //type defined directly in settings
				type = typeSetting;
			}
		}
		
		if(type == "Range"){
			editor = new NumberRangeEditor(args);
		}else if(type == "Number"){
			editor = new NumberEditor(args);
		}else if(type == "String"){
			editor = new StringEditor(args);
		}else if(type == "Bool"){
			editor = new BoolEditor(args);
		}else if(type == "Options"){
			editor = new OptionsEditor(args);
		}else{//fallback if no type specified for this field:
			editor = new StringEditor(args);
		}
	
		this.destroy = function () {
		  editor.destroy();
		};
	
		this.focus = function () {
		  editor.focus();
		};
	
		this.loadValue = function (item) {
			editor.loadValue(item);
		}
	
		this.serializeValue = function () {
		  return editor.serializeValue();
		};
	
		this.applyValue = function (item, state) {
			editor.applyValue(item, state);
		};
	
		this.isValueChanged = function () {
		  return editor.isValueChanged();
		};
	
		this.validate = function () {
		  return editor.validate();
		};
	}
	
	function TypeSelectEditor(args) {
		var $select;
		var defaultValue;
		var scope = this;
	
		this.init = function () {
		  $select = $("<SELECT class='editor-typeselect'>" +
			"<OPTION value='Number'>Number</OPTION>" +
			"<OPTION value='String'>String</OPTION>" +
			"<OPTION value='Bool'>Bool</OPTION></SELECT>");
		  $select.appendTo(args.container);
		  $($select).on('blur', function(e) {	
			//currently not applying correctly	  		 
			//webMI.rootWindow.Slick.GlobalEditorLock.commitCurrentEdit();
		  }); 
		  $select.focus();
		 
		};
	
		this.destroy = function () {
		  $select.remove();
		};
	
		this.focus = function () {
		  $select.focus();
		};
	
		this.loadValue = function (item) {
		  $select.val((defaultValue = item[args.column.field]));
		  $select.select();
		};
	
		this.serializeValue = function () {
		  return $select.val();
		};
	
		this.applyValue = function (item, state) {
		  valueChanged(state);
		  item[args.column.field] = state;
		};
	
		this.isValueChanged = function () {
		  return ($select.val() != defaultValue);
		};
	
		this.validate = function () {
		  return {
			valid: true,
			msg: null
		  };
		};
	
		this.init();
	}
 
 
  
  /*
   * Depending on the value of Grid option 'editorCellNavOnLRKeys', us 
   * Navigate to the cell on the left if the cursor is at the beginning of the input string
   * and to the right cell if it's at the end. Otherwise, move the cursor within the text
   */
  function handleKeydownLRNav(e) {
	if(this.type === "number")
		return;  
  
    var cursorPosition = this.selectionStart;
    var textLength = this.value.length; 
    if ((e.keyCode === $.ui.keyCode.LEFT && cursorPosition > 0) ||
         e.keyCode === $.ui.keyCode.RIGHT && cursorPosition < textLength-1) {
      e.stopImmediatePropagation();
    }
  }

  function handleKeydownLRNoNav(e) {
    if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {	
      e.stopImmediatePropagation();	
    }	
  }
  
})(jQuery);
