
	Meio.Mask.extend({

		/*reset: function(){
			this.inited = false;
			return this.get();
		},*/
	    
	    matchRules: '',
	    
	    rulesRegex: new RegExp(''),
		
		rules: {},
		
		setRule: function(ruleKey, properties){
			this.setRules({ruleKey: properties});
		},
	
		setRules: function(rulesObj){
		    var rulesKeys = [];
			for(rule in rulesObj) rulesKeys.push(rule);
    		this.matchRules += rulesKeys.join('');
    		this.rulesRegex = new RegExp('[' + this.matchRules.escapeRegExp() + ']', 'g');
    		$extend(this.rules, rulesObj);
		},
	
		removeRule: function(rule){
			delete this.rules[rule];
			this.matchRules = this.matchRules.replace(rule, '');
			this.rulesRegex.compile('[' + this.matchRules.escapeRegExp() + ']', 'g');
		},
	
		removeRules: function(){
			var rulesToRemove = Array.flatten(arguments);
			for(var i=rulesToRemove.length; i--;) this.removeRule(rulesToRemove[i]);
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
		},
		
		// http://unixpapa.com/js/key.html
		// if only the keydown auto-repeats
		// if you have a better implementation of this detection tell me
		onlyKeyDownRepeat: (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version >= 525))
		
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
            ignoreKeys: (Browser.Platform.ipod)? iphoneIgnoreKeys: desktopIgnoreKeys
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
		//create the fixedChars regular expression
		//create a regex to match chars from the rules
		//for(i in this.rules) rulesKeys.push(i);
		//this.matchRules = rulesKeys.join('');
		//this.rulesRegex = new RegExp('[' + this.matchRules.escapeRegExp() + ']', 'g');
		//return ;
		//this.inited = true;
    })());
    
    