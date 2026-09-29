document.addEventListener("DOMContentLoaded", () => {
    const taxSwitch = document.getElementById("switchCheckDefault");

    if (taxSwitch) {
        taxSwitch.addEventListener("change", () => {
            const formatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

            document.querySelectorAll(".listing-price").forEach((price) => {
                const basePrice = Number(price.dataset.basePrice);
                const displayedPrice = taxSwitch.checked ? basePrice * 1.18 : basePrice;
                price.textContent = formatter.format(displayedPrice);
            });

            document.querySelectorAll(".tax-info").forEach((info) => {
                info.style.display = taxSwitch.checked ? "inline" : "none";
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
