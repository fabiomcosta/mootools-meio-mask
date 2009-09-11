
Meio.Mask.Fixed = new Class({
    
    Extends: Meio.Mask,
    
    options: {
        placeHolder: '_',
		setSize: false,
		removeIfInvalid: false // removes the value onblur if the input is not valid
    },

    initialize: function(mask, options){
		this.parent(mask, options);
		this.maskMold = this.options.mask.replace(Meio.Mask.rulesRegex, this.options.placeHolder);
		this.maskMoldArray = this.maskMold.split('');
		this.validIndexes = [];
		if(this.options.setSize) this.setSize();
		this.maskArray.each(function(c, i){
		    if(Meio.Mask.matchRules.contains(c)) this.validIndexes.push(i);
		}, this);
	},

    _paste: function(e, o){
		var retApply = this._applyMask(this.element.get('value'), o.range.start);
		this.maskMoldArray = retApply.value;
		
		this.element.set('value', this.maskMoldArray.join(''))
			.setRange(retApply.rangeStart + 1);

		return false;
    },
    
	_applyMask: function(elementValue, newRangeStart){
		var elementValueArray = elementValue.split(''),
			maskArray = this.maskArray,
			maskMold = this.maskMold,
			eli = 0;
			
		while(eli < maskMold.length){
			if(!elementValueArray[eli]){
				elementValueArray[eli] = maskMold[eli];
			}
			else if(Meio.Mask.rules[maskArray[eli]]){
				if(!this.testEntry(eli, elementValueArray[eli])){
					elementValueArray.splice(eli, 1);
					continue;
				}
				newStartRange = eli;
			}
			else if(maskArray[eli] != elementValueArray[eli]){
				elementValueArray.splice(eli, 0, maskMold[eli]);
			}
			else{
				elementValueArray[eli] = maskMold[eli];
			}
			eli++;
		}
		
		// makes sure the value is not bigger than the mask definition
		return {value: elementValueArray.slice(0, this.maskMold.length), rangeStart: newRangeStart};
	},

	_focus: function(e, o){
		this.element.set('value', this.maskMoldArray.join(''))
			.store('meiomask:focusvalue', this.element.get('value'));
		this.parent(e, o);
		return true;
	},

	_blur: function(e, o){
		var elementValue = this.element.get('value'),
			i = elementValue.length - 1, truncateIndex = 0, cont;
		
		// fires change event if the value on focus != from value on blur
		if(this.element.retrieve('meiomask:focusvalue') != elementValue){
			this.element.fireEvent('change');
		}
		
		if(this.options.removeIfInvalid){
			if(elementValue.contains(this.options.placeHolder)){
				// remove if invalid option
				this.maskMoldArray = this.maskMold.split('');
				this.element.set('value', '');
			}
			return true;
		} 
		
		if(elementValue === this.maskMold){
			// if no char inputed
			this.element.set('value', '');
		}
		else{
			// removes incorrect chars at the end of the string
			while(i >= 0){
				cont = false;
				while(!Meio.Mask.matchRules.contains(elementValue.charAt(i)) && elementValue.charAt(i) != this.options.placeHolder){
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
    		maskArray = this.maskArray,
			start, i;
		
		if(!o.isSelection){
			// no text selected
			if(o.isRemoveKey){
				if(o.isDelKey){
					do{
						start = this.validIndexes.indexOf(o.range.start++);
					}while(start == -1 && o.range.start < maskArray.length);
				}
				else{
					do{
						start = this.validIndexes.indexOf(--o.range.start);
					}while(start == -1 && o.range.start >= 0);
				}
				if(start === -1) return false;
			
				var auxi = start,
					i_1 = this.validIndexes[auxi+1];
			
			    i = this.validIndexes[auxi];
			    
				if(!this.testEvents(i, c, e.code, o.isRemoveKey)) return false;

				this.maskMoldArray[i] = this.options.placeHolder;
				this.element.set('value', this.maskMoldArray.join(''));
				
				if(o.isDelKey){
			        this.element.setRange(this.validIndexes[start + 1] || this.maskMoldArray.length);
			    }
			    else{
			        this.element.setRange(this.validIndexes[start]);
			    }
			}
			else{
				// gets start index, if it is not on the validIndexes it will try to get the next
				do{
					start = this.validIndexes.indexOf(o.range.start++);
				}while(start==-1 && o.range.start < maskArray.length);

				i = this.validIndexes[start];
				
				if(!this.testEvents(i, c, e.code, o.isRemoveKey)) return false;
			    
				// apply the char that just passed the test
				this.maskMoldArray[i] = c;

				this.element.set('value', this.maskMoldArray.join(''));

                this.element.setRange(this.validIndexes[start + 1] || this.maskMoldArray.length);
			}
		}
		else{

			var rstart = o.range.start;
			var rend = o.range.end;

			// text selected
			do{
				start = this.validIndexes.indexOf(o.range.start++);
			}while(start === -1 && o.range.start < maskArray.length);
			do{
				end = this.validIndexes.indexOf(o.range.end++);
			}while(end === -1 && o.range.end < maskArray.length);
			//if(end==-1) end = maskArray.length;
			
			var delta = end - start;
			
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
			
			this.element.set('value', this.maskMoldArray.join(''));
			this.element.setRange(this.validIndexes[start]);
		}				
		return false;
    },
    
    mask: function(str){
        return this._applyMask(str).value;
    }

});

Meio.Mask.createMasks('Fixed', {
    'Time'              : { mask: '2h:59'},
    'Phone'				: { mask: '(99) 9999-9999)' },
    'PhoneUS'			: { mask: '(999) 999-9999' },
    'CPF'				: { mask: '999.999.999-99' },
    'CNPJ'				: { mask: '99.999.999/9999-99' },
    'Date'				: { mask: '39/19/9999' },
    'DateUS'			: { mask: '19/39/9999' },
    'Cep'				: { mask: '99999-999' },
    'Time'				: { mask: '2h:59' },
    'CC'				: { mask: '9999 9999 9999 9999' }
});

/*
Meio.Mask.Fixed.Time = new Class({
    Extends: Meio.Mask.Fixed,
    options: {
        mask: '2h:59'
    }
});
*/
