sap.ui.define([
    "calportland/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "calportland/model/formatter"
], function (BaseController, JSONModel, MessageToast, ValueState, MessageBox, Filter, FilterOperator, formatter) {

    "use strict";
    return BaseController.extend("calportland.controllers.MainNew", {

        formatter: formatter,
        onInit: function () {
            //To maintain the application state changes
            this._oViewModel = new JSONModel({
                EquipmentSelectedFromSuggestionList: false,
                Equipments: [], //Autocomplete Data
                CurrentData: this._getDefaultMeasurementData(), // Form Data
                SavedData: [] // Table Data
            });
            this.setModel(this._oViewModel, "ViewModel");

            //Once the metadata loaded, update suggestion list with Equipment details
            this.getOwnerComponent().getModel().metadataLoaded().then(function (data) {
                this.getModel().read("/EquipmentCollection", {
                    success: function (data) {
                        this._oViewModel.setProperty("/Equipments", data.results);
                    }.bind(this)
                });
            }.bind(this));
        },

        onSave: function (oEvent) {
            console.log(this._oViewModel.getData());
            var oCurrentData = this._oViewModel.getProperty("/CurrentData");
            var oEquipmentNumber = this.getView().byId("EquipmentDetails") || this.byId("EquipmentDetails");
            var oReadingValue = this.getView().byId("ReadingValue") || this.byId("ReadingValue");
            var oReadingDate = this.getView().byId("ReadingDate") || this.byId("ReadingDate");
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            var isFormValid = true;

            var oDoc = this._getDefaultMeasurementData();
            oDoc.MeasurementPointId = oCurrentData.MeasurementPointId;
            //Validate Equipment Number
            if(oCurrentData.EquipmentId) {
                oDoc.EquipmentId = oCurrentData.EquipmentId
            } else {
                oEquipmentNumber.setValueState("Error");
                oEquipmentNumber.setValueStateText("Please select any one equipment from the list of suggested equipments");
                oEquipmentNumber.focus();
                isFormValid = false;
            }
            // Validate Reading Value
            if(oCurrentData.ReadingValue) {
                oDoc.Value = oCurrentData.ReadingValue;
            } else {
                oReadingValue.setValueState("Error");
                oReadingValue.setValueStateText("Please enter a numberic value greater than 0");
                oReadingValue.focus();
                isFormValid = false;
            }
            //Validate Reading Time
            if(oCurrentData.ReadingDate && Date.parse(oCurrentData.ReadingDate)) {
                oDoc.MeasurementDate = oCurrentData.ReadingDate;
            } else {
                oReadingDate.setValueState("Error");
                oReadingDate.setValueStateText("Please enter a valid Date & Time");
                oReadingDate.focus();
                isFormValid = false;
            }

            if(isFormValid) {
                this.createMeasurementDocs(oDoc);
            } else {
                MessageToast.show("Please correct the highlighted error and try again");
                oSaveButton.setEnabled(false);
            }

        },

        onSuggesstionItemSelected: function (oEvent) {
            this._oViewModel.setProperty("/CurrentData/MeasurementPointId", oEvent.getParameter("selectedItem").getKey());
        },

        validateEquipmentEntry: function (oEvent) {
            var oSource = oEvent.getSource();
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            var iEquipmentValue = oSource.getProperty("value") || "";
            if (iEquipmentValue.length > 0) {
                oSource.setValueState("Success");
                oSource.setValueStateText("");
                oSaveButton.setEnabled(true);
            } else {
                oSource.setValueState("Error");
                oSource.setValueStateText("Please select any one equipment from the list of suggested equipments");
                oSource.focus();
                oSaveButton.setEnabled(false);
            }
        },
        validateReadingValue: function (oEvent) {
            var oSource = oEvent.getSource();
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            var iReadingValue = oSource.getProperty("value") || 0;
            if (iReadingValue && !isNaN(iReadingValue) && iReadingValue > 0) {
                oSource.setValueState("Success");
                oSource.setValueStateText("");
                oSaveButton.setEnabled(true);
            } else {
                oSource.setValueState("Error");
                oSource.setValueStateText("Please enter a numberic value greater than 0");
                oSource.focus();
                oSaveButton.setEnabled(false);
            }
        },
        validateDate: function (oEvent) {
            var oSource = oEvent.getSource();
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            if (oEvent.getParameter("newValue") && oEvent.getParameter("valid")) {
                oSource.setValueState("Success");
                oSource.setValueStateText("");
                oSaveButton.setEnabled(true);
            } else {
                oSource.setValueState("Error");
                oSource.setValueStateText("Please enter a valid Date");
                oSource.focus();
                oSaveButton.setEnabled(false);
            }
        },
        validateTime: function (oEvent) {
            var oSource = oEvent.getSource();
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            if (oEvent.getParameter("newValue") && oEvent.getParameter("valid")) {
                oSource.setValueState("Success");
                oSource.setValueStateText("");
                oSaveButton.setEnabled(true);
            } else {
                oSource.setValueState("Error");
                oSource.setValueStateText("Please enter a valid Time");
                oSource.focus();
                oSaveButton.setEnabled(false);
            }
        },
        handleSuggest: function (oEvent) {
            var iTotalItems = 0;
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            var oEquipmentDetails = this.getView().byId("EquipmentDetails") || this.byId("EquipmentDetails");
            oEquipmentDetails.setFilterFunction(function (sTerm, oItem) {
                if (iTotalItems >= 10) {
                    return false;
                } else {
                    iTotalItems++;
                    return oItem.getText().match(new RegExp(sTerm, "i")) ||
                        oItem.getAdditionalText().match(new RegExp(sTerm, "i"));
                }
            });
        },

        createMeasurementDocs: function (oDoc) {
            var that = this;
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            oSaveButton.setBusy(true);

            this.getModel().create("/MeasurementDocs", oDoc, {
                success: function (data) {
                    oSaveButton.setBusy(false);
                    console.log(data);
                    MessageToast.show("Success");
                    that._oViewModel.setProperty("/CurrentData/Status", "Success");

                    var oCurrentData = that._oViewModel.getProperty("/CurrentData");
                    var aSavedData = that._oViewModel.getProperty("/SavedData");
                    aSavedData.push(oCurrentData);

                    that._oViewModel.setProperty("/SavedData", aSavedData);
                    that._oViewModel.setProperty("/CurrentData", that._getDefaultMeasurementData());
                    that._resetForm();
                },
                error: function (error) {
                    oSaveButton.setBusy(false);
                    console.log(err);
                    that._oViewModel.setProperty("/CurrentData/Status", "Failed");
                }
            })
        },
        _resetForm : function(){
            var oEquipmentNumber = this.getView().byId("EquipmentDetails") || this.byId("EquipmentDetails");
            var oReadingValue = this.getView().byId("ReadingValue") || this.byId("ReadingValue");
            var oReadingDate = this.getView().byId("ReadingDate") || this.byId("ReadingDate");
            var oReadingTime = this.getView().byId("oReadingTime") || this.byId("oReadingTime");
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");

            oEquipmentNumber.setValueState("None");
            oEquipmentNumber.setValueStateText("");

            oReadingValue.setValueState("None");
            oReadingValue.setValueStateText("");

            oReadingDate.setValueState("None");
            oReadingDate.setValueStateText("");

            oReadingTime.setValueState("None");
            oReadingTime.setValueStateText("");

            oSaveButton.setEnabled(true);
        },
        _getDefaultMeasurementData: function () {
            var oDate = new Date();
            return {
                ReadingDate: oDate,
                ReadingTime: oDate,
                ReadingType: "Odometer",
                EquipmentId: "",
                ReadingValue: 0,
                MeasurementPointId: ""
            }
        },
        _getMeasurementDocsDTO: function () {
            return {
                "MeasurementDocId": "",
                "MeasurementPointId": "",
                "MeasurementPointType": "PROCESSED TONS",
                "EquipmentId": "",
                "MeasurementDate": "",
                "MeasurementTime": "000000",
                "ReadingTakenBy": "PI HARTMAN",
                "Value": "",
                "UOM": "TON",
                "IsDifferenceReading": "",
                "ShortText": "",
                "ServiceOrderId": "",
                "ServiceOrderOperationId": ""
            }
        }
    });
});