

Parse.Cloud.define("getMenu", function(request, response) {
  	console.log("cloud : getMenu");
	var menuReturnObject = {

	};

  	var Menu = Parse.Object.extend("Menu");
	var menuQuery = new Parse.Query(Menu);
	menuQuery.include("images");
	menuQuery.include("items");
	menuQuery.find({
	  success: function(menu) {
	    menuReturnObject["array"] = menu;
	    menuArrayToMap(menu).then((map) => {
	    	menuReturnObject["map"] = map;
	    	console.log("response.success");
	    	response.success(menuReturnObject);
	    });
	  },
	  error: function(error) {
	    response.error(error);
	  }
	});
});

function menuArrayToMap(array){
	console.log("cloud : menuArrayToMap");
	var menuMap = {};
	var ajaxCallsRemaining = array.length;
	console.log("ajaxCallsRemaining : " + ajaxCallsRemaining);
	return new Promise((resolve, reject) => {
		for (var i = 0; i < array.length; i++) {
			menuMap[array[i].id] = {
				object:array[i],
				items:null,
				images:null
			};
			getRelationObjects(array[i], "items").then((items) => {
				menuMap[array[i].id].items = items;
				getRelationObjects(array[i], "images").then((images) => {
					menuMap[array[i].id].images = images;
					--ajaxCallsRemaining;
					console.log("ajaxCallsRemaining : " + ajaxCallsRemaining);
					if (ajaxCallsRemaining <= 0) {
						resolve(menuMap);
					}
				});
			});
		}
	});
		
}


function getRelationObjects(obj,relationName){
	console.log("cloud : getRelationObjects");
	return new Promise((resolve, reject) => {
		var returnObject = {
			array: null,
			map: null
		}; 
		var relation = obj.relation(relationName);
		var query = relation.query();
		query.find({
		  success: function(results){
		  	console.log("getRelationObjects-> relationName: " + relationName  + " total : " + results.length);
		  	returnObject.array = results;
		  	returnObject.map = arrayToMap();
		  	resolve(returnObject);
		  }
		});
	});
}

function arrayToMap(array){
	var map = {};
	for (var i = 0; i < array.length; i++) {
		map[array[i].id] = array[i];
	}
	return map;
}