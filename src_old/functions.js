// the base representation functions

// this is the fitness function, best way to use it is to
// make it return a positive number closer to zero
// as it gets better
//
// this function is passed a string to be evaluated
// this is so that you can assign things to variables
// from leaf functions before evaluating
// or evaluate on a list
var es_fitness = function (representation, useList) {

	// a simple fitness evaluation (the individual algo returns something in itself)
	// or a evaluation on a list (the individual algo runs for each set on the list
	// and does something with the result, fitness is returned when the list is processed
	if(useList) {
		return fitness_list(representation);
	} else {
		return fitness_simple(representation);
	}
};

var fitness_simple = function (representation) {
	var result = eval(representation);
	return Math.abs(result - 278.654321);
};

var fitness_list = function (representation) {
	var total = 0;
	var stored = null;
	eval('var func = function() { return ' + representation + '; }');

	for (var i = 0, listlen = es_list.length; i < listlen; i++) {
		line = es_list[i];
		for (var j = 0, linelen = line.length; j < linelen; j++) {
			// XXX this eval should be easy to get rid of
			eval(es_headers[j]+ ' = ' + line[j]);
		}
		var result = func();
		// do something with this result here
		// in this example, we compare it with the next
		// value of the first header, so for headers A, B, C, D
		// we use An, Bn, Cn, and Dn to predict An+1 compared to An
		if(stored !== null) {
			total += Math.abs(stored - line[0]);
		}
		stored = result;
	}
	return total;
};

// those functions are your representation nodes
// they will take results from their children as arguments
var es_nodeFunctions = [

	function es_add (x, y) {
		return x + y;
	},
	
	function es_subs (x, y) {
		return x - y;
	},
	
	function es_mult (x, y) {
		return x * y;
	},
	
	function es_div (x, y) {
		if(!y) {
			return 0;
		}
		return x / y;
	},
	
	function es_ave (x, y) {
		return (x + y) / 2;
	},

	function es_ifless (a, b, c, d) {
		if (a <= b) {
			return c;
		} else {
			return d;
		}
	},

	function es_switch (x, y) {
		if (x > 0) {
			return y;
		} else {
			return 0;
		}
	},

	function es_sqrt (a, b) {
		return Math.sqrt((a - (a + b) / 2) * (a - (a + b) / 2) + (b - (a + b) / 2) * (b - (a + b) / 2));
	}
];

// those functions are the leaf functions
// they do not take arguments
//
// what they return will be evaluated in a string:
// 1 --> number 1
// 'abc' --> the abc variable, to be used in the evaluation function
// '"abc"' --> the "abc" string
var es_leafFunctions = [

	function es_int () {
		return Math.floor(Math.random()*10);
	},

	function es_float () {
		return Math.random()*100;
	},

	function es_smallFloat () {
		return Math.random();
	}

];

var es_stats = [

	function es_EMA_10 (val, list, n) {
		var alpha = 2/(21);
		if (list.length) {
			return alpha * val + (1 - alpha) * list[list.length - 1][n];
		} else {
			return val;
		}
	},

	function es_EMA_20 (val, list, n) {
		var alpha = 2/(41);
		if (list.length) {
			return alpha * val + (1 - alpha) * list[list.length - 1][n];
		} else {
			return val;
		}
	},

	function es_EMA_50 (val, list, n) {
		var alpha = 2/(101);
		if (list.length) {
			return alpha * val + (1 - alpha) * list[list.length - 1][n];
		} else {
			return val;
		}
	},

	function es_diff (val, list, n) {
		if (list.length) {
			return val - list[list.length - 1][n];
		} else {
			return 0;
		}
	},

	function es_diff_diff (val, list, n) {
		if (list.length > 1) {
			return val - 2 * list[list.length - 1][n] + list[list.length - 2][n];
		} else {
			return 0;
		}
	},

	function es_3_diff (val, list, n) {
		if (list.length > 3) {
			return val - list[list.length - 3][n];
		} else {
			return 0;
		}
	},

	function es_10_diff (val, list, n) {
		if (list.length > 10) {
			return val - list[list.length - 10][n];
		} else {
			return 0;
		}
	}

];

var es_functions = es_nodeFunctions.concat(es_leafFunctions);
$.each(es_nodeFunctions, function (index, func) {
	window[func.name] = func;
});

function getESFunction () { // not used
	return es_functions[Math.floor(Math.random()*es_functions.length)];
}

function getESNodeFunction () {
	return es_nodeFunctions[Math.floor(Math.random()*es_nodeFunctions.length)];
}

function getESLeafFunction () {
	return es_leafFunctions[Math.floor(Math.random()*es_leafFunctions.length)]();
}

// drawing function, feel free to use your own
function es_draw (node, parentDOM) {
	if(!parentDOM) {
		$('#workspace').html('');
		parentDOM = $('#workspace');
	}
	if(node.isLeaf) {
		parentDOM.append(
			'<div class="evoscript-node leaf-div"><span>' + node.method + '</span></div>'
		);
	} else {
		var div = $(
			'<div class="evoscript-node"><div class="node-div"><span>' + node.method.name + '</span></div></div>'
		);
		parentDOM.append(div);
		$.each(node.children, function (index, child) {
			es_draw(child, div);
		});
	}
}
