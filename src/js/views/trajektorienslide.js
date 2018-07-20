var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var VSlide = require('./slide');
var VValueSlider = require('./valueslider');
var VPlot = require('./plot');
var VTrajektorienPlot = require('./trajektorienplot.js');

var MSimulation = require('../models/simulation.js');

module.exports = VSlide.extend({

	simulation: undef,

	xTitle: 'X-Wert',
	yTitle: 'Y-Wert',
	xColor: window.GREEN,
	yColor: window.RED,

	vSliders: [],

	postinit: function(options) {
		var self = this;

		self.template = 'slide_default_trajectories';

		self.simulation = new MSimulation();
	},

	postrender: function(){
		var self = this;

		window.app.$el.removeClass('full-screen');
		self.renderParams();
		self.renderPlots();

		self.listenTo(self.simulation, 'simulationend', function(){
			self.updateLambdas();
		});

		self.simulation.simulate();
	},

	renderParams: function(){
		var self = this;

		var params = self.simulation.get('params');
		for (var i = 0; i < params.length; i++){
			var vSlider = new VValueSlider({ paramID: i, title: params[i].label, color: params[i].color });
			window.app.$el.find('#parameters .sliders').append(vSlider.render().$el);
			vSlider.setValue(params[i].value);
			vSlider.bind('valueHasChanged', function(crntSlider){
				var newParams = self.simulation.get('params');
				newParams[crntSlider.paramID].value = crntSlider.value;
				self.simulation.setAndSimulate('params', newParams);
			});
			self.vSliders.push(vSlider);
		}

	},

	updateLambdas: function(){
		var self = this;
		var roundFactor = 1000;

		var stablePoints = self.simulation.get('stablePoints');

		if (stablePoints.length == 0){
			window.app.$el.find('#parameters .lambdas').html('');
			return;
		}

		var html = '<p><strong>Gleichgewichtspunkte</strong></p>';
		for (var j = 0; j < stablePoints.length; j++){

			var point = stablePoints[j].call(null, self.simulation.get('params'), self.simulation.get('startPoints')[j]);
			var lambdas = self.simulation.get('lambda').call(null, point[0], point[1], self.simulation.get('params'));

			var stable = true;
			var allZero = true;
			html += '<p>';
			html += '<strong>x = '+Math.round(point[0]*roundFactor)/roundFactor+', y = '+Math.round(point[1]*roundFactor)/roundFactor+'</strong><br>'
			for (var i = 0; i < lambdas.length; i++){
				var lambda = lambdas[i];
				html += '&lambda;<sub>'+(i+1)+'</sub> = ';
				if (lambda.length > 1){
					html += Math.round(lambda[0]*roundFactor)/roundFactor; // real part
					if (lambda[1] >= 0){
						html += ' + ';
					}else{
						html += ' &minus; ';
					}
					html += 'i' + Math.round(Math.abs(lambda[1])*roundFactor)/roundFactor; // imaginary part

					if (lambda[0] > 0){ // not stable if the real part of one lambda is positive
						stable = false;
					}
					if (Math.abs(lambda[0]) > 0.1){ // lambda > epsilon
						allZero = false;
					}
				}else{
					if (lambda > 0){ // not stable if one lambda is positive
						stable = false;
					}
					if (Math.abs(lambda) > 0.1){ // lambda > epsilon
						allZero = false;
					}
					html += Math.round(lambda*roundFactor)/roundFactor; // only real number
				}
				html += '<br>';
			}

			if (allZero){
				html += '&#8658; <span class="oscillate">Schwingung um Punkt</span>';
			}else{
				if (stable){
					html += '&#8658; <span class="stable">Punkt ist stabil</span>';
				}else{
					html += '&#8658; <span class="not-stable">Punkt ist instabil</span>';
				}
			}
			html += '</p>';
		}

		window.app.$el.find('#parameters .lambdas').html(html);
	},

	renderPlots: function(){
		var self = this;

		var alphas = [];
		var xColors = [];
		var yColors = [];
		var trjColors = [];
		for (var i = 0; i < self.simulation.trajectoriesAmount; i++){
			xColors.push(self.xColor);
			yColors.push(self.yColor);
			trjColors.push('#000000');
			alphas.push(0.3);
		}

		var vX = new VPlot({ title: self.xTitle, colors: xColors, alpha: alphas, minValue: self.simulation.xMin, maxValue: self.simulation.xMax, heightScale: 0.5 });
		self.listenTo(self.simulation, 'simulationend', function(){
			vX.update(self.simulation.get('Xstack'), self.simulation.get('time'));
		});
		self.$el.find('.simulation').append(vX.$el);
		vX.render();

		var vY = new VPlot({ title: self.yTitle, colors: yColors, alpha: alphas, minValue: self.simulation.yMin, maxValue: self.simulation.yMax, heightScale: 0.5 });
		self.listenTo(self.simulation, 'simulationend', function(){
			vY.update(self.simulation.get('Ystack'), self.simulation.get('time'));
		});
		self.$el.find('.simulation').append(vY.$el);
		vY.render();

		var vTrjPlot = new VTrajektorienPlot({ title: 'Zustandstrajektorien', colors: trjColors, xMin:self.simulation.xMin, xMax:self.simulation.xMax, yMin:self.simulation.yMin, yMax:self.simulation.yMax});
		self.listenTo(self.simulation, 'simulationend', function(){
			vTrjPlot.update(self.simulation.get('vectorField'), self.simulation.get('Xstack'), self.simulation.get('Ystack'));
		});
		self.$el.find('.trajectories').append(vTrjPlot.$el);
		vTrjPlot.render();
		vTrjPlot.renderAxis(self.simulation.fieldResolution);
		vTrjPlot.addGradient('');
	},

	destruct: function(){
		var self = this;

		for (var i = 0; i < self.vSliders.length; i++){
			self.vSliders[i].remove();
		}

	}

});