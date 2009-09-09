	Meio.MaskType = new Class({

    	Implements: [Options, Events],

		options: {
			selectOnFocus: true,
			autoTab: false
			//onInvalid: $empty,
			//onValid: $empty,
			//onOverflow: $empty
		},

	    initialize: function(mask, options){
	        this.ignore = false;
	        this.setOptions(options);
			if(mask){
	            this.mask = mask;
	            //this.globals = mask.globals;
	            this.element = mask.element;
				this.masklength = this.element.get('maxlength');
				this.maskArray = this.options.mask.split('');
	    		this.eventsToBind = ['focus', 'blur', 'keydown', 'keypress', 'paste'];
	    		this.eventsToBind.each(function(evt){
	    		    this[evt + 'Event'] = this._onMask.bindWithEvent(this, this['_' + evt]);
	    			this.element.addEvent(evt, this[evt+'Event']);
	    		}, this);
	        }
	    },
    
		_onMask: function(e, func){
			var o = {};
			if(this.element.get('readonly')) return true;
			o.range = this.element.getRange();
			o.isSelection = (o.range.start != o.range.end);
			// 8=backspace && 46=delete && 127==iphone's delete (i mean backspace)
			o.isDelKey = (e.code == 46);
			o.isBksKey = (e.code == 8 || (Browser.Platform.ipod && e.code == 127));
			o.isRemoveKey = (o.isBksKey || o.isDelKey);
			return func.call(this, e, o);
		},
    
	    _keydown: function(e, o){
			this.ignore = Meio.Mask.ignoreKeys.contains(e.code);
			if(this.ignore){
	    		// var rep = this.globals.keyRep[e.code];
				// no more representation of the keys yet... (since this is not so used or usefull you know..., im thinking about that)
				this.mask.fireEvent('valid', [this.element, e.code]);
	    	}
			return (Browser.Platform.ipod
				|| (Meio.Mask.onlyKeyDownRepeat && o.isRemoveKey)
				)? this._keypress(e, o): true;
	    },
    
	    /*_keyup: function(e, o){
	    	//9=TAB_KEY
	    	//this is a little bug, when you go to an input with tab key
	    	//it would remove the range selected by default, and that's not a desired behavior
	    	//if(e.code == 9 && (Browser.Engine.webkit || Browser.Engine.trident)) return true;
	    	//return this._paste(e, o);
			return true;
	    },*/
    
		testEntry: function(index, _char){
			var maskArray = this.maskArray,
				rule = Meio.Mask.rules[maskArray[index]],
				ret = (rule && rule.regex.test(_char));
			return (rule.check)? (ret && rule.check(this.element.get('value'), index, _char)): ret;
		},

	    testEvents: function(i, c, code, isRemoveKey){
	    	var maskArray = this.maskArray;
			var rule = Meio.Mask.rules[maskArray[i]];
			if(!isRemoveKey){
				if(!rule){
		    		//console.log('overflow');
					this.mask.fireEvent('overflow', [this.element, code, c]);
		    		return false;
		    	}
		    	else if(!this.testEntry(i, c)){
					//console.log('invalid');
		    		this.mask.fireEvent('invalid', [this.element, code, c]);
		    		return false;
		    	}
			}
	    	//console.log('valid');
			this.mask.fireEvent('valid', [this.element, code, c]);
			return true;
	    },
		
		setSize: function(){
			if(!this.element.get('size')) this.element.set('size', this.maskArray.length);
		}
	});
