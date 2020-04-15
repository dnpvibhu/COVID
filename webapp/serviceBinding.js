function initModel() {
	var sUrl = "/ReverseLogistics/OData/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}