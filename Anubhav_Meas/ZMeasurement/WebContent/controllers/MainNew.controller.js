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
            this.getView().setBusyIndicatorDelay(0);
            this.getView().setBusy(true);
            //To maintain the application state changes
            this._oViewModel = new JSONModel({
                EquipmentSelectedFromSuggestionList: false,
                GasStations: [], //Autocomplete Data
                FuelTypes: [], // Default value
                Equipments: [],
                CurrentData: this._getDefaultMeasurementData(), // Form Data
                SavedData: [] // Table Data
            });
            this.setModel(this._oViewModel, "ViewModel");

            //Once the metadata loaded, update suggestion list with Equipment details
            this.getOwnerComponent().getModel().metadataLoaded().then(function (data) {
                this.getModel().read("/StationSet", {
                    // urlParameters: {
                    //     "$expand": "StationToFuel"
                    // },
                    success: function (data) {
                        this._oViewModel.setProperty("/GasStations", data.results);

                        //Calling the Fuel Type for the first station set
                        var sStation = data.results[0].Stations;
                        this.getModel().read("/FuelTypeSet", {
                            filters: [new Filter("Station", sap.ui.model.FilterOperator.EQ, sStation)],
                            success: function (data) {
                                this._setPreselectFuelType(data);
                                this._oViewModel.setProperty("/FuelTypes", data.results);
                                this.getView().setBusy(false);
                            }.bind(this)
                        });
                    }.bind(this)
                });
                this.getModel().read("/EquipmentCollection", {
                    success: function (data) {
                        this._oViewModel.setProperty("/Equipments", data.results);
                    }.bind(this)
                });
            }.bind(this));
        },

        _setPreselectFuelType: function (data) {
            try {
                var sDetaultFuelType = data.results[0].FuelTypes;
                this._oViewModel.setProperty("/CurrentData/FuelType", sDetaultFuelType);
                console.log(this._oViewModel.getProperty("/CurrentData"));
            } catch (err) {
                console.log(err)
            }

        },
        onSave: function (oEvent) {
            console.log(this._oViewModel.getData());
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            var oDoc = this._validateFormAndCreateDocumentObject();
            if (oDoc) {
                this.createMeasurementDocs(oDoc);
            } else {
                MessageToast.show("Please correct the highlighted error and try again");
                oSaveButton.setEnabled(false);
            }
        },
        onSuggesstionItemSelected: function (oEvent) {
            var sPath = oEvent.getParameter("selectedItem").getBindingContext("ViewModel").getPath();
            if (oEvent.getParameter("selectedItem").oBindingContexts != null) {
                this._oViewModel.setProperty("/CurrentData/MeasurementPointId", this._oViewModel.getProperty(sPath + "/FuelMeasPointId"));
            }

        },
        onSelectGasStation: function (oEvent) {
            var sStation = oEvent.getParameter("selectedItem").getKey();
            var sBindingPath = oEvent.getParameter("selectedItem").getBindingContext().getPath();
            this.getModel().read("/FuelTypeSet", {
                filters: [new Filter("Station", sap.ui.model.FilterOperator.EQ, sStation)],
                success: function (data) {
                    this._setPreselectFuelType(data);
                    this._oViewModel.setProperty("/FuelTypes", data.results);
                }.bind(this)
            });
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
        validateDateTime: function (oEvent) {
            var oSource = oEvent.getSource();
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");
            if (oEvent.getParameter("newValue") && oEvent.getParameter("valid")) {
                oSource.setValueState("Success");
                oSource.setValueStateText("");
                oSaveButton.setEnabled(true);
            } else {
                oSource.setValueState("Error");
                oSource.setValueStateText("Please enter a valid Date and Time");
                oSource.focus();
                oSaveButton.setEnabled(false);
            }
        },

        handleSuggest: function (oEvent) {
            var iTotalItems = 0;
            var sTerm = oEvent.getParameter("suggestValue");
            var aFilters = [];
            var oEquipmentDetails = this.getView().byId("EquipmentId") || this.byId("EquipmentId");

            var oModel = this.getView().getModel();
            oModel.setSizeLimit(10);
            var that = this;
            // oModel.read("/EquipmentCollection",{
            // 	filters: [new sap.ui.model.Filter("EquipmentId", sap.ui.model.FilterOperator.Contains,sTerm),
            // 			  new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains,sTerm)],
            // 	success: function(response){
            // 			that._oViewModel.setProperty("/Equipments", response.results);
            // 			oEquipmentDetails.setFilterFunction(function (sTerm, oItem) {
            //                 if (iTotalItems >= 10) {
            //                     return false;
            //                 } else {
            //                     iTotalItems++;
            //                     return oItem.getText().match(new RegExp(sTerm, "i")) ||
            //                         oItem.getAdditionalText().match(new RegExp(sTerm, "i"));
            //                 }
            //             });
            // 	},
            // 	error: function(response){
            // 		debugger;
            // 	}
            // });

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
        /**
         * This method returns either a document object or a boolean which is set to false
         * @param oDoc
         * @returns {boolean}
         * @private
         */
        _validateFormAndCreateDocumentObject: function (oDoc) {
            var oDoc = this._getMeasurementDocsDTO();
            var oCurrentData = this._oViewModel.getProperty("/CurrentData");
            var oGasStation = this.getView().byId("GasStation") || this.byId("GasStation");
            var oFuelType = this.getView().byId("FuelType") || this.byId("FuelType");
            var oEquipmentId = this.getView().byId("EquipmentId") || this.byId("EquipmentId");
            var oQuantity = this.getView().byId("Quantity") || this.byId("Quantity");
            var oDateTime = this.getView().byId("DateTime") || this.byId("DateTime");
            var isFormValid = true;

            //Set Measurement ID
            oDoc.MeasurementPointId = oCurrentData.MeasurementPointId;

            //Validate Gas Station
            if (oCurrentData.GasStation) {
                oDoc.GasStation = oCurrentData.GasStation;
                oGasStation.setValueState("Success");
            } else {
                oGasStation.setValueState("Error");
                oGasStation.setValueStateText("Please select any one gas Station");
                oGasStation.focus();
                isFormValid = false;
            }

            // Validate Fuel Type
            if (oCurrentData.FuelType) {
                oDoc.Value = oCurrentData.FuelType;
                oFuelType.setValueState("Success");
            } else {
                oFuelType.setValueState("Error");
                oFuelType.setValueStateText("Please select any one Fuel Station");
                oFuelType.focus();
                isFormValid = false;
            }

            //Validate Equipment Number
            if (oCurrentData.EquipmentId) {
                oDoc.EquipmentId = oCurrentData.EquipmentId;
                oEquipmentId.setValueState("Success");
            } else {
                oEquipmentId.setValueState("Error");
                oEquipmentId.setValueStateText("Please select any one equipment from the list of suggested equipments");
                oEquipmentId.focus();
                isFormValid = false;
            }

            //Validate Quantity
            if (oCurrentData.Quantity) {
                oDoc.Quantity = oCurrentData.Quantity;
                oQuantity.setValueState("Success");
            } else {
                oQuantity.setValueState("Error");
                oQuantity.setValueStateText("Please enter a quantity greater than 0");
                oQuantity.focus();
                isFormValid = false;
            }

            if (oCurrentData.DateTime && Date.parse(oCurrentData.DateTime)) {
                oDoc.MeasurementDate = oCurrentData.DateTime;
                oDateTime.setValueState("Success");
            } else {
                oDateTime.setValueState("Error");
                oDateTime.setValueStateText("Please enter a valid Date & Time");
                oDateTime.focus();
                isFormValid = false;
            }

            return isFormValid ? oDoc : isFormValid;
        },
        /**
         * Method to reset the form once the data has been saved
         * @private
         */
        _resetForm: function () {
            var oGasStation = this.getView().byId("GasStation") || this.byId("GasStation");
            var oFuelType = this.getView().byId("FuelType") || this.byId("FuelType");
            var oEquipmentId = this.getView().byId("EquipmentId") || this.byId("EquipmentId");
            var oQuantity = this.getView().byId("Quantity") || this.byId("Quantity");
            var oDateTime = this.getView().byId("DateTime") || this.byId("DateTime");
            var oSaveButton = this.getView().byId("Save") || this.byId("Save");

            oGasStation.setValueState("None");
            oGasStation.clearSelection();
            // oGasStation.setValueStateText("");
            //
            oFuelType.setValueState("None");
            oFuelType.clearSelection();
            // oFuelType.setValueStateText("");

            oEquipmentId.setValueState("None");
            oEquipmentId.setValueStateText("");

            oQuantity.setValueState("None");
            oQuantity.setValueStateText("");

            oDateTime.setValueState("None");
            oDateTime.setValueStateText("");

            oSaveButton.setEnabled(true);
        },
        /**
         * Method to get the default form data
         * @returns {{ReadingDate: Date, ReadingTime: Date, ReadingType: string, EquipmentId: string, ReadingValue: number, MeasurementPointId: string}}
         * @private
         */
        _getDefaultMeasurementData: function () {
            var oDate = new Date();
            return {
                GasStation: "",
                FuelType: "",
                EquipmentId: "",
                Quantity: 0,
                DateTime: oDate,
                MeasurementPointId: "" //Backend data
            }
        },
        _getMaterialDocumentItemDTO: function () {
            return {
                "MaterialDocumentId": "", //Type="Edm.String" Nullable="false" MaxLength="10"
                "MaterialDocumentYear": "", //Type="Edm.String" Nullable="false" MaxLength="4"
                "ItemNumber": "", //Type="Edm.String" Nullable="false" MaxLength="4"
                "MaterialId": "", //Type="Edm.String" MaxLength="18"
                "PlantId": "", //Type="Edm.String" MaxLength="4"
                "StorageLocationId": "", //Type="Edm.String" MaxLength="4"
                "MovementType": "", //Type="Edm.String" MaxLength="3"
                "Quantity": "", //Type="Edm.Decimal" Precision="13" Scale="3"
                "UOM": "TON", //Type="Edm.String"
                "CostCenterId": "", //Type="Edm.String" MaxLength="10"
                "ReceivingMaterialId": "", //Type="Edm.String" MaxLength="18"
                "ReceivingPlantId": "", //Type="Edm.String" MaxLength="4"
                "ReceivingStorageLocationId": "", //Type="Edm.String" MaxLength="4"
                "MovementIndicator": "", //Type="Edm.String" MaxLength="1"
                "ProfitCenterId": "", //Type="Edm.String" MaxLength="10"
                "WbsElement": "", //Type="Edm.String" MaxLength="24"
                "TransactionType": "", // Type="Edm.String" MaxLength="2"
                "PostingDate": "", //Type="Edm.DateTime" Precision="0"
                "CreatedBy": "", //Type="Edm.String" MaxLength="12"
                "OrderId": "", //Type="Edm.String" MaxLength="12"
                "OrderItemNumber": "", //Type="Edm.String" MaxLength="4"
                "Activity": "", //Type="Edm.String" MaxLength="4"
                "PurchaseOrderId": "", //Type="Edm.String" MaxLength="10"
                "PurchaseOrderItem": "", //Type="Edm.String" MaxLength="5"
                "Amount": "" //Type="Edm.Decimal" Precision="23" Scale="4"
            }
        }
    });
});