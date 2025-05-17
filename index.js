const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');


const {MongoClient, ServerApiVersion} = require('mongodb');

const port = 3001;

const uri = "mongodb+srv://sinaaa:EOvMlrsFixX1hsoR@weather.pi893it.mongodb.net/?retryWrites=true&w=majority&appName=Weather";
const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=48.5296&longitude=12.1618&hourly=rain';

const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const db = mongoClient.db("weather");

app.use(express.json());
app.use(cors());

app.get('/getRainDataFromApi', async (req, res) => {
    try {
        const response = await axios.get(API_URL);
        console.log(response)
        const rainData = response.data
        const convertedRainDate = convertRainData(rainData)
        console.log("convertedRainDate", convertedRainDate)

        if (!rainData) {
            console.log("No rain Data")
        } else {
            (console.log("rainData:", rainData))
            return res.json({rainData});
        }
    } catch (error) {
        console.error("error",
            error.message
        );
    }
});

function convertRainData(rainData) {
    const times = rainData.hourly.time;
    const rains = rainData.hourly.rain;

    return times.map((time, index) => {
        const rainMM = rains[index];
        return {
            date: time.split("T")[0],
            hour: time.split("T")[1].slice(0, 5),
            rain_mm: rainMM,
            rain: rainMM > 0
        };
    });
}

const time = "2025-05-16T14:00:00Z";
const rainMM = 0.2;

const foo = [{
    date: time.split("T")[0],
    hour: time.split("T")[1].slice(0, 5),
    rain_mm: rainMM,
    rain: rainMM > 0
}, {
    date: time.split("T")[0],
    hour: time.split("T")[1].slice(0, 5),
    rain_mm: rainMM,
    rain: rainMM > 0
}
]

async function verifyMongoConnection() {
    try {
        await mongoClient.connect();
        await mongoClient.db("admin").command({ping: 1});

        const collection = db.collection("rainData");
        const result = await collection.insertMany(foo);

        console.log("MongoDB connection verified.");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
    } finally {
        await mongoClient.close();
    }
}

app.get('/getRainDataFromDB', async (req, res) => {
    try {
        await mongoClient.connect();
        const collection = db.collection("rainData");

        const rainData = await collection.find().toArray();
        return res.json({rainData});
    } catch (error) {
        console.error("Fehler beim Abrufen der Mongo-Daten:", error.message);
        res.status(500).json({error: error.message});
    } finally {
        await mongoClient.close(); // Verbindung schließen
    }
});

app.listen(port, () => {
    console.log("Server Listening on PORT:", port);
    verifyMongoConnection();
});