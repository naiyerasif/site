---
slug: "2023/08/05/islamic-calendar-in-java"
title: "Islamic calendar in Java"
date: 2023-08-05 23:44:34
update: 2023-08-05 23:44:34
type: "status"
category: "update"
---

Today I learned that Java supports [Islamic calendar](https://en.wikipedia.org/wiki/Islamic_calendar) relative to Mecca (since Java 8).

```java
interface IslamicCalendarExample {

	static void main(String... args) {
		var locale = Locale.forLanguageTag("en-IN-u-ca-islamic-umalqura");
		var chronology = Chronology.ofLocale(locale); // returns an instance of HijrahChronology
		String chronologyName = chronology.getDisplayName(TextStyle.FULL, locale);
		var dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy", locale);
		String formattedDate = chronology.dateNow().format(dateFormatter);
		System.out.println(chronologyName + ": " + formattedDate);
	}
}
```

`en-IN-u-ca-islamic-umalqura` is the [IETF BCP 47 language tag](https://en.wikipedia.org/wiki/IETF_language_tag) for Indian English supporting a specific calendar (`ca`) called `islamic-umalqura`. 

> [Um al-Qura](https://en.wikipedia.org/wiki/Umm_al-Qura) refers to Mecca here. 

Running the preceding snippet displays the date as follows.

```nu prompt{1} {2}
java IslamicCalendarExample.java
Islamic Calendar (Umm al-Qura): Muharram 18, 1445
```
