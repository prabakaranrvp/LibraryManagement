$(document).ready(function() {
	window.onhashchange =function(){
		loadTemplate();
	};
	loadTemplate();
});

const loadTemplate = function() {
	var currHash = (window.location.hash.length>0)?window.location.hash:'#dashboard';
	$('ul.side-nav li').removeClass();
	var titleElem = $('.side-nav').find("a[href='" + currHash.split('/')[0] + "']");
	$(titleElem).parent().addClass('active');
	$('.page-header').text($(titleElem).text());
	$.get('/templates/'+ currHash.split('/')[0].replace('#','') +'.template',{}, function(data) {
		$('#div-main-container').html(data);
	});
}