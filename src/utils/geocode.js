import { config, geocoding } from "@maptiler/client";

// The MapTiler key is restricted to specific allowed HTTP origins, so every
// request must carry an Origin/Referer that matches one of them. Browsers do
// this automatically (which is why the on-page maps work), but server-side
// geocoding (create/update/seed) sends no origin by default and gets a 403.
// We forward a known-good origin to satisfy the restriction.
const DEFAULT_ORIGIN = process.env.MAPTILER_REQUEST_ORIGIN || "http://localhost:3000";

// Make the client's underlying fetch attach the allowed origin.
const withOrigin = (origin) => {
    const base = globalThis.fetch.bind(globalThis);
    const resolved = origin || DEFAULT_ORIGIN;

    config.fetch = (resource, options = {}) => {
        const headers = {
            ...(options.headers || {}),
            Origin: resolved,
            Referer: resolved.endsWith("/") ? resolved : `${resolved}/`
        };

        return base(resource, { ...options, headers });
    };
};

/**
 * Geocode a free-text location into GeoJSON.
 * @param {string} location  the user's free-text location
 * @param {{origin?: string}} options  an allowed HTTP origin to send with the request
 */
export const geocodeLocation = async (location, { origin } = {}) => {
    const query = typeof location === "string" ? location.trim() : "";

    if (!query) {
        throw new Error("Please enter a location so we can place it on the map.");
    }

    // Read the key and forward the origin at call time so they never depend
    // on import order or on a request being present.
    config.apiKey = process.env.MAPTILER_API_KEY;
    withOrigin(origin);

    let geoData;

    try {
        geoData = await geocoding.forward(query, { limit: 1 });
    } catch (err) {
        const status = err?.res?.status;

        if (status === 401 || status === 403) {
            console.error(
                `MapTiler rejected the request (HTTP ${status}) for origin ` +
                    `"${origin || DEFAULT_ORIGIN}". Check that this origin is in the key's allowed HTTP origins.`
            );

            throw new Error(
                "The map service rejected our request. Please verify the MapTiler API key and its allowed origins."
            );
        }

        throw new Error(
            "We could not reach the map service right now. Please try again in a moment."
        );
    }

    if (!geoData?.features?.length) {
        throw new Error(
            "Could not geocode that location. Please try again and enter a valid location."
        );
    }

    return geoData;
};
