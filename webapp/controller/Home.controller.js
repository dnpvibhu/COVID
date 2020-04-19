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
	var directionsDisplay;
	var firstLoad = false;
	var map;
	var person1;
	var simulating = 0;
	// var com.wipro.cts.personMarkers;
	var polyArray = [];
	var draggedPersonArray = [];
	var increased = false;
	var decreased = false;
	var personGoBack = "No";
	var inoutvar = 0;
	return Controller.extend("com.wipro.cts.controller.Home", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Home").attachPatternMatched(function (oEvent) {
				com.wipro.cts.this = this;
				this.getView().getModel().setProperty("/buttonText", "Simulate Person");
				this.getView().getModel().setProperty("/thresholdAlerts", "0");
				this.getView().getModel().setProperty("/fallDetection", 0);
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
			com.wipro.cts.personMarkers = [];
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

				//Plotting person Marker
				var destinations = [{
					lat: 12.853972,
					lng: 77.662779
				}, {
					lat: 12.847752,
					lng: 77.665874
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
						personDetails: this.getView().getModel().getProperty("/Person/" + index),
						animation: GMaps.Animation.DROP,
						stepIndex: 1,
						zone: "inside",
						stepsArray: null,
						map: map,
						goback: "yes",
						icon: {
							"url": "img/human.png"
						}
					});

					//Drag Listener
					marker.addListener("dragend", function () {
						var that = com.wipro.cts.this;

						//fetching unique markers from in and out
						var markObj = {
							"name": this.get("title")
						};
						draggedPersonArray.push(markObj);
						var res = [...new Set(draggedPersonArray.map(x => x.name))];

						if (this.get("title") === "Person 0" || this.get("title") === "Person 1" || this.get("title") === "Person 2") {
							that.insideOrOutside(marker, 1);
						} else if (this.get("title") === "Person 4" || this.get("title") === "Person 5") {
							that.insideOrOutside(marker, 0);
						} else if (this.get("title") === "Person 3" || this.get("title") === "Person 6") {
							that.insideOrOutside(marker, 2);
						}

					});

					//Marker Click Listener
					marker.addListener("click", function () {
						var that = com.wipro.cts.this;
						var markerDomRef = $("<i></i>").css("position", "fixed").css("left", event.clientX).css("top", event.clientY)[0];
						$("body").append(markerDomRef);
						if (!that.personDetailPopover) {
							that.personDetailPopover = sap.ui.xmlfragment("com.wipro.cts.fragments.PersonDetails", that);
							that.getView().addDependent(that.personDetailPopover);
						}
						that.getView().getModel().setProperty("/thing", this.personDetails);
						console.log(this.personDetails);
						jQuery.sap.delayedCall(0, that, function () {
							that.personDetailPopover.openBy(markerDomRef);
						});
					});

					com.wipro.cts.personMarkers.push(marker);
				});

				//Do everthing above this point
			});

			firstLoad = true;
		},

		insideOrOutside: function (marker, ind) {
			var lastState = marker.get("zone");
			var inorout = GMaps.geometry.poly.containsLocation(marker.get("position"), polyArray[ind]) ? 'inside' : 'outside';
			marker.set("zone", inorout);
			if (inorout === "outside" && lastState === "inside") {
				inoutvar++;
			} else if (inorout === "inside" && lastState === "outside") {
				if (inoutvar > 0) {
					inoutvar--;
				}
			}
			this.getView().getModel().setProperty("/thresholdAlerts", inoutvar);
		},

		onMarkerSimulate: function (oEvent) {
			simulating = 1;
			this.markerSimulatingFunc();
			this.getView().getModel().setProperty("/buttonText", "Stop Simulating");
		},

		markerSimulatingFunc: function () {
			if (simulating === 1) {
				console.log("Moving");

				//Fall detection icon change
				com.wipro.cts.personMarkers[2].setIcon("img/fall.png");
				for (var pic = 0; pic < com.wipro.cts.personMarkers.length; pic++) {
					var picCounter = 0;
					if (com.wipro.cts.personMarkers[pic].get("icon") === "img/fall.png") {
						picCounter++;
						this.getView().getModel().setProperty("/fallDetection", picCounter);
					}
				}

				//Moving the maker from one place to another
				person1 = com.wipro.cts.personMarkers[1];
				var request = {
					origin: person1.get("position"),
					destination: "12.842078, 77.664137",
					travelMode: 'WALKING'
				};
				this.directionsService = new GMaps.DirectionsService();
				this.directionsService.route(request, function (result, status) {
					if (status == 'OK') {
						person1.set("stepsArray", result.routes[0].overview_path);
						setInterval(function () {
							var that = com.wipro.cts.this;

							//checking in and out condition
							var lastState = person1.get("zone");
							var inorout = GMaps.geometry.poly.containsLocation(person1.get("position"), polyArray[1]) ? 'inside' : 'outside';
							person1.set("zone", inorout);
							if ((inorout === "outside" && lastState === "inside") && increased === false) {
								inoutvar++;
								increased = true;
							} else if ((inorout === "inside" && lastState === "outside") && decreased === false) {
								if (inoutvar > 0) {
									inoutvar--;
									decreased = true;
								}
							}
							that.getView().getModel().setProperty("/thresholdAlerts", inoutvar);

							//Simulating marker code
							if (person1.get("stepsArray").length - 1 === person1.get("stepIndex")) {
								that.getView().byId("GoBack").setVisible(true);
								if (personGoBack === "No") {
									return;
								} else {
									that.getView().byId("GoBack").setVisible(false);
									personGoBack = "No"
									person1.set("stepIndex", 0);
									person1.set("stepsArray", person1.get("stepsArray").reverse());
								}
							}
							if (person1.get("stepsArray").length >= person1.get("stepIndex")) {
								person1.set("stepIndex", person1.get("stepIndex") + 1);
							}
							person1.setPosition(person1.get("stepsArray")[person1.get("stepIndex")]);

						}.bind(person1), 1200);
					} else {
						console.log("Not Printing");
						reject(status);
					}
				});
			} else {
				console.log("Not moving");
			}
		},

		onGoBack: function (oEvent) {
			personGoBack = "Yes";
		},

		onAlertsPress: function (oEvent) {
			this.getView().byId("thresholdAlertLayout").setVisible(true);
			this.getView().byId("fallDetectionLayout").setVisible(false);
		},

		onFallDetect: function (oEvent) {
			this.getView().byId("thresholdAlertLayout").setVisible(false);
			this.getView().byId("fallDetectionLayout").setVisible(true);
		}

	});

});