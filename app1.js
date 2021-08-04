const express = require('express');
const crudProduct = require('./app/routes/crudProduct')

const dotenv = require('dotenv').config();
const app = express();

const port =3000
app.use('/',crudProduct)
app.listen(port, () => console.log(`listening on port ${port}`));