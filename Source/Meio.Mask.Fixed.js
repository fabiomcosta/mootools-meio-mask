/*
---

name: Meio.Mask.Fixed

description: A mask used for fixed values like date, time, phone, etc.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Mask

license: MIT-style license

provides: [Meio.Mask.Fixed]

...
*/

Meio.Mask.Fixed = new Class({

	Extends: Meio.Mask,

	options: {
		autoSetSize: false,
		placeholder: '_',
		removeIfInvalid: false, // removes the value onblur if the input is not valid
		removeInvalidTrailingChars: true
	},

	initialize: function(options){
		this.parent(options);
		this.slice = Array.prototype.slice;
		this.maskArray = this.options.mask.split('');
		this.maskMold = this.options.mask.replace(Meio.Mask.rulesRegex, this.options.placeholder).split('');
		this.maskMoldEmpty = this.slice.call(this.maskMold);
		this.validIndexes = [];
		this.maskArray.each(function(c, i){
			if (!this.isFixedChar(c)) this.validIndexes.push(i);
		}, this);
		this.createUnmaskRegex();
	},

	link: function(element){
		this.parent(element);
		var elementValue = this.element.get('value');
		if (elementValue != ''){
			var maskedValue = this.mask(elementValue);
			for (var i = maskedValue.length; i--;){
				this.maskMold[i] = maskedValue.charAt(i);
			}
		}
		if (this.options.autoSetSize) this.setSize();
		return this;
	},

	focus: function(e, o){
		var elementValue = this.maskMold.join('');
		this.element.set('value', elementValue);
		this.focusTimeout = this.element.setCaretPosition.delay(0, this.element, [this.getLastValidIndex(elementValue)]);
		this.parent(e, o);
	},

	blur: function(e, o){
		this.parent(e, o);
		clearTimeout(this.focusTimeout);
		var elementValue = this.element.get('value');
		if (this.options.removeIfInvalid){
			if (elementValue.contains(this.options.placeholder)){
				this.maskMold = this.slice.call(this.maskMoldEmpty, 0);
				this.element.set('value', '');
			}
			return true;
		}
		if (this.options.removeInvalidTrailingChars) this.element.set('value', this.removeInvalidTrailingChars(elementValue));
		return true;
	},

	keypress: function(e, o){
		if (this.ignore) return true;
		e.preventDefault();

		var c = String.fromCharCode(e.code),
			maskArray = this.maskArray,
			start, i, returnFromTestEntry;

		if(!o.isSelection){
			// no text selected
			var finalRangePosition;
			if (o.isBksKey){
				do {
					start = this.validIndexes.indexOf(--o.range.start);
				} while (start == -1 && o.range.start >= 0);
				finalRangePosition = this.validIndexes[start] || 0;
			} else {
				do {
					start = this.validIndexes.indexOf(o.range.start++);
				} while (start == -1 && o.range.start < maskArray.length);
				finalRangePosition = (start == -1) ? this.maskMold.length : this.validIndexes[start + 1];
			}

			i = this.validIndexes[start];
			if (!(returnFromTestEntry = this.testEvents(i, c, e.code, o.isRemoveKey))) return true;
			if (typeof returnFromTestEntry == 'string') c = returnFromTestEntry;
			this.maskMold[i] = (o.isRemoveKey) ? this.options.placeholder : c;

			var newCarretPosition = (finalRangePosition == null) ? this.maskMold.length : finalRangePosition;
			this.element.set('value', this.maskMold.join(''))
				.setCaretPosition(newCarretPosition);

		} else {

			var rstart = o.range.start,
				rend = o.range.end,
				end;

			// text selected
			do {
				start = this.validIndexes.indexOf(o.range.start++);
			} while(start == -1 && o.range.start < maskArray.length);
			do {
				end = this.validIndexes.indexOf(o.range.end++);
			} while(end == -1 && o.range.end < maskArray.length);

			// if  you select a fixed char it will ignore your input
			if (!(end - start)) return true;

			// removes all the chars into the range
			for (i=rstart; i<rend; i++){
				this.maskMold[i] = this.maskMoldEmpty[i];
			}

			if (!o.isRemoveKey){
				i = this.validIndexes[start];
				if (!(returnFromTestEntry = this.testEvents(i, c, e.code, o.isRemoveKey))) return true;
				if (typeof returnFromTestEntry == 'string') c = returnFromTestEntry;
				this.maskMold[i] = c;
				start++;
			}

			this.element.set('value', this.maskMold.join(''));
			this.element.setCaretPosition(this.validIndexes[start]);
		}
		return this.parent();
	},

	paste: function(e, o){
		var retApply = this.applyMask(this.element.get('value'), o.range.start);
		this.maskMold = retApply.value;
		this.element.set('value', this.maskMold.join(''))
			.setCaretPosition(retApply.rangeStart);
		return true;
	},

	getLastValidIndex: function(elementValue){
		var lastValidIndex = elementValue.length,
			placeholder = this.options.placeholder,
			i = elementValue.length - 1,
			cont;
		while (i >= 0){
			cont = false;
			while (this.isFixedChar(elementValue.charAt(i)) && elementValue.charAt(i) !== placeholder){
				if (i == 0) lastValidIndex = 0;
				cont = true;
				i--;
			}
			while (elementValue.charAt(i) === placeholder){
				lastValidIndex = i;
				cont = true;
				i--;
			}
			if (!cont) break;
		}
		return lastValidIndex;
	},

	removeInvalidTrailingChars: function(elementValue){
		return elementValue.substring(0, this.getLastValidIndex(elementValue));
	},

	testEvents: function(index, _char, code, isRemoveKey){
		var maskArray = this.maskArray,
			rule = Meio.Mask.rules[maskArray[index]],
			returnFromTestEntry;
		if (!isRemoveKey){
			var args = [this.element, code, _char];
			if (!rule || !(returnFromTestEntry = this.testEntry(this.element.get('value'), index, _char))){
				this.fireEvent('invalid', args);
				return false;
			}
			this.fireEvent('valid', args);
		}
		return (returnFromTestEntry != null) ? returnFromTestEntry : true;
	},

	shouldFocusNext: function(){
		return this.unmask(this.element.get('value')).length >= this.validIndexes.length;
	},

	createUnmaskRegex: function(){
		var fixedCharsArray = [].combine(this.options.mask.replace(Meio.Mask.rulesRegex, '').split(''));
		var chars = (fixedCharsArray.join('') + this.options.placeholder).escapeRegExp();
		this.unmaskRegex = chars ? new RegExp('[' + chars + ']', 'g') : null;
	},

	testEntry: function(str, index, _char){
		var maskArray = this.maskArray,
			rule = Meio.Mask.rules[maskArray[index]],
			ret = (rule && rule.regex.test(_char));
		return (rule.check && ret) ? rule.check(str, index, _char) : ret;
	},

	applyMask: function(str, newRangeStart){
		var strArray = str.split(''),
			maskArray = this.maskArray,
			maskMold = this.maskMold,
			rules = Meio.Mask.rules,
			eli = 0,
			returnFromTestEntry;

		while (eli < maskMold.length){
			if (!strArray[eli]){
				strArray[eli] = maskMold[eli];
			} else if (rules[maskArray[eli]]){
				if (!(returnFromTestEntry = this.testEntry(str, eli, strArray[eli]))){
					strArray.splice(eli, 1);
					continue;
				} else {
					if (typeof returnFromTestEntry == 'string') strArray[eli] = returnFromTestEntry;
				}
				newRangeStart = eli;
			} else if (maskArray[eli] != strArray[eli]){
				strArray.splice(eli, 0, maskMold[eli]);
			} else {
				strArray[eli] = maskMold[eli];
			}
			eli++;
		}

		return {value: strArray.slice(0, this.maskMoldEmpty.length), rangeStart: newRangeStart + 1};
	},

	mask: function(str){
		str = this.applyMask(str).value.join('');
		if (this.options.removeInvalidTrailingChars) str = this.removeInvalidTrailingChars(str);
		return str;
	},

	unmask: function(str){
		return this.unmaskRegex ? str.replace(this.unmaskRegex, '') : str;
	}

});

Meio.Mask.createMasks('Fixed', {
	'Phone'		: {mask: '(99) 9999-9999'},
	'PhoneUs'	: {mask: '(999) 999-9999'},
	'Cpf'		: {mask: '999.999.999-99'},
	'Cnpj'		: {mask: '99.999.999/9999-99'},
	'Date'		: {mask: '3d/1m/9999'},
	'DateUs'	: {mask: '1m/3d/9999'},
	'Cep'		: {mask: '99999-999'},
	'Time'		: {mask: '2h:59'},
	'Cc'		: {mask: '9999 9999 9999 9999'},
	'Mac'		: {mask: 'HH:HH:HH:HH:HH:HH'}
});
