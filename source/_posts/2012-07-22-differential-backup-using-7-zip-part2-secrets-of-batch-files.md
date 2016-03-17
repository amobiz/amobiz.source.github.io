title: 'Differential backup using 7-Zip for Windows (Part 2) - Secrets of batch files - 利用 7-Zip 進行差異備份（下篇） - 批次檔案的秘密'
date: 2012-07-22 04:55:53
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
  - pitfalls
---
### 簡介

在上一篇文章「[Differential backup using 7-Zip for Windows (Part 1) - 利用 7-Zip 進行差異備份（上篇）][differential-backup-using-7-zip-part1-windows]」中，介紹了如何利用 Open Source 軟體 [7-Zip][2] 壓縮程式，來進行差異備份。並使用 Windows/DOS 的 cmd [batch][3] 批次檔案，自動為備份檔名附加日期時間戳記。本文將繼續說明在撰寫 cmd batch 批次指令時，遇到的各種問題 (陷阱) 與解決方法。

<!-- more -->
<!-- forkme https://gist.github.com/amobiz/d0be531a7c109c785845 -->

### 架構

首先，以下是我慣用的批次檔檔案架構：

``` bat
@echo off
  goto CONFIG

  rem 批次檔使用與注意事項說明

:SYNTAX
  echo Syntax: %~n0 [options] arguments
  goto END

:CONFIG
  set XXX=YYY
  gogo START

:SUBROUTINES
  goto :eof

:START

  rem do something...
  call :SUBROUTINES parameters

:END
```

簡單說明一下：

* 一開始就跳到 `:CONFIG` 標籤區塊。在這裡進行偏好參數的設定。
* 然後跳到 `:START` 標籤區塊，執行主程序。
* 主程序在需要的時候，利用 `call :LABEL` 的方式，呼叫副程序。
* `:END` 標籤通常是批次檔的結尾，有時候會在這個區塊設定批次檔的回傳值 (`ERRORLEVEL`)。
* `:START` 到 `:END` 之間，會盡量保持簡潔，凸顯批次檔的主要流程。

{% cheatsheet %}
__講古時間__

早期的 DOS 批次檔是沒有 subroutine(副程序) 功能的，所以只能用 `goto` 跳來跳去；或是利用 `call` 呼叫外部的批次檔；或是利用傳遞額外參數的技巧，遞迴呼叫自己。使用上相當不方便。而現在的呼叫副程序功能，其實是系統會動態產生一個新的批次檔，裡面包含原批次檔在該標籤之後的內容。副程序必須要執行到檔案結束，或執行 `exit` 指令，才能回到主程序。或者，可以在批次檔案結束的地方，放一個如上面 :END 標籤，供副程序直接跳到檔案結尾。不過，還有一個更好的方法，利用 `goto :eof` 的方式，跳到檔案結束的地方，這裡的 `:eof` 是內建的標籤。我傾向於使用 `goto :eof` 的方式，以凸顯此標籤區塊是一個副程序。至於其他的流程控制，還是使用 `goto LABEL` 的方式處理。
{% endcheatsheet %}

### 考慮需求

接下來，回顧一下我的備份需求：

* 可以分類 (分開) 備份不同的目錄
* 可以自動備份常用的目錄
* 可以手動備份指定的目錄
* 可以自動為備份檔案名稱，加上時間戳記
* 可以指定進行完整備份或差異備份
* 進行完整備份時，若已有當天的完整備份，則改進行差異備份
* 進行差異備份時，若找不到完整備份，則改進行完整備份

以下，我們就依據需求，逐項來分析批次檔需要完成哪些工作。

##### 需求：可以分類 (分開) 備份不同的目錄 + 可以自動備份常用的目錄
這就意味著，需要一個變數，用來保存需要備份的標的，以及一個 `for` 迴圈，來分別處理這些目錄。這個簡單：

``` bat
set SRC_DIR=C:\folder1, C:\folder2, "C:\folder with space"

for %%F in (%SRC_DIR%) do (
  echo %%F
)
```

輕鬆搞定。

#### 需求：可以手動備份指定的目錄 + 可以指定進行完整備份或差異備份

這就意味著，需要解析命令列參數。為了提供較大的彈性，指定的備份來源目錄，應該允許一次指定多個目錄，所以這是一個數量可變動的參數，最好放在參數列的後方。至於允許手動指定進行完整備份或差異備份，這比較簡單，可以分別使用 `FULL` 及 `DIFF` 參數來指定。不過，同樣為了提供彈性，應該提供預設值，讓使用者可以省略參數。

基於這樣的分析，我們的批次檔將提供如下的執行介面：

``` bat
7z-bak [DIFF|FULL] [folders]
```

##### 處理可選參數及變動參數

要提供上面的介面，我們將需要動態解析命令列參數。第一個版本，做了這樣的嘗試：

``` bat
if "FULL" == "%1" (
  set TYPE=FULL
  shift
)
if "DIFF" == "%1" (
  set TYPE=DIFF
  shift
)
if "" == "%TYPE%" (
  set TYPE=DIFF
)
set DIRS=%*
if NOT "" == "%DIRS%" (
  set SRC_DIR=%DIRS%
)
```

利用 `shift` 指令，可以「捲動」命令列參數，使原來的 `%2` 變成 `%1`，`%3` 變成 `%2`，依此類推。這樣，我們就可以動態判斷第一個參數是否是 `FULL` 或 `DIFF`，如果是的話，就將 `TYPE` 設定為對應的備份方式，並且將「其餘」的命令列參數，指定給 `DIRS` 變數，然後判斷 `DIRS` 變數如果不是空的，就用它來取代批次檔原來的預設值。

不幸的是，這樣是行不通的，原因在於 `%*` 這個參數列表示方式，它代表的是全部的命命列參數，而且，它不受 `shift` 指令的影響，永遠不會改變。所以利用 `shift` 是無法達成原來的目的：處理開頭可選的參數，並取得其餘的所有參數。

{% cheatsheet %}
`%*` 代表全部的命命列參數，並且是不可變的，不受 `shift` 指令影響。
{% endcheatsheet %}

所以，我們必須自行遍歷所有的命令列參數，處理可選參數，並將其餘的參數，重新自行串接為一個字串，作為後續的處理。

``` bat
set PARAM=
for %%F in (%*) do (
  if "FULL" == "%%F" (
    set TYPE=FULL
  ) else if "DIFF" == "%%F" (
    set TYPE=DIFF
  ) else (
    if "" == "%PARAM%" (
      set PARAM=%%F
    ) else (
      set PARAM=%PARAM%, %%F
    )
  )
)
echo TYPE=%TYPE%
echo PARAM=%PARAM%
```

再一次，我們又遇到不幸。原來，批次檔執行的時候，系統會一次解析「一整行」指令，像上面的 `for` 迴圈，雖然以多行的方式撰寫，但是系統實際上會將它一次讀入並進行解析。同時，為了「效率」，批次檔在解析 `for` 迴圈的階段，就對變數進行展開動作。由於 `%PARAM%` 變數為空值，所以上面程式碼，就被「展開」成這樣：

``` bat
set PARAM=
for %%F in (%*) do (
  if "FULL" == "%%F" (
    set TYPE=FULL
  ) else if "DIFF" == "%%F" (
    set TYPE=DIFF
  ) else (
    if "" == "" (
      set PARAM=%%F
    ) else (
      set PARAM=, %%F
    )
  )
)
echo TYPE=%TYPE%
echo PARAM=%PARAM%
```

看到了嗎，迴圈中的 `%PARAM%` 變數消失了，因為它被「展開」為空字串了。這樣一來，我們便無法在迴圈中對變數重複進行取值、設值的動作。

要避免這個問題，我們必須啟用「擴充功能」：`delayed variable expansion`，讓 `for` 迴圈中的變數，延遲到迴圈進行時，才被展開。這時候，在迴圈中引用變數時，要改用 `!PARAM!` 的寫法。要開啟 `delayed variable expansion` 擴充功能，可以使用 [`SETLOCAL`][4] 指令。下面是改寫後的迴圈：

``` bat
SETLOCAL enabledelayedexpansion
set PARAM=
for %%F in (%*) do (
  if "FULL" == "%%F" (
    set TYPE=FULL
  ) else if "DIFF" == "%%F" (
    set TYPE=DIFF
  ) else (
    if "" == "!PARAM!" (
      set PARAM=%%F
    ) else (
      set PARAM=!PARAM!, %%F
    )
  )
)
echo TYPE=%TYPE%
echo PARAM=%PARAM%
```

{% cheatsheet enabledelayedexpansion 擴充功能 %}
在 `for` 迴圈中，要使變數能夠同時進行取值及設值動作，必須啟用 `enabledelayedexpansion` 擴充功能：
``` bat
SETLOCAL enabledelayedexpansion
```
詳細說明請參考 [Variable Expansion in FOR Loops](http://www.robvanderwoude.com/variableexpansion.php) 這篇文章。
{% endcheatsheet %}

哇！真是神奇，這麼簡單的迴圈功能，都可以弄得這麼複雜。不禁開始後悔為什麼要用批次檔來處理備份了。

##### 改寫成 subroutine(副程序)

由於這段程式碼是用來處理命令列參數，如果能把它獨立為一個副程序，可以讓主程序的邏輯更加清楚。另一方面，批次檔使用的變數 (環境變數)，實際上都是全域變數 -- 批次檔結束後，依舊存在 -- 至少對目前的 cmd 視窗而言。而 `SETLOCAL` 指令，實際上是要求 cmd 將變數當作區域變數使用，當批次檔結束或遇到對應的 `ENDLOCAL` 指令時，便會取消批次檔設定的變數，恢復到 SETLOCAL 之前的環境變數狀態。因此，`SETLOCAL` 與 `ENDLOCAL` 指令，經常配對使用，尤其適合放在副程序中使用，可以避免變數名稱的衝突。所以，將上面的程式片段，改寫成以下的 `:PARAMS` 標籤區塊，作為副程序，供主程序呼叫：

``` bat
:PARAMS
SETLOCAL enabledelayedexpansion
set PARAM=
for %%F in (%*) do (
  if "FULL" == "%%F" (
    set TYPE=FULL
  ) else if "DIFF" == "%%F" (
    set TYPE=DIFF
  ) else (
    if "" == "!PARAM!" (
      set PARAM=%%F
    ) else (
      set PARAM=!PARAM!, %%F
    )
  )
)
ENDLOCAL & set "TYPE=%TYPE%" & set "PARAM=%PARAM%"
goto :eof
```

注意上面 `SETLOCAL` 與 `ENDLOCAL` 指令配對的方式，以及 `ENDLOCAL` 指令利用 `&` 指令串接 `set` 指令，回傳變數的方式。由於需要設定兩個變數，所以需要使用另一個 `&` 指令串接第二個 `set` 指令。特別要注意的是，如果不像上面的範例一樣，使用 `set "VAR=VALUE"` 這樣的語法，將變數與值使用引號圍住，在第一個 `set` 指令後面，跟 `&` 指令之間不可以有空白，否則設定的變數 (在這個例子是 `TYPE`)，會在後面多一個空白字元，導致後續判斷變數值時失敗。

{% cheatsheet 避免設定變數時，意外含入空白字元的方法 %}
要避免設定變數時，意外含入空白字元，應使用如下的語法：
``` bat
set "VAR=VALUE"
```
詳細說明請參考 [SET](http://ss64.com/nt/set.html) 這篇文章。
{% endcheatsheet %}

{% cheatsheet 副程序回傳值的方式 %}
``` bat
ENDLOCAL & set "RESULT1=xxx" & set "RESULT2=yyy"
```
詳細說明請參考 [Batch file Functions](http://ss64.com/nt/syntax-functions.html) 這篇文章。
{% endcheatsheet %}

##### 呼叫 subroutine (副程序) 的方法

改寫成副程序之後，當然就要呼叫嘍。記得最前面提到，副程序其實是被轉成另一個批次檔來呼叫的嗎？既然實際上是另一個批次檔，它所接收到的參數，自然就不是原本的批次檔的參數了，所以主程序需要將副程序需要的參數，自行傳遞給副程序，副程序是無法看到主程序的 `%*` 參數的。另外，呼叫副程序時，不要忘了標籤前面的 `:` 號 （是的，跟 `goto LABEL` 的語法不一致）：

``` bat
call :PARAMS %*

if NOT "" == "%PARAM%" (
  set SRC_DIR=%PARAM%
)
if "" == "%TYPE%" (
  set TYPE=DIFF
)
echo BAK_DIR=%BAK_DIR%
echo SRC_DIR=%SRC_DIR%
echo TYPE=%TYPE%

for %%F in (%SRC_DIR%) do (
  call :%TYPE% %%F
)
```

呼叫 `:PARAMS` 副程序後，如果 `%PARAM%` 變數不是空的，我們就用它取代原本的 `SRC_DIR` 預設值。如果 `%TYPE%` 變數是空的，我們就設定 `DIFF` 做為預設的備份模式。把這些判斷放在主程序，以便凸顯預設值可以被命令列取代。

然後，修改一開始寫的 `for` 迴圈，逐一呼叫由 `TYPE` 變數所代表的對應備份副程序，並將備份來源目錄當作參數傳給副程序。

{% cheatsheet %}
副程序無法看到主程序的 `%*` 參數。
{% endcheatsheet %}

{% cheatsheet %}
呼叫副程序的語法是： `call :LABEL [parameters]`
{% endcheatsheet %}

{% cheatsheet %}
跳轉到標籤的語法是： `goto LABEL`
{% endcheatsheet %}

#### 需求：可以自動為備份檔案名稱，加上時間戳記

考慮到完整備份通常會隔好幾天才執行一次，因此完整備份的檔案名稱的時間戳記，只需要日期就足夠了。而差異備份，通常會進行得比較頻繁，即使每個小時執行一次也不為過。因此差異備份的檔案名稱的時間戳記，除了日期之外，最好再加上時間，以免檔案名稱發生衝突。

基於這樣的考量，將檔案名稱格式設計成下面這樣：

<dl>
<dt>完整備份</dt>  <dd>[備份目錄名稱]_YEARMMDD.7z</dd>
<dt>差異備份</dt>  <dd>[備份目錄名稱]_YEARMMDD_diff_yearmmdd_hhmmss.7z</dd>
</dl>

要注意到 `YEARMMDD` 是完整備份的日期戳記。由於差異備份是基於完整備份，所以需要能夠清楚區分是基於哪一個完整備份，因此差異備份將使用完整備份的檔案名稱，再附加上實際備份的日期與時間戳記。所以上面的 `YEARMMDD` 與 `yearmmdd` 很可能是不同日期。

決定了日期與時間戳記的格式，接下來就是設法取得正確的資料了。

雖然 `%DATE%` 及 `%TIME%` 可以取得日期及時間，但是格式卻不適合做為檔案名稱。同時 `%TIME%` 並不會自動補零：

``` bat
echo DATE="%DATE%" rem "2012/07/21 週六"
echo TIME="%TIME%" rem " 2:08:04.09"
```

更糟糕的是，這跟系統使用的語系，以及使用者電腦的設定有關，每個系統的輸出可能不一致，很難正確重組格式。還好，找到了解決方案：[How to get current datetime on windows command line, in a suitable format for using in a filename?][8] 這篇問答提供了利用 `wmic` 指令取得 ISO 時間表示的方法。我直接改寫成以下的 `:TIMESTAMP` 副程序：

``` bat
:TIMESTAMP
  SETLOCAL
  for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if ".%%i."==".LocalDateTime." set ldt=%%j
  ENDLOCAL & set "DATE=%ldt:~0,8%" & set "TIME=%ldt:~8,6%"
  goto :eof
```

這裡的 `%ldt:~0,8%` 及 `%ldt:~8,6%` 寫法，是 substring 子字串處理的表示方式。第一個數字是由零起算的偏移位置，第二個可省略的數字是要擷取的長度。數字可以是負數，這時候就都代表由字串尾端往前計算的偏移位置。在這裡我們由 `ldt` 這個變數，分別取出日期與時間部分，設定給 `DATE` 及 `TIME` 變數。

{% cheatsheet 擷取子字串 %}
``` bat
%VAR:~OFFSET,LENGTH%
```
第一個數字 `OFFSET` 是由零起算的偏移位置，第二個可省略的數字 `LENGTH` 是要擷取的長度。數字可以是負數，這時候就都代表由字串尾端往前計算的偏移位置。

不過子字串處理只對 `%VAR%` 形式的變數有效，不支援命令列參數 `%1` 及 `for` 迴圈參數 `%%F` 的格式。

詳細語法說明，請參考 [Variables: extract part of a variable (substring)](http://ss64.com/nt/syntax-substring.html) 這篇文章。
{% endcheatsheet %}

上面的程式片段裡，有一個容易引起注意的地方是，在進入迴圈前，並未啟用擴充功能，這樣不會有問題嗎？

由於 `ldt` 變數在迴圈中只需要被「賦值」，並不需要同時執行「取值」與「賦值」的動作，也就是說，迴圈中不需要有 `%ldt%` 的引用，自然不會發生被展開為空字串的問題。所以上面的迴圈，可以省去啟用擴充功能的動作。

另一方面，若迴圈中只對變數進行「取值」，並不「賦值」，同樣也不需要啟用擴充功能。為什麼呢？讀者不妨自己想想看。

另外，使用 `wmic` 指令的缺點是，這是 Windows XP 之後才有的指令，而且執行時需要 Administrator 權限。如果不喜歡些限制，可以改用同一篇問答的另一個答案：[Regionaly independent date time parsing][10]，使用外部程式 date.exe 來輸出需要的格式。

要呼叫 `:TIMESTAMP` 副程序，可以這樣做：

``` bat
call :TIMESTAMP

echo DATE="%DATE%"
echo TIME="%TIME%"
echo TIMESTAMP="%DATE%_%TIME%"
```

我們把這個呼叫放在主程序的 `for` 迴圈之前，以便初始化 `DATE` 及 `TIME` 變數，供後面的程式使用。另外，由於有許多副程序都需要啟用擴充功能，乾脆在主程序直接啟用吧：

``` bat
:START

  SETLOCAL enabledelayedexpansion

  call :PARAMS %*
  if NOT "" == "%PARAM%" (
    set SRC_DIR=%PARAM%
  )
  if "" == "%TYPE%" (
    set TYPE=DIFF
  )
  echo BAK_DIR=%BAK_DIR%
  echo SRC_DIR=%SRC_DIR%
  echo TYPE=%TYPE%

  call :TIMESTAMP
  echo DATE: "%DATE%"
  echo TIME: "%TIME%"

  for %%F in (%SRC_DIR%) do (
    call :%TYPE% %%F
  )

:END
```

#### 需求：進行完整備份時，若已有當天的完整備份，則改進行差異備份

當進行完整備份時，我們要能夠判斷當天的完整備份檔案是否已經存在，這個簡單，只要確認 `[備份目錄名稱]_%DATE%.7z` 檔案是否存在就成了。以下就是 `:FULL` 副程序：

``` bat
:FULL
  SETLOCAL
  set SRC=%1
  set FN=%~nx1
  echo ------------------
  echo Requesting full backup for "%SRC%"...
  set FB=%BAK_DIR%\%FN%_%DATE%.7z
  if EXIST %FB% (
    echo ...full backup for "%SRC%": %FB% already exist, re-request diff backup instead...
    call :DO_DIFF_BAK %SRC% %FB%
  ) else (
    call :DO_FULL_BAK %SRC% %FB%
  )
  ENDLOCAL
  goto :eof

:DO_FULL_BAK
  goto :eof

:DO_DIFF_BAK
  goto :eof
```

這個副程序接受一個參數，並將它儲存在 `SRC` 變數，這個參數代表要備份的目錄，格式是 `D:\some_parent_dir\backup_dir.ext`。

另外，也同時將這個參數，只取出檔名的部分，儲存在 `FN` 變數，在這個例子，就是 `backup_dir.ext`。其中 `~n` 及 `~x` 表示方式，是取出路徑中的檔案名稱及副檔名，可以合併寫成 `~nx`。由於路徑參數處理只能用於參數，無法用於 `%VAR%` 形式的字串變數，所以必須直接對 `%1` 進行操作，不能由 `SRC` 變數取得。

{% cheatsheet 路徑參數 %}
路徑參數處理只能用於參數，包括：命令列參數、副程序參數、`for` 迴圈參數。

關於路徑參數的使用說明，請參考 [Parameters](http://ss64.com/nt/syntax-args.html) 這篇文章。
{% endcheatsheet %}

接下來，將 `FB` 變數設定為完整備份檔案的完整路徑名稱，然後檢查檔案是否存在。如果檔案存在，則呼叫 `:DO_DIFF_BAK` 改為進行差異備份；否則，則呼叫 `:DO_FULL_BAK` 繼續進行完整備份。呼叫副程序時，傳入要備份的目錄 `%SRC%`，以及完整備份檔案名稱 `%FB%` 作為參數：

``` bat
set FB=%BAK_DIR%\%FN%_%DATE%.7z
if EXIST %FB% (
  call :DO_DIFF_BAK %SRC% %FB%
) else (
  call :DO_FULL_BAK %SRC% %FB%
)
```

#### 需求：進行差異備份時，若找不到完整備份，則改進行完整備份

當進行差異備份時，我們要能夠找出最新的完整備份檔案，才能在該完整備份檔案的基礎上，進行差異備份。所以，這裡的問題是，要如何找到最新的完整備份檔案呢？

由於已經將完整備份檔案名稱固定為 `[備份目錄名稱]_YEARMMDD.7z` 這樣的格式，而 wildcard 通配字元 `?` 只會匹配一個字元，所以利用 `[備份目錄名稱]_????????.7z` 這樣的格式，理論上應該能匹配檔案名稱只含有日期戳記 8 個數字的檔案，也就是只會批配完整備份檔案。同時，由於 `for` 迴圈在處理檔案匹配時，是依照檔案名稱排序，而我們的檔案名稱含有日期戳記，所以匹配的最後一個檔案，應該就是最新的完整備份檔案：

``` bat
set SRC=%1
set FN=%~nx1
for %%F in (%BAK_DIR%\%FN%_????????.7z) do (
  set FULL=%%F
)
echo "found: %FULL%"
```

但是，很不幸地，實際上測試結果，它還是會批配到 `[備份目錄名稱]_????????_diff_????????_??????.7z` 的檔案，也就是找到差異備份檔案了。為什麼呢？原來通配字元會同時檢測「長檔名」與「短檔名」。我想，沒有經歷過 Windows 95/98/ME 的讀者，甚至於不知道什麼是「短檔名」吧？歐賣尬！

{% cheatsheet 通配字元會同時檢測「長檔名」與「短檔名」 %}
通配字元 `?` 及 `*` 會同時檢測「長檔名」與「短檔名」。在 `for` 迴圈中及 `dir` 指令皆然。

<p>關於通配字元的說明，請參考 [Wildcards](http://ss64.com/nt/syntax-wildcards.html) 這篇文章。

關於「長檔名」與「短檔名」的說明，請參考 [Long filenames, NTFS and legal filename characters](http://ss64.com/nt/syntax-filenames.html) 這篇文章。
{% endcheatsheet %}

沒辦法，只好自己過濾了：

``` bat
:DIFF
  SETLOCAL
  set SRC=%1
  set FN=%~nx1
  echo ------------------
  echo Requesting diff backup for "%SRC%"...
  echo ...finding full backup...
  set FB=
  for %%N in (%BAK_DIR%\%FN%_*.7z) do (
    set STMP=%%N
    set STMP=!STMP:~-11,8!
    if "%%N" == "%BAK_DIR%\%FN%_!STMP!.7z" (
      echo ......found: %%N
      set FB=%%N
    )
  )
  if "" == "%FB%" (
    echo ...full backup not found, re-request full backup instead...
    call :DO_FULL_BAK %SRC% "%BAK_DIR%\%FN%_%DATE%.7z"
  ) else (
    echo ...full backup found: %FB%
    call :DO_DIFF_BAK %SRC% %FB%
  )
  ENDLOCAL
  goto :eof
```

利用擷取子字串的方式，擷取不含副檔名 (去掉 `.7z`) 的檔案名稱最後 8 個字元，並且重新依照完整備份的檔案名稱格式，重新拼湊出檔名。如果拼湊出來的檔案名稱與迴圈抓到的檔案名稱一致，就表示這個檔案確實是完整備份(差異備份檔案名稱最後 8 個字元應該是 `8_888888` 的格式，不會是 `88888888` 的格式)，那麼，就記錄在 `FB` 變數。待迴圈執行完畢，就能得到最新的完整備份檔案名稱了。

然後，判斷如果 `FB` 為空字串，表示找不到任何完整備份檔，則呼叫 `:DO_FULL_BAK`，改進行完整備份；否則呼叫 `:DO_DIFF_BAK`，執行差異備份。呼叫副程序時，傳入要備份的目錄 `%SRC%`，以及完整備份檔案名稱 `%BAK_DIR%\%FN%_%DATE%.7z` 或 `%FB%` 作為參數：

#### 處理 7-Zip 壓縮共用選項

困難的部分差不多都處理完了...吧？在實際呼叫 7-Zip 執行壓縮之前，先設定一下壓縮的選項，以避免重複：

``` bat
set 7Z_OPT=-scsUTF-8 -ssc -ssw -ms=on -mx=9 -t7z
```

唉！又踩到地雷了。變數名稱不能以數字開頭，否則會被當作命令列參數。是自己大意，摸摸鼻子就算了：

``` bat
set Z_OPT=-scsUTF-8 -ssc -ssw -ms=on -mx=9 -t7z
```

{% cheatsheet 變數名稱不能以數字開頭 %}
變數名稱不能以數字開頭，否則會被當作命令列參數。
{% endcheatsheet %}

下表一一說明這些選項的作用：

__7-Zip 壓縮選項__

   選項 | 說明 | 預設值 | 備註 |
--------|-----|-------|------|
__-scsUTF-8__ | 檔名列表使用 UTF-8 編碼 | 預設開啟 |  |
__-ssc__      | 維持檔名大小寫 | 在 Windows 預設關閉 | Java 開發者應該知道為什麼要打開這個選項 |
__-ssw__      | 壓縮被其它程式鎖住的檔案 | 預設關閉 | 自動執行備份的時候，很可能還有其他程式正打開要備份的檔案 |
__-ms=on__    | Solid Archive 把所有的檔案壓在一起，可以提高壓縮率 | 預設開啟 |  |
__-mx=9__     | 壓縮率設定為最大 | 預設為 5 |  |
__-t7z__      | 使用 7z 格式 | 預設由副檔名決定 | 只有 7z 格式支援差異備份 |

要特別說明的是，由於我們每次進行差異備份的時候，都將建立新的檔案，並不會更動到原有的壓縮檔，不會有需要耗時重新壓縮的問題，所以可以使用 -ms=on 選項，打開 Solid Archive 功能，提高壓縮率。-ms=on 選項是預設開啟的，不過把它寫出來，強調我們要啟用這個選項。

{% cheatsheet 7-Zip 的命令列參數 %}
關於 7-Zip 的命令列參數的詳細說明，請參考 [7-Zip Command-Line](http://www.dotnetperls.com/7-zip-examples) 這篇文章。

不過，最完整的說明，還是要看 [7-Zip 或 7za](http://www.7-zip.org/download.html) 下載包裡面的 7-zip.chm 說明檔案了。
{% endcheatsheet %}

#### 呼叫 7-Zip 執行完整備份

完整備份比較簡單，只要決定好檔案名稱及備份目錄，再以 `a` 命令呼叫 `7za.exe` 即可。

``` bat
:DO_FULL_BAK
  SETLOCAL
  set DIR=%1
  set FULL=%2
  echo ...performing full backup...
  7za a %FULL% %Z_OPT% %DIR%
  echo .
  echo ...%FULL%...done.
  ENDLOCAL
  goto :eof
```

此副程序接受兩個參數，`%1` 是要備份的目錄，`%2` 是完整備份的檔案名稱。養成好習慣，把參數指定給比較容易辨識的變數名稱 `DIR` 與 `FULL`，讓程式比較容易讀懂。

#### 呼叫 7-Zip 執行差異備份

差異備份要使用 `u` 命令呼叫 `7za.exe`，為了要能忠實反映檔案的增刪異動情形，並且將異動情形儲存在獨立的差異備份檔案中，則要再加上 `-u- -up0q3r2x2y2z0w2![差異備份檔案名稱]` 選項：

``` bat
:DO_DIFF_BAK
  SETLOCAL
  set DIR=%1
  set FULL=%2
  set DIFF="%FULL:~0,-3%_diff_%DATE%_%TIME%.7z"
  echo ...performing diff backup on %FULL%...
  7za u %FULL% %Z_OPT% -u- -up0q3r2x2y2z0w2^^!%DIFF% %DIR%
  echo .
  echo ...%DIFF%...done^^!
  ENDLOCAL
  goto :eof
```

其中 `-u-` 選項，是告訴 7-Zip 不要更動 `%FULL%` 檔案。而 `-up0q3r2x2y2z0w2!%DIFF%` 是告訴 7-Zip 將異動的部分，放到 `%DIFF%` 檔案中。

{% cheatsheet 7-Zip&nbsp;的差異備份選項 %}
關於 7-Zip 差異備份選項的介紹，請參考 [Automated differential backup using 7zip for linux/windows](http://a32.me/2010/08/7zip-differential-backup-linux-windows/) 這篇文章。
{% endcheatsheet %}

如前面檔案名稱設計那一段所述，差異備份的檔案名稱，是使用對應的完整備份的檔案名稱，再附加上實際備份的日期與時間戳記，所以只要去掉 `FULL` 變數的 `.7z` 副檔名，再附加上 `_diff_%DATE%_%TIME%.7z` 就是差異備份的檔案名稱了。

等一下！那個兩個 `^^` 是什麼鬼！？

記得我們在主程序啟用了擴充功能嗎？現在就要為此付出代價了：

由於啟用擴充功能之後，變數須改用 `!VAR!` 的形式引用，這時候 `!` 就有了特殊意義，因此若要讓 `!` 被當作一般字元使用，就需要使用 `^^` 對它進行 escape 轉義！

{% cheatsheet 啟用擴充功能後的『!』字元使用 %}
啟用擴充功能後，要使 `!` 作為一般字元使用，則必須使用 `^^` 對它進行 escape 轉義。

詳細說明請參考 [How can I escape an exclamation mark ! in cmd scripts?](http://stackoverflow.com/questions/3288552/how-can-i-escape-an-exclamation-mark-in-cmd-scripts) 這篇問答。
{% endcheatsheet %}


### 初步的成果

把全部的程式碼整理在一起，下面就是可以處理備份功能的批次檔了：

``` bat
@echo off & goto CONFIG

:SYNTAX

  echo Syntax: %~n0 [DIFF|FULL] [folders]
  goto END

:CONFIG

  set BAK_DIR=[你要儲存備份檔的目錄，不要包含路徑最後的 \ 字元]
  set SRC_DIR=[你要備份的目錄，不要包含路徑最後的 \ 字元。用空格或逗號區隔不同目錄。如果目錄包含空白字元，請使用 "" 括住完整路目錄名稱]

  set Z_OPT=-scsUTF-8 -ssc -ssw -ms=on -mx=9 -t7z

  goto START

:PARAMS
  SETLOCAL
  set PARAM=
  for %%F in (%*) do (
    if "FULL" == "%%F" (
      set TYPE=FULL
    ) else if "DIFF" == "%%F" (
      set TYPE=DIFF
    ) else (
      if "" == "!PARAM!" (
        set PARAM=%%F
      ) else (
        set PARAM=!PARAM!, %%F
      )
    )
  )
  ENDLOCAL & set "TYPE=%TYPE%" & set "PARAM=%PARAM%"
  goto :eof

:TIMESTAMP
  SETLOCAL
  for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if ".%%i."==".LocalDateTime." set ldt=%%j
  ENDLOCAL & set "DATE=%ldt:~0,8%" & set "TIME=%ldt:~8,6%"
  goto :eof

:DO_FULL_BAK
  SETLOCAL
  set DIR=%1
  set FULL=%2
  echo ...performing full backup...
  7za a %FULL% %Z_OPT% %DIR%
  echo .
  echo ...%FULL%...done^^!
  ENDLOCAL
  goto :eof

:DO_DIFF_BAK
  SETLOCAL
  set DIR=%1
  set FULL=%2
  set DIFF="%FULL:~0,-3%_diff_%DATE%_%TIME%.7z"
  echo ...performing diff backup on %FULL%...
  7za u %FULL% %Z_OPT% -u- -up0q3r2x2y2z0w2^^!%DIFF% %DIR%
  echo .
  echo ...%DIFF%...done^^!
  ENDLOCAL
  goto :eof

:FULL
  SETLOCAL
  set SRC=%1
  set FN=%~nx1
  echo ------------------
  echo Requesting full backup for "%SRC%"...
  set FB="%BAK_DIR%\%FN%_%DATE%.7z"
  if EXIST %FB% (
    echo ...full backup for "%SRC%": %FB% already exist, re-request diff backup instead...
    call :DO_DIFF_BAK %SRC% %FB%
  ) else (
    call :DO_FULL_BAK %SRC% %FB%
  )
  ENDLOCAL
  goto :eof

:DIFF
  SETLOCAL
  set SRC=%1
  set FN=%~nx1
  echo ------------------
  echo Requesting diff backup for "%SRC%"...
  echo ...finding full backup...
  set FB=
  for %%N in (%BAK_DIR%\%FN%_*.7z) do (
    set STMP=%%N
    set STMP=!STMP:~-11,8!
    if "%%N" == "%BAK_DIR%\%FN%_!STMP!.7z" (
      echo ......found: %%N
      set FB=%%N
    )
  )
  if "" == "%FB%" (
    echo ...full backup not found, re-request full backup instead...
    call :DO_FULL_BAK %SRC% "%BAK_DIR%\%FN%_%DATE%.7z"
  ) else (
    echo ...full backup found: %FB%
    call :DO_DIFF_BAK %SRC% %FB%
  )
  ENDLOCAL
  goto :eof

:START

  SETLOCAL enabledelayedexpansion

  call :PARAMS %*
  if NOT "" == "%PARAM%" (
    set SRC_DIR=%PARAM%
  )
  if "" == "%TYPE%" (
    set TYPE=DIFF
  )
  echo BAK_DIR=%BAK_DIR%
  echo SRC_DIR=%SRC_DIR%
  echo TYPE=%TYPE%

  call :TIMESTAMP
  echo DATE: "%DATE%"
  echo TIME: "%TIME%"

  for %%F in (%SRC_DIR%) do (
    call :%TYPE% %%F
  )

:END
```

#### 處理目錄名稱含有空白的情形

記得上一篇文章的使用說明中提到，若目錄名稱含有空白字元，則要使用 `""` 圍住嗎？我們這個批次程式能正確處理目錄名稱含有空白字元這種狀況嗎？

同樣非常不幸運地，答案是否定的。問題是出現在 `:PARAMS` 副程序：

``` bat
if "FULL" == "%%F" (
)
```

若在命令列輸入 `7z-bak "C:\Program Files"`，則這段程式碼展開之後，會變成：

``` bat
if "FULL" == ""C:\Program Files"" (
)
```

意外的是，若將目標目錄寫在批次檔中，像這樣： `SRC_DIR="C:\Program Files"`，則不會發生錯誤，可以正常執行。

此外，還有個小瑕疵：即使檔名沒有空白字元，若我們強行加上 `""` 號圍住，則在顯示備份訊息時，會出現 `""目錄名稱""` 這樣的內容。譬如若在命令列輸入 `7z-bak "C:\temp"`，輸出訊息會是：

```
Requesting diff backup for ""C:\temp""...
```

雖然可以正常執行，但是真的...很奇怪耶！你！

要解決這些問題，我們需要在適當的時候，將檔案名稱以 `""` 圍住，適當的時候，又需要將它展開，去除 `""`。

什麼時候需要圍住呢？在傳遞檔名時需要使用 `""` 將檔名圍住，否則檔名將被拆開來解讀為兩個以上的參數。什麼時候需要展開呢？當我們需要重組檔名的時候，我們不希望檔名夾雜著多餘的或是不正確的 `"` 號，譬如 `""C:\Program Files""` 及 `C:\"Program Files"`，在批次檔案裡面，就無法正確被解讀為檔案名稱。

要展開檔案名稱，可以使用前面提過的路徑參數處理語法，我們可以使用 `~f` 指令展開完整路徑：

``` bat
  set SRC_DIR="C:\Program Files", C:\"Program Files", ""C:\Program Files""
  for %%F in (%SRC_DIR%) do call :SUB %%F
  goto :END
:SUB
  echo %1 expands to: %~f1
:END
```

輸出：

```
"C:\Program Files" expands to: C:\Program Files
C:\"Program Files" expands to: C:\"Program Files"
""C:\Program expands to: D:\scripts\"C:\Program
Files"" expands to: D:\scripts\Files""
```

注意，後面兩個路徑名稱，都無法被 `~f` 指令正確展開，第三個甚至連參數傳遞都不正確，被當作兩個參數傳遞了。

接下來，我們一一檢視哪些地方需要展開，哪些地方需要圍住：

主迴圈裡面呼叫副程序，備份目錄作為參數傳遞，所以不能在這裡展開，只要維持原樣：

```
for %%F in (%SRC_DIR%) do (
  call :%TYPE% %%F
)
```

`:FULL` 及 `:DIFF` 副程序，其中 `SRC` 接受參數之後，就不再更動，並且會被當作參數傳遞，所以可以直接在展開後立即圍住。而 `FN` 則需要做檔名重組，故只將它展開。`FB` 的狀況則與 `SRC` 類似，雖然在 `:DIFF` 中需要多次重新賦值：

``` bat
:FULL
  SETLOCAL
  set SRC="%~f1"
  set FN=%~nx1
  echo ------------------
  echo Requesting full backup for %SRC%...
  set FB="%BAK_DIR%\%FN%_%DATE%.7z"
  if EXIST %FB% (
    echo ...full backup for %SRC%: %FB% already exist, re-request diff backup instead...
    call :DO_DIFF_BAK %SRC% %FB%
  ) else (
    call :DO_FULL_BAK %SRC% %FB%
  )
  ENDLOCAL
  goto :eof

:DIFF
  SETLOCAL
  set SRC="%~f1"
  set FN=%~nx1
  echo ------------------
  echo Requesting diff backup for %SRC%...
  echo ...finding full backup...
  set FB=
  for %%N in (%BAK_DIR%\%FN%_*.7z) do (
    set STMP=%%N
    set STMP=!STMP:~-11,8!
    if "%%N" == "%BAK_DIR%\%FN%_!STMP!.7z" (
      echo ......found: "%%N"
      set FB="%%N"
    )
  )
  if "" == "%FB%" (
    echo ...full backup not found, re-request full backup instead...
    set FB="%BAK_DIR%\%FN%_%DATE%.7z"
    call :DO_FULL_BAK %SRC% %FB%
  ) else (
    echo ...full backup found: %FB%
    call :DO_DIFF_BAK %SRC% %FB%
  )
  ENDLOCAL
  goto :eof
```

`:DO_FULL_BAK` 不需要更動，`:DO_DIFF_BAK` 則修正如下：

``` bat
  :DO_DIFF_BAK
   SETLOCAL
   set DIR="%~f1"
   set FULL=%~f2
   set DIFF="%FULL:~0,-3%_diff_%DATE%_%TIME%.7z"
   echo ...performing diff backup on "%FULL%"...
   7za u "%FULL%" %Z_OPT% -u- -up0q3r2x2y2z0w2^^!%DIFF% %DIR%
   echo .
   echo ...%DIFF%...done^^!
   ENDLOCAL
   goto :eof
```

### 完工

終於看到辛苦的成果，感動啊！

<!-- differential-backup-using-7-zip-windows-7z-bak.cmd -->
<!-- inno-v/5650722 -->
{% gist amobiz/d0be531a7c109c785845 %}

### 結論

之前對於批次檔的認識，一直停留在 DOS 3.X ~ 6.X 的時代，從來沒用過擴充功能。這次心血來潮，決定使用批次檔來呼叫 7-Zip 執行備份工作，說真的，實在是...自找罪受。Cmd 批次檔畢竟是 DOS 時代的遺物了，應該要跟上時代，改用 [Windows PowerShell][18]。

不論如何，最終還是完成了，也算是學到了一點東西，趁忘記之前，趕緊寫下這篇長篇大論，以資紀念及備查。

歡迎大家的回饋與心得分享。

### 參考資料：

* [7-Zip Command-Line][14]
* [Automated differential backup using 7zip for linux/windows][16]
* [Batch file][3]
* [Batch file Functions][7]
* [How can I escape an exclamation mark ! in cmd scripts?][17]
* [How to get current datetime on windows command line, in a suitable format for using in a filename?][8]
* [Long filenames, NTFS and legal filename characters][13]
* [Parameters][11]
* [Regionaly independent date time parsing][10]
* [SET][6]
* [SETLOCAL][4]
* [Variable Expansion in FOR Loops][5]
* [Variables: extract part of a variable (substring)][9]
* [Wildcards][12]

### 相關文章：

<!-- cross references -->

{% postrefs %}
* [Differential backup using 7-Zip for Windows (Part 1) - 利用 7-Zip 進行差異備份（上篇）][differential-backup-using-7-zip-part1-windows]
* [Differential backup using 7-Zip for Windows (Part 2) - Secrets of batch files - 利用 7-Zip 進行差異備份（下篇） - 批次檔案的秘密][differential-backup-using-7-zip-part2-secrets-of-batch-files]
{% endpostrefs %}

<!-- external references -->

[2]: http://en.wikipedia.org/wiki/7-Zip "7-Zip"
[3]: http://en.wikipedia.org/wiki/Batch_file "batch"
[4]: http://ss64.com/nt/setlocal.html "SETLOCAL"
[5]: http://www.robvanderwoude.com/variableexpansion.php "Variable Expansion in FOR Loops"
[6]: http://ss64.com/nt/set.html "SET"
[7]: http://ss64.com/nt/syntax-functions.html "Batch file Functions"
[8]: http://stackoverflow.com/questions/203090/how-to-get-current-datetime-on-windows-command-line-in-a-suitable-format-for-us/203116#203116 "How to get current datetime on windows command line, in a suitable format for using in a filename?"
[9]: http://ss64.com/nt/syntax-substring.html "Variables: extract part of a variable (substring)"
[10]: http://stackoverflow.com/questions/203090/how-to-get-current-datetime-on-windows-command-line-in-a-suitable-format-for-us/1951681#1951681 "Regionaly independent date time parsing"
[11]: http://ss64.com/nt/syntax-args.html "Parameters"
[12]: http://ss64.com/nt/syntax-wildcards.html "Wildcards"
[13]: http://ss64.com/nt/syntax-filenames.html "Long filenames, NTFS and legal filename characters"
[14]: http://www.dotnetperls.com/7-zip-examples "7-Zip Command-Line"
[15]: http://www.7-zip.org/download.html "7-Zip 或 7za"
[16]: http://a32.me/2010/08/7zip-differential-backup-linux-windows/ "Automated differential backup using 7zip for linux/windows"
[17]: http://stackoverflow.com/questions/3288552/how-can-i-escape-an-exclamation-mark-in-cmd-scripts "How can I escape an exclamation mark ! in cmd scripts?"
[18]: http://technet.microsoft.com/zh-tw/library/dd125460 "Windows PowerShell"
