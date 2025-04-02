const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware 
app.use(cors());
app.use(express.json());

// DB_USER = restaurant_management
// DB_PASS = Ju6P4hLb4M0JTtEv




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fwblr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // restaurant related apis
    const restaurantCollection =  client.db("restaurantPortal").collection("restaurants");
    const foodOrderCollection = client.db("restaurantPortal").collection("foodOrder");


    app.get('/restaurants', async(req, res) =>{
        const cursor = restaurantCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    app.get("/restaurants/:id", async(req, res )=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await restaurantCollection.findOne(query);
        res.send(result);
    });
    // add food
    app.post('/restaurants', async(req, res)=>{
      const newFood = req.body;
      const result = await restaurantCollection.insertOne(newFood);
      res.send(result);

    })
    app.get("/myFoodOrder", async(req, res) =>{
      const email = req.query.email;
      const query = {applicant_email: email};
      const result = await foodOrderCollection.find(query).toArray();
      
      for(const order of result){
        console.log(order.job_id);
        const query1 = {_id: new ObjectId(order.job_id)}
        const purchase = await restaurantCollection.findOne(query1);
        const od = {};
        if(od){
          order.foodOrigin = od.foodOrigin;
        }
      }
      res.send(result);
    })
    app.post('/foodOrder', async(req, res) =>{
      const order = req.body;
      const result = await foodOrderCollection.insertOne(order);
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})