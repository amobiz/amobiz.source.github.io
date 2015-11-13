(function(url, timeout, container) {
    var div = document.createElement('div');
    div.innerHTML = '<p>redirect to <span id="location"></span> in <span id="timer"></span> seconds.</p>';
    container.insertBefore(div, container.firstChild);

    var timer = div.querySelector('#timer');
    var location = div.querySelector('#location');

    location.innerText = url;

    updateTimer();
    setInterval(updateTimer, 1000);

    setTimeout(function() {
        window.location = url;
    }, 1000 * timeout);

    function updateTimer() {
        timer.innerText = timeout--;
    }
})('https://amobiz.github.io', 15, document.body);