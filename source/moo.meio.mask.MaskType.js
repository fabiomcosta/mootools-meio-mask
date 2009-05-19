Meio.MaskType = new Class({
    
    initialize: function(mask){
        this.ignore = false;
        if(mask){
            this.mask = mask;
            this.globals = mask.globals;
            this.element = mask.element;
    		this.eventsToBind = ['keydown', 'keypress', 'keyup', 'paste'];
    		this.eventsToBind.each(function(evt){
    		    this[evt + 'Event'] = this._onMask.bindWithEvent(this, this['_' + evt]);
    			this.element.addEvent(evt , this[evt+'Event']);
    		}, this);
        }
    },
    
	_onMask: function(e, func){
		var o = {};
		e = new Event(e);
		if(this.element.get('readonly')) return true;
		o.value = this.element.get('value');
		o.range = this.element.getRange();
		o.valueArray = o.value.split('');
		// 37=left && 39=right && 8=backspace && 46=delete && 127==iphone's delete (i mean backspace)
		o.specialKey = (e.code == 8 || e.code == 46 || (Browser.Platform.ipod && e.code == 127));
		o.setasKey = (e.code==37||e.code==39);
		//o[this.options.type] = true;
		return func.call(this, e, o);
	},
    
    _keydown: function(e, o){
    	this.ignore = this.globals.ignoreKeys.contains(e.code);
    	if(this.ignore){
    		var rep = this.globals.keyRep[e.code];
    		this.mask.fireEvent('valid', [this.element, rep? rep: '', e.code]);
    	}
		return (Browser.Platform.ipod
			|| (this.globals.onlyKeyDownRepeat && o.specialKey)
			)? this._keypress(e, o): true;
    },
    
    _keyup: function(e, o){
    	//9=TAB_KEY
    	//this is a little bug, when you go to an input with tab key
    	//it would remove the range selected by default, and that's not a desired behavior
    	//if(e.code == 9 && (Browser.Engine.webkit || Browser.Engine.trident)) return true;
    	//return this._paste(e, o);
    },
    
    testEvents: function(maskArray, rsEp, c, code){
    	if(!this.globals.rules[maskArray[rsEp]]){
    		this.mask.fireEvent('overflow', [this.element, c, code]);
    		return false;
    	}
    	else if(!this.globals.rules[maskArray[rsEp]].test(c)){
    		this.mask.fireEvent('invalid', [this.element, c, code]);
    		return false;
    	}
    	else
    	    this.mask.fireEvent('valid', [this.element, c, code]);
    	return true;
    },
    
	// remove chars when backspace and delete are pressed
	removeChar: function(e, o){
		var start = o.range.start, end = 1;
		if((o.range.end - o.range.start) == 0){
			// no text selected
			if(e.code==8){
				(start)? start--: end = 0;
			}
		}
		else{
			end = o.range.end - start;
		}
		o.valueArray.splice(start, end);
		//console.log(o.valueArray);
	},

    __mask: function(valueArray){
        return valueArray.join('');
    }
    
});
