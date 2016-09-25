/**
 * 	Implements a timeline ruler as a diversity axis
 */
// Extend the diversity axis object for the timeline
$.widget( "ui.timeline", $.ui.diversity, 
{
	setMinDate: function(d) 
		{ this.setMinDiversityValue(d); },
		
	getMinDate: function()
		{ return this.getMinDiversityValue(); },
	
	getMaxDate: function()
		{ return this.getMaxDiversityValue(); },

	setMaxDate: function(d)
		{ this.setMaxDiversityValue(d); },
	
	/**
	 * 	Calculate the number of dates between the two dates given
	 * 	@param date1 The first date
	 * 	@param date2 The second date
	 * 	@return The number of days between the two dates
	 */
	_numDaysBetween: function( date1, date2 )
	{
		// Number of milliseconds in a day
		var oneDay = 60*60*24*1000;
		
		// Get the milliseconds of the two days
		var t1 = date1.getTime();
		var t2 = date2.getTime();
		
		return Math.round(Math.abs((t2-t1))/oneDay);	
	},
	
	/**
	 * 	Called to draw the ticks along the main axis.
	 * 	@param ctx The canvas drawing context
	 */
	_drawTicks: function( ctx )
	{
		if( this.options.drawYearTicks ||
			this.options.drawMonthTicks ||
			this.options.drawDayTicks )
		{
			var minDate = this.options.minValue;
			var maxDate = this.options.maxValue;
			var nDays = this._numDaysBetween( minDate, maxDate );
			
			var pixPerDay = this.getWidth() / nDays;
			
			var currentDay = new Date(minDate);
			var currentXPos = 0.0;			
			var y  = this.options.mainAxisYPos - this.options.mainAxisOffset;
			var yl = this.options.yearTicksStrokeLength;
			var ml = this.options.monthTicksStrokeLength;
			var dl = this.options.dayTicksStrokeLength;
						
			while( currentDay.getTime() <= maxDate.getTime() )
			{
				// If it's a year tick
				if( currentDay.getDate() == 1 && currentDay.getMonth() == 0 &&
					this.options.drawYearTicks )
				{
					ctx.strokeStyle = this.options.yearTicksStrokeStyle;
					ctx.lineWidth = this.options.yearTicksStrokeWidth;
					drawPolygon( ctx, [[currentXPos,y-yl], [currentXPos,y+yl]] );
					
					// Draw the year
					if( this.options.drawYearLabels )
					{
						var label = currentDay.format("yyyy");
						var labelDim = ctx.measureText( label );
						ctx.font = this.options.yearLabelFont;				
						ctx.fillStyle = this.options.yearTicksStrokeStyle;
						ctx.fillText( label, currentXPos+ctx.lineWidth+2, 
							y+ml+this.options.yearLabelOffset );
					}
				}
				else
				// If it's a month tick
				if( currentDay.getDate() == 1 && this.options.drawMonthTicks )
				{
					ctx.strokeStyle = this.options.monthTicksStrokeStyle;
					ctx.lineWidth = this.options.monthTicksStrokeWidth;
					drawPolygon( ctx, [[currentXPos,y-ml], [currentXPos,y+ml]] );
					
					// Draw the month name
					if( this.options.drawMonthLabels )
					{
						var label = currentDay.format("mmmm");
						var labelDim = ctx.measureText( label );
						ctx.font = this.options.monthLabelFont;
						ctx.fillStyle = this.options.monthTicksStrokeStyle;
						ctx.fillText( label, currentXPos+ctx.lineWidth+2, 
							y+ml+this.options.monthLabelOffset );
					}
				} 
				else
				// If it's a day tick
				if( this.options.drawDayTicks )
				{
					// Draw the day
					var nDays = this.options.drawEveryNDayTicks;
					if( (currentDay.getDate() % nDays) == 0 )
					{
						ctx.strokeStyle = this.options.dayTicksStrokeStyle;
						ctx.lineWidth = this.options.dayTicksStrokeWidth;
						drawPolygon( ctx, [[currentXPos,y-dl], [currentXPos,y+dl]] );
					}				
				}
			
				currentDay.setDate( currentDay.getDate()+1 );
				currentXPos += pixPerDay;
			}
		}
	},
	
	/**
	 *	Gives the absolute position of the given date on the current timeline.
	 *  That is, it includes the left offset of the timeline within the window.
	 *  
	 *  @param date The date to find the position of
	 */
	getObjectPosition: function( date )
	{
		// Calculate the number of days between the max and min dates
		var minDate = this.options.minValue;
		var maxDate = this.options.maxValue;
		var nDays = this._numDaysBetween( minDate, maxDate );
		
		// Work out how many pixels per day at the current size
		var pixPerDay = this.getWidth() / nDays;
		
		// Work out the number of days between the start of the timeline
		// and the date we're trying to work out.
		var c = this._numDaysBetween( minDate, date );
		
		// Get the absolute offset of the left side of the timeline
		var bodge = 8;
		var left = this.element.offset().left - bodge;
		
		// The number of pixels per day, times the number of
		// days between the start of the timeline and the date we're
		// looking for, plus the absolute left side of the timeline
		return c * pixPerDay + left;
	}
} );

$.ui.timeline.prototype.options = $.extend( {}, $.ui.diversity.prototype.options,
{
	/** The minimum date displayed */
	minValue : new Date(2010,0,1),
		
	/** The maximum date displayed */
	maxValue : new Date(2010,0,2),
	
	/** Whether to display the day ticks */
	drawDayTicks: true,
	drawDayLabels: false,
	
	/** Sometimes it can be useful to only draw SOME of the
	    day ticks. Set the number here. */
	drawEveryNDayTicks: 10,
	
	/** The style of the day ticks */
	dayTicksStrokeStyle: "#FFF",
	dayTicksStrokeWidth: 1,
	dayTicksStrokeLength: 5,
	dayLabelFont: "8pt Helvetiker, sans-serif",
	dayLabelOffset: 8,
	
	/** Whether to display the month ticks */
	drawMonthTicks: true,
	drawMonthLabels: false,
	
	/** The style of the month ticks */
	monthTicksStrokeStyle: "#FFF",
	monthTicksStrokeWidth: 3,
	monthTicksStrokeLength: 9,
	monthLabelFont: "10pt Helvetiker, sans-serif",
	monthLabelOffset: 10,
	
	/** Whether to display the year ticks */
	drawYearTicks: true,
	drawYearLabels: true,
	
	/** The style of the year ticks */
	yearTicksStrokeStyle: "#FFF",
	yearTicksStrokeWidth: 5,
	yearTicksStrokeLength: 15,
	yearLabelFont: "12pt Helvetiker, sans-serif",
	yearLabelOffset: 12,
	
	title: "Time"
} );
