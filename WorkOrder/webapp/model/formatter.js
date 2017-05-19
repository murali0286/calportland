sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(2);
			},

			status : function(sStatus) {
                if (sStatus === "Open") {
                    return "Warning";
                } else if (sStatus === "Assigned") {
                    return "Success";
                } else if (sStatus === "InProgress"){
                    return "Success";
                } else if(sStatus === "Closed"){
                    return "None";
                }
			}
		};

	}
);