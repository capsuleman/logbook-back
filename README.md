# Back of LogBook Application

## Description
Back-end of the LogBook application.
The goal of LogBook application is to store daily reports with a web application.
  
The back is a Node application (Express) and the database connection is made with sqlite3 module.

## Endpoints
`POST /message` : adds a new message to a selected date to the connected user  
`GET /message/date` : gets the dates with stored messages  
`GET /message/:date` : gets message at a specified date from the current user  
`DELETE /message/:id` : removes message with id  
`POST /auth/register` : adds a new user with username and password (and returns a JWT)  
`GET /auth/me` : gets informations about the user associated with the JWT  
`POST /auth/login` : returns a JWT if the pair username/password is correct  


 ## Milestones
 `[X]` Specifications and README  
 `[X]` Definition of database scheme  
 `[X]` Authentification of users  
 `[X]` Messages management  
 `[X]` Encrpytion of messages  

 ## Database scheme
Relational database (SQL mith MySQL), because it works on a Raspberry Pi contrary to NoSQL databases...  
2 tables:
* User table
    * ID
    * Username
    * Hashed password
    * RSA publci key to encrypt messages
* Message table
    * ID
    * ID of author
    * Message text
    * Post date
    * Target date

## Example of configuration file
Configuration file is stored in root of the repository.
``` js
var config = {
    web: {
        port: 8080
    },
    log: {
        type: 'dev',
        output: false
    },
    cred: {
        authsecret: 'mdptoutpipo',
        delay: 86400  // expires in 24 hours
    },
    db: {
        host: 'localhost',
        user: 'logbook',
        password: 'strongpassword',
        database: 'logbook',

    }
};


module.exports = config;
```