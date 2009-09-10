	// sets mask to this input and returns this input
	Element.Properties.meiomask = {
		set: function(mask, type, options){
			mask = mask.capitalize();
			options = $pick(options, type, {});
			type = ($type(type) === 'string')? type.capitalize(): 'Fixed';
			return this.store('meiomask', new Meio.Mask[type][mask](this, options));
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