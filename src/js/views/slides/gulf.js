var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var VTrjSlide = require('../trajektorienslide');
var MSimulation = require('../../models/simulation.js');

module.exports = VTrjSlide.extend({

	xTitle: 'Temperatur',
	yTitle: 'Salzgehalt',
	xColor: window.PURPLE,
	yColor: window.ORANGE,

	postinit: function(options) {
		var self = this;

		self.template = 'slide_gulf';

		self.simulation = new MSimulation();
		self.simulation.xMax = 2;
		self.simulation.yMax = 2;
		self.simulation.set('params', [
			{ value: 1.2, label: 'T<sub>01</sub>: Temp. Golf von Mexiko', color: window.RED },  // 0
			{ value: 0.8, label: 'S<sub>01</sub>: Salzgehalt Golf von Mexiko', color: window.RED },  // 1
			{ value: 0.8, label: 'T<sub>02</sub>: Temperatur Nordmeer', color: window.BLUE },        // 2
			{ value: 0.2, label: 'S<sub>02</sub>: Salzgehalt Nordmeer', color: window.BLUE },        // 3
			{ value: 1, label: 'k<sub>T</sub>: Austauschrate Temperatur', color: window.BLACK },   // 4
			{ value: 1, label: 'k<sub>S</sub>: Austauschrate Salzgehalt', color: window.BLACK },   // 5
			{ value: 1, label: 'a: Proportionalitätskonstante', color: window.GREEN },             // 6
			{ value: 1, label: 'b: Temperatur-Dichte', color: window.GREEN },                      // 7
			{ value: 1, label: 'c: Salzgehalt-Dichte', color: window.GREEN }                       // 8
		]);
		self.simulation.set('dx', function(x,y,params){

			var T0 = params[0].value - params[2].value;
			var S0 = params[1].value - params[3].value;
			var kT = params[4].value; 
			var kS = params[5].value; 
			var a = params[6].value;
			var b = params[7].value;
			var c = params[8].value;

			var alpha = 2 * ((a*b)/kT)*T0;
			var beta = 2 * ((a*c)/kT)*S0;
			var gamma = kS/kT;

			var q = alpha*x - beta*y;

			return (1-x) - Math.abs(q)*x;
		});
		self.simulation.set('dy', function(x,y,params){

			var T0 = params[0].value - params[2].value;
			var S0 = params[1].value - params[3].value;
			var kT = params[4].value; 
			var kS = params[5].value; 
			var a = params[6].value;
			var b = params[7].value;
			var c = params[8].value;

			var alpha = 2 * ((a*b)/kT)*T0;
			var beta = 2 * ((a*c)/kT)*S0;
			var gamma = kS/kT;

			var q = alpha*x - beta*y;

			return gamma*(1-y) - Math.abs(q)*y;
		});
		self.simulation.set('lambda', function(x,y,params){
			
			return 0;
		});
		self.simulation.set('stablePoints', [
			
		]);
	}

});