var myTimeTracking = angular.module('myTimeTracking', []);

myTimeTracking.controller('MainCtr', ['$scope', '$interval', function($scope, $interval) {
  var timer;

  function init() {
    $scope.headers = {

    };

    $scope.cadastro = {
      intensRegistrados: [],
      itensPendentes: [],
      itemEmContagem: -1
    };

    $scope.addItemPendente = addItemPendente;
    $scope.removerAllPendentes = removerAllPendentes;
    $scope.removerItemPendente = removerItemPendente;
    $scope.iniciarContagem = iniciarContagem;
    $scope.pausarContador = pausarContador;
    $scope.destruirInterval = destruirInterval;
  }

  function addItemPendente() {
    $scope.cadastro.itensPendentes.push({
      trf_codigo: "",
      prot_codig: "",
      anot_descricao: "",
      tptrf_codigo: "",
      anot_tempo: "",
      tempo: 0,
      selecionado: false
    });
  }

  function destruirInterval() {
    if (angular.isDefined(timer)) {
      $interval.cancel(timer);
      timer = undefined;
    }
  }

  function somarUmSegundo() {
    if ($scope.cadastro.itemEmContagem !== -1) {
      $scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempo += 1;
    } else {
      destruirInterval();
    }
  }

  $scope.$on('$destroy', function() {
    destruirInterval();
  });

  function pausarContador() {
    $scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].selecionado = false;
    $scope.cadastro.itemEmContagem = -1;
    destruirInterval();
  }

  function removerItemPendente(item) {
    if ($scope.cadastro.itemEmContagem === item) {
      $scope.cadastro.itemEmContagem = -1;
    }
    $scope.cadastro.itensPendentes.splice(item, 1);
  }

  function iniciarContagem(item) {
    for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
      $scope.cadastro.itensPendentes[i].selecionado = false;
    }
    $scope.cadastro.itensPendentes[item].selecionado = true;
    $scope.cadastro.itemEmContagem = item;
    if (timer === undefined) {
      timer = $interval(somarUmSegundo, 1000);
    }
  }

  function removerAllPendentes() {
    $scope.cadastro.itensPendentes = [];
    $scope.cadastro.itemEmContagem = -1;
    destruirInterval();
  };

  function editTime(item) {

  }

  init();

}]);