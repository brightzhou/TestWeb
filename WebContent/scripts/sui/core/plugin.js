
;mini._allComponents = {};
(function(){
	
	var v, k, superclass, k2;
	for( k in mini){
		v = mini[k];
		if(typeof v == "function" && v.prototype.isControl){
			mini._allComponents[k] = [v];
		}
	}
	for(k in mini._allComponents){
		v = mini._allComponents[k];
		if(v[0].superclass){
			superclass = v[0].superclass.constructor;
			for(k2 in mini._allComponents){
				if(mini._allComponents[k2][0] == superclass ){
					mini._allComponents[k2].push(k);
				}
 			}
		}
	}
})();
mini.plugin = function(component, obj){
	if(component && obj){
		var k;
		for( k in obj){
			mini._plugin(component, k, obj[k]);
		}
	}
};

mini._plugin = function(component, key, value){
	var tree, k, subclass;
	if( typeof component == "string")
		tree = mini._allComponents[component];
	else{
		for(k in mini._allComponents){
			if(mini._allComponents[k][0] === component){
				tree = mini._allComponents[k];
			}
		}
	}
	
	component = tree[0];
	for(var i = 1, len = tree.length;i < len; i++){
		subclass = mini[tree[i]];
		if(subclass && subclass.prototype && component.prototype[key] === subclass.prototype[key]){
			mini._plugin(tree[i], key, value);
		}
	}
	
	component.prototype[key] = value;
};