app.controller('descriptionCtrl', function($stateParams ) {
  var vm = this;

  var init = function () {
    vm.content = $stateParams.description;
    vm.articles = $stateParams.headlines;
	};

	init(); 
});