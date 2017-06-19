(function () {
	'use strict';

	var menuIconElement = document.querySelector('.mdl-layout__drawer-button');
	var menuItems = document.querySelectorAll('.mdl-layout__drawer nav a.mdl-navigation__link');
	var menuOverlayElement = document.querySelector('.menu__overlay');
	var menuElement = document.getElementById('drawer');
	var drawerElement = document.getElementsByClassName('mdl-layout__drawer')[0];
	var drawerObfuscatorElement = document.getElementsByClassName('mdl-layout__obfuscator')[0];
	
	var settings_button = document.querySelector('#settings_button');
	var signup_button = document.querySelector('#signup_button');
	var login_button = document.querySelector('#login_button');
	var profile_button = document.querySelector('#profile_button');
	
	var fab_btn  = document.querySelectorAll('.fab_btn');
	var fab_ctn  = document.querySelectorAll('.fab_ctn');
    var VISIBLE_CLASS = 'is-showing-options';
	var menu = false;

	// Menu
	for (var item in menuItems) {
		if ( menuItems[item].childElementCount > -1 ) {
			(menuItems[item]).addEventListener('click', setTab, false);
		}
	};
	//menuIconElement.addEventListener('click', showMenu, {passive: true});
	menuOverlayElement.addEventListener('click', hideMenu, {passive: true});
	menuElement.addEventListener('transitionend', onTransitionEnd, {passive: true});
	
	settings_button.addEventListener('click', setTab, false);
	login_button.addEventListener('click', setTab, false);
	signup_button.addEventListener('click', setTab, false);
	profile_button.addEventListener('click', setTab, false);

	function setTab(evt) {
		window.scrollTo(0, 0);
		var href = evt.target.getAttribute('hash')!==null?evt.target.getAttribute('hash'):evt.target.getAttribute('href');
		var tabId = (href).substr(1);
		hideAllTabs();
		var tabs = document.querySelectorAll('.mdl-layout__tab-bar a[href="#'+tabId+'"]');
		for (var t in tabs) {
			if ( (tabs[t]).childElementCount > -1 ) {
				(tabs[t]).classList.add('is-active');
			}
		}
		document.querySelector('section.is-active').classList.remove('is-active');
		document.querySelector('section#'+tabId).classList.add('is-active');        
		menuElement.style.transform = "translateX(-110%)";
		hideMenu();        
		return false;
	}

	function hideAllTabs() {
		//console.log('hideAllTabs');
		var tabs = document.querySelectorAll('.mdl-layout__tab-bar a.is-active');
		for (var t in tabs) {
			if ( (tabs[t]).childElementCount > -1 ) {
				(tabs[t]).classList.remove('is-active');
			}
		}
	}

	// show menu
	function showMenu() {
		//console.log('showMenu');
		drawerElement = document.getElementsByClassName('mdl-layout__drawer')[0];
		drawerObfuscatorElement = document.getElementsByClassName('mdl-layout__obfuscator')[0];
		//menuElement = document.getElementsByClassName('mdl-layout__drawer')[0];
		menuElement = document.getElementById('drawer');
		menuOverlayElement = document.querySelector('.menu__overlay');
		
		//menuElement.style.transform = "translateX(0%)";
		menuElement.classList.add('menu--show');
		//menuOverlayElement.classList.add('is-visible');
		menuOverlayElement.classList.add('menu__overlay--show');
		
		//drawerElement.classList.add("is-visible");
		drawerObfuscatorElement.classList.add("is-visible");
		menuElement.setAttribute("aria-hidden", "false");
	}

	// hide menu
	function hideMenu() {
		//console.log('hideMenu');
		drawerElement = document.getElementsByClassName('mdl-layout__drawer')[0];
		drawerObfuscatorElement = document.getElementsByClassName('mdl-layout__obfuscator')[0];
		//menuElement = document.getElementsByClassName('mdl-layout__drawer')[0];
		menuElement = document.getElementById('drawer');
		menuOverlayElement = document.querySelector('.menu__overlay');
		
		//menuElement.style.transform = "translateX(-110%)";
		menuElement.classList.remove('menu--show');
		//menuOverlayElement.classList.remove('is-visible');
		menuOverlayElement.classList.remove('menu__overlay--show');
		
		drawerElement.classList.remove("is-visible");
	    drawerObfuscatorElement.classList.remove("is-visible");
		menuElement.setAttribute("aria-hidden", "true");
	}

	var touchStartPoint, touchMovePoint;
	/* Swipe from edge to open menu */
	//`TouchStart` event to find where user start the touch
	document.body.addEventListener('touchstart', function(event) {
		touchStartPoint = event.changedTouches[0].pageX;
		touchMovePoint = touchStartPoint;
	}, {passive: true});

	//`TouchMove` event to determine user touch movement
	document.body.addEventListener('touchmove', function(event) {
		touchMovePoint = event.touches[0].pageX;
		if (touchStartPoint < 10 && touchMovePoint > 30) {          
			menuElement.style.transform = "translateX(0)";
			//showMenu();
		}
	}, {passive: true});

	function onTransitionEnd() {
		if (touchStartPoint < 10) {
			//menuElement.style.transform = "translateX(0)";
			menuOverlayElement.classList.add('menu__overlay--show');
			menuElement.removeEventListener('transitionend', onTransitionEnd, {passive: true}); 
			//showMenu();
		}
	}

	(function () {
	    var VISIBLE_CLASS = 'is-showing-options',
	        fab_btn  = document.getElementById('fab_btn'),
	        fab_ctn  = document.getElementById('fab_ctn'),
	        showOpts = function(e) {
	          var processClick = function (evt) {
	            if (e !== evt) {
	              fab_ctn.classList.remove(VISIBLE_CLASS);
	              fab_ctn.IS_SHOWING = false;
	              document.removeEventListener('click', processClick);
	            }
	          };
	          if (!fab_ctn.IS_SHOWING) {
	            fab_ctn.IS_SHOWING = true;
	            fab_ctn.classList.add(VISIBLE_CLASS);
	            document.addEventListener('click', processClick);
	          }
	        };
	    fab_btn.addEventListener('click', showOpts);
	}.call(this));
})();