var undef;
var $ = jQuery = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

require('browsernizr/test/history');
var Modernizr = require('browsernizr');

var Router = require('./router');

var VSlide = require('./views/slide');
var VTrjSlide = require('./views/trajektorienslide');
var VSlideOscillation = require('./views/slides/oscillation');
var VSlidePendulum = require('./views/slides/pendulum');
var VSlidePredatorPrey = require('./views/slides/predatorprey');
var VSlidePredatorPreyCapacity = require('./views/slides/predatorpreycapacity');
var VSlideDuffing = require('./views/slides/duffing');
var VSlideVanDerPol = require('./views/slides/vanderpol');
var VSlideChaos = require('./views/slides/chaos');
var VSlideGulf = require('./views/slides/gulf');

var colorGulf = '#ed4f80';
var colorNorthSea = '#40a1dd';
var colorFlow = '#49e2a3';
var colorDiff = '#444444';
var colorGray = '#DDDDDD';
var colorYellow = '#f4c237';
var colorOrange = '#d87600';
var colorPurple = '#6c1eaf';
var colorCyan = '#4be0d8';

module.exports = Backbone.View.extend({

	className: 'app',

	router: undef,

	resizeTimeout: undef,

	slidesStack: [
		'titel',
		'schwingung',
		'pendel',
		'raeuberbeute',
		'raeuberbeutekapazitaet',
		'duffing',
		'vanderpol',
		'chaos',
		'gulf'
	],

	slideViews: {
		'titel': new VSlide({ 'template': 'slide_title'}),
		'schwingung': new VSlideOscillation(),
		'pendel': new VSlidePendulum(),
		'raeuberbeute': new VSlidePredatorPrey(),
		'raeuberbeutekapazitaet': new VSlidePredatorPreyCapacity(),
		'duffing': new VSlideDuffing(),
		'vanderpol': new VSlideVanDerPol(),
		'chaos': new VSlideChaos(),
		'gulf': new VSlideGulf(),
	},

	vCrntSlide: undef,
	prevSlide: undef,
	nextSlide: undef,

	events: {
		'click a.route': 'linkClick'
	},

	initialize: function(options) {
		var self = this;

		document.onkeydown = function(evt) {
		    evt = evt || window.event;
		    switch (evt.keyCode) {
		        case 37:
		            self.goBack();
		            break;
		        case 39:
		            self.goForward();
		            break;
		    }
		};
	},


	initRouter: function(){
		var self = this;

		/*
		// this part is for the standalone app
		self.router = {
			navigate: function(url){
				var splittedUrl = url.split('/');
				self.showSlide(splittedUrl[splittedUrl.length-1]);
			}
		};
		self.showRoot();
		return;
		*/

		// init the router and push states
	    self.router = new Router({
	    	app: self
	    });

	    // because of IE9 stupidity
	    if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
		}

	    // start backbone history
	    Backbone.history.start({
	    	pushState: Modernizr.history,
	    	root: window.base.replace(window.location.origin, '')
	    });

	},


	showRoot: function(){
		var self = this;
		self.showSlide(self.slidesStack[0]);
	},

	showSlide: function(slide){
		var self = this;

		if (self.vCrntSlide == undef){ // if there is no current slide, do inital app rendering
			self.render();
		}

		self.showLoading();

		var crntSlideNr = -1;
		var slideNr = -1;
		for (var i = 0; i < self.slidesStack.length; i++){
			if (self.vCrntSlide != undef && self.vCrntSlide.slideName == self.slidesStack[i]){
				crntSlideNr = i+1;
			}
			if (slide == self.slidesStack[i]){
				if (i > 0){
					self.$el.find('#navigation .go-back').show();
					self.prevSlide = 'slide/'+self.slidesStack[i-1];
					self.$el.find('#navigation .go-back').attr('href', self.prevSlide);
				}else{
					self.prevSlide = undef;
					self.$el.find('#navigation .go-back').hide();
				}
				if (i < self.slidesStack.length-1){
					self.$el.find('#navigation .go-forward').show();
					self.nextSlide = 'slide/'+self.slidesStack[i+1];
					self.$el.find('#navigation .go-forward').attr('href', self.nextSlide);
				}else{
					self.nextSlide = undef;
					self.$el.find('#navigation .go-forward').hide();
				}
				slideNr = i+1;
			}
		}

		var direction = (slideNr > crntSlideNr) * 2 - 1;

		if (self.vCrntSlide != undef){
			var oldSlide = self.vCrntSlide;
			self.vCrntSlide.slideOut(-direction, function(){
				oldSlide.destruct();
				oldSlide.remove();
			});
		}

		console.log('SHOW SLIDE ('+crntSlideNr+' -> '+slideNr+'/'+self.slidesStack.length+'): '+slide);

		var newVSlide = self.slideViews[slide];
		newVSlide.slideName = slide;
		self.$el.find('#slides-container').append(newVSlide.$el);
		newVSlide.prerender();
		newVSlide.render();
		newVSlide.resize();

		self.hideLoading();

		self.vCrntSlide = newVSlide; // the new slide is now the current
		self.vCrntSlide.slideIn(direction, function(){
			self.vCrntSlide.postrender();
		});
	},

	initResize: function(){
		var self = this;

		$(window).resize(function(){
			clearTimeout(self.resizeTimeout);
			self.resizeTimeout = setTimeout(function(){
				self.resize();
				self.render(false);
			}, 1000);
		});
	},

	resize: function(){
		var self = this;

		var width = $(window).width();
		var height = $(window).height();
		
	},

	render: function(){
		var self = this;

		self.$el.html(templates['app']({
			
		}));

	},



	goForward: function(e){
		var self = this;
		if ($('body').hasClass('animate-in') || $('body').hasClass('animate-out')){
			return;
		}

		if (e != undef){
			if(e.preventDefault){
	            e.preventDefault();
	        }else{
	            e.returnValue = false;
	        }
	    }

		if (self.nextSlide != undef){
			self.router.navigate(self.nextSlide, {trigger: true});
		}
	},

	goBack: function(e){
		var self = this;
		if ($('body').hasClass('animate-in') || $('body').hasClass('animate-out')){
			return;
		}

		if (e != undef){
			if(e.preventDefault){
	            e.preventDefault();
	        }else{
	            e.returnValue = false;
	        }
	    }

		if (self.prevSlide != undef){
			self.router.navigate(self.prevSlide, {trigger: true});
		}
	},

	linkClick: function(e){
		var self = this;
		if ($('body').hasClass('animate-in') || $('body').hasClass('animate-out')){
			return;
		}

        var $a = $(e.currentTarget);

        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue = false;
        }

        var url = $a.attr('href');	

        window.app.showLoading();
        window.app.router.navigate(url, true);
	},

	showLoading: function(){
		var self = this;
		$('#loading-overlay').stop().fadeIn(500);
	},

	hideLoading: function(){
		var self = this;
		$('#loading-overlay').stop().fadeOut(500);
	}

});