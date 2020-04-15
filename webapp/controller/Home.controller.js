sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"com/wipro/cts/js/Formatter",
	"sap/ui/model/Filter",
	"com/wipro/cts/js/underscore",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, formatter, Filter, _, JSONModel) {
	"use strict";

	var GMaps = null;
	jQuery.sap.require("com.wipro.cts.js.Moment");

	var firstLoad = false;
	var map;
	var polyArray = [];
	return Controller.extend("com.wipro.cts.controller.Home", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Home").attachPatternMatched(function (oEvent) {

			}, this);
		},

		onNav: function (oEvent) {
			// var sContext = oEvent.getSource().getBindingContext().sPath;
			// sContext = btoa(sContext);
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("Detail",{context:sContext});
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Detail");
		},

		onAfterRendering: function () {
			if (!firstLoad) {
				this.onMapLoading();
			}
			// Map Rendering
			this.getView().byId("map").setBusy(false);
		},

		onMapLoading: function () {
			jQuery.sap.delayedCall(1000, this, function () {
				var mapContainer = this.byId("map").getDomRef();
				if (!(GMaps = window.google.maps)) {
					MessageToast("Network timed out, Unable to load Map");
					return;
				}
				this.directionsService = new GMaps.DirectionsService();
				map = new GMaps.Map(mapContainer, {
					center: {
						"lat": 12.843808,
						"lng": 77.665567
					},
					disableDefaultUI: true,
					zoom: 15
				});

				//Creating GeoFence around parking lot
				var Coords0 = [{
					lat: 12.843683,
					lng: 77.644367
				}, {
					lat: 12.840524,
					lng: 77.644220
				}, {
					lat: 12.837432,
					lng: 77.650637
				}, {
					lat: 12.835688,
					lng: 77.657220
				}, {
					lat: 12.839212,
					lng: 77.659395
				}, {
					lat: 12.844857,
					lng: 77.651393
				}];

				var Coords1 = [{
					lat: 12.856155,
					lng: 77.663547
				}, {
					lat: 12.847448,
					lng: 77.670246
				}, {
					lat: 12.844884,
					lng: 77.659561
				}, {
					lat: 12.853819,
					lng: 77.656358
				}];

				var Coords2 = [{
					lat: 12.846428,
					lng: 77.672854
				}, {
					lat: 12.847797,
					lng: 77.675777
				}, {
					lat: 12.844207,
					lng: 77.688075
				}, {
					lat: 12.836879,
					lng: 77.679724
				}, {
					lat: 12.846317,
					lng: 77.672588
				}];
				var nameArray = [Coords0, Coords1, Coords2];

				for (var i = 0; i < nameArray.length; i++) {
					new GMaps.Polygon({
						paths: nameArray[i],
						strokeColor: '#FF0000',
						strokeOpacity: 0.7,
						strokeWeight: 2,
						fillColor: '#BAFFFA',
						fillOpacity: 0.35
					}).setMap(map);

					var polygon = new GMaps.Polygon({
						paths: nameArray[i]
					});

					polyArray.push(polygon);
				}

				//Plotting Destination marks and its geo fence area
				var destinations = [{
					lat: 12.853972,
					lng: 77.662779
				}, {
					lat: 12.851532,
					lng: 77.665852
				}, {
					lat: 12.853046,
					lng: 77.658659
				}, {
					lat: 12.840848,
					lng: 77.680640
				}, {
					lat: 12.842324,
					lng: 77.648468
				}, {
					lat: 12.840415,
					lng: 77.647228
				}, {
					lat: 12.846249,
					lng: 77.679703
				}];

				destinations.forEach((destination, index) => {
					var marker = new GMaps.Marker({
						position: new GMaps.LatLng(destination),
						title: "Person " + index,
						draggable: true,
						animation: GMaps.Animation.DROP,
						map: map,
						icon: {
							"url": "img/human.png"
						}
					});

					marker.addListener("dragend", function () {
						this.get("position").lat();
						this.get("position").lng();
						for (var ind = 0; ind < polyArray.length; ind++) {
							var resultColor = GMaps.geometry.poly.containsLocation(this.get("position"), polyArray[ind]) ? 'inside' : 'outside';
							console.log(this.get("title") + " is " + resultColor + " polygon " + [ind]);
						}

						console.log(marker.getPosition().lat());
					});
				});
				//Do everthing above this point
			});

			firstLoad = true;
		},

	});

});