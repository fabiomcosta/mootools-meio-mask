meio.Mask = new Class({

	Implements : [Options,Events],

	options : {
		attr : 'alt',
		mask : null,
		type : 'fixed',
		fixedChars: '[(),.:/ -]',
		//onInvalid : $empty,
		//onValid : $empty,
		//onOverflow : $empty
		//placeHolder : false,
		//defaultValue : '',
		//signal : false
	},

	initialize : function(el,options){
		this.$el = $(el);
		if(this.$el.get('tag') != 'input' || this.$el.get('type') != 'text') return;
		this.globals = meio.MaskGlobals.init();
		this.change(options);
	},

	change : function(options){
		options = $pick(options, {});

		// see whats the attr that we have to look
		if(options.attr) this.options.attr = options.attr;
		var attrValue = this.$el.get(this.options.attr),
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
		
		if( this.options.mask ){
			if(this.$el.retrieve('mask')) this.remove();
			var mlStr = 'maxLength',
				mlValue = this.$el.get(mlStr);
				
			this.setOptions({
				maxlength : mlValue,
				maskArray : this.options.mask.split(''),
				maskNonFixedChars : this.options.mask.replace(this.globals.fixedCharsRegG, '')
			});
			if(this.$el.get('value') != '')
				this.$el.set('value', this.$el.get('value').mask(this.options));
			
			this.$el.store('mask', this).erase(mlStr);
			this.maskType = new meio.MaskType[this.options.type](this);
		}
		return this;
	},
	
	// removes the mask
	remove : function(){
		var mask = this.$el.retrieve('mask');
		if(mask){
			var maxLength = mask.options.maxlength;
			if(maxLength != -1) this.$el.set('maxLength', maxLength);
			mask.maskType.eventsToBind.each(function(evt){
				this.$el.removeEvent(evt, this[evt + 'Event']);
			}.bind(mask.maskType));
		}
		return this;
	}
    
});