// Lista de Digimons

const digimons = [
  {
    nome: "Agumon",
    tipo: "Réptil",
    nivel: "Novato",
    atributo: "Vacina",
  },

  {
    nome: "Gabumon",
    tipo: "Réptil",
    nivel: "Novato",
    atributo: "Dados",
  },

  {
    nome: "Patamon",
    tipo: "Mamífero",
    nivel: "Novato",
    atributo: "Dados",
  },
];

// PESQUISA NA DIGI-API

const URL_DIGI_API = "https://digi-api.com/api/v1/digimon/";

// Conta as buscas feitas. Se uma resposta antiga chegar depois de uma
// busca mais nova, ela é ignorada e não sobrescreve o cartão.
let numeroDaBusca = 0;

// NAVEGAÇÃO (Guia 3/7)
// Regra: "próximo" = ID + 1 e "anterior" = ID - 1. Se o ID não existir
// na API, pulamos para o seguinte (até MAX_PULOS vezes seguidas).
const ID_MINIMO = 1;
const ID_MAXIMO_PADRAO = 1488;
const MAX_PULOS = 10; // IDs inexistentes seguidos que toleramos
const MAX_SORTEIOS = 5; // sorteios para achar um ID que exista

let idAtual = null; // ID do Digimon que está no cartão (null = nenhum)
let idMaximo = null; // maior ID da API (descoberto ao abrir a página)

function mostrarMensagem(texto) {
  const mensagem = document.querySelector("#mensagem");

  if (mensagem) {
    mensagem.textContent = texto;
  }
}

// Esconde o cartão e apaga todos os dados da pesquisa anterior
function esconderCartao() {
  const cartao = document.querySelector("#cartao");

  if (!cartao) {
    return;
  }

  cartao.hidden = true;

  document.querySelector("#cartao-imagem").textContent = "";
  document.querySelector("#cartao-nome").textContent = "";
  document.querySelector("#cartao-id").textContent = "";
  document.querySelector("#cartao-nivel").textContent = "";
  document.querySelector("#cartao-tipo").textContent = "";
  document.querySelector("#cartao-atributo").textContent = "";
}

// Junta os valores de uma lista da API (ex.: levels, types, attributes)
function listarCampo(lista, chave) {
  if (!Array.isArray(lista)) {
    return "Desconhecido";
  }

  const valores = lista
    .map(function (item) {
      return typeof item === "string" ? item : item && item[chave];
    })
    .filter(Boolean);

  return valores.length > 0 ? valores.join(", ") : "Desconhecido";
}

function mostrarImagem(url, nome) {
  const caixa = document.querySelector("#cartao-imagem");

  caixa.textContent = "";

  if (!url) {
    caixa.textContent = "Sem imagem";
    return;
  }

  const img = document.createElement("img");

  img.alt = nome;

  img.onerror = function () {
    caixa.textContent = "Sem imagem";
  };

  img.src = url;

  caixa.appendChild(img);
}

// Preenche o cartão existente com os dados recebidos
function atualizarCartao(digimon) {
  // guarda o ID mostrado: é a partir dele que Próximo/Anterior andam
  idAtual = digimon.id;

  document.querySelector("#cartao-nome").textContent = digimon.name;

  document.querySelector("#cartao-id").textContent = "ID: " + digimon.id;

  document.querySelector("#cartao-nivel").textContent =
    "Nível: " + listarCampo(digimon.levels, "level");

  document.querySelector("#cartao-tipo").textContent =
    "Tipo: " + listarCampo(digimon.types, "type");

  document.querySelector("#cartao-atributo").textContent =
    "Atributo: " + listarCampo(digimon.attributes, "attribute");

  const primeiraImagem = Array.isArray(digimon.images)
    ? digimon.images[0]
    : null;

  mostrarImagem(primeiraImagem ? primeiraImagem.href : "", digimon.name);

  document.querySelector("#cartao-favorito").onclick = function () {
    adicionarFavorito(digimon.name);
  };

  document.querySelector("#cartao").hidden = false;
}

// Consulta a API e devolve só o resultado, sem mexer na tela.
// Quem chama (busca, Próximo, Anterior, Me surpreenda) decide o que mostrar.
// estado: "ok" | "inexistente" | "erro-api" | "erro-rede"
async function consultarApi(consulta) {
  try {
    const resposta = await fetch(URL_DIGI_API + encodeURIComponent(consulta));

    if (resposta.status === 404 || resposta.status === 400) {
      return { estado: "inexistente" };
    }

    if (!resposta.ok) {
      return { estado: "erro-api", codigo: resposta.status };
    }

    const dados = await resposta.json();

    if (!dados || dados.id === undefined || !dados.name) {
      return { estado: "inexistente" };
    }

    return { estado: "ok", dados: dados };
  } catch (erro) {
    return { estado: "erro-rede" };
  }
}

// Mensagem padrão para falhas que não são "registro inexistente"
function mensagemDeFalha(resultado) {
  if (resultado.estado === "erro-api") {
    return (
      "A Digi-API não respondeu como esperado (código " +
      resultado.codigo +
      "). Tente novamente."
    );
  }

  return (
    "Não foi possível acessar a Digi-API. " +
    "Verifique sua conexão e tente novamente."
  );
}

// Busca na API (serve para nome e para ID, só muda o final do endereço)
async function buscarDigimon(consulta, descricao) {
  numeroDaBusca++;

  const minhaBusca = numeroDaBusca;

  esconderCartao();
  mostrarMensagem("Buscando...");
  ocuparControles(true);

  const resultado = await consultarApi(consulta);

  if (minhaBusca !== numeroDaBusca) {
    return;
  }

  ocuparControles(false);

  if (resultado.estado === "ok") {
    mostrarMensagem("");
    atualizarCartao(resultado.dados);
    return;
  }

  if (resultado.estado === "inexistente") {
    mostrarMensagem("Nenhum Digimon encontrado com " + descricao + ".");
    return;
  }

  mostrarMensagem(mensagemDeFalha(resultado));
}

// Entrada inválida: cancela buscas em andamento e avisa o usuário
function rejeitarEntrada(texto) {
  numeroDaBusca++;

  esconderCartao();
  mostrarMensagem(texto);
  ocuparControles(false);
}

function pesquisarPorNome() {
  const campo = document.querySelector("#busca-nome");

  // tira espaços do começo/fim e reduz espaços repetidos
  const nome = campo.value.trim().replace(/\s+/g, " ");

  if (nome === "") {
    rejeitarEntrada("Digite o nome de um Digimon.");
    return;
  }

  if (/^\d+$/.test(nome)) {
    rejeitarEntrada(
      "Isso parece um número. Para buscar por número, " + "use o campo de ID.",
    );
    return;
  }

  buscarDigimon(nome.toLowerCase(), 'o nome "' + nome + '"');
}

function pesquisarPorId() {
  const campo = document.querySelector("#busca-id");

  const texto = campo.value.trim();

  if (texto === "") {
    rejeitarEntrada("Digite o ID de um Digimon.");
    return;
  }

  if (!/^\d+$/.test(texto)) {
    rejeitarEntrada("O ID deve ser um número inteiro, usando somente dígitos.");
    return;
  }

  const id = Number(texto);

  if (id < 1 || !Number.isSafeInteger(id)) {
    rejeitarEntrada("O ID deve ser um número maior que zero.");
    return;
  }

  buscarDigimon(String(id), "o ID " + id);
}

// Liga os formulários (Enter ou clique no botão, sem recarregar a página)
function iniciarPesquisa() {
  const formNome = document.querySelector("#form-nome");
  const formId = document.querySelector("#form-id");

  if (!formNome || !formId) {
    return;
  }

  formNome.addEventListener("submit", function (evento) {
    evento.preventDefault();
    pesquisarPorNome();
  });

  formId.addEventListener("submit", function (evento) {
    evento.preventDefault();
    pesquisarPorId();
  });
}

// NAVEGAÇÃO: PRÓXIMO, ANTERIOR E ME SURPREENDA

// Desativa os três botões enquanto uma consulta está em andamento
function ocuparControles(ocupado) {
  ["#btn-anterior", "#btn-proximo", "#btn-surpreenda"].forEach(
    function (seletor) {
      const botao = document.querySelector(seletor);

      if (botao) {
        botao.disabled = ocupado;
      }
    },
  );
}

// Descobre o maior ID da API: pede uma página de 1 item para saber o
// total e depois a última página. Se algo falhar, idMaximo fica null
// e a navegação passa a depender só do tratamento de 404.
async function descobrirLimite() {
  const lista = URL_DIGI_API.replace(/\/$/, "");

  try {
    const primeira = await (await fetch(lista + "?pageSize=1")).json();

    const total = primeira.pageable.totalElements;

    const ultima = await (
      await fetch(lista + "?pageSize=1&page=" + (total - 1))
    ).json();

    idMaximo = ultima.content[0].id;
  } catch (erro) {
    idMaximo = null;
  }
}

// direcao: +1 (Próximo) ou -1 (Anterior)
async function navegar(direcao) {
  if (idAtual === null && direcao < 0) {
    rejeitarEntrada("Pesquise um Digimon ou use Próximo para começar.");
    return;
  }

  let candidato = idAtual === null ? ID_MINIMO : idAtual + direcao;

  // Limite logo no primeiro passo: avisa e mantém o cartão na tela
  if (candidato < ID_MINIMO) {
    mostrarMensagem("Este é o primeiro Digimon da lista.");
    return;
  }

  if (idMaximo !== null && candidato > idMaximo) {
    mostrarMensagem("Este é o último Digimon da lista.");
    return;
  }

  numeroDaBusca++;

  const minhaBusca = numeroDaBusca;

  esconderCartao();
  mostrarMensagem("Buscando...");
  ocuparControles(true);

  for (let pulos = 0; pulos <= MAX_PULOS; pulos++) {
    if (candidato < ID_MINIMO) {
      mostrarMensagem("Este é o primeiro Digimon da lista.");
      ocuparControles(false);
      return;
    }

    if (idMaximo !== null && candidato > idMaximo) {
      mostrarMensagem("Este é o último Digimon da lista.");
      ocuparControles(false);
      return;
    }

    const resultado = await consultarApi(String(candidato));

    if (minhaBusca !== numeroDaBusca) {
      return;
    }

    if (resultado.estado === "ok") {
      ocuparControles(false);
      mostrarMensagem("");
      atualizarCartao(resultado.dados);
      return;
    }

    if (resultado.estado !== "inexistente") {
      ocuparControles(false);
      mostrarMensagem(mensagemDeFalha(resultado));
      return;
    }

    // ID sem registro: tenta o seguinte na mesma direção
    candidato += direcao;
  }

  ocuparControles(false);
  mostrarMensagem(
    "Não encontrei outro Digimon nessa direção. " +
      "Tente pesquisar por nome ou ID.",
  );
}

function irParaProximo() {
  navegar(1);
}

function irParaAnterior() {
  navegar(-1);
}

async function surpreender() {
  numeroDaBusca++;

  const minhaBusca = numeroDaBusca;

  esconderCartao();
  mostrarMensagem("Sorteando...");
  ocuparControles(true);

  const maximo = idMaximo !== null ? idMaximo : ID_MAXIMO_PADRAO;

  for (let tentativa = 0; tentativa < MAX_SORTEIOS; tentativa++) {
    const sorteado =
      Math.floor(Math.random() * (maximo - ID_MINIMO + 1)) + ID_MINIMO;

    const resultado = await consultarApi(String(sorteado));

    if (minhaBusca !== numeroDaBusca) {
      return;
    }

    if (resultado.estado === "ok") {
      ocuparControles(false);
      mostrarMensagem("");
      atualizarCartao(resultado.dados);
      return;
    }

    if (resultado.estado !== "inexistente") {
      ocuparControles(false);
      mostrarMensagem(mensagemDeFalha(resultado));
      return;
    }
  }

  ocuparControles(false);
  mostrarMensagem("Não consegui sortear um Digimon válido. Tente novamente.");
}

function iniciarNavegacao() {
  const anterior = document.querySelector("#btn-anterior");
  const proximo = document.querySelector("#btn-proximo");
  const surpresa = document.querySelector("#btn-surpreenda");

  if (!anterior || !proximo || !surpresa) {
    return;
  }

  anterior.addEventListener("click", irParaAnterior);
  proximo.addEventListener("click", irParaProximo);
  surpresa.addEventListener("click", surpreender);

  descobrirLimite();
}

// FAVORITOS

function adicionarFavorito(nome) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (!favoritos.includes(nome)) {
    favoritos.push(nome);

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    alert(nome + " foi adicionado aos favoritos!");
  } else {
    alert(nome + " já está nos favoritos!");
  }
}

// REMOVER FAVORITO

function removerFavorito(nome) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  favoritos = favoritos.filter(function (item) {
    return item !== nome;
  });

  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  mostrarFavoritos();
}

// MOSTRAR FAVORITOS

function mostrarFavoritos() {
  const lista = document.querySelector("#lista-favoritos");

  if (!lista) {
    return;
  }

  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  lista.innerHTML = "";

  if (favoritos.length === 0) {
    lista.innerHTML = "<p>Você ainda não possui favoritos.</p>";

    return;
  }

  favoritos.forEach(function (nome) {
    const div = document.createElement("div");

    div.className = "digimon";

    div.innerHTML = `
            <div class="imagem">
                Imagem
            </div>

            <h2>${nome}</h2>

            <button onclick="removerFavorito('${nome}')">
                Remover
            </button>
        `;

    lista.appendChild(div);
  });
}

// FILTRO

function filtrarTipo(tipo) {
  const cards = document.querySelectorAll(".digimon");

  cards.forEach(function (card) {
    const tipoDigimon = card.dataset.tipo;

    if (tipo === "todos" || tipoDigimon === tipo) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// TEMA CLARO

function temaClaro() {
  document.body.style.backgroundColor = "#f2f2f2";
  document.body.style.color = "#222";

  localStorage.setItem("tema", "claro");
}

// TEMA ESCURO

function temaEscuro() {
  document.body.style.backgroundColor = "#222";
  document.body.style.color = "white";

  localStorage.setItem("tema", "escuro");
}

// CARREGAR TEMA

function carregarTema() {
  const tema = localStorage.getItem("tema");

  if (tema === "escuro") {
    temaEscuro();
  } else {
    temaClaro();
  }
}

// ESTATÍSTICAS

function carregarEstatisticas() {
  const total = document.querySelector("#total");

  if (total) {
    total.textContent = digimons.length;
  }

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  const totalFavoritos = document.querySelector("#total-favoritos");

  if (totalFavoritos) {
    totalFavoritos.textContent = favoritos.length;
  }
}

// EXECUTAR AO ABRIR A PÁGINA

carregarTema();

mostrarFavoritos();

carregarEstatisticas();

iniciarPesquisa();

iniciarNavegacao();
