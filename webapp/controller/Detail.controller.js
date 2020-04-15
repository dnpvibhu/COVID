sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.wipro.cts.controller.Detail", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Detail").attachPatternMatched(function(oEvent){
				// var sContext = oEvent.getParameter("arguments").context;
				// this.getView().setBindingContext(this.getView().getModel().createBindingContext(atob(sContext)));
			},this); 
		},
		
		navBack:function(){
			window.history.back();
		}
	});

});