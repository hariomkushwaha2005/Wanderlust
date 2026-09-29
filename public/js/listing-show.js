document.addEventListener("DOMContentLoaded", () => {
    const listingData = document.getElementById("listing-data");
    const mapContainer = document.getElementById("map");

    if (!listingData || !mapContainer?.dataset.mapKey) {
        return;
    }

    const listing = JSON.parse(listingData.textContent);

    if (!listing.geometry || !Array.isArray(listing.geometry.coordinates)) {
        return;
    }

    maptilersdk.config.apiKey = mapContainer.dataset.mapKey;

    const map = new maptilersdk.Map({
        container: "map",
        style: maptilersdk.MapStyle.STREETS,
        center: listing.geometry.coordinates,
        zoom: 9,
    });

    const popupContent = document.createElement("div");
    const locationHeading = document.createElement("h4");
    const locationNote = document.createElement("p");
    locationHeading.textContent = listing.location;
    locationNote.textContent = "Exact Location Provided after booking";
    popupContent.append(locationHeading, locationNote);

    new maptilersdk.Marker({ color: "red" })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new maptilersdk.Popup({ offset: 25 }).setDOMContent(popupContent)
        )
        .addTo(map);
});
