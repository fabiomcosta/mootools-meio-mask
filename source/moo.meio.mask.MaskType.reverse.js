Meio.MaskType.reverse = new Class({
    
    Extends: Meio.MaskType,
    
    options: {
		alignText: true,
		decimal: true
    },
    
    initialize: function(mask){
        this.parent(mask);
        if(mask){
			$extend(this.mask.options, this.options);
			this.mask.options.maskArray.reverse();
			if(this.mask.options.alignText) this.$el.setStyle('text-align', 'right');
            //if(this.$el.get('value') == '') this.$el.set('value', .mask(this.mask.options));
        }
    },
    
    _paste: function(e,o){
    	this.$el.set('value', this.__mask(o.valueArray , this.globals , this.mask.options));
    	return true;
    },
    
    _keypress: function(e,o){

    	if(this.ignore || e.control || e.meta || e.alt) return true;

    	var c = String.fromCharCode(e.code),
    		rangeStart = o.range.start,
    		rawValue = o.value,
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
		 	// the input value from the range start to the value start
		    valueStart = rawValue.substr(0, rangeStart),
			// the input value from the range end to the value end
			valueEnd = rawValue.substr(o.range.end, rawValue.length);

		rawValue = (valueStart + c + valueEnd);
		
    	var valueArray = rawValue.replace(opt.fixedCharsRegG, '').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		extraPos = maskArray.__extraPositionsTill(rangeStart, opt.fixedCharsReg);

    	o.rsEp = rangeStart + extraPos;
    	if(!this.testEvents(maskArray, o.rsEp, c, e.code)) return false;
    	this.$el.set('value', this.__mask(valueArray, this.globals, opt));

    	//fix for ie
    	//this bug was pointed by Pedro Martins
    	//it fixes a strange behavior that ie was having after a char was inputted in a text input that
    	//had its content selected by any range 
    	if(Browser.Engine.trident && ((rangeStart==0 && o.range.end==0) || rangeStart != o.range.end))
    		this.$el.setRange(o.value.length);

    	return false;
    },
    
    __mask: function(valueArray, globals, o, extraPos){
        valueArray.reverse();
        var newValue = valueArray.__mask(globals, o).reverse();
		return newValue.join('').substring(newValue.length - o.maskArray.length);
    }
    
});
