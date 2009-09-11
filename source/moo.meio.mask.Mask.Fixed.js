
Meio.Mask.Fixed = new Class({
    
    Extends: Meio.Mask,
    
    options: {
        placeholder: '_',
		autoSetSize: false,
		removeIfInvalid: false // removes the value onblur if the input is not valid
    },

    initialize: function(element, options){
		this.parent(element, options);
		this.maskMold = this.options.mask.replace(Meio.Mask.rulesRegex, this.options.placeholder);
		this.maskMoldArray = this.maskMold.split('');
		this.validIndexes = [];
		if(this.options.autoSetSize) this.setSize();
		this.maskArray.each(function(c, i){
		    if(!this.isFixedChar(c)) this.validIndexes.push(i);
		}, this);
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
		return {value: elementValueArray.slice(0, this.maskMold.length), rangeStart: newRangeStart + 1};
	},

    _removeInvalidTrailingChars: function(elementValue){
		var truncateIndex = elementValue.length,
		    i = elementValue.length - 1,
		    cont;
		while(i >= 0){
			cont = false;
			while(this.isFixedChar(elementValue.charAt(i)) && elementValue.charAt(i) !== this.options.placeholder){
				cont = true;
				i--;
			}
			while(elementValue.charAt(i) === this.options.placeholder){
			    cont = true;
				truncateIndex = i;
				i--;
			}
			if(!cont) break;
		}
		this.element.set('value', elementValue.substring(0, truncateIndex));
    },

    _paste: function(e, o){
        e.preventDefault();
		var retApply = this._applyMask(this.element.get('value'), o.range.start);
		this.maskMoldArray = retApply.value;
		
		this.element.set('value', this.maskMoldArray.join(''))
			.setRange(retApply.rangeStart);
    },

	_focus: function(e, o){
		this.element.set('value', this.maskMoldArray.join(''))
			.store('meiomask:focusvalue', this.element.get('value'));
		this.parent(e, o);
	},

	_blur: function(e, o){
		var elementValue = this.element.get('value');
		if(this.element.retrieve('meiomask:focusvalue') != elementValue){
			this.element.fireEvent('change');
		}
		if(this.options.removeIfInvalid){
			if(elementValue.contains(this.options.placeholder)){
				this.maskMoldArray = this.maskMold.split('');
				this.element.set('value', '');
			}
			return true;
		} 
		this._removeInvalidTrailingChars(elementValue);
		return true;
	},
    
    _keypress: function(e, o){
		if(this.ignore || e.control || e.meta || e.alt) return true;
        
        e.preventDefault();
    	var c = String.fromCharCode(e.code),
    		maskArray = this.maskArray,
			start, i;
		
		if(!o.isSelection){
			// no text selected
			var finalRangePosition;
			if(o.isBksKey){
				do{
					start = this.validIndexes.indexOf(--o.range.start);
				}while(start === -1 && o.range.start >= 0);
				finalRangePosition = this.validIndexes[start] || 0;
			}
			else{
				do{
					start = this.validIndexes.indexOf(o.range.start++);
				}while(start === -1 && o.range.start < maskArray.length);
				finalRangePosition = this.validIndexes[start + 1];
			}
		
		    i = this.validIndexes[start];
			if(!this.testEvents(i, c, e.code, o.isRemoveKey)) return true;
			
			this.maskMoldArray[i] = (o.isRemoveKey)? this.options.placeholder: c;
			
			this.element.set('value', this.maskMoldArray.join(''))
			    .setRange($pick(finalRangePosition, this.maskMoldArray.length));
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

            // if  you select a fixed char it will ignore your input
			if(!(end - start)) return true;
			
			// removes all the chars into the range
			for(i=rstart; i<rend; i++){
				this.maskMoldArray[i] = this.maskMold.charAt(i);
			}

			if(!o.isRemoveKey){
				i = this.validIndexes[start];
				if(!this.testEvents(i, c, e.code, o.isRemoveKey)) return true;
				this.maskMoldArray[i] = c;
				start++;
			}
			
			this.element.set('value', this.maskMoldArray.join(''));
			this.element.setRange(this.validIndexes[start]);
		}
		return true;
    },
    
    mask: function(str){
        return this._applyMask(str).value;
    }

});

Meio.Mask.createMasks('Fixed', {
    'Phone'				: { mask: '(99) 9999-9999)' },
    'PhoneUs'			: { mask: '(999) 999-9999' },
    'Cpf'				: { mask: '999.999.999-99' },
    'Cnpj'				: { mask: '99.999.999/9999-99' },
    'Date'				: { mask: '39/19/9999' },
    'DateUs'			: { mask: '19/39/9999' },
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
