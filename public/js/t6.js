$(function () {
	var container = $('#sortable, .sortable');
	if (container.length) {
		var sort = Sortable.create(container, {
		    animation: 150,
		    handle: ".handle",
		    //draggable: ".ui-sortable-handle",
		    group: "ul.connectedSortable",
		    onUpdate: function (evt) {
		    	var item = evt.item;
		    }
		});
	}
	$('[data-toggle="tooltip"]').tooltip();
	$('.navbar-toggle').click(function () { $('.navbar-nav form.header-search input[name="q"]').attr('style', 'width:100%;'); $('.navbar-nav:first-child').attr('style', 'padding-top:50px;'); $('.navbar-nav').toggleClass('slide-in'); $('.side-body').toggleClass('body-slide-in'); $('#search').removeClass('in').addClass('collapse').slideUp(300); });
	$('#search-trigger').click(function () { $('.navbar-nav').removeClass('slide-in'); $('.side-body').removeClass('body-slide-in'); });
	$('.material-button-toggle').click(function () {
	    $(this).toggleClass('open');
	    $('.option').toggleClass('scale-on');
	});
});

function testStrength (input) {
	var score = 0;
	if (!input) {
		return score;
	}

	// Letters, numbers, mixed case
	var hasLetters = /[a-z]/i.test(input);
	var hasNumbers = /[0-9]/.test(input);
	if (hasLetters && hasNumbers) {
		score += 0.5;
	}

	var hasBothCases = /[a-z]/.test(input) && /[A-Z]/.test(input);
	if (hasBothCases) {
		score += 0.5;
	}

	
	// Length of password
	if (input.length > 20) {
		score += 1.5;
	}
	else if (input.length > 15) {
		score += 1.25;
	}
	else if (input.length > 11) {
		score += 1;
	}
	else if (input.length > 7) {
		score += 0.5;
	}
	else if (input.length > 3) {
		score += 0.25;
	}

	var hasSpecial = /[^a-z0-9]/i.test(input);
	if (hasSpecial) {
		score += 0.5;
	}

	// has more than just:   - _ + .
	var hasReallySpecial = /[^a-z0-9\-\_\+\.]/i.test(input)
	if (hasReallySpecial) {
		score += 1;
	}

	// Right here, lets just say we don't care about repitition
	// if the password does not have any letters. This is the 
	// most points it can get.
	if (!hasLetters) {
		return score;
	}

	var doesNotRepeat = true;
	for (var i = 0; i < input.length; i++) {
		if (i == 0) {
			continue;
		}
		if (input[i] === input[i - 1]) {
			doesNotRepeat = false;
			break;
		}
	}
	if (doesNotRepeat) {
		score += 0.5;
	}

	// Two in a row should not repeat.
	// Only eligible for non-super-short passwords.
	var isNotPatterned = true;
	var last2 = "";
	var next2 = "";
	if (input.length > 7) {
		for (var i = 0; i < input.length; i++) {
			if (i < 1) {
				continue;
			}

			last2 = input.substring(i - 2, i);
			next2 = input.substring(i, i + 2);

			if (last2 === next2) {
				isNotPatterned = false;
				break;
			}
		}
		if (isNotPatterned) {
			score += 0.5;
		}
	}
	return score;
}

var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/58852788bcf30e71ac141187/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();