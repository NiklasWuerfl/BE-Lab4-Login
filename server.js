const database = require('./database')
const express = require('express')
const app = express()
app.set('view-engine', 'ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cook = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cook())


app.listen(port, async() => {
  console.log("Server is running on port " + port)
  try {
    database.init()
    database.addUser("id1", "user1", "student1", await bcrypt.hash("password", 10))
    database.addUser("id2", "user2", "student2", await bcrypt.hash("password2", 10))
    database.addUser("id3", "user3", "teacher", await bcrypt.hash("password3", 10))
    database.addUser("admin", "admin", "admin", await bcrypt.hash("admin", 10))
  }
  catch {
    res.status(500).statusMessage('There is a problem with the database or the DB connection')
  }
})

app.get('/', (req, res) => {
  res.redirect('/identify')
})

app.post('/identify', async (req, res) => {

  const cookieOptions = { 
    httpOnly: true, // Set cookie to httpOnly it can only be accessed by the server and not by client-side scripts. 
    maxAge: 86400000 // Set cookie to expire after 1 day (in milliseconds)
  };

  let currentUser = []
  let token
  try {
    currentUser = await database.getUser(req.body.name)
    token = jwt.sign({ userID: currentUser.userID, name: currentUser.name, role: currentUser.role}, process.env.ACCESS_TOKEN_SECRET)
  }
  catch {
    res.status(404).render('fail.ejs', {
      message: "User not found"
    })
    console.log('Failed login, User not found')
      return
  }
  const correctPW = await bcrypt.compare(req.body.password, currentUser.password)
  if (correctPW) {
    console.log('Successful login')
    res.cookie("jwt", token, cookieOptions); // Send JWT in a cookie
    res.redirect(`/users/${currentUser.userID}`)
    return
  }
  console.log('Wrong password')
  res.status(400).render('fail.ejs', {
    message: "Wrong password"
  })
})

app.get('/identify', (req, res) => {
  res.render('identify.ejs')
})

function generalAuthentification(req, res, next) {
  let decoded
  if (!req.cookies || !req.cookies.jwt) {
    console.log("hello");
    res.redirect('/identify')
  } else if ( decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)) {
    req.user = {
      userID: decoded.userID,
      name: decoded.name,
      role: decoded.role,
    }
    next()
  } else {
    res.redirect('/identify')
  }
}


app.get('/granted',generalAuthentification, (req, res) => {
  res.render('start.ejs', {
    message: `${req.user.name}`
  })
})

function authenticateAdmin(req, res, next) {
  if (req.user.role === 'admin') next()
  else {
    res.redirect(401, '/identify') 
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


app.get('/admin', generalAuthentification,authenticateAdmin , async (req, res) => {
  res.render('admin.ejs', {
    table: await createAdminTable()
  })
})


function authenticateStudent1(req, res, next) {
  if (['admin', 'teacher', 'student1'].includes(req.user.role)) next()
  else {
    res.redirect(401, '/identify') 
  }
}

app.get('/student1', generalAuthentification,authenticateStudent1 , (req, res) => {
  res.render('student1.ejs', {
    message: req.user.name
  })
})

function authenticateStudent2(req, res, next) {
  if (['admin', 'teacher', 'student2'].includes(req.user.role)) next()
  else {
    res.redirect(401, '/identify')
  }
}

app.get('/student2', generalAuthentification,authenticateStudent2 , (req, res) => {
  res.render('student2.ejs', {
    message: req.user.name
  })
})

function authenticateTeacher(req, res, next) {
  if (['admin', 'teacher'].includes(req.user.role)) next()
  else {
    res.redirect(401, '/identify')
  }
}

app.get('/teacher', generalAuthentification,authenticateTeacher , (req, res) => {
  res.render('teacher.ejs', {
    message: req.user.name
  })
})

function authenticateUser(req, res, next) {
  if (req.params.userID === req.user.userID) next()
  else {
    res.redirect(401, '/identify')
  }
}

app.get('/users/:userID', generalAuthentification,authenticateUser, (req, res) => {
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
    console.log(await database.addUser(req.body.id, req.body.name, req.body.role, encryptedPassword))
    // password must be saved encrypted, and verified encrypted!

    req.method = 'GET'
    res.status(201).redirect('/identify')
  }
  catch {
    res.status(500).send('There is an internal error.')
  }
})

