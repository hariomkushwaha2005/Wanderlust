document.addEventListener("DOMContentLoaded", () => {
    const listingData = document.getElementById("listing-data");

    if (!listingData || !window.mapKey) {
        return;
    }

    const listing = JSON.parse(listingData.textContent);

    if (!listing.geometry || !Array.isArray(listing.geometry.coordinates)) {
        return;
    }

    maptilersdk.config.apiKey = window.mapKey;

    const map = new maptilersdk.Map({
        container: "map",
        style: maptilersdk.MapStyle.STREETS,
        center: listing.geometry.coordinates,
        zoom: 9,
    });

    new maptilersdk.Marker({ color: "red" })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new maptilersdk.Popup({ offset: 25 }).setHTML(
                `<h4>${listing.location}</h4><p>Exact Location Provided after booking</p>`
            )
        )
        .addTo(map);
});
