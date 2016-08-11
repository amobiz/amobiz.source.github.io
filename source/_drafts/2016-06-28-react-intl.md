---
### [react-intl](https://github.com/yahoo/react-intl)
使用 [FormatJS](http://formatjs.io/) 格式化字串。若搭配 YAML 使用，可以連字串的引號都省略，更加方便。

目前用到的功能：

__zh-Hang-TW.yml__
```yaml
messages:
	direct: 直接訊息，不插入變數。
	insert: 插入變數 {theVariable} 的訊息。
	index: >
		索引變數的訊息：
		現在是 {theTime, time, short},
		{theSection, select,
			am {上午}
			pm {下午}
		}。
```
#### 直接引用
```js
<p><FormattedMessage id='messages.direct'/>
```

#### 普通引用
```js
<p><FormattedMessage id='messages.insert', values={{
		theVariable: new Date()
	}}/>
```

#### 索引引用：
```js
const time = new Date();
const section = time.getHours() < 12 ? 'am' : 'pm';
return (
    <p><FormattedMessage id='messages.index', values={{
    		theTime: time,
    		section:
    	}}/>
);
```
