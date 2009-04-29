// all these functions were totaly designed to be used internaly with the plugin.
// you wont want to use them with your arrays
Array.implement({

	// gets the array representing an unmasked string and masks it depending on the type of the mask
	__mask : function( globals, o, extraPos){
		this.__removeInvalidChars(o.maskNonFixedChars,globals.rules);
		if(o.defaultValue) this.__applyDefaultValue(o.defaultValue);
		this.__applyMask(o.maskArray,globals.fixedCharsReg,extraPos);
		return this;
	},

	// applyes the default value to the result string
	__applyDefaultValue : function(defaultValue){
		var defLen = defaultValue.length,thisLen = this.length,i;
		//removes the leading chars
		for(i=thisLen-1;i>=0;i--){
			if(this[i]==defaultValue.charAt(0)) this.pop();
			else break;
		}
		// apply the default value
		for(i=0;i<defLen;i++) if(!this[i])
			this[i] = defaultValue.charAt(i);
		
		return this;
	},

	// Removes values that doesnt match the mask from the valueArray
	// Returns the array without the invalid chars.
	__removeInvalidChars : function(maskNonFixedChars,rules){
		// removes invalid chars
		for(var i=0; i<this.length; i++){
			if( maskNonFixedChars.charAt(i)
				&& rules[maskNonFixedChars.charAt(i)]
				&& !rules[maskNonFixedChars.charAt(i)].test(this[i]) ){
					this.splice(i,1);
					i--;
			}
		}
		return this;
	},

	// Apply the current input mask to the valueArray and returns it. 
	__applyMask : function(maskArray,fixedCharsReg,plus){
		plus = plus || 0;
		// apply the current mask to the array of chars
		for(var i=0; i<this.length+plus; i++ ){
			if( maskArray[i] && fixedCharsReg.test(maskArray[i]) )
				this.splice(i,0,maskArray[i]);
		}
		return this;
	},
	
	// searches for fixed chars begining from the range start position, till it finds a non fixed
   	__extraPositionsTill : function(rangeStart,fixedCharsReg){
   		var extraPos = 0;
   		while( fixedCharsReg.test(this[rangeStart]) ){
   			rangeStart++;
   			extraPos++;
   		}
   		return extraPos;
   	}

});
