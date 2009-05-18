Meio.MaskType.fixed = new Class({
    
    Extends: Meio.MaskType,
    
    options: {
        placeHolder: false
    },
    
    _paste: function(e, o){
    	this.element.set('value', this.__mask(o.valueArray, this.globals, this.mask.options));
    	if(Browser.Engine.trident || Browser.Engine.webkit)
    	    this.element.setRange(o.range.start, o.range.end);
    	return true;
    },
    
    _keypress: function(e, o){

    	var c = String.fromCharCode(e.code),
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
    		valueArray = o.value.replace(opt.fixedCharsRegG, '').split(''),
    		extraPos = maskArray.__extraPositionsTill(o.range.start, opt.fixedCharsReg);
		
		if(o.removeKey) this.removeChar(e, o);
		
		if(this.ignore || e.control || e.meta || e.alt) return true;

    	var rangeStartExtraPosition = o.range.start + extraPos;

		if(!this.testEvents(maskArray, rangeStartExtraPosition, c, e.code)) return false;

		this.element.set('value', this.__mask(valueArray, this.globals, opt, extraPos));

    	if(o.range.start == o.range.end){
    		if((rangeStartExtraPosition==0 && o.value.length==0) || rangeStartExtraPosition < o.value.length)
    			this.element.setRange(rangeStartExtraPosition, rangeStartExtraPosition + 1);
    	}
    	else
    		this.element.setRange(o.range.start, o.range.end);

    	return true;
    },
    
    __mask: function(valueArray, globals, o, extraPos){
        return valueArray.__mask(globals, o, extraPos).join('').substring(0, o.maskArray.length);
    }

});