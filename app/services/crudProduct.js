// fetching accesstoken
// https://6297a12e162b.ngrok.io/shopify?shop=Trail121212.myshopify.com
// get products
//https://6297a12e162b.ngrok.io/products?shop=Trail121212.myshopify.com

const crypto = require('crypto');
const axios = require('axios');

class Crud{

    constructor(scopes,appUrl,shopifyApiPublicKey,shopifyApiSecretKey) {
        this.scopes = "read_products, write_products,read_product_listings,read_customers, write_customers,read_orders, write_orders";
        this.appUrl = 'https://6297a12e162b.ngrok.io';
        this.shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY;
        this.shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY;
    }
    redirectUri () {
        return `${this.appUrl}/shopify/callback`;}
    installUrl(shop, state, redirectUri) {
        return `https://${shop}/admin/oauth/authorize?client_id=${this.shopifyApiPublicKey}&scope=${this.scopes}&state=${state}&redirect_uri=${redirectUri}`;}

    accessRequestUrl(shop){
        return `https://${shop}/admin/oauth/access_token`;}

    shopRequestUrl(shop){
        return `https://${shop}/admin/shop.json`;}

    productRequestUrl(shop){
        return `https://${shop}/admin/api/2021-07/products.json`;}
    
    addRequestUrl(shop){
        return `https://${shop}/admin/api/2021-07/products.json`}
    
    updateRequestUrl(shop,productId){
        return `https://${shop}/admin/api/2021-07/products/${productId}.json`}

    generateEncryptedHash(params){
        return crypto.createHmac('sha256', this.shopifyApiSecretKey).update(params).digest('hex');}

    async fetchAccessToken (shop, data) {return await axios(this.accessRequestUrl(shop), {
        method: 'POST',
        data});}

    async fetchShopData (shop, accessToken) {return await axios(this.shopRequestUrl(shop), {
        method: 'GET',
        headers: {'X-Shopify-Access-Token': accessToken
        }});}

    async getProducts (shop, accessToken) {return await axios(this.productRequestUrl(shop), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' ,
            'X-Shopify-Access-Token': accessToken
        } });}
    async insertProduct (shop,data,accessToken) {return await axios(this.addRequestUrl(shop), {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': accessToken
        },
        data:{
            product:data
        } });}

    async updateProduct (shop, productId,data, accessToken) {return await axios(this.updateRequestUrl(shop,productId), {
        method:'PUT',
        headers: {
            'X-Shopify-Access-Token': accessToken
        },
        data:{
            product:data
        } });}

    async deleteProduct (shop, productId, accessToken) {return await axios(this.updateRequestUrl(shop,productId), {
        method:'DELETE',
        headers: {
            'X-Shopify-Access-Token': accessToken
        }});}
}

module.exports = new Crud();