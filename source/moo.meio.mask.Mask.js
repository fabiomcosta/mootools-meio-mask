	Meio.Mask = new Class({

		Implements: [Options, Events],

		options: {
			attr: 'data-meiomask',
			mask: null,

			selectOnFocus: true,
			autoTab: false
			//onInvalid: $empty,
			//onValid: $empty,
			//onOverflow: $empty
			
			//FIXED MASK OPTIONS
			//placeHolder: false,
			//removeIfInvalid: false
			//setSize: false,
			
			//REVERSE MASK OPTIONS
			//signal: false
		},

		initialize: function(el, options){
			this.element = $(el);
			if(this.element.get('tag') !== 'input' || this.element.get('type') !== 'text') return;
			this.change(options);
		},
        
        defineOptions: function(options){
            options = options || {};

			// see whats the attr that we have to look
			if(options.attr) this.options.attr = options.attr;
		
			var attrValue = this.element.get(this.options.attr),
				tmpMask;

			// then we look for the attr value
			tmpMask = ($type(options) === 'string')? options: (attrValue)? attrValue: null;
			if(tmpMask) this.options.mask = tmpMask;
		
			// then we see if it's a defined mask
			if(Meio.Mask.masks[this.options.mask])
				this.setOptions(Meio.Mask.masks[this.options.mask]);
		
			// apply the json options if any
			// be carefull, your JSON should be always a valid one.
			// Ex: data-meiomask='{"mask":"999:999"}' works (its the ONLY accepted format)
			// data-meiomask="{'mask':'999:999'}" doesnt work
			// data-meiomask='{mask:"999:999"}' doesnt work
			// data-meiomask="other way", doesnt work!
			if(JSON) this.setOptions(JSON.decode(tmpMask, true));
		
			// merge options cause it will allways overwrite everything
			if($type(options) === 'object') this.setOptions(options);
        },
        
		change: function(options){
			this.defineOptions(options);
			if(this.options.mask){
				if(this.element.retrieve('meiomask')) this.remove();
				var elementValue = this.element.get('value');
				if(elementValue !== ''){
					// if the value of the input is '' it will give an error since meiomask String function is not implemented correctly
					var elValue = elementValue.meiomask(this.options);
					this.element.set('value', elValue).defaultValue = elValue;
				}
				this.ignore = false;
				this.masklength = this.element.get('maxlength');
				this.maskArray = this.options.mask.split('');
	    		this.eventsToBind = ['focus', 'blur', 'keydown', 'keypress', 'paste'];
	    		this.eventsToBind.each(function(evt){
	    			this.element.addEvent(evt, this._onMask.bindWithEvent(this, this['_' + evt]));
	    		}, this);
				this.element.store('meiomask', this).erase('maxlength');
			}
			return this;
		},
		
		remove: function(){
			var mask = this.element.retrieve('mask');
			if(mask){
				var maxLength = mask.options.maxlength;
				if(maxLength !== -1) this.element.set('maxlength', maxLength);
				mask.maskType.eventsToBind.each(function(evt){
					this.element.removeEvent(evt, this[evt + 'Event']);
				}, mask.maskType);
			}
			return this;
		},
		
		_onMask: function(e, func){
			var o = {};
			if(this.element.get('readonly')) return true;
			o.range = this.element.getRange();
			o.isSelection = (o.range.start != o.range.end);
			// 8=backspace && 46=delete && 127==iphone's delete (i mean backspace)
			o.isDelKey = (e.code == 46);
			o.isBksKey = (e.code == 8 || (Browser.Platform.ipod && e.code == 127));
			o.isRemoveKey = (o.isBksKey || o.isDelKey);
			return func.call(this, e, o);
		},
    
	    _keydown: function(e, o){
			this.ignore = Meio.Mask.ignoreKeys.contains(e.code);
			if(this.ignore){
	    		// var rep = this.globals.keyRep[e.code];
				// no more representation of the keys yet... (since this is not so used or usefull you know..., im thinking about that)
				this.fireEvent('valid', [this.element, e.code]);
	    	}
			return (Browser.Platform.ipod
				|| (Meio.Mask.onlyKeyDownRepeat && o.isRemoveKey)
				)? this._keypress(e, o): true;
	    },
    
	    //_keyup: function(e, o){
	    	//9=TAB_KEY
	    	//this is a little bug, when you go to an input with tab key
	    	//it would remove the range selected by default, and that's not a desired behavior
	    	//if(e.code == 9 && (Browser.Engine.webkit || Browser.Engine.trident)) return true;
	    	//return this._paste(e, o);
		//	return true;
	    //},
    
		testEntry: function(index, _char){
			var maskArray = this.maskArray,
				rule = Meio.Mask.rules[maskArray[index]],
				ret = (rule && rule.regex.test(_char));
			return (rule.check)? (ret && rule.check(this.element.get('value'), index, _char)): ret;
		},

	    testEvents: function(i, c, code, isRemoveKey){
	    	var maskArray = this.maskArray;
			var rule = Meio.Mask.rules[maskArray[i]];
			if(!isRemoveKey){
				if(!rule){
		    		//console.log('overflow');
					this.fireEvent('overflow', [this.element, code, c]);
		    		return false;
		    	}
		    	else if(!this.testEntry(i, c)){
					//console.log('invalid');
		    		this.fireEvent('invalid', [this.element, code, c]);
		    		return false;
		    	}
			}
	    	//console.log('valid');
			this.fireEvent('valid', [this.element, code, c]);
			return true;
	    },
		
		setSize: function(){
			if(!this.element.get('size')) this.element.set('size', this.maskArray.length);
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
	
		masks: {
			'phone'				: { mask: '(99) 9999-9999)' },
			'phone-us'			: { mask: '(999) 999-9999' },
			'cpf'				: { mask: '999.999.999-99' },
			'cnpj'				: { mask: '99.999.999/9999-99' },
			'date'				: { mask: '39/19/9999' },
			'date-us'			: { mask: '19/39/9999' },
			'cep'				: { mask: '99999-999' },
			'time'				: { mask: '2h:59' },
			'cc'				: { mask: '9999 9999 9999 9999' },
			'integer'			: { mask: '999.999.999.999', type: 'reverse', decimal: false },
			'decimal'			: { mask: '999.999.999.999,99', type: 'reverse' },
			'decimal-us'		: { mask: '999,999,999,999.99', type: 'reverse' }
		}
		
	}).extend(function(){
        var desktopIgnoreKeys = [
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
    	iphoneIgnoreKeys = [
    		10		//: 'go',
    		//127: 'delete'
    	];
        
        return {
            ignoreKeys: (Browser.Platform.ipod)? iphoneIgnoreKeys: desktopIgnoreKeys,
            // http://unixpapa.com/js/key.html
    		// if only the keydown auto-repeats
    		// if you have a better implementation of this detection tell me
            onlyKeyDownRepeat: (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version >= 525))
        };
    }()).setRules((function(){
	    var rules = {
			'z': {regex: /[a-z]/},
			'Z': {regex: /[A-Z]/},
			'a': {regex: /[a-zA-Z]/},
			'*': {regex: /[0-9a-zA-Z]/},
			'@': {regex: /[0-9a-zA-ZçÇáàãâéèêíìóòõôúùü]/},
			//its included just to exemplify how to use it, its used on the time mask
			'h': {regex: /[0-9]/, check: function(value, index, _char){if(value.charAt(index-1) === '2') return (_char<=3); return true;}}
		};
		for(var i=0; i<=9; i++) rules[i] = {regex: new RegExp('[0-' + i + ']')};
		return rules;
    })());
    
