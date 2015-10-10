title: '整合 Maven 與 Yeoman，學習筆記 (4) - tomcat-maven-plugin'
date: 2013-12-28 01:46
comments: true
categories:
tags: 
  - Tomcat
  - Maven
  - howto
---
### 支援 Tomcat 啟動

如果偏好使用 Tomcat，為方便在 deploy 前直接啟動 web app 檢視，可以在 `pom.xml` 加入 [`tomcat-maven-plugin`][tomcat-maven-plugin]，引用的版本最好在 properties 區塊定義，方便更新：

<!-- more -->

``` xml
<properties>
  <tomcat.version>2.2</tomcat.version>
</properties>
    
<build>
  <plugins>
    <!-- Tomcat support -->
    <plugin>
      <groupId>org.apache.tomcat.maven</groupId>
      <artifactId>tomcat7-maven-plugin</artifactId>
      <version>${tomcat.version}</version>
      <configuration>
        <path>/</path>
      </configuration>
    </plugin>
  </plugins>
<build>
```

1. 跟 Jetty 相反，Tomcat 預設的 web app context 是 `/${project.artifactId}`，以 [此範例][maven_yeoman_2] 來說就是 `/myapp`，所以最好指定 `path` 參數。參考 Tomcat 文件：[Usage][Tomcat Usage]。 
2. 全部的 goal 請參考 [Plugin Documentation]。
3. 參數：[Guide to Configuring Plug-ins]。沒有找到類似 Jetty 的 `scanIntervalSeconds` 參數。

然後，這樣啟動：

``` bat
mvn tomcat7:run
```

歡迎大家的回饋與心得分享。

### 參考文章：

* Tomcat [Usage][Tomcat Usage]
* Tomcat [Plugin Documentation]
* Tomcat Maven Plugin [Guide to Configuring Plug-ins]

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

[tomcat-maven-plugin]: http://tomcat.apache.org/maven-plugin.html
[Tomcat Usage]: http://tomcat.apache.org/maven-plugin-trunk/tomcat7-maven-plugin/usage.html
[Plugin Documentation]: http://tomcat.apache.org/maven-plugin-2.0/tomcat7-maven-plugin/plugin-info.html
[Guide to Configuring Plug-ins]: http://maven.apache.org/guides/mini/guide-configuring-plugins.html
