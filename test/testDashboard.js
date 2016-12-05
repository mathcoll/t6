
var RootURL = 'http://127.0.0.1:3000/';
var viewports = [{
		'name' : 'samsung-galaxy_y-portrait',
		'viewport' : {
			width : 240,
			height : 320
		}
	}, {
		'name' : 'samsung-galaxy_y-landscape',
		'viewport' : {
			width : 320,
			height : 240
		}
	}, {
		'name' : 'iphone5-portrait',
		'viewport' : {
			width : 320,
			height : 568
		}
	}, {
		'name' : 'iphone5-landscape',
		'viewport' : {
			width : 568,
			height : 320
		}
	}, {
		'name' : 'htc-one-portrait',
		'viewport' : {
			width : 360,
			height : 640
		}
	}, {
		'name' : 'htc-one-landscape',
		'viewport' : {
			width : 640,
			height : 360
		}
	}, {
		'name' : 'nokia-lumia-920-portrait',
		'viewport' : {
			width : 240,
			height : 320
		}
	}, {
		'name' : 'nokia-lumia-920-landscape',
		'viewport' : {
			width : 320,
			height : 240
		}
	}, {
		'name' : 'google-nexus-7-portrait',
		'viewport' : {
			width : 603,
			height : 966
		}
	}, {
		'name' : 'google-nexus-7-landscape',
		'viewport' : {
			width : 966,
			height : 603
		}
	}, {
		'name' : 'ipad-portrait',
		'viewport' : {
			width : 768,
			height : 1024
		}
	}, {
		'name' : 'ipad-landscape',
		'viewport' : {
			width : 1024,
			height : 768
		}
	}, {
		'name' : 'desktop-standard-vga',
		'viewport' : {
			width : 640,
			height : 480
		}
	}, {
		'name' : 'desktop-standard-svga',
		'viewport' : {
			width : 800,
			height : 600
		}
	}, {
		'name' : 'desktop-standard-hd',
		'viewport' : {
			width : 1280,
			height : 720
		}
	}, {
		'name' : 'desktop-standard-sxga',
		'viewport' : {
			width : 1280,
			height : 1024
		}
	}, {
		'name' : 'desktop-standard-sxga-plus',
		'viewport' : {
			width : 1400,
			height : 1050
		}
	}, {
		'name' : 'desktop-standard-uxga',
		'viewport' : {
			width : 1600,
			height : 1200
		}
	}, {
		'name' : 'desktop-standard-wuxga',
		'viewport' : {
			width : 1920,
			height : 1200
		}
	},
];

/* Display Home page */
casper.test.begin('Display Home page', 1, function suite(test) {
	casper.start(RootURL, function() {
        test.assertTitle('t6, IoT platform and API', 'Page Title is correct');
        test.assertExists('html body div.container div.col-sm-12 form.form-signin', "Register form is found");
    });

	casper.each(viewports, function(casper, viewport) {
		this.then(function() {
			this.viewport(viewport.viewport.width, viewport.viewport.height);
		});
		this.thenOpen(RootURL, function() {
			this.wait(100);
		});
		this.then(function() {//Display Register page
			this.capture(
					'../test/screenshots/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '/' +
					'Display Home page' + '.png', {
						top : 0,
						left : 0,
						width : viewport.viewport.width,
						height : viewport.viewport.height
					}
			);
		});
	});
	
    casper.run(function() {
        test.done();
    });
});

/* Display Register page */
casper.test.begin('Display Register page', 1, function suite(test) {
	casper.start(RootURL+'register', function() {
        test.assertTitle('Register to t6', 'Page Title is correct');
        test.assertExists('html body div.container div.col-sm-12 form.form-signin', "Register form is found");
    });

	casper.each(viewports, function(casper, viewport) {
		this.then(function() {
			this.viewport(viewport.viewport.width, viewport.viewport.height);
		});
		this.thenOpen(RootURL+'account/register', function() {
			this.wait(100);
		});
		this.then(function() {//Display Register page
			this.capture(
					'../test/screenshots/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '/' +
					'Display Register page' + '.png', {
						top : 0,
						left : 0,
						width : viewport.viewport.width,
						height : viewport.viewport.height
					}
			);
		});
	});
	
    casper.run(function() {
        test.done();
    });
});

/* Register a User */
casper.test.begin('Register a User', 1, function suite(test) {
	casper.start(RootURL+'account/register', function() {
		this.fill('html body div.container div.col-sm-12 form.form-signin', {
			email: '',
			firstName: '',
			lastName: '',
        }, true);
	});
    casper.run(function() {
        test.done();
    });
});

/* Display Login page */
casper.test.begin('Display Login page', 1, function suite(test) {
	casper.start(RootURL+'account/login', function() {
        test.assertTitle('Log-in to t6', 'Page Title is correct');
        test.assertExists('html body div.container div.col-sm-12 form.form-signin', "Login form is found");
    });
    casper.run(function() {
        test.done();
    });
});

/* Login a User */
casper.test.begin('Login a User', 1, function suite(test) {
	casper.start(RootURL+'account/login', function() {
        this.fill('html body div.container div.col-sm-12 form.form-signin', {
        	key: 'wrong_key',
        	secret: 'wrong_password',
        }, true);
    });
	
	casper.then(function() {
        test.assertTitle('Unauthorized, Please log-in again to t6');
        test.assertUrlMatch(/unauthorized/, 'Being redirected to unauthorized page when password is invalid');
    });

    casper.run(function() {
        test.done();
    });
});

/* Logout */
casper.test.begin('Logout', 1, function suite(test) {
	casper.start(RootURL+'account/logout', function() {
        test.assertTitle('Dashboard t6', 'Page Title is correct');
    });
    casper.run(function() {
        test.done();
    });
});

/* Get redirected to unauthorized '/objects' page when not connected */
casper.test.begin('Get redirected to unauthorized \'/objects\' page when not connected', 1, function suite(test) {
	casper.start(RootURL+'objects', function() {
        test.assertExists('html body div.container div.col-sm-12 form.form-signin div.alert.alert-danger', 'Error message is displayed');
        test.assertUrlMatch(/unauthorized/, 'Being redirected to unauthorized page');
    });
    casper.run(function() {
        test.done();
    });
});

/* Display Object list page */
casper.test.begin('Display Object list page', 1, function suite(test) {

});

/* Display an Object page */
casper.test.begin('Display an Object page', 1, function suite(test) {

});

/* Display an Object public page */
casper.test.begin('Display an Object public page', 1, function suite(test) {

});

/* Get redirected from an Object public page when Object is not 'public' */
casper.test.begin('Get redirected from an Object public page when Object is not \'public\'', 1, function suite(test) {

});

/* Display an Object qrprint page */
casper.test.begin('Display an Object qrprint page', 1, function suite(test) {

});

/* Display an Object Edit page */
casper.test.begin('Display an Object Edit page', 1, function suite(test) {

});

/* Update an Object from Edit form */
casper.test.begin('Update an Object from Edit form', 1, function suite(test) {

});

/* Remove an Object */
casper.test.begin('Remove an Object', 1, function suite(test) {

});

/* Add an Object */
casper.test.begin('Add an Object', 1, function suite(test) {

});

/* Display Flows list page */
casper.test.begin('Display Flows list page', 1, function suite(test) {

});

/* Display Flow graph page */
casper.test.begin('Display Flow graph page', 1, function suite(test) {

});

/* Remove a Flow */
casper.test.begin('Remove a Flow', 1, function suite(test) {

});

/* Add a Flow */
casper.test.begin('Add a Flow', 1, function suite(test) {

});

/* Display Profile page */
casper.test.begin('Display Profile page', 1, function suite(test) {

});

/* Search for Objects and Flows */
casper.test.begin('Search for Objects and Flows', 1, function suite(test) {

});

/* Display decision-rules page */
casper.test.begin('Display decision-rules page', 1, function suite(test) {

});

/* Save decision rule */
casper.test.begin('Save decision rule', 1, function suite(test) {

});

/* Display About page */
casper.test.begin('Display About page', 1, function suite(test) {

});

/* Display Dashboard page */
casper.test.begin('Display Dashboard page', 1, function suite(test) {

});




casper.test.begin('Casperjs.org is first ranked', 1, function suite(test) {
    casper.start(RootURL, function() {
        this.fill('form[action="/search"]', {
            q: "casperjs"
        }, true);
    });

    casper.then(function() {
        test.assertSelectorContains(".g", "casperjs.org", "casperjs.org is first ranked");
    });

    casper.run(function() {
        test.done();
    });
});