var myTimeTracking = angular.module('myTimeTracking', []);

myTimeTracking.controller('MainCtr', ['$scope', function($scope) {

  function init() {
    $scope.headers = {

    };

    $scope.cadastro = {
      intensRegistrados: [],
      itensPendentes: []
    };
  }

  function addItem() {
    $scope.cadastro.itensPendentes.push({
      trf_codigo: "",
      prot_codig: "",
      anot_descricao: "",
      tptrf_codigo: "",
      anot_tempo: ""
    });
  }

  function removeItem(item) {

  }

  function editTime(item) {

  }

  $scope.addItem = addItem;


  init();
}]);