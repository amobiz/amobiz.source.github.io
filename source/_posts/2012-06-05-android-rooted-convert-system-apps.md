title: 'Android (rooted) - Convert system apps to user apps, or reverse - 把系統應用程式轉成使用者應用程式，或相反'
date: 2012-06-05 03:57:00
comments: true
categories:
  - Hack
tags:
  - Android
  - DIY
  - rooted
  - howto
---
### 簡介

本文適合手機已經 rooted 的使用者。介紹如何手動將系統應用程式轉換成使用者應用程式，或者相反地，將使用者應用程式轉換成系統應用程式。

<!-- more -->

{% cheatsheet 警告 class:warning %}
警告：root 手機或自行修改手機具有一定的風險，如失去保固、損壞手機等。請讀者自行斟酌、謹慎處理。
{% endcheatsheet %}

### 步驟

* (可選) 先使用 [Titanium Backup][1] 或其它備份工具，進行系統程式及使用者程式的備份。
* 使用 [Root Browser Lite][2] 或 [Solid Explorer][3] 這類支援 root 的檔案管理工具，
  * 若是要由系統轉換為使用者應用程式，進入 `/system/app` 目錄。
  * 若是要由使用者轉換為系統應用程式，進入 `/data/app` 目錄 (或是 `/sd-ext/app` 目錄，請參考 [這篇文章][htc-magic-custom-rom-ginger-yoshi-install#規劃_SD_卡:_sd-ext_partition])。如果沒有找到，可能該程式是受保護程式，則到 `/data/app-private` 或 `/sd-ext/app-private` 找找看。
* 找到要轉換的程式，譬如地圖程式： `com.google.android.apps.maps.apk` (有時候檔名最後面會有 -1, -2 之類的後綴，像這樣：`com.google.android.apps.maps-2.apk`，其實都是同一支程式檔案)，將它搬移到：
  * 要轉換為使用者應用程式，把它搬到 `/data/app` 或 `/sd-ext/app` 目錄。
  * 要轉換為系統應用程式，把它搬到 `/system/app` 目錄。
  * <span style="color:red">(2014/09/22) 補充：系統應用程式檔名不可含有空白，如有空白字元，在搬到 `/system/app` 目錄之前，請先重新命名。在 `/system/app` 目錄下無法重新命名。)</span>
* 如果該程式是受保護程式，則還要到 `/data/app` 或 `/sd-ext/app` 目錄，尋找相同檔名，但附檔名為 .zip 的檔案，將它刪除。
* (可選) 如果還有其它程式需要轉換，重複上面三個步驟。或者如果使用的檔案管理工具支援多選的話，也可以一次進行搬移。
* 最後建議重新啟動手機。

### 詳細說明

常常玩自訂 ROM 的玩家，一定常常有這樣的困擾：ROM 裡面放了一些用不到的程式，放在那邊感覺非常礙眼又佔用手機的寶貴空間，如果那支程式還會自動啟動的話，更是會佔用 RAM，並拖慢系統的啟動時間。最好能將它從 ROM 移除，或是至少轉換成一般的使用者應用程式，就可以事後再決定是不是要保留。

另一方面，有些程式，真的是非常實用，希望即使手機重置，恢復系統設定時，也能立即使用；又或者，可能 [啟動了 APP2SD 功能][htc-magic-custom-rom-ginger-yoshi-install#刷新的_ROM]，但程式可能需要在開機的時候快速啟動，如 widget 等，如果這些程式能夠放在 ROM 裡面，系統啟動的時候，就可以更快、更穩。

其實，要自由轉換系統程式或使用者程式，一點都不難，只要使用任意支援 root 的檔案管理工具，都可以輕鬆辦到。

做法實在太簡單了，照著上面的步驟操作即可。

在進行轉換的過程中，有兩點需要特別注意：

* 有些系統核心程式，在系統啟動過程扮演重要的功能，這些程式最好不要隨便移動。至於哪些程式可轉換，哪些不行，可能要請大家根據經驗與直覺，一同實驗、分享了。
* 若要將使用者程式轉換為系統程式，必須注意系統 ROM 的剩餘空間是否足夠。若是不夠的話，可能就必須做出取捨，將部分系統程式先轉換為使用者程式。

歡迎大家的回饋與心得分享。

### 相關文章

<!-- cross references -->

{% postrefs %}
* [HTC Magic Custom ROM: Ginger Yoshi (rooted) step by step - 正確安裝步驟][htc-magic-custom-rom-ginger-yoshi-install]
{% endpostrefs %}

<!-- external references -->

[1]: https://play.google.com/store/apps/details?id=com.keramidas.TitaniumBackup "Titanium Backup"
[2]: https://play.google.com/store/apps/details?id=com.jrummy.root.browserfree "Root Browser Lite"
[3]: https://play.google.com/store/apps/details?id=pl.solidexplorer2 "Solid Explorer"
