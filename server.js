const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 5000;

//* Middle wires
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@phero-crud.9f5td.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

async function run() {
   try {
      await client.connect();
      console.log('Connected successfully to mongo server');

      const database = client.db('solrufUsers');
      const solrufUsersCollection = database.collection('users');

      //* saving user profile to database
      app.post('/saveUserProfile', async (req, res) => {
         const userProfile = req.body;

         const response = await solrufUsersCollection.findOne({
            email: userProfile.email,
         });

         if (response.email === userProfile.email) {
            res.json({ message: 'User already exists' });
         } else {
            const result = await solrufUsersCollection.insertOne({
               $set: userProfile,
            });

            res.json(result);
         }
      });

      //* getting user profile from database
      app.get('/getUserProfile/:email', async (req, res) => {
         const userProfile = await solrufUsersCollection.findOne({
            email: req.params.email,
         });
         res.json(userProfile);
      });

      //* updating a user profile
      app.put('/updateProfile', async (req, res) => {
         const image = req.files.image;
         const imageData = image?.data;
         const encodedImage = imageData.toString('base64');
         const imageBuffer = Buffer.from(encodedImage, 'base64');

         const result = await solrufUsersCollection.updateOne(
            { email: req.body.email },
            {
               $set: { photoUrl: imageBuffer, displayName: req.body.name },
            }
         );

         res.json(result);
      });
   } finally {
      //   await client.close();
   }
}
run().catch(console.dir);

app.get('/', (req, res) => {
   res.send("<h1>Solruf's server is up and running!</h1>");
});

app.listen(PORT, () => {
   console.log(`Shomex server is running on port ${PORT}`);
});
