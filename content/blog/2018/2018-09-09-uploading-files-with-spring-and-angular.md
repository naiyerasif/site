---
title: Uploading files with Spring and Angular
path: /uploading-files-with-spring-and-angular
date: 2018-09-09
updated: 2019-11-11
author: [naiyer] 
tags: ['guide']
---

When you need to obtain data from your users, it is customary to offer them provide it through forms and file uploads. Spring provides a robust set of APIs to do this, and so does Angular. Consider a requirement to upload multiple files. For large files, it also makes sense to provide some visual feedback indicating the progress of the upload. In this guide, we'll create Spring and Angular applications for this requirement.

### Setup

> We'll use:
> - Java 11
> - Node 12
> - Spring Boot 2.1.8
> - Angular 8

We'll utilize the [Uploading files](https://spring.io/guides/gs/uploading-files/) guide from Spring with some modifications to fit our needs.

### Table of Contents

## Create a Spring application to handle uploads

Start by defining an interface to enforce a contract for the service to upload and fetch files.

```java
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

  void init();

  void store(MultipartFile... file);

  Stream<Path> loadAll();

  Path load(String filename);

  Resource loadAsResource(String filename);

  void deleteAll();

}
```

Create a `FileSystemStorageService` that would read/write files on the filesystem of a machine. It should

- create a directory where files would be uploaded
- provide methods to store and delete files on the disk
- enable file download using its name

```java
import dev.mflash.guides.fileupload.configuration.StorageProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Stream;

public @Service class FileSystemStorageService implements StorageService {

  private final Path rootDir;

  public FileSystemStorageService(StorageProperties storageProperties) {
    this.rootDir = Paths.get(storageProperties.getLocation());
  }

  public @Override void init() {
    try {
      Files.createDirectories(rootDir);
    } catch (IOException e) {
      throw new StorageException("Could not initialize storage", e);
    }
  }

  public @Override void store(MultipartFile... files) {
    if (files.length > 0) {
      List.of(files).forEach(this::store);
    } else {
      throw new StorageException("Invalid request payload");
    }
  }

  private void store(MultipartFile file) {
    String filename = StringUtils.cleanPath(file.getOriginalFilename());
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

Note that the value of `rootDir` is being fetched through a `ConfigurationProcessor`. You can configure the root directory in `application.yml` under the key `storage.location`.

> Similarly, you can also implement services that would write to an `SFTP` server or on cloud storage.

### Define REST endpoints

To list, upload and download the files, define the necessary endpoints in a controller.

```java
import dev.mflash.guides.fileupload.service.StorageException;
import dev.mflash.guides.fileupload.service.StorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RequestMapping("/file")
public @RestController class FileSystemStorageController {

  private final StorageService storageService;

  public FileSystemStorageController(StorageService storageService) {
    this.storageService = storageService;
  }

  @GetMapping
  public List<Path> listAllFiles() {
    return storageService.loadAll().collect(Collectors.toList());
  }

  @GetMapping(value = "/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public ResponseEntity<?> getFile(@RequestParam("fileName") String fileName) {
    try {
      return ResponseEntity.ok(storageService.loadAsResource(Objects.requireNonNull(fileName)));
    } catch (StorageException e) {
      return ResponseEntity.notFound().build();
    }
  }

  @PostMapping
  public Map<String, String> handleFileUpload(@RequestParam("data") MultipartFile... file) {
    try {
      storageService.store(Objects.requireNonNull(file));
      return Collections.singletonMap("status", "Successfully uploaded");
    } catch (Exception e) {
      return Collections.singletonMap("status", e.getLocalizedMessage());
    }
  }
}
```

> **Note** To handle a folder, create an endpoint that accepts multiple `MultipartFile` objects.

Enable CORS to accept requests from the Angular frontend.

```java
import dev.mflash.guides.fileupload.configuration.StorageProperties;
import dev.mflash.guides.fileupload.service.StorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@EnableConfigurationProperties(StorageProperties.class)
public @SpringBootApplication class Launcher implements WebMvcConfigurer {

  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }

  @Bean CommandLineRunner init(StorageService storageService) {
    return (args) -> {
      storageService.deleteAll();
      storageService.init();
    };
  }

  public @Override void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**").allowedOrigins("http://localhost:4200");
  }
}
```

## Create an Angular application for uploads

Execute the following command to generate a new Angular application.

```bash
ng new uploader --minimal=true --routing=false --skipTests=true --style=scss --directory=web --enableIvy=true
```

> For more information on these options, refer to [Angular CLI docs](https://angular.io/cli/new).

Create a service to call the Spring endpoints.

```typescript
import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root"
})
export class UploadService {

  private config = environment;

  constructor(private client: HttpClient) {}

  getListOfUploadedFiles() {
    return this.client.get(`${this.config.apiUrl}`);
  }

  uploadFile(file: File): Observable<HttpEvent<{}>> {
    const formData = new FormData();
    formData.append("data", file);

    return this.upload(formData);
  }

  uploadFolder(folder: FileList): Observable<HttpEvent<{}>> {
    const formData = new FormData();

    Array.from(folder).forEach(file => {
      formData.append("data", file);
    });

    return this.upload(formData);
  }

  private upload(formData: FormData): Observable<HttpEvent<{}>> {
    const request = new HttpRequest("POST", `${this.config.apiUrl}`, formData, {
      reportProgress: true,
      responseType: "text"
    });

    return this.client.request(request);
  }
}
```

**Note** that we are returning `Observable<HttpEvent<{}>>` from the upload method as a response. With `HttpEvent`, you can track the progress of upload through `loaded` and `total` properties, made available when the `reportProgress` flag is set to `true` in the `HttpRequest` object.

### Create a component to upload the files

Edit `AppComponent` to use the `UploadService` to upload and display the files.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { UploadService } from "./upload.service";
import { HttpEventType, HttpResponse } from "@angular/common/http";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {

  selectedFiles: FileList;
  currentFileUpload: File;
  public fileNames: String = 'File input';
  progress: { percentage: number } = {percentage: 0};
  public uploadedFiles: Array<String>;

  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    this.fileList();
  }

  get status() {
    if (this.progress.percentage <= 25) {
      return "is-danger";
    } else if (this.progress.percentage <= 50) {
      return "is-warning";
    } else if (this.progress.percentage <= 75) {
      return "is-info";
    } else {
      return "is-success";
    }
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    this.fileNames = this.selectedFiles.length + ' file(s) selected';
  }

  upload() {
    this.progress.percentage = 0;

    if (this.selectedFiles.length > 1) {
      this.uploadService.uploadFolder(this.selectedFiles).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress.percentage = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          console.log('Files successfully uploaded!');
        }
      });
    } else {
      this.currentFileUpload = this.selectedFiles.item(0);
      this.uploadService.uploadFile(this.currentFileUpload).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress.percentage = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          console.log('File successfully uploaded!');
        }
      });
    }

    this.selectedFiles = undefined;
    this.fileList();
  }

  fileList() {
    this.uploadService.getListOfUploadedFiles().subscribe(
      res => this.uploadedFiles = `${res}`.split(',').map(f => f.replace(/^.*[\\\/]/, '')));
  }
}
```

Open `app.component.html` and add the following template (which is built using [Bulma](https://bulma.io)).

```html
<section class="hero">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-desktop">
        <div class="column is-one-third">
          <div class="field">
            <div class="file is-fullwidth">
              <label class="file-label">
                <input class="file-input" type="file" (change)="selectFile($event)" multiple>
                <span class="file-cta">
                  <span class="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"  stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </span>
                  <span class="file-label">
                    {{fileNames}}
                  </span>
                </span>
              </label>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <progress *ngIf="currentFileUpload" class="progress" [ngClass]="status" [value]="progress.percentage"
                max="100">{{progress.percentage}}%</progress>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button class="button is-primary" [disabled]="!selectedFiles" (click)="upload()">Upload</button>
            </div>
          </div>
        </div>
        <div class="column is-one-third">
          <nav *ngIf="uploadedFiles" class="panel">
            <p class="panel-heading">
              Uploaded files
            </p>
            <a *ngFor="let f of uploadedFiles" class="panel-block">{{ f }}</a>
          </nav>
        </div>
      </div>
    </div>
  </div>
</section>
```

Don't forget to provide the `multiple` attribute for the `input[type=file]` element in the component, else you won't be able to upload multiple files.

Launch the Spring and Angular applications and open the browser at <http://localhost:4200>. Try uploading some files to see the application in action.

## References

> **Source Code**: [spring-file-upload](https://gitlab.com/mflash/guides/spring/tree/master/spring-file-upload)
>
> **Discussions**
> - Getting Started Guide from Spring: [Uploading files](https://spring.io/guides/gs/uploading-files/)
> - grokonez: [Angular 6 – Upload/Get MultipartFile to/from Spring Boot Server](https://grokonez.com/java-integration/angular-6-upload-get-multipartfile-spring-boot-example)