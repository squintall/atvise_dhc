function getTranslations(language){
	webMI.data.call(
		"GetTranslations", {"language":language},
		function(result) {
			if (result != null){
				var xmlDoc,messages = null;
				if (result.result != null){
					if (window.DOMParser){
						parser=new DOMParser();
						xmlDoc=parser.parseFromString(result.result,"text/xml");
					} else {
						xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async=false;
						xmlDoc.loadXML(result.result); /*xmlDoc["loadXM"+"L"](result.result)*/
					}
					messages = xmlDoc.getElementsByTagName("message");
				}
				function getLabelValue(label){
					if (messages == null) return label;
					for (var i=0;i<messages.length;i++){
						if (messages[i].getElementsByTagName("source")[0].childNodes[0].nodeValue == label)
							if (messages[i].getElementsByTagName("translation")[0].childNodes.length > 0)
								return messages[i].getElementsByTagName("translation")[0].childNodes[0].nodeValue;
							else return "";
					} return label;
				}

				scheduler.locale = {
					date:{
						month_full:[getLabelValue("January"),getLabelValue("February"),getLabelValue("March"),
							getLabelValue("April"),getLabelValue("May"),getLabelValue("June"),getLabelValue("July"),
							getLabelValue("August"),getLabelValue("September"),getLabelValue("October"),
							getLabelValue("November"),getLabelValue("December")],
						month_short:[getLabelValue("Jan"),getLabelValue("Feb"),getLabelValue("Mar"),
							getLabelValue("Apr"),getLabelValue("May"),getLabelValue("Jun"),getLabelValue("Jul"),
							getLabelValue("Aug"),getLabelValue("Sep"),getLabelValue("Oct"),
							getLabelValue("Nov"),getLabelValue("Dec")],
						day_full:[getLabelValue("Sunday"),getLabelValue("Monday"),getLabelValue("Tuesday"),
							getLabelValue("Wednesday"),getLabelValue("Thursday"),getLabelValue("Friday"),getLabelValue("Saturday")],
						day_short:[getLabelValue("Sun"),getLabelValue("Mon"),getLabelValue("Tue"),
							getLabelValue("Wed"),getLabelValue("Thu"),getLabelValue("Fri"),getLabelValue("Sat")]
					},
					labels:{
						dhx_cal_today_button: getLabelValue("Today"),
						day_tab: getLabelValue("Day"),
						week_tab: getLabelValue("Week"),
						month_tab: getLabelValue("Month"),
						new_event: getLabelValue("Event"),
						icon_save: getLabelValue("Save"),
						icon_cancel: getLabelValue("Cancel"),
						icon_details: getLabelValue("Details"),
						icon_edit: getLabelValue("Edit"),
						icon_delete: getLabelValue("Delete"),
						confirm_closing: getLabelValue("Your changes will be lost, are your sure ?"),
						confirm_deleting: getLabelValue("Event will be deleted permanently, are you sure?"),
						section_description: getLabelValue("Description"),
						section_time: getLabelValue("Time period"),
						full_day: getLabelValue("Full day"),
						confirm_recurring: "",/*FIX*/
						section_recurring: getLabelValue("Repeat event"),
						button_recurring: getLabelValue("Disabled"),
						button_recurring_open: getLabelValue("Enabled"),
						agenda_tab: getLabelValue("Agenda"),
						date: getLabelValue("Date"),
						description: getLabelValue("Description"),
						year_tab: getLabelValue("Year"),
						week_agenda_tab: getLabelValue("Agenda"),
						section_statusColor: getLabelValue("Status"),
						section_variable: getLabelValue("Variable"),
						section_nodeOnOff: getLabelValue("Value"),
						active_label: getLabelValue("Active"),
						inactive_label: getLabelValue("Inactive"),
						start_value: getLabelValue("Value on"),
						end_value: getLabelValue("Value off"),
						start_date: getLabelValue("Start date"),
						end_date: getLabelValue("End date"),
						starting_date: getLabelValue("Starting date"),
						starting_time: getLabelValue("Starting time"),
						ending_time: getLabelValue("Ending time"),
						duration: getLabelValue("Duration (in min.)"),
						daily: getLabelValue("Daily"),
						weekly: getLabelValue("Weekly"),
						monthly: getLabelValue("Monthly"),
						yearly: getLabelValue("Yearly"),
						workday: getLabelValue("workday"),
						every_BF: getLabelValue("Every"),
						every: getLabelValue("every"),
						repeat: getLabelValue("Repeat"),
						week_next_days: getLabelValue("Repeat every week at following day"),
						day_at_month: getLabelValue("day at month"),
						repeat_at: getLabelValue("Repeat at"),
						month: getLabelValue("month"),
						on: getLabelValue("On"),
						no_end_date: getLabelValue("No end date"),
						after: getLabelValue("After"),
						occurrences: getLabelValue("occurrences"),
						end_by: getLabelValue("End by"),
						day: getLabelValue("day"),
						repeat_date_of_end: "01.01.2012"/*FIX*/
					}
				};
				scheduler.__recurring_template = '<div class="dhx_form_repeat"> <form> <div class="dhx_repeat_left"> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="day" />' + scheduler.locale.labels.daily + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="week"/>' + scheduler.locale.labels.weekly + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="month" checked />' + scheduler.locale.labels.monthly + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="year" />' + scheduler.locale.labels.yearly + '</label> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_center"> <div style="display:none;" id="dhx_repeat_day"> <label><input class="dhx_repeat_radio" type="radio" name="day_type" value="d"/>' + scheduler.locale.labels.every_BF + '</label><input class="dhx_repeat_text" type="text" name="day_count" value="1" style="display:none"/> ' + scheduler.locale.labels.day + '<br /> <label><input class="dhx_repeat_radio" type="radio" name="day_type" checked value="w"/>' + scheduler.locale.labels.every_BF + ' ' + scheduler.locale.labels.workday + '</label> </div> <div style="display:none;" id="dhx_repeat_week"><input class="dhx_repeat_text" type="text" name="week_count" value="1" style="display:none"/> ' + scheduler.locale.labels.week_next_days + ':<br /> <table class="dhx_repeat_days"> <tr> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="1" />' + scheduler.locale.date.day_full[1] + '</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="4" />' + scheduler.locale.date.day_full[4] + '</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="2" />' + scheduler.locale.date.day_full[2] + '</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="5" />' + scheduler.locale.date.day_full[5] + '</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="3" />' + scheduler.locale.date.day_full[3] + '</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="6" />' + scheduler.locale.date.day_full[6] + '</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="0" />' + scheduler.locale.date.day_full[0] + '</label><br /><br /> </td> </tr> </table> </div> <div id="dhx_repeat_month"> <label><input class="dhx_repeat_radio" type="radio" name="month_type" value="d" checked style="display:none"/>' + scheduler.locale.labels.repeat_at + '</label><input class="dhx_repeat_text" type="text" name="month_day" value="1" />' + scheduler.locale.labels.day + ' ' + scheduler.locale.labels.every + '<input class="dhx_repeat_text" type="text" name="month_count" value="1" style="display:none"/> ' + scheduler.locale.labels.month + '<br /> <label style="display:none"><input class="dhx_repeat_radio" type="radio" name="month_type" value="w" style="display:none"/>' + scheduler.locale.labels.on + '</label><input class="dhx_repeat_text" type="text" name="month_week2" value="1" style="display:none"/><select name="month_day2" style="display:none"><option value="1" selected >' + scheduler.locale.date.day_full[1] + '<option value="2">' + scheduler.locale.date.day_full[2] + '<option value="3">' + scheduler.locale.date.day_full[3] + '<option value="4">' + scheduler.locale.date.day_full[4] + '<option value="5">' + scheduler.locale.date.day_full[5] + '<option value="6">' + scheduler.locale.date.day_full[6] + '<option value="0">' + scheduler.locale.date.day_full[0] + '</select><!--' + scheduler.locale.labels.every + '--><input class="dhx_repeat_text" type="text" name="month_count2" value="1" style="display:none"/><!--' + scheduler.locale.labels.month + '--><br /> </div> <div style="display:none;" id="dhx_repeat_year"> <label><input class="dhx_repeat_radio" type="radio" name="year_type" value="d" checked style="display:none"/>' + scheduler.locale.labels.every_BF + '</label><input class="dhx_repeat_text" type="text" name="year_day" value="1" />' + scheduler.locale.labels.day_at_month + '<select name="year_month"><option value="0" selected >' + scheduler.locale.date.month_full[0] + '<option value="1">' + scheduler.locale.date.month_full[1] + '<option value="2">' + scheduler.locale.date.month_full[2] + '<option value="3">' + scheduler.locale.date.month_full[3] + '<option value="4">' + scheduler.locale.date.month_full[4] + '<option value="5">' + scheduler.locale.date.month_full[5] + '<option value="6">' + scheduler.locale.date.month_full[6] + '<option value="7">' + scheduler.locale.date.month_full[7] + '<option value="8">' + scheduler.locale.date.month_full[8] + '<option value="9">' + scheduler.locale.date.month_full[9] + '<option value="10">' + scheduler.locale.date.month_full[10] + '<option value="11">' + scheduler.locale.date.month_full[11] + '</select>' + scheduler.locale.labels.month + '<br /> <label style="display:none"><input class="dhx_repeat_radio" type="radio" name="year_type" value="w" style="display:none"/>' + scheduler.locale.labels.on + '</label><input class="dhx_repeat_text" type="text" name="year_week2" value="1" style="display:none"/><select name="year_day2" style="display:none"><option value="1" selected >' + scheduler.locale.date.day_full[1] + '<option value="2">' + scheduler.locale.date.day_full[2] + '<option value="3">' + scheduler.locale.date.day_full[3] + '<option value="4">' + scheduler.locale.date.day_full[4] + '<option value="5">' + scheduler.locale.date.day_full[5] + '<option value="6">' + scheduler.locale.date.day_full[6] + '<option value="7">' + scheduler.locale.date.day_full[0] + '</select><!--of--><select name="year_month2" style="display:none"><option value="0" selected >' + scheduler.locale.date.month_full[0] + '<option value="1">' + scheduler.locale.date.month_full[1] + '<option value="2">' + scheduler.locale.date.month_full[2] + '<option value="3">' + scheduler.locale.date.month_full[3] + '<option value="4">' + scheduler.locale.date.month_full[4] + '<option value="5">' + scheduler.locale.date.month_full[5] + '<option value="6">' + scheduler.locale.date.month_full[6] + '<option value="7">' + scheduler.locale.date.month_full[7] + '<option value="8">' + scheduler.locale.date.month_full[8] + '<option value="9">' + scheduler.locale.date.month_full[9] + '<option value="10">' + scheduler.locale.date.month_full[10] + '<option value="11">' + scheduler.locale.date.month_full[11] + '</select><br /> </div> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_right"> <label><input class="dhx_repeat_radio" type="radio" name="end" checked/>' + scheduler.locale.labels.no_end_date + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />' + scheduler.locale.labels.after + '</label><input class="dhx_repeat_text" type="text" name="occurences_count" value="1" />' + scheduler.locale.labels.occurrences + '<br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />' + scheduler.locale.labels.end_by + '</label><input class="dhx_repeat_date" type="text" name="date_of_end" value="' + scheduler.config.repeat_date_of_end + '" /><br /> </div> </form> </div> <div style="clear:both"> </div>';
				/*redefine recurring*/
			}
			init();
		}
	);
}
getTranslations(webMI.query.language);
function setCurrentRecurringTemplate(){
	scheduler.__recurring_template = '<div class="dhx_form_repeat"> <form> <div class="dhx_repeat_left"> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="day" />' + scheduler.locale.labels.daily + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="week"/>' + scheduler.locale.labels.weekly + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="month" checked />' + scheduler.locale.labels.monthly + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="year" />' + scheduler.locale.labels.yearly + '</label> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_center"> <div style="display:none;" id="dhx_repeat_day"> <label><input class="dhx_repeat_radio" type="radio" name="day_type" value="d"/>' + scheduler.locale.labels.every_BF + '</label><input class="dhx_repeat_text" type="text" name="day_count" value="1" style="display:none"/> ' + scheduler.locale.labels.day + '<br /> <label><input class="dhx_repeat_radio" type="radio" name="day_type" checked value="w"/>' + scheduler.locale.labels.every_BF + ' ' + scheduler.locale.labels.workday + '</label> </div> <div style="display:none;" id="dhx_repeat_week"><input class="dhx_repeat_text" type="text" name="week_count" value="1" style="display:none"/> ' + scheduler.locale.labels.week_next_days + ':<br /> <table class="dhx_repeat_days"> <tr> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="1" />' + scheduler.locale.date.day_full[1] + '</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="4" />' + scheduler.locale.date.day_full[4] + '</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="2" />' + scheduler.locale.date.day_full[2] + '</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="5" />' + scheduler.locale.date.day_full[5] + '</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="3" />' + scheduler.locale.date.day_full[3] + '</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="6" />' + scheduler.locale.date.day_full[6] + '</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="0" />' + scheduler.locale.date.day_full[0] + '</label><br /><br /> </td> </tr> </table> </div> <div id="dhx_repeat_month"> <label><input class="dhx_repeat_radio" type="radio" name="month_type" value="d" checked style="display:none"/>' + scheduler.locale.labels.repeat_at + '</label><input class="dhx_repeat_text" type="text" name="month_day" value="1" />' + scheduler.locale.labels.day + ' ' + scheduler.locale.labels.every + '<input class="dhx_repeat_text" type="text" name="month_count" value="1" style="display:none"/> ' + scheduler.locale.labels.month + '<br /> <label style="display:none"><input class="dhx_repeat_radio" type="radio" name="month_type" value="w" style="display:none"/>' + scheduler.locale.labels.on + '</label><input class="dhx_repeat_text" type="text" name="month_week2" value="1" style="display:none"/><select name="month_day2" style="display:none"><option value="1" selected >' + scheduler.locale.date.day_full[1] + '<option value="2">' + scheduler.locale.date.day_full[2] + '<option value="3">' + scheduler.locale.date.day_full[3] + '<option value="4">' + scheduler.locale.date.day_full[4] + '<option value="5">' + scheduler.locale.date.day_full[5] + '<option value="6">' + scheduler.locale.date.day_full[6] + '<option value="0">' + scheduler.locale.date.day_full[0] + '</select><!--' + scheduler.locale.labels.every + '--><input class="dhx_repeat_text" type="text" name="month_count2" value="1" style="display:none"/><!--' + scheduler.locale.labels.month + '--><br /> </div> <div style="display:none;" id="dhx_repeat_year"> <label><input class="dhx_repeat_radio" type="radio" name="year_type" value="d" checked style="display:none"/>' + scheduler.locale.labels.every_BF + '</label><input class="dhx_repeat_text" type="text" name="year_day" value="1" />' + scheduler.locale.labels.day_at_month + '<select name="year_month"><option value="0" selected >' + scheduler.locale.date.month_full[0] + '<option value="1">' + scheduler.locale.date.month_full[1] + '<option value="2">' + scheduler.locale.date.month_full[2] + '<option value="3">' + scheduler.locale.date.month_full[3] + '<option value="4">' + scheduler.locale.date.month_full[4] + '<option value="5">' + scheduler.locale.date.month_full[5] + '<option value="6">' + scheduler.locale.date.month_full[6] + '<option value="7">' + scheduler.locale.date.month_full[7] + '<option value="8">' + scheduler.locale.date.month_full[8] + '<option value="9">' + scheduler.locale.date.month_full[9] + '<option value="10">' + scheduler.locale.date.month_full[10] + '<option value="11">' + scheduler.locale.date.month_full[11] + '</select>' + scheduler.locale.labels.month + '<br /> <label style="display:none"><input class="dhx_repeat_radio" type="radio" name="year_type" value="w" style="display:none"/>' + scheduler.locale.labels.on + '</label><input class="dhx_repeat_text" type="text" name="year_week2" value="1" style="display:none"/><select name="year_day2" style="display:none"><option value="1" selected >' + scheduler.locale.date.day_full[1] + '<option value="2">' + scheduler.locale.date.day_full[2] + '<option value="3">' + scheduler.locale.date.day_full[3] + '<option value="4">' + scheduler.locale.date.day_full[4] + '<option value="5">' + scheduler.locale.date.day_full[5] + '<option value="6">' + scheduler.locale.date.day_full[6] + '<option value="7">' + scheduler.locale.date.day_full[0] + '</select><!--of--><select name="year_month2" style="display:none"><option value="0" selected >' + scheduler.locale.date.month_full[0] + '<option value="1">' + scheduler.locale.date.month_full[1] + '<option value="2">' + scheduler.locale.date.month_full[2] + '<option value="3">' + scheduler.locale.date.month_full[3] + '<option value="4">' + scheduler.locale.date.month_full[4] + '<option value="5">' + scheduler.locale.date.month_full[5] + '<option value="6">' + scheduler.locale.date.month_full[6] + '<option value="7">' + scheduler.locale.date.month_full[7] + '<option value="8">' + scheduler.locale.date.month_full[8] + '<option value="9">' + scheduler.locale.date.month_full[9] + '<option value="10">' + scheduler.locale.date.month_full[10] + '<option value="11">' + scheduler.locale.date.month_full[11] + '</select><br /> </div> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_right"> <label><input class="dhx_repeat_radio" type="radio" name="end" checked/>' + scheduler.locale.labels.no_end_date + '</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />' + scheduler.locale.labels.after + '</label><input class="dhx_repeat_text" type="text" name="occurences_count" value="1" />' + scheduler.locale.labels.occurrences + '<br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />' + scheduler.locale.labels.end_by + '</label><input class="dhx_repeat_date" type="text" name="date_of_end" value="' + scheduler.config.repeat_date_of_end + '" /><br /> </div> </form> </div> <div style="clear:both"> </div>';
}
