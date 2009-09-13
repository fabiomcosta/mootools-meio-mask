/**
 * moo.meio.mask.js
 * @author: fabiomcosta
 * @version 1.0
 * Inspired by iMask http://zendold.lojcomm.com.br/imask/
 *
 * Created by Fabio M. Costa on 2008-09-16. Please report any bug at http://www.meiocodigo.com
 *
 * Copyright (c) 2008 Fabio M. Costa http://www.meiocodigo.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
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
		
		selectOnFocus: true,
		autoTab: false
		
		//onInvalid: $empty,
		//onValid: $empty,
		//onOverflow: $empty
		
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
		if(this.options.mask){
			if(this.element.retrieve('meiomask')) this.remove();
			var elementValue = this.element.get('value');
			if(elementValue !== ''){
				var elValue = elementValue.meiomask(this.constructor, this.options);
				this.element.set('value', elValue).defaultValue = elValue;
			}
			this.ignore = false;
			this.masklength = this.element.get('maxlength');
			this.maskArray = this.options.mask.split('');
    		this.eventsToBind.each(function(evt){
    			this.element.addEvent(evt, this._onMask.bindWithEvent(this, this['_' + evt]));
    		}, this);
			this.element.store('meiomask', this).erase('maxlength');
		}
		return this;
	},
	
	remove: function(){
		var mask = this.element.retrieve('meiomask');
		if(mask){
			var maxLength = mask.options.maxlength;
			if(maxLength !== null) this.element.set('maxlength', maxLength);
			mask.eventsToBind.each(function(evt){
				this.element.removeEvent(evt, this[evt + 'Event']);
			}, mask);
		}
		return this;
	},
	
	_onMask: function(e, func){
		if(this.element.get('readonly')) return true;
		var o = {};
		o.range = this.element.getRange();
		o.isSelection = (o.range.start !== o.range.end);
		// 8==backspace && 46==delete && 127==iphone's delete (i mean backspace)
		o.isDelKey = (e.code == 46);
		o.isBksKey = (e.code == 8 || (Browser.Platform.ipod && e.code == 127));
		o.isRemoveKey = (o.isBksKey || o.isDelKey);
		func.call(this, e, o);
		return true;
	},

    _keydown: function(e, o){
		this.ignore = (e.code in Meio.Mask.ignoreKeys);
		if(this.ignore){
    		// var rep = Meio.Mask.ignoreKeys[e.code];
			// no more representation of the keys yet... (since this is not so used or usefull you know..., im thinking about that)
			this.fireEvent('valid', [this.element, e.code]);
    	}
		(Browser.Platform.ipod
		|| (Meio.Mask.onlyKeyDownRepeat && o.isRemoveKey))? this._keypress(e, o): true;
    },
    
    _focus: function(e, o){
        if(this.options.selectOnFocus) this.element.select();
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
			if(!rule){
	    		//console.log('overflow');
				this.fireEvent('overflow', [this.element, code, _char]);
	    		return false;
	    	}
	    	else if(!(returnFromTestEntry = this.testEntry(index, _char))){
				//console.log('invalid');
	    		this.fireEvent('invalid', [this.element, code, _char]);
	    		return false;
	    	}
		}
    	//console.log('valid');
		this.fireEvent('valid', [this.element, code, _char]);
		return returnFromTestEntry || true;
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
    
    rulesRegex: new RegExp(),
	
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
	        Meio.Mask[type][mask.camelCase().capitalize()] = new Class({
		        Extends: Meio.Mask[type],
		        options: masks[mask]
		    });
	    }
	},
	
	// Christoph Pojer's (zilenCe) idea http://cpojer.net/
	// adapted to MeioMask
	upTo: function(number){
	    number = String(number);
	    return function(value, index, _char){
	        if(value.charAt(index-1) == number[0])
		        return (_char<=number[1]);
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
		//8: 'backspace',
		9 		: 'tab',
		13      : 'enter',
		16 	    : 'shift',
		17 	    : 'control',
		18 	    : 'alt',
		27 	    : 'esc',
		33	    : 'page up',
		34 	    : 'page down',
		35 	    : 'end',
		36 	    : 'home',
		37 	    : 'left',
		38 	    : 'up',
		39 	    : 'right',
		40 	    : 'down',
		45 	    : 'insert',
		//46: 'delete',
		224  	: 'command'
	},
	iphoneIgnoreKeys = {
		10		: 'go'
		//127: 'delete'
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
		//its included just to exemplify how to use it, its used on the time mask
		'h': {regex: /[0-9]/, check: Meio.Mask.upTo(23)},
		'd': {regex: /[0-9]/, check: Meio.Mask.upTo(31)},
		'm': {regex: /[0-9]/, check: Meio.Mask.upTo(12)}
	};
	for(var i=0; i<=9; i++) rules[i] = {regex: new RegExp('[0-' + i + ']')};
	return rules;
})());


Meio.Mask.Fixed = new Class({
    
    Extends: Meio.Mask,
    
    options: {
        placeholder: '_',
		autoSetSize: false,
		removeIfInvalid: false, // removes the value onblur if the input is not valid
		removeInvalidTrailingChars: true
    },

    initialize: function(element, options){
		this.parent(element, options);
		this.maskMold = this.element.get('value') || this.options.mask.replace(Meio.Mask.rulesRegex, this.options.placeholder);
		this.maskMoldArray = this.maskMold.split('');
		this.validIndexes = [];
		if(this.options.autoSetSize) this.setSize();
		this.maskArray.each(function(c, i){
		    if(!this.isFixedChar(c)) this.validIndexes.push(i);
		}, this);
		this.createUnmaskRegex();
	},
	
	createUnmaskRegex: function(){
	    var fixedCharsArray = [].combine(this.options.mask.replace(Meio.Mask.rulesRegex, '').split(''));
	    this.unmaskRegex = new RegExp('[' + fixedCharsArray.join('').escapeRegExp() + ']', 'g');
	},

	_applyMask: function(elementValue, newRangeStart){
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
		if(this.options.removeInvalidTrailingChars) this._removeInvalidTrailingChars(elementValue);
		return true;
	},
    
    _keypress: function(e, o){
		if(this.ignore || e.control || e.meta || e.alt) return true;
        
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
			
			this.element.set('value', this.maskMoldArray.join(''))
			    .setRange($pick(finalRangePosition, this.maskMoldArray.length));
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
			this.element.setRange(this.validIndexes[start]);
		}
		return true;
    },
    
    mask: function(str){
        return this._applyMask(str).value.join('');
    },
    
    unmask: function(str){
        return str.replace(this.unmaskRegex, '');
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
Meio.Mask.Fixed.Time = new Class({
    Extends: Meio.Mask.Fixed,
    options: {
        mask: '2h:59'
    }
});
*/

Meio.Mask.DumbInput = new Element('input', {'type': 'text'});

// sets mask to this input and returns this input
(function(){
	
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
	
    String.implement({
    	meiomask: function(){
    	    var args = getClassOptions(arguments);
    	    return new args.klass(Meio.Mask.DumbInput, args.options).mask(this);
    	},
    	meiounmask: function(){
    	    var args = getClassOptions(arguments);
    	    return new args.klass(Meio.Mask.DumbInput, args.options).unmask(this);
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

	// fix for maxlength property, you will have to use get/set/erase 'maxlength', lowercased for this to work
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
	
	Element.implement({
    	meiomask: function(mask, type, options){
            return this.set('meiomask', mask, type, options);
        },

    	// http://www.bazon.net/mishoo/articles.epl?art_id=1292
    	setRange : function(start, end){
    		end = $pick(end, start);
    		if (this.setSelectionRange){
    			this.setSelectionRange(start, end);
    		}
    		else{
    			var range = this.createTextRange();
    			range.collapse();
    			range.moveStart('character', start);
    			range.moveEnd('character', end - start);
    			range.select();
    		}
    	},

    	// adaptation from http://digitarald.de/project/autocompleter/
    	getRange : function(){
    		if (!Browser.Engine.trident) return {start: this.selectionStart, end: this.selectionEnd};
    		var pos = {start: 0, end: 0},
    			range = document.selection.createRange();
    		pos.start = 0 - range.duplicate().moveStart('character', -100000);
    		pos.end = pos.start + range.text.length;
    		return pos;
    	}
    });
	
})();

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