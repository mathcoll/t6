(function (exports) {
  'use strict';

  var toastContainer = document.querySelector('.toast__container');

  //To show notification
  function toast(msg, options) {
    if (!msg) return;

    options = options || {timeout:3000, type: 'error'};
    // error = error, done, warning, help, info

    var toastMsg = document.createElement('div');
    toastMsg.className = 'toast__msg';
    var icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.textContent = options.type;
    var span = document.createElement('span');
    span.textContent = msg;
    toastMsg.appendChild(icon);
    toastMsg.appendChild(span);
    toastContainer.appendChild(toastMsg);

    //Show toast for 3secs and hide it
    setTimeout(function () {
      toastMsg.classList.add('toast__msg--hide');
    }, options.timeout);

    //Remove the element after hiding
    toastMsg.addEventListener('transitionend', function (event) {
      event.target.parentNode.removeChild(event.target);
    });
  }

  exports.toast = toast; //Make this method available in global
})(typeof window === 'undefined' ? module.exports : window);