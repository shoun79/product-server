const express = require('express');
require('dotenv').config()
const app = express();
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require("colors");

//middleware
app.use(cors());
app.use(express.json());

//productManagement 
//ZKFBjrVjqcy5sJzr

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cg7riyw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function dbConnect() {
    try {
        await client.connect();

        console.log('Db connected'.yellow);
    } catch (error) {
        console.log(error.name.bgRed, error.message, error.stack);

    }
}
dbConnect();

const productCollection = client.db('productDB').collection('products');

//endpoint/express routes

app.get('/products', async (req, res) => {
    try {
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        console.log(result);
        res.send({
            success: true,
            message: 'Successfully got the Product',
            data: result
        })
    } catch (error) {
        console.log(error.name.bgRed, error.message, error.stack);
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await productCollection.findOne({ _id: new ObjectId(id) })
        res.send({
            success: true,
            data: result
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.post('/products', async (req, res) => {
    try {
        const result = await productCollection.insertOne(req.body);
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully created the ${req.body.name} with id ${result.insertedId}`
            })
        }
        else {
            res.send({
                success: false,
                message: "Couldn't create the product"
            })
        }
    } catch (error) {
        console.log(error.name.bgRed, error.message, error.stack);
        res.send({
            success: false,
            error: error.message
        })
    }
});

app.patch('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = req.body;
        const result = await productCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
        if (result.modifiedCount) {
            res.send({
                success: true,
                message: `Successfully Updated ${req.body.name}`
            })
        }
        else {
            res.send({
                success: false,
                error: "Couldn't update the product"
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productCollection.findOne({ _id: new ObjectId(id) });
        if (!product?._id) {
            res.send({
                success: false,
                message: "Product doesn't exist"
            })
            return;
        }

        const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount) {
            res.send({
                success: true,
                message: `Successfully deleted the ${product.name}`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})



app.get('/', (req, res) => {
    res.send('Product server running...')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`.cyan)
})