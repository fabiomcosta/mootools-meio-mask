
module('Automated Functional Tests', {
	setup: function() {
		input = new Element('input', {id: 'input-id', type: 'text', maxLength: 10}).inject(document.body);
	},
	teardown: function(){
		$('input-id').destroy();
	}
});

test('should mask the typed value with the Fixed mask type', function(){
	input.meiomask('Fixed', 'Time');
	stop();
	Syn.click({}, input).type('111[left][left][left][delete]', function(){
		start();
		equals(input.value, '1_:1_');
	});
});

test('should mask the typed value with the Fixed mask type', function(){
	input.meiomask('Fixed', 'Time');
	stop();
	Syn.click({}, input).type('1111[delete][delete]', function(){
		start();
		equals(input.value, '11:11');
	});
});

test('should mask the typed value with the fixed.mac mask type', function(){
	input.meiomask('Fixed', 'Mac');
	stop();
	Syn.click({}, input).type('ab23FGee5iu9876AAf', function(){
		start();
		equals(input.value, 'ab:23:Fe:e5:98:76');
	});
});

test('should mask the typed value with the Reverse mask type', function(){
	input.meiomask('Reverse', 'Reais');
	stop();
	Syn.click({}, input).type('0', function(){
		start();
		equals(input.value, 'R$ 0,00');
	});
});

test('should mask the typed value with the Reverse mask type', function(){
	input.meiomask('Reverse', 'Reais');
	stop();
	Syn.click({}, input).type('443212', function(){
		start();
		equals(input.value, 'R$ 4.432,12');
	});
});

test('should mask the typed value with the Reverse mask type', function(){
	input.meiomask('Reverse', 'Reais');
	stop();
	Syn.click({}, input).type('[left][left][left][left][left][left][left]4', function(){
		start();
		equals(input.value, 'R$ 40,00');
	});
});

test('should mask the typed value with the Reverse mask type', function(){
	input.meiomask('Reverse', 'Reais');
	stop();
	Syn.click({}, input).type('[left][left][left][left][left][left]4', function(){
		start();
		equals(input.value, 'R$ 40,00');
	});
});

test('should mask the typed value with the Reverse mask type', function(){
	input.meiomask('Reverse', 'Reais');
	stop();
	Syn.click({}, input).type('[left][left][left][left][left]4', function(){
		start();
		equals(input.value, 'R$ 40,00');
	});
});

test('should mask the typed value with the Repeat mask type', function(){
	input.meiomask('Repeat', {mask: '9', maxLength: 4});
	stop();
	Syn.click({}, input).type('441fff45', function(){
		start();
		equals(input.value, '4414');
	});
});

test('should mask the typed value with the Regexp mask type', function(){
	input.meiomask('Regexp', 'Ip');
	stop();
	Syn.click({}, input).type('12gg3456', function(){
		start();
		equals(input.value, '123');
	});
});

test('should mask the typed value with the Regexp mask type', function(){
	input.meiomask('Regexp', 'Ip');
	stop();
	Syn.click({}, input).type('123.45678.999.123', function(){
		start();
		equals(input.value, '123.456.999.123');
	});
});

test('should mask inputs with pre-defined values', function(){
	input.set('value', '333').meiomask('fixed.cpf');
	equals(input.value, '333.');
	stop();
	Syn.click({}, input).type('12322255500', function(){
		start();
		equals(input.value, '333.123.222-55');
	});
});

