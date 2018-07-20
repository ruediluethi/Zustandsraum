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

		self.template = 'slide_vanderpol';

		self.simulation = new MSimulation();
		self.simulation.xMin = -4;
		self.simulation.xMax = 4;
		self.simulation.yMin = -4;
		self.simulation.yMax = 4;
		self.simulation.set('params', [
			{ value: 1.3, label: 'a', color: window.BLACK }
		]);
		self.simulation.set('dx', function(x,y,params){
			return y;
		});
		self.simulation.set('dy', function(x,y,params){
			return params[0].value*(1-x*x)*y - x;
		});
		self.simulation.set('lambda', function(x,y,params){
			// P = lambda^2 - lambda*a*(1-x^2) + 2axy + 1 = 0
			var a = 1;
			var b = params[0].value*(1-x*x);
			var c = 2*params[0].value*x*y + 1;

			return window.mitternacht(a,b,c);
		});
		self.simulation.set('stablePoints', [
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
			function(params, point){ return [point[0],point[1]]; },
		]);
	}

});