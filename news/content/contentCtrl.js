app.controller("NewsViewCtrl", NewsViewCtrl);


function NewsViewCtrl($state,$stateParams, NewsService){
	var vm = this;
	
	// search btn
	vm.submit = function(){	
		console.log(vm.mysearch);
    	getTopHeadlines();
	}	
	
	// next btn
	vm.next = function() {
		vm.pageNum += 1;

		console.log(vm.pageNum);
		getTopHeadlines();
	}
	// prev btn
	vm.prev = function() {
		if(vm.pageNum > 1){
			vm.pageNum -= 1;
			console.log(vm.pageNum)
			getTopHeadlines();
		}	
	}

	// filter-- category
	vm.selectedCategory = '';
	vm.categories = [
		{name:'business'},
		{name:'entertainment'},
		{name:'general'},
		{name:'health'},
		{name:'science'},
		{name:'sports'},
		{name:'technology'}
	];
	// filter-- country
	vm.selectedCountry = '';
	vm.countries = [
		{name:'India', code:'in'},
		{name:'USA', code:'us'},
		{name:'Japan', code:'JP'},
		{name:'Russia', code:'ru'},
		{name:'China', code:'cn'}
	];
	vm.myFilter = function() {	
		console.log(vm.selectedCategory);
		console.log(vm.selectedCountry);
		getTopHeadlines();
		vm.selectedCategory =" ";
		vm.selectedCountry = " ";
	}

	vm.myContent = function (heading,newsPaper) {
		console.log(heading)
		console.log(newsPaper)
		$state.go("description", {
			description: heading ,
			headlines: newsPaper})
	}
	var getTopHeadlines = function () {
		var queryParams = {
			page: vm.pageNum,
			pageSize: 10,
			country: 'in',
			category:'general' 
		};
		if(vm.selectedCategory){
			queryParams.category = vm.selectedCategory
		}
		if(vm.selectedCountry){
			queryParams.country = vm.selectedCountry
		}
		if (vm.mysearch!=null){
			queryParams['q']= vm.mysearch	
			}

		NewsService.getAllTopHeadlines(queryParams).then(function (news) {
			console.log('Getting result for page ', vm.pageNum);
			console.log(news);
			vm.newsPaper = news.articles;
			console.log(vm.newsPaper);
		});
	}

	var init = function () {
		vm.newsPaper = [];
		// search btn
		vm.mysearch =" ";
		vm.text = " ";
		vm.pageNum = 1;
		getTopHeadlines();
	};

	init();

};
