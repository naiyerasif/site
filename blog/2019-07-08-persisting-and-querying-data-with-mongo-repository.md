---
title: Persisting and querying data with MongoRepository
path: persisting-and-querying-data-with-mongorepository
date: 2019-07-08
summary: Save objects and query them using MongoRepository interface of Spring Data MongoDB
tags: ['spring-data', 'mongodb', 'repository']
---

## Premise

You need to save objects and query them using `MongoRepository` interface of Spring Data MongoDB.

> **Requisites**
> - Java 12 or higher
> - Spring Boot 2.2; v2.2.M4 was used in this example.
> - MongoDB 4

## Setup a mongoDB instance

Create a mongoDB instance by executing the following command on your favorite terminal at the project root where [docker-compose.yml](https://github.com/Microflash/springtime/blob/master/spring-data-mongo-repository/docker-compose.yml) file resides:

```bash
docker-compose up -d
```
This will launch a mongoDB container.

## Define a domain

For the sake of example, say you want to persist and query on some albums with associated artists, genre and record labels. Start by defining the [domain](https://github.com/Microflash/springtime/tree/master/spring-data-mongo-repository/src/main/java/com/mflash/domain) for these objects.

## Create a Repository

Creating a `Repository` is trivial; just extend `MongoRepository` as follows:

```java
package com.mflash.repository;

import com.mflash.domain.Album;
import com.mflash.domain.Artist;
import com.mflash.domain.Genre;
import com.mflash.domain.Label;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AlbumRepository extends MongoRepository<Album, String> {

  Album findDistinctFirstByArtist(Artist artist);

  List<Album> findByReleasedOnAfter(LocalDate releasedOn);

  List<Album> findByGenre(Genre genre);

  List<Album> findByLabel(Label label);

}
```

`MongoRepository` provides several CRUD methods (like `findAll()`, `save()`, etc) out of the box, since it extends `CrudRepository` interface. For specific queries, you need to define method signatures (using certain [naming conventions](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/#repositories.query-methods.query-creation)) for Spring to generate their implementations.

## Write tests for the repository

Write some tests to verify if the repository created earlier works as expected.

```java
package com.mflash.repository;

import static com.mflash.configuration.Constants.DUA_LIPA;
import static com.mflash.configuration.Constants.INTERSCOPE;
import static com.mflash.configuration.Constants.albums;
import static com.mflash.configuration.Constants.artists;
import static com.mflash.configuration.Constants.labels;
import static com.mflash.domain.Genre.dancepop;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.Month;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest class AlbumRepositoryTest {

  private @Autowired AlbumRepository repository;

  @BeforeEach
  void init() {
    repository.deleteAll();
    repository.saveAll(albums.values());
  }

  @Test
  void findAll() {
    assertEquals(5, repository.findAll().size());
  }

  @Test
  void setIdOnSave() {
    repository.findAll().forEach(album -> assertNotNull(album.getId()));
  }

  @Test
  void findDistinctFirstByArtist() {
    var artist = artists.get(DUA_LIPA);
    assertEquals(artist, repository.findDistinctFirstByArtist(artist).getArtist());
  }

  @Test
  void findByReleasedOnAfter() {
    var after = LocalDate.of(2016, Month.JANUARY, 1);
    assertEquals(4, repository.findByReleasedOnAfter(after).size());
  }

  @Test
  void findByGenre() {
    assertEquals(2, repository.findByGenre(dancepop).size());
  }

  @Test
  void findByLabel() {
    var label = labels.get(INTERSCOPE);
    assertEquals(2, repository.findByLabel(label).size());
  }
}
```

## Cascade the documents on save

A Many-to-One relationship in mongoDB can be modeled with either [embedded documents](https://docs.mongodb.com/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/) or [document references](https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/); with the later method being more useful since it prevents repetition of data. This is enforced through a `@DBRef` annotation.

Unfortunately, Spring Data Mongo doesn't support cascading of objects in such cases; you need to write a mechanism to cascade the objects on save (or delete) operation. This can be done by writing an event listener which would save (or delete) the referenced objects through `MongoOperations`.

### Define a cascade annotation

Start by defining an annotation to indicate that a field needs to be cascaded.

```java
package com.mflash.event.cascade.save;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface CascadeSave {

}
```

Annotate the fields of a document entity that need to be cascaded.

```java
package com.mflash.domain;

import com.mflash.event.cascade.save.CascadeSave;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.StringJoiner;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

public class Album {

  private @Id String id;
  private String title;
  private @DBRef @CascadeSave Artist artist;
  private LocalDate releasedOn;
  private Set<Genre> genre;
  private @DBRef @CascadeSave Label label;

  // constructors, getters and setters, etc.
}
```

### Detect the fields to be cascaded

The references of cascaded objects should be associated with a document. You need to check if such a valid document exists. This can be done by checking the `@Id` of the document through a `FieldCallback`.

```java
package com.mflash.event;

import java.lang.reflect.Field;
import org.springframework.data.annotation.Id;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.ReflectionUtils.FieldCallback;

public class IdentifierCallback implements FieldCallback {

  private boolean idFound;

  public @Override void doWith(final Field field) throws IllegalArgumentException {
    ReflectionUtils.makeAccessible(field);

    if (field.isAnnotationPresent(Id.class)) {
      idFound = true;
    }
  }

  public boolean isIdFound() {
    return idFound;
  }
}
```

Similarly, you need to identify the objects that should be cascaded, by detecting `@CascadeSave` annotation on a field; once again, through a `FieldCallback` and then perform actual persistence operation using `MongoOperations`.

```java
package com.mflash.event.cascade.save;

import com.mflash.event.IdentifierCallback;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Objects;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.util.ReflectionUtils;

public class CascadeSaveCallback implements ReflectionUtils.FieldCallback {

  private final Object source;
  private final MongoOperations mongoOperations;

  public CascadeSaveCallback(Object source, MongoOperations mongoOperations) {
    this.source = source;
    this.mongoOperations = mongoOperations;
  }

  public @Override void doWith(final Field field)
      throws IllegalArgumentException, IllegalAccessException {
    ReflectionUtils.makeAccessible(field);

    if (field.isAnnotationPresent(DBRef.class) && field.isAnnotationPresent(CascadeSave.class)) {
      final Object fieldValue = field.get(source);

      if (Objects.nonNull(fieldValue)) {
        final var callback = new IdentifierCallback();

        if (fieldValue instanceof Collection<?>) {
          ((Collection<?>) fieldValue).forEach(mongoOperations::save);
        } else {
          ReflectionUtils.doWithFields(fieldValue.getClass(), callback);
          mongoOperations.save(fieldValue);
        }
      }
    }
  }
}
```

### Automate the cascading

At this point, you'll have to manually invoke these callbacks before calling the `save()` method for an `Album`. You can easily automate this by defining an event listener.

```java
package com.mflash.event.cascade.save;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.util.ReflectionUtils;

public class CascadeSaveMongoEventListener extends AbstractMongoEventListener<Object> {

  private @Autowired MongoOperations mongoOperations;

  public @Override void onBeforeConvert(final BeforeConvertEvent<Object> event) {
    final Object source = event.getSource();
    ReflectionUtils.doWithFields(source.getClass(), new CascadeSaveCallback(source, mongoOperations));
  }
}
```

Inject `CascadeSaveMongoEventListener` as a bean through a [`@Configuration`](https://github.com/Microflash/springtime/blob/master/spring-data-mongodb-repository/src/main/java/com/mflash/configuration/MongoConfiguration.java). Now, whenever you'll save an `Album` object, `Artist` and `Label` will be automatically cascaded. 

## References

> #### Source Code
> - [spring-data-mongo-repository](https://github.com/Microflash/springtime/tree/master/spring-data-mongo-repository)