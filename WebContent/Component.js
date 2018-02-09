sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"Press_Shop_Fiori1/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("Press_Shop_Fiori1.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			debugger;
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});

});