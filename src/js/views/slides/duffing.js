var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var VTrjSlide = require('../trajektorienslide');
var MSimulation = require('../../models/simulation.js');

module.exports = VTrjSlide.extend({

	xTitle: 'x',
	yTitle: 'y',
	xColor: window.BLUE,
	yColor: window.RED,

	postinit: function(options) {
		var self = this;

		self.template = 'slide_duffing';

		self.simulation = new MSimulation();
		self.simulation.xMin = -2;
		self.simulation.xMax = 2;
		self.simulation.yMin = -2;
		self.simulation.yMax = 2;
		self.simulation.set('params', [
			{ value: 1, label: 'r', color: window.BLACK }
		]);
		self.simulation.set('dx', function(x,y,params){
			return y;
		});
		self.simulation.set('dy', function(x,y,params){
			return -x * ( x*x - 1 ) - params[0].value*y;
		});
		self.simulation.set('lambda', function(x,y,params){
			var a = 1;
			var b = params[0].value;
			var c = 3*x*x - 1;

			return window.mitternacht(a,b,c);
		});
		self.simulation.set('stablePoints', [
			function(params){ return [-1,0]; },
			function(params){ return [0,0]; },
			function(params){ return [1,0]; }
		]);
	}

});