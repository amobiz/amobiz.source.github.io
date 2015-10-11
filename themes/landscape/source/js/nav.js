(function($) {
    'use strict';
    
    nav('#comments > ul', '#comments .comments');
    
    function nav(navbarSelector, panelsSelector) {
        
        var navbar = document.querySelector(navbarSelector);
        if (!navbar) {
            return;
        }
        var panels = document.querySelectorAll(panelsSelector);
        if (!panels && !panels.length) {
            return;
        }
        for (var i = 0; i < panels.length; ++i) {
            el(panels[i], i === 0);
        }
        var tabs = navbar.querySelectorAll('a');
        function el(panel, active) {
            var title = panel.getAttribute('title');
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.innerText = title;
            a.setAttribute('href', '#');
            if (active) {
                a.classList.add('active');
            } else {
                panel.style.display = 'none';
            }
            li.appendChild(a);
            navbar.appendChild(li);
        }
        navbar.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                if (!e.target.classList.contains('active')) {
                    setActive(e.target.innerText);
                }
            }
        });
        function setActive(panel) {
            for (var i = 0; i < panels.length; ++i) {
                if (panels[i].getAttribute('title') === panel) {
                    panels[i].style.display = 'block';
                    tabs[i].classList.add('active');
                } else {
                    panels[i].style.display = 'none'
                    tabs[i].classList.remove('active');
                }
            }
        }
    }
    
})(jQuery);