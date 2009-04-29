// this is the class that will contain all the 
meio.MaskGlobals = new Hash({

	init : function(){
		
		if(!this.inited){
			var self = this,i,
				keyRep = ( Browser.Platform.ipod ) ? this.iphoneKeyRepresentation : this.keyRepresentation;
			
			this.setFixedChars(this.fixedChars);
			
			// constructs number rules
			for(i=0; i<=9; i++) this.rules[i] = new RegExp('[0-'+i+']');
	
			this.keyRep = keyRep;
			this.ignoreKeys = [];
			// ignore keys array creation for iphone or the normal ones
			Hash.each(keyRep, function(val,key){
				self.ignoreKeys.push( key.toInt() );
			});
			this.inited = true;
		}
		return this;
		
	},
	
	reInit : function(){
		this.inited = false;
		return this.init();
	},
	
	// use this function to change the fixedChars after initialiazing any mask.
	// Be aware that it will change for all masks, since they have a pointer to this object (not a copy)
	setFixedChars : function(fixedChars){
		this.fixedCharsReg = new RegExp(this.fixedChars);
		this.fixedCharsRegG = new RegExp(this.fixedChars,'g');
		return this;
	},
	
	// the mask rules. You may add yours!
	// number rules will be overwritten
	rules : {
		'z': /[a-z]/,
		'Z': /[A-Z]/,
		'a': /[a-zA-Z]/,
		'*': /[0-9a-zA-Z]/,
		'@': /[0-9a-zA-ZçÇáàãéèíìóòõúùü]/
	},
	
	// fixed chars to be used on the masks. You may change it for your needs!
	fixedChars : '[(),.:/ -]',
	
	// these keys will be ignored by the mask.
	// all these numbers where obtained on the keydown event
	keyRepresentation : {
		8	: 'backspace',
		9	: 'tab',
		13	: 'enter',
		16	: 'shift',
		17	: 'control',
		18	: 'alt',
		27	: 'esc',
		33	: 'page up',
		34	: 'page down',
		35	: 'end',
		36	: 'home',
		37	: 'left',
		38	: 'up',
		39	: 'right',
		40	: 'down',
		45	: 'insert',
		46	: 'delete',
		116	: 'f5',
		224	: 'command'
	},

	iphoneKeyRepresentation : {
		10	: 'go',
		127	: 'delete'
	},

	signals : {
		'+' : '',
		'-' : '-'
	},

	// masks. You may add yours!
	// Ex: $.fn.setMask.masks.msk = {mask: '999'}
	// and then if the 'attr' options value is 'alt', your input should look like:
	// <input type="text" name="some_name" id="some_name" alt="msk" />
	masks : {
		'phone'				: { mask : '(99) 9999-9999' },
		'phone-us'			: { mask : '(999) 999-9999' },
		'cpf'				: { mask : '999.999.999-99' }, // cadastro nacional de pessoa fisica
		'cnpj'				: { mask : '99.999.999/9999-99' },
		'date'				: { mask : '39/19/9999' }, //uk date
		'date-us'			: { mask : '19/39/9999' },
		'cep'				: { mask : '99999-999' },
		'time'				: { mask : '29:59' },
		'cc'				: { mask : '9999 9999 9999 9999' }, //credit card mask
		'integer'			: { mask : '999.999.999.999', type : 'reverse' },
		'decimal'			: { mask : '99,999.999.999.999', type : 'reverse', defaultValue : '000' },
		'decimal-us'		: { mask : '99.999,999,999,999', type : 'reverse', defaultValue : '000' },
		'signed-decimal'	: { mask : '99,999.999.999.999', type : 'reverse', defaultValue : '+000' },
		'signed-decimal-us' : { mask : '99,999.999.999.999', type : 'reverse', defaultValue : '+000' }
	}

});
