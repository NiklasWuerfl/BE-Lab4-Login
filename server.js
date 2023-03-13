const database = require('./database')
const express = require('express')
const app = express()
app.set('view-engine', 'ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

let currentKey = ""
let currentPassword = ""
let currentUser;

app.listen(port, () => {
  console.log("Server is running on port " + port)
  try {
    database.init()
  }
  catch {
    res.status(500).statusMessage('There is a problem with the database or the DB connection')
  }
})

app.get('/', (req, res) => {
  res.redirect('/identify')
})

app.post('/identify', async (req, res) => {
  const username = req.body.password
  const token = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET)
  currentKey = token
  currentPassword = username
  try {
    currentUser = await database.getUserPassword(currentPassword)
    if (currentUser.role === 'admin') {
      res.redirect('/admin')
    } else {
      res.redirect('/granted')
    }
  }
  catch {
    // alert('Invalid Password')
    console.log('Invalid Password');
    res.redirect('/identify')
  }
})

app.get('/identify', (req, res) => {
  res.render('identify.ejs')
})

function authenticateToken(req, res, next) {
  if (currentKey == "") {
    res.redirect('/identify')
  } else if (jwt.verify(currentKey, process.env.ACCESS_TOKEN_SECRET)) {
    next()
  } else {
    res.redirect ('/identify')
  }
}

app.get('/granted',authenticateToken, (req, res) => {
  res.render('start.ejs', {
    message: `${currentUser.name}`
  })
})

function authenticateAdmin(req, res, next) {
  if (currentKey == "") {
    res.redirect('/identify')
  } else if (jwt.verify(currentKey, process.env.ACCESS_TOKEN_SECRET)) {
      if (currentUser.role === 'admin') next()
      else {
        res.redirect('/granted').status(401)
        // supposed to send error.. Isn't working
      }
  } else {
      res.redirect('/identify')
    }
  
}

async function createAdminTable() {
  let users = await database.getAllUsers()
  console.log(users)
  let htmlArray = users.map(({ userID, name, role, password }) => /*html*/ `
    <tr>
      <td>${userID}</td>
      <td>${name}</td>
      <td>${role}</td>
      <td>${password}</td>
    </tr>
  `)
  return htmlArray.join('')
}


app.get('/admin', authenticateAdmin ,async (req, res) => {
  res.render('admin.ejs', {
    table: await createAdminTable()
  })
})
