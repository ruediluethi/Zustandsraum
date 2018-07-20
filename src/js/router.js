var undef;
var $ = jQuery = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

require('browsernizr/test/history');
var Modernizr = require('browsernizr');

module.exports = Backbone.Router.extend({

    app: undef,

	routes: {
		'': 'requestRoot',
        'slide/:slide': 'requestSlide'
	},

    initialize: function(options){
        var self = this;
        self.app = options.app;
    },

    requestRoot: function(){
        var self = this;

        self.app.showRoot();
        self.ie9fallback();        
    },

    requestSlide: function(slide){
        var self = this;

        self.app.showSlide(slide);
    },

    ie9fallback: function(){
        var self = this;

        // IE9 fallback
        if(!Modernizr.history) {
            var fragment = window.location.href.replace(window.base, '');
            if (fragment.indexOf('#') === -1){
                window.location = window.base + '#' + fragment;
            }
        }
    }
    
});