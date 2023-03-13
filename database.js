const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE)


async function init() {
  await db.serialize(() => {
    db.run('DROP TABLE IF EXISTS users')
    db.run('CREATE TABLE users (userID text PRIMARY KEY UNIQUE, name text, role text, password text)')
    // db.run('INSERT INTO users (userID, name, role, password) VALUES ("id1", "user1", "student1", "password")')
    // db.run('INSERT INTO users (userID, name, role, password) VALUES ("id2", "user2", "student2", "password2")')
    // db.run('INSERT INTO users (userID, name, role, password) VALUES ("id3", "user3", "teacher", "password3")')
    // db.run('INSERT INTO users (userID, name, role, password) VALUES ("admin", "admin", "admin", "admin")')
  })
}

function getUser(name) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE name  = ? "

    db.get(sql, [name], (err, row) => {
      if (row === undefined) reject(`There is no user with the Username "${name}" in the database.`)
      if (!err) resolve(row)
      else reject(err)
    })
  })
}

function getAllUsers () {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users"
    db.all(sql, [], (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

function getAllUsernames () {
  return new Promise((resolve, reject) => {
    let sql = "SELECT name FROM users"
    db.all(sql, [], (err, rows) => {
      if (err) reject(err)
      else resolve(rows.map(element => element.name))
    })
  })
}

function getAllIDs () {
  return new Promise((resolve, reject) => {
    let sql = "SELECT userID FROM users"
    db.all(sql, [], (err, rows) => {
      if (err) reject(err)
      else resolve(rows.map(element => element.name))
    })
  })
}

function addUser(userID, name, role, password) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO users (userID, name, role, password) VALUES (?, ?, ?, ?)`
    db.run(sql, [userID, name, role, password], (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(`The user "${name}" has been added to the database.`)
      }
    })
  })
}


module.exports = {
  init,
  getUser,
  getAllUsers,
  getAllIDs,
  getAllUsernames,
  addUser
}
