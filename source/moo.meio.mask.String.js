	
Meio.Mask.DumbInput = new Element('input', {'type': 'text'});

(function(){
    var identifyParams = function(mask, type, options){
        var maskClass;
	    if($type(mask) == 'class'){
	        maskClass = mask;
	        options = type;
	    }
	    else{
	        maskClass = Meio.Mask[type][mask];
	    }
	    return {klass: maskClass, options: options || {}};
    };
    String.implement({
    	meiomask: function(mask, type, options){
    	    var params = identifyParams(mask, type, options);
    	    return new params.klass(Meio.Mask.DumbInput, params.options).mask(this);
    	},
    	meiounmask: function(mask, type, options){
    	    var params = identifyParams(mask, type, options);
    	    return new params.klass(Meio.Mask.DumbInput, params.options).unmask(this);
    	}
    });
})();
