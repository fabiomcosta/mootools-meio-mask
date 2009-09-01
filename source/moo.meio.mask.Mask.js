	Meio.Mask = new Class({

		Implements: [Options, Events],

		options: {
			storageKey: 'meiomask',
			attr: 'data-meiomask',
			mask: null,
			type: 'fixed'
			
			//ALL MASKS OPTIONS
			//selectOnFocus: true,
			//autoTab: false
			//onInvalid: $empty,
			//onValid: $empty,
			//onOverflow: $empty
			
			//FIXED MASK OPTIONS
			//placeHolder: false,
			//removeIfInvalid: false
			//setSize: false,
			
			//REVERSE MASK OPTIONS
			//signal: false
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
			// be carefull, your JSON should be always a valid one.
			// Ex: data-meiomask='{"mask":"999:999"}' works (its the ONLY accepted format)
			// data-meiomask="{'mask':'999:999'}" doesnt work
			// data-meiomask='{mask:"999:999"}' doesnt work
			// data-meiomask="other way", doesnt work!
			if(JSON) this.setOptions(JSON.decode(tmpMask, true));
		
			// merge options cause it will allways overwrite everything
			if($type(options) == 'object') this.setOptions(options);

			if(this.options.mask){
				if(this.element.retrieve(this.options.storageKey)) this.remove();
				var elementValue = this.element.get('value');
				if(elementValue !== ''){
					var elValue = elementValue.meiomask(this.options);
					this.element.set('value', elValue).defaultValue = elValue;
				}
				this.element.store(this.options.storageKey, this);
				this.maskType = new Meio.MaskType[this.options.type](this, this.options);
				this.element.erase('maxlength');
			}
			return this;
		},
		
		remove: function(){
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