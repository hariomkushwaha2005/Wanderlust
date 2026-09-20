document.addEventListener("DOMContentLoaded", () => {
    const taxSwitch = document.getElementById("switchCheckDefault");

    if (taxSwitch) {
        taxSwitch.addEventListener("click", () => {
            const taxInfo = document.getElementsByClassName("tax-info");

            Array.from(taxInfo).forEach((info) => {
                info.style.display = info.style.display !== "inline" ? "inline" : "none";
            });
        });
    }

    const listingPage = document.getElementById("listing-page");
    const activeCategory = listingPage?.dataset.activeCategory || "";

    if (activeCategory) {
        const selectedFilterDiv = document.getElementById(activeCategory);
        if (selectedFilterDiv) {
            selectedFilterDiv.classList.add("active-filter");
        }
    }
});
