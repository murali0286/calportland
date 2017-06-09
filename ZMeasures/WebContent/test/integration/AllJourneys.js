jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");

jQuery.sap.require("calportland.measure.test.integration.pages.Common");
jQuery.sap.require("calportland.measure.test.integration.pages.Worklist");
jQuery.sap.require("calportland.measure.test.integration.pages.Object");
jQuery.sap.require("calportland.measure.test.integration.pages.NotFound");
jQuery.sap.require("calportland.measure.test.integration.pages.Browser");
jQuery.sap.require("calportland.measure.test.integration.pages.App");

sap.ui.test.Opa5.extendConfig({
	arrangements: new calportland.measure.test.integration.pages.Common(),
	viewNamespace: "calportland.measure.view."
});

// Start the tests
jQuery.sap.require("calportland.measure.test.integration.WorklistJourney");
jQuery.sap.require("calportland.measure.test.integration.ObjectJourney");
jQuery.sap.require("calportland.measure.test.integration.NavigationJourney");
jQuery.sap.require("calportland.measure.test.integration.NotFoundJourney");
jQuery.sap.require("calportland.measure.test.integration.FLPIntegrationJourney");