import { config } from 'dotenv';
import axios from 'axios';
import { placeTypes, insertOrupdatePlaces, insertOrUpdateRoutes } from '../data/dataFunctions.js';

config();
const apiKey = process.env.GMAP_KEY;
const searchEndpoint = process.env.GMAP_SEARCH_ENDPOINT;
const routesEndpoint = process.env.GMAP_ROUTES_ENDPOINT;

// Fetch building data from Google Maps
export async function getUCLBuildings() {
    try {
        const response = await axios.post(
            searchEndpoint,
            { textQuery: "UCL buildings" },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location"
                }
            }
        );
        return response.data || [];
    } catch (error) {
        console.error('Error fetching UCL buildings:', error.message);
        return error;
    }
}

// Fetch accommodation data from Google Maps
export async function getAccommodations() {
    try {
        const response = await axios.post(
            searchEndpoint,
            { textQuery: "student halls london ucl" },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location"
                }
            }
        );
        return response.data || [];
    } catch (error) {
        console.error('Error fetching accommodations:', error.message);
        return error;
    }
}

// Fetch all walking routes for the origin to destination
export async function getWalkingRoutesFor(originLocation, destinationLocation) {
    try {
        const response = await axios.post(
            routesEndpoint,
            {
                origin: { location : { latLng: originLocation } },
                destination: { location : { latLng: destinationLocation } },
                travelMode: "WALK"
            },          
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
                    "X-Goog-Api-Key": apiKey
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching routes:', error.message);
        return error;
    }
}

// Update database with data
export async function updateDataBase() {
    try {
        const buildings = await getUCLBuildings();
        await insertOrupdatePlaces(buildings.places, placeTypes.Buildings);
        console.log("Buildings inserted");
        const accommodations = await getAccommodations();
        await insertOrupdatePlaces(accommodations.places, placeTypes.Accommodation);
        console.log("Accommodations inserted");
        const allRoutes = [];
        let i = 0;
        for (const building of buildings.places) {
            for (const accommodation of accommodations.places)
            {
                const result = await getWalkingRoutesFor(building.location, accommodation.location);
                for (const route of result.routes)
                {
                    allRoutes.push({
                        building_id: building.id,
                        accommodation_id: accommodation.id,
                        duration: parseInt(route.duration, 10) || 0,
                        distance_meters: route.distanceMeters,
                        encoded_polyline: route.polyline.encodedPolyline || ''
                    })
                }                
            }
        }
        await insertOrUpdateRoutes(allRoutes);
        console.log("Database updated successfully.");
        return "Database updated successfully.";
    } catch (error) {
        console.error("Error updating database:", error.message);
    }
}
