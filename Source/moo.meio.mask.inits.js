if(typeof Meio == 'undefined') var Meio = {};

$extend(Element.NativeEvents, {
	'paste': 2, 'input': 2
});
// thanks Jan Kassens
Element.Events.paste = {
	base : (Browser.Engine.presto || (Browser.Engine.gecko && Browser.Engine.version < 19))? 'input': 'paste',
	condition: function(e){
		this.fireEvent('paste', e, 1);
		return false;
	}
};
