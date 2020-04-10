---
title: 'Uploading files with Spring Boot and Express'
date: 2019-11-08 16:06:33
updated: 2020-03-18 21:50:11
authors: [naiyer]
labels: [express, spring, angular]
---

In a traditional microservice premise, a client application (e.g., an Angular frontend) rarely hits a backend service directly. Usually, a middleware (e.g., an Express application) sits between the backend and client, facilitating the communication, as a [backend for frontend](https://developer.ibm.com/patterns/create-backend-for-frontend-application-architecture/). In this post, we'll explore how Express can facilitate a file upload with a reactive Spring backend and an Angular frontend.

##### Setup

The examples in this post use

- Java 13
- Spring Boot 2.2.5
- Node 12
- Express 4
- Angular 9

## Create an upload service with Spring Boot

Generate a Spring Boot application with [Spring Initializr](https://start.spring.io/); include `spring-boot-starter-webflux` and `spring-boot-configuration-processor` as the dependencies.

Create an interface that describes the methods to upload and fetch the files.

```java
// src/main/java/dev/mflash/guides/upload/service/StorageService.java

public interface StorageService {

  void init();

  void store(List<FilePart> files);

  Stream<Path> loadAll();

  Path load(String filename);

  Resource loadAsResource(String filename);

  void deleteAll();
}
```

Implement this interface to read and write to a filesystem.

```java
// src/main/java/dev/mflash/guides/upload/service/FileSystemStorageService.java

public @Service class FileSystemStorageService implements StorageService {

  private final Path rootDir;

  public FileSystemStorageService(StorageProperties storageProperties) {
    this.rootDir = Paths.get(storageProperties.getLocation());
  }

  public @Override void init() {
    try {
      Files.createDirectories(rootDir);
    } catch (Exception e) {
      throw new StorageException("Could not initialize storage", e);
    }
  }

  public @Override void store(List<FilePart> files) {
    if (files.size() > 0) {
      files.forEach(file -> {
        String filename = StringUtils.cleanPath(Objects.requireNonNull(file.filename()));
        if (filename.contains("..")) {
          throw new StorageException("Cannot store file with relative path outside current directory " + filename);
        }
        file.transferTo(Paths.get(this.rootDir.toString(), filename));
      });
    } else {
      throw new StorageException("Invalid request payload");
    }
  }

  public @Override Stream<Path> loadAll() {
    try {
      return Files.walk(this.rootDir, 1)
          .filter(path -> !path.equals(this.rootDir))
          .map(this.rootDir::relativize);
    } catch (IOException e) {
      throw new StorageException("Failed to read stored files", e);
    }
  }

  public @Override Path load(String filename) {
    return this.rootDir.resolve(filename);
  }

  public @Override Resource loadAsResource(String filename) {
    try {
      Path file = load(filename);
      Resource resource = new UrlResource(file.toUri());
      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw new StorageException("Could not read file: " + filename);
      }
    } catch (MalformedURLException e) {
      throw new StorageException("Could not read file: " + filename, e);
    }
  }

  public @Override void deleteAll() {
    FileSystemUtils.deleteRecursively(rootDir.toFile());
  }
}
```

This service
- creates a directory to write files to with `init` method
- write files with `store` method
- returns a list of uploaded files with `loadAll` method
- returns a requested file by name with `loadResource` method, and
- cleans up the upload directory with `deleteAll` method

Create a controller to accept a request and prepare the response.

```java
// src/main/java/dev/mflash/guides/upload/handler/FileSystemStorageHandler.java

public @Controller class FileSystemStorageHandler {

  private final StorageService storageService;

  public FileSystemStorageHandler(StorageService storageService) {
    this.storageService = storageService;
  }

  public Mono<ServerResponse> listAllFiles(ServerRequest request) {
    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromValue(storageService.loadAll()));
  }

  public Mono<ServerResponse> getFile(ServerRequest request) {
    String fileName = request.queryParam("fileName").get();
    try {
      return ServerResponse.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
          .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=\"%s\"", fileName)).body(
              BodyInserters.fromValue(storageService.loadAsResource(fileName))
          );
    } catch (StorageException e) {
      return ServerResponse.notFound().build();
    }
  }

  public Mono<ServerResponse> uploadFile(ServerRequest request) {
    return request.multipartData().flatMap(parts -> {
      try {
        storageService
            .store(parts.get("data").parallelStream().map(part -> (FilePart) part).collect(Collectors.toList()));
        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(
            BodyInserters.fromValue(Map.of("status", "Successfully uploaded"))
        );
      } catch (Exception e) {
        return ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(MediaType.APPLICATION_JSON).body(
            BodyInserters.fromValue(Map.of("status", e.getLocalizedMessage()))
        );
      }
    });
  }
}
```

The `ServerResponse` is returned as an atomic value through `Mono`. 

### Configure routes

Note that the handler methods don't have any endpoint information. In a reactive Spring Boot application, this information (also called *routes*) can be provided through a `RouterFunction` bean as follows.

```java
// src/main/java/dev/mflash/guides/upload/configuration/FileSystemStorageRouter.java

public @Configuration class FileSystemStorageRouter {

  public @Bean RouterFunction<ServerResponse> storageRouter(FileSystemStorageHandler storageHandler) {
    return RouterFunctions
        .route(RequestPredicates.GET("/file"), storageHandler::listAllFiles)
        .andRoute(RequestPredicates.GET("/file/download"), storageHandler::getFile)
        .andRoute(RequestPredicates.POST("/file").and(RequestPredicates.accept(MediaType.MULTIPART_FORM_DATA)),
            storageHandler::uploadFile);
  }
}
```

Multiple routes can be configured through the same bean, with the type of route and request content-type. The actual requests are simply passed to the handler methods which prepare and return a response.

### Configure CORS

Say, we decide to run Express on the port `8080`. We'll have to provide a CORS filter to the Spring Boot application so that it may accept the requests from Express. This can be done by overriding the `addCorsMappings` method of the `WebFluxConfigurer` interface.

```java
// src/main/java/dev/mflash/guides/upload/Launcher.java

public @SpringBootApplication class Launcher implements WebFluxConfigurer {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  public @Override void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**").allowedOrigins("http://localhost:8080");
  }
}
```

> **WARNING** This is a global CORS mapping. Do NOT use such a configuration on production!

Since Express will be running at the port `8080`, let's configure a different port for the Spring application by editing `application.yml` file.

```yaml
server:
  port: 8079
```

## Create an Express middleware

Generate a Node.js application by executing the following command.

```bash
yarn init -y
```

We'll use
- `morgan` for request logging
- `multer` to handle `multipart/form-data`
- `form-data` to build urlendcoded form-data
- `axios` to send the requests to the Spring Boot backend
- `cors` to enable CORS on the requests
- `body-parser` to parse the request body

Add all these dependencies through the following command.

```bash
yarn add express morgan multer form-data axios cors body-parser
```

Create a file `server.js` and add the following code.

```js
// middleware/server.js

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('combined'))

const port = process.env.PORT || 8080
const tempDir = 'tmp'
const context = '/file'
const backend = `http://localhost:8079${context}`

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, `${tempDir}/`),
  filename: (req, file, cb) => cb(null, file.originalname)
})

//  create / reset temp directory
const outPath = path.resolve(process.cwd(), tempDir)
if (fs.existsSync(outPath)) {
  fs.rmdirSync(outPath, { recursive: true })
}
fs.mkdirSync(outPath)

const upload = multer({ storage: storage })

// get list of uploaded files
app.get(context, async (req, res) => {
  const response = await axios.get(backend)
  res.json(response.data)
})

// download a file by name
app.get(`${context}/download`, async (req, res) => {
  if (req.query && req.query.fileName) {
    const response = await axios.get(`${backend}/download?fileName=${req.query.fileName}`)
    res.set({ ...response.headers }).send(response.data)
  }
})

// upload some files
app.post(context, upload.array('data'), async (req, res) => {
  try {
    const data = req.files

    if (data) {
      const form = new FormData()
      data.forEach(file => form.append('data', fs.createReadStream(__dirname + '/' + file.destination + file.filename)))

      const response = await axios.post(backend, form, { headers: form.getHeaders() })
      res.json(response.data)
    }
  } catch (err) {
    res.status(500).send(err);
  }
})

app.listen(port, () => console.log(`App started on port ${port}`))
```

This application
- creates the routes that correspond to the endpoints of the Spring Boot application
- passes that request to the Spring Boot application with `axios` in each route, and
- configures `multer` to save the incoming files for the upload in a `tmp` directory.

Configure a launch script to start Express.

```json
"main": "server.js",
"scripts": {
  "start": "node ."
},
```

By executing `yarn start`, this Express application gets up and running on port `8080`.

Reuse the Angular application for the upload from the post [Uploading files with Spring Boot and Angular](/blog/2018/09/09/uploading-files-with-spring-boot-and-angular/). Launch it using `yarn start`. You'll be greeted by a form to upload the files which will appear in the upload directory configured by the Spring Boot application.

## References

**Source code** &mdash; [springrx-file-upload](https://gitlab.com/mflash/spring-guides/-/tree/master/springrx-file-upload)