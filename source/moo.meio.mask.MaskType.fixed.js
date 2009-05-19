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
    		maskArray = opt.maskArray,
    		valueArray = o.value.replace(opt.fixedCharsRegG, '').split(''),
    		extraPos = maskArray.__extraPositionsTill(o.range.start, opt.fixedCharsReg);
		
		if(o.specialKey){
			var start = o.range.start, delta = 0;
			if((o.range.end - o.range.start) == 0){
				// no text selected
				if(e.code==46){
					//delete
					//e.code==46 (delete)
					for(var i = start; i < maskArray.length; i++){
						if(opt.fixedCharsReg.test(o.valueArray[i])){
							delta++;
						}
						else{
							break;
						}
					}
					
				}
				else{
					// backspace
					for(var i = start-1; i > 0; i--){
						if(opt.fixedCharsReg.test(o.valueArray[i])){
							delta--;
						}
						else{
							break;
						}
					}
				}
			}
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
			start += delta;
			o.valueArray.splice(start, end);
			this.element.set('value', this.__mask(o.valueArray, this.globals, opt, extraPos));
			this.element.setRange(start);
			return false;
			
			//console.log(delta);
//			var tmp = o.valueArray.join('');
//			tmp = tmp.replace(opt.fixedCharsRegG, '').split('');
//			console.log(tmp);
			//this.__mask(valueArray, globals, o, extraPos);
		}


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