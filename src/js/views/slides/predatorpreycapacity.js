var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var VTrjSlide = require('../trajektorienslide');
var MSimulation = require('../../models/simulation.js');

module.exports = VTrjSlide.extend({

	xTitle: 'Beute',
	yTitle: 'Räuber',
	xColor: window.GREEN,
	yColor: window.RED,

	postinit: function(options) {
		var self = this;

		self.template = 'slide_predatorpreycapacity';

		self.simulation = new MSimulation();
		self.simulation.xMax = 4;
		self.simulation.yMax = 4;
		self.simulation.set('params', [
			{ value: 1.6, label: 'a: Wachstumsrate der Beute', color: window.GREEN },
			{ value: 0.8, label: 'b: Sterberate der Beute pro Räuber', color: window.GREEN },
			{ value: 1.3, label: 'c: Reprodukionsrate der Räuber pro Beute', color: window.RED },
			{ value: 1.9, label: 'd: Sterberate der Räuber (ohne Beute)', color: window.RED },
			{ value: 3, label: 'K: Kapazität der Beute', color: window.BLACK }
		]);
		self.simulation.set('dx', function(x,y,params){
			return params[0].value*x*(1-x/params[4].value) - params[1].value*x*y;
		});
		self.simulation.set('dy', function(x,y,params){
			return params[2].value*x*y - params[3].value*y;
		});
		self.simulation.set('lambda', function(x,y,params){
			// lambda^2 + lambda(-a+by-cx+d) + acx-ad+bdy
			a = 1;
			b = -params[0].value + params[1].value*y - params[2].value*x + params[3].value;
			c = params[0].value*params[2].value*x - params[0].value*params[3].value + params[1].value*params[3].value*y;

			return window.mitternacht(a,b,c);
		});
		self.simulation.set('stablePoints', [
			function(params){ return [0,0] },
			function(params){
				return [params[0].value/params[1].value*(1-params[3].value/(params[4].value*params[2].value)), params[3].value/params[2].value];
			}
		]);
	}

});