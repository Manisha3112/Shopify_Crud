const crypto = require('crypto');
const axios = require('axios');

class Crud{

    constructor(scopes,appUrl,shopifyApiPublicKey,shopifyApiSecretKey) {
        this.scopes = "read_products, write_products,read_product_listings,read_customers, write_customers,read_orders, write_orders";
        this.appUrl = 'https://5a7c4ddb0b97.ngrok.io';
        this.shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY;
        this.shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY;
    }

    buildRedirectUri () {
        return `${this.appUrl}/shopify/callback`;
    }
    
    buildInstallUrl(shop, state, redirectUri) {
        return `https://${shop}/admin/oauth/authorize?client_id=${this.shopifyApiPublicKey}&scope=${this.scopes}&state=${state}&redirect_uri=${redirectUri}`;
    }

    buildAccessTokenRequestUrl(shop){
        return `https://${shop}/admin/oauth/access_token`;
    }

    buildShopDataRequestUrl(shop){
        return `https://${shop}/admin/shop.json`;
    }

    buildProductDataRequestUrl(shop){
        return `https://${shop}/admin/api/2021-07/products.json`;
    }

    buildProductAddRequestUrl(shop){
        return `https://${shop}/admin/api/2021-07/products.json`
    }
    
    buildProductUpdateRequestUrl(shop,productId){
        return `https://${shop}/admin/api/2021-07/products/${productId}.json`
    }

    generateEncryptedHash(params){
        return crypto.createHmac('sha256', this.shopifyApiSecretKey).update(params).digest('hex');
    }

    async fetchAccessToken (shop, data) {return await axios(this.buildAccessTokenRequestUrl(shop), {
        method: 'POST',
        data
    });}

    async fetchShopData (shop, accessToken) {return await axios(this.buildShopDataRequestUrl(shop), {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken
        }
    });}

    async getProducts (shop, accessToken) {return await axios(this.buildProductDataRequestUrl(shop), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' ,
            'X-Shopify-Access-Token': accessToken
        }
    });}

    async insertProduct (shop,data,accessToken) {return await axios(this.buildProductAddRequestUrl(shop), {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': accessToken
        },
        data:{
            product:data
        }

    });}

    async updateProduct (shop, productId,data, accessToken) {return await axios(this.buildProductUpdateRequestUrl(shop,productId), {
        method:'PUT',
        headers: {
            'X-Shopify-Access-Token': accessToken
        },
        data:{
            product:data
        }
    });}

    async deleteProduct (shop, productId, accessToken) {return await axios(this.buildProductUpdateRequestUrl(shop,productId), {
        method:'DELETE',
        headers: {
            'X-Shopify-Access-Token': accessToken
        }
    });}
}

module.exports = new Crud();