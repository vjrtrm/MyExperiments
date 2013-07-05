/* Campaign Studio Common Namespace */
String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.bool = function () {
    return (/^true$/i).test(this);
};

var Jaani = Jaani || {};
Jaani.global = Jaani.global || {};
Jaani.global.validation = Jaani.global.validation || {};

Jaani.global = {
	// a convenience function for parsing string namespaces and
	// automatically generating nested namespaces
	extend: function (ns, ns_string) {
		var parts = ns_string.split("."), parent = ns, pl, i;		
		pl = parts.length;
		for (i = 0; i < pl; i++) {
			// create a property if it doesnt exist
			if (typeof parent[parts[i]] === "undefined") {
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
	},
	// Fill listbox values
	listBoxDataFill: function (id, data, selectedvalue) {
		var listboxfield = document.getElementById(id), i;
		listboxfield.length = 1;
		for (i = 0; i < data.length; i++) {
			listboxfield.options[i + 1] = new Option(data[i], data[i]);
			if (data[i] === selectedvalue) {
				listboxfield.options[i + 1].selected = true;
			}
		}
	},
	// Reset listbox selected index
	listBoxUpdateSelectedIndex: function (id, value) {
		var listboxfield = document.getElementById(id), i;
		for (i = 0; i < listboxfield.length; i++) {
			if (listboxfield.options[i].innerHTML === value) {
				listboxfield.options[i].selected = true;
			}
		}
	},
	// To clear form select list values
	listBoxDataClear: function (ids) {
		var listboxfields = ids.split(',') || '', listbox = '', x;
		for (x in listboxfields) {
			listbox = document.getElementById(listboxfields[x]);
			if (listbox) {
				while (listbox.length > 1) {
					listbox.remove(listbox.length - 1);
				}
			}
		}
	},
	loadXMLString: function (txt) {
		try {//Internet Explorer
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(txt);
			return (xmlDoc);
		} catch (e) {
			try {//Firefox, Mozilla, Opera, etc.
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(txt, "text/xml");
				return (xmlDoc);
			} catch (e) {alert(e.message); }
		}
		return (null);
	},
	textFieldValidade : function (e, type) {
		var key = window.event ? e.keyCode : e.which, keychar = String.fromCharCode(key), allowedCharSet, notAllowedCharSet;
		if (type === "create") {
			allowedCharSet = /[A-Za-z0-9_]/;
		} else if (type === "search") {
			allowedCharSet = /[A-Za-z0-9_*?]/;
		}
		notAllowedCharSet = /&/;
		if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
			return (allowedCharSet.test(keychar) && !notAllowedCharSet.test(keychar));
		} else {
			return (allowedCharSet.test(keychar) && !notAllowedCharSet.test(keychar)) || (e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 46 || (e.keyCode >= 35 && e.keyCode <= 40));
		}
		return false;
	},
	modifyOperator: function (operator) {
		switch (operator) {
		case '>=':
			return "&gt;=";
		case '<=':
			return "&lt;=";
		case '<':
			return "&lt;";
		case '>':
			return "&gt;";
		default:
			return operator;
		}
		return false;
	},
	clone: function (src) {
		function mixin(dest, source, copyFunc) {
			var name, s, i, empty = {};
			for (name in source) {
				// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
				// inherited from Object.prototype.	 For example, if dest has a custom toString() method,
				// don't overwrite it with the toString() method that source inherited from Object.prototype
				s = source[name];
				if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
					dest[name] = copyFunc ? copyFunc(s) : s;
				}
			}
			return dest;
		}
		if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]") {
			// null, undefined, any non-object, or function
			return src;	// anything
		}
		if (src.nodeType && "cloneNode" in src) {
			// DOM Node
			return src.cloneNode(true); // Node
		}
		if (src instanceof Date) {
			// Date
			return new Date(src.getTime());	// Date
		}
		if (src instanceof RegExp) {
			// RegExp
			return new RegExp(src);   // RegExp
		}
		var r, i, l;
		if (src instanceof Array) {
			// array
			r = [];
			for (i = 0, l = src.length; i < l; ++i) {
				if (i in src) {
					r.push(Jaani.global.clone(src[i]));
				}
			}
			// we don't clone functions for performance reasons
			//		}else if(d.isFunction(src)){
			//			// function
			//			r = function(){ return src.apply(this, arguments); };
		} else {
			// generic objects
			r = src.constructor ? new src.constructor() : {};
		}
		return mixin(r, src, Jaani.global.clone);

	},
	// Common Ajax Form Submit with input parameters
	asyncFormSubmit: function (e, obj) {
		// Parameters: cmd(rel), url, container, value
		var cmd = obj.cmd, url = obj.url, container = obj.container, node = document.getElementById("pfscontent"), studioform = document.studioform,
			handleSuccess, handleFailure, handleEvent, callback, formObject, postRequest;
		Jaani.global.enableFormFields(studioform);
		// Request Success Handler.
		handleSuccess = function (o) {
			if (o.responseText !== undefined) {
				var area = YAHOO.util.Dom.get(container);
				YAHOO.plugin.Dispatcher.process(area, o.responseText);
			}
		};
		// Request Failure Handler.
		handleFailure = function (o) {
			if (o.responseText !== undefined) {
				document.getElementById("pfscontent").innerHTML = o.responseText;
			}
		};
		// Request Start/Complete Event Handlers.
		handleEvent = {
			start: function (eventType, args) {
				var newElement = document.createElement('div');
				newElement.setAttribute('id', 'overlay');
				newElement.style.width = document.body.offsetWidth + "px";
				newElement.style.height = document.body.offsetHeight + "px";
				newElement.style.left = "0px";
				newElement.innerHTML = '<img style="margin-top:' + (document.body.offsetHeight / 2) + 'px;margin-left:' + (document.body.offsetWidth / 2) + 'px" src="images/loading.gif"/>';
				Jaani.global.insertAfter(newElement, node);
				Jaani.global.disableFormFields();
			},
			complete: function (eventType, args) {
				node.parentNode.removeChild(document.getElementById('overlay'));
				Jaani.global.disableFormFields();
				listformelementenabled = [];
			},
			abort: function (eventType, args) {
				node.parentNode.removeChild(document.getElementById('overlay'));
			}
		};
		// Callback functions for Events
		callback = {
			customevents: {
				onStart: handleEvent.start,
				onComplete: handleEvent.complete,
				onAbort: handleEvent.abort
			},
			scope: handleEvent,
			success: handleSuccess,
			failure: handleFailure
		};
		// Serialize Form values and Submit Ajax request
		document.getElementById('cmd').value = cmd;
		formObject = document.getElementById('studioform');
		YAHOO.util.Connect.setForm(formObject);
		postRequest = YAHOO.util.Connect.asyncRequest('POST', url, callback);
	},
	listformelementenabled: [],
	// Enabling Disabled Form fields before submit
	enableFormFields: function (formName) {
		var allFormElements = formName.elements, i;
		this.listformelementenabled = [];
		if (allFormElements) {
			for (i = 0; i < allFormElements.length; i++) {
				if (allFormElements[i].nodeName) {
					if (allFormElements[i].disabled) {
						allFormElements[i].disabled = false;
						this.listformelementenabled.push(allFormElements[i]);
					}
				}
			}
		}
	},
	// Enabling Disabled Form fields before submit Ends
	// Function to show Loading image after the form fields which triggered Ajax Submit
	insertAfter: function (newElement, targetElement) {
		var parent = targetElement.parentNode;
		if (parent.lastchild === targetElement) {
			parent.appendChild(newElement);
		} else {
			try {
				parent.insertBefore(newElement, targetElement.nextSibling);
			} catch (err) {
				parent.insertBefore(newElement);
			}
		}
	},
	// Function to show Loading image after the form fields which triggered Ajax Submit Ends
	// Disable Form fields after submit
	disableFormFields: function () {
		var x;
		for (x in this.listformelementenabled) {
			this.listformelementenabled[x].disabled = true;
		}
	},
	// Disable Form fields after submit ends
	// Message Show/Hide function	
	messageLoad: function (className, display,  data) {
		var elements = YAHOO.util.Dom.getElementsByClassName(className), x;
		for (x in elements) {
			if (elements[x].nodeName) {
				elements[x].style.display = display;
				if (elements[x].innerHTML === "" || data === '') {
					elements[x].innerHTML = data;
				} else {
					elements[x].innerHTML = elements[x].innerHTML + data;
				}
				if (display === 'block') {
					scroll(0, 0);
				}
			}
		}
	},
	getResultsPerPage: function (e, obj) {
		//document.getElementById('resultsPerPage').value=this.value;
		Jaani.global.asyncFormSubmit(e, obj);
	},
	// Message Show/Hide function ends
	getShowPage: function (e, obj) {
		if (obj.show) {
			document.getElementById('selectedPage').value = obj.show;
		}
		if (!document.studioform.selectedPage) {
			var sParent = document.studioform, sChild = document.createElement("input");
			sChild.setAttribute("type", "hidden");
			sChild.setAttribute("name", "selectedPage");
			sParent.appendChild(sChild);
		}
		Jaani.global.asyncFormSubmit(e, obj);
	},
	removeChildNodes: function (id) {
		var Parent = document.getElementById(id);
		while (Parent.hasChildNodes()) {
			Parent.removeChild(Parent.firstChild);
		}
	},
	removeElementById: function (id) {
		var element = document.getElementById(id);
		element.parentNode.removeChild(element);
	},
	removeElement: function (element) {
		element.parentNode.removeChild(element);
	},
	lightboxLoader: function (nodename, lightboxcontent, size, datavar) {
		var node = document.getElementById(nodename), newElement;
		newElement = document.createElement('div');
		newElement.setAttribute('id', 'overlay');
		newElement.style.width = document.body.offsetWidth + "px";
		newElement.style.height = document.body.offsetHeight + "px";
		newElement.innerHTML = '<div class="lightbox" style="margin-top:' + (document.body.offsetHeight / size) + 'px;margin-left:' + (document.body.offsetWidth / 4) + 'px"><a href="#" id="csLightbox" onclick="Jaani.global.hideLightBox(\'csLightbox\','+datavar+')"><img align="right" src="images/icon_del_16wx16h.gif" border="0" /></a>' + lightboxcontent + '</div>';
		this.insertAfter(newElement, node);
		node.focus();
	},
	hideLightBox: function (id, datavar) {
		var element = document.getElementById(id);
		element.parentNode.parentNode.style.display = 'none';
		this.removeElement(element.parentNode.parentNode);
		if(datavar){
			this.clearLightBoxData();
		}
	},
	clearLightBoxData: function(){
		Jaani.rule.decision.methods.selectedObjective.clearValue();
	},
	// Common Ajax Form Submit with input parameters ends
	logout : function () {
		document.studioform.cmd.value = '_logout';
		document.studioform.action = "login.htm";
		document.studioform.target = "_self";
		document.studioform.submit();
	}
};
Jaani.global.validation = {
	numbersOnly : function (event) {
		var key = window.event ? event.keyCode : event.which;
		if (key > 31 && (key < 48 || key > 57)) {
			return false;
		}
		return true;
	},
	isArray: function (o) {
	  return Object.prototype.toString.call(o) === '[object Array]';
	}
};
