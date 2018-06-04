sap.ui.define(function() {
	"use strict";

	var DateFormatter = {
		format : function(date){
			if(date !== "" && date !== undefined && date !== null){
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({  
				     source: {pattern:"yyyyMMdd"},  
				     pattern: "dd/MM/yyyy"}  
				);  
				var oDate = oDateFormat.parse(date);  
				return oDateFormat.format(oDate);
			}else{
				return "";
			}
		}
	};

	return DateFormatter;

},true);