title: '整合 Maven 與 Yeoman，學習筆記 (9) - 使用 mvn archetype:generate 建立 App Engine 專案'
date: 2013-12-31 06:00
comments: true
categories:
tags:
  - Google App Engine
  - Maven
  - howto
---
### 使用 mvn archetype:generate 建立 App Engine 專案

<!-- more -->

### 參考資料:

* Google App Engine [Using Apache Maven]
* Google App Engine [Using JPA with App Engine]
* [Deploying a Maven project (Jersey) to Google Application Engine (GAE)][deploy]
* [maven-gae-plugin]
* [GAE - Getting started with Google App Engine using Maven][gae-getting-started]
* [GAE - Google App Engine, JPA2, Maven and Eclipse][gae-jpa2-maven]

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [整合 Maven 與 Yeoman，學習筆記 (1) - node_modules][integrating-maven-and-yeoman-study-notes-1-node-modules]
* [整合 Maven 與 Yeoman，學習筆記 (2) - mvn archetype:generate][integrating-maven-and-yeoman-study-notes-2-mvn-archetype-generate-jersey]
* [整合 Maven 與 Yeoman，學習筆記 (3) - jetty-maven-plugin][integrating-maven-and-yeoman-study-notes-3-jetty-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (4) - tomcat-maven-plugin][integrating-maven-and-yeoman-study-notes-4-tomcat-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (5) - 使用 build-helper-maven-plugin 支援多 src 目錄][integrating-maven-and-yeoman-study-notes-5-multi-source-dir]
* [整合 Maven 與 Yeoman，學習筆記 (6) - versions-maven-plugin][integrating-maven-and-yeoman-study-notes-6-versions-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (7) - trecloux-yeoman-maven-plugin][integrating-maven-and-yeoman-study-notes-7-trecloux-yeoman-maven-plugin]
* [整合 Maven 與 Yeoman，學習筆記 (8) - 使用 RequireJS R.js 自動打包專案 JavaScript 檔案][integrating-maven-and-yeoman-study-notes-8-requirejs]
* [整合 Maven 與 Yeoman，學習筆記 (9) - 使用 mvn archetype:generate 建立 App Engine 專案][integrating-maven-and-yeoman-study-notes-9-mvn-archetypegenerate-app-engine-project]
{% endpostrefs %}

<!-- external references -->

[Using Apache Maven]: https://developers.google.com/appengine/docs/java/tools/maven
[Using JPA with App Engine]: https://developers.google.com/appengine/docs/java/datastore/jpa/overview-dn2
[deploy]: http://www.luigi7up.com/index.php/posts/it/31-deploying-maven-project-jersey-to-google-application-engine-gae "Deploying a Maven project (Jersey) to Google Application Engine (GAE)"
[maven-gae-plugin]: https://github.com/maven-gae-plugin/maven-gae-plugin
[gae-getting-started]: http://www.loop81.com/2013/01/gae-getting-started-with-google-app.html "GAE - Getting started with Google App Engine using Maven"
[gae-jpa2-maven]: http://www.loop81.com/2013/02/gae-google-app-engine-jpa2-maven-and.html "GAE - Google App Engine, JPA2, Maven and Eclipse"