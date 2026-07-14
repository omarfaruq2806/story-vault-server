import type { Request, Response, Express } from "express";
import mongodb = require("mongodb");
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

    // post a story
    app.post("/api/stories", async (req: Request, res: Response) => {
      const newStory = req.body;
      const result = await storiesCollection.insertOne({ ...newStory , createdAt: new Date() });
      console.log(result , 'from db');
      res.send(result);
    });


    // get all stories
    app.get("/api/stories", async (req: Request, res: Response) => {
    const { userId, search, category, page = 1, limit = 10, latest, priceSort } = req.query;
  
    let query: any = {};
    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (search) {
      query.title = { $regex: search, $options: 'i' }; 
    }

    

    let sortingOption: any = {};
    if (latest === 'true') {
      sortingOption = { createdAt: -1 };
    }else if (priceSort === 'asc') {
    sortingOption = { price: 1 };
    } else if (priceSort === 'desc') {
    sortingOption = { price: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
  
    const result = await storiesCollection
    .find(query)
    .sort(sortingOption)
    .skip(skip)
    .limit(Number(limit))
    .toArray();
    
    res.send(result);
    });

    // delete a story
    app.delete("/api/stories/:id", async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const query = { _id: new mongodb.ObjectId(id) };
      const result = await storiesCollection.deleteOne(query);
      res.send(result);
    });

    // get a single story
    app.get("/api/stories/:id", async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const query = { _id: new mongodb.ObjectId(id) };
      const result = await storiesCollection.findOne(query);
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});