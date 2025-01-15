const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// midleWare
app.use(cors())
app.use(express.json())






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u2fu7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

   
    const usersCollection = client.db("BloodDonate").collection("users");

    // jwt api related
    app.post('/jwt',async(req,res)=>{
      const user = req.body
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'365d' })
      res.send({token})
    })

    // Verifytoken 

    const Verifytoken = (req,res,next)=>{
      console.log('insert token',req.headers.authorization)
      if(!req.headers.authorization){
        return res.status(401).send({message:'Forbidden message'})
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err ,decoded)=>{
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
      })
      next()
    }










    // users collection
    app.get('/users',Verifytoken,async(req,res)=>{
      console.log(req.headers)
    
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    app.get('/users/profile', async (req, res) => {
      try {
        const email = req.query.email; // Get email from query params
        const query = { email: email }; // Construct query object
        const user = await usersCollection.findOne(query); // Find user by email
        if (user) {
          res.send(user); // Send the user data
        } else {
          res.status(404).send({ message: 'User not found' });
        }
      } catch (error) {
        res.status(500).send({ message: 'Error fetching user profile', error });
      }
    });
    

    app.patch('/users/admin/:id',async(req,res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updatedoc = {
        $set:{
          role:'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedoc)
      res.send(result)
    })
   
    
    
    


    app.post('/users',async(req,res)=>{
     const userData=req.body
      const result =  await usersCollection.insertOne(userData)
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



















app.get('/', (req, res) => {
  res.send('Blood Donation!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})