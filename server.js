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

function generalAuthentification() {
  if (currentKey == "") {
    return false
  } else if (jwt.verify(currentKey, process.env.ACCESS_TOKEN_SECRET)) {
    return true
  } else {
    return false
  }
}

function authenticateToken(req, res, next) {
  if (! generalAuthentification()) res.redirect('/identify')
  else next()
}

app.get('/granted',authenticateToken, (req, res) => {
  res.render('start.ejs', {
    message: `${currentUser.name}`
  })
})

function authenticateAdmin(req, res, next) {
  if (!generalAuthentification()) res.redirect('/identify')
  else if (currentUser.role === 'admin') next()
  else {
    res.redirect('/identify').status(401) 
    // supposed to send error.. Isn't working
  }
}

async function createAdminTable() {
  let users = await database.getAllUsers()
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


app.get('/admin', authenticateAdmin , async (req, res) => {
  res.render('admin.ejs', {
    table: await createAdminTable()
  })
})

app.get('/admin', authenticateAdmin , async (req, res) => {
  res.render('admin.ejs', {
    table: await createAdminTable()
  })
})

function authenticateStudent1(req, res, next) {
  if (!generalAuthentification()) res.redirect('/identify')
  else if (['admin', 'teacher', 'student1'].includes(currentUser.role)) next()
  else {
    res.redirect('/identify').status(401) 
    // supposed to send error.. Isn't working
  }
}

app.get('/student1', authenticateStudent1 , (req, res) => {
  res.render('student1.ejs', {
    message: currentUser.name
  })
})

function authenticateStudent2(req, res, next) {
  if (!generalAuthentification()) res.redirect('/identify')
  else if (['admin', 'teacher', 'student2'].includes(currentUser.role)) next()
  else {
    res.redirect('/identify').status(401) 
    // supposed to send error.. Isn't working
  }
}

app.get('/student2', authenticateStudent2 , (req, res) => {
  res.render('student2.ejs', {
    message: currentUser.name
  })
})

function authenticateTeacher(req, res, next) {
  if (!generalAuthentification()) res.redirect('/identify')
  else if (['admin', 'teacher'].includes(currentUser.role)) next()
  else {
    res.redirect('/identify').status(401) 
    // supposed to send error.. Isn't working
  }
}

app.get('/teacher', authenticateTeacher , (req, res) => {
  res.render('teacher.ejs', {
    message: currentUser.name
  })
})



