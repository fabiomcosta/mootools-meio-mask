
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
	
	setRule: function(ruleKey, regex){
		// you cant set a rule with key bigger than 1
		if(ruleKey.length > 1) return;
		this.rules[ruleKey] = regex;
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
		'@': {regex: /[0-9a-zA-ZçÇáàãéèíìóòõúùü]/},
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
