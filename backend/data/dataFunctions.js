import db from '../data/databaseconnection.js';

export const placeTypes = {
    Buildings: 'Buildings',
    Accommodation: 'Accommodation',
};

// Function to execute SQL queries
async function executeQuery(query, params = []) {
    try { 
        const [rows] = await db.query(query, params); 
        return rows; 
    } catch (error) { 
        console.log(error);
        throw error; 
    }
}

// Function to insert or update a single place
export async function insertOrupdatePlace(place, placeType) {
    const query = `
        INSERT INTO places (gmap_id, display_name, type, address, location)
        VALUES (?, ?, ?, ?, POINT(?, ?)) as V
        ON DUPLICATE KEY UPDATE 
            display_name = V.display_name,           
            type = V.type,
            address = V.address,
            location = V.location
    `;
    const params = [
        place.id,
        place.displayName.text,
        placeType,
        place.formattedAddress,
        place.location.latitude,
        place.location.longitude
    ];
    return await runQuery(query, params);
}

// Function to insert or update all places in a bulk query
export async function insertOrupdatePlaces(places, placeType) {
    const params = places.flatMap(place => [
        place.id,
        place.displayName.text,
        placeType,
        place.formattedAddress,
        place.location.latitude,
        place.location.longitude
    ]);
    const query = `
        INSERT INTO places (gmap_id, display_name, type, address, location)
        VALUES ${places.map(() => '(?, ?, ?, ?, POINT(?, ?))').join(', ')} as V
        ON DUPLICATE KEY UPDATE 
            display_name = V.display_name,           
            type = V.type,
            address = V.address,
            location = V.location
    `;
    try {
        const result = await executeQuery(query, params);
        console.log("Query (InsertOrUpdate places) executed successfully:");
    } catch (error) {
        console.error("Error executing query:", error);
        throw error; // Rethrow the error to ensure it's not silently swallowed
    }
}

// // Function to get place ID by Google Maps ID and type
// export async function getPlaceIdByGMapId(gmapId, type) {
//     const query = `SELECT id FROM places WHERE gmap_id = ? AND type = ?`;
//     const result = await executeQuery(query, [gmapId, type]);
//     return result.length > 0 ? result[0].id : null;
// }

// Function to insert or update a single route information
export async function insertOrUpdateRoute(route) {
    const query = `
        INSERT INTO routes (building_id, accommodation_id, duration, distance_meters, encoded_polyline)
        VALUES (?, ?, ?, ?, ?) as V
        ON DUPLICATE KEY UPDATE 
            duration = V.duration,
            distance_meters = V.distance_meters,
            encoded_polyline = V.encoded_polyline
    `;
    await executeQuery(query, [route.buildingId, route.accommodationId, route.duration, route.distanceMeters, route.encodedPolyline]);
}

// Function to insert or update all routes
export async function insertOrUpdateRoutes(routes) {
    const params = routes.flatMap(route => [
        route.building_id,
        route.accommodation_id,
        route.duration,
        route.distance_meters,
        route.encoded_polyline
    ]);
    const query = `
        INSERT INTO routes (building_id, accommodation_id, duration, distance_meters, encoded_polyline)
        VALUES ${routes.map(() => '(?, ?, ?, ?, ?)').join(', ')} as V
        ON DUPLICATE KEY UPDATE 
            duration = V.duration,
            distance_meters = V.distance_meters,
            encoded_polyline = V.encoded_polyline
    `;
    try {
        const result = await executeQuery(query, params);
        console.log("Query (InsertOrUpdate Routes) executed successfully.");
    } catch (error) {
        console.error("Error executing query:", error);
        throw error; // Rethrow the error to ensure it's not silently swallowed
    }
}

export async function getUCLBuildingsFromData() {
    const params = [placeTypes.Buildings]
    return await executeQuery(`SELECT * From places Where type = ?`, params);
}

export async function getAccommodationsFromData() {
    const params = [placeTypes.Accommodation]
    return await executeQuery(`SELECT * From places Where type = ?`, params);
}

export async function getAccommodationsRoutesForBuilding(buildingId) {
    const params = [
        buildingId
    ];
    return await executeQuery(`SELECT * From routes Where building_id = ?`, params)
}

export async function getAccommodationRouteTo(buildingId, accommodationId) {
    const params = [
        buildingId,
        accommodationId
    ];
    return await executeQuery(`SELECT * From routes Where building_id = ? And accommodation_id = ?`, params)
}