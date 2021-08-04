const {MongoClient} = require('mongodb');
async function connectDB() {
    try{
        const mongoUrl = "mongodb+srv://root:root@cluster0.5r096.mongodb.net/shop?retryWrites=true&w=majority"
        return await MongoClient.connect();
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;