(function () {
	'use strict';

	//After DOM Loaded
	document.addEventListener('DOMContentLoaded', function(event) {
		//On initial load to check connectivity
		if (!navigator.onLine) {
			updateNetworkStatus();
		}
		window.addEventListener('online', updateNetworkStatus, false);
		window.addEventListener('offline', updateNetworkStatus, false);
	});

	//To update network status
	function updateNetworkStatus() {
		if (navigator.onLine) {
			toast('You are now online...', 3000);
		}
		else {
			toast('You are now offline...', 3000);
		}
	}
})();