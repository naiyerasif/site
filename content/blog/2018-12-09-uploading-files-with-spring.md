---
title: Uploading files with Spring
path: uploading-files-with-spring
date: 2018-12-09
updated: 2018-12-09
author: [naiyer]
summary: Create a RESTful service using Spring and an Angular client to upload a directory or file on a disk  
tags: ['guide', 'spring', 'angular']
---

## Intent

The intent of this guide is to write a RESTful service to upload a folder or file with the help of a Spring backend and design a simple Angular client to demonstrate the functionality.

### Setup

> This guide uses
> - Java 12
> - Node 12
> - Spring Boot 2.2.M4
> - Angular 8

### Table of Contents

## Create a Spring application to handle uploads

Start by defining an interface that will enforce a contract for the service to upload and fetch files.

```java
package com.mflash.service;

import java.nio.file.Path;
import java.util.stream.Stream;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

public @Service interface StorageService {

  void init();

  void store(MultipartFile... file);

  Stream<Path> loadAll();

  Path load(String filename);

  Resource loadAsResource(String filename);

  void deleteAll();

}
```

### Implement the `FileSystemStorageService`

`FileSystemStorageService` can be an implementation of `StorageService` interface that would interact with the filesystem of a machine.

```java
package com.mflash.service;

import com.mflash.configuration.StorageProperties;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

public @Service class FileSystemStorageService implements StorageService {

  private final Path rootLocation;

  public FileSystemStorageService(StorageProperties properties) {
    this.rootLocation = Paths.get(properties.getLocation());
  }

  public @Override void init() {
    try {
      Files.createDirectories(rootLocation);
    } catch (IOException e) {
      throw new StorageException("Could not initialize storage", e);
    }
  }

  public @Override void store(MultipartFile... files) {
    if (files.length > 0) {
      List.of(files).forEach(this::store);
    } else {
      throw new StorageFileNotFoundException("Invalid request payload");
    }
  }


  public @Override Stream<Path> loadAll() {
    try {
      return Files.walk(this.rootLocation, 1)
          .filter(path -> !path.equals(this.rootLocation))
          .map(this.rootLocation::relativize);
    } catch (IOException e) {
      throw new StorageException("Failed to read stored files", e);
    }
  }

  public @Override Path load(String filename) {
    return rootLocation.resolve(filename);
  }

  public @Override Resource loadAsResource(String filename) {
    try {
      Path file = load(filename);
      Resource resource = new UrlResource(file.toUri());
      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw new StorageFileNotFoundException("Could not read file: " + filename);
      }
    } catch (MalformedURLException e) {
      throw new StorageFileNotFoundException("Could not read file: " + filename, e);
    }
  }

  public @Override void deleteAll() {
    FileSystemUtils.deleteRecursively(rootLocation.toFile());
  }

  private void store(MultipartFile file) {
    String filename = StringUtils.cleanPath(file.getOriginalFilename());
    try {
      if (file.isEmpty()) {
        throw new StorageException("Failed to store empty file " + filename);
      }
      if (filename.contains("..")) {
        // This is a security check
        throw new StorageException(
            "Cannot store file with relative path outside current directory " + filename);
      }
      try (InputStream inputStream = file.getInputStream()) {
        Files.copy(inputStream, this.rootLocation.resolve(filename),
            StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException e) {
      throw new StorageException("Failed to store file " + filename, e);
    }
  }
}
```

Note that `rootLocation` is being fetched through a `ConfigurationProcessor`. You can configure the root location in `application.yml` under the key `storage.location`.

> In a similar way, you can also implement services that would write to an `SFTP` server or on a cloud storage.

### Define REST endpoints

Now, create a Controller to expose necessary endpoints.

```java
package com.mflash.controller;

import com.mflash.service.StorageService;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/file")
public @RestController class UploadController {

  private static final String LABEL = "status";

  private StorageService storageService;

  public UploadController(StorageService storageService) {
    this.storageService = storageService;
  }

  @GetMapping
  public List<Path> listAllFiles() {
    return storageService.loadAll().collect(Collectors.toList());
  }

  @GetMapping(value = "/{fileName:.+}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public Resource getFile(@PathVariable String fileName) {
    return storageService.loadAsResource(Objects.requireNonNull(fileName));
  }

  @PostMapping
  public Map<?, ?> handleFileUpload(@RequestParam("data") MultipartFile... file) {
    try {
      storageService.store(Objects.requireNonNull(file));
      return Collections.singletonMap(LABEL, "Successfully uploaded");
    } catch (Exception e) {
      return Collections.singletonMap(LABEL, e.getLocalizedMessage());
    }
  }
}
```

> **Note** To handle a folder, all you need to do is create an endpoint that accepts multiple `MultipartFile` objects.

Enable CORS to accept requests from the Angular frontend.

```java
package com.mflash;

import com.mflash.configuration.StorageProperties;
import com.mflash.service.StorageService;
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

## Create a frontend for uploads

Execute the following command to generate a new Angular application:

```bash
ng new spring-webmvc-multipart-upload-ui --minimal=true --routing=false --skipTests=true --style=scss --directory=web --enableIvy=true
```

> For more information on these options, refer to [Angular CLI wiki](https://github.com/angular/angular-cli/wiki/new).

Create a service to handle the interactions with Spring endpoints.

```typescript
import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent, HttpRequest, HttpResponse } from "@angular/common/http";
import { UploadConfig } from "./upload.config";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UploadService {
  constructor(private client: HttpClient, private config: UploadConfig) {}

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

**Note** that the upload methods are returning `Observable<HttpEvent<{}>>` as a response. With `HttpEvent`, you'll be able to track the progress of upload through its `loaded` and `total` properties. This is enabled by `reportProgress` option configured through `HttpRequest`.

### Component to upload the files

Define a component `UploadComponent` to upload the files.

```typescript
import { Component } from '@angular/core';
import { UploadService } from './upload.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  selectedFiles: FileList;
  currentFileUpload: File;
  public fileNames: String = 'File input';
  progress: { percentage: number } = {percentage: 0};
  public uploadedFiles: Array<String>;

  constructor(private uploadService: UploadService) {
  }

  ngOnInit() {
    this.fileList();
  }

  get status() {
    if (this.progress.percentage <= 25) {
      return 'danger';
    } else if (this.progress.percentage <= 50) {
      return 'warning';
    } else if (this.progress.percentage <= 75) {
      return 'info';
    } else {
      return 'success';
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
  }

  fileList() {
    this.uploadService.getListOfUploadedFiles().subscribe(res => this.uploadedFiles = `${res}`.split(',').map(f => f.replace(/^.*[\\\/]/, '')));
  }
}
```

Open `upload.component.html` and add the following template (which is built with [Nebular](https://akveo.github.io/nebular/)).

```html
<nb-layout>

  <nb-layout-column>
    <nb-card accent="info">
      <nb-card-body>
        <nb-icon icon="cloud-upload-outline"></nb-icon>&emsp;Multipart Upload with Spring
      </nb-card-body>
    </nb-card>
    <nb-card>
      <nb-card-body>
        <input type="file" nbInput fullWidth placeholder="{{fileNames}}" (change)="selectFile($event)" multiple>
        <nb-progress-bar *ngIf="currentFileUpload" [value]="progress.percentage" [displayValue]="true" [status]="status"></nb-progress-bar>
        <button nbButton  style="margin-top: 1rem" [disabled]="!selectedFiles" (click)="upload()">Upload</button>
      </nb-card-body>
    </nb-card>
  </nb-layout-column>

  <nb-layout-column>
    <nb-card *ngIf="uploadedFiles">
      <nb-card-header>Uploaded files</nb-card-header>
      <nb-list>
        <nb-list-item *ngFor="let f of uploadedFiles">
          {{ f }}
        </nb-list-item>
      </nb-list>
    </nb-card>
  </nb-layout-column>

</nb-layout>
```

Don't forget to supply `multiple` attribute on the `input[type=file]` element on the HTML page, else it won't allow upload of multiple files.

Launch the Spring and Angular applications and navigate to <http://localhost:4200>. Try uploading some files to see the application in action.

## References

> **Source Code** &mdash; [spring-webmvc-multipart-upload](https://github.com/Microflash/springtime/tree/master/spring-webmvc-multipart-upload)
>
> **Discussions**
> - Getting Started Guide from Spring: [Uploading files](https://spring.io/guides/gs/uploading-files/)
> - grokonez: [Angular 6 – Upload/Get MultipartFile to/from Spring Boot Server](https://grokonez.com/java-integration/angular-6-upload-get-multipartfile-spring-boot-example)