const express = require('express');
const { Collection } = require('mongodb');
const MongoClient = require("mongodb").MongoClient
var ObjectId = require('mongodb').ObjectId; 

const bodyParser = require('body-parser');
const { response } = require('express');



const app = express()
app.use(bodyParser.json());
app.use(express.json())
const PORT = 3000;
const client = new MongoClient("mongodb://localhost:27017", { useUnifiedTopology: true });





(async () => {
    await client.connect()
    const database = client.db("asignment1")
  
//Creates an event and returns the Id of the event i.e. created
    app.post('/api/v3/app/events', function (req, res) {
        try {
            const jsonData = req.body
            if (
                (typeof (jsonData.name) == "string") &&
                (typeof (jsonData.tagline) == "string") &&
                (typeof (jsonData.description) == "string") &&
                (typeof (jsonData.moderator) == "string") &&
                (typeof (jsonData.category) == "string") &&
                (typeof (jsonData.sub_category) == "string") &&
                (typeof (jsonData.rigor_rank) == "number")
            ) {
                console.log("if else true case")
                // Sending request to create a data
                database.collection('event').insertOne(jsonData, function (err, data) {
                    if (err) { console.log(err) }
                    return res.json({ unique_id: data.insertedId })
                })
            }
            else {
                
                return res.json({ error: "invalid values" })
            }

        } catch (error) {
            console.log("error internal")
            res.send(error)
            console.log(error)

        }

    })
//Gets an event by its unique id
    app.get('/api/v3/app/events/:id', async function (req, res,next){
        if (!req.query.id){

            next();
            return;

        }
        try {
            let unique_id=req.query.id
            console.log(unique_id)
          
            
            database.collection('event').findOne(ObjectId(unique_id),function(err,data){
                if(err){
                    return res.json({error:"no data found with specified id"})
                }
                console.log(data)
                return res.json(data)}
            )
          
        } catch (error) {
            console.log("internal error")
           return res.json({error:error})
        }

    })

    //Gets an event by its recency & paginate results by page number and limit of events per page
    app.get('/api/v3/app/events', function(req,res) {
        
        try {
            let limit=parseInt(req.query.limit)
            let page =parseInt(req.query.page)
            console.log(database.collection('event').find().sort({$natural: -1}).limit(limit).skip(page-1).toArray((err, result) => {
                if(err){
                    console.log(err)
                    return res.json({error:err})
                }
                console.log(result);
                return res.json(result)
            })
            )
            
            
        } catch (error) {
            console.log(error)
            return res.json({error:"internal error "})
        }
        
    })

    app.delete('/api/v3/app/events/:id',async function(req,res){
        try {
            let id=req.params.id
            database.collection('event').findOneAndDelete({"_id":ObjectId(id)}, function(err,data){
                if(err){
                    console.log(err)
                    return res.json({error:err})
                }
                return res.send("Event deleted succesfully")
            })
            
        } catch (error) {
            console.log(error)
            return res.json({error:"internal server error"})
        }
    })

    app.put('/api/v3/app/events/:id',async function(req,res){
        try {
            let id=req.params.id
            const updateData=req.body
            if (
                (typeof (updateData.name) == "string") &&
                (typeof (updateData.tagline) == "string") &&
                (typeof (updateData.description) == "string") &&
                (typeof (updateData.moderator) == "string") &&
                (typeof (updateData.category) == "string") &&
                (typeof (updateData.sub_category) == "string") &&
                (typeof (updateData.rigor_rank) == "number")
            )
            database.collection('event').findOneAndUpdate({"_id":ObjectId(id)},{$set :updateData} , function(err,data){
                if(err){
                    console.log(err)
                    res.json({error:err})
                }
                return res.json(updateData)
            })
            
        } catch (error) {
            console.log(error)
            res.json({error:"internal server error"})
        }
    })

    console.log("connected to database")
})();


// app.get('/testRoute', (req, res) => res.send('Hello from Server!'))



app.listen(PORT, () => {
    console.log(`Node.js App running on port ${PORT}...`)
})