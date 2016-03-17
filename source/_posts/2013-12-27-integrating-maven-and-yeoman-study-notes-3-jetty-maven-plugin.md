title: '整合 Maven 與 Yeoman，學習筆記 (3) - jetty-maven-plugin'
date: 2013-12-27 03:24:11
comments: true
categories:
  - Programming
tags:
  - Jetty
  - Maven
  - howto
---
### 支援 Jetty 啟動

為方便在 deploy 前直接啟動 web app 檢視，可以在 `pom.xml` 加入 [`jetty-maven-plugin`][jetty-maven-plugin]，引用的版本最好在 `properties` 區塊定義，方便更新：

<!-- more -->

``` xml
<properties>
  <jetty.version>9.0.6.v20130930</jetty.version>
</properties>

<build>
  <plugins>
    <!-- Jetty support -->
    <plugin>
      <groupId>org.eclipse.jetty</groupId>
      <artifactId>jetty-maven-plugin</artifactId>
      <version>${jetty.version}</version>
      <configuration>
        <scanIntervalSeconds>10</scanIntervalSeconds>
        <webApp>
          <contextPath>/</contextPath>
        </webApp>
      </configuration>
    </plugin>
  </plugins>
<build>
```

這裡使用 `scanIntervalSeconds` 參數啟動自動掃描，方便修改時自動重新載入。

`contextPath` 則是指定 web app context，`/` 就是預設值，所以可以省略，此時 app 在 [http://localhost:8080/](http://localhost:8080/) 啟動。

若指定為 `/myapp`，則 app 在 [http://localhost:8080/myapp/](http://localhost:8080/myapp/) 啟動。

啟動指令：

``` bat
mvn jetty:run
```

Goal `jetty:run` 會自動觸發 build 階段，不過若專案有經過大修改 (譬如更動 class，method 名稱)，最好先 `clean` 再執行。

### 參考文章：

* [Configuring the Jetty Maven Plugin][jetty-maven-plugin]
* [Jetty : The Definitive Reference][jetty documentation]

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [整合 Maven 與 Yeoman，學習筆記 (1) - node_modules][integrating-maven-and-yeoman-study-notes-1-node-modules]
* [整合 Maven 與 Yeoman，學習筆記 (2) - mvn archetype:generate][integrating-maven-and-yeoman-study-notes-2-mvn-archetype-generate-jersey]
* [整合 Maven 與 Yeoman，學習筆記 (3) - jetty-maven-plugin][integrating-maven-and-yeoman-study-notes-3-jetty-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (4) - tomcat-maven-plugin][integrating-maven-and-yeoman-study-notes-4-tomcat-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (5) - 使用 build-helper-maven-plugin 支援多 src 目錄][integrating-maven-and-yeoman-study-notes-5-multi-source-dir]
* [整合 Maven 與 Yeoman，學習筆記 (6) - versions-maven-plugin][integrating-maven-and-yeoman-study-notes-6-versions-maven-plugin]
{% endpostrefs %}

<!-- external references -->

[jetty-maven-plugin]: http://www.eclipse.org/jetty/documentation/current/jetty-maven-plugin.html
[jetty documentation]: http://www.eclipse.org/jetty/documentation/
