window.onload = function() {
	var node = document.createElement('div'),
		text = document.createTextNode('WARNING: CLEAN CMS does not support Internet Explorer 8 or below'),
		body = document.getElementsByTagName('body')[0];

	node.setAttribute('style', 'position:fixed; z-index:9999; top:0; width: 100%; padding: 20px; text-align: center; background-color: red; color: black;');
	body.insertBefore(node,body.childNodes[0]);
};
