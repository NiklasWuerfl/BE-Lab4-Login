# BE-Lab4-Login


**The database is initialised every time the server is restarted. To deactivate this functionality, simply comment line 18-27 in server.js.**

This server, using express, serves different endpoints for different roles (admin, teachers, students).
It uses a local database file to store user data (user ID, name, role, and password hash).
Passwords are hashed before they are stored using bcrypt.
The server also uses jsonwebtoken to create and verify JSON Web Tokens for user authentication and authorization.
EJS is used for rendering views.

## Setup
The server running configurations can be modified by changing the .env file with the following contents:

PORT=*desired port number*
ACCESS_TOKEN_SECRET=*custom secret_key*

'npm install' must be run before starting the server to install all required dependencies.

## Starting the server
To start the server, run node server.js. It will listen on the port specified in the .env file.

## Endpoints
### GET /
Redirects to /identify endpoint.

### GET /identify
Renders the login page (identify.ejs) where the user can enter their name and password to log in.

### POST /identify
Takes the user's name and password as input (from identify.ejs), and if the input is valid, generates a JSON Web Token with the user's ID, name, and role as the payload. The token is then sent back to the client in a cookie, and the user is redirected to an appropriate endpoint depending on their role.
#### possible Errors
* Wrong password
* User not found
-> Server renders fail.ejs and displays an appropriate message. From this view, the user can navigate to the relevant routes /identify and /register.

### GET /granted
Requires a valid cookie/token. Renders a welcome page (start.ejs) with a greeting message that includes the user's name.

### GET /admin
Requires a valid cookie/token and the user must be of the role admin. Renders an admin page (admin.ejs) that displays a table with all the users in the database.

### GET /student1
Requires a valid cookie/token and the user must be of the role admin, teacher or student1. Renders a student1 page (student1.ejs) with a greeting message that includes the user's name.

### GET /student2
Requires a valid cookie/token and the user must be of the role admin, teacher or student2. Renders a student2 page (student2.ejs) with a greeting message that includes the user's name.

### GET /teacher
Requires a valid cookie/token and the user must be of the role teacher or admin. Renders a teacher page (teacher.ejs) with a greeting message that includes the user's name.

### GET /users/:userID
Requires a valid cookie/token and the user must have the specified userID. Renders a welcome page (start.ejs) with a greeting message that includes the user's name.

### GET /register
Renders a registration page (register.ejs) where the user can enter their userID, name, role, and password to create a new user account.

### POST /register
Takes the user's ID, name, role, and password as input (from register.ejs), and if the input is valid, adds the new user to the database and redirects to /identify.
#### possible Errors
* Passwords don't match
* Password is too short (shorter than 3 characters)
* Username is already used
* UserID is already used
-> Server renders fail.ejs and displays an appropriate message. From this view, the user can navigate to the relevant routes /identify and /register and try again from there.
* Error when trying to add to database
-> Error 500

## Author: Niklas Würfl