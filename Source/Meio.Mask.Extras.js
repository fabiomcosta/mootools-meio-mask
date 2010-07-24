/*
---

description: Extra functionality for Meio.Mask plugin. Like String.meiomask that masks a string and Element.meiomask which is a convinience method for setting the masks.

authors:
 - Fábio Miranda Costa

requires:
 - Meio.Mask

license: MIT-style license

provides: [Meio.Mask.Extras]

...
*/

(function(){

	var meiomask = 'meiomask', dummyInput = new Element('input', {'type': 'text'});
	
	var upperCamelize = function(str){
		return str.camelCase().capitalize();
	};
	
	var getClassOptions = function(a1, a2, opts){
		var klass, opt;
		if ($type(a1) == 'string'){
			if ($type(a2) != 'string'){
				opts = a2;
				a1 = a1.split('.');
				a2 = a1[1];
				a1 = a1[0];
			}
			klass = Meio.Mask[upperCamelize(a1)][upperCamelize(a2)];
		} else {
			klass = a1;
		}
		return {klass: klass, options: opts || {}};
	};
	
	var executeFunction = function(functionName, args){
		var co = getClassOptions(args);
		dummyInput.set('value', '');
		return new co.klass(dummyInput, co.options)[functionName](this);
	};

	String.implement({
		meiomask: function(){
			return executeFunction.call(this, 'mask', arguments);
		},
		meiounmask: function(){
			return executeFunction.call(this, 'unmask', arguments);
		}
	});

	Element.Properties.meiomask = {
		set: function(){
			var args = getClassOptions(arguments);
			return this.store(meiomask, new args.klass(this, args.options));
		},
		// returns the mask object
		get: function(){
			return this.retrieve(meiomask);
		},
		// removes the mask from this input but maintain the mask object stored at its table
		erase: function(){
			var mask = this.retrieve(meiomask);
			if (mask) mask.remove();
			return this;
		}
	};
	
	Element.Properties[meiomask + ':value'] = {
		// sets the value but first it applyes the mask (if theres any)
		set: function(value){
			var mask = this.retrieve(meiomask);
			if (mask) value = mask.mask(value);
			return this.set('value', value);
		},
		
		// gets the unmasked value
		get: function(){
			var mask = this.retrieve(meiomask);
			var value = this.get('value');
			return (mask) ? mask.unmask(value) : value;
		}
	};

	// fix for maxlength property
	var maxLength = document.createElement('input').getAttribute('maxLength');
	if (maxLength != null) Element.Properties.maxlength = Element.Properties.maxLength = {
		get: function(){
			var maxlength = this.getAttribute('maxLength');
			return maxlength == maxLength ? null : maxlength;
		}
	};
	
	Element.implement({
		meiomask: function(mask, type, options){
			return this.set(meiomask, mask, type, options);
		}
	});

})();
