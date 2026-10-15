/* Campground show page map - MapTiler SDK */

(function () {
    // Reveal the frame with a fade + rise once it enters the viewport.
    const reveal = (el) => {
        if (!("IntersectionObserver" in window)) {
            el.classList.add("is-visible");
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add("is-visible");
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
    };

    const frame = document.getElementById("map-frame");
    const container = document.getElementById("map");
    const skeleton = document.getElementById("map-skeleton");

    // MapTiler SDK comes from a CDN - show a readable fallback if it failed.
    const showPlaceholder = (message) => {
        if (skeleton) skeleton.classList.add("is-hidden");
        container.innerHTML = `
            <div class="map-placeholder">
                <div class="map-placeholder-icon">📍</div>
                <p>${message}</p>
            </div>`;
        reveal(frame);
    };

    if (!frame || !container) {
        return;
    }

    if (typeof maptilersdk === "undefined") {
        showPlaceholder("The map could not be loaded right now.");
        return;
    }

    // Coordinates are only rendered when the campground has been geocoded.
    if (!Array.isArray(campgroundCoordinates) || campgroundCoordinates.length !== 2) {
        showPlaceholder("This campground has no map location yet.");
        return;
    }

    maptilersdk.config.apiKey = maptilerApiKey;

    const map = new maptilersdk.Map({
        container: "map",
        style: maptilersdk.MapStyle.BRIGHT,
        center: campgroundCoordinates,
        zoom: 10,
        // Fade the map in once it is ready instead of snapping into place.
        fadeDuration: 300
    });

    const hideSkeleton = () => {
        if (skeleton) skeleton.classList.add("is-hidden");
    };

    // Failsafe: never leave the shimmer running if tiles cannot load.
    const skeletonTimeout = setTimeout(hideSkeleton, 8000);

    // A tile/auth failure should not look like an eternal loading state.
    map.on("error", () => {
        clearTimeout(skeletonTimeout);
        hideSkeleton();
    });

    // Ease the camera in from a wider view for a gentle reveal.
    map.on("load", () => {
        map.easeTo({
            center: campgroundCoordinates,
            zoom: 10,
            duration: 1600,
            easing: (t) => 1 - Math.pow(1 - t, 3)
        });
    });

    const marker = new maptilersdk.Marker({ color: "#2d5a47" })
        .setLngLat(campgroundCoordinates)
        .setPopup(
            new maptilersdk.Popup({ offset: 25 }).setHTML(
                `<strong>${campgroundTitle}</strong><p>${campgroundLocation}</p>`
            )
        )
        .addTo(map);

    map.once("idle", () => {
        clearTimeout(skeletonTimeout);
        hideSkeleton();
        // Open the popup after the map settles so it animates in.
        setTimeout(() => marker.togglePopup(), 400);
    });

    // Reveal the frame as soon as it scrolls into view.
    reveal(frame);
})();
