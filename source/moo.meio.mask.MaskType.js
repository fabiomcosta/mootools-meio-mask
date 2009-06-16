Meio.MaskType = new Class({
    
    initialize: function(mask){
        this.ignore = false;
        if(mask){
            this.mask = mask;
            this.globals = mask.globals;
            this.element = mask.element;
    		this.eventsToBind = ['focus', 'blur', 'keydown', 'keypress', 'paste'];
    		this.eventsToBind.each(function(evt){
    		    this[evt + 'Event'] = this._onMask.bindWithEvent(this, this['_' + evt]);
    			this.element.addEvent(evt , this[evt+'Event']);
    		}, this);
        }
    },
    
	_onMask: function(e, func){
		var o = {};
		if(this.element.get('readonly')) return true;
		o.range = this.element.getSelectedRange();
		o.isSelection = (o.range.start != o.range.end);
		// 8=backspace && 46=delete && 127==iphone's delete (i mean backspace)
		o.isDelKey = (e.code == 46);
		o.isBksKey = (e.code == 8 || (Browser.Platform.ipod && e.code == 127));
		o.isRemoveKey = (o.isBksKey || o.isDelKey);
		return func.call(this, e, o);
	},
    
    _keydown: function(e, o){
		this.ignore = this.globals.ignoreKeys.contains(e.code);
		if(this.ignore){
    		//var rep = this.globals.keyRep[e.code];
			// no more representation of the keys yet... (since this is not so used or usefull you know..., im thinking about that)
			this.mask.fireEvent('valid', [this.element, e.code]);
    	}
		return (Browser.Platform.ipod
			|| (this.globals.onlyKeyDownRepeat && o.removeKey)
			)? this._keypress(e, o): true;
    },
    
    /*_keyup: function(e, o){
    	//9=TAB_KEY
    	//this is a little bug, when you go to an input with tab key
    	//it would remove the range selected by default, and that's not a desired behavior
    	//if(e.code == 9 && (Browser.Engine.webkit || Browser.Engine.trident)) return true;
    	//return this._paste(e, o);
		return true;
    },*/
    
    testEvents: function(i, c, code, isRemoveKey){
    	var maskArray = this.mask.options.maskArray;
		if(!isRemoveKey){
			if(!this.globals.rules[maskArray[i]]){
	    		//console.log('overflow');
				this.mask.fireEvent('overflow', [this.element, code, c]);
	    		return false;
	    	}
	    	else if(!this.globals.rules[maskArray[i]].test(c)){
				//console.log('invalid');
	    		this.mask.fireEvent('invalid', [this.element, code, c]);
	    		return false;
	    	}
		}
    	//console.log('valid');
		this.mask.fireEvent('valid', [this.element, code, c]);
		return true;
    },

    /*
    __mask: function(valueArray){
        return valueArray.join('');
    }
    */
});
