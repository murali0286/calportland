jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Orders in the list

sap.ui.require([
	"sap/ui/test/Opa5",
	"calportland/workorder/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"calportland/workorder/test/integration/pages/App",
	"calportland/workorder/test/integration/pages/Browser",
	"calportland/workorder/test/integration/pages/Master",
	"calportland/workorder/test/integration/pages/Detail",
	"calportland/workorder/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "calportland.workorder.view."
	});

	sap.ui.require([
		"calportland/workorder/test/integration/MasterJourney",
		"calportland/workorder/test/integration/NavigationJourney",
		"calportland/workorder/test/integration/NotFoundJourney",
		"calportland/workorder/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});