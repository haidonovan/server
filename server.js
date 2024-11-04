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
  id: {type: Number, required: true },
  name: { type: String, required: true},
},{
  timestamps: true,
});


// -------------------------- ORDER SCHEMA 

const orderSchema = new mongoose.Schema({
  id: {type: Number, required: true },
  customerId: { type: Number, required: false},
  employeeId: { type: Number, required: false},
  productId: { type: Number, required: false},
},{
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

app.post('/post/products/one', async (req, res) => {
  try {
    const { name, categories, price, priceRange, status, available, sold, description, url } = req.body;

    // Find the latest product ID
    const latestProducts = await Products.aggregate([
      {
        $sort: { createdAt: -1 } // Sort by createdAt in descending order
      },
      {
        $limit: 1 // Limit to the latest product
      },
      {
        $project: { id: 1, _id: 0 } // Project only the id field
      }
    ]);

    // Determine the next ID for the new product
    let nextId = 1; // Default to 1 if no products exist
    if (latestProducts.length > 0) {
      nextId = latestProducts[0].id + 1; // Increment the latest ID for the new product
    }

    // Create the new product object
    const newProduct = {
      id: nextId,
      name,
      categories,
      price,
      priceRange,
      status,
      available,
      sold,
      description,
      url,
      createdAt: new Date() // Add createdAt field
    };

    // Save the new product to the database
    const savedProduct = await Products.create(newProduct);

    // Respond with success
    return res.status(201).json({ message: "Product created successfully!", product: savedProduct });
    
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});


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

// -------------------------- UPDATE (PUT) -------------------------- /update/accounts/:id

app.put('/update/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, type , password} = req.body;

    const updatedAccount = await Account.findOneAndUpdate(
      { id: Number(id) },
      { password: password},
      { name, username, type },
      { new: true, runValidators: true }
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


// =============================================== CREATE INVOICE invoices |          /create/invoices

app.post('/create/invoices', async (req, res) => {
  try {
    const { name } = req.body; // Get parameters from the request body

    // Find the latest invoice by sorting the id in descending order
    const latestInvoice = await Invoice.findOne().sort({ id: -1 });

    // Determine the next ID
    const nextId = latestInvoice ? latestInvoice.id + 1 : 1; // Start from 1 if no documents exist

    // Create a new invoice with the incremented ID
    const invoice = new Invoice({ id: nextId, name });

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




// =================================================================== START THE SERVER ===========================================================================
// Start the server







app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


