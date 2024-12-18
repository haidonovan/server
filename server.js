// server.js

const express = require('express');
// const serverless = require("serverless-http");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// aws upload
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

// .env
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,      // replace with your access key
  secretAccessKey: process.env.secretAccessKey, // replace with your secret key
  region: process.env.region             // replace with your bucket's region
});


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection string
const uri = process.env.uri;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));



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

// --------------------------New Model products
const productsSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  categories: [{ type: Number, required: true }], // Assuming categories are numbers, update if needed
  price: { type: Number, required: true },
  priceRange: [{ type: Number, required: false }], // Array of price ranges
  status: { type: String, required: true }, // 'Available' or 'Sold'
  available: { type: Number, required: false }, // Quantity available
  sold: { type: Number, required: false }, // Quantity sold
  description: { type: String, required: false },
  url: { type: String, required: false }
}, {
  timestamps: true,
});







// ================================================================ NEW  SCHEMA ==================================================================


// -------------------------- ACCOUNT SCHEMA 
const accountsSchema = new mongoose.Schema({
  id: {type: Number, required: true },
  name: { type: String, required: true},
  username: { type: String, required: true},
  password: {type: String, required: true},
  type: { type: String, required: true},

}, {
  timestamps: true,
});



// -------------------------- INVOICE SCHEMA  
const invoiceSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  host: {type: String, required: false},
  name: { type: String, required: true },
  total_price: {type: Number, required: false},
  payment: {type: Number, required: false},
  change: {type: Number, required: false},

  // khmer exchange
  khmerTotalCost:{type: Number, required: false},
  khmerPayment:{type: Number, required: false},
  khmerChange:{type: Number, required: false},


  // Array of product objects for each item in the invoice
  products: [{
    itemName: {type: String, required: false},
    cupSize: { type: String, required: false },         // e.g., "Small", "Medium", "Large"
    cupSizePrice: { type: Number, required: false },    // price based on cup size
    iceLevel: { type: String, required: false },        // e.g., "No Ice", "Less Ice", "Normal Ice"
    sugarSize: { type: String, required: false },       // e.g., "No Sugar", "Half Sugar", "Full Sugar"
    amount: { type: Number, required: false },           // quantity of the order
    category: { type: String, required: false },          // e.g., "Beverage", "Dessert", "Snack"
    total: { type: Number, required: false },
  }]
}, {
  timestamps: true,
});



// -------------------------- ORDER SCHEMA 

const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  customerId: { type: String, required: false },
  employeeId: { type: String, required: false },
  // Array of product objects for each item in the invoice
  productId: [{
    itemName: {type: String, required: false},
    cupSize: { type: String, required: false },         // e.g., "Small", "Medium", "Large"
    cupSizePrice: { type: Number, required: false },    // price based on cup size
    iceLevel: { type: String, required: false },        // e.g., "No Ice", "Less Ice", "Normal Ice"
    sugarSize: { type: String, required: false },       // e.g., "No Sugar", "Half Sugar", "Full Sugar"
    amount: { type: Number, required: false },           // quantity of the order
    category: { type: String, required: false },          // e.g., "Beverage", "Dessert", "Snack"
    total: { type: Number, required: false },
  }]
}, {
  timestamps: true,
});








// IP address schema

const ipAddressSchema = new mongoose.Schema({
  ip:{type:String, required: true},
  userAgent: {type:String, required: true},
  referrer: {type:String, required: false},
});

// -------------------------- CATEGORIES SCHEMA
const categoriesSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  category: { type: String, required: true },
  img: [{
    url: { type: String, required: false },
    imgId: { type: String, required: false },
  }],
},
  {
    timestamps: true,
  });


// new categories connection
const Categories = mongoose.model('categories', categoriesSchema, 'categories');

// Create a Mongoose model
const Product = mongoose.model('Product', productSchema, 'product');

// new Ip Address tracking for cookies
const IpAddressModel = mongoose.model('Ipaddress',ipAddressSchema ,'ipaddress');

// NEW PRODUCT
const Products = mongoose.model('products', productsSchema, 'products');

// ============================================================================= NEW ===============================================================================================

// account collection
const Account = mongoose.model('account', accountsSchema, 'account');

// invoice model collection
const Invoice = mongoose.model('invoice', invoiceSchema, 'invoice');

// order model collection
const Order = mongoose.model('order', orderSchema, 'order');

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

app.get('/', async(req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  const referrer = req.get('referer') || 'No referrer';
  console.log('Client IP:', clientIp);
  


  const ipAddress = new IpAddressModel({
    ip:clientIp,
    userAgent: userAgent,
    referrer: referrer,
  });

  try {
    const savedIp = await ipAddress.save();
    res.status(201).send(`
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IP Information</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f4f8;
            color: #333;
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
          }
          h1 {
            color: #4a90e2;
            font-size: 2.5em;
            margin-bottom: 20px;
          }
          p {
            font-size: 1.2em;
            line-height: 1.6;
            margin: 10px 0;
          }
          .info {
            background-color: #e8f4fd;
            border-left: 4px solid #4a90e2;
            padding: 10px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            font-size: 0.9em;
            color: #777;
            text-align: center;
            margin-top: 20px;
          }
          a {
            display: inline-block;
            margin-top: 10px;
            padding: 10px 15px;
            background-color: #4a90e2;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
          }
          a:hover {
            background-color: #357ab8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hello, I'm Furina Senpai Blehhhhhhhhhh!!!</h1>
          <p>This is your information:</p>
          <div class="info">
            <p><strong>IP:</strong> ${clientIp}</p>
            <p><strong>User-Agent:</strong> ${userAgent}</p>
            <p><strong>Referrer:</strong> ${referrer}</p>
            <p><strong>Saved IP Record:</strong> ${JSON.stringify(savedIp, null, 2)}</p>
          </div>
          <div class="footer">
            <p>Thank you for visiting!</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
  
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


// --------------------------------- GET ALL PRODUCT
app.get('/AllProducts', async (req, res) =>{
  try {
    const products = await Product.find();
    res.json(products);
  }catch(err){
    res.status(500).json({message: err.message});
  }
});

// --------------------------------- DELETE DATA
// DELETE a product by name and price
app.delete('/products', async (req, res) => {
  const { name, price } = req.body;

  try {
    const deletedProduct = await Product.findOneAndDelete({ name: name});
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found!' });
    }

    res.json({ message: 'Product deleted', deletedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------------ UPDATE DATA
app.put('/products', async (req, res) => {
  const { originalName, newName, category, price, status, description} = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { name: originalName }, // Find product by the original name
      { 
        name: newName,          // Update name
        category: category,     // Update category
        price: price,           // Update price
        status: status,         // Update status
        description: description, // Update description
      }, 
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found!' });
    }

    res.json({ message: 'Product updated successfully', updatedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});








// ================================================================ ADMIN API PRODUCT ===================================================================================


// ADMIN API FIND PRODUCT HAVE SPECIFIC CATEGRIES

// GET PRODUCT USING CATE ID

app.get('/get/products/categories/:id', async (req, res) => {
  const categoryId = parseInt(req.params.id); // Get category ID from URL and convert to an integer

  try {
    // Aggregation pipeline to find products matching the category ID
    const results = await Products.aggregate([
      {
        $match: {
          categories: categoryId // Checks if categoryId exists in the categories array
        }
      }
      // No $project stage, so the entire product document will be returned
    ]);

    if (results.length > 0) {
      return res.status(200).json({ found: true, products: results });
    } else {
      return res.status(404).json({ found: false, message: 'No products found with that category ID.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});






















// ============================================================== CRUD OPERATION

// ========= GET ONE PRODUCT IF NOT EXIST GET NEXT PRODUCT WHO HAVE ID GREATER THAN ====================== /get/products/next/id
//
app.post('/get/products/next/id', async (req, res) => {
  try {
    const { id } = req.body; // Extracting id from the request body

    // Validate if the id is a valid number
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid ID: ID must be a number." });
    }

    // Attempt to find the product by id
    const product = await Products.findOne({ id: productId });

    if (product) {
      // If the product is found, return it
      return res.status(200).json({ message: "/get/products success!!", result: product });
    } else {
      // If not found, look for the next product with a greater ID
      const nextProduct = await Products.findOne({ id: { $gt: productId } }).sort({ id: 1 });

      if (nextProduct) {
        return res.status(200).json({ message: "Product not found. Returning next greater product.", result: nextProduct });
      } else {
        return res.status(404).json({ message: "No product found greater than the provided ID." });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!!", error: error.message });
  }
});










// ======================== GET ALL PRODUCT ====================== /get/products/all
//
app.get('/get/products/all', async (req, res) => {
  try {
    // Fetch all products sorted by the id field in ascending order (1 to infinite)
    const result = await Products.find().sort({ id: 1 });

    // Send a success response with the results
    res.status(200).json({ message: "/get/products/all success!!", result: result });
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).json({ message: "Internal Server Error!!", error: error.message });
  }
});

// =========================== GET ID ONE PRODUCTS =================== /get/products/:id

app.get('/get/products/:id', async(req, res) => {
  try {
    const { id } = req.params; // Extract the id from the request parameters

    // Check if the id is a number
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID!!", result: [] });
    }

    const result = await Products.find({ id: Number(id) }); // Convert id to a number for querying

    // If no products found, return 404
    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found", result: [] });
    }

    return res.status(200).json({ message: "Success!!", result: result });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});









// ======================== PUT PRODUCT UPDATE ====================== /update/products/:id

app.put('/update/products/:id', async (req, res) => {
  try {
    
    const id = parseInt(req.params.id, 10); // Convert id to an integer

    // Validate if the id is a valid number
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID: ID must be a number." });
    }
    const {name, categories, price, priceRange, status, available, sold, description, url } = req.body;
    const result = await Products.updateOne(
      {id:id},{
        // Use $set to update only the provided fields
        $set: {
          name,
          categories,
          price,
          priceRange,
          status,
          available,
          sold,
          description,
          url
        }
      }
    );
    // Check if any document was modified
    if(result.modifiedCount === 0){
      return res.status(404).json({message:"Product not found or no changes made."});
    }

    res.status(200).json({message:"/update/products/:id success!!", result:result});


  }catch(error){
    res.status(500).json({message:"Internal Server Error!!",error:error.message});
  }
});







// ======================== DELETE PRODUCT ====================== /delete/products/:id

app.delete('/delete/products/:id', async(req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // Convert id to an integer

    // Validate if the id is a valid number
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID: ID must be a number." });
    }
    const result = await Products.deleteOne({id:id});

    if(result.deletedCount === 0){
      return res.status(400).json({message:"Can't find the Product to Delete", result: result});
    }

    return res.status(200).json({message:"/delete/products/:id success!!", result:result});


  }catch(error){
    res.status(500).json({message:"Internal Server Error!!",error:error.message});
  }
});










// ========= DELETE IF NOT EXIST DELETE NEXT PRODUCT ====================== /delete/products/next/:id
// 
app.delete('/delete/products/next/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // Convert id to an integer

    // Validate if the id is a valid number
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID: ID must be a number." });
    }

    // Attempt to delete the specified ID
    const result = await Products.deleteOne({ id: id });

    // Check if the specified product was deleted
    if (result.deletedCount === 0) {
      // If not, find the next greater ID
      const nextGreaterProduct = await Products.findOne({
        id: { $gt: id }
      }).sort({ id: 1 }); // Find the next closest ID greater than the specified ID

      if (nextGreaterProduct) {
        // Delete the next greater product if found
        const deleteResult = await Products.deleteOne({ id: nextGreaterProduct.id });
        return res.status(200).json({
          message: `Product ID ${id} not found. Deleted next greater product ID ${nextGreaterProduct.id}.`,
          result: deleteResult
        });
      } else {
        // If no greater product exists
        return res.status(404).json({ message: "No greater product available to delete." });
      }
    }

    // Respond with a success message for the original ID
    return res.status(200).json({ message: "Product deleted successfully!", result: result });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});


// ======================== POST PRODUCT ADD NEW PRODUCT ====================== /post/products/one

app.post('/post/products/one/:name/:categories/:price/:priceRange/:status/:available/:sold/:description', async (req, res) => {
  try {
    // Extracting the parameters from req.params
    const { name, categories, price, priceRange, status, available, sold, description } = req.params;
    let fileBuffer = []; // To hold chunks of image data

    req.on('data', chunk => {
      fileBuffer.push(chunk); // Collect incoming data chunks for the image
    });

    req.on('end', async () => {
      const completeBuffer = Buffer.concat(fileBuffer); // Concatenate all chunks into a single buffer

      try {
        // Upload image to S3 and get the URL and unique file name
        const { uniqueFileName, url } = await uploadImageProduct(completeBuffer, name);

        // Find the product with the highest ID
        const largestProduct = await Products.findOne().sort({ id: -1 });
        let nextId = 1; // Default ID if no products exist

        if (largestProduct) {
          nextId = largestProduct.id + 1; // Increment the largest ID by 1
        }

        console.log(`New product ID: ${nextId}`);

        // Create a new product document
        const newProduct = new Products({
          id: nextId, // Use the incremented ID
          name,
          categories: JSON.parse(categories), // Parse categories if sent as a stringified array
          price: parseFloat(price),
          priceRange: JSON.parse(priceRange), // Parse priceRange if sent as a stringified array
          status,
          available: JSON.parse(available),
          sold: parseInt(sold, 10),
          description,
          url, // Image URL from S3
          imgId: uniqueFileName, // Image's unique file name
        });

        // Save the new product to the database
        await newProduct.save();

        console.log('New product added:', newProduct);

        // Respond with success
        res.status(201).json({ message: "Product created successfully!", product: newProduct });
      } catch (error) {
        console.error('Error during product creation:', error);
        res.status(500).json({ message: "Error during product creation.", error: error.message });
      }
    });
  } catch (error) {
    console.error('Error setting up product upload:', error);
    res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});

const uploadImageProduct = async (fileBuffer, originalName) => {
  const uniqueId = uuidv4();
  const uniqueFileName = `products/${originalName}-${uniqueId}.jpg`;

  const params = {
    Bucket: 'shop-coffee-website',
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: 'image/jpg',
  };

  try {
    await s3.upload(params).promise();
    console.log(`Image uploaded successfully: ${uniqueFileName}`);

    // Generate public link
    const url = `https://${params.Bucket}.s3.amazonaws.com/${uniqueFileName}`;
    console.log(`URL: ${url}`);

    return { uniqueFileName, url };
  } catch (error) {
    console.error('Error uploading image: ', error);
    throw new Error('Failed to upload image to S3.');
  }
};


// ================================================================ ADMIN API CATEGORIES ===================================================================================

// ===================== GET REQUEST CATEGORIES ==============================

app.get('/get/categories/all', async(req, res) => {
  try {
    const result = await Categories.find().sort({ createdAt: 1 });

    if(!result){
      return res.status(400).json({message:"can't find any Categories", result:result});
    }
    return res.status(200).json({message:"success find all categories!!", result: result});

  }catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});


// ===================== POST CREATE REQUEST CATEGORIES ==============================
// ===================================================================================================================================

app.post('/create/categories', async (req, res) => {
  try {
    // Find the latest category by sorting in descending order (newest first)
    const latestCategory = await Categories.findOne().sort({ createdAt: -1 });

    let newId;
    
    // If a category exists, increment its ID, otherwise start from 1
    if (latestCategory) {
      newId = latestCategory.id + 1;
    } else {
      newId = 1; // If no categories exist, start with ID 1
    }

    // Create a new category with the incremented ID
    const newCategory = new Categories({
      id: newId,
      category: req.body.category, // Get category name from the request body
      img: req.body.img, // Get the image array from the request body
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the new category to the database
    const savedCategory = await newCategory.save();

    // Return success response
    return res.status(201).json({ message: "Category created successfully!", category: savedCategory });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});


// ===================== DELETE REQUEST CATEGORIES ==============================

app.delete('/delete/categories/id', async(req, res) => {

  try {
    const {id} = req.body;
    
    if(!id){
      return res.status(400).json({ message: "ID is required" });
    }

    const intId = parseInt(id,10);
    if (!Number.isInteger(intId)) {
      return res.status(400).json({ message: "ID must be an integer" });
    }

    const result = await Categories.deleteOne({id:intId});


    if(result.deletedCount === 0){
      return res.status(404).json({message:"can't find any"})
    }

    // Successful deletion
    return res.status(200).json({ message: "Category deleted successfully!" });

  }catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});





// ======================================================================= ACCOUNT 



// -------------------------- CREATE (POST) -------------------------- /create/account

app.post('/create/accounts', async (req, res) => {
  try {
    const { name, username, type, password } = req.body;

    // Find the latest document by sorting on the `id` field in descending order
    const lastAccount = await Account.findOne().sort({ id: -1 });

    // Auto-increment the id
    const newId = lastAccount ? lastAccount.id + 1 : 1; // If no accounts exist, start from id = 1

    // Create the new account with the incremented id
    const newAccount = new Account({
      id: newId,      // Auto-incremented id
      name,
      username,
      password,
      type
    });

    // Save the new account to the database
    await newAccount.save();

    res.status(201).json({ message: 'Account created successfully', account: newAccount });
  } catch (error) {
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
});


// -------------------------- READ (GET ALL) -------------------------- /get/accounts/all

app.get('/get/accounts/all', async (req, res) => {
  try {
    const accounts = await Account.find(); // Fetch all accounts
    res.status(200).json({ message: 'Accounts retrieved successfully', accounts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accounts', error: error.message });
  }
});

// -------------------------- READ (GET BY ID) -------------------------- /get/accounts/:id

app.get('/get/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findOne({ id: Number(id) });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json({ message: 'Account retrieved successfully', account });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account', error: error.message });
  }
});


// ------------------------------ LOGIN ------------------------------------- /get/username/verify/password

app.post('/verify/accounts/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { password } = req.body;  // Expecting password from request body
    const account = await Account.findOne({ username: String(username) });

    if (!account) {
      return res.status(404).json({ message: 'Incorrect username or password' });
    }

    if (account.password == password) {  // Assuming password is stored as plain text
      res.status(200).json({ message: 'Account retrieved successfully', account });
    } else {
      return res.status(404).json({ message: 'Incorrect username or password' });
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account', error: error.message });
  }
});



// -------------------------- UPDATE (PUT) -------------------------- /update/accounts/:id

app.put('/update/accounts/:id', async (req, res) => { 
  try {
    const { id } = req.params;
    const { name, username, type, password } = req.body;

    const updatedAccount = await Account.findOneAndUpdate(
      { id: Number(id) }, // or { _id: id } if you're using MongoDB's default _id field
      { name, username, type, password }, // Combine all fields to update into one object
      { new: true, runValidators: true } // Options: return the new document and run validations
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json({ message: 'Account updated successfully', account: updatedAccount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating account', error: error.message });
  }
});



// -------------------------- DELETE (DELETE) -------------------------- /delete/accounts/:id

app.delete('/delete/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAccount = await Account.findOneAndDelete({ id: Number(id) });

    if (!deletedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully', account: deletedAccount });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});




// ===============================================================================  END OF ACCOUNT CRUD OPERATION  ================================================








// ===============================================================================  INVOICE CRUD OPERATION  ================================================




// Route to get invoices by date range
app.get('/get/invoices', async (req, res) => {
  const { startDate, endDate } = req.query;

  // Check if both dates are provided
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Both startDate and endDate are required' });
  }

  // Convert the date strings to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Ensure the end date is inclusive of the end day
  end.setHours(23, 59, 59, 999);

  try {
    // Find invoices within the date range
    const invoices = await Invoice.find({
      createdAt: {
        $gte: start,  // greater than or equal to the start date
        $lte: end     // less than or equal to the end date
      }
    });

    // Return the found invoices
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// =============================================== CREATE INVOICE invoices |          /create/invoices

app.post('/create/invoices', async (req, res) => {
  try {
    const { name, host, products,payment,total_price,change,khmerTotalCost,khmerPayment,khmerChange } = req.body; // Get parameters from the request body

    // Validate that 'products' is an array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array must be provided and cannot be empty.' });
    }

    // Validate each product (you can adjust validation based on your needs)
    products.forEach(product => {
      if (!product.amount || !product.category) {
        return res.status(400).json({ message: 'Each product must have an amount and a category.' });
      }
    });

    // Find the latest invoice by sorting the id in descending order
    const latestInvoice = await Invoice.findOne().sort({ id: -1 });

    // Determine the next ID
    const nextId = latestInvoice ? latestInvoice.id + 1 : 1; // Start from 1 if no documents exist

    // Create a new invoice with the incremented ID and products array
    const invoice = new Invoice({ 
      id: nextId, 
      name,
      host,
      products,
      payment,
      total_price,
      change,

      khmerPayment,
      khmerTotalCost,
      khmerChange,
    });

    // Save the new invoice to the database
    await invoice.save();

    // Respond with the created invoice
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// =============================================== Read all invoices |            /get/invoices/all

app.get('/get/invoices/all', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================================== Read a specific invoice by ID | /get/invoices/:id

app.get('/get/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ id: req.params.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================================== Update an invoice by ID (U)  | /update/invoices/:id

app.put('/update/invoices/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const invoice = await Invoice.findOneAndUpdate(
      { id: req.params.id },
      { name },
      { new: true, runValidators: true }
    );
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ================================================   Delete an invoice by ID (D) | /delete/invoices/:id

app.delete('/delete/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ id: req.params.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================================================================================================ END OF INVOIC ================================================










// ========================================================================================== ORDER CRUD OPERATION ================================================




// =============================================== Create a new order | /create/order
//  lack

app.post('/create/order', async (req, res) => {
  try {
    const { customerId, employeeId, productId } = req.body; // Get parameters from the request body

    // Validate input
    if (!customerId || !employeeId || !productId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Find the latest order by sorting the id in descending order
    const latestOrder = await Order.findOne().sort({ id: -1 });

    // Determine the next ID
    const nextId = latestOrder ? latestOrder.id + 1 : 1; // Start from 1 if no documents exist

    // Create a new order with the incremented ID
    const order = new Order({ id: nextId, customerId, employeeId, productId });

    // Save the new order to the database
    await order.save();

    // Respond with the created order
    res.status(201).json({ message: 'Order created successfully.', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});


// =============================================== Read all orders | /get/orders/all
app.get('/get/orders/all', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================================== Read a specific order by ID | /get/orders/:id
app.get('/get/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================================== Update an order by ID | /update/orders/:id
app.put('/update/orders/:id', async (req, res) => {
  try {
    const { customerId, employeeId, productId } = req.body;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { customerId, employeeId, productId },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// =============================================== Delete an order by ID | /delete/orders/:id
app.delete('/delete/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




//  ======================================================================== END OF ORDER OPERATION =======================================================================================











//  ================================================== API RELATION SHIP ======================================================

//  =================================  PRODUCT WITH CATEGORIES NAME

app.get('/get/products/join/categories/id/name/all', async(req, res) => {

  try {
    const result = await Products.aggregate([
      {
        $lookup:{
          from: "categories",
          localField: "categories",
          foreignField: "id",
          as: "categoryName"
        }
      },
      {
        $addFields: {
          categoryName: {
            $arrayElemAt: ["$categoryName.category",0]
          }
        }
        
      },
      {
        $addFields: {
          categoryId: {
            $arrayElemAt: ["$categories", 0]
          }
        }
      },
      {
        $project: {
          id: 1,
          name: 1,
          categoryName:1,
          categoryId:1,
          price:1,
          priceRange:1,
          status:1,
          available:1,
          sold:1,
          description:1,
          url:1,
          createdAt:1,
          updatedAt:1
          
        }
      }
    ]);


    if(!result || result.length === 0){
      return res.status(404).json({message:"No Data: /get/products/join/categories/id/name/all", result:result});
    }

    return res.status(200).json({message: "success!! /get/products/join/categories/id/name/all", result:result});

  }catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});











// ================================================ OPERATION RELATIONSHIOP CRUD ORDER INVOICE ACCOUNT PRODUCT ===================================================

// ================================================================= /get/order/join/invoiceAccountProduct/:id
app.get('/get/order/join/invoiceAccountProduct/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the id is a number
    if (isNaN(id) || !Number.isInteger(parseFloat(id))) {
      return res.status(400).json({ message: "Invalid ID! It must be a number." });
    }

    const result = await Order.aggregate([
      {
        $match: {
          id: parseInt(id) // Ensure that the ID is treated as a number
        }
      },
      {
        $lookup: {
          from: 'invoice',          // The collection to join with
          localField: 'customerId', // Field from the input documents
          foreignField: 'id',       // Field from the documents of the "from" collection
          as: 'invoiceDetails'      // Output array field for joined documents
        }
      },
      {
        $unwind: {
          path: '$invoiceDetails',  // Flatten the array of invoice details
          preserveNullAndEmptyArrays: true // Optional: keep documents without matching invoices
        }
      },
      {
        $lookup: {
          from: 'account',
          localField: 'employeeId',
          foreignField: 'id',
          as: 'employeeDetails'
        }
      },
      {
        $unwind: {
          path: '$employeeDetails', // Flatten the array of employee details
          preserveNullAndEmptyArrays: true // Optional
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: 'id',
          as: 'productDetails'
        }
      },
      {
        $unwind: {
          path: '$productDetails', // Flatten the array of product details
          preserveNullAndEmptyArrays: true // Optional
        }
      },
      {
        $project: {
          id: 1,
          invoiceDetails: 1,
          employeeDetails: 1,
          productDetails: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      }
    ]);

    // Check if the result is empty
    if (result.length === 0) {
      return res.status(404).json({ message: "Order not found!" });
    }

    // Send the result as a response
    res.status(200).json({ message: "Order details retrieved successfully!", result: result });
    
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});

// ============================================================== END OF CRUD OPERATION RELATIONSHIP ORDER JOIN INVOICE ACCOUNT PRODUCT




// ===================================================================== UPLOAD API CATEGORIES =========================================================================================================================

// ------------------------ AWS SERVER UPLOAD FILE============================= /img/upload/:categoryName


app.post('/img/upload/:categoryName', async (req, res) => {
  let fileBuffer = []; // Array to hold chunks of binary data
  const {categoryName} = req.params;
  req.on('data', chunk => {
    fileBuffer.push(chunk); // Collect incoming data chunks
  });

  req.on('end', async () => {
    const completeBuffer = Buffer.concat(fileBuffer); // Concatenate all chunks into a single buffer

    const originalName = 'uploaded-image'; // Assign a generic name or retrieve from headers if needed

    try {
      const result = await uploadImage(completeBuffer, originalName, categoryName); // Process the buffer
      res.json(result); // Send response back
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).send('Error uploading image');
    }
  });
});

const uploadImage = async (fileBuffer, originalName, categories) => {
  const uniqueId = uuidv4();
  const uniqueFileName = `images/${originalName}-${uniqueId}.jpg`;


  const params = {
    Bucket: 'shop-coffee-website',
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: 'image/jpg',
  };

  try {
    await s3.upload(params).promise();
    console.log(`image uploaded successfully: ${uniqueFileName}`);


    // generate public link
    const url = `https://${params.Bucket}.s3.amazonaws.com/${uniqueFileName}`;
    console.log(`URL: https://${params.Bucket}.s3.amazonaws.com/${uniqueFileName} UNIQUE-FILE-NAME:${uniqueFileName}`);





 const largestCategory = await Categories.findOne().sort({ id: -1 });
    let newId = 1; // Default ID if no categories exist

    if (largestCategory) {
      newId = largestCategory.id + 1; // Increment the largest ID by 1
    }

    console.log(`New category ID: ${newId}`);

    // Create a new category document with the new ID and image details
    const newCategory = new Categories({
      id: newId, // Use the incremented ID
      category: categories, // Placeholder for the new category name
      img: [{
        url: url, // Insert the S3 image URL
        imgId: uniqueId, // Insert the unique image ID
      }],
    });

    // Save the new category to the database
    await newCategory.save();

    console.log('New category added:', newCategory);

    return { uniqueFileName, url };
  } catch (error) {
    console.error('Error uploading image: ', error);
  };
};


// ============================================================ END OF AWS UPLOAD API CATEGORIES WITH IMAGE AND CATEGORIES NAME AUTO ID














// =================================================================== START THE SERVER ===========================================================================
// Start the server







app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


