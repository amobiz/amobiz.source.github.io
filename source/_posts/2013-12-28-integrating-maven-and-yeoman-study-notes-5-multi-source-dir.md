title: '整合 Maven 與 Yeoman，學習筆記 (5) - 使用 build-helper-maven-plugin 支援多 src 目錄'
date: 2013-12-28 03:50
comments: true
categories:
  - Programming
tags:
  - Maven
  - howto
---
### 使用 [`build-helper-maven-plugin`][build-helper-maven-plugin] 支援多 src 目錄

對於一些較複雜的專案，為了明確區分不同類型的 source code，要求將它們分別放在專屬的目錄下。譬如將 model, view, controller 分開來放。Maven 預設的 `maven-compiler-plugin` 只允許單一 source 目錄，因此無法支援這樣的設定。這時候，就可以利用 [`build-helper-maven-plugin`][build-helper-maven-plugin] 來支援多 src 目錄 (不過官方並不推薦使用這種方法)：

<!-- more -->

``` xml
<!-- multi src dir support -->
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>build-helper-maven-plugin</artifactId>
    <version>1.8</version>
    <executions>
        <execution>
            <id>add-source</id>
            <phase>generate-sources</phase>
            <goals>
              <goal>add-source</goal>
            </goals>
            <configuration>
                <sources>
                    <source>src/main/rs-app/services</source>
                    <source>src/main/rs-app/domain</source>
                    <source>src/main/rs-app/resources</source>
                </sources>
            </configuration>
        </execution>
    </executions>
</plugin>
```
### 參考資料:

* [Build Helper Maven Plugin][build-helper-maven-plugin]
* [常用Maven插件]
* [Maven compile with multiple src directories]

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

[build-helper-maven-plugin]: http://mojo.codehaus.org/build-helper-maven-plugin/
[常用Maven插件]: http://www.cnblogs.com/crazy-fox/archive/2012/02/09/2343722.html
[Maven compile with multiple src directories]: http://stackoverflow.com/questions/270445/maven-compile-with-multiple-src-directories
