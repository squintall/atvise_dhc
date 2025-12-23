/**
 * Override the lightbox feature to ensure proper zoom management in a Cromium-based browser
 * @returns {HTMLElement | null}
 * @private
 */
scheduler._get_lightbox = function () {
	if (!this._lightbox) {
		var a = document.createElement("DIV");
		a.className = "dhx_cal_light";

		// mod AT-D-15967 for chromeium browsers zoom mode
		a.id = "scheduler_here_box";

		if (webMI.getConfig("frame.scaletype") == "zoom") {

			setTimeout(function () {
				function setZoom() {
					var parElement = window.document.getElementById("scheduler_here");
					var divElement = window.document.getElementById("scheduler_here_box");
					divElement.style.zoom = parElement.style.zoom;
				}

				window.addEventListener("resize", setZoom, false);
				window.addEventListener("load", setZoom, false);
			}, 125);
		}

		scheduler.config.wide_form && (a.className += " dhx_cal_light_wide");
		scheduler.form_blocks.recurring && (a.className += " dhx_cal_light_rec");
		/msie|MSIE 6/.test(navigator.userAgent) && (a.className += " dhx_ie6");
		a.style.visibility = "hidden";
		var b = this._lightbox_template, c = this.config.buttons_left;
		scheduler.locale.labels.dhx_save_btn = scheduler.locale.labels.icon_save;
		scheduler.locale.labels.dhx_cancel_btn =
			scheduler.locale.labels.icon_cancel;
		scheduler.locale.labels.dhx_delete_btn = scheduler.locale.labels.icon_delete;
		for (var d = 0; d < c.length; d++) b += "<div class='dhx_btn_set'><div dhx_button='1' class='" + c[d] + "'></div><div>" + scheduler.locale.labels[c[d]] + "</div></div>";
		c = this.config.buttons_right;
		for (d = 0; d < c.length; d++) b += "<div class='dhx_btn_set' style='float:right;'><div dhx_button='1' class='" + c[d] + "'></div><div>" + scheduler.locale.labels[c[d]] + "</div></div>";
		b += "</div>";
		a.innerHTML = b;
		if (scheduler.config.drag_lightbox) a.firstChild.onmousedown =
			scheduler._ready_to_dnd, a.firstChild.onselectstart = function () {
			return !1
		}, a.firstChild.style.cursor = "pointer", scheduler._init_dnd_events();
		document.body.insertBefore(a, document.body.firstChild);
		this._lightbox = a;
		for (var e = this.config.lightbox.sections, b = "", d = 0; d < e.length; d++) {
			var f = this.form_blocks[e[d].type];
			if (f) {
				e[d].id = "area_" + this.uid();
				var g = "";
				e[d].button && (g = "<div class='dhx_custom_button' index='" + d + "'><div class='dhx_custom_button_" + e[d].button + "'></div><div>" + this.locale.labels["button_" +
				e[d].button] + "</div></div>");
				this.config.wide_form && (b += "<div class='dhx_wrap_section'>");
				b += "<div id='" + e[d].id + "' class='dhx_cal_lsection'>" + g + this.locale.labels["section_" + e[d].name] + "</div>" + f.render.call(this, e[d]);
				b += "</div>"
			}
		}
		var h = a.getElementsByTagName("div");
		h[1].innerHTML = b;
		this.setLightboxSize();
		this._init_lightbox_events(this);
		a.style.display = "none";
		a.style.visibility = "visible";
	}
	return this._lightbox
};

/**
 * fix position for browser using zoom
 * AT-D-15967
 */
scheduler.attachEvent("onLightbox", function (id) {
	if (webMI.getConfig("frame.scaletype") == "zoom") {
		let divElement = window.document.getElementById("scheduler_here_box");
		divElement.style.zoom = webMI.gfx.getAbsoluteScaleFactor(true);
		divElement.style.top = "65px";
		divElement.style.left = "65px";
	}
	return true;
});
