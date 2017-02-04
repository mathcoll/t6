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
});

var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/58852788bcf30e71ac141187/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();