# Animation in JavaScript / CSS


## GSAP (GreenSock Animation Platform)

http://www.greensock.com
https://github.com/greensock/GreenSock-JS
https://ihatetomatoes.net/greensock-cheat-sheet/#more-6001

Google 推薦的 JavaScript 動畫程式庫，地表最強。

缺點：非標準 open source license：可免費非營利使用。
但若需要使用 bonus plugins 則需付年費。

[Licensing](http://greensock.com/licensing/)
[Standard "No Charge" GreenSock License](http://greensock.com/standard-license)
[The "Why" Behind the GreenSock License](http://greensock.com/why-license)

[TweenLite]() - 包含基本功能，不含 plugin。

[TweenMax]() - TweenMax includes TweenLite, CSSPlugin, EasePack, TimelineLite, TimelineMax, RoundPropsPlugin, BezierPlugin, AttrPlugin, and DirectionalRotationPlugin。



[GSAP Plugins](http://greensock.com/plugins/?product_id=4921) - 有 `club` 字樣的就是 bonus plugin。

[CSSPlugin](http://greensock.com/docs/#/HTML5/GSAP/Plugins/CSSPlugin/) - (免費) 

[RaphaelPlugin](http://greensock.com/RaphaelPlugin) - (免費) 可以整合 Raphael library。

[入門](http://greensock.com/get-started-js)


```js
// 對 photo 施展動畫，過程 1.5 秒，由目前的狀態轉變為指定的狀態，完成時呼叫 myFunction 函數。
TweenLite.to(photo, 1.5, {width:100, delay:0.5, onComplete:myFunction});
function myFunction() {
    console.log("tween finished");
}
```


## Dynamics.js

http://dynamicsjs.com/
https://github.com/michaelvillar/dynamics.js

license: MIT

提供一些罐頭效果，譬如彈簧、彈跳，起跑預備動作等效果，然後可以稍微調整頻率，幅度等屬性。
基本上是用來為 UI 添加一些看起來符合物理原理的動畫效果。

可以控制 DOM, SVG, 甚至是普通的 JavaScript 物件。
感覺很像是把 GSAP 的 CSSPlugin 及 Physics2DPlugin 部分抽出來。

基本用法：

```js
var el = document.getElementById("logo")
dynamics.animate(el, {		// 要改變的屬性 (CSS, object properties...)，將由物件目前的值，漸變為指定的值
  translateX: 350,			
  scale: 2,
  opacity: 0.5
}, {
  type: dynamics.spring,	// 指定效果 (每種效果有不同的屬性)
  frequency: 200,			// 頻率
  friction: 200,			// 摩擦係數 (影響終點的震盪幅度及速度，類似 ease 效果)
  duration: 1500,			// 持續時間 (愈短愈快)
  delay: 0,					// 延遲啟動
  complete: fn,				// 動畫完成時呼叫
  change: fn				// 每次改變屬性時呼叫
})
```

## Velocity.js

http://velocityjs.org/
https://github.com/julianshapiro/velocity

license: MIT

號稱效能比 GSAP 強。

基本用法：

```js
Velocity($element, {
  width: "500px",
  property2: value2
}, {
  /* Velocity's default options */
  duration: 400,
  easing: "swing",
  queue: "",
  begin: undefined,
  progress: undefined,
  complete: undefined,
  display: undefined,
  visibility: undefined,
  loop: false,
  ]delay: false,
  mobileHA: true
});
```

參考文章

[CSS vs. JS Animation: Which is Faster?](CSS vs. JS Animation: Which is Faster?)
[CSS vs JS动画：谁更快？](http://zencode.in/19.CSS-vs-JS%E5%8A%A8%E7%94%BB%EF%BC%9A%E8%B0%81%E6%9B%B4%E5%BF%AB%EF%BC%9F.html)


## 其他

[PhysicsJS](http://wellcaffeinated.net/PhysicsJS/) - 真正的即時物理運算動畫處理。
[Rekapi](http://rekapi.com/) - 以 Actor 為單位控制動畫，適合遊戲開發。
[Stylie](http://jeremyckahn.github.io/stylie/)、[Mantra](http://jeremyckahn.github.io/mantra/)  - 畫好 keyframe，然後用 CSS Animation 播放。


## 最後實作版本：

```js
const PUNPKINS = [
  require('./2016萬聖節-01.svg'),
  require('./2016萬聖節-02.svg'),
  require('./2016萬聖節-03.svg'),
  require('./2016萬聖節-04.svg')
];

const CANDIES = [
  require('./2016萬聖節-05.svg'),
  require('./2016萬聖節-06.svg'),
  require('./2016萬聖節-07.svg'),
  require('./2016萬聖節-08.svg'),
  require('./2016萬聖節-09.svg'),
  require('./2016萬聖節-10.svg')
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

show(target, type, min, max) {
    const root = this.refs.root;
    const G = 0.8;
    const count = rand(min, max);
    const offset = type === PUNPKINS ? -50 : 60;
    let promises = [];
    for (let i = 0; i < count; ++i) {
      promises.push(_show());
    }
    return Promise.all(promises);

    function _show() {
      return new Promise(function(resolve) {
        let t = 0;
        let vx = rand(-4, 4), vy = rand(-30, -20);
        const image = `url(${type[rand(0, type.length - 1)]})`;

        const rcBound = document.body.getBoundingClientRect();

        const el = document.createElement('div');
        el.classList.add(styles.ball);
        el.style.backgroundImage = image;
        root.appendChild(el);

        window.Velocity(el, {rotateZ: vx > 0 ? "180deg" : "-180deg"}, {queue: false, loop: true, duration: 3000, easing: 'linear'})
        window.Velocity(el, {left: '+=' + (vx + offset), top: '+=' + vy }, {duration: 16, complete: _next});

        function _next() {
          t += 16;
          vy += G;
          const rcEl = el.getBoundingClientRect();
          if (rcEl.top < rcBound.bottom) {
            window.Velocity(el, {left: '+=' + vx, top: '+=' + vy}, {duration: 16, complete: _next});
          } else {
            root.removeChild(el);
            resolve();
          }
        }
      });
    }
}
```
