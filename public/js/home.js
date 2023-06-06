window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");

  // Menu toggle
  const button = document.querySelector("#menu-button");
  const menu = document.querySelector("#menu");
  button.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // Google Maps API script
  const script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=**API-KEY**&libraries=places,geometry&callback=initMap";
  script.async = true;

  window.initMap = async function () {
    // Initialize map
    google.maps.visualRefresh = true;
    const map = new google.maps.Map(document.getElementById("map"), {
      mapId: "b1beacae401d047c",
      rotateControl: true,
      disableDefaultUI: true,
      zoomControl: true,
      center: { lat: 52.713709, lng: -1.58632 },
      zoom: 6.65,
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

    // Handle window resizing
    window.addEventListener("resize", () => {
      const screenWidth = window.screen.width;
      map.setOptions({ zoomControl: screenWidth >= 640 });
    });

    map.setTilt(65);
    new AutocompleteDirectionsHandler(map);
  };

  class AutocompleteDirectionsHandler {
    constructor(map) {
      this.initializeProperties(map);
      this.initializeServicesAndMarkers(map);
      this.initializeAutocompleteInputs();
    }

    initializeProperties(map) {
      this.map = map;
      this.originPlaceId = "";
      this.destinationPlaceId = "";
    }

    initializeServicesAndMarkers(map) {
      this.geocoder = new google.maps.Geocoder();
      this.orgMarker = this.createMarker(map, google.maps.Animation.DROP);
      this.dstMarker = this.createMarker(map, google.maps.Animation.DROP);

      this.shadowLine = this.createPolyline("#000000", 0.1, 6);
      this.curvedLine = this.createPolyline("#FF0000", 1, 3.5, true);
    }

    createMarker(map, animation) {
      return new google.maps.Marker({ map, animation });
    }

    createPolyline(strokeColor, strokeOpacity, scale, geodesic = false) {
      return new google.maps.Polyline({
        map: this.map,
        geodesic,
        strokeColor,
        strokeOpacity,
        scale,
      });
    }

    initializeAutocompleteInputs() {
      const originInput = document.getElementById("input-origin-home");
      const destinationInput = document.getElementById(
        "input-destination-home"
      );

      const originAutocomplete = this.createAutocomplete(originInput);
      const destinationAutocomplete = this.createAutocomplete(destinationInput);

      this.setupPlaceChangedListener(originAutocomplete, "ORIG");
      this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
    }

    createAutocomplete(inputElement) {
      return new google.maps.places.Autocomplete(inputElement, {
        strictBounds: true,
        componentRestrictions: { country: "uk" },
        fields: ["place_id", "geometry"],
      });
    }

    setupPlaceChangedListener(autocomplete, mode) {
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        this.shadowLine.getPath().pop();
        this.shadowLine.getPath().pop();

        if (!place.place_id) {
          window.alert("Please enter a real address.");
          return;
        }
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        if (mode === "ORIG") {
          this.setOrigin(place, lat, lng);
        } else {
          this.setDestination(place, lat, lng);
        }

        this.route();
      });
    }

    setOrigin(place, lat, lng) {
      this.map.setZoom(6.35);
      this.originPlaceId = place.place_id;
      const location = place.geometry.location;
      this.orgMarker.setPlace({ placeId: place.place_id, location });
      this.orgMarker.setVisible(true);
      this.map.setCenter(location, { left: 100 });
    }

    setDestination(place, lat, lng) {
      this.destinationPlaceId = place.place_id;
      const location = place.geometry.location;
      this.dstMarker.setPlace({ placeId: place.place_id, location });
      this.dstMarker.setVisible(true);
    }

    route() {
      if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
      }
      const markerList = [
        {
          lat: this.orgMarker.getPlace().location.lat(),
          lng: this.orgMarker.getPlace().location.lng(),
        },
        {
          lat: this.dstMarker.getPlace().location.lat(),
          lng: this.dstMarker.getPlace().location.lng(),
        },
      ];
      this.offsetMap(markerList);

      const orgLatLng = this.orgMarker.getPlace().location;
      const dstLatLng = this.dstMarker.getPlace().location;

      this.shadowLine.getPath().push(orgLatLng);
      this.shadowLine.getPath().push(dstLatLng);
      this.shadowLine.setMap(this.map);

      // This was made do to the very annoying bug of making the polyline
      // extremly big when there is a huge diffrence between the distances
      // of the previous addresses and the current addresses inputed.
      // Comment the setTimeout part and play around with the input
      // values to see for yourself

      window.setTimeout(() => {
        this.drawDashedCurve(orgLatLng, dstLatLng, this.map);
      }, 10);
      this.map.setTilt(45);
    }

    drawDashedCurve(m1, m2, map) {
      const lineLength = google.maps.geometry.spherical.computeDistanceBetween(
        m1,
        m2
      );
      const lineHeading = google.maps.geometry.spherical.computeHeading(m1, m2);
      const { lineHeading1, lineHeading2 } =
        this.calculateLineHeadings(lineHeading);
      const pA = google.maps.geometry.spherical.computeOffset(
        m1,
        lineLength / 6.2,
        lineHeading1
      );
      const pB = google.maps.geometry.spherical.computeOffset(
        m2,
        lineLength / 6.2,
        lineHeading2
      );

      const points = this.calculateBezierPoints(m1, pA, pB, m2);
      const path = this.createPathFromPoints(points);

      this.curvedLine.setPath(path);
      this.curvedLine.setMap(this.map);
    }

    calculateLineHeadings(lineHeading) {
      let lineHeading1, lineHeading2;

      if (lineHeading > 160) {
        lineHeading1 = lineHeading - 20;
        lineHeading2 = lineHeading - 170;
      } else if (lineHeading >= 15 && lineHeading <= 160) {
        lineHeading1 = lineHeading - 35;
        lineHeading2 = lineHeading - 145;
      } else if (lineHeading > 0 && lineHeading <= 15) {
        lineHeading1 = lineHeading - 10;
        lineHeading2 = lineHeading - 170;
      } else if (lineHeading < 0 && lineHeading >= -15) {
        lineHeading1 = lineHeading + 10;
        lineHeading2 = lineHeading + 165;
      } else if (lineHeading <= -15 && lineHeading >= -160) {
        lineHeading1 = lineHeading + 35;
        lineHeading2 = lineHeading + 145;
      } else if (lineHeading < -160) {
        lineHeading1 = lineHeading - 5;
        lineHeading2 = lineHeading + 185;
      }

      return { lineHeading1, lineHeading2 };
    }

    calculateBezierPoints(m1, pA, pB, m2) {
      const B1 = (t) => t * t * t;
      const B2 = (t) => 3 * t * t * (1 - t);
      const B3 = (t) => 3 * t * (1 - t) * (1 - t);
      const B4 = (t) => (1 - t) * (1 - t) * (1 - t);

      const curveNumPoints = 100;
      const points = [];

      for (let i = 0; i < curveNumPoints; i++) {
        const t = i / (curveNumPoints - 1);
        const lat =
          B1(t) * m1.lat() +
          B2(t) * pA.lat() +
          B3(t) * pB.lat() +
          B4(t) * m2.lat();
        const lng =
          B1(t) * m1.lng() +
          B2(t) * pA.lng() +
          B3(t) * pB.lng() +
          B4(t) * m2.lng();
        points.push(new google.maps.LatLng(lat, lng));
      }

      return points;
    }

    createPathFromPoints(points) {
      const path = new google.maps.MVCArray();
      points.forEach((point) => {
        path.push(point);
      });

      return path;
    }

    offsetMap(markerList) {
      const bounds = new google.maps.LatLngBounds();

      markerList.forEach((marker) => {
        bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
      });

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const leftMarginRatio = 0.65;
      const topMarginRatio = 0.35;

      const leftPadding = screenWidth * leftMarginRatio;
      const topPadding = screenHeight * topMarginRatio;

      if (screenWidth >= 1024) {
        this.map.fitBounds(bounds, { left: leftPadding });
        this.map.setZoom(this.map.getZoom() - 0.95);
      } else {
        this.map.fitBounds(bounds, { top: topPadding });
        this.map.setZoom(this.map.getZoom() - 0.95);
      }
    }
  }

  document.head.appendChild(script);
});
