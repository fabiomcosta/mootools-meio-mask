meio.MaskType.fixed = new Class({
    
    Extends : meio.MaskType,
    
    options : {
        placeHolder : false // can be a char. ex : '_'. This char CAN'T be a fixedChar.
    },
    
    _paste : function(e,o){
    	this.$el.set('value', this.__mask( o.valueArray , this.globals , this.mask.options ) );
    	//fix so ie's caret won't go to the end of the input value.
    	if( Browser.Engine.trident || Browser.Engine.webkit )
    	    this.$el.setRange(o.range.start,o.range.end);
    	return true;
    },
    
    _keypress : function(e,o){

    	if( this.ignore || e.control || e.meta || e.alt ) return true;

    	var c = String.fromCharCode(e.code),
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
    		valueArray = o.value.replace(this.globals.fixedCharsRegG,'').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		extraPos = maskArray.__extraPositionsTill(o.range.start,this.globals.fixedCharsReg);

    	o.rsEp = o.range.start+extraPos;

		if( !this.testEvents(maskArray, o.rsEp, c, e.code) ) return false;

		this.$el.set('value' , this.__mask( valueArray , this.globals , opt , extraPos) );

    	if(o.range.start==o.range.end){
    		// the 0 thing is cause theres a particular behavior i wasnt liking when you put a default
    		// value on a fixed mask and you select the value from the input the range would go to the
    		// end of the string when you enter a char. with this it will overwrite the first char wich is a better behavior.
    		// opera fix, cant have range value bigger than value length, i think it loops thought the input value...
    		if( (o.rsEp==0 && o.value.length==0) || o.rsEp < o.value.length )
    			this.$el.setRange(o.rsEp,o.rsEp+1);	
    	}
    	else
    		this.$el.setRange(o.range.start,o.range.end);

    	return true;
    },
    
    __mask : function( valueArray, globals , o , extraPos){
        return valueArray.__mask( globals, o, extraPos ).join('').substring(0,o.maskArray.length);
    }

});