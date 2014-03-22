'use strict';

var app = angular.module('ghostdropApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.router'
]);


app.config(function ($stateProvider, $urlRouterProvider) {

  // $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('landing_page', {
      url: '/',
      templateUrl: 'partials/main',
      controller: 'MainCtrl'
    })
      .state('landing_page.sub_page', {
        url: 'sub_page'
      })

});