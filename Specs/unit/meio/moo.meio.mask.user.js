
var input;

describe('Automated user Specs', {

	'before all': function(){
		input = new Element('input', {
			'id': 'input-id', 'type': 'text', 'maxLength': 10,
			styles: {
				'position': 'absolute'
			}
		}).inject(document.body);
	},
	
	'should contain no value since this mask doenst accept any word': function(){
		//input.meiomask('Fixed', 'Time');
		//Syn.click({}, 'input-id').type('111', null).delay();
	}
	
});
