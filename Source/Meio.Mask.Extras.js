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

	Meio.Mask.dummyInput = new Element('input', {'type': 'text'});
	
	var upperCamelize = function(str){
		return str.camelCase().capitalize();
	};
	
	var getClassOptions = function(args){
		var classNames = [];
		args = Array.link(args, {mask: String.type, type: String.type, options: Object.type, klass: Class.type});
		if (args.mask) classNames = args.mask.split('.');
		var klass = args.klass || (classNames[1] ? Meio.Mask[upperCamelize(classNames[0])][upperCamelize(classNames[1])] : Meio.Mask[upperCamelize(classNames[0])]),
		    options = args.options || {};
		return {klass: klass, options: options};
	};
	
	var executeFunction = function(functionName, args){
		var co = getClassOptions(args);
		Meio.Mask.dummyInput.set('value', '');
		return new co.klass(Meio.Mask.dummyInput, co.options)[functionName](this);
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
			return this.store('meiomask', new args.klass(this, args.options));
		},
		// returns the mask object
		get: function(){
			return this.retrieve('meiomask');
		},
		// removes the mask from this input but maintain the mask object stored at its table
		erase: function(){
			var mask = this.retrieve('meiomask');
			if (mask) mask.remove();
			return this;
		}
	};
	
	Element.Properties['meiomask:value'] = {
		// sets the value but first it applyes the mask (if theres any)
		set: function(value){
			var mask = this.retrieve('meiomask');
			if (mask) value = mask.mask(value);
			return this.set('value', value);
		},
		
		// gets the unmasked value
		get: function(){
			var mask = this.retrieve('meiomask');
			var value = this.get('value');
			return (mask) ? mask.unmask(value) : value;
		}
	};

	// fix for maxlength property
	Element.Properties.maxLength = Element.Properties.maxlength = {
		set: function(value){
			this.setAttribute('maxLength', value);
			return this;
		},
		get: function(){
			var ml = this.getAttribute('maxLength', 2);
			return (ml === 2147483647) ? null : ml;
		},
		erase: function(){
			this.removeAttribute('maxLength');
			return this;
		}
	};
	
	Element.implement({
		meiomask: function(mask, type, options){
			return this.set('meiomask', mask, type, options);
		}
	});

})();
