/**
 * 	Implements a diversity axis ruler
 */
var DiversityAxis =
{
		getWidth: function() 
			{ return this.options.width; },
		
		setWidth: function(w) 
			{ this._setOption('width',w); this.element.width(w); this.update(); },

		getHeight: function() 
			{ return this.options.height; },
		
		setHeight: function(h) 
			{ this._setOption('height',h); this.element.height(h); this.update(); },
		
		setMinDiversityValue: function(d) 
			{ this._setOption('minValue',d); this.update(); },
			
		getMinDiversityValue: function()
			{ return this.options.minValue; },
		
		getMaxDiversityValue: function()
			{ return this.options.maxValue; },

		setMaxDiversityValue: function(d)
			{ this._setOption('maxValue',d); this.update(); },
		
		/**
		 * 	Add an object which this object should update its position.
		 * 	As the display is updated, objects will be shifted around
		 * 	to match their position on the axis. Shifting is done using
		 * 	css(left) with the offset of the canvas included in the left;
		 * 	that means the location of the containing element for the
		 * 	object needs to be positioned at zero x-position. The passed object
		 * 	should have a member 'object' which contains the actual element
		 * 	to be shifted. It should also have a 'position' member containing
		 * 	the position of the object which will determine where it is positioned
		 * 	on the diversity axis. It should also contain 'yPosition' which
		 * 	will determine where on the vertical axis it is positioned (the
		 * 	widget does not alter this).
		 * 
		 * 	@param o The object to add
		 */
		addObject: function(o)
			{ this.options.objects.push( o ); this.update(); },
		
		/**
		 *	Default constructor
		 */
		_create: function()
		{
			this.setupCanvas();
		},
				
		/**
		 *	Set up the elements in the widget
		 */
		setupCanvas: function()
		{
			var caption = $("<p id='"+this.element.attr("id")+
					"_caption' class='caption'>"+this.options.title+"</p>");
			
			if( this.options.titlePosition == "above" && 
					this.options.title != "" )
				this.element.append( caption );
			
			this.element.append( "<canvas id='"+
				this.element.attr("id")+"_canvas' />" );
		
			if( this.options.titlePosition == "below" && 
					this.options.title != "" )
				this.element.append( caption );
		
			this.setWidth( this.getWidth() );
			this.setHeight( this.getHeight() );
			
			this.update();
		},
			
		/**
		 *	Goes through each of the objects in this.options.objects
		 *	and sets the x position to the correct position based on
		 *  this.options.objects[x].position as determined by getObjectPosition()
		 */
		_updateObjectPositions: function()
		{
			// Loop through the objects which are being followed.
			for( o in this.options.objects )
			{
				// Get the position of this object using its diversity value. This position
				// will be based on the range of the axis.
				var xx = this.getObjectPosition( this.options.objects[o].position );
				
				// Set its left position to be the new position.
				this.options.objects[o].object.css( "left", xx + this.options.positionOffset[0] );
				this.options.objects[o].object.css( "top", this.options.objects[o].yPosition + this.options.positionOffset[1] );
			}
		},
		
		/**
		 * 	Called every time there's an update to the widget and can
		 * 	be called publically if required.  This function will redraw
		 * 	the diversity axis and update all the object positions which are
		 * 	being followed.
		 */
		update: function()
		{
			// Update the position of the objects being followed
			this._updateObjectPositions();
			
			// Get the canvas and its context
			var canvas = document.getElementById(this.element.attr("id")+"_canvas");
			canvas.width = this.getWidth();
			canvas.height = this.getHeight();
			var ctx = canvas.getContext('2d');

			// We'll put the axis in the centre of the display
			this._setOption( "mainAxisYPos", this.getHeight()/2 );
			
			// Draw the main axis
			if( this.options.drawMainAxis )
				this._drawMainAxis( ctx );
			
			if( this.options.drawTicks )
				this._drawTicks( ctx );
		},
		
		/**
		 * 	Called to draw the main axis
		 * 	@param ctx the canvas drawing context
		 */
		_drawMainAxis: function( ctx )
		{
			// set the style
			ctx.strokeStyle = this.options.mainAxisStrokeStyle;
			ctx.lineWidth = this.options.mainAxisStrokeWidth;
			
			// Calculate the positions
			var x1 = 0; 
			var y1 = this.options.mainAxisYPos - this.options.mainAxisOffset;
			var x2 = this.getWidth(); 
			var y2 = y1;
			
			// Draw the axis (as a rectangle which will show a fat line)
			drawPolygon( ctx, [[x1,y1], [x2,y2]] );
		},
		
		/**
		 * 	Called to draw the ticks along the main axis.
		 * 	@param ctx The canvas drawing context
		 */
		_drawTicks: function( ctx )
		{
			// We will draw the full height of the canvas
			var ty1 = 0;
			var ty2 = this.getHeight();
			var ty3 = this.getHeight()*(1-this.options.normalTickLength);
			var ty4 = this.getHeight()*this.options.normalTickLength;
			
			var w = this.getWidth();
			var maxDV = this.getMaxDiversityValue();
			var minDV = this.getMinDiversityValue();

			var pixPerUnit = w/(maxDV-minDV);

			// inter-tick spacing in pixels
			var its = pixPerUnit * this.options.tickSpacing;
			
			// This weird multiplication avoids some rounding errors.
			var nSize = 1000;
			var lt = this.options.longTicks*nSize;
			var x = 0.0;
			var dv = minDV*nSize;
			while( x <= w )
			{
				// First assume we're to draw a short tick
				var y1 = ty3;
				var y2 = ty4;
				
				// If it's a whole number of multiples of
				// the long-tick value, draw a long tick
				if( (dv/lt % 1) == 0 )
				{
					if( dv == 0 && this.options.drawVerticalAxis )
					{
						// set the main axis style
						ctx.strokeStyle = this.options.verticalAxisStrokeStyle;
						ctx.lineWidth = this.options.verticalAxisStrokeWidth;
					}
					else
					{
						// set the long tick style
						ctx.strokeStyle = this.options.longTickStrokeStyle;
						ctx.lineWidth = this.options.longTickStrokeWidth;
					}
			
					y1 = ty1;
					y2 = ty2;
					
					if( this.options.drawTickLabels )
					{
						var label = ""+(dv/nSize);
						var labelDim = ctx.measureText( label );
						ctx.font = this.options.tickLabelFont;
						ctx.fillStyle = this.options.tickLabelStyle;
						ctx.fillText( label, x + ctx.lineWidth + 2, 
							y2 + this.options.tickLabelYOffset );
					}
				}
				else
				{
					// set the normal tick style
					ctx.strokeStyle = this.options.normalTickStrokeStyle;
					ctx.lineWidth = this.options.normalTickStrokeWidth;
				}
				
				// Draw the tick
				drawPolygon( ctx, [[x,y1], [x,y2]] );
				
				x += its;
				dv += this.options.tickSpacing*nSize;
			}
		},
		
		/**
		 *	Gives the absolute position of the given value on the current diversity axis.
		 *  That is, it includes the left offset of the timeline within the window.
		 *  
		 *  @param date The value to find the position of
		 */
		getObjectPosition: function( value )
		{
			// Calculate the number of days between the max and min dates
			var minValue = this.options.minValue;
			var maxValue = this.options.maxValue;
			
			// Work out how many pixels per unit at the current size
			var pixPerUnit = this.getWidth() / (maxValue-minValue);
			
			// The position of zero on the diversity axis
			var zeroPosition = -minValue * pixPerUnit;
			
			// Get the absolute offset of the left side of the axis
			var left = this.element.offset().left;

			// We get the position of the value, add on the zero position
			// and offset to the left of the axis			
			return value * pixPerUnit + zeroPosition + left;
		}
};

$.widget( "ui.diversity", DiversityAxis );

$.ui.diversity.prototype.options =
{
	// The default width of the widget
	width: 1000,
	
	// The default height of the widget
	height: 100,

	/** The minimum value displayed */
	minValue : 0.0,
		
	/** The maximum value displayed */
	maxValue : 1.0,

	/** Whether to draw the main axis */
	drawMainAxis: true,
	
	/** The style (colour & width) of the main axis */
	mainAxisStrokeStyle: "#FFF",
	mainAxisStrokeWidth: 3,
	mainAxisOffset: 0,
	
	/** Whether to draw the ticks on the main axis */
	drawTicks: true,
	
	/** The unit value spacing between ticks */
	tickSpacing: 0.1,

	normalTickStrokeStyle: "#FFF",
	normalTickStrokeWidth: 1,
	
	drawTickLabels: true,
	
	tickLabelFont: "8pt Helvetiker, sans-serif",
	tickLabelStyle: "#FFF",
	tickLabelYOffset: -4,
	
	/** Longer ticks at this interval (unit value) */
	longTicks: 0.5,
	
	longTickStrokeStyle: "#FFF",
	longTickStrokeWidth: 2,
	
	/** A percentage value of how long the normal ticks are (compared to the long ones) */
	normalTickLength: 0.75,
	
	/** The minimum distance between any two ticks */
	minTickDistancePx: 10,
	
	drawVerticalAxis: true,
	
	verticalAxisStrokeStyle: '#FFF',
	verticalAxisStrokeWidth: 5,
	
	// The title of the widget	
	title: "Diversity",
	
	/** The objects on the timeline */
	objects: Array(),
	
	/** The amount to offset each object by */
	positionOffset: [0,0]	
};
