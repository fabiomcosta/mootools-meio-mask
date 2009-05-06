meio.MaskType.reverse = new Class({
    
    Extends: meio.MaskType,
    
    options: {
        defaultValue: '',
		signal: false
    },
    
    initialize: function(mask){
        this.parent(mask);
        if(mask){
            var defaultValue = this.mask.options.defaultValue;
            this.$el.setStyle('text-align','right');
            if(defaultValue != '' && this.$el.get('value') == '') this.$el.set('value', defaultValue.mask(this.mask.options));
        }
    },
    
    _paste: function(e,o){
    	this.__changeSignal(e,o);
    	this.$el.set('value', this.__mask( o.valueArray , this.globals , this.mask.options ));
    	return true;
    },
    
    _keypress: function(e,o){

    	if(this.ignore || e.control || e.meta || e.alt) return true;

    	this.__changeSignal(e, o);

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
		//necessary, if not decremented you will be able to input just the mask.length-1 if signal!=''
		//ex: mask:99,999.999.999 you will be able to input 99,999.999.99
		if(opt.signal && (rangeStart-opt.signal.length > 0 )) rangeStart -= opt.signal.length;

    	var valueArray = rawValue.replace(this.globals.fixedCharsRegG, '').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		extraPos = maskArray.__extraPositionsTill(rangeStart, this.globals.fixedCharsReg);

    	o.rsEp = rangeStart + extraPos;
    	if(!this.testEvents(maskArray, o.rsEp, c, e.code)) return false;
    	this.$el.set('value', this.__mask(valueArray, this.globals, opt ));

    	//fix for ie
    	//this bug was pointed by Pedro Martins
    	//it fixes a strange behavior that ie was having after a char was inputted in a text input that
    	//had its content selected by any range 
    	if(Browser.Engine.trident && ((rangeStart==0 && o.range.end==0) || rangeStart != o.range.end ))
    		this.$el.setRange(o.value.length);
    	return false;
    },
    
    __mask : function( valueArray, globals, o, extraPos){
        valueArray.reverse();
        var newValue = valueArray.__mask( globals, o ).reverse();
        return (o.signal || '') + newValue.join('').substring(newValue.length-o.maskArray.length);
    },
    
    __changeSignal : function(e,o){
   		if( this.mask.options.signal !== false ){
   			var inputChar = (o.paste)? o.value.charAt(0): e.key;
   			if($defined(this.globals.signals[inputChar]))
   				this.mask.options.signal = this.globals.signals[inputChar];
   		}
   	}
   	
});
