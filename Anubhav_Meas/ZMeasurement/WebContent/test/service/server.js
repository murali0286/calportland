sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";

	return {

		init: function() {

			// enable 'mock' variant management
			jQuery.sap.require("sap.ui.fl.FakeLrepConnector");
			sap.ui.fl.FakeLrepConnector.enableFakeConnector("./test/service/component-test-changes.json");

			// createhttp://glnnwgwqas.calportland.com:8000/sap/opu/odata/sap/Z_MEASUREMENT_DOCUMENT/
			var oMockServer = new MockServer({
				rootUri: "/sap/opu/odata/sap/Z_MEASUREMENT_DOCUMENTS_SRV/"
			});

			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 1000
			});

			// simulate
			var sPath = jQuery.sap.getModulePath("calportland.test.service");
			oMockServer.simulate(sPath + "/metadata.xml", sPath);

			// handle suggest in input fields (OData search query)
			oMockServer.attachAfter(sap.ui.core.util.MockServer.HTTPMETHOD.GET, function(oEvent) {
				var oXhr = oEvent.getParameter("oXhr");
				var aResultFiltered = [];
				var fGetUriParameter = function(sUri, sKey) {
					var sValue = "";
					var aParams = decodeURIComponent(sUri).replace("?", "&").split("&");
					aParams.some(function(sPairs) {
						if (sKey === sPairs.split("=")[0]) {
							sValue = sPairs.split("=")[1];
							return true;
						}
					});
					return sValue;
				};
				var sSearchText = fGetUriParameter(oXhr.url, "search");
				if (sSearchText) {
					var aResults = oEvent.getParameter("oFilteredData").results;
					aResults.forEach(function(oEntry) {
						if (JSON.stringify(oEntry).indexOf(sSearchText) > -1) {
							aResultFiltered.push(oEntry);
						}
					});
					oEvent.getParameter("oFilteredData").results = aResultFiltered;
				}
			});

			console.log("Mock server starts...");
			// start
			oMockServer.start();
		}
	};

});
