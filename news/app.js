
var app = angular.module("MyApp", ['ui.router','ngMaterial']);

// for routing
app.config(function($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/headlines');
    $stateProvider
    .state("content", {
        url: '/headlines',
        templateUrl : "content/content.html",
        controller : "NewsViewCtrl",
        controllerAs: 'vm',
    })
    .state("description", {
        url: '/description',
        templateUrl : "description/description.html",
        controller : "descriptionCtrl",
        controllerAs: 'vm',
        params: {
            description: null,
            headlines: null
        }
    });
});

