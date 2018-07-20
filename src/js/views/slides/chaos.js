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

		self.template = 'slide_chaos';

		self.simulation = new MSimulation();
		self.simulation.xMin = -2;
		self.simulation.xMax = 2;
		self.simulation.yMin = -2;
		self.simulation.yMax = 2;
		self.simulation.set('params', [
			{ value: 1, label: 'r', color: window.BLACK },
			{ value: 1, label: 'q', color: window.BLACK },
			{ value: 1, label: 'w', color: window.BLACK }
		]);
		self.simulation.set('dx', function(x,y,params){
			return y;
		});
		self.simulation.set('dy', function(x,y,params,t){
			return -x*(x*x - 1) - params[0].value*y + params[1].value*Math.cos(params[2].value*t);
		});
		// self.simulation.set('lambda', function(x,y,params){
		// 	// P = lambda^2 - lambda*a*(1-x^2) + 2axy + 1 = 0
		// 	var a = 1;
		// 	var b = params[0].value*(1-x*x);
		// 	var c = 2*params[0].value*x*y + 1;

		// 	return window.mitternacht(a,b,c);
		// });
		self.simulation.set('stablePoints', [
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
			// function(params, point){ return [point[0],point[1]]; },
		]);
	}

});