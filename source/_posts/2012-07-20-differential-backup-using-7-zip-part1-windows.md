title: 'Differential backup using 7-Zip for Windows (Part 1) - 利用 7-Zip 進行差異備份（上篇）'
date: 2012-07-20 04:50:32
comments: true
categories:
  - Programming
tags:
  - 7-Zip
  - Backup
  - Batch
  - Windows
  - cmd
  - howto
---
### 簡介

本文介紹利用 Open Source 軟體 [7-Zip][1] 壓縮程式，來進行差異備份。使用 Windows/DOS 的 cmd [batch][2] 批次檔案，自動為備份檔名附加日期時間戳記。並於（[下篇][differential-backup-using-7-zip-part2-secrets-of-batch-files]）中說明使用 cmd batch 批次指令時，遇到的各種問題 (陷阱) 與解決方法。

<!-- more -->
<!-- forkme https://gist.github.com/amobiz/d0be531a7c109c785845 -->

### 前言

就像 MS Windows 作業系統是封閉系統一樣，它的備份程式，也一樣封閉，尤其是在每次作業系統改朝換代時，系統提供的備份程式就重新換上一套。為了不受限於作業系統或任何軟體的封閉格式，同時養成經常備份的習慣，一直想用 7-Zip 這個優良、壓縮率極高的 Open Source 軟體來做備份。

只是若每次備份都包含所有的檔案，至少會有以下這些缺點：

* 備份時間過長
* 備份檔案過大
* 無法分辨異動的部分

前面兩點會嚴重影響備份的意願，也增加保留備份檔案的困難。至於最後一點，如果不使用 [WinMerge][3] 這類內容比對程式，在解開備份檔案後，手動進行比對，實在是很難分辨到底有哪些檔案有異動，增加了還原工作的困難。

### 7-Zip 支援差異備份

有可能讓 7-Zip 只備份異動的部分嗎？讓 7-Zip 進行 [Incremental backup(增量備份)][4] 或 [Differential backup(差異備份)][5] 嗎？答案是肯定的：7-Zip 支援差異備份。在 [Automated differential backup using 7zip for Linux/windows][6] 這篇文章中，作者介紹了 7-zip 支援差異備份的指令用法。至於詳細的 7-Zip command line 程式 [7za][7] 的安裝與用法，請參考 [7-Zip Command-Line][8] 這篇文章。

有關於增量備份與差異備份的不同的詳細介紹，請參考前面 Wikipedia 的連結或「[增量備份和差異備份的不同！][9]」這篇文章的說明。基本上，本文所介紹的差異備份，只需要保留一份完整備份，以及最後一份基於該完整備份的差異備份檔案即可。不過，若是保留每次的差異備份，則可以隨時回溯到過去的備份。

### 功能與需求

本文要介紹的 cmd batch 內容，主要是基於以下的個人備份需求：

* 可以分類(分開)備份不同的目錄
* 可以自動備份常用的目錄
* 可以手動備份指定的目錄
* 可以自動為備份檔案名稱，加上時間戳記
* 可以指定進行完整備份或差異備份
* 進行完整備份時，若已有當天的完整備份，則改進行差異備份
* 進行差異備份時，若找不到完整備份，則改進行完整備份

### 使用方式

#### 設定

找到批次檔中 `:CONFIG` 部分，修改你個人的預設設定：

```bat
:CONFIG

  set BAK_DIR=[你要儲存備份檔的目錄，不要包含路徑最後的 \ 字元]
  set SRC_DIR=[你要備份的目錄，不要包含路徑最後的 \ 字元。用空格或逗號區隔不同目錄。如果目錄包含空白字元，請使用 "" 括住完整路目錄名稱]
```

#### 執行完整備份

在 cmd 命令列模式下，執行下列指令：

```bash
7z-bak FULL
```

可以自行指定要備份的來源目錄：

```bash
7z-bak FULL C:\games C:\downloads
```

建議使用自動排程工具，設定定期執行。譬如每週執行一次完整備份。

#### 執行差異備份

在 cmd 命令列模式下，執行下列指令：

```bash
7z-bak DIFF
```

因為預設執行差異備份，所以 DIFF 參數可以省略：

```bash
7z-bak
```

同樣也可以自行指定要備份的來源目錄：

```bash
7z-bak C:\games C:\downloads
```

建議使用自動排程工具，設定定期執行。譬如每天執行一次差異備份。

#### 執行還原備份

##### 直接使用 7-Zip 視窗介面

使用 7-Zip 視窗介面打開要還原的完整備份檔案，譬如 `doc_20120701.7z`，解壓縮到希望的目錄。然後打開要還原的差異備份檔案，注意檔名前面的日期戳記要與完整備份一致，如 `doc_20120701_diff_20120720_025643.7z`，選擇解壓縮到同一個目錄，過程中會詢問是否要取代原有的檔案，請選擇全部覆蓋 (`Yes to All`)。

##### 使用 7-Zip 命令列介面

在 cmd 命令列模式下，執行下列指令：

```bash
7za.exe x doc_20120701.7z -oc:\recovery_path\
7za.exe x doc_20120701_diff_20120720_025643.7z -aoa -y -oc:\recovery_path\
```

### 限制，與可以改進的地方

* 不支援讀取外部設定檔的功能。`BAK_DIR` 與 `SRC_DIR` 必須在批次檔中設定，不過 `SRC_DIR` 可以使用命令列參數取代。
* 不支援指定備份檔案類型，及排除檔案類型功能。
* 單一備份的來源必須在同一個目錄下，不支援將多個來源目錄壓縮到單一備份檔中。
* 未檢查實際上是否有異動檔案，即直接進行差異備份，可能導致差異備份檔案中空無一物。
* 尚未提供還原功能。

讀者若有興趣嘗試 DIY，可以根據自己的需求修正上述限制，增加備份彈性。

### 批次檔原始碼

完整的批次檔指令稿內容如下：

<!-- differential-backup-using-7-zip-windows-7z-bak.cmd -->
<!-- inno-v/5650722 -->
{% gist amobiz/d0be531a7c109c785845 %}

請自行複製上面的程式碼，儲存到 `7z-bak.cmd` 或任何你覺得適當的檔名，最好把檔案放到 `PATH` 路徑下，方便執行。

### 結論

完成了 `7z-bak.cmd` 之後，利用自動排程工具，自動定時備份，確實是相當方便。意外的驚喜是，7-Zip 進行差異備份的速度，實在是快得驚人，讀者不妨自行體驗一下。

最後，不得不承認，使用 Windows/DOS 內建的 cmd 批次檔功能來處理自動備份，實在是個蠢主意。為什麼這麼說呢？在 {% post_link differential-backup-using-7-zip-part2-secrets-of-batch-files 下一篇 %}，將說明撰寫這個批次檔過程中所遇到的問題與陷阱，想要了解技術細節的朋友，請不要錯過。

歡迎大家的回饋與心得分享。

### 參考資料：

* [Automated differential backup using 7zip for linux/windows][6]
* [Incremental backup(增量備份)][4]
* [Differential backup(差異備份)][5]
* [增量備份和差異備份的不同！][9]
* [7-Zip Command-Line][8]

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [Differential backup using 7-Zip for Windows (Part 1) - 利用 7-Zip 進行差異備份（上篇）][differential-backup-using-7-zip-part1-windows]
* [Differential backup using 7-Zip for Windows (Part 2) - Secrets of batch files - 利用 7-Zip 進行差異備份（下篇） - 批次檔案的秘密][differential-backup-using-7-zip-part2-secrets-of-batch-files]
{% endpostrefs %}

<!-- external references -->

[1]: http://en.wikipedia.org/wiki/7-Zip "7-Zip"
[2]: http://en.wikipedia.org/wiki/Batch_file "batch"
[3]: http://en.wikipedia.org/wiki/WinMerge "WinMerge"
[4]: http://en.wikipedia.org/wiki/Incremental_backup "Incremental backup(增量備份)"
[5]: http://en.wikipedia.org/wiki/Differential_backup) "Differential backup(差異備份)"
[6]: http://a32.me/2010/08/7zip-differential-backup-linux-windows/ "Automated differential backup using 7zip for Linux/windows"
[7]: http://www.7-zip.org/download.html "7za"
[8]: http://www.dotnetperls.com/7-zip-examples "7-Zip Command-Line"
[9]: http://tw.myblog.yahoo.com/e-note/article?mid=37&next=32&l=f&fid=6 "增量備份和差異備份的不同！"
