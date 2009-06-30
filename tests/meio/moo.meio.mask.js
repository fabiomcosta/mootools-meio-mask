
describe('String.meiomask()', {

	'should mask a string with the fixed mask type option': function(){
		value_of('123456'.meiomask('999.999')).should_be('123.456');
	},
	
	'should set properly the placeholder on the input': function(){
		var el = new Element('input', {'type': 'text'});
		$(document).grab(el);
		el.meiomask('999/999');
		el.focus();
		el.destroy();
		value_of(el.value).should_be('___/___');
	}

});
