sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageToast, MessageBox, JSONModel, ODataModel, ResourceModel, BusyIndicator) {
	"use strict";

	return Controller.extend("Press_Shop_Fiori1.controller.Master", {

		//Init flux
		onInit: function() {
			var oView = this.getView();
			var i18nModel = new ResourceModel({
				bundleName: "Press_Shop_Fiori1.i18n.i18n" //,
			});
			oView.setModel(i18nModel, "i18n");
			var oController = oView.getController();
			var osite = oView.byId("__PLANT");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='04')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var Open = response.Open;
				var type = response.Type;
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setText(site);
				var TypeCode = oView.byId("TYPECODE");
				TypeCode.setText(type);
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
				if (Open === "X") {
					oController.GetData();
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		ClearBox: function() {
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet(Zfilter='T" + "04" + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.Message !== "" && response.EZtype === "O") {
					oView.byId("TOOL_BAR").setVisible(false);
					oView.byId("table1").setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.INFORMATION,
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		searchArt: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var material = oView.byId("SearchArt").getValue();
			var URL2 = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/MessageSet(PValue='06" + material + "')";
			oView.byId("SearchArt").setValue("");
			debugger;
			BusyIndicator.show();
			OData.read(URL2, function(response2) {
				BusyIndicator.hide();
				if (response2.EMessage !== "" && response2.EZtype === "E") {
					var path = $.sap.getModulePath("Press_Shop_Fiori1", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response2.EMessage, {
						icon: MessageBox.Icon.ERROR,
						actions: [MessageBox.Action.OK],
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					var oTable = oView.byId("table1");
					oTable.setVisible(true);
					oController.GetData(material);
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		GetData: function(material) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var searchString = null;
			var URL = null;
			var infoMsg = null;
			oTable.setVisible(true);
			oView.byId("TOOL_BAR").setVisible(true);
			if (material === "deleteLast") {
				searchString = "R" + material + "/" + "04";
			} else {
				searchString = "A" + material + "/" + "04";
			}
			URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet?$filter=Zfilter " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.results[0] == null && material !== "deleteLast") {
					infoMsg = oView.getModel("i18n").getResourceBundle().getText("article_already_scanned");
					MessageBox.show(infoMsg, {
						icon: MessageBox.Icon.ERROR,
						actions: [MessageBox.Action.OK],
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				}
				var newArray = response.results;
				var lines = newArray.length;
				if (response.results[0] != null) {
					if (material === "deleteLast") {
						infoMsg = oView.getModel("i18n").getResourceBundle().getText("last_scan_cancelled");
						MessageBox.show(infoMsg, {
							icon: MessageBox.Icon.INFORMATION,
							actions: [MessageBox.Action.OK],
							onClose: function() {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						});
					}
					var sum = parseInt(response.results[0].Menge);
					for (var i = 1; i < response.results.length; i++) {
						if (i < response.results.length) {
							sum = parseInt(response.results[i].Menge) + sum;
						}
					}
					var model2 = new JSONModel({
						"Sum": sum,
						"Products": lines
					});
					oView.setModel(model2, "Model2");
					var model = new JSONModel({
						"items": newArray
					});
					model.setSizeLimit(100);
					oView.setModel(model, "itemModel");
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
				} else {
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
					if (material === "deleteLast") {
						oTable.setVisible(false);
						oView.byId("TOOL_BAR").setVisible(false);
						infoMsg = oView.getModel("i18n").getResourceBundle().getText("last_scan_cancelled");
						MessageBox.show(infoMsg, {
							icon: MessageBox.Icon.INFORMATION,
							actions: [MessageBox.Action.OK],
							onClose: function() {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						});
					}
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		Validate: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var ocon = oView.byId("CONFIRM").getText();
			var oyes = oView.byId("YES").getText();
			var ono = oView.byId("NO").getText();
			MessageBox.show(
				ocon, {
					actions: [oyes, ono],
					onClose: function(oAction) {
						if (oAction === oyes) {
							oController.SaveData();
						}
					}
				});
		},

		SaveData: function() {
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet(Zfilter='C" + "04" + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.Message !== "" && response.EZtype === "O") {
					oView.byId("TOOL_BAR").setVisible(false);
					oView.byId("table1").setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.INFORMATION,
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						}
					});
				} else {
					var path = $.sap.getModulePath("Press_Shop_Fiori1", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.ERROR,
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		CancelLast: function() {
			this.GetData("deleteLast");
		}
	});
});