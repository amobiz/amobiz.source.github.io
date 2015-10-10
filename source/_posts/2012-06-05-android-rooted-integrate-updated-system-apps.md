title: 'Android (rooted) - Integrate updated system apps to ROM - 把更新的系統應用程式整合到 ROM'
date: 2012-06-05 02:45:00
comments: true
categories: 
tags:
  - Android
  - DIY
  - Howto
  - Rooted
---
### 簡介

本文適合手機已經 rooted 的使用者。介紹如何手動將更新的系統應用程式，放到 ROM，避免舊檔案佔用手機寶貴的儲存空間。

<!-- more -->

{% cheatsheet 警告 class:warning %}
root 手機或自行修改手機具有一定的風險，如失去保固、損壞手機等。請讀者自行斟酌、謹慎處理。
{% endcheatsheet %}

### 步驟

* (可選) 先使用 [Titanium Backup][1] 或其它備份工具，進行系統程式及使用者程式的備份。
* 使用 [Root Browser Lite][2] 或 [Solid Explorer][3] 這類支援 root 的檔案管理工具，進入 `/system/app` 目錄。
* 找到已經更新的舊程式，譬如地圖程式： `com.google.android.apps.maps.apk` (有時候檔名最後面會有 -1, -2 之類的後綴，像這樣：`com.google.android.apps.maps-2.apk`，其實都是同一支程式檔案)，將它刪除，或者搬移到 SD 卡備份。
* 切換到 `/data/app` 目錄 (或是 `/sd-ext/app` 目錄，如果是 Ginger Yoshi 並啟用 APP2SD 的話。啟動 APP2SD 的方法，請參考 [HTC Magic Custom ROM: Ginger Yoshi (rooted) step by step - 正確安裝步驟][htc-magic-custom-rom-ginger-yoshi-install#規劃_SD_卡:_sd-ext_partition] 這篇文章)，將更新的程式檔案，搬移到 `/system/app` 目錄。
* (可選) 如果還有其它更新程式，重複上面三個步驟。或者如果使用的檔案管理工具支援多選的話，也可以一次進行搬移。
* 最後建議重新啟動手機。

### 詳細說明

[Titanium Backup][1] 有「將系統應用程式更新整合至 rom」這個功能，但這是「專業版」才能使用的功能。其實，這個功能一點都不難，只要使用任意支援 root 的檔案管理工具，都可以輕鬆辦到。

做法實在太簡單了，照著上面的步驟操作即可。唯一需要注意的是，系統 ROM 的剩餘空間是否足夠。若是不夠的話，可以參考這篇文章：[Android (rooted) - Convert system apps to user apps, or reverse - 把系統應用程式轉成使用者應用程式，或相反][android-rooted-convert-system-apps]。另外，若使用的檔案管理工具支援直接覆蓋，而且檔案名稱確定相同的話，也可以省略第三步驟，直接進行搬移。

歡迎大家的回饋與心得分享。

### 相關文章

* [HTC Magic Custom ROM: Ginger Yoshi (rooted) step by step - 正確安裝步驟][htc-magic-custom-rom-ginger-yoshi-install]
* [Android (rooted) - Convert system apps to user apps, or reverse - 把系統應用程式轉成使用者應用程式，或相反][android-rooted-convert-system-apps]

<!-- cross references -->

<!-- post_references htc-magic-custom-rom-ginger-yoshi-install -->
<!-- post_references htc-magic-custom-rom-ginger-yoshi-install#規劃_SD_卡:_sd-ext_partition -->
<!-- post_references android-rooted-convert-system-apps -->

<!-- external references -->

[1]: https://play.google.com/store/apps/details?id=com.keramidas.TitaniumBackup "Titanium Backup"
[2]: https://play.google.com/store/apps/details?id=com.jrummy.root.browserfree "Root Browser Lite" 
[3]: https://play.google.com/store/apps/details?id=pl.solidexplorer2 "Solid Explorer"
