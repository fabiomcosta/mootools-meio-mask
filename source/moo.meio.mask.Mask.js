Meio.Mask = new Class({

	Implements : [Options,Events],

	options : {
		attr : 'alt',
		mask : null,
		type : 'fixed',
		fixedChars: '[(),.:/ -]',
		
		selectOnFocus: true,
		autoTab: true
		
		//onInvalid : $empty,
		//onValid : $empty,
		//onOverflow : $empty
		//placeHolder : false,
		//defaultValue : '',
		//signal : false
	},

	initialize : function(el,options){
		this.element = $(el);
		if(this.element.get('tag') != 'input' || this.element.get('type') != 'text') return;
		this.globals = Meio.MaskGlobals.init();
		this.change(options);
	},

	change : function(options){
		options = $pick(options, {});

		// see whats the attr that we have to look
		if(options.attr) this.options.attr = options.attr;
		
		var attrValue = this.element.get(this.options.attr),
			tmpMask;

		// then we look for the 'attr' option
		tmpMask = ($type(options) == 'string')? options: (attrValue)? attrValue: null;
		if(tmpMask) this.options.mask = tmpMask;
		
		// then we see if it's a defined mask
		if(this.globals.masks[this.options.mask])
			this.setOptions(this.globals.masks[this.options.mask]);
		
		if(JSON) this.setOptions( JSON.decode(tmpMask, true) );
		
		// merge options cause it will allways overwrite everything
		if($type(options) == 'object') this.setOptions(options);
		
		if(this.options.mask){
			
			if(this.element.retrieve('mask')) this.remove();
			var mlValue = this.element.get('maxLength'),
				fixedCharsRegG = new RegExp(this.options.fixedChars, 'g');
				
			this.setOptions({
				fixedCharsReg: new RegExp(this.options.fixedChars),
				fixedCharsRegG: fixedCharsRegG,
				maxlength : mlValue,
				maskArray : this.options.mask.split(''),
				maskNonFixedChars : this.options.mask.replace(fixedCharsRegG, '')
			});
			
			if(this.element.get('value') != '')
				this.element.set('value', this.element.get('value').mask(this.options));
			
			this.element.store('mask', this).erase('maxLength');
			this.maskType = new Meio.MaskType[this.options.type](this);
		}
		return this;
	},
	
	// removes the mask
	remove : function(){
		var mask = this.element.retrieve('mask');
		if(mask){
			var maxLength = mask.options.maxlength;
			if(maxLength != -1) this.element.set('maxLength', maxLength);
			mask.maskType.eventsToBind.each(function(evt){
				this.element.removeEvent(evt, this[evt + 'Event']);
			}, mask.maskType);
		}
		return this;
	}
    
});