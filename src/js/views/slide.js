var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

module.exports = Backbone.View.extend({

	className: 'slide',

	template: 'empty',
	slideName: '',

	initialize: function(options) {
		var self = this;

		if (options != undef){
			self.template = options.template;
		}

		self.postinit(options);
	},

	postinit: function(){ }, // will be overwritten by childs

	render: function(){
		var self = this;

		self.$el.html(templates[self.template]({  }));

		// self.postrender();
	},

	prerender: function(){
		var self = this;
		window.app.$el.addClass('full-screen');
	},

	// will be overwritten by childs
	postrender: function(){ },

	resize: function(){
		var self = this;

		var imgSize = $('#slides-container').height() - $('#navigation').height() - self.$el.height();

		self.$el.find('img').css({
			maxHeight: imgSize,
			maxWidth: '100%',
			width: 'auto',
			height: 'auto'
		});

		self.$el.find('img').fadeIn(200);
	},

	slideIn: function(direction, callback){
		var self = this;

		window.scrollTo(0, 0);

		$('#slides-container').css({
			height: $(window).height()
		});

		self.$el.css({
			left: direction * $(window).width(),
			position: 'absolute',
			width: self.$el.width()
		});

		$('body').addClass('animate-in');
		self.$el.animate({
			left: 0
		}, 500, function(){
			$('body').removeClass('animate-in');

			$('#slides-container').css({
				height: 'auto'
			});
			self.$el.css({
				position: 'relative',
				width: '100%'
			});
			callback.call();
		});
	},


	slideOut: function(direction, callback){
		var self = this;

		self.$el.css({
			left: 0,
			position: 'absolute',
			width: self.$el.width()
		});

		$('body').addClass('animate-out');
		self.$el.animate({
			left: direction * $(window).width()
		}, 500, function(){
			$('body').removeClass('animate-out');
			callback.call();
		});
	},

	destruct: function(){ }
});