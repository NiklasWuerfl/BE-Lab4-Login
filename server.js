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
    // if (currentUser.role === 'admin') {
    //   res.redirect('/admin')
    // } else {
    //   res.redirect('/granted')
    // }
    res.redirect(`/users/${currentUser.userID}`)
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

function authenticateUser(req, res, next) {
  if (!generalAuthentification()) res.redirect('/identify')
  else if (req.params.userID === currentUser.userID) next()
  else {
    res.redirect('/identify').status(401) 
    // supposed to send error.. Isn't working
  }
}

app.get('/users/:userID', authenticateUser, (req, res) => {
  res.render('start.ejs', {
    message: `You are ${req.params.userID}.`
  })
})

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.post('/register', async (req, res) => {
  try{
    if (req.body.password !== req.body.passwordRep) {
      res.status(400).render('fail.ejs', {
        message: "The passwords you entered don't match"
      })
      return
    }
    else if (req.body.password.length < 3) {
      res.status(400).render('fail.ejs', {
        message: "The password is too short. It should have at least 3 characters."
      })
      return
    }
    // if (await database.getAllUsernames().includes(req.body.username)) {
    //   res.sendStatus(400).statusMessage("You cannot use this username.")
    // }
    const allUsernames = await database.getAllUsernames()
    if (allUsernames.includes(req.body.name)) {
      res.status(400).render('fail.ejs', {
        message: "You cannot use this name."
      })
      // res.status(400).render('failRegName.ejs')
      return
    }

    const allUserIDs = await database.getAllIDs()
    if (allUserIDs.includes(req.body.id)) {
      res.status(400).render('fail.ejs', {
        message: "You cannot use this UserID."
      })
      // res.status(400).render('failRegName.ejs')
      return
    }

    let encryptedPassword = await bcrypt.hash(req.body.password,10)
    console.log(await database.addUser(req.body.id, req.body.name, req.body.role, req.body.password))

    req.method = 'GET'
    res.status(201).redirect('/identify')
  }
  catch {
    res.status(500).statusMessage('There is an internal error.')
  }
})

