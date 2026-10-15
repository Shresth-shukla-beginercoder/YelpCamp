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

// ---------------------------------------------------------------------
// Secret-free diagnostics.
//
// The MapTiler key travels in the request URL as a `key=` query param, so
// both the URL and the library's raw error message contain it. We must never
// log either. It IS safe to log: which env vars are present (never their
// values), the origin we actually sent, the HTTP status, and MapTiler's own
// response-body code/message (the body does not echo the key).
// ---------------------------------------------------------------------

const mapTilerKeySet = () => Boolean(process.env.MAPTILER_API_KEY);
const requestOriginConfigured = () =>
    Boolean(process.env.MAPTILER_REQUEST_ORIGIN);

// MapTiler's error body is JSON like {"code": "...", "message": "..."} (or
// nests it under "error"). Read it defensively; the key is NOT in the body.
const readMapTilerError = async (res) => {
    try {
        const data = await res.clone().json();
        return {
            code: data.code ?? data.error?.code ?? null,
            message: data.message ?? data.error?.message ?? null
        };
    } catch {
        try {
            return {
                code: null,
                message: (await res.clone().text()).slice(0, 200)
            };
        } catch {
            return { code: null, message: null };
        }
    }
};

// Best-effort category. A 403 is genuinely ambiguous - MapTiler returns it
// for a missing/invalid key, an out-of-allow-list origin, AND a usage limit -
// so we also log MapTiler's own code/message and let that be the evidence.
const classifyError = (err, status, body) => {
    if (status === undefined) {
        // No response reached: a network failure, or the library aborted
        // before sending because the key query param was empty.
        return /key is missing/i.test(err?.message || "")
            ? "missing-api-key"
            : "network-error";
    }

    switch (status) {
        case 400:
            return "malformed-request";
        case 401:
            return "invalid-key";
        case 403: {
            const hint = `${body?.code ?? ""} ${body?.message ?? ""}`.toLowerCase();
            if (/quota|usage|limit|exceed|exhaust|billing/.test(hint)) {
                return "quota-or-rate-limit";
            }
            if (/invalid key|missing key|unauthorized/.test(hint)) {
                return "invalid-key";
            }
            return "restricted-key-or-origin";
        }
        case 429:
            return "quota-or-rate-limit";
        default:
            return status >= 500 ? "maptiler-server-error" : "unknown-status";
    }
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

    // The origin that actually reaches MapTiler: the per-request value (the
    // browser's Origin/Referer) when provided, otherwise the default.
    const sentOrigin = origin || DEFAULT_ORIGIN;

    let geoData;

    try {
        geoData = await geocoding.forward(query, { limit: 1 });
    } catch (err) {
        const status = err?.res?.status;
        const body = err?.res ? await readMapTilerError(err.res) : null;
        const category = classifyError(err, status, body);

        // Evidence for the Vercel logs. Nothing here is a secret: the key is
        // only ever referenced as a present/absent boolean.
        console.error(
            [
                "[MapTiler geocode] request failed",
                `category=${category}`,
                `httpStatus=${status ?? "none"}`,
                `maptilerCode=${body?.code ?? "n/a"}`,
                `maptilerMessage=${body?.message ?? "n/a"}`,
                `sentOrigin=${sentOrigin}`,
                `originSource=${origin ? "per-request browser Origin/Referer" : "default (MAPTILER_REQUEST_ORIGIN or http://localhost:3000)"}`,
                `MAPTILER_API_KEY present=${mapTilerKeySet()}`,
                `MAPTILER_REQUEST_ORIGIN present=${requestOriginConfigured()}`
            ].join(" | ")
        );

        switch (category) {
            case "missing-api-key":
            case "invalid-key":
            case "restricted-key-or-origin":
                // All three read the same to the end user; the log line above
                // is what distinguishes which one it actually is.
                throw new Error(
                    "The map service rejected our request. Please verify the MapTiler API key and its allowed origins."
                );
            case "quota-or-rate-limit":
                throw new Error(
                    "The map service is rate-limited or out of quota right now. Please try again in a moment."
                );
            case "malformed-request":
                throw new Error(
                    "Could not geocode that location. Please check the location and try again."
                );
            default:
                // network-error / maptiler-server-error / unknown-status
                throw new Error(
                    "We could not reach the map service right now. Please try again in a moment."
                );
        }
    }

    if (!geoData?.features?.length) {
        throw new Error(
            "Could not geocode that location. Please try again and enter a valid location."
        );
    }

    return geoData;
};
