window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");

  // const over = document.getElementById("overlay-white-shadow");
  // over.classList.remove("hidden");
  // window.addEventListener("resize", () => {
  //   const screenWidth = window.screen.width;
  //   if (screenWidth >= 640) {
  //     over.classList.remove("hidden");
  //   } else {
  //     over.classList.add("hidden");
  //   }
  // });

  const button = document.querySelector("#menu-button");
  const menu = document.querySelector("#menu");

  button.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // const date = Date.now();

  // console.log(new Intl.DateTimeFormat('gb-EU',{ dateStyle: 'full', timeStyle: 'short' }).format(date));

  var script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyAqWH0IS8beHBRWjpwU1OP0h00gtgd7Wvc&libraries=places,geometry&callback=initMap";
  script.async = true;

  window.initMap = async function () {
    google.maps.visualRefresh = true;

    const map = new google.maps.Map(document.getElementById("map"), {
      mapId: "b1beacae401d047c", //Really Grey Map
      // mapId: "ba75703dfee7d76c", //Grey Map
      // mapId: "5dc01d292296e5fa", //Dark Map
      // mapId: "5b376c6ce00e84eb",
      // mapId: "14558a00a81bc942",
      // mapId: "ec36b480711b61d6",
      // mapId: '8b428d47b01d701d',

      // mapTypeControl: false,
      disableDefaultUI: true,
      // scaleControl: true,
      zoomControl: true,

      center: { lat: 52.713709, lng: -1.58632 },
      zoom: 6.65,

      /// Max zoom out level
      // minZoom: 3,
      ///Stop user from seeing the edges of the map
      restriction: {
        latLngBounds: {
          east: 179.9999,
          north: 82,
          south: -85,
          west: -179.9999,
        },
        strictBounds: true,
      },
    });

    window.addEventListener("resize", () => {
      const screenWidth = window.screen.width;
      if (screenWidth < 640) {
        map.setOptions({ zoomControl: false });
      } else {
        map.setOptions({ zoomControl: true });
      }
    });

    map.setTilt(45);
    new AutocompleteDirectionsHandler(map);
  };
  class AutocompleteDirectionsHandler {
    map;
    originPlaceId;
    destinationPlaceId;
    shadowLine;
    shadowLine2;
    curvedLine;
    geocoder;
    orgMarker;
    dstMarker;
    orgLat;
    orgLng;
    dstLat;
    dstLng;
    orgLatLng;
    dstLatLng;
    GmapsCubicBezier;
    step;
    numSteps;
    timePerStep;
    interval;
    leftMargin;
    rightMargin;

    constructor(map) {
      this.map = map;
      this.originPlaceId = "";
      this.destinationPlaceId = "";

      this.orgLat = "";
      this.orgLng = "";
      this.dstLat = "";
      this.dstLng = "";

      this.orgLatLng = "";
      this.dstLatLng = "";

      this.leftMargin = 30; // Grace margin to avoid too close fits on the edge of the overlay
      this.rightMargin = 80;

      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer();
      this.geocoder = new google.maps.Geocoder();
      this.orgMarker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
      });
      this.dstMarker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
      });

      this.shadowLine = new google.maps.Polyline({
        map: this.map,
        strokeColor: "#000000",
        strokeOpacity: 0.1,
        strokeWeight: 6,
      });

      this.curvedLine = new google.maps.Polyline({
        geodesic: true,
        // strokeOpacity: 0.0,
        strokeOpacity: 1,
        scale: 3.5,
        offset: "-30",
        // icons: [{
        // 	icon: {
        // 		path: 'M 0,-1 0,1',
        // 	},
        // 	repeat: '20px',
        // }],
        strokeColor: "#FF0000",
      });

      const originInput = document.getElementById("input-origin-home");
      const destinationInput = document.getElementById(
        "input-destination-home"
      );

      // const clear = document.querySelector(".clear");
      // clear.addEventListener("click", () => {
      //   // originInput.value.clear;
      //   console.log("clicked");
      // });

      // Specify just the place data fields that you need.
      const originAutocomplete = new google.maps.places.Autocomplete(
        originInput,
        {
          componentRestrictions: { country: "uk" },
          fields: ["place_id", "geometry"],
        }
      );
      // Specify just the place data fields that you need.
      const destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput,
        {
          componentRestrictions: { country: "uk" },
          fields: ["place_id", "geometry"],
        }
      );

      // On IDLE make map rotate and show WEBGL Stuff
      this.setupPlaceChangedListener(originAutocomplete, "ORIG");
      this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
      // document.getElementById("clear-button").addEventListener("click", () => {
      //   location.reload();
      //   // this.orgLat = '';
      //   // this.orgLng = '';
      //   // this.desLat = '';
      //   // this.desLng = '';

      //   // originInput.value = '';
      //   // destinationInput.value = '';

      //   // this.dstMarker.setVisible(false);
      //   // this.orgMarker.setVisible(false);
      //   // this.shadowLine.getPath().pop();
      //   // this.shadowLine.getPath().pop();

      //   // // console.log(this.curvedLine.getPath())
      //   // for (
      //   // 	let i = 0; i < this.curvedLine.getPath().Wc.length; i++
      //   // ) {
      //   // 	this.curvedLine.getPath().pop();
      //   // }
      // });
    }

    setupPlaceChangedListener(autocomplete, mode) {
      // autocomplete.bindTo('bounds', this.map);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        //Delets the "shadow polyline" so it does not appear more than once
        this.shadowLine.getPath().pop();
        this.shadowLine.getPath().pop();

        if (!place.place_id) {
          window.alert("Please enter a real address.");
          return;
        }
        let lat = place.geometry.location.lat(),
          lng = place.geometry.location.lng();

        if (mode === "ORIG") {
          // this.originPlaceId = place.place_id;
          this.map.setZoom(6.35);
          document.cookie = `ORIG_LAT=${lat}`;
          document.cookie = `ORIG_LNG=${lng}`;
          document.cookie = `ORIG_PLACE_ID=${place.place_id}`;
          this.originPlaceId = place.place_id;
          this.orgLat = lat;
          this.orgLng = lng;

          // this.bounds.extend(place.geometry.location)
          this.orgLatLng = place.geometry.location;
          this.orgMarker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location,
          });
          this.orgMarker.setVisible(true);

          this.map.setCenter(this.orgLatLng, { left: 600 });
        } else {
          // this.destinationPlaceId = place.place_id;
          document.cookie = `DEST_LAT=${lat}`;
          document.cookie = `DEST_LNG=${lng}`;
          document.cookie = `DEST_PLACE_ID=${place.place_id}`;
          this.destinationPlaceId = place.place_id;
          this.dstLat = lat;
          this.dstLng = lng;

          // this.bounds.extend(place.geometry.location)
          this.dstLatLng = place.geometry.location;
          this.dstMarker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location,
          });
          this.dstMarker.setVisible(true);
        }

        this.route();
      });
    }

    route() {
      if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
      }
      let markerList = [
        {
          lat: this.orgMarker.getPlace().location.lat(),
          lng: this.orgMarker.getPlace().location.lng(),
        },
        {
          lat: this.dstMarker.getPlace().location.lat(),
          lng: this.dstMarker.getPlace().location.lng(),
        },
      ];

      this.centralize(markerList);

      this.shadowLine.getPath().push(this.orgLatLng);
      this.shadowLine.getPath().push(this.dstLatLng);
      this.shadowLine.setMap(this.map);

      this.drawDashedCurve(this.orgLatLng, this.dstLatLng, this.map);
    }

    centralize(markerList) {
      const bounds = new google.maps.LatLngBounds();

      markerList.forEach((marker) => {
        bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
      });

      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      let left = 0;
      let bottom = 0;
      left = screenWidth * 0.7;
      bottom = screenHeight * 0.15;
      // console.log(left);
      // console.log(bottom);

      // this.map.fitBounds(bounds);
      // this.map.setCenter(bounds.getCenter()); //or use custom center
      // sets the bounds with the offset based on the window size - in progress
      // this.map.fitBounds(bounds);
      if (screenWidth >= 768) {
        this.map.fitBounds(bounds, { left: left });
        this.map.setZoom(this.map.getZoom() - 0.95);
      } else {
        this.map.fitBounds(bounds, { bottom: bottom });
        this.map.setZoom(this.map.getZoom() - 0.95);
        // this.map.fitBounds(bounds);
        // this.map.setZoom(this.map.getZoom());
      }
      // this.map.setZoom(this.map.getZoom());
    }

    drawDashedCurve(m1, m2, map) {
      var lineLength = google.maps.geometry.spherical.computeDistanceBetween(
        m1,
        m2
      );
      let lineHeading1;
      let lineHeading2;
      var lineHeading = google.maps.geometry.spherical.computeHeading(m1, m2);
      console.log("line heading", lineHeading);
      if (lineHeading < 0) {
        lineHeading1 = lineHeading + 45;
        lineHeading2 = lineHeading + 135;
        // this.curvedLine.setOffSet(-5)
      } else if (lineHeading > 170) {
        lineHeading1 = lineHeading + 5;
        lineHeading2 = lineHeading + 5;
      } else if (lineHeading < -170) {
        lineHeading1 = lineHeading + -5;
        lineHeading2 = lineHeading + -5;
      } else {
        lineHeading1 = lineHeading + -45;
        lineHeading2 = lineHeading + -135;
      }
      console.log("LINE HEADING 1", lineHeading1);
      console.log("LINE HEADING 2", lineHeading2);
      var pA = google.maps.geometry.spherical.computeOffset(
        m1,
        lineLength / 6.2,
        lineHeading1
      );
      var pB = google.maps.geometry.spherical.computeOffset(
        m2,
        lineLength / 6.2,
        lineHeading2
      );

      let resolution = 0.001;

      var lat1 = this.orgLatLng.lat();
      var long1 = this.orgLatLng.lng();
      var lat2 = pA.lat();
      var long2 = pA.lng();
      var lat3 = pB.lat();
      var long3 = pB.lng();
      var lat4 = this.dstLatLng.lat();
      var long4 = this.dstLatLng.lng();

      var points = [];
      function B1(t) {
        return t * t * t;
      }
      function B2(t) {
        return 3 * t * t * (1 - t);
      }
      function B3(t) {
        return 3 * t * (1 - t) * (1 - t);
      }
      function B4(t) {
        return (1 - t) * (1 - t) * (1 - t);
      }
      function getBezier(C1, C2, C3, C4, percent) {
        var pos = {};
        pos.x =
          C1.x * B1(percent) +
          C2.x * B2(percent) +
          C3.x * B3(percent) +
          C4.x * B4(percent);
        pos.y =
          C1.y * B1(percent) +
          C2.y * B2(percent) +
          C3.y * B3(percent) +
          C4.y * B4(percent);
        return pos;
      }

      for (let it = 0; it <= 1; it += resolution) {
        points.push(
          getBezier(
            {
              x: lat1,
              y: long1,
            },
            {
              x: lat2,
              y: long2,
            },
            {
              x: lat3,
              y: long3,
            },
            {
              x: lat4,
              y: long4,
            },
            it
          )
        );
      }

      var path = [];
      for (var i = 0; i < points.length - 1; i++) {
        path.push(new google.maps.LatLng(points[i].x, points[i].y));
        path.push(
          new google.maps.LatLng(points[i + 1].x, points[i + 1].y, false)
        );
      }

      // console.log(path)
      this.curvedLine.setPath(path);
      this.curvedLine.setMap(this.map);
      map.setTilt(45);
    }
  }
  document.head.appendChild(script);
});
