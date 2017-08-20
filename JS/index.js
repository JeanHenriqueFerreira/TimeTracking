var myTimeTracking = angular.module('myTimeTracking', []);

myTimeTracking.controller('MainCtr', ['$scope', '$interval', '$http',
  function($scope, $interval, $http) {
    function init() {

      $scope.cadastro = {
        quantidadeHoras: 8,
        timer: undefined,
        intensRegistrados: [],
        itensPendentes: [],
        itemEmContagem: -1,
        existeEditando: false,
        headers: {
          sessId: ""
        },
        totalPendentes: {
          tempo: 0,
          tempoFormatado: "00:00:00"
        },
        totalRegistrado: {
          tempo: 0,
          tempoFormatado: "00:00:00"
        },
        faltanteParaHoras: {
          tempo: 28800,
          tempoFormatado: "08:00:00"
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
        tempo: 0,
        tempoFormatado: "00:00:00",
        selecionado: false,
        editando: true
      });
      $scope.cadastro.existeEditando = true;
    }

    function destruirInterval() {
      if (angular.isDefined($scope.cadastro.timer)) {
        $interval.cancel($scope.cadastro.timer);
        $scope.cadastro.timer = undefined;
      }
    }

    function formataTempo(tempo) {
      var horas, minutos;
      horas = parseInt(tempo / 3600);
      tempo -= (horas * 3600);
      minutos = parseInt(tempo / 60);
      tempo -= (minutos * 60);
      return ((horas < 10) ? "0" : "") + horas + ":" +
        ((minutos < 10) ? "0" : "") + minutos + ":" +
        ((tempo < 10) ? "0" : "") + tempo;
    }

    function somarUmSegundo() {
      if ($scope.cadastro.itemEmContagem !== -1) {
        $scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempo += 1;
        $scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempoFormatado = formataTempo($scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].tempo);
        $scope.cadastro.totalPendentes.tempo += 1;
        $scope.cadastro.totalPendentes.tempoFormatado = formataTempo($scope.cadastro.totalPendentes.tempo);
        $scope.cadastro.faltanteParaHoras.tempo -= 1;
        if ($scope.cadastro.faltanteParaHoras.tempo < 0) {
          $scope.cadastro.faltanteParaHoras.tempo = 0;
        }
        $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);
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
      } else {
        if ($scope.cadastro.itemEmContagem > item) {
          $scope.cadastro.itemEmContagem--;
        }
      }
      $scope.cadastro.totalPendentes.tempo -= $scope.cadastro.itensPendentes[item].tempo;
      $scope.cadastro.faltanteParaHoras.tempo += $scope.cadastro.itensPendentes[item].tempo;

      $scope.cadastro.totalPendentes.tempoFormatado = formataTempo($scope.cadastro.totalPendentes.tempo);
      $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);

      $scope.cadastro.itensPendentes.splice(item, 1);
      $scope.cadastro.existeEditando = false;
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        if ($scope.cadastro.itensPendentes[i].editando) {
          $scope.cadastro.existeEditando = true;
          break;
        }
      }
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
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        $scope.cadastro.totalPendentes.tempo -= $scope.cadastro.itensPendentes[i].tempo;
        $scope.cadastro.faltanteParaHoras.tempo += $scope.cadastro.itensPendentes[i].tempo;
      }
      $scope.cadastro.itensPendentes = [];
      $scope.cadastro.itemEmContagem = -1;
      $scope.cadastro.existeEditando = false;
      destruirInterval();

      $scope.cadastro.totalPendentes.tempoFormatado = formataTempo($scope.cadastro.totalPendentes.tempo);
      $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);
    };

    function editarItem(item) {
      $scope.cadastro.itensPendentes[item].editando = true;
      $scope.cadastro.existeEditando = true;
    }

    function salvarItem(item) {
      $scope.cadastro.itensPendentes[item].editando = false;
      $scope.cadastro.existeEditando = false;
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        if ($scope.cadastro.itensPendentes[i].editando) {
          $scope.cadastro.existeEditando = true;
          break;
        }
      }
    }

    function salvarTodos() {
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        salvarItem(i);
      }
      $scope.cadastro.existeEditando = false;
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
      $http.put("https://controle.suporte99.com/servico/recurso/sessao", {
        data: {
          "sessId": $scope.cadastro.headers.sessId
        },
        headers: {
          "Connection": "keep-alive",
          "sessId": $scope.cadastro.headers.sessId,
          "Content-Type": "application/json;charset=UTF-8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4",
          "Access-Control-Allow-Origin": "https://jeanhenriqueferreira.github.io/TimeTracking",
          "Referer": "https://controle.suporte99.com",
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