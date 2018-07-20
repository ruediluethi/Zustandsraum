var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var VTrjSlide = require('../trajektorienslide');
var MSimulation = require('../../models/simulation.js');

module.exports = VTrjSlide.extend({

	xTitle: 'x<sub>1</sub> = x : Auslenkung',
	yTitle: 'x<sub>2</sub> = x&#775; : Geschwindigkeit',
	xColor: window.BLUE,
	yColor: window.YELLOW,

	postinit: function(options) {
		var self = this;

		self.template = 'slide_oscillation';

		self.simulation = new MSimulation();
		self.simulation.xMin = -4;
		self.simulation.xMax = 4;
		self.simulation.yMin = -4;
		self.simulation.yMax = 4;
		var params = [
			{ value: 1, label: 'm: Masse', color: window.BLACK },
			{ value: 1, label: 'd: Dämpfung', color: window.BACK },
			{ value: 3, label: 'c: Federkonstante', color: window.BACK }
		];
		self.simulation.set('params', params);
		self.simulation.set('dx', function(x,y,params){
			return y;
		});
		self.simulation.set('dy', function(x,y,params){
			return 1/params[0].value * ( -params[1].value*y - params[2].value*x );
		});
		self.simulation.set('lambda', function(x,y,params){
			var a = 1;
			var b = params[1].value/params[0].value;
			var c = params[2].value/params[0].value;

			return window.mitternacht(a,b,c);
		});
		self.simulation.set('stablePoints', [ function(params){ return [0,0]; } ]);
	}

});