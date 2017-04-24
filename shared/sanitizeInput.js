
// identify keys starting with '$'
// disallow overwriting of query selectors

module.exports = function(jOb) {

	var a;
	var b = {};

  	if (jOb instanceof Object) {
    	for (var key in jOb) {
      		if (/^\$/.test(key)) {
      			a = true;
        		delete jOb[key];
      		}
    	}
  	}
  	b['badInput'] = a;
  	b['object'] = jOb;
  	return b;
};