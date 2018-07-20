var undef;
var $ = jQuery = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

module.exports = Backbone.Model.extend({

	simulationDuration: 10,
	trajectoriesAmount: 9,
	fieldResolution: 20,

	xMin: 0,
	xMax: 3,
	yMin: 0,
	yMax: 3,

	defaults: {
		startPoints: [],
		params: [],
		lambdas: [],
		stablePoints: [],
		dx: function(x,y,constValues){
			return 1;
		},
		dy: function(x,y,constValues){
			return 1;
		},
		lambda: function(x,y,constValues){
			return [];
		}
	},

	simulate: function(){

		var dt = 0.01;

		var Xstack = [];
		var Ystack = [];
		var t;

		var sqrtTrjAmount = Math.sqrt(this.trajectoriesAmount);
		var deltaX = (this.xMax - this.xMin)/(sqrtTrjAmount+1);
		var deltaY = (this.yMax - this.yMin)/(sqrtTrjAmount+1);

		// trajectories
		var startPoints = [];
		for (var k = 0; k < sqrtTrjAmount; k++){
			for (var l = 0; l < sqrtTrjAmount; l++){

				// start values
				var x = [0.0001 + this.xMin + deltaX*(k+1)]; // prey
				var y = [0.0001 + this.yMin + deltaY*(l+1)]; // predator
				startPoints.push([x[0],y[0]]);

				t = [0];
				for(var i = 0; i < this.simulationDuration/dt; i++){
					var dx = this.get('dx').call(null, x[i], y[i], this.get('params'), t[i]) * dt;
					var dy = this.get('dy').call(null, x[i], y[i], this.get('params'), t[i]) * dt;
					x[i+1] = x[i] + dx;
					y[i+1] = y[i] + dy;
					t[i+1] = t[i] + dt;
				}

				Xstack.push(x);
				Ystack.push(y);
			}
		}

		// vector field
		var vectorField = [];
		for (var k = 0; k < this.fieldResolution; k++){
			vectorField.push([]);
			for (var l = 0; l < this.fieldResolution; l++){
				var x = 0.0001 + this.xMin + k/this.fieldResolution * (this.xMax - this.xMin);
				var y = 0.0001 + this.yMin + l/this.fieldResolution * (this.yMax - this.yMin);
		        vectorField[k][l] = {
		        	'dx': this.get('dx').call(null, x, y, this.get('params')),
		        	'dy': this.get('dy').call(null, x, y, this.get('params'))
		        };
			}
		}

		this.set('startPoints', startPoints);
		this.set('Xstack', Xstack);
		this.set('Ystack', Ystack);
		this.set('time', t);
		this.set('vectorField', vectorField);

		this.trigger('simulationend');
	},

	setAndSimulate: function(key, val){
		this.set(key,val);
		this.simulate();
	}

});