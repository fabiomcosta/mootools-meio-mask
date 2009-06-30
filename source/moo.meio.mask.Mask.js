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
    
});