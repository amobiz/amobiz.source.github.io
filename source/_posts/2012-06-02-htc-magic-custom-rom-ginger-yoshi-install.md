title: 'HTC Magic Custom ROM: Ginger Yoshi (rooted) step by step - 正確安裝步驟'
date: 2012-06-02 01:51:08
comments: true
categories: 
tags:
  - Android
  - APP2SD
  - Custom ROM
  - DIY
  - Ginger yoshi
  - Howto
  - SWAP
---

### 簡介

本文詳細介紹 HTC Magic 手機，刷 Ginger Yoshi 版本自訂 ROM 的步驟，特別說明 swap 的設定注意事項。正確設定 swap 才能避免浪費空間，並大幅提升手機效能。

<!-- more -->

{% cheatsheet 警告 class:warning %}
root 手機或自行修改手機具有一定的風險，如失去保固、損壞手機等。請讀者自行斟酌、謹慎處理。
{% endcheatsheet %}

{% cheatsheet %}
在開始之前，先確認 SD 卡上該保留的資料都備份了，接下來的步驟會清除 SD 卡上所有的資料。
{% endcheatsheet %}

### 下載最新的 ROM

* [ginger yoshi 1.5.zip]
* [32a kernel.zip]

或者到 [xda developers] 尋找最新的 ROM。

{% cheatsheet %}
要注意 SPL 是 OR(Old Radio) 還是 NR(New Radio)。參考 [這篇](#magic-android-15-to-21) 或 [這篇](#1178665) 文章。
{% endcheatsheet %}

### 進入 recovery mode

* 關掉手機電源。
* 按住 `Home` 鍵，按下 `Power` 鍵，放開 `Power` 鍵。

### 規劃 SD 卡: sd-ext partition

* 選擇 `Partition sdcard`
  * 選擇 `- Partition SD`
    * `Swap-size = 0 MB`
    * `Ext2-size = 512 MB`
  * 選擇 `- SD:ext2 to ext3`
  * 選擇 `- SD:ext3 to ext4`
  * 按 `Back` 鍵，回到主選單。

{% cheatsheet %}

<dl>
<dt>Swap-size</dt>
<dd>Ginger Yoshi 不使用 swap partition，所以設定為 0 MB。
或者參考後面「[設定 swap](#設定_swap)」部分，可以自行啟用 swap partition。</dd>
<dt>Ext2-size</dt>
<dd>這是安裝使用者程式的位置，請依需求自行斟酌，預設是 512 MB，應該夠用。</dd>
</dl>

{% endcheatsheet %}

### Wipe sd-ext partition

* 選擇 `Wipe`
  * 選擇 `- Wipe data/factory reset`
  * 選擇 `- Wipe Davilk-cache`
  * 選擇 `- Wipe battery stats` (刪除 `/data/system/batterystats.bin`)
  * 選擇 `- Wipe rotate settings`
  * 按 `Back` 鍵，回到主選單。

{% cheatsheet %}

因為剛剛做完 partition，所以可以省去 `- Wipe SD:ext partition` 這個步驟。
如果只是清除重裝，並沒有重新 partition SD 卡，最好做一下這個步驟。

{% endcheatsheet %}

### 把 ROM 複製到 SD 卡

* 確認手機跟電腦已使用 USB 線連接。
* 選擇 `USB-MS toggle` (切換到USB磁碟機模式，電腦應該會自動出現代表 SD 卡的磁碟機)。
* 把下面兩個檔案複製到 SD 卡根目錄:
  * `ginger yoshi 1.5.zip`
  * `32a kernel.zip`
* 在電腦(檔案總管或工具列)選擇 `退出磁碟裝置`。
* 按下 `Home` 鍵，回到 recovery 模式。

### 刷新的 ROM

* 選擇 `Flash zip from sdcard`
  * 選擇 `ginger yoshi 1.5.zip`
  * 按下 `Home` 鍵確認，開始刷 ROM。
    注意以下兩個選項，其他選項請依需求自行斟酌：
    `Install to EXT Partition:` yes
    ...
    `Install a 60mb swap on EXT:` yes
    ...
  * 完成之後，自動回到主選單。

{% cheatsheet %}

<dl>
<dt>install to EXT Partition</dt>
<dd>讓應用程式安裝到 SD 卡的 sd-ext partition。
由於 Magic 的內建安裝程式記憶體只有 310M，實在不夠用，所以建議一定要打開 APP2SD 功能，讓應用程式安裝在 SD 卡中。</dd>
<dt>Install a 60mb swap on EXT</dt>
<dd>在 sd-ext 建立 `swapfile.swp` 檔案供虛擬記憶體使用。
對於內建 RAM 少得可憐的 Magic，使用虛擬記憶體對效能大有幫助。
當然前提是記憶卡不能太慢，至少要 class 6 以上。

建議先建立 `swapfile.swp`，日後真的覺得不需要時，可將 `swapfile.swp` 刪除，
就會自動停止使用 swap(請看最後面的詳細說明)。

如果覺得不需要 swap，可以選擇 no，以後再使用 swapper 2 這類程式，
自行在 SD 卡上的 fat32 partition 上配置 swap file。
這樣做比較有彈性，但是由於會鎖住 SD 卡，要掛載 SD 磁碟到電腦時，不是很方便。另外，對相容性及效能是否有影響，還是個未知數。</dd>
</dl>

{% endcheatsheet %}

{% cheatsheet %}

注意：從這裡完成之後，就不要再自作聰明，再執行 `Wipe` 了，尤其是 `Wipe SD:ext partition`。否則會刪除掉 `swapfile.swp`，導致無法使用 swap。

{% endcheatsheet %}

* 選擇 `Flash zip from sdcard`
  * 選擇 `32a kernel.zip`
  * 按下 `Home` 鍵確認，開始刷 ROM。
  * 完成之後，自動回到主選單。

### 關機／啟動！

* 選擇 Power off，按下 Home 鍵確認。
* 按下 Power 鍵，啟動新的 ROM。

{% cheatsheet %}

第一次開機會很久，尤其如果沒有重新規劃 SD 卡，也沒有 wipe 舊的 sd-ext partition 的話。這時候系統應該是正在將應用程式內部的程式碼(apk 檔案內部的 *.dex)，複製到 Davilk-cache，所以 SD 卡越慢， sd-ext 檔案越多的話，就要等越久。

{% endcheatsheet %}

### 設定 swap

這部分請參考「[設定Android手機的SWAP]」這篇文章。基本上，可以使用 [swapper 2] 這類程式，在 FAT 32 上面建立 swap file，或是掛載 swap partition。另外，也可以透過 userinit.sh 掛載 swap partition。我還沒試過，下次重裝的時候，再來試試看。

### 詳細說明

自從 1.3 版開始使用 Ginger Yoshi，一路更新到最新的 1.5 版，但一直沒花心思弄清楚正確的安裝步驟，歷經多次安裝及版本升級，每次效能似乎都不一樣，時好時壞。直覺告訴我這應該是 swap 設定的問題。

有兩個地方牽涉到 swap：

* 為了使用 APP2SD 功能，在 Ginger Yoshi 安裝的過程中，首先需要規劃 sd 卡，設定 ext partition，而在這個過程中，同時也包含了 swap partition 的容量設定。
* 刷 ROM 的時候，會問你要不要安裝一個 60 mb 的 `swapfile.swp`。

就是這兩個關鍵，我過去一直沒搞清楚。

為了徹底瞭解 swap 應該如何設定，首先要確認 swap partition, swap file 是否有作用。

要檢查 swap，可以使用 terminal 程式執行 `free` 指令，檢查記憶體容量：執行 `terminal` 進入 shell，輸入 `free` 指令，若有顯示 swap 資訊，且顯示的容量不是 `0 0 0 0` 的話，就表示 swap 能夠運作。

確認的詳細過程就不說了，基本上就是用最笨的方法測試了 4 種排列組合，最後確認：

| 類型            |說明   |
|----------------|:------|
| swap partition | 無作用 |
| swapfile.swp   | 有作用 |

另一個過去一直讓我感到疑惑，覺得效能時好時壞的原因，其實是像我這種搞不清楚狀況的新手，自己手賤造成的：

在刷 Ginger Yoshi 的時候，有一個新手很容易做錯的地方，就是在刷完 ROM，建立 `swapfile.swp` 檔案後，絕對不可以再 wipe sd partition，因為這樣一來，`swapfile.swp` 就被清除掉了，沒有 swap 虛擬記憶體的加持，切換程式的時候，都要釋放記憶體，重新載入程式，效能當然就不好了。很多人常說沒有 wipe 乾淨，會導致啟動不正常，新手聽了猛點頭，然後拼命 wipe...哈!

### 結論

開機完成，果然效能大幅提升，在幾個平常切換時需要重新載入的程式之間來回切換，完全不需重新載入，幾乎都可以瞬間顯示。老手機經過適當地設定、調整，其實還是很好用的。

歡迎大家的回饋與心得分享。

### 參考資料

* [Ginger yoshi 1.5 (android 2.3.5) for 32b and 32a old and new radio ^_^][xda developers]
* <span id="1178665"></span>[Ginger yoshi (Android 2.3.5) install guide for T-Mobile G1 (32B version)][1178665]
* <span id="magic-android-15-to-21"></span>[替 Magic 換上客製化韌體 (Android 1.5 to 2.1)][magic-android-15-to-21]
* [HTC Magic 與電腦正確連線]
* [更換 Android 手機的開機畫面 (Boot Splash Image)][Boot Splash Image]
* [[Android][分享][教學][轉載]開機動畫][Android Boot Animation]
* [Android bootanimation 制作過程][Android bootanimation]
* [設定Android手機的SWAP]
* [A688/A60 手機 Rom 備份及還原,使用 FastBoot 刷機]
* [Swap and Compcache]

<!-- cross references -->

<!-- external references -->

[ginger yoshi 1.5.zip]: http://www.mediafire.com/download.php?o80do0va1rbo95v
[32a kernel.zip]: http://www.mediafire.com/download.php?3rz1u9thn21nywq
[xda developers]: http://forum.xda-developers.com/showthread.php?t=932118
[magic-android-15-to-21]: http://abintech.twidv.com/2010/06/magic-android-15-to-21.html
[1178665]: http://forum.xda-developers.com/showthread.php?t=1178665
[設定Android手機的SWAP]: http://roach0426.pixnet.net/blog/post/29995988-%E8%A8%AD%E5%AE%9Aandroid%E6%89%8B%E6%A9%9F%E7%9A%84swap
[swapper 2]: https://play.google.com/store/apps/details?id=lv.n3o.swapper2
[HTC Magic 與電腦正確連線]: http://abintech.twidv.com/2010/03/htc-magic_11.html
[Boot Splash Image]: http://abintech.twidv.com/2011/05/android-boot-splash-image.html "更換 Android 手機的開機畫面 (Boot Splash Image)"
[Android Boot Animation]: http://blog.wtifun.com/android%E5%88%86%E4%BA%AB%E6%95%99%E5%AD%B8%E8%BD%89%E8%BC%89%E9%96%8B%E6%A9%9F%E5%8B%95%E7%95%AB "[Android][分享][教學][轉載]開機動畫"
[Android bootanimation]: http://fecbob.pixnet.net/blog/post/34682141-android-bootanimation-%E5%88%B6%E4%BD%9C%E9%81%8E%E7%A8%8B
[A688/A60 手機 Rom 備份及還原,使用 FastBoot 刷機]: http://snowwolf725.blogspot.com/2010/04/a688-rom.html
[Swap and Compcache]: http://wiki.cyanogenmod.com/wiki/Swap_and_Compcache
