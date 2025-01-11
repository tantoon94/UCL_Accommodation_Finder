import  { config } from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'
import { updateDataBase } from './backend/google-map/mapquery.js'
import { getUCLBuildingsFromData, getAccommodationsFromData, getAccommodationsRoutesForBuilding, getAccommodationRouteTo } from './backend/data/dataFunctions.js';

config();

console.log(process.env.PORT); // This should print the port number
// Fix for __dirname not defined in ES6 modules
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

// //Serving static files from frontend
app.use(express.static(path.join(__dirname, 'frontend')));

//Listen for requests from the client
app.listen(PORT, () => {
    console.log(`Server Listening on PORT: ${PORT}`);
  });

//respond to /uclbuildings request 
//It returns an array of place object :
//    {
//      gmap.id,
//      display_name,
//      address,
//      location,
//      type
//    }
 app.get('/uclbuildings', async (req, res) => {
   try 
   {
    const result = await getUCLBuildingsFromData();
    console.log(result);
    res.send(result);
   } catch (error) {
      res.status(500).send('Error fetching UCL buildings');
   }
 });
 //respond to /getGoogleMapKey request
 app.get('/getGoogleMapKey', async (req, res) => {
  try 
  {
     res.send(process.env.GMAP_KEY);
  } catch (error) {
     res.status(500).send('Error fetching googleMap key');
  }
});
//respond to /uclaccommodations request
 app.get('/uclaccommodations', async (req, res) => {
   try 
   {
      res.send(await getAccommodationsFromData());
   } catch (error) {
      res.status(500).send('Error fetching UCL buildings');
   }
 });
//respond to /getwalkingroutes request 
 app.get('/getwalkingroutes', async (req, res) => {
   try {
      const param = req.params.id;
      res.send(await getAccommodationsRoutesForBuilding(param));
   } catch (error) {
     res.status(500).send('Error fetching walking routes');
   }
 });
//respond to /getwalkingrouteto/?buildingId=building_id&accommodationId=accommodation_id
app.get('/getwalkingrouteto', async (req, res) => {
  try {
     const buildingId = req.query.buildingId;
     const accommodationId = req.query.accommodationId;
     console.log(buildingId);
     console.log(accommodationId);
     var result = await getAccommodationRouteTo(buildingId, accommodationId);
     res.send(result);
  } catch (error) {
    res.status(500).send('Error fetching walking routes');
  }
});

//To update the database
 app.get('/updatedatabase', async (req, res) => {
   try {
      res.send(await updateDataBase());
   } catch (error) {
     res.status(500).send('Error Updating database');
   }
 });
