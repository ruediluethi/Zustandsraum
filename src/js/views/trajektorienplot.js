var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var d3 = require('d3-browserify'); // ~150KB !!

var pathDrawFunction = d3.svg.line()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .interpolate('linear');

module.exports = Backbone.View.extend({

	className: 'plot',

	title: 'untitled',
	width: 200,
	height: 200,
	paddingLeft: 20,
	paddingRight: 10,
	paddingTop: 10,
	paddingBottom: 20,
	diagramWidth: 0,
	diagramHeight: 0,

	colors: ['#444444'],

	gAxis: undef,
	gField: undef,
	gGraphs: undef,
	gLabels: undef,

	xMin: 0,
	xMax: 3,
	yMin: 0,
	yMax: 3,

	squareSize: 14,

	initialize: function(options) {
		var self = this;

		if (options != undef){
			self.title = options.title;
			if (options.colors != undef){ self.colors = options.colors; }
			if (options.xMin != undef){ self.xMin = options.xMin; }
			if (options.xMax != undef){ self.xMax = options.xMax; }
			if (options.yMin != undef){ self.yMin = options.yMin; }
			if (options.yMax != undef){ self.yMax = options.yMax; }
		}
	},

	render: function(){
		var self = this;

		self.$el.html(templates['plot']({ title: self.title }));
		var $svg = self.$el.find('svg.graphic');
		
		var svg = d3.select($svg[0]);

		self.width = self.$el.width();
		self.height = self.width;

		svg.attr('width', self.width);
		svg.attr('height', self.height);

		self.diagramWidth = self.width - self.paddingLeft - self.paddingRight;
		self.diagramHeight = self.height - self.paddingTop - self.paddingBottom;


		self.gAxis = svg.append('g');
		self.gAxis.attr('transform', 'translate('+self.paddingLeft+','+self.paddingTop+')');

		self.gField = svg.append('g');
		self.gField.attr('transform', 'translate('+self.paddingLeft+','+self.paddingTop+')');

		self.gGraphs = svg.append('g');
		self.gGraphs.attr('transform', 'translate('+self.paddingLeft+','+self.paddingTop+')');

		self.gLabels = svg.append('g');
		self.gLabels.attr('transform', 'translate('+self.paddingLeft+','+self.paddingTop+')');

		self.gGraphs.selectAll('path').data(self.colors)
			.enter()
			.append('path')
			.attr('fill', 'transparent')
			.attr('stroke', function(d){
				return d;
			})
			.attr('stroke-width', 2)
			.attr('opacity', 0.5);

		

		return self;
	},

	renderAxis: function(fieldResolution){
		var self = this;

		var lineLengthX = Math.floor(self.diagramWidth/fieldResolution);
		var lineLengthY = Math.floor(self.diagramHeight/fieldResolution);		

		self.gAxis.append('line')
			.attr('x1', -5)
			.attr('y1', self.diagramHeight - lineLengthY*fieldResolution)
			.attr('x2', -5)
			.attr('y2', self.diagramHeight)
			.attr('stroke-width', 1)
			.attr('stroke','#777777');

		self.gAxis.append('line')
			.attr('x1', 0)
			.attr('y1', self.diagramHeight + 5)
			.attr('x2', lineLengthX*fieldResolution)
			.attr('y2', self.diagramHeight + 5)
			.attr('stroke-width', 1)
			.attr('stroke','#777777');

		
		for (var y = 0; y < fieldResolution+1; y++){

			var lineSize = 2;
			var value = self.yMin + y/fieldResolution*(self.yMax - self.yMin);

			if (Math.abs(Math.round(value)-value) < ((self.yMax - self.yMin)/fieldResolution)*0.5 ){
				self.gAxis.append('text')
					.attr('class', 'small')
					.attr('x', -5-4)
					.attr('y', self.diagramHeight - y*lineLengthY - lineLengthY/2 + 4)
					.attr('text-anchor', 'end')
					.text(Math.round(value));
				lineSize = 3;
			}

			self.gAxis.append('line')
				.attr('x1', -5-lineSize)
				.attr('y1', self.diagramHeight - y*lineLengthY - lineLengthY/2)
				.attr('x2', -5+lineSize)
				.attr('y2', self.diagramHeight - y*lineLengthY - lineLengthY/2)
				.attr('stroke-width', 1)
				.attr('stroke','#777777');
		}

		for (var x = 0; x < fieldResolution+1; x++){
			var lineSize = 2;
			var value = self.xMin + x/fieldResolution*(self.xMax - self.xMin);
			if (Math.abs(Math.round(value)-value) < ((self.xMax - self.xMin)/fieldResolution)*0.5 ){
				self.gAxis.append('text')
					.attr('class', 'small')
					.attr('x', x*lineLengthX + lineLengthX/2)
					.attr('y', self.diagramHeight + 5 + 14)
					.attr('text-anchor', 'middle')
					.text(Math.round(value));
				lineSize = 3;
			}

			self.gAxis.append('line')
				.attr('x1', x*lineLengthX + lineLengthX/2)
				.attr('y1', self.diagramHeight + 5-lineSize)
				.attr('x2', x*lineLengthX + lineLengthX/2)
				.attr('y2', self.diagramHeight + 5+lineSize)
				.attr('stroke-width', 1)
				.attr('stroke','#777777');

		}

	},

	update: function(vectorField,xStack,yStack){
		var self = this;

		var fieldResolution = vectorField.length;

		var lineLengthX = Math.floor(self.diagramWidth/fieldResolution);
		var lineLengthY = Math.floor(self.diagramHeight/fieldResolution);

		self.addGradient(lineLengthX, fieldResolution);

		var fieldData = [];
		for (var x = 0; x < fieldResolution; x++){
			for (var y = 0; y < fieldResolution; y++){

				var dx = vectorField[x][y].dx;
				var dy = vectorField[x][y].dy;

				if (isNaN(dx) || isNaN(dy)){
					continue;
				}

				var vLength = Math.sqrt(dx*dx + dy*dy);

				fieldData.push({
					x: x*lineLengthX,
					y: self.diagramWidth - lineLengthY - y*lineLengthY,
					dx: dx/vLength * lineLengthX,
					dy: dy/vLength * lineLengthY,
					angle: window.atan2(dx,dy)
				});
			}
		}

		
		var rects = self.gField.selectAll('rect').data(fieldData);
		rects.enter()
			.append('rect')
			.attr('x', function(d,i){
				return d.x;
			})
			.attr('y', function(d,i){
				return d.y;
			})
			.attr('width',lineLengthX)
			.attr('height',lineLengthY)
			.attr('stroke', 'transparent')
			.attr('stroke-width', 0);
			// .attr('opacity', 0.8);

		rects.attr('fill', function(d,i){
			return self.getColorOnColorWheel(d.angle / (2*Math.PI));
		});


		/*
		var circle = self.gField.selectAll('circle').data(fieldData);
		circle.enter()
			.append('circle')
			.attr('cx', function(d,i){
				return d.x;
			})
			.attr('cy', function(d,i){
				return d.y;
			})
			.attr('r',Math.floor(lineLengthX/2*0.8))
			.attr('stroke', 'transparent')
			.attr('stroke-width', 0)
			.attr('opacity', 0.7);

		circle.attr('fill', function(d,i){
			return self.getColorOnColorWheel(d.angle / (2*Math.PI));
		});
		*/

		
		var lines = self.gField.selectAll('line').data(fieldData);
		lines.enter()
			.append('line')
			.attr('stroke-width', 1)
			//.attr('stroke','#777777')
			.attr('x1', function(d,i){
				return d.x+lineLengthX/2;
			})
			.attr('y1', function(d,i){
				return d.y+lineLengthY/2;
			});

		lines.attr('x2', function(d,i){
				return d.x+lineLengthX/2 + d.dx;
			})
			.attr('y2', function(d,i){
				return d.y+lineLengthY/2 - d.dy;
			})
			.attr('stroke', function(d,i){
				return '#FFFFFF';
				//return self.getColorOnColorWheel(d.angle / (2*Math.PI));
			});
		

		var endData = [];

		self.gGraphs.selectAll('path').each(function(d, i){
			var path = d3.select(this);

			var pathPoints = [];

			var X = xStack[i];
			var Y = yStack[i];

			for (var t = 0; t < X.length; t++){
				var x = self.diagramWidth * (X[t] - self.xMin)/(self.xMax - self.xMin);
				var y = self.diagramHeight - (self.diagramHeight * (Y[t] - self.yMin)/(self.yMax - self.yMin));

				var distanceToLast = self.diagramWidth*self.diagramHeight;
				if (pathPoints.length > 0){
					var dx = x - pathPoints[pathPoints.length-1].x;
					var dy = y - pathPoints[pathPoints.length-1].y;
					distanceToLast = Math.sqrt(dx*dx + dy*dy);
				}

				if (!isNaN(x) && !isNaN(y) && 
					//x > lineLengthX && x < self.diagramWidth-lineLengthX && 
					//y > lineLengthY && y < self.diagramHeight-lineLengthY && 
					// x > 0 && y > 0 &&
					distanceToLast > 1){

					// keep the plot in range
					if (x < -self.diagramWidth*2){ x = -self.diagramWidth*2; }
					if (x > self.diagramWidth*2){ x = self.diagramWidth*2; }
					if (y < -self.diagramHeight*2){ y = -self.diagramHeight*2; }
					if (y > self.diagramHeight*2){ y = self.diagramHeight*2; }

					pathPoints.push({
						x: x,
						y: y
					});
				}
			}

			if (pathPoints.length > 0){
				endData.push(pathPoints[pathPoints.length-1]);
			}

			path.attr('d', pathDrawFunction(pathPoints));
		});


		var endCircle = self.gGraphs.selectAll('circle').data(endData);
		endCircle.enter()
			.append('circle')
			.attr('r',Math.floor(lineLengthX))
			.attr('stroke', '#FFFFFF')
			.attr('stroke-width', 2)
			.attr('fill', 'transparent')
			.attr('opacity', 0.6);

		endCircle.attr('cx', function(d,i){
			return d.x;
		});
		endCircle.attr('cy', function(d,i){
			return d.y;
		});
	},

	addLabel: function(){
		var self = this;

		self.$el.find('svg.graphic').css({
			marginBottom: 0
		});

		var $xAxis = $('<div class="legend"><svg></svg></div>');
		var $yAxis = $('<div class="legend"><svg></svg></div>');
		self.$el.append($yAxis);
		self.$el.find('svg.graphic').after($xAxis);

		var xAxis = d3.select($xAxis.find('svg')[0]);

		xAxis.attr('width', self.diagramWidth);
		xAxis.attr('height', 17);

		xAxis.append('text')
			.attr('class', 'small')
			.attr('x', self.diagramWidth/2)
			.attr('y', 12)
			.attr('text-anchor', 'middle')
			.text('Temperatur');


		$yAxis.css({
			position: 'absolute',
			right: -17,
			top: 32
		});

		var yAxis = d3.select($yAxis.find('svg')[0]);

		yAxis.attr('height', self.diagramHeight);
		yAxis.attr('width', 17);


		yAxis.append('g')
			.attr("transform", "translate(12," + self.diagramHeight/2 + ")")
			.append('text')
			.attr('class', 'small')
			.attr('x', 0)
			.attr('y', 0)
			.attr("transform", "rotate(-90)")
			.attr('text-anchor', 'middle')
			.text('Salzgehalt');
	},

	addLegend: function(color, text){
		var self = this;

		var $legend = $('<div class="plot-legend"><svg></svg>'+text+'<div>');
		var svgIcon = d3.select($legend.find('svg')[0]);
		svgIcon.attr('width', 14);
		svgIcon.attr('height', 14);
		svgIcon.append('line')
			.attr('x1', 0)
			.attr('y1', 10)
			.attr('x2', 14)
			.attr('y2', 10)
			.attr('stroke-width', 2)
			.attr('stroke', color)
			.attr('opacity', 1);
		self.$el.find('.plot-wrapper').append($legend);
	},

	addGradient: function(iconSize, gradientLength){
		var self = this;

		if (self.$el.find('.plot-wrapper .plot-legend').length > 0){
			return;
		}

		var $legend = $('<div class="plot-legend" style="margin-left: 0px;"><svg></svg><div>');

		// var iconSize = self.squareSize;
		// var gradientLength = 12;

		var svgIcon = d3.select($legend.find('svg')[0]);
		svgIcon.attr('width', self.paddingLeft + iconSize*gradientLength);
		svgIcon.attr('height', 20);

		var gRects = svgIcon.append('g');
		var gLines = svgIcon.append('g');
		
		for (var i = 0; i < gradientLength; i++){

			var x = i*iconSize;
			var y = 4;

			var alpha = i/(gradientLength-1);
			gRects.append('rect')
				.attr('x', self.paddingLeft + x)
				.attr('y', y)
				.attr('width', iconSize)
				.attr('height', iconSize)
				.attr('fill', self.getColorOnColorWheel(alpha));

			alpha = alpha*2*Math.PI;
			var dx = Math.cos(alpha);
			var dy = Math.sin(alpha);
			var l = Math.sqrt(dx*dx + dy*dy);

			gLines.append('line')
				.attr('x1', self.paddingLeft + x+iconSize/2)
				.attr('y1', y+iconSize/2)
				.attr('x2', self.paddingLeft + x+iconSize/2+dx/l*iconSize*0.5)
				.attr('y2', y+iconSize/2+dy/l*iconSize*0.5)
				.attr('stroke', '#FFFFFF')
				.attr('stroke-width', 1);
		}

		self.$el.find('.plot-wrapper').append($legend);
	},

	hexToRgb: function (hex) {
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	},

	componentToHex: function (c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	},

	rgbToHex: function(r, g, b) {
	    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	},


	interpolateColor: function(from, to, value){

		// value = -Math.sin((value)*Math.PI+Math.PI/2)/2+0.5;

	    var rgbFrom = this.hexToRgb(from);
	    var rgbTo = this.hexToRgb(to);

	    var rgbCalced = {
	        r: Math.round(rgbFrom.r + (rgbTo.r - rgbFrom.r)*value),
	        g: Math.round(rgbFrom.g + (rgbTo.g - rgbFrom.g)*value),
	        b: Math.round(rgbFrom.b + (rgbTo.b - rgbFrom.b)*value)
	    };

	    return this.rgbToHex(rgbCalced.r, rgbCalced.g, rgbCalced.b);
	},

	getColorOnColorWheel: function(a){
		var self = this;

		var color = '#000000';

		//var colorAnchors = ['#FF0000','#FF00FF','#0000FF','#00FFFF','#00FF00','#FFFF00'];
		var colorAnchors = ['#dd3a78','#895baa','#40a1dd','#4be0d8','#2ee88f','#e8b22d'];

		if (a <= 1/6){
			color = self.interpolateColor(colorAnchors[0], colorAnchors[1], a*6);
		}else if (a <= 2/6){
			color = self.interpolateColor(colorAnchors[1], colorAnchors[2], (a-1/6)*6);
		}else if (a <= 3/6){
			color = self.interpolateColor(colorAnchors[2], colorAnchors[3], (a-2/6)*6);
		}else if (a <= 4/6){
			color = self.interpolateColor(colorAnchors[3], colorAnchors[4], (a-3/6)*6);
		}else if (a <= 5/6){
			color = self.interpolateColor(colorAnchors[4], colorAnchors[5], (a-4/6)*6);
		}else if (a <= 6/6){
			color = self.interpolateColor(colorAnchors[5], colorAnchors[0], (a-5/6)*6);
		}

		return color;
	}
});