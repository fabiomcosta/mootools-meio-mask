/*
---

name: Meio.Mask.Extras

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

	var meiomask = 'meiomask';

	var upperCamelize = function(str){
		return str.camelCase().capitalize();
	};

	var getClassOptions = function(a1, a2, opts){
		var klass;
		if (typeOf(a1) == 'string'){
			if (typeOf(a2) != 'string'){
				opts = a2;
				a1 = a1.split('.');
				a2 = a1[1];
				a1 = a1[0];
			}
			klass = Meio.Mask[upperCamelize(a1)];
			if (a2) klass = klass[upperCamelize(a2)];
		} else {
			klass = a1;
			opts = a2;
		}
		return {klass: klass, options: opts || {}};
	};

	var executeFunction = function(functionName, args){
		var co = getClassOptions.apply(null, args);
		return new co.klass(co.options)[functionName](this);
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
		set: function(args){
			args = getClassOptions.apply(null, args);
			var mask = this.retrieve(meiomask);
			if (mask){
				mask.unlink();
				mask = null;
			}
			return this.store(meiomask, new args.klass(args.options).link(this));
		},
		// returns the mask object
		get: function(){
			return this.retrieve(meiomask);
		},
		// removes completely the mask from this input
		erase: function(){
			var mask = this.retrieve(meiomask);
			if (mask) mask.unlink();
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

	Element.implement({
		meiomask: function(mask, type, options){
			return this.set(meiomask, [mask, type, options]);
		}
	});

})();
