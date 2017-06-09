sap.ui.define([ "sap/ui/core/mvc/Controller" ], 
		function(Controller) {
	"use strict";

	return Controller.extend("labor.charge.controllers.Main", {
	
		/**
		* Called when a controller is instantiated and its View controls (if available) are already created.
		* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		* @memberOf Main
		*/
			onInit: function() {
				jQuery.sap.require("sap.m.MessageToast");
				
				
			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		* @memberOf Main
		* 
		*/
//			onBeforeRendering: function() {
		//
//			},
		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		* @memberOf Main
		*/
			onSearchValidation: function(oEvent){
				
				var workCtr = oEvent.getParameters()[0].selectionSet[1];
				var costCtr = oEvent.getParameters()[0].selectionSet[2];
				if(workCtr.getSelectedKey() === "" && costCtr.getSelectedKey() === ""){
					/*sap.m.MessageBox.error("Fill in atleast one of the required fields", {
					    title: "Error",                                      // default
					    });
					workCtr.setValueState(sap.ui.core.ValueState.Error);
					costCtr.setValueState(sap.ui.core.ValueState.Error);
					*/
					workCtr.setValueState(sap.ui.core.ValueState.None);
					costCtr.setValueState(sap.ui.core.ValueState.None);
				}
				/*else{
					workCtr.setValueState(sap.ui.core.ValueState.None);
					costCtr.setValueState(sap.ui.core.ValueState.None);
				}*/
			},
			onBack: function(){
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				oCrossAppNavigator.toExternal({
				                      target: { semanticObject : "#"}
				                     });
			},
				
			onSubmit: function(oEvent){
				
				var oModel = this.getView().getModel();
				var oTable = this.getView().byId("smartTable");
				var	laborChangeCode = "";
			//	debugger;
				for (var i = 0; i <= oTable.getRows().length - 1; i++) {
					if(oTable.getRows()[i].getCells()[0].getSelected() === true){
						laborChangeCode = oTable.getRows()[i].getCells()[1].getText();
						break;
					}
				}

				var payload = {
						"Trancode": "CHG_U_LCC",
						"Sfcno": laborChangeCode
					};
				
				var fnErrorDetail = function(oError) {
					jQuery.sap.log.info(oError);
					this._showErrorMsg(oError);
				};
				var that = this;
				oModel.create("/timeCardSet", payload, {
					success: function(oMsg){
						sap.m.MessageToast.show("Labor charge code sent to timecard");
						that.onBack();
					},
					error: jQuery.proxy(fnErrorDetail, this)
				});
			},
			_showErrorMsg: function(oError, oView) { 
				var sMsg = "";
				if (oError.statusText) {
					sMsg = oError.statusText + " - " + oError.statusCode;
				} else {
					sMsg = oError.message;
				} 
				try {
					if (jQuery.parseXML(oError.responseText)) {
					}
				} catch (err) {
					try {
						if (jQuery.parseJSON(oError.responseText)) {
							var parsedMsg = JSON.parse(oError.responseText, function(k, v) {
								//console.log(k);
								  return v; 
							});
							sMsg = parsedMsg.error.message.value;
						}
					} catch (e) {
					}
				}
				if(sMsg === undefined || sMsg === "") {
					sMsg = "Submit is failed";
				}
				sap.m.MessageBox.error(sMsg, {
				    title: "Error",                                      // default
				    onClose: null,                                        // default
				    styleClass: "" ,                                      // default
				    initialFocus: null ,                                  // default
				    textDirection: sap.ui.core.TextDirection.Inherit     // default
				    });

			},
			ClockIn: function(oEvent){
				
				var oModel = this.getView().getModel();
				var payload = {
						"Trancode": "CLOCKIN"
					};
				var fnErrorDetail = function(oError) {
					jQuery.sap.log.info(oError);
					this._showErrorMsg(oError);
				};
				oModel.create("/timeCardSet", payload, {
					success: function(oMsg){
						sap.m.MessageToast.show("Clock-in sent to timecard");
					},
					error: jQuery.proxy(fnErrorDetail, this)
				});
				
			},
			ClockOut: function(oEvent){
				
				var oModel = this.getView().getModel();
				var payload = {
						"Trancode": "CLOCKOUT"
					};
				var fnErrorDetail = function(oError) {
					jQuery.sap.log.info(oError);
					this._showErrorMsg(oError);
				};
				var that = this;
				oModel.create("/timeCardSet", payload, {
					success: function(oMsg){
						sap.m.MessageToast.show("Clock-out sent to timecard");
						that.onBack();
					},
					error: jQuery.proxy(fnErrorDetail, this)
				});
			},
			onFiltersChanged: function(oEvent){
				//debugger;
				if (oEvent.getParameters().getSource().getId() === "__box1" || oEvent.getParameters().getSource().getId() === "__box2"){
					sap.ui.getCore().byId("__box1").setValueState(sap.ui.core.ValueState.None);
					sap.ui.getCore().byId("__box2").setValueState(sap.ui.core.ValueState.None);
				}
				
				if (oEvent.getParameters().getSource().getId() === "__box0"){
					var sel = oEvent.getParameters().getSource().getValue();
					var re = /\((.*)\)/;
					sel = sel.match(re)[1];
					sap.ui.getCore().byId("__box1").getBinding("items").filter(new sap.ui.model.Filter("Werks",sap.ui.model.FilterOperator.EQ,sel));
					sap.ui.getCore().byId("__box2").getBinding("items").filter(new sap.ui.model.Filter("Werks",sap.ui.model.FilterOperator.EQ,sel));
				}
			},
		
		
	})
});