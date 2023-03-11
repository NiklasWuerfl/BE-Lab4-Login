const database = require('./database')
const express = require('express')
const app = express()
app.set('view-engine', 'ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.listen(port, () => {
  console.log("Server is running on port " + port)
  try {
    database.init()
  }
  catch {
    res.status(500).statusMessage('There is a problem with the database or the DB connection')
  }
})
