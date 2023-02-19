!function(){"use strict";var e={upgradeDom:function(e,t){},upgradeElement:function(e,t){},upgradeElements:function(e){},upgradeAllRegistered:function(){},registerUpgradedCallback:function(e,t){},
register:function(e){},downgradeElements:function(e){}};(e=function(){var e=[],t=[],s="mdlComponentConfigInternal_";function i(t,s){
for(var i=0;i<e.length;i++)if(e[i].className===t)return void 0!==s&&(e[i]=s),e[i];return!1}function n(e){var t=e.getAttribute("data-upgraded");return null===t?[""]:t.split(",")}function a(e,t){
return-1!==n(e).indexOf(t)}function l(e,t,s){if("CustomEvent"in window&&"function"==typeof window.CustomEvent)return new CustomEvent(e,{bubbles:t,cancelable:s});var i=document.createEvent("Events")
;return i.initEvent(e,t,s),i}function o(t,s){if(void 0===t&&void 0===s)for(var n=0;n<e.length;n++)o(e[n].className,e[n].cssClass);else{var a=t;if(void 0===s){var l=i(a);l&&(s=l.cssClass)}
for(var d=document.querySelectorAll("."+s),c=0;c<d.length;c++)r(d[c],a)}}function r(o,r){
if(!("object"==typeof o&&o instanceof Element))throw new Error("Invalid argument provided to upgrade MDL element.");var d=l("mdl-componentupgrading",!0,!0);if(o.dispatchEvent(d),!d.defaultPrevented){
var c=n(o),h=[];if(r)a(o,r)||h.push(i(r));else{var _=o.classList;e.forEach(function(e){_.contains(e.cssClass)&&-1===h.indexOf(e)&&!a(o,e.className)&&h.push(e)})}for(var p,u=0,m=h.length;u<m;u++){
if(!(p=h[u]))throw new Error("Unable to find a registered component for the given class.");c.push(p.className),o.setAttribute("data-upgraded",c.join(","));var E=new p.classConstructor(o);E[s]=p,
t.push(E);for(var C=0,f=p.callbacks.length;C<f;C++)p.callbacks[C](o);p.widget&&(o[p.className]=E);var b=l("mdl-componentupgraded",!0,!1);o.dispatchEvent(b)}}}function d(e){if(e){var i=t.indexOf(e)
;t.splice(i,1);var n=e.element_.getAttribute("data-upgraded").split(","),a=n.indexOf(e[s].classAsString);n.splice(a,1),e.element_.setAttribute("data-upgraded",n.join(","))
;var o=l("mdl-componentdowngraded",!0,!1);e.element_.dispatchEvent(o)}}return{upgradeDom:o,upgradeElement:r,upgradeElements:function e(t){
Array.isArray(t)||(t=t instanceof Element?[t]:Array.prototype.slice.call(t));for(var s,i=0,n=t.length;i<n;i++)(s=t[i])instanceof HTMLElement&&(r(s),s.children.length>0&&e(s.children))},
upgradeAllRegistered:function(){for(var t=0;t<e.length;t++)o(e[t].className)},registerUpgradedCallback:function(e,t){var s=i(e);s&&s.callbacks.push(t)},register:function(t){var n=!0
;void 0===t.widget&&void 0===t.widget||(n=t.widget||t.widget);var a={classConstructor:t.constructor||t.constructor,className:t.classAsString||t.classAsString,cssClass:t.cssClass||t.cssClass,widget:n,
callbacks:[]};if(e.forEach(function(e){if(e.cssClass===a.cssClass)throw new Error("The provided cssClass has already been registered: "+e.cssClass)
;if(e.className===a.className)throw new Error("The provided className has already been registered")}),
t.constructor.prototype.hasOwnProperty(s))throw new Error("MDL component classes must not have "+s+" defined as a property.");i(t.classAsString,a)||e.push(a)},downgradeElements:function(e){
var s=function(e){t.filter(function(t){return t.element_===e}).forEach(d)};if(e instanceof Array||e instanceof NodeList)for(var i=0;i<e.length;i++)s(e[i]);else{
if(!(e instanceof Node))throw new Error("Invalid argument provided to downgrade MDL nodes.");s(e)}}}}()).ComponentConfigPublic,e.ComponentConfig,e.Component,e.upgradeDom=e.upgradeDom,
e.upgradeElement=e.upgradeElement,e.upgradeElements=e.upgradeElements,e.upgradeAllRegistered=e.upgradeAllRegistered,e.registerUpgradedCallback=e.registerUpgradedCallback,e.register=e.register,
e.downgradeElements=e.downgradeElements,window.componentHandler=e,window.componentHandler=e,window.addEventListener("load",function(){
"classList"in document.createElement("div")&&"querySelector"in document&&"addEventListener"in window&&Array.prototype.forEach?(document.documentElement.classList.add("mdl-js"),
e.upgradeAllRegistered()):(e.upgradeElement=function(){},e.register=function(){})}),Date.now||(Date.now=function(){return(new Date).getTime()},Date.now=Date.now)
;for(var t=["webkit","moz"],s=0;s<t.length&&!window.requestAnimationFrame;++s){var i=t[s];window.requestAnimationFrame=window[i+"RequestAnimationFrame"],
window.cancelAnimationFrame=window[i+"CancelAnimationFrame"]||window[i+"CancelRequestAnimationFrame"],window.requestAnimationFrame=window.requestAnimationFrame,
window.cancelAnimationFrame=window.cancelAnimationFrame}if(/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)||!window.requestAnimationFrame||!window.cancelAnimationFrame){var n=0
;window.requestAnimationFrame=function(e){var t=Date.now(),s=Math.max(n+16,t);return setTimeout(function(){e(n=s)},s-t)},window.cancelAnimationFrame=clearTimeout,
window.requestAnimationFrame=window.requestAnimationFrame,window.cancelAnimationFrame=window.cancelAnimationFrame}var a=function(e){this.element_=e,this.init()};window.MaterialButton=a,
a.prototype.Constant_={},a.prototype.CssClasses_={RIPPLE_EFFECT:"mdl-js-ripple-effect",RIPPLE_CONTAINER:"mdl-button__ripple-container",RIPPLE:"mdl-ripple"},a.prototype.blurHandler_=function(e){
e&&this.element_.blur()},a.prototype.disable=function(){this.element_.disabled=!0},a.prototype.disable=a.prototype.disable,a.prototype.enable=function(){this.element_.disabled=!1},
a.prototype.enable=a.prototype.enable,a.prototype.init=function(){if(this.element_){if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){var e=document.createElement("span")
;e.classList.add(this.CssClasses_.RIPPLE_CONTAINER),this.rippleElement_=document.createElement("span"),this.rippleElement_.classList.add(this.CssClasses_.RIPPLE),e.appendChild(this.rippleElement_),
this.boundRippleBlurHandler=this.blurHandler_.bind(this),this.rippleElement_.addEventListener("mouseup",this.boundRippleBlurHandler),this.element_.appendChild(e)}
this.boundButtonBlurHandler=this.blurHandler_.bind(this),this.element_.addEventListener("mouseup",this.boundButtonBlurHandler),this.element_.addEventListener("mouseleave",this.boundButtonBlurHandler)}
},e.register({constructor:a,classAsString:"MaterialButton",cssClass:"mdl-js-button",widget:!0});var l=function(e){this.element_=e,this.init()};window.MaterialCheckbox=l,l.prototype.Constant_={
TINY_TIMEOUT:.001},l.prototype.CssClasses_={INPUT:"mdl-checkbox__input",BOX_OUTLINE:"mdl-checkbox__box-outline",FOCUS_HELPER:"mdl-checkbox__focus-helper",TICK_OUTLINE:"mdl-checkbox__tick-outline",
RIPPLE_EFFECT:"mdl-js-ripple-effect",RIPPLE_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events",RIPPLE_CONTAINER:"mdl-checkbox__ripple-container",RIPPLE_CENTER:"mdl-ripple--center",
RIPPLE:"mdl-ripple",IS_FOCUSED:"is-focused",IS_DISABLED:"is-disabled",IS_CHECKED:"is-checked",IS_UPGRADED:"is-upgraded"},l.prototype.onChange_=function(e){this.updateClasses_()},
l.prototype.onFocus_=function(e){this.element_.classList.add(this.CssClasses_.IS_FOCUSED)},l.prototype.onBlur_=function(e){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)},
l.prototype.onMouseUp_=function(e){this.blur_()},l.prototype.updateClasses_=function(){this.checkDisabled(),this.checkToggleState()},l.prototype.blur_=function(){window.setTimeout(function(){
this.inputElement_.blur()}.bind(this),this.Constant_.TINY_TIMEOUT)},l.prototype.checkToggleState=function(){
this.inputElement_.checked?this.element_.classList.add(this.CssClasses_.IS_CHECKED):this.element_.classList.remove(this.CssClasses_.IS_CHECKED)},
l.prototype.checkToggleState=l.prototype.checkToggleState,l.prototype.checkDisabled=function(){
this.inputElement_.disabled?this.element_.classList.add(this.CssClasses_.IS_DISABLED):this.element_.classList.remove(this.CssClasses_.IS_DISABLED)},l.prototype.checkDisabled=l.prototype.checkDisabled,
l.prototype.disable=function(){this.inputElement_.disabled=!0,this.updateClasses_()},l.prototype.disable=l.prototype.disable,l.prototype.enable=function(){this.inputElement_.disabled=!1,
this.updateClasses_()},l.prototype.enable=l.prototype.enable,l.prototype.check=function(){this.inputElement_.checked=!0,this.updateClasses_()},l.prototype.check=l.prototype.check,
l.prototype.uncheck=function(){this.inputElement_.checked=!1,this.updateClasses_()},l.prototype.uncheck=l.prototype.uncheck,l.prototype.init=function(){if(this.element_){
this.inputElement_=this.element_.querySelector("."+this.CssClasses_.INPUT);var e=document.createElement("span");e.classList.add(this.CssClasses_.BOX_OUTLINE);var t=document.createElement("span")
;t.classList.add(this.CssClasses_.FOCUS_HELPER);var s=document.createElement("span");if(s.classList.add(this.CssClasses_.TICK_OUTLINE),e.appendChild(s),this.element_.appendChild(t),
this.element_.appendChild(e),this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),
this.rippleContainerElement_=document.createElement("span"),this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER),
this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT),this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER),
this.boundRippleMouseUp=this.onMouseUp_.bind(this),this.rippleContainerElement_.addEventListener("mouseup",this.boundRippleMouseUp);var i=document.createElement("span")
;i.classList.add(this.CssClasses_.RIPPLE),this.rippleContainerElement_.appendChild(i),this.element_.appendChild(this.rippleContainerElement_)}this.boundInputOnChange=this.onChange_.bind(this),
this.boundInputOnFocus=this.onFocus_.bind(this),this.boundInputOnBlur=this.onBlur_.bind(this),this.boundElementMouseUp=this.onMouseUp_.bind(this),
this.inputElement_.addEventListener("change",this.boundInputOnChange),this.inputElement_.addEventListener("focus",this.boundInputOnFocus),
this.inputElement_.addEventListener("blur",this.boundInputOnBlur),this.element_.addEventListener("mouseup",this.boundElementMouseUp),this.updateClasses_(),
this.element_.classList.add(this.CssClasses_.IS_UPGRADED)}},e.register({constructor:l,classAsString:"MaterialCheckbox",cssClass:"mdl-js-checkbox",widget:!0});var o=function(e){this.element_=e,
this.init()};window.MaterialIconToggle=o,o.prototype.Constant_={TINY_TIMEOUT:.001},o.prototype.CssClasses_={INPUT:"mdl-icon-toggle__input",JS_RIPPLE_EFFECT:"mdl-js-ripple-effect",
RIPPLE_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events",RIPPLE_CONTAINER:"mdl-icon-toggle__ripple-container",RIPPLE_CENTER:"mdl-ripple--center",RIPPLE:"mdl-ripple",IS_FOCUSED:"is-focused",
IS_DISABLED:"is-disabled",IS_CHECKED:"is-checked"},o.prototype.onChange_=function(e){this.updateClasses_()},o.prototype.onFocus_=function(e){this.element_.classList.add(this.CssClasses_.IS_FOCUSED)},
o.prototype.onBlur_=function(e){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)},o.prototype.onMouseUp_=function(e){this.blur_()},o.prototype.updateClasses_=function(){
this.checkDisabled(),this.checkToggleState()},o.prototype.blur_=function(){window.setTimeout(function(){this.inputElement_.blur()}.bind(this),this.Constant_.TINY_TIMEOUT)},
o.prototype.checkToggleState=function(){this.inputElement_.checked?this.element_.classList.add(this.CssClasses_.IS_CHECKED):this.element_.classList.remove(this.CssClasses_.IS_CHECKED)},
o.prototype.checkToggleState=o.prototype.checkToggleState,o.prototype.checkDisabled=function(){
this.inputElement_.disabled?this.element_.classList.add(this.CssClasses_.IS_DISABLED):this.element_.classList.remove(this.CssClasses_.IS_DISABLED)},o.prototype.checkDisabled=o.prototype.checkDisabled,
o.prototype.disable=function(){this.inputElement_.disabled=!0,this.updateClasses_()},o.prototype.disable=o.prototype.disable,o.prototype.enable=function(){this.inputElement_.disabled=!1,
this.updateClasses_()},o.prototype.enable=o.prototype.enable,o.prototype.check=function(){this.inputElement_.checked=!0,this.updateClasses_()},o.prototype.check=o.prototype.check,
o.prototype.uncheck=function(){this.inputElement_.checked=!1,this.updateClasses_()},o.prototype.uncheck=o.prototype.uncheck,o.prototype.init=function(){if(this.element_){
if(this.inputElement_=this.element_.querySelector("."+this.CssClasses_.INPUT),this.element_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)){
this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),this.rippleContainerElement_=document.createElement("span"),
this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER),this.rippleContainerElement_.classList.add(this.CssClasses_.JS_RIPPLE_EFFECT),
this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER),this.boundRippleMouseUp=this.onMouseUp_.bind(this),
this.rippleContainerElement_.addEventListener("mouseup",this.boundRippleMouseUp);var e=document.createElement("span");e.classList.add(this.CssClasses_.RIPPLE),
this.rippleContainerElement_.appendChild(e),this.element_.appendChild(this.rippleContainerElement_)}this.boundInputOnChange=this.onChange_.bind(this),this.boundInputOnFocus=this.onFocus_.bind(this),
this.boundInputOnBlur=this.onBlur_.bind(this),this.boundElementOnMouseUp=this.onMouseUp_.bind(this),this.inputElement_.addEventListener("change",this.boundInputOnChange),
this.inputElement_.addEventListener("focus",this.boundInputOnFocus),this.inputElement_.addEventListener("blur",this.boundInputOnBlur),
this.element_.addEventListener("mouseup",this.boundElementOnMouseUp),this.updateClasses_(),this.element_.classList.add("is-upgraded")}},e.register({constructor:o,classAsString:"MaterialIconToggle",
cssClass:"mdl-js-icon-toggle",widget:!0});var r=function(e){this.element_=e,this.init()};window.MaterialMenu=r,r.prototype.Constant_={TRANSITION_DURATION_SECONDS:.3,TRANSITION_DURATION_FRACTION:.8,
CLOSE_TIMEOUT:150},r.prototype.Keycodes_={ENTER:13,ESCAPE:27,SPACE:32,UP_ARROW:38,DOWN_ARROW:40},r.prototype.CssClasses_={CONTAINER:"mdl-menu__container",OUTLINE:"mdl-menu__outline",
ITEM:"mdl-menu__item",ITEM_RIPPLE_CONTAINER:"mdl-menu__item-ripple-container",RIPPLE_EFFECT:"mdl-js-ripple-effect",RIPPLE_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events",RIPPLE:"mdl-ripple",
IS_UPGRADED:"is-upgraded",IS_VISIBLE:"is-visible",IS_ANIMATING:"is-animating",BOTTOM_LEFT:"mdl-menu--bottom-left",BOTTOM_RIGHT:"mdl-menu--bottom-right",TOP_LEFT:"mdl-menu--top-left",
TOP_RIGHT:"mdl-menu--top-right",UNALIGNED:"mdl-menu--unaligned"},r.prototype.init=function(){if(this.element_){var e=document.createElement("div");e.classList.add(this.CssClasses_.CONTAINER),
this.element_.parentElement.insertBefore(e,this.element_),this.element_.parentElement.removeChild(this.element_),e.appendChild(this.element_),this.container_=e;var t=document.createElement("div")
;t.classList.add(this.CssClasses_.OUTLINE),this.outline_=t,e.insertBefore(t,this.element_);var s=this.element_.getAttribute("for")||this.element_.getAttribute("data-mdl-for"),i=null
;s&&(i=document.getElementById(s))&&(this.forElement_=i,i.addEventListener("click",this.handleForClick_.bind(this)),i.addEventListener("keydown",this.handleForKeyboardEvent_.bind(this)))
;var n=this.element_.querySelectorAll("."+this.CssClasses_.ITEM);this.boundItemKeydown_=this.handleItemKeyboardEvent_.bind(this),this.boundItemClick_=this.handleItemClick_.bind(this)
;for(var a=0;a<n.length;a++)n[a].addEventListener("click",this.boundItemClick_),n[a].tabIndex="-1",n[a].addEventListener("keydown",this.boundItemKeydown_)
;if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT))for(this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),a=0;a<n.length;a++){
var l=n[a],o=document.createElement("span");o.classList.add(this.CssClasses_.ITEM_RIPPLE_CONTAINER);var r=document.createElement("span");r.classList.add(this.CssClasses_.RIPPLE),o.appendChild(r),
l.appendChild(o),l.classList.add(this.CssClasses_.RIPPLE_EFFECT)}this.element_.classList.contains(this.CssClasses_.BOTTOM_LEFT)&&this.outline_.classList.add(this.CssClasses_.BOTTOM_LEFT),
this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)&&this.outline_.classList.add(this.CssClasses_.BOTTOM_RIGHT),
this.element_.classList.contains(this.CssClasses_.TOP_LEFT)&&this.outline_.classList.add(this.CssClasses_.TOP_LEFT),
this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)&&this.outline_.classList.add(this.CssClasses_.TOP_RIGHT),
this.element_.classList.contains(this.CssClasses_.UNALIGNED)&&this.outline_.classList.add(this.CssClasses_.UNALIGNED),e.classList.add(this.CssClasses_.IS_UPGRADED)}},
r.prototype.handleForClick_=function(e){if(this.element_&&this.forElement_){var t=this.forElement_.getBoundingClientRect(),s=this.forElement_.parentElement.getBoundingClientRect()
;this.element_.classList.contains(this.CssClasses_.UNALIGNED)||(this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)?(this.container_.style.right=s.right-t.right+"px",
this.container_.style.top=this.forElement_.offsetTop+this.forElement_.offsetHeight+"px"):this.element_.classList.contains(this.CssClasses_.TOP_LEFT)?(this.container_.style.left=this.forElement_.offsetLeft+"px",
this.container_.style.bottom=s.bottom-t.top+"px"):this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)?(this.container_.style.right=s.right-t.right+"px",
this.container_.style.bottom=s.bottom-t.top+"px"):(this.container_.style.left=this.forElement_.offsetLeft+"px",this.container_.style.top=this.forElement_.offsetTop+this.forElement_.offsetHeight+"px"))
}this.toggle(e)},r.prototype.handleForKeyboardEvent_=function(e){if(this.element_&&this.container_&&this.forElement_){var t=this.element_.querySelectorAll("."+this.CssClasses_.ITEM+":not([disabled])")
;t&&t.length>0&&this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)&&(e.keyCode===this.Keycodes_.UP_ARROW?(e.preventDefault(),
t[t.length-1].focus()):e.keyCode===this.Keycodes_.DOWN_ARROW&&(e.preventDefault(),t[0].focus()))}},r.prototype.handleItemKeyboardEvent_=function(e){if(this.element_&&this.container_){
var t=this.element_.querySelectorAll("."+this.CssClasses_.ITEM+":not([disabled])");if(t&&t.length>0&&this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)){
var s=Array.prototype.slice.call(t).indexOf(e.target);if(e.keyCode===this.Keycodes_.UP_ARROW)e.preventDefault(),
s>0?t[s-1].focus():t[t.length-1].focus();else if(e.keyCode===this.Keycodes_.DOWN_ARROW)e.preventDefault(),
t.length>s+1?t[s+1].focus():t[0].focus();else if(e.keyCode===this.Keycodes_.SPACE||e.keyCode===this.Keycodes_.ENTER){e.preventDefault();var i=new MouseEvent("mousedown");e.target.dispatchEvent(i),
i=new MouseEvent("mouseup"),e.target.dispatchEvent(i),e.target.click()}else e.keyCode===this.Keycodes_.ESCAPE&&(e.preventDefault(),this.hide())}}},r.prototype.handleItemClick_=function(e){
e.target.hasAttribute("disabled")?e.stopPropagation():(this.closing_=!0,window.setTimeout(function(e){this.hide(),this.closing_=!1}.bind(this),this.Constant_.CLOSE_TIMEOUT))},
r.prototype.applyClip_=function(e,t){
this.element_.classList.contains(this.CssClasses_.UNALIGNED)?this.element_.style.clip="":this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)?this.element_.style.clip="rect(0 "+t+"px 0 "+t+"px)":this.element_.classList.contains(this.CssClasses_.TOP_LEFT)?this.element_.style.clip="rect("+e+"px 0 "+e+"px 0)":this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)?this.element_.style.clip="rect("+e+"px "+t+"px "+e+"px "+t+"px)":this.element_.style.clip=""
},r.prototype.removeAnimationEndListener_=function(e){e.target.classList.remove(r.prototype.CssClasses_.IS_ANIMATING)},r.prototype.addAnimationEndListener_=function(){
this.element_.addEventListener("transitionend",this.removeAnimationEndListener_),this.element_.addEventListener("webkitTransitionEnd",this.removeAnimationEndListener_)},r.prototype.show=function(e){
if(this.element_&&this.container_&&this.outline_){var t=this.element_.getBoundingClientRect().height,s=this.element_.getBoundingClientRect().width;this.container_.style.width=s+"px",
this.container_.style.height=t+"px",this.outline_.style.width=s+"px",this.outline_.style.height=t+"px"
;for(var i=this.Constant_.TRANSITION_DURATION_SECONDS*this.Constant_.TRANSITION_DURATION_FRACTION,n=this.element_.querySelectorAll("."+this.CssClasses_.ITEM),a=0;a<n.length;a++){var l=null
;l=this.element_.classList.contains(this.CssClasses_.TOP_LEFT)||this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)?(t-n[a].offsetTop-n[a].offsetHeight)/t*i+"s":n[a].offsetTop/t*i+"s",
n[a].style.transitionDelay=l}this.applyClip_(t,s),window.requestAnimationFrame(function(){this.element_.classList.add(this.CssClasses_.IS_ANIMATING),
this.element_.style.clip="rect(0 "+s+"px "+t+"px 0)",this.container_.classList.add(this.CssClasses_.IS_VISIBLE)}.bind(this)),this.addAnimationEndListener_();var o=function(t){
t===e||this.closing_||t.target.parentNode===this.element_||(document.removeEventListener("click",o),this.hide())}.bind(this);document.addEventListener("click",o)}},r.prototype.show=r.prototype.show,
r.prototype.hide=function(){if(this.element_&&this.container_&&this.outline_){
for(var e=this.element_.querySelectorAll("."+this.CssClasses_.ITEM),t=0;t<e.length;t++)e[t].style.removeProperty("transition-delay");var s=this.element_.getBoundingClientRect(),i=s.height,n=s.width
;this.element_.classList.add(this.CssClasses_.IS_ANIMATING),this.applyClip_(i,n),this.container_.classList.remove(this.CssClasses_.IS_VISIBLE),this.addAnimationEndListener_()}},
r.prototype.hide=r.prototype.hide,r.prototype.toggle=function(e){this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)?this.hide():this.show(e)},r.prototype.toggle=r.prototype.toggle,
e.register({constructor:r,classAsString:"MaterialMenu",cssClass:"mdl-js-menu",widget:!0});var d=function(e){this.element_=e,this.init()};window.MaterialProgress=d,d.prototype.Constant_={},
d.prototype.CssClasses_={INDETERMINATE_CLASS:"mdl-progress__indeterminate"},d.prototype.setProgress=function(e){
this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS)||(this.progressbar_.style.width=e+"%")},d.prototype.setProgress=d.prototype.setProgress,d.prototype.setBuffer=function(e){
this.bufferbar_.style.width=e+"%",this.auxbar_.style.width=100-e+"%"},d.prototype.setBuffer=d.prototype.setBuffer,d.prototype.init=function(){if(this.element_){var e=document.createElement("div")
;e.className="progressbar bar bar1",this.element_.appendChild(e),this.progressbar_=e,(e=document.createElement("div")).className="bufferbar bar bar2",this.element_.appendChild(e),this.bufferbar_=e,
(e=document.createElement("div")).className="auxbar bar bar3",this.element_.appendChild(e),this.auxbar_=e,this.progressbar_.style.width="0%",this.bufferbar_.style.width="100%",
this.auxbar_.style.width="0%",this.element_.classList.add("is-upgraded")}},e.register({constructor:d,classAsString:"MaterialProgress",cssClass:"mdl-js-progress",widget:!0});var c=function(e){
this.element_=e,this.init()};window.MaterialRadio=c,c.prototype.Constant_={TINY_TIMEOUT:.001},c.prototype.CssClasses_={IS_FOCUSED:"is-focused",IS_DISABLED:"is-disabled",IS_CHECKED:"is-checked",
IS_UPGRADED:"is-upgraded",JS_RADIO:"mdl-js-radio",RADIO_BTN:"mdl-radio__button",RADIO_OUTER_CIRCLE:"mdl-radio__outer-circle",RADIO_INNER_CIRCLE:"mdl-radio__inner-circle",
RIPPLE_EFFECT:"mdl-js-ripple-effect",RIPPLE_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events",RIPPLE_CONTAINER:"mdl-radio__ripple-container",RIPPLE_CENTER:"mdl-ripple--center",RIPPLE:"mdl-ripple"},
c.prototype.onChange_=function(e){for(var t=document.getElementsByClassName(this.CssClasses_.JS_RADIO),s=0;s<t.length;s++){
t[s].querySelector("."+this.CssClasses_.RADIO_BTN).getAttribute("name")===this.btnElement_.getAttribute("name")&&void 0!==t[s].MaterialRadio&&t[s].MaterialRadio.updateClasses_()}},
c.prototype.onFocus_=function(e){this.element_.classList.add(this.CssClasses_.IS_FOCUSED)},c.prototype.onBlur_=function(e){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)},
c.prototype.onMouseup_=function(e){this.blur_()},c.prototype.updateClasses_=function(){this.checkDisabled(),this.checkToggleState()},c.prototype.blur_=function(){window.setTimeout(function(){
this.btnElement_.blur()}.bind(this),this.Constant_.TINY_TIMEOUT)},c.prototype.checkDisabled=function(){
this.btnElement_.disabled?this.element_.classList.add(this.CssClasses_.IS_DISABLED):this.element_.classList.remove(this.CssClasses_.IS_DISABLED)},c.prototype.checkDisabled=c.prototype.checkDisabled,
c.prototype.checkToggleState=function(){this.btnElement_.checked?this.element_.classList.add(this.CssClasses_.IS_CHECKED):this.element_.classList.remove(this.CssClasses_.IS_CHECKED)},
c.prototype.checkToggleState=c.prototype.checkToggleState,c.prototype.disable=function(){this.btnElement_.disabled=!0,this.updateClasses_()},c.prototype.disable=c.prototype.disable,
c.prototype.enable=function(){this.btnElement_.disabled=!1,this.updateClasses_()},c.prototype.enable=c.prototype.enable,c.prototype.check=function(){this.btnElement_.checked=!0,this.onChange_(null)},
c.prototype.check=c.prototype.check,c.prototype.uncheck=function(){this.btnElement_.checked=!1,this.onChange_(null)},c.prototype.uncheck=c.prototype.uncheck,c.prototype.init=function(){
if(this.element_){this.btnElement_=this.element_.querySelector("."+this.CssClasses_.RADIO_BTN),this.boundChangeHandler_=this.onChange_.bind(this),this.boundFocusHandler_=this.onChange_.bind(this),
this.boundBlurHandler_=this.onBlur_.bind(this),this.boundMouseUpHandler_=this.onMouseup_.bind(this);var e=document.createElement("span");e.classList.add(this.CssClasses_.RADIO_OUTER_CIRCLE)
;var t,s=document.createElement("span");if(s.classList.add(this.CssClasses_.RADIO_INNER_CIRCLE),this.element_.appendChild(e),this.element_.appendChild(s),
this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),
(t=document.createElement("span")).classList.add(this.CssClasses_.RIPPLE_CONTAINER),t.classList.add(this.CssClasses_.RIPPLE_EFFECT),t.classList.add(this.CssClasses_.RIPPLE_CENTER),
t.addEventListener("mouseup",this.boundMouseUpHandler_);var i=document.createElement("span");i.classList.add(this.CssClasses_.RIPPLE),t.appendChild(i),this.element_.appendChild(t)}
this.btnElement_.addEventListener("change",this.boundChangeHandler_),this.btnElement_.addEventListener("focus",this.boundFocusHandler_),
this.btnElement_.addEventListener("blur",this.boundBlurHandler_),this.element_.addEventListener("mouseup",this.boundMouseUpHandler_),this.updateClasses_(),
this.element_.classList.add(this.CssClasses_.IS_UPGRADED)}},e.register({constructor:c,classAsString:"MaterialRadio",cssClass:"mdl-js-radio",widget:!0});var h=function(e){this.element_=e,
this.isIE_=window.navigator.msPointerEnabled,this.init()};window.MaterialSlider=h,h.prototype.Constant_={},h.prototype.CssClasses_={IE_CONTAINER:"mdl-slider__ie-container",
SLIDER_CONTAINER:"mdl-slider__container",BACKGROUND_FLEX:"mdl-slider__background-flex",BACKGROUND_LOWER:"mdl-slider__background-lower",BACKGROUND_UPPER:"mdl-slider__background-upper",
IS_LOWEST_VALUE:"is-lowest-value",IS_UPGRADED:"is-upgraded"},h.prototype.onInput_=function(e){this.updateValueStyles_()},h.prototype.onChange_=function(e){this.updateValueStyles_()},
h.prototype.onMouseUp_=function(e){e.target.blur()},h.prototype.onContainerMouseDown_=function(e){if(e.target===this.element_.parentElement){e.preventDefault();var t=new MouseEvent("mousedown",{
target:e.target,buttons:e.buttons,clientX:e.clientX,clientY:this.element_.getBoundingClientRect().y});this.element_.dispatchEvent(t)}},h.prototype.updateValueStyles_=function(){
var e=(this.element_.value-this.element_.min)/(this.element_.max-this.element_.min)
;0===e?this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE):this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE),this.isIE_||(this.backgroundLower_.style.flex=e,
this.backgroundLower_.style.webkitFlex=e,this.backgroundUpper_.style.flex=1-e,this.backgroundUpper_.style.webkitFlex=1-e)},h.prototype.disable=function(){this.element_.disabled=!0},
h.prototype.disable=h.prototype.disable,h.prototype.enable=function(){this.element_.disabled=!1},h.prototype.enable=h.prototype.enable,h.prototype.change=function(e){
void 0!==e&&(this.element_.value=e),this.updateValueStyles_()},h.prototype.change=h.prototype.change,h.prototype.init=function(){if(this.element_){if(this.isIE_){var e=document.createElement("div")
;e.classList.add(this.CssClasses_.IE_CONTAINER),this.element_.parentElement.insertBefore(e,this.element_),this.element_.parentElement.removeChild(this.element_),e.appendChild(this.element_)}else{
var t=document.createElement("div");t.classList.add(this.CssClasses_.SLIDER_CONTAINER),this.element_.parentElement.insertBefore(t,this.element_),this.element_.parentElement.removeChild(this.element_),
t.appendChild(this.element_);var s=document.createElement("div");s.classList.add(this.CssClasses_.BACKGROUND_FLEX),t.appendChild(s),this.backgroundLower_=document.createElement("div"),
this.backgroundLower_.classList.add(this.CssClasses_.BACKGROUND_LOWER),s.appendChild(this.backgroundLower_),this.backgroundUpper_=document.createElement("div"),
this.backgroundUpper_.classList.add(this.CssClasses_.BACKGROUND_UPPER),s.appendChild(this.backgroundUpper_)}this.boundInputHandler=this.onInput_.bind(this),
this.boundChangeHandler=this.onChange_.bind(this),this.boundMouseUpHandler=this.onMouseUp_.bind(this),this.boundContainerMouseDownHandler=this.onContainerMouseDown_.bind(this),
this.element_.addEventListener("input",this.boundInputHandler),this.element_.addEventListener("change",this.boundChangeHandler),this.element_.addEventListener("mouseup",this.boundMouseUpHandler),
this.element_.parentElement.addEventListener("mousedown",this.boundContainerMouseDownHandler),this.updateValueStyles_(),this.element_.classList.add(this.CssClasses_.IS_UPGRADED)}},e.register({
constructor:h,classAsString:"MaterialSlider",cssClass:"mdl-js-slider",widget:!0});var _=function(e){if(this.element_=e,this.textElement_=this.element_.querySelector("."+this.cssClasses_.MESSAGE),
this.actionElement_=this.element_.querySelector("."+this.cssClasses_.ACTION),!this.textElement_)throw new Error("There must be a message element for a snackbar.")
;if(!this.actionElement_)throw new Error("There must be an action element for a snackbar.");this.active=!1,this.actionHandler_=void 0,this.message_=void 0,this.actionText_=void 0,
this.queuedNotifications_=[],this.setActionHidden_(!0)};window.MaterialSnackbar=_,_.prototype.Constant_={ANIMATION_LENGTH:250},_.prototype.cssClasses_={SNACKBAR:"mdl-snackbar",
MESSAGE:"mdl-snackbar__text",ACTION:"mdl-snackbar__action",ACTIVE:"mdl-snackbar--active"},_.prototype.displaySnackbar_=function(){this.element_.setAttribute("aria-hidden","true"),
this.actionHandler_&&(this.actionElement_.textContent=this.actionText_,this.actionElement_.addEventListener("click",this.actionHandler_),this.setActionHidden_(!1)),
this.textElement_.textContent=this.message_,this.element_.classList.add(this.cssClasses_.ACTIVE),this.element_.setAttribute("aria-hidden","false"),setTimeout(this.cleanup_.bind(this),this.timeout_)},
_.prototype.showSnackbar=function(e){if(void 0===e)throw new Error("Please provide a data object with at least a message to display.")
;if(void 0===e.message)throw new Error("Please provide a message to be displayed.");if(e.actionHandler&&!e.actionText)throw new Error("Please provide action text with the handler.")
;this.active?this.queuedNotifications_.push(e):(this.active=!0,this.message_=e.message,e.timeout?this.timeout_=e.timeout:this.timeout_=2750,e.actionHandler&&(this.actionHandler_=e.actionHandler),
e.actionText&&(this.actionText_=e.actionText),this.displaySnackbar_())},_.prototype.showSnackbar=_.prototype.showSnackbar,_.prototype.checkQueue_=function(){
this.queuedNotifications_.length>0&&this.showSnackbar(this.queuedNotifications_.shift())},_.prototype.cleanup_=function(){this.element_.classList.remove(this.cssClasses_.ACTIVE),setTimeout(function(){
this.element_.setAttribute("aria-hidden","true"),this.textElement_.textContent="",Boolean(this.actionElement_.getAttribute("aria-hidden"))||(this.setActionHidden_(!0),
this.actionElement_.textContent="",this.actionElement_.removeEventListener("click",this.actionHandler_)),this.actionHandler_=void 0,this.message_=void 0,this.actionText_=void 0,this.active=!1,
this.checkQueue_()}.bind(this),this.Constant_.ANIMATION_LENGTH)},_.prototype.setActionHidden_=function(e){
e?this.actionElement_.setAttribute("aria-hidden","true"):this.actionElement_.removeAttribute("aria-hidden")},e.register({constructor:_,classAsString:"MaterialSnackbar",cssClass:"mdl-js-snackbar",
widget:!0});var p=function(e){this.element_=e,this.init()};window.MaterialSpinner=p,p.prototype.Constant_={MDL_SPINNER_LAYER_COUNT:4},p.prototype.CssClasses_={MDL_SPINNER_LAYER:"mdl-spinner__layer",
MDL_SPINNER_CIRCLE_CLIPPER:"mdl-spinner__circle-clipper",MDL_SPINNER_CIRCLE:"mdl-spinner__circle",MDL_SPINNER_GAP_PATCH:"mdl-spinner__gap-patch",MDL_SPINNER_LEFT:"mdl-spinner__left",
MDL_SPINNER_RIGHT:"mdl-spinner__right"},p.prototype.createLayer=function(e){var t=document.createElement("div");t.classList.add(this.CssClasses_.MDL_SPINNER_LAYER),
t.classList.add(this.CssClasses_.MDL_SPINNER_LAYER+"-"+e);var s=document.createElement("div");s.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER),
s.classList.add(this.CssClasses_.MDL_SPINNER_LEFT);var i=document.createElement("div");i.classList.add(this.CssClasses_.MDL_SPINNER_GAP_PATCH);var n=document.createElement("div")
;n.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER),n.classList.add(this.CssClasses_.MDL_SPINNER_RIGHT);for(var a=[s,i,n],l=0;l<a.length;l++){var o=document.createElement("div")
;o.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE),a[l].appendChild(o)}t.appendChild(s),t.appendChild(i),t.appendChild(n),this.element_.appendChild(t)},
p.prototype.createLayer=p.prototype.createLayer,p.prototype.stop=function(){this.element_.classList.remove("is-active")},p.prototype.stop=p.prototype.stop,p.prototype.start=function(){
this.element_.classList.add("is-active")},p.prototype.start=p.prototype.start,p.prototype.init=function(){if(this.element_){
for(var e=1;e<=this.Constant_.MDL_SPINNER_LAYER_COUNT;e++)this.createLayer(e);this.element_.classList.add("is-upgraded")}},e.register({constructor:p,classAsString:"MaterialSpinner",
cssClass:"mdl-js-spinner",widget:!0});var u=function(e){this.element_=e,this.init()};window.MaterialSwitch=u,u.prototype.Constant_={TINY_TIMEOUT:.001},u.prototype.CssClasses_={
INPUT:"mdl-switch__input",TRACK:"mdl-switch__track",THUMB:"mdl-switch__thumb",FOCUS_HELPER:"mdl-switch__focus-helper",RIPPLE_EFFECT:"mdl-js-ripple-effect",
RIPPLE_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events",RIPPLE_CONTAINER:"mdl-switch__ripple-container",RIPPLE_CENTER:"mdl-ripple--center",RIPPLE:"mdl-ripple",IS_FOCUSED:"is-focused",
IS_DISABLED:"is-disabled",IS_CHECKED:"is-checked"},u.prototype.onChange_=function(e){this.updateClasses_()},u.prototype.onFocus_=function(e){this.element_.classList.add(this.CssClasses_.IS_FOCUSED)},
u.prototype.onBlur_=function(e){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)},u.prototype.onMouseUp_=function(e){this.blur_()},u.prototype.updateClasses_=function(){
this.checkDisabled(),this.checkToggleState()},u.prototype.blur_=function(){window.setTimeout(function(){this.inputElement_.blur()}.bind(this),this.Constant_.TINY_TIMEOUT)},
u.prototype.checkDisabled=function(){this.inputElement_.disabled?this.element_.classList.add(this.CssClasses_.IS_DISABLED):this.element_.classList.remove(this.CssClasses_.IS_DISABLED)},
u.prototype.checkDisabled=u.prototype.checkDisabled,u.prototype.checkToggleState=function(){
this.inputElement_.checked?this.element_.classList.add(this.CssClasses_.IS_CHECKED):this.element_.classList.remove(this.CssClasses_.IS_CHECKED)},
u.prototype.checkToggleState=u.prototype.checkToggleState,u.prototype.disable=function(){this.inputElement_.disabled=!0,this.updateClasses_()},u.prototype.disable=u.prototype.disable,
u.prototype.enable=function(){this.inputElement_.disabled=!1,this.updateClasses_()},u.prototype.enable=u.prototype.enable,u.prototype.on=function(){this.inputElement_.checked=!0,this.updateClasses_()
},u.prototype.on=u.prototype.on,u.prototype.off=function(){this.inputElement_.checked=!1,this.updateClasses_()},u.prototype.off=u.prototype.off,u.prototype.init=function(){if(this.element_){
this.inputElement_=this.element_.querySelector("."+this.CssClasses_.INPUT);var e=document.createElement("div");e.classList.add(this.CssClasses_.TRACK);var t=document.createElement("div")
;t.classList.add(this.CssClasses_.THUMB);var s=document.createElement("span");if(s.classList.add(this.CssClasses_.FOCUS_HELPER),t.appendChild(s),this.element_.appendChild(e),
this.element_.appendChild(t),this.boundMouseUpHandler=this.onMouseUp_.bind(this),this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){
this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),this.rippleContainerElement_=document.createElement("span"),
this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER),this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT),
this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER),this.rippleContainerElement_.addEventListener("mouseup",this.boundMouseUpHandler);var i=document.createElement("span")
;i.classList.add(this.CssClasses_.RIPPLE),this.rippleContainerElement_.appendChild(i),this.element_.appendChild(this.rippleContainerElement_)}this.boundChangeHandler=this.onChange_.bind(this),
this.boundFocusHandler=this.onFocus_.bind(this),this.boundBlurHandler=this.onBlur_.bind(this),this.inputElement_.addEventListener("change",this.boundChangeHandler),
this.inputElement_.addEventListener("focus",this.boundFocusHandler),this.inputElement_.addEventListener("blur",this.boundBlurHandler),
this.element_.addEventListener("mouseup",this.boundMouseUpHandler),this.updateClasses_(),this.element_.classList.add("is-upgraded")}},e.register({constructor:u,classAsString:"MaterialSwitch",
cssClass:"mdl-js-switch",widget:!0});var m=function(e){this.element_=e,this.init()};function E(e,t){if(e){if(t.element_.classList.contains(t.CssClasses_.MDL_JS_RIPPLE_EFFECT)){
var s=document.createElement("span");s.classList.add(t.CssClasses_.MDL_RIPPLE_CONTAINER),s.classList.add(t.CssClasses_.MDL_JS_RIPPLE_EFFECT);var i=document.createElement("span")
;i.classList.add(t.CssClasses_.MDL_RIPPLE),s.appendChild(i),e.appendChild(s)}e.addEventListener("click",function(s){if("#"===e.getAttribute("href").charAt(0)){s.preventDefault()
;var i=e.href.split("#")[1],n=t.element_.querySelector("#"+i);t.resetTabState_(),t.resetPanelState_(),e.classList.add(t.CssClasses_.ACTIVE_CLASS),n.classList.add(t.CssClasses_.ACTIVE_CLASS)}})}}
window.MaterialTabs=m,m.prototype.Constant_={},m.prototype.CssClasses_={TAB_CLASS:"mdl-tabs__tab",PANEL_CLASS:"mdl-tabs__panel",ACTIVE_CLASS:"is-active",UPGRADED_CLASS:"is-upgraded",
MDL_JS_RIPPLE_EFFECT:"mdl-js-ripple-effect",MDL_RIPPLE_CONTAINER:"mdl-tabs__ripple-container",MDL_RIPPLE:"mdl-ripple",MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events"},
m.prototype.initTabs_=function(){this.element_.classList.contains(this.CssClasses_.MDL_JS_RIPPLE_EFFECT)&&this.element_.classList.add(this.CssClasses_.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS),
this.tabs_=this.element_.querySelectorAll("."+this.CssClasses_.TAB_CLASS),this.panels_=this.element_.querySelectorAll("."+this.CssClasses_.PANEL_CLASS)
;for(var e=0;e<this.tabs_.length;e++)new E(this.tabs_[e],this);this.element_.classList.add(this.CssClasses_.UPGRADED_CLASS)},m.prototype.resetTabState_=function(){
for(var e=0;e<this.tabs_.length;e++)this.tabs_[e].classList.remove(this.CssClasses_.ACTIVE_CLASS)},m.prototype.resetPanelState_=function(){
for(var e=0;e<this.panels_.length;e++)this.panels_[e].classList.remove(this.CssClasses_.ACTIVE_CLASS)},m.prototype.init=function(){this.element_&&this.initTabs_()},e.register({constructor:m,
classAsString:"MaterialTabs",cssClass:"mdl-js-tabs"});var C=function(e){this.element_=e,this.maxRows=this.Constant_.NO_MAX_ROWS,this.init()};window.MaterialTextfield=C,C.prototype.Constant_={
NO_MAX_ROWS:-1,MAX_ROWS_ATTRIBUTE:"maxrows"},C.prototype.CssClasses_={LABEL:"mdl-textfield__label",INPUT:"mdl-textfield__input",IS_DIRTY:"is-dirty",IS_FOCUSED:"is-focused",IS_DISABLED:"is-disabled",
IS_INVALID:"is-invalid",IS_UPGRADED:"is-upgraded",HAS_PLACEHOLDER:"has-placeholder"},C.prototype.onKeyDown_=function(e){var t=e.target.value.split("\n").length
;13===e.keyCode&&t>=this.maxRows&&e.preventDefault()},C.prototype.onFocus_=function(e){this.element_.classList.add(this.CssClasses_.IS_FOCUSED)},C.prototype.onBlur_=function(e){
this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)},C.prototype.onReset_=function(e){this.updateClasses_()},C.prototype.updateClasses_=function(){this.checkDisabled(),this.checkValidity(),
this.checkDirty(),this.checkFocus()},C.prototype.checkDisabled=function(){
this.input_.disabled?this.element_.classList.add(this.CssClasses_.IS_DISABLED):this.element_.classList.remove(this.CssClasses_.IS_DISABLED)},C.prototype.checkDisabled=C.prototype.checkDisabled,
C.prototype.checkFocus=function(){Boolean(this.element_.querySelector(":focus"))?this.element_.classList.add(this.CssClasses_.IS_FOCUSED):this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)},
C.prototype.checkFocus=C.prototype.checkFocus,C.prototype.checkValidity=function(){
this.input_.validity&&(this.input_.validity.valid?this.element_.classList.remove(this.CssClasses_.IS_INVALID):this.element_.classList.add(this.CssClasses_.IS_INVALID))},
C.prototype.checkValidity=C.prototype.checkValidity,C.prototype.checkDirty=function(){
this.input_.value&&this.input_.value.length>0?this.element_.classList.add(this.CssClasses_.IS_DIRTY):this.element_.classList.remove(this.CssClasses_.IS_DIRTY)},
C.prototype.checkDirty=C.prototype.checkDirty,C.prototype.disable=function(){this.input_.disabled=!0,this.updateClasses_()},C.prototype.disable=C.prototype.disable,C.prototype.enable=function(){
this.input_.disabled=!1,this.updateClasses_()},C.prototype.enable=C.prototype.enable,C.prototype.change=function(e){this.input_.value=e||"",this.updateClasses_()},
C.prototype.change=C.prototype.change,C.prototype.init=function(){if(this.element_&&(this.label_=this.element_.querySelector("."+this.CssClasses_.LABEL),
this.input_=this.element_.querySelector("."+this.CssClasses_.INPUT),this.input_)){
this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)&&(this.maxRows=parseInt(this.input_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE),10),
isNaN(this.maxRows)&&(this.maxRows=this.Constant_.NO_MAX_ROWS)),this.input_.hasAttribute("placeholder")&&this.element_.classList.add(this.CssClasses_.HAS_PLACEHOLDER),
this.boundUpdateClassesHandler=this.updateClasses_.bind(this),this.boundFocusHandler=this.onFocus_.bind(this),this.boundBlurHandler=this.onBlur_.bind(this),
this.boundResetHandler=this.onReset_.bind(this),this.input_.addEventListener("input",this.boundUpdateClassesHandler),this.input_.addEventListener("focus",this.boundFocusHandler),
this.input_.addEventListener("blur",this.boundBlurHandler),this.input_.addEventListener("reset",this.boundResetHandler),
this.maxRows!==this.Constant_.NO_MAX_ROWS&&(this.boundKeyDownHandler=this.onKeyDown_.bind(this),this.input_.addEventListener("keydown",this.boundKeyDownHandler))
;var e=this.element_.classList.contains(this.CssClasses_.IS_INVALID);this.updateClasses_(),this.element_.classList.add(this.CssClasses_.IS_UPGRADED),
e&&this.element_.classList.add(this.CssClasses_.IS_INVALID),this.input_.hasAttribute("autofocus")&&(this.element_.focus(),this.checkFocus())}},e.register({constructor:C,
classAsString:"MaterialTextfield",cssClass:"mdl-js-textfield",widget:!0});var f=function(e){this.element_=e,this.init()};window.MaterialTooltip=f,f.prototype.Constant_={},f.prototype.CssClasses_={
IS_ACTIVE:"is-active",BOTTOM:"mdl-tooltip--bottom",LEFT:"mdl-tooltip--left",RIGHT:"mdl-tooltip--right",TOP:"mdl-tooltip--top"},f.prototype.handleMouseEnter_=function(e){
var t=e.target.getBoundingClientRect(),s=t.left+t.width/2,i=t.top+t.height/2,n=this.element_.offsetWidth/2*-1,a=this.element_.offsetHeight/2*-1
;this.element_.classList.contains(this.CssClasses_.LEFT)||this.element_.classList.contains(this.CssClasses_.RIGHT)?(s=t.width/2,i+a<0?(this.element_.style.top="0",
this.element_.style.marginTop="0"):(this.element_.style.top=i+"px",this.element_.style.marginTop=a+"px")):s+n<0?(this.element_.style.left="0",
this.element_.style.marginLeft="0"):(this.element_.style.left=s+"px",this.element_.style.marginLeft=n+"px"),
this.element_.classList.contains(this.CssClasses_.TOP)?this.element_.style.top=t.top-this.element_.offsetHeight-10+"px":this.element_.classList.contains(this.CssClasses_.RIGHT)?this.element_.style.left=t.left+t.width+10+"px":this.element_.classList.contains(this.CssClasses_.LEFT)?this.element_.style.left=t.left-this.element_.offsetWidth-10+"px":this.element_.style.top=t.top+t.height+10+"px",
this.element_.classList.add(this.CssClasses_.IS_ACTIVE)},f.prototype.hideTooltip_=function(){this.element_.classList.remove(this.CssClasses_.IS_ACTIVE)},f.prototype.init=function(){if(this.element_){
var e=this.element_.getAttribute("for")||this.element_.getAttribute("data-mdl-for");e&&(this.forElement_=document.getElementById(e)),
this.forElement_&&(this.forElement_.hasAttribute("tabindex")||this.forElement_.setAttribute("tabindex","0"),this.boundMouseEnterHandler=this.handleMouseEnter_.bind(this),
this.boundMouseLeaveAndScrollHandler=this.hideTooltip_.bind(this),this.forElement_.addEventListener("mouseenter",this.boundMouseEnterHandler,!1),
this.forElement_.addEventListener("touchend",this.boundMouseEnterHandler,!1),this.forElement_.addEventListener("mouseleave",this.boundMouseLeaveAndScrollHandler,!1),
window.addEventListener("scroll",this.boundMouseLeaveAndScrollHandler,!0),window.addEventListener("touchstart",this.boundMouseLeaveAndScrollHandler))}},e.register({constructor:f,
classAsString:"MaterialTooltip",cssClass:"mdl-tooltip"});var b=function(e){this.element_=e,this.init()};function y(e,t,s,i){function n(){var n=e.href.split("#")[1],a=i.content_.querySelector("#"+n)
;i.resetTabState_(t),i.resetPanelState_(s),e.classList.add(i.CssClasses_.IS_ACTIVE),a.classList.add(i.CssClasses_.IS_ACTIVE)}if(i.tabBar_.classList.contains(i.CssClasses_.JS_RIPPLE_EFFECT)){
var a=document.createElement("span");a.classList.add(i.CssClasses_.RIPPLE_CONTAINER),a.classList.add(i.CssClasses_.JS_RIPPLE_EFFECT);var l=document.createElement("span")
;l.classList.add(i.CssClasses_.RIPPLE),a.appendChild(l),e.appendChild(a)}i.tabBar_.classList.contains(i.CssClasses_.TAB_MANUAL_SWITCH)||e.addEventListener("click",function(t){
"#"===e.getAttribute("href").charAt(0)&&(t.preventDefault(),n())}),e.show=n}window.MaterialLayout=b,b.prototype.Constant_={MAX_WIDTH:"(max-width: 1024px)",TAB_SCROLL_PIXELS:100,RESIZE_TIMEOUT:100,
MENU_ICON:"&#xE5D2;",CHEVRON_LEFT:"chevron_left",CHEVRON_RIGHT:"chevron_right"},b.prototype.Keycodes_={ENTER:13,ESCAPE:27,SPACE:32},b.prototype.Mode_={STANDARD:0,SEAMED:1,WATERFALL:2,SCROLL:3},
b.prototype.CssClasses_={CONTAINER:"mdl-layout__container",HEADER:"mdl-layout__header",DRAWER:"mdl-layout__drawer",CONTENT:"mdl-layout__content",DRAWER_BTN:"mdl-layout__drawer-button",
ICON:"material-icons",JS_RIPPLE_EFFECT:"mdl-js-ripple-effect",RIPPLE_CONTAINER:"mdl-layout__tab-ripple-container",RIPPLE:"mdl-ripple",RIPPLE_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events",
HEADER_SEAMED:"mdl-layout__header--seamed",HEADER_WATERFALL:"mdl-layout__header--waterfall",HEADER_SCROLL:"mdl-layout__header--scroll",FIXED_HEADER:"mdl-layout--fixed-header",
OBFUSCATOR:"mdl-layout__obfuscator",TAB_BAR:"mdl-layout__tab-bar",TAB_CONTAINER:"mdl-layout__tab-bar-container",TAB:"mdl-layout__tab",TAB_BAR_BUTTON:"mdl-layout__tab-bar-button",
TAB_BAR_LEFT_BUTTON:"mdl-layout__tab-bar-left-button",TAB_BAR_RIGHT_BUTTON:"mdl-layout__tab-bar-right-button",TAB_MANUAL_SWITCH:"mdl-layout__tab-manual-switch",PANEL:"mdl-layout__tab-panel",
HAS_DRAWER:"has-drawer",HAS_TABS:"has-tabs",HAS_SCROLLING_HEADER:"has-scrolling-header",CASTING_SHADOW:"is-casting-shadow",IS_COMPACT:"is-compact",IS_SMALL_SCREEN:"is-small-screen",
IS_DRAWER_OPEN:"is-visible",IS_ACTIVE:"is-active",IS_UPGRADED:"is-upgraded",IS_ANIMATING:"is-animating",ON_LARGE_SCREEN:"mdl-layout--large-screen-only",ON_SMALL_SCREEN:"mdl-layout--small-screen-only"
},b.prototype.contentScrollHandler_=function(){if(!this.header_.classList.contains(this.CssClasses_.IS_ANIMATING)){
var e=!this.element_.classList.contains(this.CssClasses_.IS_SMALL_SCREEN)||this.element_.classList.contains(this.CssClasses_.FIXED_HEADER)
;this.content_.scrollTop>0&&!this.header_.classList.contains(this.CssClasses_.IS_COMPACT)?(this.header_.classList.add(this.CssClasses_.CASTING_SHADOW),
this.header_.classList.add(this.CssClasses_.IS_COMPACT),
e&&this.header_.classList.add(this.CssClasses_.IS_ANIMATING)):this.content_.scrollTop<=0&&this.header_.classList.contains(this.CssClasses_.IS_COMPACT)&&(this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW),
this.header_.classList.remove(this.CssClasses_.IS_COMPACT),e&&this.header_.classList.add(this.CssClasses_.IS_ANIMATING))}},b.prototype.keyboardEventHandler_=function(e){
e.keyCode===this.Keycodes_.ESCAPE&&this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)&&this.toggleDrawer()},b.prototype.screenSizeHandler_=function(){
this.screenSizeMediaQuery_.matches?this.element_.classList.add(this.CssClasses_.IS_SMALL_SCREEN):(this.element_.classList.remove(this.CssClasses_.IS_SMALL_SCREEN),
this.drawer_&&(this.drawer_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN),this.obfuscator_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN)))},b.prototype.drawerToggleHandler_=function(e){
if(e&&"keydown"===e.type){if(e.keyCode!==this.Keycodes_.SPACE&&e.keyCode!==this.Keycodes_.ENTER)return;e.preventDefault()}this.toggleDrawer()},b.prototype.headerTransitionEndHandler_=function(){
this.header_.classList.remove(this.CssClasses_.IS_ANIMATING)},b.prototype.headerClickHandler_=function(){
this.header_.classList.contains(this.CssClasses_.IS_COMPACT)&&(this.header_.classList.remove(this.CssClasses_.IS_COMPACT),this.header_.classList.add(this.CssClasses_.IS_ANIMATING))},
b.prototype.resetTabState_=function(e){for(var t=0;t<e.length;t++)e[t].classList.remove(this.CssClasses_.IS_ACTIVE)},b.prototype.resetPanelState_=function(e){
for(var t=0;t<e.length;t++)e[t].classList.remove(this.CssClasses_.IS_ACTIVE)},b.prototype.toggleDrawer=function(){var e=this.element_.querySelector("."+this.CssClasses_.DRAWER_BTN)
;this.drawer_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN),this.obfuscator_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN),
this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)?(this.drawer_.setAttribute("aria-hidden","false"),
e.setAttribute("aria-expanded","true")):(this.drawer_.setAttribute("aria-hidden","true"),e.setAttribute("aria-expanded","false"))},b.prototype.toggleDrawer=b.prototype.toggleDrawer,
b.prototype.init=function(){if(this.element_){var e=document.createElement("div");e.classList.add(this.CssClasses_.CONTAINER);var t=this.element_.querySelector(":focus")
;this.element_.parentElement.insertBefore(e,this.element_),this.element_.parentElement.removeChild(this.element_),e.appendChild(this.element_),t&&t.focus()
;for(var s=this.element_.childNodes,i=s.length,n=0;n<i;n++){var a=s[n];a.classList&&a.classList.contains(this.CssClasses_.HEADER)&&(this.header_=a),
a.classList&&a.classList.contains(this.CssClasses_.DRAWER)&&(this.drawer_=a),a.classList&&a.classList.contains(this.CssClasses_.CONTENT)&&(this.content_=a)}
window.addEventListener("pageshow",function(e){e.persisted&&(this.element_.style.overflowY="hidden",requestAnimationFrame(function(){this.element_.style.overflowY=""}.bind(this)))}.bind(this),!1),
this.header_&&(this.tabBar_=this.header_.querySelector("."+this.CssClasses_.TAB_BAR));var l=this.Mode_.STANDARD
;if(this.header_&&(this.header_.classList.contains(this.CssClasses_.HEADER_SEAMED)?l=this.Mode_.SEAMED:this.header_.classList.contains(this.CssClasses_.HEADER_WATERFALL)?(l=this.Mode_.WATERFALL,
this.header_.addEventListener("transitionend",this.headerTransitionEndHandler_.bind(this)),
this.header_.addEventListener("click",this.headerClickHandler_.bind(this))):this.header_.classList.contains(this.CssClasses_.HEADER_SCROLL)&&(l=this.Mode_.SCROLL,
e.classList.add(this.CssClasses_.HAS_SCROLLING_HEADER)),l===this.Mode_.STANDARD?(this.header_.classList.add(this.CssClasses_.CASTING_SHADOW),
this.tabBar_&&this.tabBar_.classList.add(this.CssClasses_.CASTING_SHADOW)):l===this.Mode_.SEAMED||l===this.Mode_.SCROLL?(this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW),
this.tabBar_&&this.tabBar_.classList.remove(this.CssClasses_.CASTING_SHADOW)):l===this.Mode_.WATERFALL&&(this.content_.addEventListener("scroll",this.contentScrollHandler_.bind(this)),
this.contentScrollHandler_())),this.drawer_){var o=this.element_.querySelector("."+this.CssClasses_.DRAWER_BTN);if(!o){(o=document.createElement("div")).setAttribute("aria-expanded","false"),
o.setAttribute("role","button"),o.setAttribute("tabindex","0"),o.classList.add(this.CssClasses_.DRAWER_BTN);var r=document.createElement("i");r.classList.add(this.CssClasses_.ICON),
r.innerHTML=this.Constant_.MENU_ICON,o.appendChild(r)}
this.drawer_.classList.contains(this.CssClasses_.ON_LARGE_SCREEN)?o.classList.add(this.CssClasses_.ON_LARGE_SCREEN):this.drawer_.classList.contains(this.CssClasses_.ON_SMALL_SCREEN)&&o.classList.add(this.CssClasses_.ON_SMALL_SCREEN),
o.addEventListener("click",this.drawerToggleHandler_.bind(this)),o.addEventListener("keydown",this.drawerToggleHandler_.bind(this)),this.element_.classList.add(this.CssClasses_.HAS_DRAWER),
this.element_.classList.contains(this.CssClasses_.FIXED_HEADER)?this.header_.insertBefore(o,this.header_.firstChild):this.element_.insertBefore(o,this.content_);var d=document.createElement("div")
;d.classList.add(this.CssClasses_.OBFUSCATOR),this.element_.appendChild(d),d.addEventListener("click",this.drawerToggleHandler_.bind(this)),this.obfuscator_=d,
this.drawer_.addEventListener("keydown",this.keyboardEventHandler_.bind(this)),this.drawer_.setAttribute("aria-hidden","true")}
if(this.screenSizeMediaQuery_=window.matchMedia(this.Constant_.MAX_WIDTH),this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this)),this.screenSizeHandler_(),
this.header_&&this.tabBar_){this.element_.classList.add(this.CssClasses_.HAS_TABS);var c=document.createElement("div");c.classList.add(this.CssClasses_.TAB_CONTAINER),
this.header_.insertBefore(c,this.tabBar_),this.header_.removeChild(this.tabBar_);var h=document.createElement("div");h.classList.add(this.CssClasses_.TAB_BAR_BUTTON),
h.classList.add(this.CssClasses_.TAB_BAR_LEFT_BUTTON);var _=document.createElement("i");_.classList.add(this.CssClasses_.ICON),_.textContent=this.Constant_.CHEVRON_LEFT,h.appendChild(_),
h.addEventListener("click",function(){this.tabBar_.scrollLeft-=this.Constant_.TAB_SCROLL_PIXELS}.bind(this));var p=document.createElement("div");p.classList.add(this.CssClasses_.TAB_BAR_BUTTON),
p.classList.add(this.CssClasses_.TAB_BAR_RIGHT_BUTTON);var u=document.createElement("i");u.classList.add(this.CssClasses_.ICON),u.textContent=this.Constant_.CHEVRON_RIGHT,p.appendChild(u),
p.addEventListener("click",function(){this.tabBar_.scrollLeft+=this.Constant_.TAB_SCROLL_PIXELS}.bind(this)),c.appendChild(h),c.appendChild(this.tabBar_),c.appendChild(p);var m=function(){
this.tabBar_.scrollLeft>0?h.classList.add(this.CssClasses_.IS_ACTIVE):h.classList.remove(this.CssClasses_.IS_ACTIVE),
this.tabBar_.scrollLeft<this.tabBar_.scrollWidth-this.tabBar_.offsetWidth?p.classList.add(this.CssClasses_.IS_ACTIVE):p.classList.remove(this.CssClasses_.IS_ACTIVE)}.bind(this)
;this.tabBar_.addEventListener("scroll",m),m();var E=function(){this.resizeTimeoutId_&&clearTimeout(this.resizeTimeoutId_),this.resizeTimeoutId_=setTimeout(function(){m(),this.resizeTimeoutId_=null
}.bind(this),this.Constant_.RESIZE_TIMEOUT)}.bind(this);window.addEventListener("resize",E),
this.tabBar_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)&&this.tabBar_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS)
;for(var C=this.tabBar_.querySelectorAll("."+this.CssClasses_.TAB),f=this.content_.querySelectorAll("."+this.CssClasses_.PANEL),b=0;b<C.length;b++)new y(C[b],C,f,this)}
this.element_.classList.add(this.CssClasses_.IS_UPGRADED)}},window.MaterialLayoutTab=y,e.register({constructor:b,classAsString:"MaterialLayout",cssClass:"mdl-js-layout"});var g=function(e){
this.element_=e,this.init()};window.MaterialDataTable=g,g.prototype.Constant_={},g.prototype.CssClasses_={DATA_TABLE:"mdl-data-table",SELECTABLE:"mdl-data-table--selectable",
SELECT_ELEMENT:"mdl-data-table__select",IS_SELECTED:"is-selected",IS_UPGRADED:"is-upgraded"},g.prototype.selectRow_=function(e,t,s){return t?function(){
e.checked?t.classList.add(this.CssClasses_.IS_SELECTED):t.classList.remove(this.CssClasses_.IS_SELECTED)}.bind(this):s?function(){var t
;if(e.checked)for(t=0;t<s.length;t++)s[t].querySelector("td").querySelector(".mdl-checkbox").MaterialCheckbox.check(),
s[t].classList.add(this.CssClasses_.IS_SELECTED);else for(t=0;t<s.length;t++)s[t].querySelector("td").querySelector(".mdl-checkbox").MaterialCheckbox.uncheck(),
s[t].classList.remove(this.CssClasses_.IS_SELECTED)}.bind(this):void 0},g.prototype.createCheckbox_=function(t,s){
var i=document.createElement("label"),n=["mdl-checkbox","mdl-js-checkbox","mdl-js-ripple-effect",this.CssClasses_.SELECT_ELEMENT];i.className=n.join(" ");var a=document.createElement("input")
;return a.type="checkbox",a.classList.add("mdl-checkbox__input"),t?(a.checked=t.classList.contains(this.CssClasses_.IS_SELECTED),
a.addEventListener("change",this.selectRow_(a,t))):s&&a.addEventListener("change",this.selectRow_(a,null,s)),i.appendChild(a),e.upgradeElement(i,"MaterialCheckbox"),i},g.prototype.init=function(){
if(this.element_){
var e=this.element_.querySelector("th"),t=Array.prototype.slice.call(this.element_.querySelectorAll("tbody tr")),s=Array.prototype.slice.call(this.element_.querySelectorAll("tfoot tr")),i=t.concat(s)
;if(this.element_.classList.contains(this.CssClasses_.SELECTABLE)){var n=document.createElement("th"),a=this.createCheckbox_(null,i);n.appendChild(a),e.parentElement.insertBefore(n,e)
;for(var l=0;l<i.length;l++){var o=i[l].querySelector("td");if(o){var r=document.createElement("td");if("TBODY"===i[l].parentNode.nodeName.toUpperCase()){var d=this.createCheckbox_(i[l])
;r.appendChild(d)}i[l].insertBefore(r,o)}}this.element_.classList.add(this.CssClasses_.IS_UPGRADED)}}},e.register({constructor:g,classAsString:"MaterialDataTable",cssClass:"mdl-js-data-table"})
;var L=function(e){this.element_=e,this.init()};window.MaterialRipple=L,L.prototype.Constant_={INITIAL_SCALE:"scale(0.0001, 0.0001)",INITIAL_SIZE:"1px",INITIAL_OPACITY:"0.4",FINAL_OPACITY:"0",
FINAL_SCALE:""},L.prototype.CssClasses_={RIPPLE_CENTER:"mdl-ripple--center",RIPPLE_EFFECT_IGNORE_EVENTS:"mdl-js-ripple-effect--ignore-events",RIPPLE:"mdl-ripple",IS_ANIMATING:"is-animating",
IS_VISIBLE:"is-visible"},L.prototype.downHandler_=function(e){if(!this.rippleElement_.style.width&&!this.rippleElement_.style.height){var t=this.element_.getBoundingClientRect()
;this.boundHeight=t.height,this.boundWidth=t.width,this.rippleSize_=2*Math.sqrt(t.width*t.width+t.height*t.height)+2,this.rippleElement_.style.width=this.rippleSize_+"px",
this.rippleElement_.style.height=this.rippleSize_+"px"}if(this.rippleElement_.classList.add(this.CssClasses_.IS_VISIBLE),"mousedown"===e.type&&this.ignoringMouseDown_)this.ignoringMouseDown_=!1;else{
if("touchstart"===e.type&&(this.ignoringMouseDown_=!0),this.getFrameCount()>0)return;this.setFrameCount(1);var s,i,n=e.currentTarget.getBoundingClientRect()
;if(0===e.clientX&&0===e.clientY)s=Math.round(n.width/2),i=Math.round(n.height/2);else{var a=void 0!==e.clientX?e.clientX:e.touches[0].clientX,l=void 0!==e.clientY?e.clientY:e.touches[0].clientY
;s=Math.round(a-n.left),i=Math.round(l-n.top)}this.setRippleXY(s,i),this.setRippleStyles(!0),window.requestAnimationFrame(this.animFrameHandler.bind(this))}},L.prototype.upHandler_=function(e){
e&&2!==e.detail&&window.setTimeout(function(){this.rippleElement_.classList.remove(this.CssClasses_.IS_VISIBLE)}.bind(this),0)},L.prototype.init=function(){if(this.element_){
var e=this.element_.classList.contains(this.CssClasses_.RIPPLE_CENTER)
;this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)||(this.rippleElement_=this.element_.querySelector("."+this.CssClasses_.RIPPLE),this.frameCount_=0,this.rippleSize_=0,
this.x_=0,this.y_=0,this.ignoringMouseDown_=!1,this.boundDownHandler=this.downHandler_.bind(this),this.element_.addEventListener("mousedown",this.boundDownHandler),
this.element_.addEventListener("touchstart",this.boundDownHandler),this.boundUpHandler=this.upHandler_.bind(this),this.element_.addEventListener("mouseup",this.boundUpHandler),
this.element_.addEventListener("mouseleave",this.boundUpHandler),this.element_.addEventListener("touchend",this.boundUpHandler),this.element_.addEventListener("blur",this.boundUpHandler),
this.getFrameCount=function(){return this.frameCount_},this.setFrameCount=function(e){this.frameCount_=e},this.getRippleElement=function(){return this.rippleElement_},this.setRippleXY=function(e,t){
this.x_=e,this.y_=t},this.setRippleStyles=function(t){if(null!==this.rippleElement_){var s,i,n="translate("+this.x_+"px, "+this.y_+"px)";t?(i=this.Constant_.INITIAL_SCALE,
this.Constant_.INITIAL_SIZE):(i=this.Constant_.FINAL_SCALE,this.rippleSize_+"px",e&&(n="translate("+this.boundWidth/2+"px, "+this.boundHeight/2+"px)")),s="translate(-50%, -50%) "+n+i,
this.rippleElement_.style.webkitTransform=s,this.rippleElement_.style.msTransform=s,this.rippleElement_.style.transform=s,
t?this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING):this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING)}},this.animFrameHandler=function(){
this.frameCount_-- >0?window.requestAnimationFrame(this.animFrameHandler.bind(this)):this.setRippleStyles(!1)})}},e.register({constructor:L,classAsString:"MaterialRipple",
cssClass:"mdl-js-ripple-effect",widget:!1})}(),function(){"use strict";var e=function(e){this.element_=e,this.setDefaults_(),this.init()};window.MaterialSelectfield=e,e.prototype.CssClasses_={
LABEL:"mdl-selectfield__label",SELECT:"mdl-selectfield__select",SELECTED_BOX:"mdl-selectfield__box",SELECTED_BOX_VALUE:"mdl-selectfield__box-value",LIST_OPTION_BOX:"mdl-selectfield__list-option-box",
IS_DIRTY:"is-dirty",IS_FOCUSED:"is-focused",IS_DISABLED:"is-disabled",IS_INVALID:"is-invalid",IS_UPGRADED:"is-upgraded",IS_SELECTED:"is-selected"},e.prototype.Keycodes_={ENTER:13,ESCAPE:27,SPACE:32,
UP_ARROW:38,DOWN_ARROW:40},e.prototype.setDefaults_=function(){this.options_=[],this.optionsMap_={},this.optionsArr_=[],this.closing_=!0,this.keyDownTimerId_=null,this.observer_=null},
e.prototype.onFocus_=function(e){this.closing_&&this.show_(e)},e.prototype.onBlur_=function(e){!this.closing_&&this.hide_()},e.prototype.onSelected_=function(e){if(e.target&&"LI"===e.target.nodeName){
var t,s,i=this.options_[e.target.getAttribute("data-value")];if(i.disabled)return e.stopPropagation(),!1;if(this.selectedOptionValue_.textContent=i.textContent,i.selected=!0,
"function"==typeof window.Event?t=new Event("change",{bubbles:!0,cancelable:!0}):"function"==typeof document.createEvent&&(t=document.createEvent("HTMLEvents")).initEvent("change",!0,!0),
t&&this.select_.dispatchEvent(t),""!==i.textContent)this.element_.classList.add(this.CssClasses_.IS_DIRTY),
(s=this.listOptionBox_.querySelector("."+this.CssClasses_.IS_SELECTED))&&s.classList.remove(this.CssClasses_.IS_SELECTED),
e.target.classList.add(this.CssClasses_.IS_SELECTED);else this.element_.classList.remove(this.CssClasses_.IS_DIRTY),
(s=this.listOptionBox_.querySelector("."+this.CssClasses_.IS_SELECTED))&&s.classList.remove(this.CssClasses_.IS_SELECTED)}},e.prototype.onClick_=function(e){this.toggle(e)},
e.prototype.update_=function(){if(this.options_&&this.options_.length>0)for(var e=0;e<this.options_.length;e++){var t=this.options_[e];if(t.selected&&""!==t.value){var s=!0
;this.element_.classList.add(this.CssClasses_.IS_DIRTY),this.listOptionBox_.querySelector("."+this.CssClasses_.IS_SELECTED).classList.remove(this.CssClasses_.IS_SELECTED),
this.listOptionBox_.querySelectorAll("LI")[e].classList.add(this.CssClasses_.IS_SELECTED)}}s||this.element_.classList.remove(this.CssClasses_.IS_DIRTY),this.checkDisabled(),this.checkValidity()},
e.prototype.checkValidity=function(){
this.select_.validity&&(this.select_.validity.valid?this.element_.classList.remove(this.CssClasses_.IS_INVALID):this.element_.classList.add(this.CssClasses_.IS_INVALID))},
e.prototype.checkValidity=e.prototype.checkValidity,e.prototype.checkDisabled=function(){
this.select_.disabled?this.element_.classList.add(this.CssClasses_.IS_DISABLED):this.element_.classList.remove(this.CssClasses_.IS_DISABLED)},e.prototype.checkDisabled=e.prototype.checkDisabled,
e.prototype.disable=function(){this.select_.disabled=!0,this.update_()},e.prototype.disable=e.prototype.disable,e.prototype.enable=function(){this.select_.disabled=!1,this.update_()},
e.prototype.enable=e.prototype.enable,e.prototype.isDescendant_=function(e,t){for(var s=t.parentNode;null!==s;){if(s===e)return!0;s=s.parentNode}return!1},e.prototype.toggle=function(e){
this.element_.classList.contains(this.CssClasses_.IS_FOCUSED)?e.target&&"LI"===e.target.nodeName&&this.isDescendant_(this.listOptionBox_,e.target)?this.onSelected_(e):this.hide_():this.show_(e)},
e.prototype.show_=function(e){if(this.checkDisabled(),!this.element_.classList.contains(this.CssClasses_.IS_DISABLED)){this.element_.classList.add(this.CssClasses_.IS_FOCUSED),this.closing_=!1,
this.strSearch_="";var t=this.listOptionBox_&&this.listOptionBox_.querySelector("."+this.CssClasses_.IS_SELECTED);t&&(t.parentElement.parentElement.scrollTop=t.offsetTop),
this.boundKeyDownHandler_=this.onKeyDown_.bind(this),this.boundClickDocHandler_=function(t){
t===e||this.closing_||t.target.parentNode===this.element_||t.target.parentNode===this.selectedOption_||this.hide_()}.bind(this),document.addEventListener("keydown",this.boundKeyDownHandler_),
document.addEventListener("click",this.boundClickDocHandler_)}},e.prototype.onKeyDown_=function(e){var t=this.listOptionBox_.querySelectorAll("li:not([disabled])");if(t&&t.length>0&&!this.closing_){
var s,i=Array.prototype.slice.call(t).indexOf(this.listOptionBox_.querySelectorAll("."+this.CssClasses_.IS_SELECTED)[0])
;if(e.keyCode===this.Keycodes_.UP_ARROW||e.keyCode===this.Keycodes_.DOWN_ARROW)-1!==i&&t[i].classList.remove(this.CssClasses_.IS_SELECTED),e.keyCode===this.Keycodes_.UP_ARROW?(e.preventDefault(),
s=i>0?t[i-1]:t[t.length-1]):(e.preventDefault(),s=t.length>i+1?t[i+1]:t[0]),s&&(s.classList.add(this.CssClasses_.IS_SELECTED),this.listOptionBox_.scrollTop=s.offsetTop,
this.lastSelectedItem_=s);else if(e.keyCode!==this.Keycodes_.SPACE&&e.keyCode!==this.Keycodes_.ENTER||!this.lastSelectedItem_){if(e.keyCode===this.Keycodes_.ESCAPE)e.preventDefault(),
document.createEvent?(l=document.createEvent("MouseEvent")).initMouseEvent("click",!0,!0,window,0,0,0,0,0,!1,!1,!1,!1,0,null):l=new MouseEvent("mousedown"),document.body.dispatchEvent(l),
document.createEvent||(l=new MouseEvent("mouseup"),document.body.dispatchEvent(l)),document.body.click();else if(this.validKeyCode_(e.keyCode)){var n=e.which||e.keyCode
;this.strSearch_+=String.fromCharCode(n),this.keyDownTimerId_&&clearTimeout(this.keyDownTimerId_),this.keyDownTimerId_=setTimeout(function(){this.keyDownTimerId_=null,this.strSearch_=""
}.bind(this),300);var a=this.searchByStrIndex_(0);a>-1&&(-1!==i&&t[i].classList.remove(this.CssClasses_.IS_SELECTED),(s=t[a]).classList.add(this.CssClasses_.IS_SELECTED),
this.listOptionBox_.scrollTop=s.offsetTop,this.lastSelectedItem_=s)}}else{var l;e.preventDefault(),
document.createEvent?(l=document.createEvent("MouseEvent")).initMouseEvent("click",!0,!0,window,0,0,0,0,0,!1,!1,!1,!1,0,null):l=new MouseEvent("mousedown"),this.lastSelectedItem_.dispatchEvent(l),
document.createEvent||(l=new MouseEvent("mouseup"),this.lastSelectedItem_.dispatchEvent(l))}}},e.prototype.searchByStrIndex_=function(e){
for(var t=this.strSearch_,s=new RegExp("^"+t+"."),i=-1,n=this.optionsArr_,a=0;a<n.length;a++)if(s.test(n[a])){i=a;break}return-1!=i?this.optionsMap_[this.optionsArr_[i]]:-1},
e.prototype.validKeyCode_=function(e){return e>47&&e<58||32===e||13===e||e>64&&e<91||e>95&&e<112||e>185&&e<193||e>218&&e<223},e.prototype.hide_=function(){
this.element_.classList.remove(this.CssClasses_.IS_FOCUSED),this.closing_=!0,this.strSearch_="",this.boundClickDocHandler_&&document.removeEventListener("click",this.boundClickDocHandler_),
this.boundKeyDownHandler_&&document.removeEventListener("keydown",this.boundKeyDownHandler_),this.update_()},e.prototype.init=function(){if(this.element_){
this.element_.classList.remove(this.CssClasses_.IS_DIRTY),this.lastSelectedItem_=null,this.label_=this.element_.querySelector("."+this.CssClasses_.LABEL),
this.select_=this.element_.querySelector("."+this.CssClasses_.SELECT);var e=document.createElement("div");e.classList.add(this.CssClasses_.SELECTED_BOX),e.tabIndex=1,this.selectedOption_=e
;var t=document.createElement("span");t.tabIndex=-1,t.classList.add("mdl-selectfield__arrow-down__container");var s=document.createElement("span");s.classList.add("mdl-selectfield__arrow-down"),
s.tabIndex=-1,t.appendChild(s),e.appendChild(t);var i=document.createElement("span");i.classList.add(this.CssClasses_.SELECTED_BOX_VALUE),i.tabIndex=-1,e.appendChild(i),this.selectedOptionValue_=i,
this.element_.appendChild(this.selectedOption_);var n=this.element_.classList.contains(this.CssClasses_.IS_INVALID);this.makeElements_(),this.boundClickHandler=this.onClick_.bind(this),
this.boundFocusHandler=this.onFocus_.bind(this),this.boundBlurHandler=this.onBlur_.bind(this),this.element_.addEventListener("click",this.boundClickHandler),
this.select_.addEventListener("focus",this.boundFocusHandler),this.select_.addEventListener("blur",this.boundBlurHandler),n&&this.element_.classList.add(this.CssClasses_.IS_INVALID),
this.checkDisabled()}},e.prototype.refreshOptions=function(){this.mdlDowngrade_(),this.setDefaults_(),this.init()},e.prototype.clearElements_=function(){},e.prototype.makeElements_=function(){
if(this.select_&&(this.options_=this.select_.querySelectorAll("option"),this.select_.style.opacity="0",this.select_.style.zIndex="-1",
0===this.options_.length&&(this.options_=[document.createElement("option")]),this.options_.length)){var e=document.createElement("div"),t='<ul tabindex="-1">',s=""
;e.classList.add(this.CssClasses_.LIST_OPTION_BOX),e.tabIndex="-1";for(var i=0;i<this.options_.length;i++){var n=this.options_[i],a=(n.textContent||"").toUpperCase().replace(/( )|(\n)/g,""),l=""
;this.optionsMap_[a]=i,this.optionsArr_.push(a),n.selected&&""!==n.textContent&&(this.element_.classList.add(this.CssClasses_.IS_DIRTY),this.selectedOptionValue_.textContent=n.textContent,
l+=this.CssClasses_.IS_SELECTED),n.disabled&&(l+=""!==l?" "+this.CssClasses_.IS_DISABLED:this.CssClasses_.IS_DISABLED),s+='<li class="'+l+'" data-value="'+i+'" tabindex="-1">'+n.textContent+"</li>"}
t+=s+"</ul>",e.innerHTML=t,this.element_.appendChild(e),this.listOptionBox_=e,window.MutationObserver&&(this.observer_=new MutationObserver(function(e){e.forEach(function(e){
"childList"===e.type&&this.refreshOptions()}.bind(this))}.bind(this)),this.observer_.observe(this.select_,{attributes:!0,childList:!0,characterData:!0}))}},e.prototype.mdlDowngrade_=function(){
this.element_.removeEventListener("click",this.boundClickHandler),this.select_.removeEventListener("focus",this.boundFocusHandler),this.select_.removeEventListener("blur",this.boundBlurHandler),
this.listOptionBox_&&this.element_.removeChild(this.listOptionBox_),this.selectedOption_&&this.element_.removeChild(this.selectedOption_),this.element_.removeAttribute("data-upgraded"),
this.select_.style.opacity="1",this.select_.style.zIndex="inherit",this.observer_&&this.observer_.disconnect()},e.prototype.mdlDowngrade=e.prototype.mdlDowngrade_,
e.prototype.mdlDowngrade=e.prototype.mdlDowngrade,componentHandler.register({constructor:e,classAsString:"MaterialSelectfield",cssClass:"mdl-js-selectfield",widget:!0})}();"use strict"
;let config,applicationServerKey="BHnrqPBEjHfdNIeFK5wdj0y7i5eGM2LlPn62zxmvN8LsBTFEQk1Gt2zrKknJQX91a8RR87w8KGP_1gDSy8x6U7s";class MaterialLightParser{createButton(e){
let t=void 0!==e.id?e.id:e.trigger,s=`\n\t\t<div>\n\t\t\t<label for="${t}" class="mdl-list__item mdl-js-ripple-effect">\n\t\t\t\t<div class="mdl-button__label">\n\t\t\t\t\t<button class="mdl-button mdl-js-button mdl-js-ripple-effect ${void 0!==e.class?e.class:""}" id="${t}" value="${e.value}" data-action="${e.action}" data-method="${e.method}" data-trigger="${e.trigger}">`
;return e.icon&&(s+=`<i class="material-icons mdl-list__item-icon">${e.icon}</i>`),s+=`\n\t\t\t\t\t${e.label}</button>\n\t\t\t\t</div>\n\t\t\t</label>\n\t\t</div>`}createImage(e){
return`<img src="${e.src}" alt="${e.alt}" />`}createHeaderLink(e){let t=""
;return void 0!==e.spacer?t+='<div class="mdl-menu__item">&nbsp;</div>':(t+=`<a class="mdl-navigation__link  ${void 0!==e.class?e.class:""}" href="${e.link}">`,
t+='<span class="mdl-list__item-primary-content">',e.icon&&(t+=`<i class="material-icons mdl-list__item-icon">${e.icon}</i>`),t+=`${e.name}</span></a>`),t}createSection(e){let t=""
;return t+=`<section id="${e.id}" class="mdl-cell--${void 0!==e.width?e.width:"12"}-col">`,
e.title&&(t+=`<div class="mdl-card"><div class=""><h3 class="mdl-card__title-text">${e.title}</h3></div></div>`),e.icon&&(t+=`<i class="material-icons mdl-list__item-icon">${e.icon}</i>`),
e.content&&(t+=this.parse(e.content)),t+="</section>"}createTabContent(e){let t="";return t+=`<a class="mdl-tabs__tab ${e.class}" href="#${e.id}">`,
e.icon&&(t+=`<i class="material-icons mdl-list__item-icon">${e.icon}</i>`),t+=e.name,t+="</a>"}createPanelContent(e){
return`<section class="mdl-tabs__panel mdl-grid mdl-cell--${void 0!==e.width?e.width:"12"}-col ${void 0!==e.class?e.class:""}" id="${e.id}">${this.parse(e.body)}</section>`}createCard(e){
let t=`\n\t\t<div class="mdl-grid mdl-cell--${void 0!==e.width?e.width:"12"}-col">\n\t\t\t<div class="mdl-card mdl-shadow--2dp">\n\t\t\t\t<div class="mdl-card__title">\n\t\t\t\t\t<h3 class="mdl-card__title-text">`
;return e.icon&&(t+=`<i class="material-icons mdl-list__item-icon">${e.icon}</i>`),t+=`\t${e.title}</h3>\n\t\t\t\t</div>`,
e.body&&(t+=`<div class="mdl-list__item--three-line small-padding mdl-card--expand">\n\t\t\t\t\t\t<span class="mdl-list__item-sub-title">${this.parse(e.body)}</span>\n\t\t\t\t\t</div>`),
t+=void 0!==e.actions&&0!==Object.keys(e.actions).length?`<div class="mdl-card__actions mdl-card--border">${this.parse(e.actions)}</div>`:"",t+="</div></div>"}createList(e){let t=""
;return t+=`<li class="mdl-list__item mdl-cell--${void 0!==e.width?e.width:"12"}-col mdl-list__item--three-line">`,t+='\t<span class="mdl-list__item-primary-content">',
e.icon&&(t+=`<i class="material-icons ${e.class}">${e.icon}</i>`),e.label&&(t+=`<span>${e.label}</span>`),
(e.body||e.body_id)&&(t+=`<span class="mdl-list__item-text-body mdl-grid mdl-cell--6-col" id="${void 0!==e.body_id?e.body_id:""}"><span class="mdl-chip"><span class="mdl-chip__text">${e.body}</span></span></span>`),
t+="\t</span>",t+='\t<span class="mdl-list__item-secondary-content mdl-grid mdl-cell--6-col">',t+=this.parse(e),t+="\t</span>",t+="\t</li>"}createText(e){let t=""
;return t+=`<div class="mdl-textfield mdl-js-textfield mdl-grid mdl-cell--${void 0!==e.width?e.width:"12"}-col ${e.class}" id="${e.id}">`,e.icon&&(t+=`<i class="material-icons">${e.icon}</i>`),
t+=`${e.text}`,t+="</div>"}createBadge(e){return`<span class="mdl-badge" data-badge="${e.data}">${e.text}</span>`}createRow(e){
return`<div class="mdl-grid mdl-cell--${void 0!==e.width?e.width:"12"}-col" id="row_${e.row_id}">${this.parse(e)}</div>`}createColumn(e){
return`<div class="mdl-grid mdl-cell--${void 0!==e.width?e.width:"12"}-col" id="col_${e.col_id}">`+(e.text?e.text:"")+this.parse(e)+"</div>"}createInput(e){let t=""
;return t+=`<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label ${!0===e.expandable?"mdl-textfield--expandable":""}">`,
e.icon&&(t+=`<i class="material-icons mdl-list__item-icon" style="position:absolute;">${e.icon}</i>`),
t+=`<input class="mdl-textfield__input" style="padding-left:30px;" type="text" id="${e.id}" placeholder="${e.placeholder}" ${""!==e.pattern?'pattern="'+e.pattern+'"':""}>`,
e.label&&(t+=`<label class="mdl-textfield__label" for="${e.id}">${e.label}</label>`),
e.expandable&&(t+=`<div class="mdl-textfield__expandable-holder"><input class="mdl-textfield__input" type="text" id="${e.id}"><label class="mdl-textfield__label" for="sample-expandable">${e.label}</label></div>`),
e.error&&(t+=`<span class="mdl-textfield__error">${e.error}</span>`),t+="</div>"}createSlider(e){
return`\n\t\t<label for="${e.id}" class="mdl-slider">\n\t\t\t<div class="mdl-slider__label">${e.label}</div>\n\t\t\t<div class="mdl-chip">\n\t\t\t\t<span class="mdl-chip__text" id="label_${e.id}"></span>\n\t\t\t</div>\n\t\t\t<div>\n\t\t\t\t<span class="switchLabels">${e.min}</span>\n\t\t\t\t<input class="mdl-slider mdl-js-slider" type="${void 0!==e.type?e.type:"range"}" id="${e.id}" min="${parseInt(e.min,10)}" max="${parseInt(e.max,10)}" value="${parseInt(e.value,10)}" step="${parseInt(e.step,10)}" data-action="${e.action}" data-label_id="label_${e.id}" data-unit="${e.unit?e.unit:"%s"}">\n\t\t\t\t<span class="sliderLabels" style="right: 20px;">${e.max}</span>\n\t\t\t</div>\n\t\t</label>`
}createSwitch(e){"checked"===e.defaultState?e.valueChecked:e.valueUnchecked
;return`\n\t\t<label for="${e.id}" class="mdl-list__item mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-list__item-secondary-action" data-action="${e.action}" data-valuechecked="${e.valueChecked}" data-valueunchecked="${e.valueUnchecked}">\n\t\t\t<div class="mdl-switch__label">\n\t\t\t\t<div class="mode"></div>\n\t\t\t\t<span class="type"></span>\n\t\t\t\t<span class="value"></span>\n\t\t\t</div>\n\t\t\t<div class="mdl-grid mdl-cell--12-col">\n\t\t\t\t<span class="switchLabels" style="left: 0;position: absolute;">${e.labelUnchecked}</span>\n\t\t\t\t<input type="checkbox" id="${e.id}" class="mdl-switch__input" ${"checked"===e.defaultState?"checked":""}>\n\t\t\t\t<span class="switchLabels" style="right: 0;position: absolute;">${e.labelChecked}</span>\n\t\t\t</div>\n\t\t</label>`
}createSnack(){
return'<div id="snackbar" class="mdl-js-snackbar mdl-snackbar">\n\t\t\t<div class="mdl-snackbar__text"></div>\n\t\t\t<button class="mdl-snackbar__action" type="button"></button>\n\t\t</div>'}
createDrawer(e){let t="";t+=`<div class="mdl-layout__drawer" aria-hidden="true">\n\t\t\t<span class="mdl-layout-title">${e.title}</span>\n\t\t\t<nav class="mdl-navigation mdl-list__item">`
;for(const s of e.links)t+=this.createHeaderLink(s);return t+=void 0!==e.text?this.createText(e.text):"",t+='<div class="mdl-menu__item">&nbsp;</div>',t+="</nav></div>"}createHeader(e){let t=""
;t+=`<header class="mdl-layout__header ${void 0!==e.class?e.class:"mdl-layout__header--waterfall"}">`,
t+='<div class="mdl-layout__drawer-button">\n\t\t\t\t\t\t<i class="material-icons">menu</i>\n\t\t\t\t\t</div>',
t+=`<div class="mdl-layout__header-row">\n\t\t\t\t\t\t<span id="title">${e.drawer.title}</span>\n\t\t\t\t\t\t<div class="mdl-layout-spacer"></div>\n\t\t\t\t\t\t<nav class="mdl-navigation">`
;for(const s of e.links)t+=this.createHeaderLink(s);return t+="\t</nav>",t+="</div>\n\t\t\t\t</header>",t+=this.createDrawer(e.drawer)}createFooter(e){let t=""
;t+='<footer class="mdl-mega-footer">\n\t\t<div class="mdl-mega-footer__middle-section">';for(const s of e.sections){
t+=`<div class="mdl-mega-footer__drop-down-section">\n\t\t\t\t<h1 class="mdl-mega-footer__heading">${s.title}</h1>\n\t\t\t\t<ul class="mdl-mega-footer__link-list">`
;for(const e of s.links)t+=`<li><a href="${e.href}">${e.label}</a></li>`;t+="</ul>\n\t\t\t</div>"}return t+="</div></footer>"}openDialog(e){
return`<dialog class="mdl-dialog" id="dialog_${e.id}">\n\t\t\t<h4 class="mdl-dialog__title">${e.title}</h4>\n\t\t\t<div class="mdl-dialog__content">\n\t\t\t\t<p>${e.body}</p>\n\t\t\t</div>\n\t\t\t<div class="mdl-dialog__actions">\n\t\t\t\t<button type="button" class="mdl-button close">Close</button>\n\t\t\t</div>\n\t\t</dialog>`
}parse(e){let t="";if(void 0!==e){if(e.title&&(document.title="%s - %s".format(void 0!==config.t6.ssdp.friendlyName?config.t6.ssdp.friendlyName:"Unnamed",e.title)),
e.header&&(t+=this.createHeader(e.header)),e.drawer&&(t+=this.createDrawer(e.drawer)),e.rows){t+='<main class="mdl-layout__content-----">';for(const s of e.rows)t+=this.createRow(s);t+="</main>"}
if(e.tab_contents){t+='<main class="mdl-tabs mdl-js-tabs mdl-js-ripple-effect">',t+='<nav class="mdl-tabs__tab-bar">';for(const s of e.tab_contents)t+=this.createTabContent(s);t+="</nav>"
;for(const s of e.tab_contents)t+=this.createPanelContent(s);t+="</main>"}if(e.columns)for(const s of e.columns)t+=this.createColumn(s);if(e.cards)for(const s of e.cards)t+=this.createCard(s)
;if(e.inputs)for(const s of e.inputs)t+=this.createInput(s);if(e.lists){t+='<ul class="mdl-list">';for(const s in e.lists)t+=this.createList(e.lists[s]);t+="</ul>"}
if(e.footer&&(t+=this.createFooter(e.footer)),e.buttons)for(const s of e.buttons)t+=this.createButton(s);if(e.images)for(const s of e.images)t+=this.createImage(s)
;if(e.texts)for(const s of e.texts)t+=this.createText(s);if(e.badges)for(const s of e.badges)t+=this.createBadge(s);if(e.sliders)for(const s of e.sliders)t+=this.createSlider(s)
;if(e.switches)for(const s of e.switches)t+=this.createSwitch(s);if(e.sections)for(const s of e.sections)t+=this.createSection(s);e.button&&(t+=this.createButton(e.button)),
e.image&&(t+=this.createImage(e.image)),e.text&&(t+=this.createText(e.text)),e.badge&&(t+=this.createBadge(e.badge)),e.slider&&(t+=this.createSlider(e.slider)),e.input&&(t+=this.createInput(e.input)),
e.switche&&(t+=this.createSwitch(e.switche))}return t}showSnackbar(e){document.querySelector("#snackbar div.mdl-snackbar__text").innerText=e.message,
document.querySelector("#snackbar button.mdl-snackbar__action").innerText=e.actionText,document.querySelector("#snackbar button.mdl-snackbar__action").removeAttribute("aria-hidden"),
document.querySelector("#snackbar").classList.add("mdl-snackbar--active"),document.querySelector("#snackbar button.mdl-snackbar__action").addEventListener("click",function(e){
document.querySelector("#snackbar").classList.remove("mdl-snackbar--active"),e.preventDefault()},{passive:!1})}showSensorValue(e,t){
document.querySelector("#"+e).innerHTML=`<span class="mdl-chip"><span class="mdl-chip__text">${t}</span></span>`}}let ml=new MaterialLightParser,req=new XMLHttpRequest
;req.onreadystatechange=function(){if(4===this.readyState&&(200===this.status||201===this.status||412===this.status)){let t=JSON.parse(req.responseText)
;if("NOK"===t.status||"nok"===t.status||"OK"===t.status||"ok"===t.status||"UNDERSTOOD"===t.status)if(t.value)document.querySelector("#sensorValue").classList.add("is-not-visible"),
document.querySelector("#sensorValue").classList.remove("is-visible"),ml.showSensorValue("sensorValue",t.sensorValue),document.querySelector("#sensorValue").classList.remove("is-not-visible"),
document.querySelector("#sensorValue").classList.add("is-visible");else{var e={message:t.snack,timeout:2e3,actionHandler:function(e){
document.querySelector("#snackbar").classList.remove("mdl-snackbar--active")},actionText:"Dismiss"};ml.showSnackbar(e)}}},req.onerror=function(e){console.error("Error fetching "+e)},
String.prototype.format=function(){return[...arguments].reduce((e,t)=>e.replace(/%s/,t),this)};let uuid=function(){var e,t,s="";for(e=0;e<32;e++)t=16*Math.random()|0,
8!=e&&12!=e&&16!=e&&20!=e||(s+="-"),s+=(12==e?4:16==e?3&t|8:t).toString(16);return s},actionate=()=>{"undefined"!=typeof componentHandler&&componentHandler.upgradeDom(),
document.getElementById("app").MaterialLayout.init(),
document.getElementById("title").innerText="%s (%s)".format(document.querySelector("#title").innerText,void 0!==config.t6.ssdp.friendlyName?config.t6.ssdp.friendlyName:"Unnamed"),
document.getElementById("config.wifi.ssid").value=config.wifi.ssid,document.getElementById("config.wifi.password").value=config.wifi.password,
document.getElementById("config.t6.t6Object_id").value=config.t6.t6Object_id,document.getElementById("config.t6.t6ObjectSecretKey").value=config.t6.t6ObjectSecretKey,
document.getElementById("config.t6.scheme").value=config.t6.scheme,document.getElementById("config.t6.host").value=config.t6.host,document.getElementById("config.t6.port").value=config.t6.port,
document.getElementById("config.t6.http.localPort").value=config.t6.http.localPort,document.getElementById("config.t6.ssdp.localPort").value=config.t6.ssdp.localPort,
document.getElementById("config.t6.ssdp.advertiseInterval").value=config.t6.ssdp.advertiseInterval,document.getElementById("config.t6.ssdp.presentationURL").value=config.t6.ssdp.presentationURL,
document.getElementById("config.t6.ssdp.friendlyName").value=config.t6.ssdp.friendlyName,document.getElementById("config.t6.ssdp.modelName").value=config.t6.ssdp.modelName,
document.getElementById("config.t6.ssdp.modelNumber").value=config.t6.ssdp.modelNumber,document.getElementById("config.t6.ssdp.deviceType").value=config.t6.ssdp.deviceType,
document.getElementById("config.t6.ssdp.modelURL").value=config.t6.ssdp.modelURL,document.getElementById("config.t6.ssdp.manufacturer").value=config.t6.ssdp.manufacturer,
document.getElementById("config.t6.ssdp.manufacturerURL").value=config.t6.ssdp.manufacturerURL,document.getElementById("config.t6.websockets.host").value=config.t6.websockets.host,
document.getElementById("config.t6.websockets.port").value=config.t6.websockets.port,document.getElementById("config.t6.websockets.path").value=config.t6.websockets.path,
document.getElementById("config.t6.websockets.t6wsKey").value=config.t6.websockets.t6wsKey,document.getElementById("config.t6.websockets.t6wsSecret").value=config.t6.websockets.t6wsSecret,
document.getElementById("config.t6.websockets.messageInterval").value=config.t6.websockets.messageInterval,
document.getElementById("config.t6.websockets.messageIntervalOnceClaimed").value=config.t6.websockets.messageIntervalOnceClaimed,
document.getElementById("config.t6.websockets.reconnectInterval").value=config.t6.websockets.reconnectInterval,
document.getElementById("config.t6.websockets.timeoutInterval").value=config.t6.websockets.timeoutInterval,
document.getElementById("config.t6.websockets.disconnectAfterFailure").value=config.t6.websockets.disconnectAfterFailure,
!0===config.t6.servicesStatus.http?document.getElementById("config.t6.servicesStatus.http").parentElement.parentElement.MaterialSwitch.on():document.getElementById("config.t6.servicesStatus.http").parentElement.parentElement.MaterialSwitch.off(),
!0===config.t6.servicesStatus.audio?document.getElementById("config.t6.servicesStatus.audio").parentElement.parentElement.MaterialSwitch.on():document.getElementById("config.t6.servicesStatus.audio").parentElement.parentElement.MaterialSwitch.off(),
!0===config.t6.servicesStatus.mdns?document.getElementById("config.t6.servicesStatus.mdns").parentElement.parentElement.MaterialSwitch.on():document.getElementById("config.t6.servicesStatus.mdns").parentElement.parentElement.MaterialSwitch.off(),
!0===config.t6.servicesStatus.sockets?document.getElementById("config.t6.servicesStatus.sockets").parentElement.parentElement.MaterialSwitch.on():document.getElementById("config.t6.servicesStatus.sockets").parentElement.parentElement.MaterialSwitch.off(),
!0===config.t6.servicesStatus.ssdp?document.getElementById("config.t6.servicesStatus.ssdp").parentElement.parentElement.MaterialSwitch.on():document.getElementById("config.t6.servicesStatus.ssdp").parentElement.parentElement.MaterialSwitch.off()
;let e=document.querySelectorAll("button");for(var t in e)e[t].childElementCount>-1&&e[t].addEventListener("click",function(e){
let t=e.currentTarget.dataset.action,s=document.getElementById(e.currentTarget.dataset.trigger);if(s){
let i=void 0!==s.parentElement.MaterialTextfield?s.parentElement.MaterialTextfield.input_.value:s.textContent,n=void 0!==s.parentElement.MaterialTextfield&&""!==i||void 0===s.parentElement.MaterialTextfield
;if(void 0!==t&&n){let s=e.currentTarget.dataset.trigger,n={method:void 0!==e.currentTarget.dataset.method?e.currentTarget.dataset.method:"POST"};if("/config"===t)switch(s){case"config.wifi":
n.body=JSON.stringify({wifi:{ssid:document.getElementById("config.wifi.ssid").value,password:document.getElementById("config.wifi.password").value}});break;case"config.t6":n.body=JSON.stringify({t6:{
t6Object_id:document.getElementById("config.t6.t6Object_id").value,t6ObjectSecretKey:document.getElementById("config.t6.t6ObjectSecretKey").value,
scheme:document.getElementById("config.t6.scheme").value,host:document.getElementById("config.t6.host").value,port:document.getElementById("config.t6.port").value}});break;case"config.t6.http":
n.body=JSON.stringify({t6:{http:{localPort:document.getElementById("config.t6.http.localPort").value},servicesStatus:{
http:document.getElementById("config.t6.servicesStatus.http").parentElement.parentElement.querySelector(".mdl-switch__input").checked}}});break;case"config.t6.audio":n.body=JSON.stringify({t6:{
servicesStatus:{audio:document.getElementById("config.t6.servicesStatus.audio").parentElement.parentElement.querySelector(".mdl-switch__input").checked}}});break;case"config.t6.mdns":
n.body=JSON.stringify({t6:{mdns:{localPort:80},servicesStatus:{mdns:document.getElementById("config.t6.servicesStatus.mdns").parentElement.parentElement.querySelector(".mdl-switch__input").checked}}})
;break;case"config.t6.ssdp":n.body=JSON.stringify({t6:{ssdp:{localPort:document.getElementById("config.t6.ssdp.localPort").value,
advertiseInterval:document.getElementById("config.t6.ssdp.advertiseInterval").value,presentationURL:document.getElementById("config.t6.ssdp.presentationURL").value,
friendlyName:document.getElementById("config.t6.ssdp.friendlyName").value,modelName:document.getElementById("config.t6.ssdp.modelName").value,
modelNumber:document.getElementById("config.t6.ssdp.modelNumber").value,deviceType:document.getElementById("config.t6.ssdp.deviceType").value,
modelURL:document.getElementById("config.t6.ssdp.modelURL").value,manufacturer:document.getElementById("config.t6.ssdp.manufacturer").value,
manufacturerURL:document.getElementById("config.t6.ssdp.manufacturerURL").value},servicesStatus:{
ssdp:document.getElementById("config.t6.servicesStatus.ssdp").parentElement.parentElement.querySelector(".mdl-switch__input").checked}}});break;case"config.t6.websockets":n.body=JSON.stringify({t6:{
websockets:{host:document.getElementById("config.t6.websockets.host").value,port:document.getElementById("config.t6.websockets.port").value,
path:document.getElementById("config.t6.websockets.path").value,t6wsKey:document.getElementById("config.t6.websockets.t6wsKey").value,
t6wsSecret:document.getElementById("config.t6.websockets.t6wsKey").value,expiration:1234,messageInterval:document.getElementById("config.t6.websockets.messageInterval").value,
messageIntervalOnceClaimed:document.getElementById("config.t6.websockets.messageIntervalOnceClaimed").value,reconnectInterval:document.getElementById("config.t6.websockets.reconnectInterval").value,
timeoutInterval:document.getElementById("config.t6.websockets.timeoutInterval").value,disconnectAfterFailure:document.getElementById("config.t6.websockets.disconnectAfterFailure").value},
servicesStatus:{sockets:!0}}});break;default:n.body=JSON.stringify({})}""!==t&&fetch(t.format(i),n).then(e=>{if("/description.xml"===t){let t=uuid();e.text().then(function(e){
window.document.body.insertAdjacentHTML("afterbegin",ml.openDialog({id:t,title:"SSDP Description",body:e}));let s=document.getElementById("dialog_"+t);s.showModal||dialogPolyfill.registerDialog(s),
s.showModal(),s.querySelector("button:not([disabled]).close").addEventListener("click",function(){s.close(),s.remove()})})}else e.json().then(function(e){if("OK"===e.status||"UNDERSTOOD"===e.status){
if(void 0!==e.value&&(document.querySelector("#"+s).classList.add("is-not-visible"),document.querySelector("#"+s).classList.remove("is-visible"),ml.showSensorValue(s,e.value),
document.querySelector("#"+s).classList.remove("is-not-visible"),document.querySelector("#"+s).classList.add("is-visible")),void 0!==e.snack){let t={message:e.snack,timeout:2e3,
actionHandler:function(e){document.querySelector("#snackbar").classList.remove("mdl-snackbar--active")},actionText:"Dismiss"};ml.showSnackbar(t)}
void 0!==e.pins&&e.pins.length>-1&&e.pins.map(function(e){
"1"===e[Object.keys(e)].value?document.getElementById(Object.keys(e)).parentElement.MaterialSwitch.on():"0"===e[Object.keys(e)].value&&document.getElementById(Object.keys(e))&&document.getElementById(Object.keys(e)).parentElement.MaterialSwitch.off(),
document.getElementById(Object.keys(e)).parentElement.querySelector(".mdl-switch__label .mode").textContent=e[Object.keys(e)].mode,
document.getElementById(Object.keys(e)).parentElement.querySelector(".mdl-switch__label .type").textContent=e[Object.keys(e)].type,
document.getElementById(Object.keys(e)).parentElement.querySelector(".mdl-switch__label .value").textContent=e[Object.keys(e)].value})}})}),e.preventDefault()}}},{passive:!1})
;let s=document.querySelectorAll("label.mdl-switch");for(var t in s)s[t].childElementCount>-1&&s[t].addEventListener("change",function(e){
let t=!0===e.currentTarget.classList.contains("is-checked")?e.currentTarget.dataset.valuechecked:e.currentTarget.dataset.valueunchecked,s=e.currentTarget.dataset.action
;""!==s&&(req.open(void 0!==e.currentTarget.dataset.method?e.currentTarget.dataset.method:"GET",s.format(t),!0),req.send()),e.preventDefault()},{passive:!1})
;let i=document.querySelectorAll("input.mdl-slider");for(var t in i)i[t].childElementCount>-1&&(i[t].addEventListener("input",function(e){
let t=e.currentTarget.dataset.label_id,s=void 0!==e.currentTarget.dataset.unit?e.currentTarget.dataset.unit:"%",i=e.currentTarget.MaterialSlider.element_.value
;document.getElementById(t).textContent=s.format(i)},{passive:!1}),i[t].addEventListener("change",function(e){let t=e.currentTarget.dataset.action,s=e.currentTarget.MaterialSlider.element_.value
;req.open(void 0!==e.currentTarget.dataset.method?e.currentTarget.dataset.method:"GET",t.format(s),!0),req.send(),e.preventDefault()},{passive:!1}))},materializeLight=e=>ml.parse(e)+ml.createSnack()
;const loadScript=(e,t=!0,s="text/javascript")=>new Promise((i,n)=>{try{const a=document.createElement("script");a.type=s,a.async=t,a.src=e,a.addEventListener("load",e=>{i({status:!0,ev:e})}),
a.addEventListener("error",e=>{n({status:!1,message:"Failed to load the script ＄{FILE_URL}"})}),document.body.appendChild(a)}catch(e){n(e)}});document.onreadystatechange=function(){
fetch("./config.json",{mode:"no-cors"}).then(e=>e.json().catch(e=>{console.log("Fetch Error:",e)})).then(e=>{void 0!==(config=e)&&(console.log("Config loaded successfully (1)"),
document.getElementById("app").innerHTML=materializeLight(ui),actionate())}).catch(e=>{console.log("Config loaded error:",e)}),
fetch("./getValues?pin=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39",{mode:"no-cors"}).then(e=>e.json()).then(e=>{
void 0!==e.pins&&e.pins.length>-1&&e.pins.map(function(e,t){
document.getElementById(Object.keys(e))&&document.getElementById(Object.keys(e)).parentElement&&document.getElementById(Object.keys(e)).parentElement.parentElement.MaterialSwitch&&("1"===e[Object.keys(e)].value?document.getElementById(Object.keys(e)).parentElement.parentElement.MaterialSwitch.on():"0"===e[Object.keys(e)].value&&document.getElementById(Object.keys(e))&&document.getElementById(Object.keys(e)).parentElement.parentElement.MaterialSwitch.off()),
void 0!==document.getElementById(Object.keys(e))&&document.getElementById(Object.keys(e))&&document.getElementById(Object.keys(e)).parentElement.parentElement&&(document.getElementById(Object.keys(e)).parentElement.parentElement.querySelector(".mdl-switch__label .mode").textContent=(e[Object.keys(e)].mode,
e[Object.keys(e)].mode),document.getElementById(Object.keys(e)).parentElement.parentElement.querySelector(".mdl-switch__label .type").textContent=(e[Object.keys(e)].type,e[Object.keys(e)].type),
document.getElementById(Object.keys(e)).parentElement.parentElement.querySelector(".mdl-switch__label .value").textContent=(e[Object.keys(e)].value,e[Object.keys(e)].value))})}).catch(e=>{
console.log("Error",e)})};let registerServiceWorker=function(){return navigator.serviceWorker.register("/sw.js",{scope:"/"}).then(function(e){
return"true"===localStorage.getItem("settings.debug")&&console.log("[ServiceWorker] Registered with scope:",e.scope),
"object"==typeof firebase&&"undefined"!=typeof firebase||"object"==typeof firebase.apps||"number"==typeof firebase.apps.length||firebase.initializeApp(firebaseConfig),
firebase.messaging().useServiceWorker(e),console.log("[pushSubscription]",firebase.messaging().getToken()),firebase.analytics(),e}).catch(function(e){console.log("[ServiceWorker] error occured..."+e)
})},urlBase64ToUint8Array=function(e){const t=(e+"=".repeat((4-e.length%4)%4)).replace(/\-/g,"+").replace(/_/g,"/"),s=window.atob(t),i=new Uint8Array(s.length)
;for(var n=0;n<s.length;++n)i[n]=s.charCodeAt(n);return i},subscribeUserToPush=function(){return registerServiceWorker().then(function(e){const t={userVisibleOnly:!0,
applicationServerKey:urlBase64ToUint8Array(applicationServerKey)};return!!e&&e.pushManager.subscribe(t)}).then(function(e){var t=JSON.parse(JSON.stringify(e))
;return t&&t.keys&&(localStorage.setItem("settings.pushSubscription.endpoint",t.endpoint),localStorage.setItem("settings.pushSubscription.keys.p256dh",t.keys.p256dh),
localStorage.setItem("settings.pushSubscription.keys.auth",t.keys.auth)),console.log("[pushSubscription]",t),e}).catch(function(e){console.log("[pushSubscription]","subscribeUserToPush"+e)})
},askPermission=function(){return new Promise(function(e,t){const s=Notification.requestPermission(function(t){e(t)});s&&s.then(e,t)}).then(function(e){
if("granted"!==e)throw new Error("We weren't granted permission.")})};"https:"===location.protocol&&(askPermission(),subscribeUserToPush());
//# sourceMappingURL=t6show-min.js.map