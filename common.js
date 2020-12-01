
/*
'use strict';
var multiItemSlider = (function () {

    function _isElementVisible(element) {
        var rect = element.getBoundingClientRect(),
            vWidth = window.innerWidth || doc.documentElement.clientWidth,
            vHeight = window.innerHeight || doc.documentElement.clientHeight,
            elemFromPoint = function (x, y) { return document.elementFromPoint(x, y) };
        if (rect.right < 0 || rect.bottom < 0
            || rect.left > vWidth || rect.top > vHeight)
            return false;
        return (
            element.contains(elemFromPoint(rect.left, rect.top))
            || element.contains(elemFromPoint(rect.right, rect.top))
            || element.contains(elemFromPoint(rect.right, rect.bottom))
            || element.contains(elemFromPoint(rect.left, rect.bottom))
        );
    }

    return function (selector, config) {
        var
            _mainElement = document.querySelector(selector), // основный элемент блока
            _sliderWrapper = _mainElement.querySelector('.slider__wrapper'), // обертка для .slider-item
            _sliderItems = _mainElement.querySelectorAll('.slider__item'), // элементы (.slider-item)
            _sliderControls = _mainElement.querySelectorAll('.slider__control'), // элементы управления
            _sliderControlLeft = _mainElement.querySelector('.slider__control_left'), // кнопка "LEFT"
            _sliderControlRight = _mainElement.querySelector('.slider__control_right'), // кнопка "RIGHT"
            _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width), // ширина обёртки
            _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width), // ширина одного элемента    
            _positionLeftItem = 0, // позиция левого активного элемента
            _transform = 0, // значение транфсофрмации .slider_wrapper
            _step = _itemWidth / _wrapperWidth * 100, // величина шага (для трансформации)
            _items = [], // массив элементов
            _interval = 0,
            _html = _mainElement.innerHTML,
            _states = [
                { active: false, minWidth: 0, count: 1 },
                { active: false, minWidth: 980, count: 2 }
            ],
            _config = {
                isCycling: false, // автоматическая смена слайдов
                direction: 'right', // направление смены слайдов
                interval: 30000, // интервал между автоматической сменой слайдов
                pause: true // устанавливать ли паузу при поднесении курсора к слайдеру
            };

        for (var key in config) {
            if (key in _config) {
                _config[key] = config[key];
            }
        }

        // наполнение массива _items
        _sliderItems.forEach(function (item, index) {
            _items.push({ item: item, position: index, transform: 0 });
        });

        var _setActive = function () {
            var _index = 0;
            var width = parseFloat(document.body.clientWidth);
            _states.forEach(function (item, index, arr) {
                _states[index].active = false;
                if (width >= _states[index].minWidth)
                    _index = index;
            });
            _states[_index].active = true;
        }

        var _getActive = function () {
            var _index;
            _states.forEach(function (item, index, arr) {
                if (_states[index].active) {
                    _index = index;
                }
            });
            return _index;
        }

        var position = {
            getItemMin: function () {
                var indexItem = 0;
                _items.forEach(function (item, index) {
                    if (item.position < _items[indexItem].position) {
                        indexItem = index;
                    }
                });
                return indexItem;
            },
            getItemMax: function () {
                var indexItem = 0;
                _items.forEach(function (item, index) {
                    if (item.position > _items[indexItem].position) {
                        indexItem = index;
                    }
                });
                return indexItem;
            },
            getMin: function () {
                return _items[position.getItemMin()].position;
            },
            getMax: function () {
                return _items[position.getItemMax()].position;
            }
        }

        var _transformItem = function (direction) {
            var nextItem;
            if (!_isElementVisible(_mainElement)) {
                return;
            }
            if (direction === 'right') {
                _positionLeftItem++;
                if ((_positionLeftItem + _wrapperWidth / _itemWidth - 1) > position.getMax()) {
                    nextItem = position.getItemMin();
                    _items[nextItem].position = position.getMax() + 1;
                    _items[nextItem].transform += _items.length * 100;
                    _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
                }
                _transform -= _step;
            }
            if (direction === 'left') {
                _positionLeftItem--;
                if (_positionLeftItem < position.getMin()) {
                    nextItem = position.getItemMax();
                    _items[nextItem].position = position.getMin() - 1;
                    _items[nextItem].transform -= _items.length * 100;
                    _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
                }
                _transform += _step;
            }
            _sliderWrapper.style.transform = 'translateX(' + _transform + '%)';
            document.getElementById("slider_section").classList.toggle('slider_blue');
        }

        var _cycle = function (direction) {
            if (!_config.isCycling) {
                return;
            }
            _interval = setInterval(function () {
                _transformItem(direction);
            }, _config.interval);
        }

        // обработчик события click для кнопок "назад" и "вперед"
        var _controlClick = function (e) {
            if (e.target.classList.contains('slider__control')) {
                e.preventDefault();
                var direction = e.target.classList.contains('slider__control_right') ? 'right' : 'left';
                _transformItem(direction);
                clearInterval(_interval);
                _cycle(_config.direction);
            }
        };

        // обработка события изменения видимости страницы

        var _handleVisibilityChange = function () {
            if (document.visibilityState === "hidden") {
                clearInterval(_interval);
            } else {
                clearInterval(_interval);
                _cycle(_config.direction);
            }
        }

        var _refresh = function () {
            clearInterval(_interval);
            _mainElement.innerHTML = _html;
            _sliderWrapper = _mainElement.querySelector('.slider__wrapper');
            _sliderItems = _mainElement.querySelectorAll('.slider__item');
            _sliderControls = _mainElement.querySelectorAll('.slider__control');
            _sliderControlLeft = _mainElement.querySelector('.slider__control_left');
            _sliderControlRight = _mainElement.querySelector('.slider__control_right');
            _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width);
            _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width);
            _positionLeftItem = 0;
            _transform = 0;
            _step = _itemWidth / _wrapperWidth * 100;
            _items = [];
            _sliderItems.forEach(function (item, index) {
                _items.push({ item: item, position: index, transform: 0 });
            });
        }

        var _setUpListeners = function () {
            _mainElement.addEventListener('click', _controlClick);
            if (_config.pause && _config.isCycling) {
                _mainElement.addEventListener('mouseenter', function () {
                    clearInterval(_interval);
                });
                _mainElement.addEventListener('mouseleave', function () {
                    clearInterval(_interval);
                    _cycle(_config.direction);
                });
            }
            document.addEventListener('visibilitychange', _handleVisibilityChange, false);
            window.addEventListener('resize', function () {
                var
                    _index = 0,
                    width = parseFloat(document.body.clientWidth);
                _states.forEach(function (item, index, arr) {
                    if (width >= _states[index].minWidth)
                        _index = index;
                });
                if (_index !== _getActive()) {
                    _setActive();
                    _refresh();
                }
            });
        }

        // инициализация
        _setUpListeners();
        if (document.visibilityState === "visible") {
            _cycle(_config.direction);
        }
        _setActive();

        return {
            right: function () { // метод right
                _transformItem('right');
            },
            left: function () { // метод left
                _transformItem('left');
            },
            stop: function () { // метод stop
                _config.isCycling = false;
                clearInterval(_interval);
            },
            cycle: function () { // метод cycle 
                _config.isCycling = true;
                clearInterval(_interval);
                _cycle();
            }
        }
    }
}());

var slider = multiItemSlider('.slider', {
    isCycling: true
})
*/
const arrowLeft = document.querySelector('.slider__control_left');
const arrowRight = document.querySelector('.slider__control_right');
const sliderLine = document.querySelector('.slider__wrapper');
const images = document.querySelectorAll('.slider__item');

let counter = 0;
images[counter].style.display = 'block';
arrowRight.addEventListener('click', () => {
    let nextIndex = counter + 1;

    if (nextIndex >= images.length) {
        nextIndex = 0;
    }

    const next = images[nextIndex];
    sliderLine.append(next);
    next.style.display = 'block';
    next.style.animation = 'moveRight 1s';
    document.getElementById("slider_section").classList.toggle('slider_blue');

    counter += 1;
    if (counter >= images.length) {
        counter = 0;
    }
});

arrowLeft.addEventListener('click', () => {
    let prevIndex = counter - 1;

    if (prevIndex < 0) {
        prevIndex = images.length - 1;
    }

    const prev = images[prevIndex];
    sliderLine.append(prev);
    prev.style.display = 'block';
    prev.style.animation = 'moveLeft 1s';
    document.getElementById("slider_section").classList.toggle('slider_blue');

    counter -= 1;
    if (counter < 0) {
        counter = images.length - 1;
    }
});

//mobile menu button
const menuBtn = document.getElementById('menu_btn');
menuBtn.addEventListener("click", () => {
    document.getElementById("header_nav").classList.toggle('visible');
    menuBtn.classList.toggle('rotate_btn');
    document.getElementById("logo_2").classList.toggle('visible');
    document.getElementById("shadow").classList.toggle('visible');
});



//hide-show burger-menu from tap on menu-shadow
const shadowMenu = document.getElementById("shadow");
shadowMenu.addEventListener('click', () => {
    document.getElementById("header_nav").classList.toggle('visible');
    menuBtn.classList.toggle('rotate_btn');
    document.getElementById("logo_2").classList.toggle('visible');
    document.getElementById("shadow").classList.toggle('visible');
});




const home = document.getElementById("link_home");
const services = document.getElementById("link_services");
const portfolio = document.getElementById("link_portfolio");
const about = document.getElementById("link_about");
const contact = document.getElementById("link_contact");


home.addEventListener("click", () => {
    home.classList.add("red_menu");
    services.classList.remove("red_menu");
    portfolio.classList.remove("red_menu");
    about.classList.remove("red_menu");
    contact.classList.remove("red_menu");
});
services.addEventListener("click", () => {
    services.classList.add("red_menu");
    home.classList.remove("red_menu");
    portfolio.classList.remove("red_menu");
    about.classList.remove("red_menu");
    contact.classList.remove("red_menu");
});
portfolio.addEventListener("click", () => {
    portfolio.classList.add("red_menu");
    home.classList.remove("red_menu");
    services.classList.remove("red_menu");
    about.classList.remove("red_menu");
    contact.classList.remove("red_menu");
});
about.addEventListener("click", () => {
    //about.preventDefault();
    contact.classList.remove("red_menu");
    home.classList.remove("red_menu");
    portfolio.classList.remove("red_menu");
    about.classList.add("red_menu");
    services.classList.remove("red_menu");
});
contact.addEventListener("click", () => {
    contact.classList.add("red_menu");
    home.classList.remove("red_menu");
    portfolio.classList.remove("red_menu");
    about.classList.remove("red_menu");
    services.classList.remove("red_menu");
});


//smooth scroll and hide-show burger-menu
var offsetFixHeader;
if (window.screen.availWidth > 768) {
    offsetFixHeader = 95;
}
else
    offsetFixHeader = 70;
const smoothLinks = document.querySelectorAll('a[href^="#Link"]');
for (let smoothLink of smoothLinks) {
    smoothLink.addEventListener('click', function (e) {
        e.preventDefault();
        const id = smoothLink.getAttribute('href');
        var scrollTopCoordinate = document.querySelector(id).getBoundingClientRect().top - offsetFixHeader;
        window.scrollBy({ top: scrollTopCoordinate, behavior: 'smooth' });
        //hide-show burger-menu
        document.getElementById("header_nav").classList.toggle('visible');
        menuBtn.classList.toggle('rotate_btn');
        document.getElementById("logo_2").classList.toggle('visible');
        document.getElementById("shadow").classList.toggle('visible');
    });
};


window.addEventListener("wheel", () => {
    let scrollServiceY = document.querySelector('#Link_services').getBoundingClientRect().top + window.pageYOffset - offsetFixHeader;
    let scrollPortfolioY = document.querySelector('#Link_portfolio').getBoundingClientRect().top + window.pageYOffset - offsetFixHeader;
    let scrollFooterY = document.querySelector('#Link_footer').getBoundingClientRect().top + window.pageYOffset - offsetFixHeader;
    if (window.pageYOffset >= 0 && window.pageYOffset < scrollServiceY) {
        home.classList.add("red_menu");
        services.classList.remove("red_menu");
        portfolio.classList.remove("red_menu");
        contact.classList.remove("red_menu");
    } else if (window.pageYOffset >= scrollServiceY && window.pageYOffset < scrollPortfolioY) {
        services.classList.add("red_menu");
        home.classList.remove("red_menu");
        portfolio.classList.remove("red_menu");
        contact.classList.remove("red_menu");
    } else if (window.pageYOffset >= scrollPortfolioY && window.pageYOffset < scrollFooterY) {
        services.classList.remove("red_menu");
        home.classList.remove("red_menu");
        portfolio.classList.add("red_menu");
        contact.classList.remove("red_menu");
    }
});


const portfolioTabs = document.querySelectorAll('.filter_link');
const portfilioPictures = document.querySelectorAll('.img_portfolio');
const portfilioPicturesCount = portfilioPictures.length;

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));


for (const element of portfolioTabs) {
    element.addEventListener('click', (event) => {
        event.preventDefault();
        for (const element of portfilioPictures) {
            element.style.order = `${getRandomInt(portfilioPicturesCount)}`;
        }
    });
}