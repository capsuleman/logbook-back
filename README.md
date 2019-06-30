# Back of LogBook Application

## Description
Back-end of the LogBook application.
The goal of LogBook application is to store daily reports with a web application.
  
The back is a Node application and the database connection is made with sqlite3 module.

## Endpoints
`POST /newmessage` : adds a new message to a selected date to the connected user  
`GET /message` : gets message at a specified date from the current user  
`GET /date` : gets the dates with stored messages  
`POST /login` : returns a JWT if the pair login/password is correct  
`POST /register` : adds a new user with login and password  
`GET /me` : gets informations about the current user


 ## Milestones
 `[X]` Specifications and README  
 `[X]` Definition of database scheme  
 `[ ]` Authentification of users  
 `[ ]` Messages management  
 `[ ]` Encrpytion of messages  

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