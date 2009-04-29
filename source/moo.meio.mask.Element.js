Element.implement({
	
	unmaskedVal : function(){
		return this.get('value').replace(meio.MaskGlobals.init().fixedCharsRegG,'');
	},
	
	mask : function(options){
        return this.set('mask',options);
    },
	
	// http://www.bazon.net/mishoo/articles.epl?art_id=1292
	setRange : function(start,end){
		end = $pick(end,start);
		if (this.setSelectionRange){
			this.setSelectionRange(start, end);
		}
		else{
			var range = this.createTextRange();
			range.collapse();
			range.moveStart('character', start);
			range.moveEnd('character', end - start);
			range.select();
		}
	},

	// adaptation from http://digitarald.de/project/autocompleter/
	getRange : function(){
		if (!Browser.Engine.trident) return {start: this.selectionStart, end: this.selectionEnd};
		var pos = {start: 0, end: 0},
			range = document.selection.createRange();
		pos.start = 0 - range.duplicate().moveStart('character', -100000);
		pos.end = pos.start + range.text.length;
		return pos;
	}
	
});

