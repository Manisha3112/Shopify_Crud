//https://6297a12e162b.ngrok.io/shopify?shop=Trail121212.myshopify.com
const dotenv = require('dotenv').config();
const Crud = require('../services/crudProduct');
const express = require('express');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
router.use(express.json());
const shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY;
const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY;
const scopes = "read_products, write_products,read_product_listings,read_customers, write_customers,read_orders, write_orders";
const appUrl = 'https://6297a12e162b.ngrok.io';
router.route('/shopify').get( async (req, res) => {
    const shop = req.query.shop;
    if (!shop) { return res.status(400).send({"Error":"400"})}
    const state = nonce();
    const installShopUrl = Crud.installUrl(shop, state, Crud.redirectUri())
    res.cookie('state', state)
    res.redirect(installShopUrl);
});

router.route('/shopify/callback').get( async (req, res) => {
    const { shop, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state;
    if (state !== stateCookie) { return res.status(403).send('state and stateCookie is not equal')}
    const { hmac, ...params } = req.query
    const queryParams = querystring.stringify(params)
    const hash = Crud.generateEncryptedHash(queryParams)
    if (hash !== hmac) { return res.status(400).send('hash and hmac is not equal')}
    try {
        const data = {
            client_id: shopifyApiPublicKey,
            client_secret: shopifyApiSecretKey,
            code
        };
        const tokenResponse = await Crud.fetchAccessToken(shop, data)
        const { access_token } = tokenResponse.data
        process.env.SHOPIFY_ACCESS_TOKEN = access_token
        
        MongoClient.connect(process.env.MONGODB_URI,function (err,db){
            if (err) throw err;
            var dbconnection = db.db("shop")
            dbconnection.collection("Access Token").deleteMany({AccessToken:/^s/},function(err,res){
                if (err) throw err;
            });
            dbconnection.collection("Access Token").insertOne({
                AccessToken:access_token
            },function(err,res){
                if (err) throw err;
                console.log("Access Token is stored in database");
                db.close();
            })
        })
        res.status(200).send({message:"Finally access token is generated "})
    } catch(err) {
        console.log(err)
        res.status(500).send("Error message: "+err)
    }
});

router.route('/products').get( async (req,res) => {
    try{
        const shop = req.query.shop;
        const productData = await Crud.getProducts(shop, process.env.SHOPIFY_ACCESS_TOKEN)
        MongoClient.connect(process.env.MONGODB_URI,function (err,db){
            if (err) throw err;
            var dbconnection = db.db("shop")
            dbconnection.collection("Products").deleteMany({},function(err,res){
                if (err) throw err;
            });
            dbconnection.collection("Products").insertOne(
                productData.data
            ,function(err,res){
                if (err) throw err;
                console.log("All product details is fetched successfully");
                db.close();
            })
        })
        res.send(productData.data)
    }
    catch(err) {
        console.log(err)
        res.status(500).send("Error message: "+err)
    }
})
.delete(async (req,res) => {
    try{
        const shop = req.query.shop;
        const productId = req.query.id;
        const deleteProductData = await Crud.deleteProduct(shop, productId, process.env.SHOPIFY_ACCESS_TOKEN)
        console.log("Products deleted successfuly")
        res.status(200).send({message:"Products deleted successfuly",status:200})
    }catch(err) {
        console.log(err)
        res.status(500).send("Error message: "+err)
    }
})
.post(async (req,res) => {
    try {
        const shop = req.query.shop;
        const data = req.body;
        const addProductData = await Crud.insertProduct(shop,data, process.env.SHOPIFY_ACCESS_TOKEN)
        console.log("Products inserted successfuly")
        res.status(200).send({message:"Products inserted successfully",status:200})
    
    } catch (err) {
        console.log(err)
        res.status(500).send("Error message: "+err)
    }
})
.put(async (req,res) => {
    try{
        const shop = req.query.shop;
        const productId = req.query.id;
        const data = req.body;
        const updateProductData = await Crud.updateProduct(shop, productId,data, process.env.SHOPIFY_ACCESS_TOKEN)
        console.log("Products updated successfully")
        res.status(200).send({message:"Products updated successfully",status:200})
    } catch(err) {
        console.log(err)
        res.status(500).send("Error message: "+err)
    }
})
module.exports = router;