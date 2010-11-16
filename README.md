MeioMask - Copyright (c) 2009 [Fábio Miranda Costa](http://meiocodigo.com/)
========================================================================

MeioMask - a mootools plugin for masking text inputs.

![Screenshot](http://github.com/fabiomcosta/mootools-meio-mask/raw/master/Assets/image_forge.png)

Notice
------

Versions 1.x will support MooTools 1.2.x while 2.x will support 1.3.x.
If you are using version 1.x, you'll need version 1.2.4 or greater of mootools-core because the plugin uses Browser.Engine.gecko engine detection, which just work on those versions.

How to use
----------
	<html>
		<head>
			<!--include mootools library and meioMask plugin -->
			<script type="text/javascript" src="mootools-core-1.3.0.js" charset="utf-8"></script>
			<!-- Just Element.Form is needed -->
			<script type="text/javascript" src="mootools-more-1.3.0.1.js" charset="utf-8"></script>
		</head>
	
		<body>
			<form>
				<label for="cpf">Time Mask:</label>
				<input type="text" name="time" data-meiomask="fixed.time" />
			</form>

			<script type="text/javascript" >
				$$('input').each(function(input){
					input.meiomask(input.get('data-meiomask'));
				});
			</script>
		</body>
	</html>

Demos
-----

You can see it in action into the project at Specs/user/index.html.

Credits
-------

Inspired by iMask http://zendold.lojcomm.com.br/imask/ and some ideas from InputMask http://cpojer.net.

License
-------

The MIT License (http://www.opensource.org/licenses/mit-license.php)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
