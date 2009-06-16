Element.Properties.meiomask = {
	// sets mask to this input and returns this input
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

/*
Element.Properties.value = {
	// sets the value but first it applyes the mask (if theres any)
	set: function(value){
		var mask = this.retrieve('meiomask');
		if(mask) value = mask.maskString(value);
		return this.set('value', value);
	}
};
*/