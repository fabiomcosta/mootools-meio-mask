	Meio.MaskType.infinite = new Class({
    
	    Extends : Meio.MaskType,
    
	    _keyup : function(e,o){
	    	return true;
	    },
    
	    _paste : function(e,o){
	        this.$el.set('value', this.__mask(o.valueArray, this.globals, this.mask.options));
	    	return true;
	    },
    
	    _keypress: function(e,o){
	    	if(this.ignore || e.control || e.meta || e.alt) return true;
	    	var c = String.fromCharCode(e.code),
	    		maskArray = this.mask.options.maskArray,
	            valueArray = o.value.replace(this.globals.fixedCharsRegG, '').split('');
	        if(!this.testEvents(maskArray, 0, c, e.code)) return false;
	    	this.$el.set('value', valueArray.join(''));
	    	return true;
	    }
    
	});
