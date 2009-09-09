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

$extend(Element.NativeEvents,{
	'paste': 2, 'input': 2
});
// thanks Jan Kassens
Element.Events.paste = {
	base : (Browser.Engine.presto || ( Browser.Engine.gecko && Browser.Engine.version < 19 ))? 'input': 'paste',
	condition: function(e){
		this.fireEvent('paste', e, 1);
		return false;
	}
};
Meio.MaskGlobals = {

	get: function(){
		if(!this.inited){
			var self = this,i,
				rulesKeys = [];
			
			this.ignoreKeys = (Browser.Platform.ipod)? this.iphoneIgnoreKeys: this.ignoreKeys;
			
			for(i=0; i<=9; i++) this.rules[i] = {regex: new RegExp('[0-'+i+']')};

			//create the fixedChars regular expression
			//this.fixedCharsRegex = new RegExp('[^'+this.rules.getKeys().join('').escapeRegExp()+']');
			//create a regex to match chars from the rules
			for(i in this.rules) rulesKeys.push(i);
			this.matchRules = rulesKeys.join('');
			this.rulesRegex = new RegExp('['+this.matchRules.escapeRegExp()+']', 'g');
			
			//this.keyRep = keyRep;
			//this.ignoreKeys = [];
			//$each(keyRep, function(val, key){
				//self.ignoreKeys.push(key.toInt());
			//});
			
			// http://unixpapa.com/js/key.html
			// if only the keydown auto-repeats
			this.onlyKeyDownRepeat = (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version >= 525));
			this.inited = true;
		}
		return this;
	},
	
	reset: function(){
		this.inited = false;
		return this.get();
	},
	
	setRule: function(ruleKey, properties){
		// you cant set a rule with key bigger than 1
		if(ruleKey.length > 1) return;
		this.rules[ruleKey] = properties;
		this.matchRules += ruleKey;
		this.rulesRegex.compile(this.matchRules.escapeRegExp(), 'g');
	},
	
	setRules: function(rulesObj){
		for(rule in rulesObj) this.setRule(rule, rulesObj[rule]);
	},
	
	removeRule: function(rule){
		delete this.rules[rule];
		this.matchRules = this.matchRules.replace(rule, '');
		this.rulesRegex.compile(this.matchRules.escapeRegExp(), 'g');
	},
	
	removeRules: function(){
		var rulesToRemove = Array.flatten(arguments);
		for(var i=0; i<rulesToRemove.length; i++) this.removeRule(rulesToRemove[i]);
	},
	
	rules: {
		'z': {regex: /[a-z]/},
		'Z': {regex: /[A-Z]/},
		'a': {regex: /[a-zA-Z]/},
		'*': {regex: /[0-9a-zA-Z]/},
		'@': {regex: /[0-9a-zA-ZçÇáàãâéèêíìóòõôúùü]/},
		'c': {regex: /[0-9]/, check: function(value, index, _char){if(value.charAt(index-1)==2) return (_char<=3); return true;}}
	},
	
	ignoreKeys: [
		//8: 'backspace',
		9, 		//: 'tab',
		13, 	//: 'enter',
		16, 	//: 'shift',
		17, 	//: 'control',
		18, 	//: 'alt',
		27, 	//: 'esc',
		33, 	//: 'page up',
		34, 	//: 'page down',
		35, 	//: 'end',
		36, 	//: 'home',
		37, 	//: 'left',
		38, 	//: 'up',
		39, 	//: 'right',
		40, 	//: 'down',
		45, 	//: 'insert',
		//46: 'delete',
		116, 	//: 'f5',
		123, 	//: 'f12',
		224  	//: 'command'
	],
	
	iphoneIgnoreKeys: [
		10		//: 'go',
		//127: 'delete'
	],

	masks: {
		'phone'				: { mask: '(99) 9999-9999)' },
		'phone-us'			: { mask: '(999) 999-9999' },
		'cpf'				: { mask: '999.999.999-99' },
		'cnpj'				: { mask: '99.999.999/9999-99' },
		'date'				: { mask: '39/19/9999' },
		'date-us'			: { mask: '19/39/9999' },
		'cep'				: { mask: '99999-999' },
		'time'				: { mask: '2c:59' },
		'cc'				: { mask: '55 99' },
		//'cc'				: { mask: '(99) 9--9  999 99 99--' },
		'integer'			: { mask: '999.999.999.999', type: 'reverse', decimal: false },
		'decimal'			: { mask: '999.999.999.999,99', type: 'reverse' },
		'decimal-us'		: { mask: '999,999,999,999.99', type: 'reverse' }
	}
};
Meio.Mask = new Class({

	Implements: [Options, Events],

	options: {
		attr: 'alt',
		mask: null,
		type: 'fixed',
		
		setSize: false,
		selectOnFocus: true,
		autoTab: true
		
		//onInvalid : $empty,
		//onValid : $empty,
		//onOverflow : $empty
		//placeHolder : false,
		//defaultValue : '',
		//signal : false
	},

	initialize: function(el, options){
		this.element = $(el);
		if(this.element.get('tag') != 'input' || this.element.get('type') != 'text') return;
		this.globals = Meio.MaskGlobals.get();
		this.change(options);
	},

	change: function(options){
		options = $pick(options, {});

		// see whats the attr that we have to look
		if(options.attr) this.options.attr = options.attr;
		
		var attrValue = this.element.get(this.options.attr),
			tmpMask;

		// then we look for the attr value
		tmpMask = ($type(options) == 'string')? options: (attrValue)? attrValue: null;
		if(tmpMask) this.options.mask = tmpMask;
		
		// then we see if it's a defined mask
		if(this.globals.masks[this.options.mask])
			this.setOptions(this.globals.masks[this.options.mask]);
		
		// apply the json options if any
		// be carefull, your JSON sould be always a valid one.
		// Ex: alt='{"mask":"999:999"}' works (its the ONLY accepted format)
		// alt="{'mask':'999:999'}" doenst work
		// alt='{mask:"999:999"}' doenst work
		// alt="other way", doesnt work!
		if(JSON) this.setOptions(JSON.decode(tmpMask, true));
		
		// merge options cause it will allways overwrite everything
		if($type(options) == 'object') this.setOptions(options);
		
		if(this.options.mask){
			if(this.element.retrieve('meiomask')) this.remove();
			
			var mlValue = this.element.get('maxlength');
				
			this.setOptions({
				maxlength: mlValue,
				maskArray: this.options.mask.split('')
			});
			
			var elementValue = this.element.get('value');
			
			if(elementValue != ''){
				var newValue = elementValue.mask(this.options);
				this.element.defaultValue = newValue;
				this.element.value = newValue;
			}

			this.element.store('meiomask', this).erase('maxlength');
			this.maskType = new Meio.MaskType[this.options.type](this);
		}
		return this;
	},
	
	// removes the mask
	remove : function(){
		var mask = this.element.retrieve('mask');
		if(mask){
			var maxLength = mask.options.maxlength;
			if(maxLength != null) this.element.set('maxlength', maxLength);
			mask.maskType.eventsToBind.each(function(evt){
				this.element.removeEvent(evt, this[evt + 'Event']);
			}, mask.maskType);
		}
		return this;
	}
    
});Meio.MaskType = new Class({
    
    initialize: function(mask){
        this.ignore = false;
        if(mask){
            this.mask = mask;
            this.globals = mask.globals;
            this.element = mask.element;
    		this.eventsToBind = ['focus', 'blur', 'keydown', 'keypress', 'paste'];
    		this.eventsToBind.each(function(evt){
    		    this[evt + 'Event'] = this._onMask.bindWithEvent(this, this['_' + evt]);
    			this.element.addEvent(evt , this[evt+'Event']);
    		}, this);
        }
    },
    
	_onMask: function(e, func){
		var o = {};
		if(this.element.get('readonly')) return true;
		o.range = this.element.getSelectedRange();
		o.isSelection = (o.range.start != o.range.end);
		// 8=backspace && 46=delete && 127==iphone's delete (i mean backspace)
		o.isDelKey = (e.code == 46);
		o.isBksKey = (e.code == 8 || (Browser.Platform.ipod && e.code == 127));
		o.isRemoveKey = (o.isBksKey || o.isDelKey);
		return func.call(this, e, o);
	},
    
    _keydown: function(e, o){
		this.ignore = this.globals.ignoreKeys.contains(e.code);
		if(this.ignore){
    		//var rep = this.globals.keyRep[e.code];
			// no more representation of the keys yet... (since this is not so used or usefull you know..., im thinking about that)
			this.mask.fireEvent('valid', [this.element, e.code]);
    	}
		return (Browser.Platform.ipod
			|| (this.globals.onlyKeyDownRepeat && o.isRemoveKey)
			)? this._keypress(e, o): true;
    },
    
    /*_keyup: function(e, o){
    	//9=TAB_KEY
    	//this is a little bug, when you go to an input with tab key
    	//it would remove the range selected by default, and that's not a desired behavior
    	//if(e.code == 9 && (Browser.Engine.webkit || Browser.Engine.trident)) return true;
    	//return this._paste(e, o);
		return true;
    },*/
    
	testEntry: function(index, _char){
		var maskArray = this.mask.options.maskArray;
		var rule = this.globals.rules[maskArray[index]];
		if(rule.check)
			return (rule && rule.regex.test(_char) && rule.check(this.element.get('value'), index, _char));
		else
			return (rule && rule.regex.test(_char));
	},

    testEvents: function(i, c, code, isRemoveKey){
    	var maskArray = this.mask.options.maskArray;
		var rule = this.globals.rules[maskArray[i]];
		if(!isRemoveKey){
			if(!rule){
	    		//console.log('overflow');
				this.mask.fireEvent('overflow', [this.element, code, c]);
	    		return false;
	    	}
	    	else if(!this.testEntry(i, c)){
				//console.log('invalid');
	    		this.mask.fireEvent('invalid', [this.element, code, c]);
	    		return false;
	    	}
		}
    	//console.log('valid');
		this.mask.fireEvent('valid', [this.element, code, c]);
		return true;
    }

    /*
    __mask: function(valueArray){
        return valueArray.join('');
    }
    */
});

Meio.MaskType.fixed = new Class({
    
    Extends: Meio.MaskType,
    
    options: {
        placeHolder: '_',
		removeIfInvalid: false // removes the value onblur if the input is not valid
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
				if(!this.testEntry(eli, elementValueArray[eli])){
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
		
		if(this.mask.options.removeIfInvalid){
			if(elementValue.contains(this.options.placeHolder)){
				// remove if invalid option
				this.maskMoldArray = this.maskMold.split('');
				this.element.set('value', '');
			}
			return true;
		} 
		
		if(elementValue == this.maskMold){
			// if no char inputed
			this.element.set('value', '');
		}
		else{
			// removes incorrect chars at the end of the string
			while(i >= 0){
				cont = false;
				while(!this.globals.matchRules.contains(elementValue.charAt(i)) && elementValue.charAt(i) != this.options.placeHolder){
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
			
				while(auxi <= this.validIndexes.length && i_1 && this.testEntry(i, this.maskMoldArray[i_1])){
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

				while(auxi < this.validIndexes.length && this.testEntry(i, queue[0])){
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
				if(!this.testEntry(i_delta, this.maskMoldArray[i])){
					canMove = false;
					break;
				}
				auxi++;
			}
			
			if(canMove){
				auxi = end;
				while((i = this.validIndexes[auxi])){
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
Meio.MaskType.infinite = new Class({
    
    Extends : Meio.MaskType,
    
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
Meio.MaskType.reverse = new Class({
    
    Extends: Meio.MaskType,
    
    options: {
		alignText: true,
		decimal: true
    },
    
    initialize: function(mask){
        this.parent(mask);
        if(mask){
			$extend(this.mask.options, this.options);
			this.mask.options.maskArray.reverse();
			if(this.mask.options.alignText) this.element.setStyle('text-align', 'right');
            //if(this.$el.get('value') == '') this.$el.set('value', .mask(this.mask.options));
        }
    },
    
    _paste: function(e,o){
    	this.$el.set('value', this.__mask(o.valueArray , this.globals , this.mask.options));
    	return true;
    },
    
    _keypress: function(e,o){

    	if(this.ignore || e.control || e.meta || e.alt) return true;

    	var c = String.fromCharCode(e.code),
    		rangeStart = o.range.start,
    		rawValue = o.value,
    		opt = this.mask.options,
    		maskArray = opt.maskArray,
		 	// the input value from the range start to the value start
		    valueStart = rawValue.substr(0, rangeStart),
			// the input value from the range end to the value end
			valueEnd = rawValue.substr(o.range.end, rawValue.length);

		rawValue = (valueStart + c + valueEnd);
		
    	var valueArray = rawValue.replace(opt.fixedCharsRegG, '').split(''),
    		// searches for fixed chars begining from the range start position, till it finds a non fixed
    		extraPos = maskArray.__extraPositionsTill(rangeStart, opt.fixedCharsReg);

    	o.rsEp = rangeStart + extraPos;
    	if(!this.testEvents(maskArray, o.rsEp, c, e.code)) return false;
    	this.$el.set('value', this.__mask(valueArray, this.globals, opt));

    	//fix for ie
    	//this bug was pointed by Pedro Martins
    	//it fixes a strange behavior that ie was having after a char was inputted in a text input that
    	//had its content selected by any range 
    	if(Browser.Engine.trident && ((rangeStart==0 && o.range.end==0) || rangeStart != o.range.end))
    		this.$el.setRange(o.value.length);

    	return false;
    },
    
    __mask: function(valueArray, globals, o, extraPos){
        valueArray.reverse();
        var newValue = valueArray.__mask(globals, o).reverse();
		return newValue.join('').substring(newValue.length - o.maskArray.length);
    }
    
});
Meio.MaskType.regexp = new Class({
    
    Extends : Meio.MaskType,
    
    initialize : function(mask){
        this.parent(mask);
        this.regExp = new RegExp(this.mask.options.mask);
    },
    
    _keyup : function(e,o){
    	return true;
    },
    
    _paste : function(e,o){
        //for(var i=0 , newValue=''; i < o.value.length; i++) if( this.regExp.test( o.value.charAt(i) ) )
             //newValue += o.value.charAt(i);
        this.$el.set('value', this.regExp.test(o.value) ? o.value : '' );
    	return true;
    },
    
    _keypress: function(e,o){
    	if( this.ignore || e.control || e.meta || e.alt ) return true;
    	var c = String.fromCharCode(e.code),
    		rawValue = o.value,
		 	// the input value from the range start to the value start
		    valueStart = rawValue.substr(0,o.range.start),
			// the input value from the range end to the value end
			valueEnd = rawValue.substr(o.range.end,rawValue.length);
        rawValue = (valueStart+c+valueEnd);
        // its a little hard to detect the overflow :s
        if( this.regExp.test( rawValue ) ){
            this.mask.fireEvent('valid',[this.$el,c,e.code]);
            return true;
        }
        else{
            this.mask.fireEvent('invalid',[this.$el,c,e.code]);
            return false;
        }
    }

});
// all these functions were totaly designed to be used internaly with the plugin.
// you wont want to use them with your arrays
/*
Array.implement({

	// gets the array representing an unmasked string and masks it depending on the type of the mask
	__mask: function(globals, o, extraPos){
		this.__removeInvalidChars(o.maskNonFixedChars, globals.rules);
		//if(o.defaultValue) this.__applyDefaultValue(o.defaultValue);
		this.__applyMask(o.maskArray, o.fixedCharsReg, extraPos);
		return this;
	},
	
	// gets the array representing an unmasked string and masks it depending on the type of the mask
	__mask2: function(globals, opt, extraPos, o){
		this.__removeInvalidChars(opt.maskNonFixedChars, globals.rules);
		//if(o.defaultValue) this.__applyDefaultValue(o.defaultValue);
		this.__applyMask2(opt.maskArray, opt.fixedCharsReg, extraPos, o);
		return this;
	},


	// applyes the default value to the result string
	__applyDefaultValue: function(defaultValue){
		var defLen = defaultValue.length, thisLen = this.length, i;
		//removes the leading chars
		for(i = thisLen-1; i >= 0; i--){
			if(this[i] == defaultValue.charAt(0)) this.pop();
			else break;
		}
		// apply the default value
		for(i = 0; i < defLen; i++) if(!this[i])
			this[i] = defaultValue.charAt(i);
		
		return this;
	},

	// Removes values that doesnt match the mask from the valueArray
	// Returns the array without the invalid chars.
	__removeInvalidChars: function(maskNonFixedChars, rules){
		// removes invalid chars
		for(var i=0; i<this.length; i++){
			if( maskNonFixedChars.charAt(i)
				&& rules[maskNonFixedChars.charAt(i)]
				&& !rules[maskNonFixedChars.charAt(i)].test(this[i]) ){
					this.splice(i, 1);
					i--;
			}
		}
		return this;
	},

	// Apply the current input mask to the valueArray and returns it. 
	__applyMask: function(maskArray, fixedCharsReg, plus){
		plus = $pick(plus, 0);
		// apply the current mask to the array of chars
		for(var i = 0; i < this.length+plus; i++){
			if( maskArray[i] && fixedCharsReg.test(maskArray[i]) )
				this.splice(i, 0, maskArray[i]);
		}
		return this;
	},
	
	// Apply the current input mask to the valueArray and returns it. 
	__applyMask2: function(maskArray, fixedCharsReg, plus, o){
		plus = $pick(plus, 0);
		// apply the current mask to the array of chars
		for(var i = 0; i < this.length+plus; i++){
			if( maskArray[i] && fixedCharsReg.test(maskArray[i]) ){
				if(i >= o.range.start+plus){
					this.splice(i+1, 0, maskArray[i]);
				}
				else{
					this.splice(i, 0, maskArray[i]);
				}
			}
		}
		return this;
	},
	
	// searches for fixed chars begining from the range start position, till it finds a non fixed
   	__extraPositionsTill: function(rangeStart, fixedCharsReg){
   		var extraPos = 0;
   		while( fixedCharsReg.test(this[rangeStart]) ){
   			rangeStart++;
   			extraPos++;
   		}
   		return extraPos;
   	}

});
*/



/*
// all these functions were totaly designed to be used internaly with the plugin.
// you wont want to use them with your arrays
Array.implement({

	// gets the array representing an unmasked string and masks it depending on the type of the mask
	__mask: function(globals, o, delta){
		//this.__removeInvalidChars(o.maskNonFixedChars, globals.rules);
		//console.log(this);
		//if(o.defaultValue) this.__applyDefaultValue(o.defaultValue);
		this.__applyMask(o.maskArray, o.fixedCharsReg, delta, globals.rules);
		//console.log(this);
		return this;
	},

	// applyes the default value to the result string
	__applyDefaultValue: function(defaultValue){
		var defLen = defaultValue.length, thisLen = this.length, i;
		//removes the leading chars
		for(i=thisLen-1; i>=0; i--){
			if(this[i]==defaultValue.charAt(0)) this.pop();
			else break;
		}
		// apply the default value
		for(i=0; i<defLen; i++) if(!this[i])
			this[i] = defaultValue.charAt(i);
		return this;
	},

	// Removes values that doesnt match the mask from the valueArray
	// Returns the array without the invalid chars.
	__removeInvalidChars: function(maskNonFixedChars, rules){
		// removes invalid chars
		for(var i=0; i<this.length; i++){
			if( maskNonFixedChars.charAt(i)
				&& rules[maskNonFixedChars.charAt(i)]
				&& !rules[maskNonFixedChars.charAt(i)].test(this[i]) ){
					this.splice(i, 1);
					i--;
			}
		}
		return this;
	},

	// Apply the current input mask to the valueArray and returns it. 
	__applyMask: function(maskArray, fixedCharsReg, plus, rules){
		plus = $pick(plus, 0);
		//console.log(this);
		// apply the current mask to the array of chars
		for(var i=0; i<this.length+plus; i++){
			if( maskArray[i] && fixedCharsReg.test(maskArray[i]) )
				this.splice(i, 0, maskArray[i]);
		}
		for(var i=0; i<this.length+plus; i++){
			if( !(maskArray[i] && rules[maskArray[i]] && rules[maskArray[i]].test(this[i])) ){
				this.splice(i, 1);//[] = maskArray[i];
			}
		}
		return this;
	},
	
	// searches for fixed chars begining from the range start position, till it finds a non fixed
   	__extraPositionsTill: function(rangeStart, fixedCharsReg){
   		var extraPos = 0;
   		while(fixedCharsReg.test(this[rangeStart])){
   			rangeStart++;
   			extraPos++;
   		}
   		return extraPos;
   	}

});
*/Element.implement({
	
	// deprecated
	/*unmaskedVal: function(){
		return this.get('value').replace(Meio.MaskGlobals.init().fixedCharsRegG, '');
	},*/
	
	meiomask: function(options){
        return this.set('meiomask', options);
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

// sets mask to this input and returns this input
Element.Properties.meiomask = {
	set: function(options){
		options = $pick(options, {});
		var mask = this.retrieve('meiomask');
		return this.store('meiomask', mask? mask.change(options): new Meio.Mask(this, options));
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
Element.Properties.maxlength = {
	set: function(value){
		this.setAttribute('maxLength', value);
		return this;
	},
	get: function(){
		var ml = this.getAttribute('maxLength', 2);
		return (ml == 2147483647)? null: ml;
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
*/String.implement({
	mask : function(options){
		var globals = Meio.MaskGlobals.get(), o = {};

		switch($type(options)){
			case 'string':
				if(globals.masks[options]) $extend(o, globals.masks[options]);
				else o.mask = options;
				break;
			case 'object':
				$extend(o, options);
		}
		//insert signal if any
		/*if((o.type=='reverse') && o.defaultValue){
			var signals = globals.signals;
			if(typeof signals[o.defaultValue.charAt(0)] != 'undefined'){
				var maybeASignal = this.charAt(0);
				o.signal = options.signal = signals[maybeASignal]? signals[maybeASignal]: signals[o.defaultValue.charAt(0)];
				o.defaultValue = options.defaultValue = o.defaultValue.substring(1);
			}
		}*/
		//if(!o.fixedChars) o.fixedChars = Meio.Mask.options.fixedChars;
		//o.fixedCharsReg = new RegExp(o.fixedChars);
		//o.fixedCharsRegG = new RegExp(o.fixedChars, 'g');

		if(!o.type) o.type = 'fixed';
		var maskType = new Meio.MaskType[o.type]();

		//o.maskNonFixedChars = o.mask.replace(o.fixedCharsRegG, '');
		//o.maskArray = o.mask.split('');
		return maskType.maskString(this);//maskType.__mask(this.split(''), globals, o);
	}
});