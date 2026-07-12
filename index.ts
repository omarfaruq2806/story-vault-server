import type { Request, Response, Express } from "express";
const express = require("express");
const app: Express = express();
require("dotenv").config();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db("storyvault");
    const usersCollection = db.collection("user");
    const storiesCollection = db.collection("stories");

    // get all users
    // app.get("/api/users", async (req: Request, res: Response) => {
    //   const result = await usersCollection.find({}).toArray();
    //   res.send(result);
    // });

    // post a story
    app.post("/api/stories", async (req: Request, res: Response) => {
      const newStory = req.body;
      const result = await storiesCollection.insertOne(newStory);
      console.log(result , 'from db');
      res.send(result);
    });

    // get all stories
    app.get("/api/stories", async (req: Request, res: Response) => {
      const result = await storiesCollection.find({}).toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});