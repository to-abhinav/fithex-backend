/**
 * Haversine formula — calculates the great-circle distance between two
 * geographic points and checks whether they fall within a given radius.
 *
 * @param {number} lat1  – Latitude  of point A (degrees)
 * @param {number} lng1  – Longitude of point A (degrees)
 * @param {number} lat2  – Latitude  of point B (degrees)
 * @param {number} lng2  – Longitude of point B (degrees)
 * @param {number} radiusMeters – Maximum allowed distance (metres)
 * @returns {boolean} true when the two points are within `radiusMeters`
 */
const isWithinRadius = (lat1, lng1, lat2, lng2, radiusMeters) => {
  const EARTH_RADIUS_M = 6_371_000; // mean Earth radius in metres

  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = EARTH_RADIUS_M * c;

  return distanceMeters <= radiusMeters;
};

/**
 * Returns the distance in metres between two geo-points (useful for
 * error messages / debugging).
 */
const distanceBetween = (lat1, lng1, lat2, lng2) => {
  const EARTH_RADIUS_M = 6_371_000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_M * c);
};

module.exports = { isWithinRadius, distanceBetween };
