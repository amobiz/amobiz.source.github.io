title: '整合 Maven 與 Yeoman，學習筆記 (6) - versions-maven-plugin'
date: 2013-12-28 05:00
comments: true
categories:
  - Programming
tags:
  - Maven
  - Yeoman
  - howto
---
### 使用 [`versions-maven-plugin`][versions-maven-plugin] 來檢查相依 library, plugin 的更新

專案開發一段時間之後，相依的 library, plugin 或許已經有更新的版本，要如何找出有哪些已經更新? 更新後的版號為何? 可以使用這裡介紹的  [`versions-maven-plugin`][versions-maven-plugin] 來檢查。

至於更新的 library 是否與專案相容，則需要根據版本編號，也就是「[語意化版本]」來判斷，並且使用自動化測試來保證。

另外，當專案版本更新時，也不必手動修改 pom.xml，一樣可以使用 `versions-maven-plugin` 來更新。

<!-- more -->

### 安裝 `versions-maven-plugin`

``` xml
    <plugins>
      ...
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>versions-maven-plugin</artifactId>
        <version>2.1</version>
      </plugin>
      ...
    </plugins>
```

### 使用 `versions:display-dependency-updates` 命令檢查 dependencies 更新

``` bat
mvn versions:display-dependency-updates
```

### 使用 `versions:display-plugin-updates` 命令檢查 plugin 更新

``` bat
mvn versions:display-plugin-updates
```

### 使用 `versions:set` 命令設定專案版本

``` bat
mvn versions:set -DnewVersion=2.0.0-SNAPSHOT
```
### 參考資料:

1. [Versions Maven Plugin][versions-maven-plugin]
2. [versions:display-dependency-updates][display-dependency-updates]
3. [Checking for new dependency updates]
4. [versions:display-plugin-updates][display-plugin-updates]
5. [Checking for new plugin updates]
6. [versions:set]
7. [Changing the project version]

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

[versions-maven-plugin]: http://mojo.codehaus.org/versions-maven-plugin/ "Versions Maven Plugin"
[語意化版本]: http://semver.org/lang/zh-TW/
[display-dependency-updates]: http://mojo.codehaus.org/versions-maven-plugin/display-dependency-updates-mojo.html "versions:display-dependency-updates"
[Checking for new dependency updates]: http://mojo.codehaus.org/versions-maven-plugin/examples/display-dependency-updates.html "Checking for new dependency updates"
[display-plugin-updates]: http://mojo.codehaus.org/versions-maven-plugin/display-plugin-updates-mojo.html "versions:display-plugin-updates"
[Checking for new plugin updates]: http://mojo.codehaus.org/versions-maven-plugin/examples/display-plugin-updates.html
[versions:set]: http://mojo.codehaus.org/versions-maven-plugin/set-mojo.html
[Changing the project version]: http://mojo.codehaus.org/versions-maven-plugin/examples/set.html
