window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");

  const button = document.querySelector("#menu-button");
  const menu = document.querySelector("#menu");

  button.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // const date = Date.now();

  // console.log(new Intl.DateTimeFormat('gb-EU',{ dateStyle: 'full', timeStyle: 'short' }).format(date));

  var script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyAqWH0IS8beHBRWjpwU1OP0h00gtgd7Wvc&callback=initMap";
  script.async = true;

  window.initMap = async function () {
    google.maps.visualRefresh = true;

    const map = new google.maps.Map(document.getElementById("map"), {
      mapId: "b1beacae401d047c",
      // mapId: "5b376c6ce00e84eb",
      center: { lat: 52.713709, lng: -1.58632 },
      zoom: 6.65,
    });

    var marker1 = new google.maps.Marker({
      position: { lat: 47.6205, lng: -122.3493 },
      map: map,
      title: "Marker 1",
    });
    var marker2 = new google.maps.Marker({
      position: { lat: 47.6036, lng: -122.3294 },
      map: map,
      title: "Marker 2",
    }); // Create the curved
    var curveCoordinates = [
      marker1.getPosition(),
      new google.maps.LatLng(
        (marker1.getPosition().lat() + marker2.getPosition().lat()) / 2,
        (marker1.getPosition().lng() + marker2.getPosition().lng()) / 2
      ),
      marker2.getPosition(),
    ];
    var curvedPath = new google.maps.Polyline({
      path: curveCoordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map,
    }); // Generate the static map URL with the curved
    // var staticMapUrl =
    // "https://maps.googleapis.com/maps/api/staticmap?center=Seattle,WA&zoom=12&size=600x400&maptype=roadmap"
    // + "&markers=color:red%7Clabel:A%7C" + marker1.getPosition().lat() + "," +
    // marker1.getPosition().lng() + "&markers=color:green%7Clabel:B%7C" +
    // marker2.getPosition().lat() + "," + marker2.getPosition().lng() +
    // "&path=color:0xff0000ff|weight:2|" + curveCoordinates[0].lat() + "," +
    // curveCoordinates[0].lng() + "|" + curveCoordinates[1].lat() + "," +
    // curveCoordinates[1].lng() + "|" + curveCoordinates[2].lat() + "," +
    // curveCoordinates[2].lng(); // Add the static map to the page var staticMapImg
    // = document.createElement('img'); staticMapImg.src = staticMapUrl;
    // document.body.appendChild(staticMapImg); }

    map.setTilt(45);
  };
  document.head.appendChild(script);
});

// <script
//   src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAqWH0IS8beHBRWjpwU1OP0h00gtgd7Wvc"
// ></script>
// <script>
//   function initMap() {
// </script>
// <script
//   async
//   defer
//   src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAqWH0IS8beHBRWjpwU1OP0h00gtgd7Wvc&callback=initMap"
// >
// </script>
