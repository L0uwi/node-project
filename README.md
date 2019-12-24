# Nodes JS & DevOps project

## Introduction

This is a combined repository for our Node JS and DevOps project.
This project was developped to present our skills   
  * in Node js : typescript, ejs   
  * in DevOps : use of git, readme file, tests (in chai and mocha), and use of docker

## Installing

First, clone the project to your local repository.
Then, in order to install all the dependencies :
```bash 
npm install
```

## Running test

You can run tests (developped with mocha and chai libraries)
```bash
npm run test
```
They should all pass !  
If it doesn't quit the execution alone, just type "ctrl+c" in your terminal.  
And then answer "Y" ("O" in french) to finish the tests.

## Build and populate
   
You can try the app with an already existing account !    

| Caracteristics  | Informations |
| :--------: | :--------: |
| Name | Stinson |   
| First Name | Barney |   
| Username | barney47 |   
| Email | barney@gmail.com |   
| Password | waitforit |   

Run this command in order to prefill the database with this user :
```bash
npm run populate
```

Then, to build the project, just run the following command :
```bash
npm run build
```

## Run the project

```bash
npm start
```
You then have to connect yourself to 'localhost:8080/'

## Using Docker

We tried to implement our docker image with the `run populate` command. So, our image is working but without a pre-populated database.

There is a dockerfile in our repository. You should use it to run the app.


## Difficulties
We expressed some difficulties with the d3 library, linking it with our ejs code. So, we decided to use the chart.js library which was more simple for us to use.  
Also, the routing methods were difficult to implement for us but we achieve to do it !
As well, we had trouble implementing our docker image...

## Authors
This project was developped by :  
    * Louis CAUQUELIN  
    * Eloi ALARDET  
 from TD SI 03