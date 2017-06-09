sap.ui.define([
		"calportland/measure/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("calportland.measure.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);