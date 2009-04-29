/* $Id: moo.meiomask.js 52 2008-12-08 02:09:39Z fabiomcosta $ */
/**
 * @version 1.0.0 $Rev: 52 $
 * The MIT License
 * Copyright (c) 2008 Fabio M. Costa http://www.meiocodigo.com
 */
/**
 * moo.meiomask.js
 * $URL: http://svn.assembla.com/svn/meiomask/moo.meiomask.js $
 * @author: $Author: fabiomcosta $
 * @version 1.0.0 $Rev: 52 $
 * @lastchange: $Date: 2008-12-08 00:09:39 -0200 (Mon, 08 Dec 2008) $
 *
 * Created by Fabio M. Costa on 2008-09-16. Please report any bug at http://www.meiocodigo.com
 *
 * Copyright (c) 2008 Fabio M. Costa http://www.meiocodigo.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

if (!$defined(meio)) var meio = {};

// add the paste event
// browsers like firefox2 and before and opera doenst have the onPaste event, but the paste feature can be done with the onInput event.
$extend(Element.NativeEvents,{
	'paste' : 2, 'input' : 2
});
Element.Events.paste = {
	base : ( Browser.Engine.presto || ( Browser.Engine.gecko && Browser.Engine.version < 19 ))?'input':'paste',
	condition: function(e){
		// because of a ie bug this event needs this delay so i can access the value ofthe input that we are pasting
		// thanks Jan Kassens
		this.fireEvent('paste', e, 1);
		return false;
	}
};