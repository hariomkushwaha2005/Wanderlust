if (!window.listing || !window.listing.geometry?.coordinates) {
    console.warn("Listing map data not available.");
} else {
    maptilersdk.config.apiKey = window.mapKey;

    const map = new maptilersdk.Map({
        container: 'map',
        style: maptilersdk.MapStyle.STREETS,
        center: window.listing.geometry.coordinates,
        zoom: 9
    });

    new maptilersdk.Marker({ color: "red" })
        .setLngLat(window.listing.geometry.coordinates)
        .setPopup(
            new maptilersdk.Popup({ offset: 25 })
                .setHTML(`<h4>${window.listing.location}</h4><p>Exact Location Provided after booking</p>`)
        )
        .addTo(map);
}