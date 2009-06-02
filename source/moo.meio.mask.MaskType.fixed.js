
Meio.MaskType.fixed = new Class({
    
    Extends: Meio.MaskType,
    
    options: {
        placeHolder: '_',
		removeIfInvalid: false
    },

    initialize: function(mask){
		this.parent(mask);
		this.maskMold = this.mask.options.mask.replace(this.globals.rulesRegex, this.options.placeHolder);
		this.maskMoldArray = this.maskMold.split('');
		this.validIndexes = [];
		this.mask.options.maskArray.each(function(c, i){
			if(this.globals.matchRules.test(c)) this.validIndexes.push(i);
		}, this);
	}, 

    _paste: function(e, o){
    	/*	this.element.set('value', this.__mask(o.valueArray, this.globals, this.mask.options));
    	if(Browser.Engine.trident || Browser.Engine.webkit)
    	    this.element.setRange(o.range.start, o.range.end);
    	return true;*/
    },
    
	_focus: function(e, o){
		this.element.set('value', this.maskMoldArray.join('')).select();
	},

	_blur: function(e, o){
		var thisValue = this.element.get('value'),
			i = thisValue.length-1, c;

		if(thisValue == this.maskMold){
			this.element.set('value', '');
		}
		else{
			while(i >= 0){
				c = thisValue.charAt(i);
				if(c!=this.options.placeHolder && !this.globals.fixedCharsRegex.test(c)){
					this.element.set('value', thisValue.substring(0, i+1));
					break;
				}
				i--;
			}
		}
		return true;
	},

    _keypress: function(e, o){
	
		if(this.ignore || e.control || e.meta || e.alt) return true;

    	var c = String.fromCharCode(e.code),
    		maskArray = this.mask.options.maskArray;
		
		var start = o.range.start,
			delta = 0,
			end = 1, i;
		
		if(!o.isSelection){
			// no text selected
			if(o.removeKey){
			
				if(o.delKey){
					do{
						start = this.validIndexes.indexOf(o.range.start++);
					}while(start==-1 && o.range.start < maskArray.length);
				}
				else{
					do{
						start = this.validIndexes.indexOf(--o.range.start);
					}while(start==-1 && o.range.start >= 0);
				}
			
				if(start==-1) return false;
			
				var auxi = start,
					i = this.validIndexes[auxi],
					i_1 = this.validIndexes[auxi+1];
			
				if(!this.testEvents(maskArray, i, c, e.code, o)) return false;
			
				while(auxi <= this.validIndexes.length && i_1 && this.globals.rules[maskArray[i]].test(this.maskMoldArray[i_1])){
					this.maskMoldArray[i] = this.maskMoldArray[i_1];
					i = this.validIndexes[auxi];
					i_1 = this.validIndexes[++auxi];
				}
				this.maskMoldArray[i] = this.options.placeHolder;
			
				this.element.set('value', this.maskMoldArray.join(''))
					.setRange(this.validIndexes[start]);
			}
			else{
				// gets start index, if it is not on the validIndexes it will try to get the next
				do{
					start = this.validIndexes.indexOf(o.range.start++);
				}while(start==-1 && o.range.start < maskArray.length);

				var i = this.validIndexes[start];
				
				if(!this.testEvents(maskArray, i, c, e.code, o)) return false;
			
				var queue = [this.maskMoldArray[i]],
					auxi;

				// apply the char that just passed the test
				this.maskMoldArray[i] = c;
			
				auxi = start+1;
				i = this.validIndexes[auxi];
			
				while(auxi < this.validIndexes.length && this.globals.rules[maskArray[i]].test(queue[0])){
					queue.unshift(this.maskMoldArray[i]);
					this.maskMoldArray[i] = queue.pop();
					i = this.validIndexes[++auxi];
				}
			
				this.element.set('value', this.maskMoldArray.join(''));
				if(this.validIndexes[start+1]) this.element.setRange(this.validIndexes[start+1]);
			}
		}
		else{

			var rstart = o.range.start;
			var rend = o.range.end;

			// text selected
			do{
				start = this.validIndexes.indexOf(o.range.start++);
			}while(start==-1 && o.range.start < maskArray.length);
			do{
				end = this.validIndexes.indexOf(o.range.end++);
			}while(end==-1 && o.range.end < maskArray.length);
			
			var delta = end-start;
			
			if(delta==0) return false;

			// removes all the chars into the range
			var i;
			for(i=rstart; i<rend; i++){
				this.maskMoldArray[i] = this.maskMold.charAt(i);
			}
			// removes all the chars into the range


			if(!o.removeKey){
				i = this.validIndexes[start];
				if(!this.testEvents(maskArray, i, c, e.code, o)) return false;
				this.maskMoldArray[i] = c;
				start++;
			}
			
			
			auxi = end;
			var canMove = true, i_delta;

			while((i = this.validIndexes[auxi]) && (this.maskMoldArray[i] != this.options.placeHolder)){
				i_delta = this.validIndexes[auxi-delta];
				if(!this.globals.rules[maskArray[i_delta]].test(this.maskMoldArray[i])){
					canMove = false;
					break;
				}
				auxi++;
			}

			if(canMove){
				auxi = end;
				while(i = this.validIndexes[auxi]){
					i_delta = this.validIndexes[auxi-delta];
					this.maskMoldArray[i_delta] = this.maskMoldArray[i];
					this.maskMoldArray[i] = this.options.placeHolder;
					auxi++;
				}
			}
			this.element.set('value', this.maskMoldArray.join(''));
			this.element.setRange(this.validIndexes[start]);
		}				
		return false;
    },
    
    __mask: function(valueArray, globals, o, delta){
        return valueArray.__mask(globals, o, delta).join('').substring(0, o.maskArray.length);
    }

});

/*Meio.MaskType.fixed = new Class({
    
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
});*/
