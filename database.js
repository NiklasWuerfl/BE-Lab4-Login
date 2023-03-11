const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE)


async function init() {
  await db.serialize(() => {
    db.run('DROP TABLE IF EXISTS users')
    db.run('CREATE TABLE users (userID text PRIMARY KEY UNIQUE, name text, role text, password text)')
    db.run('INSERT INTO users (userID, role, name, password) VALUES ("id1", "user1", "student", "password")')
    db.run('INSERT INTO users (userID, role, name, password) VALUES ("id2", "user2", "student", "password2")')
    db.run('INSERT INTO users (userID, role, name, password) VALUES ("id3", "user3", "teacher", "password3")')
    db.run('INSERT INTO users (userID, role, name, password) VALUES ("admin", "admin", "admin", "admin")')
  })
}

module.exports = {
  init,
  // getUser,
  // getAllUsernames,
  // addUser
}
