
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
			if(this.globals.matchRules.contains(c)) this.validIndexes.push(i);
		}, this);
	}, 

    _paste: function(e, o){

		var elementValue = this.element.get('value'),
			elementValueArray = elementValue.split(''),
			maskArray = this.mask.options.maskArray;
		
		var eli = 0, newStartRange = o.range.start; 

		while(eli < this.maskMold.length){
			if(!elementValueArray[eli]){
				elementValueArray[eli] = this.maskMold[eli];
			}
			else if(this.globals.rules[maskArray[eli]]){
				if(!this.globals.rules[maskArray[eli]].test(elementValueArray[eli])){
					elementValueArray.splice(eli, 1);
					continue;
				}
				newStartRange = eli;
			}
			else if(maskArray[eli] != elementValueArray[eli]){
				elementValueArray.splice(eli, 0, this.maskMold[eli]);
			}
			else{
				elementValueArray[eli] = this.maskMold[eli];
			}
			eli++;
		}
		
		this.maskMoldArray = elementValueArray.slice(0, this.maskMold.length);
		
		this.element.set('value', this.maskMoldArray.join(''))
			.setRange(newStartRange+1);

		return false;
    },
    
	_focus: function(e, o){
		this.element.set('value', this.maskMoldArray.join(''))
			.store('meiomask:focusvalue', this.element.get('value'))
			.select();
		return true;
	},

	_blur: function(e, o){
		var elementValue = this.element.get('value'),
			i = elementValue.length-1, truncateIndex = 0, cont;
			
		if(this.element.retrieve('meiomask:focusvalue') != elementValue){
			this.element.fireEvent('change');
		}
		
		if(elementValue == this.maskMold){
			//easy mode :D
			this.element.set('value', '');
		}
		else{
			// removes incorrect chars at the end of the string
			while(i >= 0){
				cont = false;
				while(this.globals.fixedCharsRegex.test(elementValue.charAt(i)) && elementValue.charAt(i) != this.options.placeHolder){
					cont = true;
					i--;
				}
				if(cont){
					while(elementValue.charAt(i) == this.options.placeHolder){
						truncateIndex = i;
						i--;
					}
				}
				else{
					break;
				}
			}
			if(truncateIndex) this.element.set('value', elementValue.substring(0, truncateIndex));
		}
		return true;
	},

    _keypress: function(e, o){
		
		if(this.ignore || e.control || e.meta || e.alt) return true;

    	var c = String.fromCharCode(e.code),
    		maskArray = this.mask.options.maskArray,
			start, i;
		
		if(!o.isSelection){
			// no text selected
			if(o.isRemoveKey){
			
				if(o.isDelKey){
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
			
				if(!this.testEvents(i, c, e.code, o.isRemoveKey)) return false;
			
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

				i = this.validIndexes[start];
				
				if(!this.testEvents(i, c, e.code, o.isRemoveKey)) return false;
			
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
			//if(end==-1) end = maskArray.length;
			
			var delta = end-start;
			
			if(delta == 0) return false;
			
			// removes all the chars into the range
			for(i=rstart; i<rend; i++){
				this.maskMoldArray[i] = this.maskMold.charAt(i);
			}
			// removes all the chars into the range

			if(!o.isRemoveKey){
				i = this.validIndexes[start];
				if(!this.testEvents(i, c, e.code, o.isRemoveKey)) return false;
				this.maskMoldArray[i] = c;
				start++;
			}
			
			delta = end - start;
			
			if(delta == 0){
				this.element.set('value', this.maskMoldArray.join(''));
				this.element.setRange(this.validIndexes[start]);
				return false;
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
