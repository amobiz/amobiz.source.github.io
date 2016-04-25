title: '將 SVN Local Repository 轉換為 Git Local Repository (Windows)'
date: 2014-09-07 21:38:15
comments: true
categories:
  - Programming
tags:
  - git
  - svn
  - howto
---
{% credit credit:"Lucas Theis" link:"https://www.flickr.com/photos/lucastheis/" desc:"意象說明<br><br>轉換 < 過渡 < 大橋" %}
![](https://s3.amazonaws.com/ooomf-com-files/Vo7YbYQQ8iyOo4J9bOoj_ggb24.jpg)
{% endcredit %}

如果有舊專案使用 [Subversion] 管理程式碼，而且不是儲存在 svn server 上，而是使用 [TortoiseSVN] 的 create repository here 指令所建立的 repository。或者是 server 已不復存在，只剩下 repository 目錄的備份，那麼可以試著使用本文介紹的方式，轉換為 git 格式。

<!-- more -->

首先，根據 [The Will Will Web | 介紹好用工具：SubGit ( 輕鬆將 SVN 專案移轉到 Git 的工具 )][Useful-tools-SubGit] 這一篇文章的介紹，可以將 svn server 的 repository 轉為 local git bare repository。

再來，根據 StackOverflow 的 [Converting a local svn repo dump to git][Converting a local svn] 這一個回答，似乎沒有辦法直接讀取 local svn repository。所以，還是要先安裝 svn server 才行。

由於早先使用 TortoiseSVN 管理專案，所以本文決定還是以 TortoiseSVN 來介紹如何進行轉換。

安裝好 [TortoiseSVN][TortoiseSVN Download] 和 [subgit][subgit download]，設定好 subgit\bin 的 `PATH` 路徑後，就可以開始進行轉換。

以下假設 local repository 放在 `C:\svn` 目錄下，不需要是當初 repository 實際運作的目錄。另外，git 專案想放在 `D:\workspace` 目錄下。

1.在 cmd 模式下，先切換到該目錄下 (`cd/d D:\workspace`)。

2.在檔案總管裡，在 `C:\svn` 目錄下點右鍵，點選 TortoiseSVN / Repo-browser，這會列出 local repository 中的所有專案。假設現在要轉換 `editor` 專案。進入該專案，看一下所有 checkin 的 author 名稱，編輯 `D:\workspace\authors.txt`，設定好 svn 的作者名稱要如何對應 git 的作者名稱及 email，譬如：

```
svn-user1 = git-user1 <git-user1@gmail.com>
svn-user2 = git-user2 <git-user2@gmail.com>
```

3.回到 cmd，使用這個指令：

```
subgit import --non-interactive --authors-file authors.txt --svn-url file:///C:\svn\editor editor.git
```

就可以建立 D:\workspace\editor.git 目錄，裡面就是轉換成功的 git bare repository。
注意這裡的 `file:///C:\svn\editor`，其中 `file:///C:\svn\` 是 local repository 所在目錄，而 `editor` 是專案名稱。`editor.git` 則是要匯出的 git bare repository 目錄名稱，在這裡是匯出到 `D:\workspace\editor.git`。

這裡需要注意的是，即使專案名稱指定錯誤，subgit 仍然會顯示轉換成功。可參考第 5 步驟確認。

4.成功匯出之後，就可以將 git 專案 push 到 server：

```
git push --mirror https://remote.github.com/editor.git
```

5.或者要直接 clone 出來，建立 working repository:

```
git clone -l editor.git
```

這樣就會建立 `D:\workspace\editor` 專案目錄。
如果第 3 步驟發生錯誤，這裡的 clone 指令會提示：

```
warning: You appear to have cloned an empty repository.
```

6.如果還有其他專案需要轉換，重複上面 5 個步驟即可。

### 參考資料:

* [The Will Will Web | 介紹好用工具：SubGit ( 輕鬆將 SVN 專案移轉到 Git 的工具 )][Useful-tools-SubGit]
* [Converting a local svn repo dump to git][Converting a local svn]

<!-- cross references -->


<!-- external references -->

[Subversion]: https://subversion.apache.org/
[TortoiseSVN]: http://tortoisesvn.net/
[TortoiseSVN Download]: http://sourceforge.net/projects/tortoisesvn
[subgit download]: http://subgit.com/download/index.html
[Useful-tools-SubGit]: http://blog.miniasp.com/post/2014/09/06/Useful-tools-SubGit-svn-to-git-migration.aspx "The Will Will Web | 介紹好用工具：SubGit ( 輕鬆將 SVN 專案移轉到 Git 的工具 )"
[Converting a local svn]: http://stackoverflow.com/a/16005321 "Converting a local svn repo dump to git"
