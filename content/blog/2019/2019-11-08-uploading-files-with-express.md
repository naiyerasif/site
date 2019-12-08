---
title: Uploading files with Express
path: /uploading-files-with-express
date: 2019-11-08
updated: 2019-11-08
author: [naiyer] 
tags: ['guide']
---

In a typical Spring, Node.js and Angular setup, an Express middleware is often used as a [backend for frontend](https://developer.ibm.com/patterns/create-backend-for-frontend-application-architecture/). In this guide, we're going to explore how an Express middleware can mediate a file upload while talking to an Angular frontend and a Spring backend. Our middleware should be able to handle the upload a file of the order of several MBs.

### Setup

> We'll use:
> - Java 8
> - Spring Boot 2.2
> - Angular 8

### Table of Contents

## Create a file upload service

Start by generating a Spring Boot application with `spring-boot-starter-webflux` as one of the starters. We'll run this application on port `8081`. Adjust the port by editing the `application.properties`.

```properties
server.port=8081
```

### Create file upload handler

Let's write a handler to upload the file at a certain location.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.http.codec.multipart.FormFieldPart;
import org.springframework.http.codec.multipart.Part;
import org.springframework.stereotype.Controller;
import org.springframework.web.reactive.function.BodyExtractors;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.io.File;
import java.util.Map;

public @Controller class MixedUploadHandler {

  private static final Logger logger = LoggerFactory.getLogger(MixedUploadHandler.class);
  private static final String SENDER_KEY = "sender";
  private static final String FILE_KEY = "file";
  private static final String RESPONSE_TEMPLATE = "{\"fileName\":\"%s\",\"sender\":\"%s\",\"message\":\"%s\"}";

  public Mono<ServerResponse> upload(ServerRequest request) {
    return request.body(BodyExtractors.toMultipartData()).flatMap(parts -> {
      logger.info("Request received");
      Map<String, Part> mappedParts = parts.toSingleValueMap();
      FormFieldPart sender = (FormFieldPart) mappedParts.get(SENDER_KEY);
      logger.info("Got sender: {}", sender.value());
      FilePart file = (FilePart) mappedParts.get(FILE_KEY);

      file.transferTo(new File(file.filename()));
      logger.info("Uploaded file: {}", file.filename());

      return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
          .body(BodyInserters
              .fromValue(String.format(RESPONSE_TEMPLATE, file.filename(), sender.value(), "Successfully uploaded")));
    });
  }
}
```

This handler will
- extract the body of the incoming `ServerRequest` as a `multipart/form-data`
- create a `Map` of all the parts where the keys in the map correspond to the keys sent through the `form-data`
- write the received file at a specified location (at the `CLASSPATH`, in this case), and finally
- return a `ServerResponse` with a success message.

### Define a route for upload

We need to create an endpoint that would receive the upload request and send it to the `MixedUploadHandler` defined above. Let's say this route is `/upload/mixed`.

Let's write a router to create the endpoint.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

public @Configuration class RequestRouter {

  private static final Logger logger = LoggerFactory.getLogger(RequestRouter.class);
  private static final String MIXED_UPLOAD_ROUTE = "/upload/mixed";

  public @Bean RouterFunction<ServerResponse> mixedUploadRoute(MixedUploadHandler mixedUploadHandler) {
    logger.info("Route initialized: {}", MIXED_UPLOAD_ROUTE);
    return RouterFunctions
        .route(RequestPredicates.POST(MIXED_UPLOAD_ROUTE).and(RequestPredicates.accept(MediaType.MULTIPART_FORM_DATA)),
            mixedUploadHandler::upload);
  }
}
```

This `RequestRouter` will accept the `multipart/form-data` and invoke `MixedUploadHandler`.

### Define a CORS filter for Express

Say, we decide to run Express on the port 8080. We'll have to provide a CORS filter to the Spring Boot application so that it may accept the requests from Express. This can be done by injecting a `CorsWebFilter` bean.

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Collections;

public @SpringBootApplication class Launcher {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  @Bean CorsWebFilter corsWebFilter() {
    CorsConfiguration corsConfig = new CorsConfiguration();
    corsConfig.setAllowedOrigins(Collections.singletonList("http://localhost:8080"));
    corsConfig.addAllowedMethod("POST");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", corsConfig);

    return new CorsWebFilter(source);
  }
}
```

> **Note** that this is a global filter that allows all POST requests from `localhost:8080`. Such a setup is not advised for production but for this example, it will do.

The Spring backend is ready. After launching, it'll run on port 8081.

## Create an Express middleware

Start by creating a Node.js application.

```sh
yarn init -y
```

We'll use
- `morgan` for request logging
- `multer` to handle `multipart/form-data`
- `request` to send the request to the Spring Boot endpoint
- `cors` to enable CORS on the requests
- `body-parser` to parse the request body

Let's add the above-mentioned dependencies.

```sh
yarn add express morgan multer request cors body-parser
```

Create an Express middleware as follows.

```js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const request = require('request');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('combined'));

const port = process.env.PORT || 8080;
const springApiUrl = 'http://localhost:8081/upload/mixed';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: storage });

app.post('/upload/mixed', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const sender = req.body.sender;

    if (file && sender) {
      const formData = {
        sender: 'Naiyer',
        file: fs.createReadStream(__dirname + '/tmp/' + file.filename)
      }

      request.post({
        url: springApiUrl,
        formData: formData
      }, (err, res, body) => {
        if (err) {
          console.log(err);
        }
      })

      res.status(200).jsonp({
        fileName: file.filename,
        sender: sender,
        message: 'Successfully uploaded'
      })
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () =>
  console.log(`App started on port ${port}.`)
);
```

This application
- sets `morgan` logging with `combined` output format
- configures `multer` to save the incoming files for upload in a `tmp` directory, and
- passes that request to the Spring Boot application with `request`.

Configure a launch script to start Express.

```json
"main": "index.js",
"scripts": {
  "start": "node ."
},
```

By executing `yarn start`, our Express application gets up and running on port 8080.

We can reuse the Angular application for upload from [Uploading files with an Express middleware](/blog/2018/09/09/uploading-files-with-spring-and-angular). Launch it using `yarn start`. You'll be greeted by a form to upload the files. If you try to upload, the files will appear on the `CLASSPATH` of the Spring Boot application.

## References

> **Source Code**: [express-file-upload](https://gitlab.com/isometrix/io/tree/master/disk_io_with_reactive_spring_express_angular)