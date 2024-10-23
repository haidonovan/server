// server.js

const express = require('express');
// const serverless = require("serverless-http");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection string
DB = "coffee";
const uri = `mongodb+srv://actionboyz2345:VPY0Klw2qXledssT@cluster0.zlaqsok.mongodb.net/${DB}?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a Mongoose schema
// const productSchema = new mongoose.Schema({
//   name: String,
//   category: Number,
//   price: Number,
//   status: String,
//   description: String
// });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // Use String for category name
  price: { type: Number, required: true },
  status: { type: Number, required: true },
  description: { type: String, required: true },
  url: {type: String, required: false}
}, {
  timestamps: true, // Optional: Automatically add createdAt and updatedAt fields
});


// Create a Mongoose model
const Product = mongoose.model('Product', productSchema, 'product');

// Function to insert a product
// ctr + c to disconnect

// insertProduct("water", 100);

// async function insertProduct(name, price) {
//   try {
//     await mongoose.connect(uri);
//     console.log('MongoDB connected');

//     const product = new Product({
//       name: name,
//       price: price
//     });

//     const savedProduct = await product.save();
//     console.log('Product inserted:', savedProduct);
//   } catch (err) {
//     console.error('Error inserting product:', err.message);
//   } finally {
//     await mongoose.disconnect(); // Disconnect after insertion
//   }
// }

// --------------------------------- GET DATA
// GET all products
// GET a product by name
app.get('/', async (req, res) => {
  res.status(200).send("Hello Server!");
});
app.get('/about', async (req, res) => {
  res.status(200).send("About page!");
});

app.get('/products/:name', async (req, res) => {
  try {
    const product = await Product.findOne({ name: req.params.name });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// app.get('/products', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// --------------------------------- INSERT DATA
// POST a new product
app.post('/products', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    status: req.body.status,
    description: req.body.description,
  });

  try {
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --------------------------------- DELETE DATA
// DELETE a product by name and price
app.delete('/products', async (req, res) => {
  const { name, price } = req.body;

  try {
    const deletedProduct = await Product.findOneAndDelete({ name: name, price: price });
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found!' });
    }

    res.json({ message: 'Product deleted', deletedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------------ UPDATE DATA
app.put('/products', async(req, res)=>{
  const {name, newPrice} = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      {name: name},
      {price: newPrice},
      {new: true }
    );
  
    if(!updatedProduct){
      return res.status(404).json({message: 'Product not found!'})
    }

    res.json({message: 'Product updated', updatedProduct});
  } catch (err){
    res.status(500).json({message: err.message})
  }
});

// Start the server
// Local
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// global
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on http://0.0.0.0:${PORT}`);
// });


// module.exports.handler = serverless(app);