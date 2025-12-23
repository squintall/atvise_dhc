/*parameters, query parameters*/
var configNode = webMI.query["configNode"];
var timerId = webMI.query["timerId"];
var eventId = webMI.query["eventId"];
var startAddress = webMI.query["startAddress"];
var timeStep = isNaN(webMI.query["timeStep"]) ? 5 : parseInt(webMI.query["timeStep"]);
var readonly = webMI.query["readonly"] == "true";
var globalConfig;
/*config node functions*/
function getLocalConfig() {
	var local = { configs: [] };
	for (i = 0; i < globalConfig.length; i++) {
		if (globalConfig[i].id != undefined && globalConfig[i].id == timerId) return globalConfig[i].config;
	}
	return local;
}
function removeConfig(timer_id) {
	for (gc = 0; gc < globalConfig.length; gc++) {
		if (globalConfig[gc].id == timer_id) {
			globalConfig[gc].config.configs = [];
		}
	}
}
function addConfig(timer_id, datas) {
	var findId = false;
	for (gc = 0; gc < globalConfig.length; gc++) {
		if (globalConfig[gc].id == timer_id) {
			findId = true;
			globalConfig[gc].config.configs[globalConfig[gc].config.configs.length] = datas;
		}
	}
	if (!findId) {
		globalConfig[globalConfig.length] = { id: timer_id, config: { configs: [] } };
		addConfig(timer_id, datas);
	}
}
function setLocalConfig(localC) {
	removeConfig(localC.timerId);
	for (i = 0; i < localC.configs.length; i++) {
		addConfig(localC.timerId, localC.configs[i]);
	}
}

/*init section*/
function init() {
	/*scheduler config section*/
	var variables = [];
	if (!readonly) {
		document.getElementById("saveBtn").innerHTML = scheduler.locale.labels.icon_save;
		scheduler.config.details_on_create = true;
		scheduler.config.drag_create = true;
		scheduler.config.details_on_dblclick = true;
		scheduler.config.icons_select = ["icon_details", "icon_edit"];
	} else {
		document.getElementById("saveBtn").style.display = "none";
		scheduler.attachEvent("onBeforeDrag", function (e) {
			return false;
		});
		scheduler.attachEvent("onClick", function (e) {
			return false;
		});
		scheduler.attachEvent("onDblClick", function (e) {
			return false;
		});
		scheduler.config.dblclick_create = false;
		scheduler.config.drag_create = false;
		scheduler.config.icons_select = [];
	}
	//NOTE: The only acceptable delimitter in date format between date parts (day, mont, year, etc.) are: comma, semicolon, colon, slash, backslash, underline, hyphen, underscore and space
	scheduler.config.xml_date = "%D %M %d %Y %H:%i:%s";
	scheduler.config.multi_day = true;
	scheduler.config.mark_now = true;
	scheduler.config.time_step = timeStep;
	//scheduler.config.event_duration = 10; //specify event duration in munites for auto end time
	//scheduler.config.auto_end_date = true;
	scheduler.config.repeat_date = "%d.%m.%Y";
	scheduler.config.full_day = true;
	//NOTE: Redefine scheduler.date.str_to_date function because 'ÃƒÂ¤' was not in spilt regexp [^...] list
	scheduler.date.str_to_date = function (format, utc) {
		//NOTE: Modified line: regexp from /[^0-9a-zA-Z]+/g to /[ ,;:/\\_-]+/g, with restrict: see comment above at setting scheduler.config.xml_date
		var splt = "var temp=date.split(/[ ,;:/\\\\_-]+/g);";
		var mask = format.match(/%[a-zA-Z]/g);
		for (var i = 0; i < mask.length; i++) {
			switch (mask[i]) {
				case "%j":
				case "%d":
					splt += "set[2]=temp[" + i + "]||1;";
					break;
				case "%n":
				case "%m":
					splt += "set[1]=(temp[" + i + "]||1)-1;";
					break;
				case "%y":
					splt += "set[0]=temp[" + i + "]*1+(temp[" + i + "]>50?1900:2000);";
					break;
				case "%g":
				case "%G":
				case "%h":
				case "%H":
					splt += "set[3]=temp[" + i + "]||0;";
					break;
				case "%i":
					splt += "set[4]=temp[" + i + "]||0;";
					break;
				case "%Y":
					splt += "set[0]=temp[" + i + "]||0;";
					break;
				case "%a":
				case "%A":
					splt += "set[3]=set[3]%12+((temp[" + i + "]||'').toLowerCase()=='am'?0:12);";
					break;
				case "%s":
					splt += "set[5]=temp[" + i + "]||0;";
					break;
				case "%M":
					splt += "set[1]=scheduler.locale.date.month_short_hash[temp[" + i + "]]||0;";
					break;
				case "%F":
					splt += "set[1]=scheduler.locale.date.month_full_hash[temp[" + i + "]]||0;";
					break;
				default:
					break;
			}
		}
		var code = "set[0],set[1],set[2],set[3],set[4],set[5]";
		if (utc) code = " Date.UTC(" + code + ")";
		return new Function("date", "var set=[0,0,1,0,0,0]; " + splt + " return new Date(" + code + ");");
	};
	scheduler.templates.tooltip_date_format = scheduler.date.date_to_str("%H:%i:%s");
	scheduler.templates.tooltip_text = function (b, d, c) {
		var nodeOnOff = c.nodeOnOff ? c.nodeOnOff.split("#@#") : ["", ""],
			statusColor = c.statusColor ? c.statusColor.split("#@#") : ["", "", ""];
		active = statusColor[0] == "true" ? scheduler.locale.labels.active_label : scheduler.locale.labels.inactive_label;
		return (
			"<div style='width:100%;background-color:#000000;color:#ffffff;text-align:center;font-weight:bold'>" +
			active +
			"</div>" +
			"<b>" +
			scheduler.locale.labels.new_event +
			":</b> " +
			webMI.escapeHTML(c.text) +
			"<br/><b>" +
			scheduler.locale.labels.section_variable +
			":</b> " +
			webMI.escapeHTML(c.variable) +
			"</br><b>" +
			scheduler.locale.labels.start_value +
			":</b> " +
			webMI.escapeHTML(nodeOnOff[0]) +
			"</br><b>" +
			scheduler.locale.labels.end_value +
			":</b> " +
			webMI.escapeHTML(nodeOnOff[1]) +
			"<br/><b>" +
			scheduler.locale.labels.start_date +
			":</b> " +
			scheduler.templates.tooltip_date_format(b) +
			"<br/><b>" +
			scheduler.locale.labels.end_date +
			":</b> " +
			scheduler.templates.tooltip_date_format(d)
		);
	};
	//scheduler.templates.xml_date = redefined_str_to_date(scheduler.config.xml_date);
	/*self defined form blocks*/
	scheduler.form_blocks["status_color"] = {
		render: function (sns) {
			return (
				"<div class='dhx_cal_ltext' style='height:25px;'>" +
				"&nbsp;" +
				scheduler.locale.labels.active_label +
				"&nbsp;<input type='checkbox'/></div>"
			);
		},
		set_value: function (node, value, ev) {
			var elem1 = node.childNodes[1],
				dates = ["", "", ""];
			if (value && value.indexOf("#@#") != -1) {
				dates = value.split("#@#");
			}
			elem1.checked = dates[0] == "false" ? "" : "checked";
		},
		get_value: function (node, ev) {
			var elem1 = node.childNodes[1],
				stat1 = elem1.checked ? "true" : "false";
			return stat1 + "#@##@#";
		},
		focus: function (node) {}
	};
	scheduler.form_blocks["startval_endval"] = {
		render: function (sns) {
			return (
				"<div class='dhx_cal_ltext' style='height:25px;'>" +
				scheduler.locale.labels.start_value +
				":&nbsp;<input type='text' style='width:200px;'/>&nbsp;&nbsp;" +
				scheduler.locale.labels.end_value +
				":&nbsp;<input type='text' style='width:200px;'/></div>"
			);
		},
		set_value: function (node, value, ev) {
			if (value && value.indexOf("#@#") != -1) {
				var dates = value.split("#@#");
				node.childNodes[1].value = dates[0];
				node.childNodes[3].value = dates[1];
			} else {
				node.childNodes[1].value = "";
				node.childNodes[3].value = "";
			}
		},
		get_value: function (node, ev) {
			return node.childNodes[1].value + "#@#" + node.childNodes[3].value;
		},
		focus: function (node) {}
	};
	scheduler.form_blocks["time"] = {
		render: function () {
			var a = scheduler.config,
				b = this.date.date_part(new Date()),
				c = 1440,
				d = 0;
			scheduler.config.limit_time_select &&
				((c = 60 * a.last_hour + 1), (d = 60 * a.first_hour), b.setHours(a.first_hour));
			var e = scheduler.locale.labels.starting_date + ":&nbsp;<select>";
			for (f = 1; f < 32; f++) e += "<option value='" + f + "'>" + f + "</option>";
			e += "</select> <select>";
			for (f = 0; f < 12; f++) e += "<option value='" + f + "'>" + this.locale.date.month_full[f] + "</option>";
			e += "</select> <select>";
			var bL = b.getFullYear() - 5;
			for (f = 0; f < 100; f++) e += "<option value='" + (bL + f) + "'>" + (bL + f) + "</option>";
			e += "</select>&nbsp;" + scheduler.locale.labels.starting_time + ":&nbsp;<select>";
			for (var f = d, g = b.getDate(); f < c; ) {
				var h = this.templates.time_picker(b);
				e += "<option value='" + f + "'>" + h + "</option>";
				b.setTime(b.valueOf() + this.config.time_step * 6e4);
				var i = b.getDate() != g ? 1 : 0,
					f = i * 1440 + b.getHours() * 60 + b.getMinutes();
			}
			e += "</select> ";
			return (
				"<div style='height:30px;padding-top:0px;font-size:inherit;' class='dhx_section_time'>" +
				e +
				"&nbsp;" +
				scheduler.locale.labels.duration +
				":&nbsp;<input type='text' style='width:50px;'/>&nbsp;(<label style='font-weight:bold;widht:70px'></label>)</div>"
			);
		},
		set_value: function (a, b, c) {
			function d(a, b, c) {
				a[b + 0].value = c.getDate();
				a[b + 1].value = c.getMonth();
				a[b + 2].value = c.getFullYear();
				a[b + 3].value =
					Math.round((c.getHours() * 60 + c.getMinutes()) / scheduler.config.time_step) * scheduler.config.time_step;
			}
			function getDuration(a, b) {
				return (b.getTime() - a.getTime()) / 6e4;
			}
			function getTime(a, b) {
				var endDate = new Date(a.getTime() + b * 6e4);
				time = ("0" + endDate.getHours()).substr(-2) + ":" + ("0" + endDate.getMinutes()).substr(-2);
				if (a.getDate() != endDate.getDate()) {
					var da = parseInt((a.getHours() * 60 + a.getMinutes() + parseInt(b) - 1439) / 1440);
					return "+" + (da + 1) + " " + time;
				} else {
					return time;
				}
			}
			var e = a.getElementsByTagName("select");
			var e2 = a.getElementsByTagName("input");
			var e3 = a.getElementsByTagName("label");
			if (scheduler.config.full_day) {
				if (!a._full_day) {
					var f =
						"<label class='dhx_fullday'><input type='checkbox' name='full_day' value='true'> " +
						scheduler.locale.labels.full_day +
						"&nbsp;</label></input>";
					scheduler.config.wide_form || (f = a.previousSibling.innerHTML + f);
					a.previousSibling.innerHTML = f;
					a._full_day = !0;
				}
				var g = a.previousSibling.getElementsByTagName("input")[0],
					h =
						scheduler.date.time_part(c.start_date) === 0 &&
						scheduler.date.time_part(c.end_date) === 0 &&
						c.end_date.valueOf() - c.start_date.valueOf() < 1728e5;
				g.checked = h;
				for (var i in e) e[i].disabled = g.checked;
				g.onclick = function () {
					if (g.checked) {
						var a = new Date(c.start_date),
							b = new Date(c.end_date);
						scheduler.date.date_part(a);
						b = scheduler.date.add(a, 1440, "minute");
					}
					for (var f in e) e[f].disabled = g.checked;
					e2[0].disabled = g.checked;
					d(e, 0, a || c.start_date);
					e2[0].value = getDuration(a || c.start_date, b || c.end_date);
					e3[0].innerHTML = getTime(c.start_date, e2[0].value);
				};
			}
			if (scheduler.config.auto_end_date && scheduler.config.event_duration)
				for (
					var k = function () {
							c.start_date = new Date(e[2].value, e[1].value, e[0].value, 0, e[3].value);
							c.end_date.setTime(c.start_date.getTime() + scheduler.config.event_duration * 6e4);
							e2[0].value = scheduler.config.event_duration;
							e3[0].innerHTML = getTime(c.start_date, e2[0].value);
						},
						j = 0;
					j < 4;
					j++
				)
					e[j].onchange = k;
			d(e, 0, c.start_date);
			e2[0].value = getDuration(c.start_date, c.end_date);
			e2[0].onkeyup = function (ev) {
				if (isNaN(this.value)) {
					this.value = parseInt(this.value);
					if (isNaN(this.value)) {
						this.value = 0;
					}
				}
				e3[0].innerHTML = getTime(c.start_date, this.value);
			};
			e3[0].innerHTML = getTime(c.start_date, e2[0].value);
		},
		get_value: function (a, b) {
			s = a.getElementsByTagName("select");
			s1 = a.getElementsByTagName("input");
			b.start_date = new Date(s[2].value, s[1].value, s[0].value, 0, s[3].value);
			b.end_date = new Date(b.start_date.getTime() + s1[0].value * 6e4);
			if (b.end_date <= b.start_date)
				b.end_date = scheduler.date.add(b.start_date, scheduler.config.time_step, "minute");
		},
		focus: function (a) {
			a.getElementsByTagName("select")[0].focus();
		}
	};

	/*init*/
	scheduler.init("scheduler_here", null, "week");
	/*read config node and create lightbox*/
	webMI.data.read(configNode, function (e) {
		globalConfig = JSON.parse(e.value);
		var localConfig = getLocalConfig();
		var schedulerConfig = [];
		for (i = 0; i < localConfig.configs.length; i++) {
			var row_obj = {
				start_date: "",
				end_date: "",
				event_pid: "",
				id: "",
				event_length: "",
				rec_pattern: "",
				rec_type: "",
				text: "",
				variable: "",
				statusColor: "",
				nodeOnOff: ""
			};
			row_obj.start_date = localConfig.configs[i].start_date;
			row_obj.end_date = localConfig.configs[i].end_date;
			row_obj.event_pid = localConfig.configs[i].event_pid;
			row_obj.id = localConfig.configs[i].row.replace(timerId + "_", "");
			row_obj.event_length = localConfig.configs[i].event_length;
			row_obj.rec_pattern = localConfig.configs[i].rec_pattern;
			row_obj.rec_type = localConfig.configs[i].rec_type;
			row_obj.text = webMI.escapeHTML(localConfig.configs[i].text);
			row_obj.variable = localConfig.configs[i].nodeOn;
			row_obj.statusColor = localConfig.configs[i].active + "#@#";
			row_obj.statusColor += "#@#";
			row_obj.nodeOnOff = localConfig.configs[i].valueOn + "#@#";
			row_obj.nodeOnOff += localConfig.configs[i].valueOff;
			schedulerConfig[schedulerConfig.length] = row_obj;
		}
		if (schedulerConfig.length > 0) {
			scheduler.parse(schedulerConfig, "json");
		}
		scheduler.render_view_data();
		scheduler.config.readonly = true;
		webMIBrowse(variables);
	});
	function webMIBrowse(variables) {
		webMI.data.call(
			"BrowseNodes",
			{
				startAddress: startAddress,
				endLevel: 0,
				vTypes: ["i=61", "i=62", "ObjectTypes.PROJECT", "ns=1;s=ObjectTypes.ATVISE.Alarm"]
			},
			function (e) {
				var nodes = e;
				if (nodes != null) {
					function createMenu(array, subnodes) {
						for (i in subnodes) {
							array.push({ key: subnodes[i].name, label: subnodes[i].name });
							if (typeof subnodes[i]["childs"] == "object" && subnodes[i]["childs"] != null)
								createMenu(array, subnodes[i]["childs"]);
						}
					}
					var array = [];
					createMenu(variables, nodes);
				}
				scheduler.config.lightbox.sections = [
					{ name: "description", height: 25, map_to: "text", type: "textarea", focus: true },
					{ name: "statusColor", map_to: "statusColor", type: "status_color" },
					{
						name: "variable",
						options: variables,
						map_to: "variable",
						type: "combo",
						image_path: "imgs/",
						filtering: true
					},
					{ name: "recurring", type: "recurring", map_to: "rec_type", button: "recurring" },
					{ name: "time", type: "time", map_to: "auto" },
					{ name: "nodeOnOff", height: 30, map_to: "nodeOnOff", type: "startval_endval" }
				];
				if (eventId && eventId != "") {
					eventId = eventId.replace(timerId + "_", "");
					b = scheduler.getEvent(eventId);
					if (b.rec_pattern != "") {
						b._end_date = b.end_date;
						b.end_date = new Date(b.start_date.valueOf() + b.event_length * 1000);
					}
					if (!readonly) {
						scheduler.showLightbox(b.id);
					}
				}
				scheduler.config.readonly = readonly;
			}
		);
	}
}

/*save function*/
function save() {
	var jsonS = scheduler.toJSON();
	var localC = { configs: [], timerId: timerId };
	var stringToDate = scheduler.date.str_to_date(scheduler.config.xml_date);
	jsonS = jsonS.replace(/(start_date:)/g, '"start_date":');
	jsonS = jsonS.replace(/(end_date:)/g, '"end_date":');
	jsonS = jsonS.replace(/(event_pid:)/g, '"event_pid":');
	jsonS = jsonS.replace(/(id:)/g, '"id":');
	jsonS = jsonS.replace(/(event_length:)/g, '"event_length":');
	jsonS = jsonS.replace(/(rec_pattern:)/g, '"rec_pattern":');
	jsonS = jsonS.replace(/(rec_type:)/g, '"rec_type":');
	jsonS = jsonS.replace(/(text:)/g, '"text":');
	jsonS = jsonS.replace(/(statusColor:)/g, '"statusColor":');
	jsonS = jsonS.replace(/(variable:)/g, '"variable":');
	jsonS = jsonS.replace(/(nodeOnOff:)/g, '"nodeOnOff":');
	try { 
		var data = JSON.parse(jsonS);
	} catch(ex) {
		console.warn("Timer changes could not be saved: " + ex);
		return;
	}
	for (i = 0; i < data.length; i++) {
		if (data[i].event_length != "" && data[i].rec_pattern == "") continue;
		var row_obj = {
			row: "",
			active: "",
			start_date: "",
			end_date: "",
			nodeOn: "",
			valueOn: "",
			valueOff: "",
			event_pid: "",
			event_length: "",
			rec_pattern: "",
			rec_type: "",
			text: "",
			repeatPeriod: "",
			startDate: "",
			endDate: "",
			duration: "",
			weekdays: {}
		};
		row_obj.row = timerId + "_" + data[i].id;
		var statusColor = data[i].statusColor.split("#@#");
		row_obj.active = statusColor[0];
		row_obj.start_date = data[i].start_date;
		row_obj.end_date = data[i].end_date;
		row_obj.nodeOn = data[i].variable;
		var valueOn_off = data[i].nodeOnOff.split("#@#");
		row_obj.valueOn = valueOn_off[0];
		row_obj.valueOff = valueOn_off[1];
		row_obj.event_pid = data[i].event_pid;
		row_obj.event_length = data[i].event_length;
		row_obj.rec_pattern = data[i].rec_pattern;
		row_obj.rec_type = data[i].rec_type;
		row_obj.text = data[i].text;
		if (data[i].rec_pattern == "") {
			row_obj.repeatPeriod = "0";
			row_obj.startDate = stringToDate(data[i].start_date).getTime();
			row_obj.endDate = stringToDate(data[i].end_date).getTime();
			if (data[i].event_length == "") {
				row_obj.duration = (row_obj.endDate - row_obj.startDate) / 1000;
			} else {
				row_obj.duration = row_obj.event_length;
			}
		} else {
			if (data[i].event_length == "") {
				alert("event_length URES");
			}
			row_obj.duration = row_obj.event_length;
			var recur = data[i].rec_pattern.split("_");
			if (recur[0] == "day") {
				row_obj.repeatPeriod = "1";
				row_obj.startDate = stringToDate(data[i].start_date).getTime();
				row_obj.endDate = stringToDate(data[i].end_date).getTime();
			} else if (recur[0] == "week") {
				row_obj.repeatPeriod = "2";
				var days = recur[4].split(",");
				row_obj.weekdays = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };
				for (var j = 0; j < days.length; j++) {
					if (days[j] == "1") {
						row_obj.weekdays["1"] = true;
					} else if (days[j] == "2") {
						row_obj.weekdays["2"] = true;
					} else if (days[j] == "3") {
						row_obj.weekdays["3"] = true;
					} else if (days[j] == "4") {
						row_obj.weekdays["4"] = true;
					} else if (days[j] == "5") {
						row_obj.weekdays["5"] = true;
					} else if (days[j] == "6") {
						row_obj.weekdays["6"] = true;
					} else if (days[j] == "0") {
						row_obj.weekdays["7"] = true;
					}
				}
				row_obj.startDate = stringToDate(data[i].start_date).getTime();
				var temp_end_date = stringToDate(data[i].end_date);
				temp_end_date = scheduler.date.add(temp_end_date, -1, "day");
				for (j = 1; j < 8; j++) {
					var last_day = temp_end_date.getDay();
					if (last_day == 0) last_day = 7;
					if (row_obj.weekdays[last_day]) {
						if (row_obj.endDate == "" || row_obj.endDate < temp_end_date.getTime())
							row_obj.endDate = temp_end_date.getTime();
					}
					temp_end_date = scheduler.date.add(temp_end_date, -1, "day");
				}
			} else if (recur[0] == "month") {
				row_obj.repeatPeriod = "3";
				row_obj.startDate = stringToDate(data[i].start_date).getTime();
				var dayOfMonth = stringToDate(data[i].start_date).getDate();
				var temp_end_date = stringToDate(data[i].end_date);
				temp_end_date = scheduler.date.add(temp_end_date, -1, "day");
				for (var j = 1; j < 32; j++) {
					var last_day = temp_end_date.getDate();
					if (dayOfMonth == last_day) {
						row_obj.endDate = temp_end_date.getTime();
						break;
					}
					temp_end_date = scheduler.date.add(temp_end_date, -1, "day");
				}
			} else if (recur[0] == "year") {
				row_obj.repeatPeriod = "4";
				row_obj.startDate = stringToDate(data[i].start_date).getTime();
				var dayOfMonth = stringToDate(data[i].start_date).getDate();
				var monthOfYear = stringToDate(data[i].start_date).getMonth();
				var temp_end_date = stringToDate(data[i].end_date);
				temp_end_date = scheduler.date.add(temp_end_date, -1, "day");
				for (var j = 1; j < 367; j++) {
					var last_day = temp_end_date.getDate();
					var last_month = temp_end_date.getMonth();
					if (dayOfMonth == last_day && monthOfYear == last_month) {
						row_obj.endDate = temp_end_date.getTime();
						break;
					}
					temp_end_date = scheduler.date.add(temp_end_date, -1, "day");
				}
			}
		}
		localC.configs[localC.configs.length] = row_obj;
	}
	setLocalConfig(localC);
	webMI.data.write(webMI.query.configNode, JSON.stringify(globalConfig), function (e) {});
	webMI.trigger.fire("com.atvise.close_timer", localC);
}

function createCSSClass(selector, style) {
	if (!document.styleSheets) return;
	if (document.getElementsByTagName("head").length == 0) return;

	var stylesheet;
	if (document.styleSheets.length > 0) {
		for (i = 0; i < document.styleSheets.length; i++) {
			if (document.styleSheets[i].disabled) continue;
			var media = document.styleSheets[i].media;
			if (typeof media == "string") {
				if (media == "" || media.indexOf("screen") != -1) {
					styleSheet = document.styleSheets[i];
				}
			} else if (typeof media == "object") {
				if (media.mediaText == "" || media.mediaText.indexOf("screen") != -1) {
					styleSheet = document.styleSheets[i];
				}
			}
			if (typeof styleSheet != "undefined") break;
		}
	}
	if (typeof styleSheet == "undefined") {
		var styleSheetElement = document.createElement("style");
		styleSheetElement.type = "text/css";
		document.getElementsByTagName("head")[0].appendChild(styleSheetElement);
		for (i = 0; i < document.styleSheets.length; i++) {
			if (document.styleSheets[i].disabled) continue;
			styleSheet = document.styleSheets[i];
		}
		var media = styleSheet.media;
	}
	if (typeof media == "string") {
		for (i = 0; i < styleSheet.rules.length; i++) {
			if (styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
				styleSheet.rules[i].style.cssText = style;
				return;
			}
		}
		styleSheet.addRule(selector, style);
	} else if (typeof media == "object") {
		for (i = 0; i < styleSheet.cssRules.length; i++) {
			if (styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
				styleSheet.cssRules[i].style.cssText = style;
				return;
			}
		}
		styleSheet.insertRule(selector + "{" + style + "}", 0);
	}
}
