var myTimeTracking = angular.module('myTimeTracking', []);

myTimeTracking.controller('MainCtr', ['$scope', '$interval', '$http',
  function($scope, $interval, $http) {
    function init() {

      $scope.cadastro = {
        timer: undefined,
        intensRegistrados: [],
        itensPendentes: [],
        itemEmContagem: -1,
        headers: {
          sessId: ""
        }
      };

      $scope.addItemPendente = addItemPendente;
      $scope.removerAllPendentes = removerAllPendentes;
      $scope.removerItemPendente = removerItemPendente;
      $scope.iniciarContagem = iniciarContagem;
      $scope.pausarContador = pausarContador;
      $scope.destruirInterval = destruirInterval;
      $scope.editarItem = editarItem;
      $scope.salvarItem = salvarItem;
      $scope.salvarTodos = salvarTodos;
      $scope.validarSessao = validarSessao;
    }

    function addItemPendente() {
      $scope.cadastro.itensPendentes.push({
        trf_codigo: "",
        prot_codig: "",
        anot_descricao: "",
        tptrf_codigo: "",
        anot_tempo: "",
        tempo: new Date("Sun Jan 01 2017 00:00:00 GMT-0200"),
        tempoFormatado: "00:00:00",
        selecionado: false,
        editando: true
      });
    }

    function destruirInterval() {
      if (angular.isDefined($scope.cadastro.timer)) {
        $interval.cancel($scope.cadastro.timer);
        $scope.cadastro.timer = undefined;
      }
    }

    function formataTempo(tempo) {
      return ((tempo.getHours() < 10) ? "0" : "") + tempo.getHours() + ":" +
        ((tempo.getMinutes() < 10) ? "0" : "") + tempo.getMinutes() + ":" +
        ((tempo.getSeconds() < 10) ? "0" : "") + tempo.getSeconds();
    }

    function somarUmSegundo() {
      if ($scope.cadastro.itemEmContagem !== -1) {
        $scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempo.setSeconds($scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempo.getSeconds() + 1);
        $scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempoFormatado = formataTempo($scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempo);
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
        pausarContador();
      }
      $scope.cadastro.itensPendentes.splice(item, 1);
    }

    function iniciarContagem(item) {
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        $scope.cadastro.itensPendentes[i].selecionado = false;
      }
      $scope.cadastro.itensPendentes[item].selecionado = true;
      $scope.cadastro.itemEmContagem = item;
      if ($scope.cadastro.timer === undefined) {
        $scope.cadastro.timer = $interval(somarUmSegundo, 1000);
      }
    }

    function removerAllPendentes() {
      $scope.cadastro.itensPendentes = [];
      $scope.cadastro.itemEmContagem = -1;
      destruirInterval();
    };

    function editarItem(item) {
      $scope.cadastro.itensPendentes[item].editando = true;
    }

    function salvarItem(item) {
      $scope.cadastro.itensPendentes[item].editando = false;
    }

    function salvarTodos() {
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        salvarItem(i);
      }
    }

    function validarSessao() {
      /*
        $http({
          method: 'PUT',
          url: 'https://www1.safety8.com.br/servico/recurso/sessao',
          headers: {
            //"Connection": "keep-alive",
            "sessId": $scope.cadastro.headers.sessId,
            "Content-Type": "application/json;charset=UTF-8",
            "conexao": "VA03E4595AC",
            //"Accept-Encoding": "gzip, deflate, br",
            //"Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4",
            "Access-Control-Allow-Origin": "*",
            //"Referer": "https://www1.safety8.com.br/"
            //"Origin": "https://jeanhenriqueferreira.github.io/TimeTracking"
          },
          data: {
            "sessId": $scope.cadastro.headers.sessId,
            "NumSerie": "761"
          }
        }).then(function(pResposta) {
          alert(JSON.stringify(pResposta.data));
        }).catch(function(err) {
          console.log("", err);
        });
      */
      /*
      $http.put("", {
        data: {
          "sessId": $scope.cadastro.headers.sessId,
          "NumSerie": "761",
          headers: {
            semOverlay: false,
            conexao: "VA03E4595AC"
          }
        }
        ,
                headers: {
                  "Connection": "keep-alive",
                  "sessId": $scope.cadastro.headers.sessId,
                  "Content-Type": "application/json;charset=UTF-8",
                  "conexao": "VA03E4595AC",
                  "Accept-Encoding": "gzip, deflate, br",
                  "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4",
                  "Access-Control-Allow-Origin": "*",
                  "Referer": "https://www1.safety8.com.br/",
                  "Origin": "https://jeanhenriqueferreira.github.io/TimeTracking"
                }
                
      }).*/
      $http.put("https://www1.safety8.com.br/servico/recurso/sessao", {
        data: {
          "sessId": $scope.cadastro.headers.sessId,
          "NumSerie": "761"
        },
        headers: {
          "Connection": "keep-alive",
          "sessId": $scope.cadastro.headers.sessId,
          "Content-Type": "application/json;charset=UTF-8",
          "conexao": "VA03E4595AC",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4",
          "Access-Control-Allow-Origin": "https://www1.safety8.com.br/",
          "Referer": "https://www1.safety8.com.br/",
          "Authorization": "No Auth"
            //"Origin": "https://jeanhenriqueferreira.github.io/TimeTracking"
        }
      }).then(function(pResposta) {
        alert(JSON.stringify(pResposta.data));
      }).catch(function(err) {
        console.log("", err);
      });
    }

    init();

  }
]);