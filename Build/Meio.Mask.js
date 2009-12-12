/*
---

description: The base component for the Meio.Mask plugin.

authors:
 - Fábio Miranda Costa

requires:
 - core/1.2.3:
   - Class.Extras
   - Element.Event
   - Element.Style
 - more/1.2.3.1:Element.Forms

license: MIT-style license

provides: [Meio.Mask]

...
*/

if(typeof Meio == 'undefined') var Meio = {};

$extend(Element.NativeEvents, {
	'paste': 2, 'input': 2
});
// thanks Jan Kassens
Element.Events.paste = {
	base : (Browser.Engine.presto || (Browser.Engine.gecko && Browser.Engine.version < 19))? 'input': 'paste',
	condition: function(e){
		this.fireEvent('paste', e, 1);
		return false;
	}
};
	
Meio.Mask = new Class({

	Implements: [Options, Events],
	
	eventsToBind: ['focus', 'blur', 'keydown', 'keypress', 'paste'],

	options: {
		selectOnFocus: true

		//onInvalid: $empty,
		//onValid: $empty,
		
		//REVERSE MASK OPTIONS
		//signal: false,
		//setSize: false
	},

	initialize: function(el, options){
		this.element = $(el);
		if(this.element.get('tag') !== 'input' || this.element.get('type') !== 'text') return;
		this.setup(options);
	},
    
	setup: function(options){
		this.setOptions(options);
		if(this.element.retrieve('meiomask')) this.remove();
		this.ignore = false;
		this.maxlength = this.element.get('maxlength');
		this.eventsToBind.each(function(evt){
			this.element.addEvent(evt, this.onMask.bindWithEvent(this, this[evt]));
		}, this);
		this.element.store('meiomask', this).erase('maxlength');
		var elementValue = this.element.get('value');
		if(elementValue !== ''){
			var elValue = elementValue.meiomask(this.constructor, this.options);
			this.element.set('value', elValue).defaultValue = elValue;
		}
		return this;
	},
	
	remove: function(){
		var mask = this.element.retrieve('meiomask');
		if(mask){
			var maxlength = mask.maxlength;
			if(maxlength !== null) this.element.set('maxlength', maxlength);
			mask.eventsToBind.each(function(evt){
				this.element.removeEvent(evt, this[evt]);
			}, mask);
			this.element.eliminate('meiomask');
		}
		return this;
	},
	
	onMask: function(e, func){
		if(this.element.get('readonly')) return true;
		var o = {};
		o.range = this.element.getSelectedRange();
		o.isSelection = (o.range.start !== o.range.end);
		// 8==backspace && 46==delete && 127==iphone's delete (i mean backspace)
		o.isDelKey = (e.event.keyCode == 46);
		o.isBksKey = (e.event.keyCode == 8 || (Browser.Platform.ipod && e.code == 127));
		o.isRemoveKey = (o.isBksKey || o.isDelKey);
		func.call(this, e, o);
		return true;
	},

    keydown: function(e, o){
		this.ignore = (Meio.Mask.ignoreKeys[e.code] && !o.isRemoveKey) || e.control || e.meta || e.alt;
		if(this.ignore || o.isRemoveKey){
			var keyRepresentation = Meio.Mask.ignoreKeys[e.code] || '';
			this.fireEvent('valid', [this.element, e.code, keyRepresentation]);
		}
		(Browser.Platform.ipod
		|| (Meio.Mask.onlyKeyDownRepeat && o.isRemoveKey))? this.keypress(e, o): true;
	},
    
	focus: function(e, o){
		var element = this.element;
		element.store('meiomask:focusvalue', element.get('value'));
	},

	blur: function(e, o){
		var element = this.element;
		if(element.retrieve('meiomask:focusvalue') != element.get('value')){
			element.fireEvent('change');
		}
	},

	setSize: function(){
		if(!this.element.get('size')) this.element.set('size', this.maskArray.length);
	},
	
	isFixedChar: function(_char){
	    return !Meio.Mask.matchRules.contains(_char);
	}
});

Meio.Mask.extend({

	matchRules: '',

	rulesRegex: new RegExp(''),
	
	rules: {},
	
	setRule: function(ruleKey, properties){
		this.setRules({ruleKey: properties});
	},

	setRules: function(rulesObj){
		$extend(this.rules, rulesObj);
		var rulesKeys = [];
		for(rule in rulesObj) rulesKeys.push(rule);
		this.matchRules += rulesKeys.join('');
		this.recompileRulesRegex();
	},

	removeRule: function(rule){
		delete this.rules[rule];
		this.matchRules = this.matchRules.replace(rule, '');
		this.recompileRulesRegex();
	},

	removeRules: function(){
		var rulesToRemove = Array.flatten(arguments);
		for(var i=rulesToRemove.length; i--;) this.removeRule(rulesToRemove[i]);
	},
	
	recompileRulesRegex: function(){
		this.rulesRegex.compile('[' + this.matchRules.escapeRegExp() + ']', 'g');
	},
	
	createMasks: function(type, masks){
		type = type.capitalize();
		for(mask in masks){
			this[type][mask.camelCase().capitalize()] = new Class({
				Extends: this[type],
				options: masks[mask]
			});
		}
	},
	
	// Christoph Pojer's (zilenCe) idea http://cpojer.net/
	// adapted to MeioMask
	upTo: function(number){
		number = '' + number;
		return function(value, index, _char){
			if(value.charAt(index-1) == number[0])
				return (_char <= number[1]);
			return true;
		};
	},
	
	// http://unixpapa.com/js/key.html
	// if only the keydown auto-repeats
	// if you have a better implementation of this detection tell me
	onlyKeyDownRepeat: (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version >= 525))
	
}).extend(function(){
	var ignoreKeys;
	var desktopIgnoreKeys = {
		8		: 'backspace',
		9		: 'tab',
		13		: 'enter',
		16		: 'shift',
		17		: 'control',
		18		: 'alt',
		27		: 'esc',
		33		: 'page up',
		34		: 'page down',
		35		: 'end',
		36		: 'home',
		37		: 'left',
		38		: 'up',
		39		: 'right',
		40		: 'down',
		45		: 'insert',
		46		: 'delete',
		224		: 'command'
	},
	iphoneIgnoreKeys = {
		10		: 'go',
		127		: 'delete'
	};
	
	if(Browser.Platform.ipod){
		ignoreKeys = iphoneIgnoreKeys;
	}
	else{
		// f1, f2, f3 ... f12
		for(var i=1; i<=12; i++) desktopIgnoreKeys[111 + i] = 'f' + i;
		ignoreKeys = desktopIgnoreKeys; 
	}
	return {ignoreKeys: ignoreKeys};
}())
.setRules((function(){
	var rules = {
		'z': {regex: /[a-z]/},
		'Z': {regex: /[A-Z]/},
		'a': {regex: /[a-zA-Z]/},
		'*': {regex: /[0-9a-zA-Z]/},
		'@': {regex: /[0-9a-zA-ZçáàãâéèêíìóòõôúùüñÇÁÀÃÂÉÈÊÍÌÓÒÕÔÚÙÜÑ]/}, //i doenst work here
		'h': {regex: /[0-9]/, check: Meio.Mask.upTo(23)},
		'd': {regex: /[0-9]/, check: Meio.Mask.upTo(31)},
		'm': {regex: /[0-9]/, check: Meio.Mask.upTo(12)}
	};
	for(var i=0; i<=9; i++) rules[i] = {regex: new RegExp('[0-' + i + ']')};
	return rules;
})());


/*
---

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

    initialize: function(element, options){
		this.parent(element, options);
		this.maskArray = this.options.mask.split('');
		this.maskMold = this.element.get('value') || this.options.mask.replace(Meio.Mask.rulesRegex, this.options.placeholder);
		this.maskMoldArray = this.maskMold.split('');
		this.validIndexes = [];
		if(this.options.autoSetSize) this.setSize();
		this.maskArray.each(function(c, i){
		    if(!this.isFixedChar(c)) this.validIndexes.push(i);
		}, this);
		this.createUnmaskRegex();
	},
	
	focus: function(e, o){
		this.element.set('value', this.maskMoldArray.join(''));
		if(this.options.selectOnFocus) this.element.select();
		this.parent(e, o);
	},

	blur: function(e, o){
		this.parent(e, o);
		var elementValue = this.element.get('value');
		if(this.options.removeIfInvalid){
			if(elementValue.contains(this.options.placeholder)){
				this.maskMoldArray = this.maskMold.split('');
				this.element.set('value', '');
			}
			return true;
		} 
		if(this.options.removeInvalidTrailingChars) this.removeInvalidTrailingChars(elementValue);
		return true;
	},
    
	keypress: function(e, o){
		if(this.ignore) return true;

		e.preventDefault();
		var c = String.fromCharCode(e.code),
			maskArray = this.maskArray,
			start, i, returnFromTestEntry;

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
			if(!(returnFromTestEntry = this.testEvents(i, c, e.code, o.isRemoveKey))) return true;
			if($type(returnFromTestEntry) === 'string') c = returnFromTestEntry;
			this.maskMoldArray[i] = (o.isRemoveKey)? this.options.placeholder: c;
			
			var newCarretPosition = $pick(finalRangePosition, this.maskMoldArray.length);
			this.element.set('value', this.maskMoldArray.join(''))
				.selectRange(newCarretPosition, newCarretPosition);
		}
		else{

			var rstart = o.range.start,
			    rend = o.range.end,
			    end;

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
				if(!(returnFromTestEntry = this.testEvents(i, c, e.code, o.isRemoveKey))) return true;
				if($type(returnFromTestEntry) === 'string') c = returnFromTestEntry;
				this.maskMoldArray[i] = c;
				start++;
			}
			
			this.element.set('value', this.maskMoldArray.join(''));
			this.element.selectRange(this.validIndexes[start], this.validIndexes[start]);
		}
		return true;
	},
    
	paste: function(e, o){
		var retApply = this.applyMask(this.element.get('value'), o.range.start);
		this.maskMoldArray = retApply.value;
		this.element.set('value', this.maskMoldArray.join(''))
			.selectRange(retApply.rangeStart, retApply.rangeStart);
		return true;
	},

	mask: function(str){
		return this.applyMask(str).value.join('');
	},

	unmask: function(str){
		return str.replace(this.unmaskRegex, '');
	},

	createUnmaskRegex: function(){
		var fixedCharsArray = [].combine(this.options.mask.replace(Meio.Mask.rulesRegex, '').split(''));
		this.unmaskRegex = new RegExp('[' + fixedCharsArray.join('').escapeRegExp() + ']', 'g');
	},

	applyMask: function(elementValue, newRangeStart){
		var elementValueArray = elementValue.split(''),
			maskArray = this.maskArray,
			maskMold = this.maskMold,
			eli = 0,
			returnFromTestEntry;
			
		while(eli < maskMold.length){
			if(!elementValueArray[eli]){
				elementValueArray[eli] = maskMold[eli];
			}
			else if(Meio.Mask.rules[maskArray[eli]]){
				if(!(returnFromTestEntry = this.testEntry(eli, elementValueArray[eli]))){
					elementValueArray.splice(eli, 1);
					continue;
				}
				else{
				    if($type(returnFromTestEntry) === 'string') elementValueArray[eli] = returnFromTestEntry;
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

    removeInvalidTrailingChars: function(elementValue){
		var truncateIndex = elementValue.length,
		    placeholder = this.options.placeholder,
			i = elementValue.length - 1,
		    cont;
		while(i >= 0){
			cont = false;
			while(this.isFixedChar(elementValue.charAt(i)) && elementValue.charAt(i) !== placeholder){
				cont = true;
				i--;
			}
			while(elementValue.charAt(i) === placeholder){
			    cont = true;
				truncateIndex = i;
				i--;
			}
			if(!cont) break;
		}
		this.element.set('value', elementValue.substring(0, truncateIndex));
    },
	
	testEntry: function(index, _char){
		var maskArray = this.maskArray,
			rule = Meio.Mask.rules[maskArray[index]],
			ret = (rule && rule.regex.test(_char));
		return (rule.check && ret)? rule.check(this.element.get('value'), index, _char): ret;
	},
	
	testEvents: function(index, _char, code, isRemoveKey){
		var maskArray = this.maskArray,
			rule = Meio.Mask.rules[maskArray[index]],
			returnFromTestEntry;
		if(!isRemoveKey){
			var args = args = [this.element, code, _char];
			if(!rule || !(returnFromTestEntry = this.testEntry(index, _char))){
				this.fireEvent('invalid', args);
				return false;
			}
			this.fireEvent('valid', args);
		}
		return returnFromTestEntry || true;
	}
});


Meio.Mask.createMasks('Fixed', {
	'Phone'				: { mask: '(99) 9999-9999' },
	'PhoneUs'			: { mask: '(999) 999-9999' },
	'Cpf'				: { mask: '999.999.999-99' },
	'Cnpj'				: { mask: '99.999.999/9999-99' },
	'Date'				: { mask: '3d/1m/9999' },
	'DateUs'			: { mask: '1m/3d/9999' },
	'Cep'				: { mask: '99999-999' },
	'Time'				: { mask: '2h:59' },
	'CC'				: { mask: '9999 9999 9999 9999' }
});

/*
---

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
		alignText: true,
		symbol: '',
		precision: 2,
		decimal: ',',
		thousands: '.',
		maxLength: 19
	},

	initialize: function(element, options){
		this.parent(element, options);
		var escapedDecimalChar = this.options.decimal.escapeRegExp(),
		thousandsChar = this.options.thousands,
		escapedThousandsChars = thousandsChar.escapeRegExp();
		if(this.options.alignText) this.element.setStyle('text-align', 'right');
		this.maxlength = this.maxlength || this.options.maxLength;
		this.thousandsRegex = /(\d+)(\d{3})/;
		this.removeLeadingZerosRegex = /^0+(.*)$/;
		this.decimalNumberRegex = /^\d$/;
		this.thousandsReplaceStr = '$1' + thousandsChar + '$2';
		this.thousandsReplaceRegex = new RegExp(escapedThousandsChars, 'g');
		this.cleanupRegex = new RegExp('[' + escapedThousandsChars + escapedDecimalChar + ']', 'g');
		var elementValue = this.element.get('value');
		if(elementValue === ''){
			elementValue = this.mask(elementValue);
			this.element.set('value', elementValue).defaultValue = elementValue;
		}
	},

	focus: function(e, o){
		var element = this.element,
		elValue = element.get('value'),
		symbol = this.options.symbol;
		element.set('value', (elValue = this.getValue(elValue, true)));
		if(this.options.selectOnFocus)
			element.selectRange(symbol.length, elValue.length);
		this.parent(e, o);
	},

	blur: function(e, o){
		this.parent(e, o);
		var element = this.element;
		element.set('value', this.getValue(element.get('value')));
	},

	keypress: function(e, o){
		if(this.ignore) return true;
		e.preventDefault();
		var _char = String.fromCharCode(e.code),
		elementValue = this.element.get('value');

		elementValue = o.isRemoveKey? elementValue.substring(0, elementValue.length - 1): this.getValue(elementValue + _char);

		if(!this.testEvents(elementValue.length, _char, e.code, o.isRemoveKey)) return true;
		elementValue = this.forceMask(elementValue, true);
		this.element.set('value', elementValue).selectRange(elementValue.length, elementValue.length);
		return true;
	},

	testEvents: function(elementValueLength, _char, code, isRemoveKey){
		var args = [this.element, code, _char];
		if(!isRemoveKey){
			if(!(this.decimalNumberRegex).test(_char) || elementValueLength >= this.maxlength){
				this.fireEvent('invalid', args);
				return false;
			}
			this.fireEvent('valid', args);
		}
		return true;
	},

	paste: function(e, o){
		e.preventDefault();
		var element = this.element;
		elValue = element.get('value');
		element.set('value', (elValue = this.forceMask(elValue, true))).selectRange(elValue.length, elValue.length);
		return true;
	},

	forceMask: function(str, withSymbol){
		str = this.cleanup(str);
		var precision = this.options.precision;
		if(precision){
			var zeros = precision + 1 - str.length;
			if(zeros > 0) str = this.zeroize(str, zeros);
			var decimalIndex = str.length - precision;
			str = str.substring(0, decimalIndex) + this.options.decimal + str.substring(decimalIndex);
		}
		return this.getValue(this.maskThousands(str), withSymbol);
	},

	cleanup: function(str){
		return this.getValue(str.replace(this.cleanupRegex, '')).replace(this.removeLeadingZerosRegex, '$1');
	},

	mask: function(str, withSymbol){
		str = str || '0';
		str = this.unmask(str).replace('.', this.options.decimal);
		return this.getValue(this.maskThousands(str), withSymbol);
	},

	unmask: function(str){
		return this.toNumber(this.getValue(str));
	},

	toNumber: function(str){
		if(!isFinite(str)){
			var thousandsChar = this.options.thousands,
			decimalChar = this.options.decimal;
			if(thousandsChar) str = str.replace(this.thousandsReplaceRegex, '');
			if(decimalChar) str = str.replace(decimalChar, '.');
		}
		return str.toFloat().toFixed(this.options.precision);
	},

	getValue: function(str, withSymbol){
		var symbol = this.options.symbol;
		return (str.substring(0, symbol.length) === symbol)?
		withSymbol? str: str.substring(symbol.length):
		withSymbol? symbol + str: str;
	},

	maskThousands: function(str){
		if(this.options.thousands){
			while(this.thousandsRegex.test(str)) str = str.replace(this.thousandsRegex, this.thousandsReplaceStr);
		}
		return str;
	},

	zeroize: function(str, zeros){
		while(zeros--)  str = '0' + str;
		return str;
	}

});

Meio.Mask.createMasks('Reverse', {
	'Integer'			: { precision: 0, maxLength: 20 },
	'Decimal'			: { },
	'DecimalUs'			: { thousands: ',', decimal: '.' },
	'Reais'				: { symbol: 'R$ ' },
	'Dollar'			: { symbol: 'US$ ', thousands: ',', decimal: '.' }
});

/*
---

description: A mask that is defined by a pattern that will match each of the inputted chars.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Mask

license: MIT-style license

provides: [Meio.Mask.Repeat]

...
*/


Meio.Mask.Repeat = new Class({

	Extends : Meio.Mask,

	_keyup : function(e,o){
		return true;
	},

	_paste : function(e,o){
		this.$el.set('value', this.__mask(o.valueArray, this.globals, this.mask.options));
		return true;
	},

	_keypress: function(e,o){
		if(this.ignore || e.control || e.meta || e.alt) return true;
		var c = String.fromCharCode(e.code),
			maskArray = this.mask.options.maskArray,
			valueArray = o.value.replace(this.globals.fixedCharsRegG, '').split('');
		if(!this.testEvents(maskArray, 0, c, e.code)) return false;
		this.$el.set('value', valueArray.join(''));
		return true;
	}

});

/*
---

description: A mask that is defined by a regular expression.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Mask

license: MIT-style license

provides: [Meio.Mask.Regexp]

...
*/

Meio.Mask.Regexp = new Class({

	Extends : Meio.Mask,

	options: {
		//maxLength: 18
		//regex: /^$/
	},

	initialize : function(element, options){
		this.parent(element, options);
		this.regex = new RegExp(this.options.regex);
	},

	keypress: function(e, o){
		if(this.ignore) return true;
		e.preventDefault();
	
		var _char = String.fromCharCode(e.code),
			elValue = this.element.get('value');
    
		elValue = elValue.substring(0, o.range.start) + (o.isRemoveKey? '': _char) +  elValue.substring(o.range.end);
		if(this.regex.test(elValue)){
			this.element.set('value', elValue);
		}
		return true;
	}

});

Meio.Mask.createMasks('Regexp', {
    'Ip'		: { regex: /^(\d{1,3})(\.\d{1,3}){0,3}?$/, maxLength: 15 }
});

/*
---

description: Extra functionality for Meio.Mask plugin. Like String.meiomask that masks a string and Element.meiomask which is a convinience method for setting the masks.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Mask

license: MIT-style license

provides: [Meio.Mask.Extras]

...
*/

(function(){

	Meio.Mask.dummyInput = new Element('input', {'type': 'text'});
	
	var upperCamelize = function(str){
		return str.camelCase().capitalize();
	};
	
	var getClassOptions = function(args){
		var classNames = [];
		args = Array.link(args, {mask: String.type, type: String.type, options: Object.type, klass: Class.type});
		if(args.mask) classNames = args.mask.contains('.')? args.mask.split('.'): [args.type, args.mask];
		var klass = args.klass || Meio.Mask[upperCamelize(classNames[0])][upperCamelize(classNames[1])],
		    options = args.options || {};
		return {klass: klass, options: options};
	};
	
	var executeFunction = function(functionName, args){
		var co = getClassOptions(args);
		Meio.Mask.dummyInput.set('value', '');
		return new co.klass(Meio.Mask.dummyInput, co.options)[functionName](this);
	};

	String.implement({
		meiomask: function(){
			return executeFunction.call(this, 'mask', arguments);
		},
		meiounmask: function(){
			return executeFunction.call(this, 'unmask', arguments);
		}
	});

	Element.Properties.meiomask = {
		set: function(){
			var args = getClassOptions(arguments);
			return this.store('meiomask', new args.klass(this, args.options));
		},
		// returns the mask object
		get: function(){
			return this.retrieve('meiomask');
		},
		// removes the mask from this input but maintain the mask object stored at its table
		erase: function(){
			var mask = this.retrieve('meiomask');
			if(mask) mask.remove();
			return this;
		}
	};

	// fix for maxlength property
	Element.Properties.maxLength = Element.Properties.maxlength = {
		set: function(value){
			this.setAttribute('maxLength', value);
			return this;
		},
		get: function(){
			var ml = this.getAttribute('maxLength', 2);
			return (ml === 2147483647)? null: ml;
		},
		erase: function(){
			this.removeAttribute('maxLength');
			return this;
		}
	};
	
	/*
	Element.Properties.value = {
		// sets the value but first it applyes the mask (if theres any)
		set: function(value){
			var mask = this.retrieve('meiomask');
			if(mask) value = mask.maskString(value);
			return this.setProperty('value', value);
		}
	};
	*/
	
	Element.implement({
		meiomask: function(mask, type, options){
			return this.set('meiomask', mask, type, options);
		}
	});

})();

