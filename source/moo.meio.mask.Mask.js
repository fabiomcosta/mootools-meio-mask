meio.Mask = new Class({

	Implements : [Options,Events],

	// default settings for the plugin
	options : {
		//all masks option
		attr : 'alt', // an attr to look for the mask name or the mask itself
		mask : null, // the mask to be used on the input
		type : 'fixed' // the mask of this mask
		
		//onInvalid : $empty,
		//onValid : $empty,
		//onOverflow : $empty //doesnt work yet at regexp mask
		
		//fixed mask options
		//placeHolder : false, // can be a char. ex : '_'. This char CAN'T be a fixedChar.
		
		//reverse mask
		//defaultValue : '', // the default value for this input
		//signal : false	// this should not be set, to use signal at masks put the signal you want ('-' or '+') at the default value of this mask.
						// See the defined masks for a better understanding.
	},

	initialize : function(el,options){

		this.$el = $(el);
		// verify if the el is a text input element, if its not the case this class doenst work for it 
		if( this.$el.get('tag')!='input' || this.$el.get('type')!='text' ) return;

		this.globals = meio.MaskGlobals.init();
		
		//apply the mask
		this.change(options);
	
	},

	change : function(options){
		options = $pick(options, {});
		
		// see whats the attr that we have to look
		if( options.attr ) this.options.attr = options.attr;
		
		var attrValue = this.$el.get(this.options.attr),
			tmpMask;
	
		// then we look for the 'attr' option
		tmpMask = ( $type(options) == 'string' ) ? options : (attrValue) ? attrValue : null;
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
		if( JSON ) this.setOptions( JSON.decode(tmpMask,true) );
		
		// merge options cause it will allways overwrite everything
		if( $type(options) == 'object' ) this.setOptions(options);
		
		if( this.options.mask ){
			
			// if theres a mask stored at this element, remove it
			if(this.$el.retrieve('mask')) this.remove();
			
			var mlStr = 'maxLength',
				mlValue = this.$el.get(mlStr);

			this.setOptions({
				maxlength : mlValue,
				maskArray : this.options.mask.split(''),
				maskNonFixedChars : this.options.mask.replace(this.globals.fixedCharsRegG,'')
			});
	
			// apply mask to the current value of the input
			if(this.$el.get('value')!='') this.$el.set('value', this.$el.get('value').mask(this.options) );
			
			this.$el.store('mask',this)
			    // removes the maxlength attribute (it will be set again if you use the unsetMask method)
			    .erase(mlStr);
			
			this.maskType = new meio.MaskType[this.options.type](this);
			
		}
		return this;
		
	},
	
	// removes the mask
	remove : function(){
		var mask = this.$el.retrieve('mask');
		if(mask){
			var maxLength = mask.options.maxlength;
			if(maxLength != -1) this.$el.set('maxLength',maxLength);
			
			mask.maskType.eventsToBind.each(function(evt){
				this.$el.removeEvent(evt,this[evt+'Event']);
			}.bind(mask.maskType));
		}
		return this;
	}
    
});