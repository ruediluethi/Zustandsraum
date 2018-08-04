var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var VTrjSlide = require('../trajektorienslide');
var MSimulation = require('../../models/simulation.js');

module.exports = VTrjSlide.extend({

	xTitle: '&Theta;(t): Winkelauslenkung',
	yTitle: '&Theta;\'(t): Winkelgeschw.',
	xColor: window.BLUE,
	yColor: window.YELLOW,

	postinit: function(options) {
		var self = this;

		self.template = 'slide_pendulum';

		self.simulation = new MSimulation();
		self.simulation.xMin = -Math.PI*2.5;
		self.simulation.xMax = Math.PI*2.5;
		self.simulation.yMin = -Math.PI*2.5;
		self.simulation.yMax = Math.PI*2.5;
		var params = [
			{ value: 1, label: 'c<sub>1</sub>', color: window.BLACK },
			{ value: 0.6666, label: 'c<sub>2</sub>', color: window.BACK }
		];
		self.simulation.set('params', params);
		// y'' = -c1*sin(y) - c2*y'
		self.simulation.set('dx', function(x,y,params){
			return y;
		});
		self.simulation.set('dy', function(x,y,params){
			return -params[0].value*Math.sin(x) - params[1].value*y;
		});
		self.simulation.set('lambda', function(x,y,params){
			var a = 1;
			var b = params[1].value;
			var c = params[0].value*Math.cos(x);

			return window.mitternacht(a,b,c);
		});
		self.simulation.set('stablePoints', [
			function(params){ return [-Math.PI*2,0]; },
			function(params){ return [-Math.PI,0]; },
			function(params){ return [0,0]; },
			function(params){ return [Math.PI,0]; },
			function(params){ return [Math.PI*2,0]; }
		]);
	}

});