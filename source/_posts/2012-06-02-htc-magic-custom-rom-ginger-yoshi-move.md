title: 'HTC Magic Custom Rom: Ginger Yoshi (rooted) - Move Davlik-cache back to ROM step by step - 把 Davlik-cache 搬回 ROM'
date: 2012-06-02 04:45:44
comments: true
categories:
  - Hack
tags:
  - Android
  - APP2SD
  - Ginger yoshi
  - custom ROM
  - DIY
  - howto
---
### 簡介

本文適用於刷 Ginger Yoshi ROM 時，啟用了 APP2SD 功能，也就是規劃了 ext partition，並指定將使用者應用程式安裝到 ext partition 的使用者。本文介紹如何將 `davlik-cache`、 `app-private` 搬回到 ROM，以充分利用手機的 ROM 空間，提升手機效能。

<!-- more -->

{% cheatsheet 警告 class:warning %}
root 手機或自行修改手機具有一定的風險，如失去保固、損壞手機等。請讀者自行斟酌、謹慎處理。
{% endcheatsheet %}

### 步驟

* 使用 [Root Browser Lite][1] 這類支援 root 的檔案管理程式，進入 `/data` 目錄。
* 打算搬回到 ROM 的目錄，分別為它們建立一個空檔案，如 `.noapp2sd`、 `.noprivate2sd`、 `.nodavlik2sd`。
* 刪除打算搬回到 ROM 的目錄的 symbolic link 檔案，如 `app`、 `app-private`、 `davlik-cache`。
* 進入 `/sd-ext` 目錄，把對應的 `app`、 `app-private`、 `davlik-cache` 目錄，搬移到 `/data` 目錄。
* 重新開機。

### Why

已經 root 的 Android 手機，最大的好處，就是使用者可以取得最大的控制權。其中一個好處，就是可以使用 [Titanium Backup][2] 這類軟體來備份應用程式及資料，重刷 ROM 之後，可以很快還原安裝的應用程式及資料。

如果使用 Titanium Backup，一定會注意到它的主畫面下方，顯示的系統資訊：

|    |   |   |
|----|----|----|
| 系統 ROM:      | 94.3 MB | (1.02 MB 可用)|
| 內部記憶體:     | 310 MB  | (298 MB 可用) |
| SD 卡:        | 1.46 GB  | (321 MB 可用) |
| SD 卡 (a2sd): | 479MB    | (14 MB 可用)  |

{% cheatsheet %}
<dl><dt>系統 ROM</dt><dd>系統應用程式的容身之處。Magic 總共只有 94.3 MB 可用，夠可憐的！</dd>
<dt>內部記憶體</dt><dd>使用者應用程式及資料、系統 Davlik-cache 的容身之處。Magic 總共只有 310 MB 可用。所以我們才需要開啟 APP2SD 功能，把程式裝到 SD 卡上！</dd>
<dt>SD 卡</dt><dd>FAT32 磁碟區，掛載到 PC 時看到的部分。Titanium Backup 會把備份檔案放到這邊。</dd>
<dt>SD 卡 (a2sd)</dt><dd>刷 Ginger Yoshi 之前規劃的 ext partition，開啟 APP2SD 功能後，安裝的應用程式，系統 Davlik-cache 都會放在這邊。</dd></dl>
{% endcheatsheet %}

注意到內部記憶體的部分，雖然只有 310 MB，但是可用竟然高達 298MB！而 a2sd 部分，竟然只剩下 14 MB！

這是因為 APP2SD 的設定的關係，Ginger Yoshi 的做法，是把下列三個目錄，利用 symbolic link ，從 ROM 搬到 SD 卡：

| 原始位置 | 對應到 | 說明 |
|---------|-------|-----|
| /data/app | /sd-ext/app | 這是一般使用者應用程式的容身之處。|
| /data/app-private | /sd-ext/app-private | 這是存放受保護的應用程式，沒有 root 的手機，這些程式是無法備份的。|
| /data/davlik-cache | /sd-ext/davlik-cache | 這是存放系統及使用者應用程式執行碼(.dex)快取的地方。|

理論上當然可以利用相同的方式，把大部分的目錄都搬到 SD 卡，譬如 `/data/data`，這是存放應用程式資料庫的地方，每個應用程式都有專屬的子目錄。不過應該是考量到效能的關係，應用程式執行過程中，可能不斷存取資料庫，若放在 SD 卡上，多少會影響效能。所以 Ginger Yoshi 選擇不把 `data` 搬到 SD 卡上。

但是我比較不能認同的是，Ginger Yoshi 把應用程式及快取全部都放到 SD 卡上，卻放著白花花的 ROM 不用，只用來存放少少的 `data`，這樣真的很浪費。另外，由於經常嘗試各種應用程式，我的手機大約安裝了 170 個使用者應用程式，當初規劃的 512 MB 的 ext partition，扣除 60 MB 的 `swapfile.swp`，一下子就用完了。所以我決定要把快取和部分程式搬回 ROM。

### 詳細說明

使用 [Root Browser Lite][1]，刪除 `/data/davlik-cache` 這個 link 檔案，再把 `davlik-cache` 目錄，由 `/sd-ext/davlik-cache` 搬到 `/data/davlik-cache`。(不需要修改權限，我後來發現 `/system/bin/fix_permissions` 這個 script 會在開機時自動修正。)重新啟動手機，經過非常久的的時間，才開機完成，心裡就知道不妙了。果然，進入 `/data` 一看，`davlik-cache` 又變回成 link 了，到 `/sd-ext/data` 目錄，`davlik-cache` 目錄又回來了。

我知道這一定是 script 的安全措施在作怪。解開 `ginger yoshi 1.5.zip`，搜尋 `davlik-cache` 關鍵字，找到 `/system/etc/init.d/10apps2sd`，打開來看，其中一段內容如下：

```bash
# loop directories to be moved to SD:
for ii in dalvik app private;
do
  dir=$ii
  if [ "$ii" == "dalvik" ];
  then
      dir=dalvik-cache
  elif [ "$ii" == "private" ];
  then
      dir=app-private
  fi
  src=/data/$dir
  trg=$SD_EXT_DIRECTORY/$dir

  # /data/.noapp2sd (or /data/.nodalvik2sd) disable the appropraite part:
  if [ $enable -eq 0 -o -e /data/.no${ii}2sd ];
  then
    # (略)
  else
    # (略)
  fi
done
```

果然，是這個 script 在作怪。

還好作者留了後路，讓使用者可以輕輕鬆鬆調整設定，而且不需要手動修改 script。從上面程式碼可以看出，只要在 `/data` 目錄下，存在有 `.no[XXX]2sd` 檔案，就不會把該目錄搬到 SD 卡，這裡的 [XXX] 可以是 `app`、`private`、`dalvik` 三個字串。所以只要建立 `/data/.nodalvik2sd`，空檔案即可，再重複上面手動搬移的動作，就可以順利把 `davlik-cache` 搬回到 ROM 了。

接下來要搬的是 `app-private` 目錄，因為作者設定保護的程式不多，所以很適合把它們搬回到 ROM。只要建立 `/data/.noprivate2sd` 檔案，刪除 `/data/app-private` 這個 link 檔案，再手動把 `/sd-ext/app-private` 目錄搬到 `/data` 下，就搞定了。

### 結論

經過上述兩個步驟，內部記憶體還剩餘 109 MB，而 a2sd 則變成 174 MB，已經相當滿意了。而且使用上，因為 `davlik-cache` 放在 ROM 的關係，程式的啟動速度更快了。

### 失敗筆記

因為 ROM 的速度理論上要比 SD 卡快很多，所以若是能將常用的程式、widget，也放到 ROM，豈不是更好？所以腦筋又動到 `/sd-ext/app` 上，想手動把程式搬到 `/data/app-private`，放到 ROM 裡面。

不過，這次就沒那麼幸運了。因為放在 `/data/app-private` 的應用程式，除了原本的 .apk 檔案放在這裡，還會有一個 .zip 檔案放在 `/sd-ext/app` 目錄下，裡面放的是 `res` 目錄 `.arsc` 檔案以及 `AndroidManifest.xml` 檔案。看來這個 .zip 檔案放的都是應用程式的資源檔案，應該是讓沒有權限的程式讀取用的。雖然手動將 .apk 多餘的檔案抽掉，改成 .zip 檔案放在 `app` 目錄下，再把原本的 apk 檔案放到 `app-private` 目錄下，修正檔案權限，重新開機，雖然程式確實可以執行，但是 icon 無法正常顯示、應用程式名稱都變成 package 名稱，而且有的程式啟動時，畫面會有破碎現象，程式容易意外 FC 等，可以說問題重重。一時還沒辦法理出頭緒，先記錄下來。

歡迎大家的回饋與心得分享。

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [HTC Magic Custom ROM: Ginger Yoshi (rooted) step by step - 正確安裝步驟][htc-magic-custom-rom-ginger-yoshi-install]
{% endpostrefs %}

### 參考資料

* [[分享文] 使用 A2SD 時，資料存放的位置解說][4]
* [【教程】超詳細的App to SD 教程與大家分享][5]
* [Haykuro Apps to SD][6]

<!-- external references -->

[1]: https://play.google.com/store/apps/details?id=com.jrummy.root.browserfree "Root Browser Lite"
[2]: https://play.google.com/store/apps/details?id=com.keramidas.TitaniumBackup "Titanium Backup"
[4]: http://www.mobile01.com/topicdetail.php?f=423&t=1715008 "[分享文] 使用 A2SD 時，資料存放的位置解說"
[5]: http://sjbbs.zol.com.cn/1/33672_116.html "【教程】超詳細的App to SD 教程與大家分享"
[6]: http://android-dls.com/wiki/index.php?title=Haykuro_Apps_to_SD "Haykuro Apps to SD"
