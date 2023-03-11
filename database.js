const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE)


async function init() {
  await db.serialize(() => {
    db.run('DROP TABLE IF EXISTS users')
    db.run('CREATE TABLE users (userID text PRIMARY KEY UNIQUE, name text, role text, password text)')
    db.run('INSERT INTO users (userID, name, role, password) VALUES ("id1", "user1", "student", "password")')
    db.run('INSERT INTO users (userID, name, role, password) VALUES ("id2", "user2", "student", "password2")')
    db.run('INSERT INTO users (userID, name, role, password) VALUES ("id3", "user3", "teacher", "password3")')
    db.run('INSERT INTO users (userID, name, role, password) VALUES ("admin", "admin", "admin", "admin")')
  })
}

function getUserPassword(password) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE password  = ? "

    db.get(sql, [password], (err, row) => {
      if (row === undefined) reject(`There is no user with the password "${password}" in the database.`)
      if (!err) resolve(row)
      else reject(err)
    })
  })
}

module.exports = {
  init,
  getUserPassword
  // getUser,
  // getAllUsernames,
  // addUser
}
