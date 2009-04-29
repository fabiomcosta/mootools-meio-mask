Element.Properties.mask = {
	// sets mask to this input and returns this input
	set : function(options){
		options = $pick(options,{});
		var mask = this.retrieve('mask');
		return this.store('mask' , mask ? mask.change(options) : new meio.Mask(this,options) );
	},
	// sets the mask and return the mask object
	get : function(options){
		this.set('mask',options);
		return this.retrieve('mask');
	},
	// removes the mask from this input but maintain the mask object stored at its hash (it will be removed at window.unload anyway)
	erase : function(){
		var mask = this.retrieve('mask');
		if(mask) mask.remove();
		return this;
	}
	
};
