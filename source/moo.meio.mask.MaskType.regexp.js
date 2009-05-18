Meio.MaskType.regexp = new Class({
    
    Extends : Meio.MaskType,
    
    initialize : function(mask){
        this.parent(mask);
        this.regExp = new RegExp(this.mask.options.mask);
    },
    
    _keyup : function(e,o){
    	return true;
    },
    
    _paste : function(e,o){
        //for(var i=0 , newValue=''; i < o.value.length; i++) if( this.regExp.test( o.value.charAt(i) ) )
             //newValue += o.value.charAt(i);
        this.$el.set('value', this.regExp.test(o.value) ? o.value : '' );
    	return true;
    },
    
    _keypress: function(e,o){
    	if( this.ignore || e.control || e.meta || e.alt ) return true;
    	var c = String.fromCharCode(e.code),
    		rawValue = o.value,
		 	// the input value from the range start to the value start
		    valueStart = rawValue.substr(0,o.range.start),
			// the input value from the range end to the value end
			valueEnd = rawValue.substr(o.range.end,rawValue.length);
        rawValue = (valueStart+c+valueEnd);
        // its a little hard to detect the overflow :s
        if( this.regExp.test( rawValue ) ){
            this.mask.fireEvent('valid',[this.$el,c,e.code]);
            return true;
        }
        else{
            this.mask.fireEvent('invalid',[this.$el,c,e.code]);
            return false;
        }
    }

});
