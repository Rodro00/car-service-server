const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 1000;

// middleware
app.use(cors());
app.use(express.json());

console.log()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@car-service.rhyxtaz.mongodb.net/?retryWrites=true&w=majority&appName=car-service`;

// console.log(uri)
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

    const serviceCollection = client.db('carMaintain').collection('services');
    const bookingCollection = client.db('carMaintain').collection('booking');

    //todo: all data load from database
    app.get('/services', async(req,res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // todo: specific data load from database
    app.get('/services/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await serviceCollection.findOne(query);
      res.send(result)
    })


    // booking services
    app.get('/booking', async (req,res)=>{
      console.log(req.query.email)
      // get data by filtering
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email};
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })

    // send data clint side to server side or post method
    app.post('/booking', async(req,res)=>{
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    // update method
    app.patch('/booking/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateBooking = req.body;
      console.log(updateBooking)
      const updateDoc = {
        $set: {
          status: updateBooking.status
        }
      }
      const result = await bookingCollection.updateOne(filter,updateDoc);
      res.send(result);

    })

    // delete method
    app.delete('/booking/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('service is running')
})

app.listen(port, ()=>{
    console.log(`car doctor is running on port ${port}`)
})