/* Campground index page cluster map - MapTiler SDK */

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
                <div class="map-placeholder-icon">🗺️</div>
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

    // Nothing to plot yet - tell the user instead of showing an empty map.
    if (!campgrounds?.features?.length) {
        showPlaceholder(
            "No campgrounds have a map location yet. Add one to see it here."
        );
        return;
    }

    maptilersdk.config.apiKey = maptilerApiKey;

    const map = new maptilersdk.Map({
        container: "map",
        style: maptilersdk.MapStyle.BRIGHT,
        center: [-103.59179687498357, 40.66995747013945],
        zoom: 3,
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

    map.on("load", function () {
        map.addSource("campgrounds", {
            type: "geojson",
            data: campgrounds,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
            id: "clusters",
            type: "circle",
            source: "campgrounds",
            filter: ["has", "point_count"],
            paint: {
                // Forest palette: sage -> forest -> deep forest as clusters grow.
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#7fa99b",
                    10,
                    "#3d7a5f",
                    30,
                    "#2d5a47"
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    15,
                    10,
                    20,
                    30,
                    25
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "rgba(255, 255, 255, 0.85)"
            }
        });

        map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "campgrounds",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
            },
            paint: {
                "text-color": "#ffffff"
            }
        });

        map.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "campgrounds",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#d4a574",
                "circle-radius": 6,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff"
            }
        });

        // Fit the camera to every campground so all pins start in view.
        const bounds = new maptilersdk.LngLatBounds();

        campgrounds.features.forEach((feature) => {
            bounds.extend(feature.geometry.coordinates);
        });

        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, {
                padding: 80,
                maxZoom: 12,
                duration: 1600,
                easing: (t) => 1 - Math.pow(1 - t, 3)
            });
        }

        // Inspect a cluster on click
        map.on("click", "clusters", async (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ["clusters"]
            });
            const clusterId = features[0].properties.cluster_id;
            const zoom = await map
                .getSource("campgrounds")
                .getClusterExpansionZoom(clusterId);

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom,
                duration: 700
            });
        });

        // When a click event occurs on a feature in the unclustered-point
        // layer, open a popup at the location of the feature, with
        // description HTML from its properties.
        map.on("click", "unclustered-point", function (e) {
            const { popUpMarkup } = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears over
            // the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new maptilersdk.Popup()
                .setLngLat(coordinates)
                .setHTML(popUpMarkup)
                .addTo(map);
        });

        // Grow pins slightly on hover for tactile feedback.
        map.on("mouseenter", "unclustered-point", () => {
            map.getCanvas().style.cursor = "pointer";
            map.setPaintProperty("unclustered-point", "circle-radius", 9);
        });
        map.on("mouseleave", "unclustered-point", () => {
            map.getCanvas().style.cursor = "";
            map.setPaintProperty("unclustered-point", "circle-radius", 6);
        });

        map.on("mouseenter", "clusters", () => {
            map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
            map.getCanvas().style.cursor = "";
        });

        // Hide the shimmer once the map has fully settled.
        map.once("idle", () => {
            clearTimeout(skeletonTimeout);
            hideSkeleton();
        });
    });

    reveal(frame);
})();
