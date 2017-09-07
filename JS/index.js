var myTimeTracking = angular.module('myTimeTracking', ['ngCookies', 'ngDialog']);

myTimeTracking.controller('MainCtr', ['$scope', '$interval', '$http', '$cookies', 'ngDialog',
  function($scope, $interval, $http, $cookies, ngDialog) {
    var contadorGlobal;

    function init() {
      var vCadastroAndigo;
      $scope.cadastro = {
        quantidadeHoras: 8,
        timer: undefined,
        itemEmContagem: -1,
        existeEditando: false,
        headers: {
          sessId: ""
        },
        itensRegistrados: [],
        itensPendentes: [],
        totalPendentes: {
          tempo: 0,
          tempoFormatado: "00:00:00"
        },
        totalRegistrado: {
          tempo: 0,
          tempoFormatado: "00:00:00"
        },
        totalEnviado: {
          tempo: 0,
          tempoFormatado: "00:00:00"
        },
        faltanteParaHoras: {
          tempo: 28800,
          tempoFormatado: "08:00:00"
        }

      };

      $scope.addItemPendente = addItemPendente;
      $scope.addItemRegistrado = addItemRegistrado;
      $scope.removerAllPendentes = removerAllPendentes;
      $scope.removerAllRegistrados = removerAllRegistrados;
      $scope.removerItemPendente = removerItemPendente;
      $scope.iniciarContagem = iniciarContagem;
      $scope.pausarContador = pausarContador;
      $scope.destruirInterval = destruirInterval;
      $scope.editarItemPendente = editarItemPendente;
      $scope.salvarItem = salvarItem;
      $scope.salvarTodos = salvarTodos;
      $scope.validarSessao = validarSessao;
      $scope.enviarPendenteParaRegistrado = enviarPendenteParaRegistrado;
      $scope.registrarTodos = registrarTodos;
      $scope.keyPress = keyPress;
      $scope.editarTempoItemPendente = editarTempoItemPendente;
      $scope.salvarTempoEditado = salvarTempoEditado;
      $scope.abrirDialogTrocaTempo = abrirDialogTrocaTempo;

      vCadastroAndigo = $cookies.get("cadastroTimeTracking");
      if (vCadastroAndigo) {
        $scope.cadastro = JSON.parse(JSON.parse(vCadastroAndigo));
        salvarTodos();
        pausarContador();
        destruirInterval();
      }

      contadorGlobal = $interval(function() {
        salvarCookies("cadastroTimeTracking", $scope.cadastro);
      }, 10000);

    }

    function abrirDialogTrocaTempo(indexItem) {
      ngDialog.open({
        templateUrl: './Templates/dialogTrocaTempo.html',
        className: 'ngdialog-theme-default',
        scope: $scope
      });
    }

    function salvarCookies(valor, objeto) {
      $cookies.putObject(valor, JSON.stringify(objeto, function(key, value) {
        if (key === "$$hashKey")
          return undefined;

        return value;
      }));
    }

    function keyPress(event, indexItem) {
      if (event.key === "Enter") {
        salvarItem(indexItem);
        if ($scope.cadastro.itensPendentes[indexItem].editandoTempo) {
          salvarTempoEditado(indexItem);
        }
      }
    }

    function editarTempoItemPendente(indexItem) {
      if (!$scope.cadastro.itensPendentes[indexItem].editandoTempo) {
        $scope.cadastro.itensPendentes[indexItem].tempoFormatadoAuxiliar = angular.copy($scope.cadastro.itensPendentes[indexItem].tempoFormatado);
        $scope.cadastro.itensPendentes[indexItem].editandoTempo = true;
      }
    }

    function converterFormatadoParaSegundos(tempoFormatado) {
      var regex = new RegExp(/\d\d\:\d\d\:\d\d/)
      if (regex.test("" + tempoFormatado)) {
        return parseInt(tempoFormatado.substring(0, 2)) * 3600 +
          parseInt(tempoFormatado.substring(3, 5)) * 60 +
          parseInt(tempoFormatado.substring(6, 8));
      } else {
        return -1;
      }
    }

    function salvarTempoEditado(indexItem) {
      var religarContador = false;
      var novoTempo;
      if ($scope.cadastro.itensPendentes[indexItem].editandoTempo) {
        if ($scope.itemEmContagem === indexItem) {
          religarContador = true;
          pausarContador();
        }
        $scope.cadastro.totalPendentes.tempo -= $scope.cadastro.itensPendentes[indexItem].tempo;
        $scope.cadastro.totalRegistrado.tempo -= $scope.cadastro.itensPendentes[indexItem].tempo;
        $scope.cadastro.faltanteParaHoras.tempo += $scope.cadastro.itensPendentes[indexItem].tempo;
        novoTempo = converterFormatadoParaSegundos($scope.cadastro.itensPendentes[indexItem].tempoFormatadoAuxiliar);
        if (novoTempo >= 0) {;
          $scope.cadastro.itensPendentes[indexItem].tempo = novoTempo;
        }
        $scope.cadastro.itensPendentes[indexItem].tempoFormatado = formataTempo($scope.cadastro.itensPendentes[indexItem].tempo);
        $scope.cadastro.totalPendentes.tempo += $scope.cadastro.itensPendentes[indexItem].tempo;
        $scope.cadastro.totalRegistrado.tempo += $scope.cadastro.itensPendentes[indexItem].tempo;
        $scope.cadastro.faltanteParaHoras.tempo -= $scope.cadastro.itensPendentes[indexItem].tempo;
        $scope.cadastro.totalPendentes.tempoFormatado = formataTempo($scope.cadastro.totalPendentes.tempo);
        $scope.cadastro.totalRegistrado.tempoFormatado = formataTempo($scope.cadastro.totalRegistrado.tempo);
        $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);

        $scope.cadastro.itensPendentes[indexItem].editandoTempo = false;
        if (religarContador) {
          iniciarContagem(indexItem);
        }
      }
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
        tempoFormatadoAuxiliar: "00:00:00",
        editandoTempo: false,
        selecionado: false,
        editando: true
      });

      if ($scope.cadastro.timer === undefined) {
        iniciarContagem($scope.cadastro.itensPendentes.length - 1);
      }

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
      if (horas < 0) {
        horas = 0;
      }

      if (minutos < 0) {
        minutos = 0;
        x
      }

      if (tempo < 0) {
        tempo = 0;
      }

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
        $scope.cadastro.totalRegistrado.tempo += 1;
        $scope.cadastro.totalRegistrado.tempoFormatado = formataTempo($scope.cadastro.totalRegistrado.tempo);
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

      $interval.cancel(contadorGlobal);
      contadorGlobal = undefined;
    });

    function pausarContador() {
      if ($scope.cadastro.itensPendentes &&
        $scope.cadastro.itensPendentes.length > 0 &&
        $scope.cadastro.itemEmContagem >= 0) {
        $scope.cadastro.itensPendentes[$scope.cadastro.itemEmContagem].selecionado = false;
      }

      $scope.cadastro.itemEmContagem = -1;
      destruirInterval();
    }

    function removerItemPendente(indexItem) {
      if ($scope.cadastro.itemEmContagem === indexItem) {
        pausarContador();
      } else {
        if ($scope.cadastro.itemEmContagem > indexItem) {
          $scope.cadastro.itemEmContagem--;
        }
      }

      $scope.cadastro.itensPendentes.splice(indexItem, 1);
      $scope.cadastro.existeEditando = false;
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        if ($scope.cadastro.itensPendentes[i].editando) {
          $scope.cadastro.existeEditando = true;
          break;
        }
      }
    }

    function iniciarContagem(indexItem) {
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        $scope.cadastro.itensPendentes[i].selecionado = false;
      }
      $scope.cadastro.itensPendentes[indexItem].selecionado = true;
      $scope.cadastro.itemEmContagem = indexItem;
      if ($scope.cadastro.timer === undefined) {
        $scope.cadastro.timer = $interval(somarUmSegundo, 1000);
      }
    }

    function removerAllPendentes() {
      for (var i = 0; i < $scope.cadastro.itensPendentes.length; i++) {
        $scope.cadastro.faltanteParaHoras.tempo += $scope.cadastro.itensPendentes[i].tempo;
        $scope.cadastro.totalRegistrado.tempo -= $scope.cadastro.itensPendentes[i].tempo;
      }
      $scope.cadastro.itensPendentes = [];
      $scope.cadastro.itemEmContagem = -1;
      $scope.cadastro.existeEditando = false;
      destruirInterval();
      $scope.cadastro.totalPendentes.tempo = 0;
      $scope.cadastro.totalPendentes.tempoFormatado = "00:00:00";
      $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);
      $scope.cadastro.totalRegistrado.tempoFormatado = formataTempo($scope.cadastro.totalRegistrado.tempo);
      $scope.cadastro.totalRegistrado.tempoFormatado = formataTempo($scope.cadastro.totalRegistrado.tempo);
    };

    function removerAllRegistrados() {
      for (var i = 0; i < $scope.cadastro.itensRegistrados.length; i++) {
        $scope.cadastro.faltanteParaHoras.tempo += $scope.cadastro.itensRegistrados[i].tempo;
        $scope.cadastro.totalRegistrado.tempo -= $scope.cadastro.itensRegistrados[i].tempo;
      }
      $scope.cadastro.itensRegistrados = [];

      $scope.cadastro.totalEnviado.tempo = 0;
      $scope.cadastro.totalEnviado.tempoFormatado = "00:00:00";
      $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);
      $scope.cadastro.totalRegistrado.tempoFormatado = formataTempo($scope.cadastro.totalRegistrado.tempo);
    }

    function editarItemPendente(indexItem) {
      if (!$scope.cadastro.itensPendentes[indexItem].editando) {
        $scope.cadastro.itensPendentes[indexItem].editando = true;
        $scope.cadastro.existeEditando = true;
      }
    }

    function salvarItem(indexItem) {
      $scope.cadastro.itensPendentes[indexItem].editando = false;
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
      $http.post("https://controle.suporte99.com/servico/recurso/sessao", {
        data: {
          "sessId": $scope.cadastro.headers.sessId
        },
        headers: {
          "Connection": "keep-alive",
          "sessId": $scope.cadastro.headers.sessId,
          "Content-Type": "application/json;charset=UTF-8",
          "Accept-Encoding": "*",
          "Accept-Language": "*",
          "Authorization": "No Auth",
          "Access-Control-Allow-Headers": "Authorization, Lang",
          "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
          "Access-Control-Allow-Origin": "*"
        }
      }).then(function(pResposta) {
        alert(JSON.stringify(pResposta.data));
      }).catch(function(err) {
        console.log("", err);
      });
    }

    function addItemRegistrado(item) {
      $scope.cadastro.itensRegistrados.push(item);
      $scope.cadastro.faltanteParaHoras.tempo -= item.tempo;
      $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);
      $scope.cadastro.totalEnviado.tempo += item.tempo;
      $scope.cadastro.totalEnviado.tempoFormatado = formataTempo($scope.cadastro.totalEnviado.tempo);
      $scope.cadastro.totalRegistrado.tempo += item.tempo;
      $scope.cadastro.totalRegistrado.tempoFormatado = formataTempo($scope.cadastro.totalRegistrado.tempo);
    }

    function arredondarTempoItem(tempo) {
      var tempoAux = tempo % 60;
      if (tempoAux >= 30) {
        return tempo + (60 - tempoAux);
      }
      return tempo - tempoAux;
    }

    function enviarPendenteParaRegistrado(indexItem) {
      salvarItem(indexItem);
      $scope.cadastro.totalPendentes.tempo -= $scope.cadastro.itensPendentes[indexItem].tempo;
      $scope.cadastro.faltanteParaHoras.tempo += $scope.cadastro.itensPendentes[indexItem].tempo;
      $scope.cadastro.totalRegistrado.tempo -= $scope.cadastro.itensPendentes[indexItem].tempo;

      $scope.cadastro.totalPendentes.tempoFormatado = formataTempo($scope.cadastro.totalPendentes.tempo);
      $scope.cadastro.faltanteParaHoras.tempoFormatado = formataTempo($scope.cadastro.faltanteParaHoras.tempo);
      $scope.cadastro.totalRegistrado.tempoFormatado = formataTempo($scope.cadastro.totalRegistrado.tempo);

      $scope.cadastro.itensPendentes[indexItem].tempo = arredondarTempoItem($scope.cadastro.itensPendentes[indexItem].tempo);
      $scope.cadastro.itensPendentes[indexItem].tempoFormatado = formataTempo($scope.cadastro.itensPendentes[indexItem].tempo);
      addItemRegistrado(angular.copy($scope.cadastro.itensPendentes[indexItem]));
      removerItemPendente(indexItem);
    }

    function registrarTodos() {
      while ($scope.cadastro.itensPendentes.length > 0) {
        enviarPendenteParaRegistrado(0);
      }
    }

    init();

  }
]);