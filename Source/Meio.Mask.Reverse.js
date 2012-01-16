/*
---

name: Meio.Mask.Reverse

description: A mask used for currency and decimal numbers.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Mask

license: MIT-style license

provides: [Meio.Mask.Reverse]

...
*/

Meio.Mask.Reverse = new Class({

	Extends: Meio.Mask,

	options: {
		autoSetSize: false,
		autoEmpty: false,
		alignText: true,
		symbol: '',
		precision: 2,
		decimal: ',',
		thousands: '.',
		maxLength: 18
	},

	initialize: function(options){
		this.parent(options);
		var thousandsChar = this.options.thousands,
			escapedThousandsChar = thousandsChar.escapeRegExp(),
			escapedDecimalChar = this.options.decimal.escapeRegExp();
		this.maxlength = this.options.maxLength;
		this.reThousands = new RegExp('^([^\\D'+ escapedThousandsChar +']+)(\\d{3})');
		this.reRemoveLeadingZeros = /^0+(.*)$/;
		this.reDecimalNumber = /^\d$/;
		this.thousandsReplaceStr = '$1' + thousandsChar + '$2';
		this.reThousandsReplace = new RegExp(escapedThousandsChar, 'g');
		this.reCleanup = new RegExp('[' + escapedThousandsChar + escapedDecimalChar + ']', 'g');
		this.reRemoveNonNumbers = new RegExp('[^\\d' + escapedThousandsChar + escapedDecimalChar + ']', 'g');
	},

	link: function(element){
		this.parent(element);
		if (this.options.alignText) this.element.setStyle('text-align', 'right');
		var elementValue = this.element.get('value');
		if (elementValue === '' && !this.options.autoEmpty){
			this.element.set('value', this.forceMask(elementValue, false));
		}
		return this;
	},

	focus: function(e, o){
		var element = this.element,
			elValue = element.get('value');
		if (this.options.autoEmpty){
			if (elValue === '') element.set('value', this.mask(elValue));
		} else {
			element.set('value', this.getValue(elValue, true));
		}
		this.parent(e, o);
	},

	blur: function(e, o){
		this.parent(e, o);
		var element = this.element,
			value = this.getValue(element.get('value'));
		if (this.options.autoEmpty && this.mask(value) == this.mask()) value = '';
		element.set('value', value);
	},

	keypress: function(e, o){
		if (this.ignore) return true;
		e.preventDefault();

		var state = this.getCurrentState(e, o), elementValue = state.value;

		if (!this.testEvents(elementValue, state._char, e.code, o.isRemoveKey)) return true;
		elementValue = this.forceMask(elementValue, true);
		this.element.set('value', elementValue).setCaretPosition(elementValue.length);

		return this.parent();
	},

	testEvents: function(elementValue, _char, code, isRemoveKey){
		var args = [this.element, code, _char];
		if (!isRemoveKey){
			var elementValueLength = this.getValue(elementValue, false).length;
			if (!(this.reDecimalNumber).test(_char) || (this.maxlength && elementValueLength > this.maxlength)){
				this.fireEvent('invalid', args);
				return false;
			}
			this.fireEvent('valid', args);
		}
		return true;
	},

	paste: function(e, o){
		var element = this.element;
		var elValue = element.get('value');
		element.set('value', (elValue = this.forceMask(elValue, true))).setCaretPosition(elValue.length);
		return true;
	},

	forceMask: function(str, applySymbol){
		str = this.cleanup(str);
		var precision = this.options.precision;
		var zeros = precision + 1 - str.length;
		if (zeros > 0) str = this.zeroize(str, zeros);
		if (precision){
			var decimalIndex = str.length - precision;
			str = str.substring(0, decimalIndex) + this.options.decimal + str.substring(decimalIndex);
		}
		return this.getValue(this.maskThousands(str), applySymbol);
	},

	cleanup: function(str){
		str = str.replace(this.reRemoveNonNumbers, '').replace(this.reCleanup, '');
		return this.getValue(str).replace(this.reRemoveLeadingZeros, '$1');
	},

	mask: function(str){
		str = this.unmask(str || '0').replace('.', this.options.decimal);
		return this.getValue(this.maskThousands(str), true);
	},

	unmask: function(str){
		return this.toNumber(this.getValue(str));
	},

	toNumber: function(str){
		str = str.replace(this.reRemoveNonNumbers, '');
		if (!isFinite(str)){
			if (this.options.thousands) str = str.replace(this.reThousandsReplace, '');
			var decimalChar = this.options.decimal;
			if (decimalChar) str = str.replace(decimalChar, '.');
		}
		return str.toFloat().toFixed(this.options.precision);
	},

	getValue: function(str, applySymbol){
		var symbol = this.options.symbol;
		return (str.substring(0, symbol.length) === symbol) ?
			applySymbol ? str : str.substring(symbol.length) :
			applySymbol ? symbol + str : str;
	},

	maskThousands: function(str){
		if (this.options.thousands){
			while (this.reThousands.test(str)) str = str.replace(this.reThousands, this.thousandsReplaceStr);
		}
		return str;
	},

	zeroize: function(str, zeros){
		while (zeros--) str = '0' + str;
		return str;
	},

	shouldFocusNext: function(){
		return this.getValue(this.element.get('value'), false).length >= this.options.maxLength;
	}
});

Meio.Mask.createMasks('Reverse', {
	'Integer'		: {precision: 0, maxLength: 18},
	'Decimal'		: { },
	'DecimalUs'		: {thousands: ',', decimal: '.'},
	'Reais'			: {symbol: 'R$ '},
	'Euro'			: {symbol: '€ '},
	'Dollar'		: {symbol: 'US$ ', thousands: ',', decimal: '.'}
});
