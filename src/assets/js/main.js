var App = angular.module('app', ['ui.bootstrap', 'angularUtils.directives.dirPagination']);

App.config(function(paginationTemplateProvider) {
    paginationTemplateProvider.setPath('assets/tmpl/dirPagination.tpl.html');
});

App.controller('schedule', function($scope, $http) {
  $scope.filtered = [];
  $scope.itemsPerPage = 1;
  $scope.currentPage = 1;

  $http.get('schedule.json').then(function(res) {
    $scope.schedule = res.data.schedule.DAY;

    /*$scope.filterSchedule = function() {
      var begin = ($scope.currentPage - 1) * $scope.itemsPerPage;
      var end = begin + $scope.itemsPerPage;
      $scope.filtered = $scope.schedule.slice(begin, end);
    };

    $scope.findToday = function() {
      var today = new Date();
      var todayStr = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-');
      $scope.filtered = $scope.schedule.filter(function(day) {
        return day.attr === todayStr;
      });
    };

    $scope.findToday();*/
  });
});