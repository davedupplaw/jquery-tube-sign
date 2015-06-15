
/*

Copyright (C) 2014 David Dupplaw

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function($) {

var TubeSign = {

	_create: function() {

		this.element.width( this.options.width );
		this.element.height( this.options.height + this.options.signTopDepth );
		this.element.css( 'background', 'black' ).addClass( "sign" );

		var signInfo = undefined;
		var signTop  = undefined;
		this.element.append( signTop  = $('<div>').addClass("signtop").height( this.options.signTopDepth ) );
		this.element.append( signInfo = $('<div>').addClass("signinfo").height( this.options.height ) );

		this.nextPosition = parseInt( signInfo.css("padding-top"), 10 );
	},

	_createRow: function( item ) {

		var rowDiv = $('<div>');
		rowDiv.css( "position", "relative" ).addClass( "signrow" ).css( "overflow", "hidden" );

		this.element.find( ".signinfo" ).css("position","relative").append( rowDiv );

		this.nextPosition += rowDiv.height();

		var items = {};
		if( item ) {
			var items = this._addColumnsToRow( rowDiv, item );

			var leftItem  = rowDiv.find( ".leftcolumn" );
			var rightItem = rowDiv.find( ".rightcolumn" );
			rowDiv.height( Math.max( rightItem.height(), leftItem.height() ) );
		}

		items.row = rowDiv;
		return items;
	},

	_addColumnsToRow: function( rowDiv, item, extraClasses ) {

		var nextPosition = 0;
		rowDiv.find(".leftcolumn").each( function() {
			var maxY = $(this).position().top + $(this).height();
			if( maxY >= nextPosition ) {
				nextPosition = maxY;
			} 
		} );

		var leftItem = undefined;
		rowDiv.append( 
			leftItem = $("<div>")
				.html( item.left )
				.css("position","absolute")
				.css("top", nextPosition )
				.addClass( "leftcolumn" )
		);

		if( extraClasses ) {
			leftItem.addClass( extraClasses );
		}

		var rightItem = undefined;
		rowDiv.append( 
			rightItem = $("<div>")
				.addClass( "rightcolumn" ) 
				.css("position","absolute")
				.css("top", nextPosition )
				.html( item.right )
				.width( this.options.rightColumnWidth )
				.css( "left", rowDiv.width() - this.options.rightColumnWidth )
				.css( "overflow", "hidden" )
		);

		if( extraClasses ) {
			rightItem.addClass( extraClasses );
		}

		return { "left":leftItem, "right":rightItem };
	},

	addFixedItem: function( item, noScroll ) {

		var divs = this._createRow( item );
		
		var leftItem  = divs["left"];
		var rightItem = divs["right"];

		if( !noScroll ) {
			this._animateRow( divs, leftItem.height(), leftItem.height() );
		}
	},

	addRotaList: function( items, timeBetweenRotation, typeOfRotation ) {

		if( items.length == 0 ) {
			return;
		}

		var divs = this._createRow();

		if( typeOfRotation == "continuousScroll" ) {
			var maxH = 0;
			var tops = [];
			var currentTop = 0;

			for( item in items ) {
				var d = this._addColumnsToRow( divs.row, items[item] );

				if( tops.length == 0 ) {
					d.left.css(  "top", d.left.height() );
					d.right.css( "top", d.right.height() );
				}

				tops.push( Math.max( d.left.height(), d.right.height() ) );
				maxH = Math.max( maxH, Math.max( d.left.height(), d.right.height() ) );
			}

			this._addColumnsToRow( divs.row, items[0] );
			divs.row.height( maxH );
		}

		this._updateRota( divs, timeBetweenRotation, typeOfRotation, items, tops, 0, 0 );
	},

	_updateRota: function( divs, timeBetweenRotation, typeOfRotation, items, tops, index, resetTo ) {

		if( typeOfRotation == "clearBeforeEachUpdate" ) {
			var rowWereUpdating = divs.row.empty();
			divs = this._addColumnsToRow( divs.row, items[index] );
			divs.row = rowWereUpdating;
			var h = Math.max( divs.left.height(), divs.right.height() );
			divs.row.height( h );
			this._animateRow( divs, h, h );
			var nextIndex = (index+1)%items.length;
		}
		else {
			this._animateRow( divs, tops[(index+1)%tops.length] );
			var nextIndex = (index+1)%(items.length+1);
		}

		var thisObject = this;
		setTimeout( function(){ 
			if( typeOfRotation == "continuousScroll" && index == items.length ) {
				nextIndex = 1;
				var firstOneTop = divs.row.find('.leftcolumn').first().position().top;
				var diff = firstOneTop - resetTo;
				divs.row.find('.leftcolumn').animate( {top:"-="+diff}, 0 );
				divs.row.find('.rightcolumn').animate( {top:"-="+diff}, 0 );
			}
			
			thisObject._updateRota( divs, timeBetweenRotation, typeOfRotation, items, tops, nextIndex, resetTo ); 
		}, timeBetweenRotation );
	},

	_animateRow: function( divs, by, from ) {

		if( from ) {
			divs.row.find('.leftcolumn').css( "top", from );
			divs.row.find('.rightcolumn').css( "top", from );
		}

		divs.row.find('.leftcolumn').animate( { top: "-="+by }, this.options.scrollDuration, "easeOutQuad" );
		divs.row.find('.rightcolumn').animate( { top: "-="+by }, this.options.scrollDuration, "easeOutQuad" );
	},

	options: {

		width: 400,
		height: 100,
		signTopDepth: 20,
		rightColumnWidth: 100,
		scrollDuration: 2000

	}

}

$.widget( "dd.tubeSign", TubeSign );

})(jQuery);
