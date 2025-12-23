/**
 * Create Dialogs
 * A little helper class
 *
 * @constructor
 * @private
 */
var SlickDialogs = function () {

	/**
	 * returning the dialogs
	 * @returns {Array}
	 */
	this.getDialogs = function () {

		/* dialog for continuation warnings */
		dialogs = [];
		dialogs.continuation = [];
		dialogs.continuation.search = function (language) {
			var parameter = [];
			parameter.display = "SYSTEM.LIBRARY.ATVISE.OBJECTDISPLAYS.Advanced.dialogs.message_dialog";
			parameter.headline = _translate("Warnung: Sortierung unvollständig!", language);
			parameter.msg1 = _translate("Für ein vollständiges Sortierergebnis", language);
			parameter.msg2 = _translate("muss die Datenabfrage abgeschlossen sein!", language);
			parameter.btn1 = _translate("Ok", language);
			// parameter.btn2			= "T{Abfrage Stoppen}";
			// parameter.action_btn2	= "triggerStopRequests";
			return parameter;
		}
		/* dialog for continuation warnings */
		dialogs.continuation.filter = function (language) {
			var parameter = [];
			parameter.display = "SYSTEM.LIBRARY.ATVISE.OBJECTDISPLAYS.Advanced.dialogs.message_dialog";
			parameter.headline = _translate("Warnung: Filterung unvollständig!", language);
			parameter.msg1 = _translate("Für eine vollständige Filterung", language);
			parameter.msg2 = _translate("muss die Datenabfrage abgeschlossen sein!", language);
			parameter.btn1 = _translate("Ok", language);
			// parameter.btn2			= "T{Abfrage Stoppen}";
			// parameter.action_btn2	= "triggerStopRequests";
			return parameter;
		}

		/* dialog for sorting warnings ie11 or other slow browser */
		dialogs.sorting = [];
		dialogs.sorting.running = function (language) {
			var parameter = [];
			parameter.display = "SYSTEM.LIBRARY.ATVISE.OBJECTDISPLAYS.Advanced.dialogs.message_dialog";
			parameter.headline = _translate("Sortierung läuft!", language);
			parameter.msg1 = _translate("Der Browser sortiert die abgefragten Daten.", language);
			parameter.msg2 = _translate("Je nach Datenmenge kann dies einige Zeit in Anspruch nehmen!", language);
			parameter.btn1 = _translate("Ok", language);
			// parameter.btn2			= "T{Abfrage Stoppen}";
			// parameter.action_btn2	= "triggerStopRequests";
			return parameter;
		}

		/* dialog for trigger warnings */
		dialogs.triggered = [];
		dialogs.triggered.search = function (language) {
			var parameter = [];
			parameter.display = "SYSTEM.LIBRARY.ATVISE.OBJECTDISPLAYS.Advanced.dialogs.message_dialog";
			parameter.headline = _translate("Warnung: Sortierung unvollständig!", language);
			parameter.msg1 = _translate("Für ein vollständiges Sortierergebnis", language);
			parameter.msg2 = _translate("muss die Datenabfrage abgeschlossen sein!", language);
			parameter.btn1 = _translate("Ok", language);
			parameter.btn2 = _translate("Restliche Daten abfragen!", language);
			parameter.action_btn2 = "triggerForceRequests";
			return parameter;
		}
		/* dialog for trigger warnings */
		dialogs.triggered.filter = function (language) {
			var parameter = [];
			parameter.display = "SYSTEM.LIBRARY.ATVISE.OBJECTDISPLAYS.Advanced.dialogs.message_dialog";
			parameter.headline = _translate("Warnung: Filterung unvollständig!", language);
			parameter.msg1 = _translate("Für eine vollständige Filterung", language);
			parameter.msg2 = _translate("muss die Datenabfrage abgeschlossen sein!", language);
			parameter.btn1 = _translate("Ok", language);
			parameter.btn2 = _translate("Restliche Daten abfragen!", language);
			parameter.action_btn2 = "triggerForceRequests";
			return parameter;
		}

		return dialogs
	}

	/**
	 * simple translation
	 * @param value
	 * @param lang
	 * @returns {*}
	 * @private
	 */
	_translate = function (value, lang) {
		if (lang == "de") {
			return value;
		}
		if (lang == "en") {
			if (value == "Ok") return "Ok";
			if (value == "Restliche Daten abfragen!") return "Check remaining data!";
			if (value == "Warnung: Filterung unvollständig!") return "Warning: filtering incomplete!";
			if (value == "Warnung: Sortierung unvollständig!") return "Warning: Sorting incomplete!";
			if (value == "Für ein vollständiges Sortierergebnis") return "For a complete sort result,";
			if (value == "muss die Datenabfrage abgeschlossen sein!") return "the data query must be completed!";
			if (value == "Für eine vollständige Filterung") return "For complete filtering,";
			if (value == "muss die Datenabfrage abgeschlossen sein!") return "the data query must be completed!";
			if (value == "Sortierung läuft!") return "Sorting is running!";
			if (value == "Der Browser sortiert die abgefragten Daten.") return "The browser sorts the queried data."
			if (value == "Je nach Datenmenge kann dies einige Zeit in Anspruch nehmen!") return "Depending on the amount of data, this can take some time!";
		}
		return value;
	}
}