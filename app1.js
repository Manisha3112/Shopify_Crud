const express = require('express');
const ProductRoute = require('./app/routes/crudProduct')

const dotenv = require('dotenv').config();
const app = express();

const PORT =3000

// << db setup >>
// const mongoose = require("./utils/database");

app.use('/',ProductRoute)

app.listen(PORT, () => console.log(`listening on port ${PORT}`));