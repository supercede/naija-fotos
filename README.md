# Naijafotos-Backend

[![Build Status](https://travis-ci.org/supercede/naija-fotos.svg?branch=develop)](https://travis-ci.org/supercede/naija-fotos)

[![Coverage Status](https://coveralls.io/repos/github/supercede/naija-fotos/badge.svg?branch=develop)](https://coveralls.io/github/supercede/naija-fotos?branch=develop)

[![Maintainability](https://api.codeclimate.com/v1/badges/31925e7a3893eabb61f3/maintainability)](https://codeclimate.com/github/supercede/naija-fotos/maintainability)

Naijafotos is a photo repository designd to show the beauty of photography by Nigerians. Whether professionals or amateurs, users are encouraged to share their stories with the world in pictures. 

### Prerequisites

Ensure you have the following installed on your local machine:

- [NodeJS](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/download-center/community) or [Mongo Atlas](https://www.mongodb.com/download-center/cloud)
- [Docker](https://www.docker.com/products/docker-desktop) to run in a containerized environment (optional)

## Technologies Used

- [NodeJS](https://nodejs.org/en/download/)
- [ExpressJS](https://expressjs.com/)
- [Mongo Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose](https://mongoosejs.com/)
- [Pug](https://pugjs.org/)

## Project Pipeline

- [Pivotal Tracker stories](https://www.pivotaltracker.com/n/projects/2444330)
- [Hosted API](https://naijafotos-backend.herokuapp.com/)
- [API Docs](https://naijafotos-backend.herokuapp.com/docs)

### Installing/Running locally

- Clone or fork repo🤷‍♂

  ```bash
    - git clone <repo>
    - cd naijafotos
    - npm install
  ```

- Create/configure `.env` environment with your credentials. A sample `.env.example` file has been provided to get you started. Make a duplicate of `.env.example` and rename to `.env`, then configure your credentials (ensure to provide the correct details).

- Run `npm run dev` to start the server and watch for changes 

### To build and run in docker

- After cloning and configuring your `.env` file,

    ```
      - docker volume create --name=mongo_external
      - npm run docker:build
      - npm install
    ```

## HTTP Requests

All API requests are made by sending a secure HTTPS request using one of the following methods, depending on the action being taken:

- `POST` Create a resource
- `GET` Get a resource or list of resources
- `PATCH` Update a resource
- `DELETE` Delete a resource

For `POST` and `PATCH` requests, the body of your request may include a JSON payload.

### HTTP Response Codes

Each response will be returned with one of the following HTTP status codes:

- `200` `OK` The request was successful
- `201` `Created` Successful request, A new resource has been created
- `204` `No Content` Request was successful but there's no request returned (Used in Delete requests)
- `400` `Validation Errors or Bad Request` There was a problem with the request (malformed)
- `401` `Unauthorized` The supplied API credentials are invalid
- `403` `Forbidden` The credentials provided do not have permissions to access the requested resource
- `404` `Not Found` An attempt was made to access a resource that does not exist in the API
- `409` `Conflict` Data already exists in the database (Used when trying to sign up or update a unique field)
- `500` `Server Error` An error occurred on the server

## Documentation

Check documentation [here](https://naijafotos-backend.herokuapp.com/docs)
