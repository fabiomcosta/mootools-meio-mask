meio.MaskType = new Class({
    
    initialize : function(mask){
        this.ignore = false;
        if(mask){
            this.mask = mask;
            this.globals = mask.globals;
            this.$el = mask.$el;
    		this.eventsToBind = ['keydown', 'keypress', 'keyup', 'paste'];
    		this.eventsToBind.each(function(evt){
    		    this[evt + 'Event'] = this._onMask.bindWithEvent(this, this['_' + evt]);
    			this.$el.addEvent(evt , this[evt+'Event']);
    		}.bind(this));
        }
    },
    
	_onMask : function(e, func){
		var o = {};
		e = new Event(e);
		if(this.$el.get('readonly')) return true;
		o.value = this.$el.get('value');
		o.range = this.$el.getRange();
		o.valueArray = o.value.split('');
		o[this.options.type] = true;
		return func.call(this, e, o);
	},
    
    _keydown : function(e,o){
    	// lets say keypress at desktop == keydown at iphone (theres no keypress at iphone)
    	this.ignore = this.globals.ignoreKeys.contains(e.code);
    	if(this.ignore){
    		var rep = this.globals.keyRep[e.code];
    		this.mask.fireEvent('valid',[this.$el, rep? rep: '', e.code]);
    	}
    	return Browser.Platform.ipod? this._keypress(e, o): true;
    },
    
    _keyup : function(e,o){
    	//9=TAB_KEY
    	//this is a little bug, when you go to an input with tab key
    	//it would remove the range selected by default, and that's not a desired behavior
    	if(e.code == 9 && (Browser.Engine.webkit || Browser.Engine.trident)) return true;
    	return this._paste(e,o);
    },
    
    testEvents : function(maskArray,rsEp, c, code){
    	if(!this.globals.rules[maskArray[rsEp]]){
    		this.mask.fireEvent('overflow', [this.$el, c, code]);
    		return false;
    	}
    	else if(!this.globals.rules[maskArray[rsEp]].test(c)){
    		this.mask.fireEvent('invalid', [this.$el, c, code]);
    		return false;
    	}
    	else
    	    this.mask.fireEvent('valid', [this.$el, c, code]);
    	return true;
    },
    
    __mask : function(valueArray){
        return valueArray.join('');
    }
    
});
