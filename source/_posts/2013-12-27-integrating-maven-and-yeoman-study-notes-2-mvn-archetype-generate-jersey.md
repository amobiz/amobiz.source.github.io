title: '整合 Maven 與 Yeoman，學習筆記 (2) - 使用 mvn archetype:generate 建立 JAX-RS / Jersey 專案'
date: 2013-12-27 0:56:01
comments: true
categories: 
tags:
  - Howto
  - JAX-RS
  - Jersey
  - Maven
  - Yeoman
---
建立整合專案時，可以使用 Maven 的 template 機制，建立需要的專案架構。這時候可以執行 `mvn archetype:generate` 指令，從中選取適合的範本。執行該指令時，若不指定 `filter` 或 `archetypeGroupId` 及 `archetypeArtifactId` 參數，會進入 interactive mode，Maven 會列出在中央倉庫中所有的 archetypes，目前有 800 多個範本可選。

<!-- more -->

### 建立 JAX-RS / Jersey 專案

根據 [Jersey - Download] 的說明，可以執行 `mvn archetype:generate` 指令：

``` bat
mvn archetype:generate \
    -DarchetypeGroupId=org.glassfish.jersey.archetypes \
    -DarchetypeArtifactId=jersey-quickstart-webapp \
    -DarchetypeVersion=2.5
```

快速建立 jax-rs web app。由於省略 `-DarchetypeVersion=2.5` 參數時，Maven 會自動選擇最新的版本，所以其實只需要這樣：

``` bat
mvn archetype:generate \
    -DarchetypeGroupId=org.glassfish.jersey.archetypes \
    -DarchetypeArtifactId=jersey-quickstart-webapp
```

若是不想進入互動模式，也可以直接指定 `groupId`，`artifactId`，`version`，`package` 參數，然後指定 `-DinteractiveMode=false` 參數，進入 batch mode，譬如：

``` bat
mvn archetype:generate \
    -DarchetypeGroupId=org.glassfish.jersey.archetypes \
    -DarchetypeArtifactId=jersey-quickstart-webapp \
    -DgroupId=com.github.myapp \
    -DartifactId=myapp \
    -Dversion=1.0.0-SNAPSHOT \
    -Dpackage=com.github.myapp \
    -DinteractiveMode=false
```

### 自行建立 archetype

若經常需要重複建立類似的專案，也可以考慮自行建立 archetype。等有空的時候再來試試看。

參考文件: [Guide to Creating Archetypes]

### 後記

Yeoman 的 [GETTING STARTED WITH YEOMAN] 文件上說：

> On Windows, we suggest you use an improved command line tool such as Console2 or PowerShell to improve the experience.

但我使用 Windows PowerShell 來執行指令：

``` bat
mvn archetype:generate
    -DarchetypeGroupId=com.sun.jersey.archetypes
    -DarchetypeArtifactId=jersey-quickstart-webapp
```

會出現錯誤訊息：

> The goal you specified requires a project to execute but there is no POM in this directory

後來發現把參數用引號刮起來，像這樣：

``` bat
mvn archetype:generate
    "-DarchetypeGroupId=com.sun.jersey.archetypes"
    "-DarchetypeArtifactId=jersey-quickstart-webapp"
```

才能正確執行。由於不熟 PowerShell，暫時還不清楚原因。目前還是使用 cmd 來建置專案。

歡迎大家的回饋與心得分享。

### 參考文章：

* Maven [Project creation]
* Maven [Introduction to Archetypes]
* Maven [archetype:generate]
* Maven [Guide to Creating Archetypes]
* Jersey [Jersey - Download]
* Jersey [Chapter 2. Modules and dependencies][jersey-modules-and-dependencies]
* Yeoman [GETTING STARTED WITH YEOMAN]

### 相關文章：

* [整合 Maven 與 Yeoman，學習筆記 (1) - node_modules][integrating-maven-and-yeoman-study-notes-1-node-modules]
* [整合 Maven 與 Yeoman，學習筆記 (2) - mvn archetype:generate][integrating-maven-and-yeoman-study-notes-2-mvn-archetype-generate-jersey]
* [整合 Maven 與 Yeoman，學習筆記 (3) - jetty-maven-plugin][integrating-maven-and-yeoman-study-notes-3-jetty-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (4) - tomcat-maven-plugin][integrating-maven-and-yeoman-study-notes-4-tomcat-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (5) - 使用 build-helper-maven-plugin 支援多 src 目錄][integrating-maven-and-yeoman-study-notes-5-multi-source-dir]
* [整合 Maven 與 Yeoman，學習筆記 (6) - versions-maven-plugin][integrating-maven-and-yeoman-study-notes-6-versions-maven-plugin]

<!-- cross references -->

<!-- post_references -->

<!-- external references -->

[Jersey - Download]: https://jersey.java.net/download.html
[jersey-modules-and-dependencies]: https://jersey.java.net/documentation/latest/modules-and-dependencies.html "Chapter 2。Modules and dependencies"
[Guide to Creating Archetypes]: http://maven.apache.org/guides/mini/guide-creating-archetypes.html
[GETTING STARTED WITH YEOMAN]: http://yeoman.io/learning/
[Project creation]: http://maven.apache.org/archetype/maven-archetype-plugin/usage.html
[Introduction to Archetypes]: http://maven.apache.org/guides/introduction/introduction-to-archetypes.html
[archetype:generate]: http://maven.apache.org/archetype/maven-archetype-plugin/generate-mojo.html
[Guide to Creating Archetypes]: http://maven.apache.org/guides/mini/guide-creating-archetypes.html
