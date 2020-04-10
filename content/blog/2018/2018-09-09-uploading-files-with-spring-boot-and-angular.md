---
title: 'Uploading files with Spring Boot and Angular'
date: 2018-09-09 11:14:23
updated: 2020-03-08 21:16:19
authors: [naiyer]
labels: [spring, angular]
---

Give yourself a few years of time and you'll eventually come across a file upload problem of varying complexity. Consider this one: you want a Spring backend to upload a file through an Angular app. Since the files can be large and the network may be slow, the upload can take a while to complete. Hence, it is also useful to display the progress of the upload on the Angular app.

To solve this problem, we can modify the Spring Boot application described in [Uploading files](https://spring.io/guides/gs/uploading-files/) guide for our needs. And then we can create an Angular app to provide a UI.

##### Setup

The examples in this post use

- Java 13
- Node 12
- Spring Boot 2.1.8
- Angular 9

## Create the upload service with Spring Boot

Generate a Spring Boot app with [Spring Initializr](https://start.spring.io/). Include `spring-boot-configuration-processor` as one of the dependencies. Import the project in an IDE.

Define an interface to describe methods to upload and fetch the files.

```java
// src/main/java/dev/mflash/guides/upload/service/StorageService.java

public interface StorageService {

  void init();

  void store(MultipartFile... files);

  Stream<Path> loadAll();

  void deleteAll();
}
```

Implement this interface to read and write the files on the filesystem.

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

  public @Override void store(MultipartFile... files) {
    if (files.length > 0) {
      List.of(files).forEach(file -> {
        String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        try {
          if (file.isEmpty()) {
            throw new StorageException("Failed to store empty file " + filename);
          }
          if (filename.contains("..")) {
            throw new StorageException("Cannot store file with relative path outside current directory " + filename);
          }
          try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, this.rootDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
          }
        } catch (IOException e) {
          throw new StorageException("Failed to store file " + filename, e);
        }
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

  public @Override void deleteAll() {
    FileSystemUtils.deleteRecursively(rootDir.toFile());
  }
}
```

In this service,
- `init` method creates a directory where files would be uploaded
- `store` method writes one or more files on the disk
- `loadAll` method resolves the filename
- `deleteAll` method cleans up the storage location 

Also note that the value of `rootDir` is injected through a `ConfigurationProcessor` bean. You can configure the actual path of the storage location by `storage.location` property in the `application.yml` file.

### Create endpoints for the upload service

Create some endpoints to interact with this service.

```java
// src/main/java/dev/mflash/guides/upload/controller/FileSystemStorageController.java

@RequestMapping("/file")
public @RestController class FileSystemStorageController {

  private final StorageService storageService;

  public FileSystemStorageController(StorageService storageService) {
    this.storageService = storageService;
  }

  public @GetMapping List<Path> listAllFiles() {
    return storageService.loadAll().collect(Collectors.toList());
  }

  public @PostMapping Map<String, String> uploadFile(@RequestParam("data") MultipartFile... file) {
    try {
      storageService.store(Objects.requireNonNull(file));
      return Collections.singletonMap("status", "Successfully uploaded");
    } catch (Exception e) {
      return Collections.singletonMap("status", e.getLocalizedMessage());
    }
  }
}
```

There are three endpoints configured here.
- A GET request to `/file` will provide a list of all the files available at the storage location.
- A POST request to `/file` with form data containing one or more file under the key `data` will upload theme to the storage location.

Lastly, enable CORS to accept the requests from the Angular frontend.

```java{10-12}
// src/main/java/dev/mflash/guides/upload/Launcher.java

@EnableConfigurationProperties(StorageProperties.class)
public @SpringBootApplication class Launcher implements WebMvcConfigurer {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  public @Override void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**").allowedOrigins("http://localhost:4200");
  }
}
```

## Create a frontend for the upload

Generate a minimal Angular app with the following command.

```bash
ng new web --minimal --routing=false --style=css --skipTests --inlineStyle --inlineTemplate
```

> Refer to [`ng new` reference](https://angular.io/cli/new) for more information on these options.

Create a service to call the Spring endpoints created above.

```typescript
// src/app/upload.service.ts

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private client: HttpClient) {}

  getUploadedFiles() {
    return this.client.get(environment.apiUrl);
  }

  upload(data: FileList): Observable<HttpEvent<{}>> {
    const formData = new FormData();

    Array.from(data).forEach(file => {
      formData.append('data', file);
    });

    const request = new HttpRequest('POST', environment.apiUrl, formData, {
      reportProgress: true,
      responseType: 'text'
    });

    return this.client.request(request);
  }
}
```

`Observable<HttpEvent<{}>>` returned by `upload` method will provide the progress of the upload through `loaded` and `total` properties, which are made available when `reportProgress` flag is set to `true` in the `HttpRequest` object.

### Create a component to upload the files

Edit `AppComponent` to use the `UploadService` to upload and display the files.

```typescript
// src/app/app.component.ts

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterContentChecked {
  selected: FileList;
  public label: string = 'Select a file or two...';
  progress: { percentage: number } = { percentage: 0 };
  public uploadedFiles: Array<string>;

  constructor(private uploadService: UploadService) {}

  ngAfterContentChecked() {
    this.updateFileList();
  }

  get status() {
    return this.progress.percentage <= 25 ? 'is-danger' : this.progress.percentage <= 50 ? 'is-warning' : this.progress.percentage <= 75 ? 'is-info' : 'is-success';
  }

  selectFile(event: any) {
    this.selected = event.target.files;
    this.label = this.selected.length > 1 ? this.selected.length + ' files selected' : '1 file selected';
  }

  upload() {
    this.progress.percentage = 0;

    this.uploadService.upload(this.selected).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress.percentage = Math.round(100 * event.loaded / event.total);
      } else if (event instanceof HttpResponse) {
        console.log('File successfully uploaded!');
      }
    })

    this.selected = undefined;
  }

  updateFileList() {
    this.uploadService.getUploadedFiles().subscribe(res => {
      this.uploadedFiles = [...res.toString().split(',').map(name => name.replace(/^.*[\\\/]/, ''))];
    });
  }
}
```

> **WARNING** Do NOT use `AfterContentChecked` interface to call a service in production! Use a suitable change detection strategy to update the view.

Open `app.component.html` and add the following template (which is built using [Bulma](https://bulma.io)).

```html
<!-- src/app/app.component.html -->

<section class="hero is-light">
  <div class="hero-body">
    <div class="container">
      <h1 class="title">Uploader</h1>
      <h2 class="subtitle">
        <div class="form">
          <div class="field file-control">
            <div class="file">
              <label class="file-label">
                <input class="file-input" type="file" (change)="selectFile($event)" multiple>
                <span class="file-cta">
                  <span class="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </span>
                  <span class="file-label">{{ label }}</span>
                </span>
              </label>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button class="button is-primary is-medium" [disabled]="!selected" (click)="upload()">Upload</button>
            </div>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <progress *ngIf="progress.percentage > 0" class="progress" [ngClass]="status" [value]="progress.percentage" max="100">{{ progress.percentage }}%</progress>
          </div>
        </div>
      </h2>
    </div>
  </div>
</section>

<section class="hero" *ngIf="!!uploadedFiles">
  <div class="hero-body">
    <div class="container">
      <h1 class="title">Uploaded files</h1>
      <div class="content">
        <ul>
          <li *ngFor="let file of uploadedFiles">{{ file }}</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

Don't forget to provide the `multiple` attribute for the `input[type=file]` element in the component, else you won't be able to upload multiple files.

Launch the Spring and Angular applications and open the browser at <http://localhost:4200>. Try uploading some files to see the application in action.

## References

**Source Code** &mdash; [spring-file-upload](https://gitlab.com/mflash/spring-guides/-/tree/master/spring-file-upload)

**See also**
- [Uploading files](https://spring.io/guides/gs/uploading-files/)
- [Angular 6 – Upload/Get MultipartFile to/from Spring Boot Server](https://grokonez.com/java-integration/angular-6-upload-get-multipartfile-spring-boot-example)