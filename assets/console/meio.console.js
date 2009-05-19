(function(){
	if(!window.console){
		window.console = {};
		if(window.opera){
			console.log = function(){
				opera.postError.apply(this, arguments);
			};
		}
		else{
			console.log = function(){
				if(console.element){
					var html = [];
					Array.each(arguments, function(el){
						html.push('<span class="arg ' + $type(el) + '">' + el + '</span>');
					});
					console.element.set('html', '<p class="logged-entry">'+ html.join(', ') +'</p>' + console.element.get('html'))
				}
				else{
					var args = arguments;
					window.addEvent('domready', function(){
						$(document.body).grab(console.element = new Element('div', { id: 'meioconsole__' }));
						console.log.apply(this, args);
					});
				}
			};
		}
	}
	if(!console.time && !console.timeEnd){
		var timesNamespace = {};
		console.time = function(name){
			timesNamespace[name] = $time();
		};
		console.timeEnd = function(name){
			console.log(name + ': ' + ($time()-timesNamespace[name]));
		};
	}
})();