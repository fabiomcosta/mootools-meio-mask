Meio.MaskType.fixed = new Class({
    
    Extends : Meio.MaskType,
    
    options : {
        placeHolder : false // can be a char. ex : '_'. This char CAN'T be a fixedChar.
    },
    
    _paste : function(e,o){
    	this.element.set('value', this.__mask( o.valueArray , this.globals , this.mask.options ) );
    	//fix so ie's caret won't go to the end of the input value.
    	if( Browser.Engine.trident || Browser.Engine.webkit )
    	    this.element.setRange(o.range.start,o.range.end);
    	return true;
    },
    
    _keypress : function(e, o){

    	if( this.ignore || e.control || e.meta || e.alt ) return true;
		
    	var c = String.fromCharCode(e.code),
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
    		valueArray = o.value.replace(opt.fixedCharsRegG, '').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		delta = maskArray.__extraPositionsTill(o.range.start, opt.fixedCharsReg);
		
		if(!this.options.placeholder){
			
			
			var start = o.range.start,
				delta = 0,
				end = 1, i;

			if((o.range.end - o.range.start) == 0){
				// no text selected
				if(e.code==8){
					// backspace
					if(o.valueArray.length != o.range.start){
						for(i = start-1; i >= 0; i--){
							if(opt.fixedCharsReg.test(maskArray[i])) delta--; else break;
						}
					}
					else{
						for(i = start-2; i >= 0; i--){
							if(opt.fixedCharsReg.test(maskArray[i])) delta--; else break;
						}
					}
					//console.log(start, delta);
					(start)? start--: end = 0;
				}
				else{
					//e.code==46 (delete) and others
					for(i = start; i < maskArray.length; i++){
						if(opt.fixedCharsReg.test(maskArray[i])) delta++; else break;
					}
				}
			}
			else{
				end = o.range.end - start;
			}
			start += delta;
			
			
			
			if(!this.testEvents(maskArray, start, c, e.code, o)) return false;
			
			
			
			var newValue = '';			
			if(o.bksKey && o.valueArray.length != o.range.start){
				newValue = this.__mask2(valueArray, this.globals, opt, delta, o);
			}
			else{
				newValue = this.__mask(valueArray, this.globals, opt, delta);
			}
			this.element.set('value', newValue);
			
			if(o.range.start==o.range.end){
	    		if(o.removeKey){
					this.element.setRange(start+1);
				}
				else{
					// the 0 thing is cause theres a particular behavior i wasnt liking when you put a default
		    		// value on a fixed mask and you select the value from the input the range would go to the
		    		// end of the string when you enter a char. with this it will overwrite the first char wich is a better behavior.
		    		// opera fix, cant have range value bigger than value length, i think it loops thought the input value...
					if((start==0 && o.value.length==0) || start < o.value.length){
						this.element.setRange(start, start+1);
					}
				}
	    	}
	    	else{
				this.element.setRange(o.range.start, o.range.end);
			}
			return true;
		}
		else{
			
		}
    },
    
    __mask : function(valueArray, globals, opt, delta){
        return valueArray.__mask(globals, opt, delta).join('').substring(0, opt.maskArray.length);
    },

 	__mask2 : function(valueArray, globals, opt, delta, o){
        return valueArray.__mask2(globals, opt, delta, o).join('').substring(0, opt.maskArray.length);
    }
});

/*
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
	
		if(this.ignore || e.control || e.meta || e.alt) return true;

    	var c = String.fromCharCode(e.code),
    		opt = this.mask.options,
    		maskArray = opt.maskArray;
    		//valueArray = o.value.replace(opt.fixedCharsRegG, '').split(''),
    		//extraPos = maskArray.__extraPositionsTill(o.range.start, opt.fixedCharsReg);
		
		//var rangeStartExtraPosition = o.range.start + extraPos;
		
		var start = o.range.start,
			delta = 0,
			end = 1, i;
		
		if(o.specialKey){
			if((o.range.end - o.range.start) == 0){
				// no text selected
				if(e.code==46){
					//e.code==46 (delete)
					for(i = start; i < maskArray.length; i++){
						if(opt.fixedCharsReg.test(maskArray[i])) delta++; else break;
					}
				}
				else{
					// backspace
					for(i = start-1; i >= 0; i--){
						if(opt.fixedCharsReg.test(maskArray[i])) delta--; else break;
					}
					(start)? start--: end = 0;
				}
			}
			else{
				end = o.range.end - start;
			}
			start += delta;
			o.valueArray.splice(start, end);
			this.element.set('value', this.__mask(o.valueArray, this.globals, opt, delta));
			this.element.setRange(start);
		}
		else{
			//if(!this.testEvents(maskArray, o.range.start, c, e.code)) return false;
			for(i = start; i < maskArray.length; i++){
				if(opt.fixedCharsReg.test(maskArray[i])) delta++; else break;
			}
			if(!delta){
				start = o.range.start;
				delta = 0;
				for(i = start+1; i < maskArray.length; i++){
					if(opt.fixedCharsReg.test(maskArray[i])) delta++; else break;
				}
				//console.log(delta);
				start += delta;
				o.valueArray[o.range.start] = c;
				this.element.set('value', this.__mask(o.valueArray, this.globals, opt, delta));
				this.element.setRange(start + 1);
			}
			else{
				o.valueArray[o.range.start+delta] = c;
				this.element.set('value', this.__mask(o.valueArray, this.globals, opt, delta));
				this.element.setRange(o.range.start + delta + 1);
			}
			
		}
		
		return false;
    },
    
    __mask: function(valueArray, globals, o, delta){
        return valueArray.__mask(globals, o, delta).join('').substring(0, o.maskArray.length);
    }

});*/