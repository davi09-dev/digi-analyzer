// Lista de Digimons

const digimons = [
    {
        nome: "Agumon",
        tipo: "Réptil",
        nivel: "Novato",
        atributo: "Vacina"
    },

    {
        nome: "Gabumon",
        tipo: "Réptil",
        nivel: "Novato",
        atributo: "Dados"
    },

    {
        nome: "Patamon",
        tipo: "Mamífero",
        nivel: "Novato",
        atributo: "Dados"
    }
];


// PESQUISA NA DIGI-API

const URL_DIGI_API = "https://digi-api.com/api/v1/digimon/";

// Conta as buscas feitas. Se uma resposta antiga chegar depois de uma
// busca mais nova, ela é ignorada e não sobrescreve o cartão.
let numeroDaBusca = 0;


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
        .map(function(item) {
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

    img.onerror = function() {
        caixa.textContent = "Sem imagem";
    };

    img.src = url;

    caixa.appendChild(img);
}


// Preenche o cartão existente com os dados recebidos
function atualizarCartao(digimon) {

    document.querySelector("#cartao-nome").textContent = digimon.name;

    document.querySelector("#cartao-id").textContent =
        "ID: " + digimon.id;

    document.querySelector("#cartao-nivel").textContent =
        "Nível: " + listarCampo(digimon.levels, "level");

    document.querySelector("#cartao-tipo").textContent =
        "Tipo: " + listarCampo(digimon.types, "type");

    document.querySelector("#cartao-atributo").textContent =
        "Atributo: " + listarCampo(digimon.attributes, "attribute");

    const primeiraImagem =
        Array.isArray(digimon.images) ? digimon.images[0] : null;

    mostrarImagem(
        primeiraImagem ? primeiraImagem.href : "",
        digimon.name
    );

    document.querySelector("#cartao-favorito").onclick = function() {
        adicionarFavorito(digimon.name);
    };

    document.querySelector("#cartao").hidden = false;
}


// Busca na API (serve para nome e para ID, só muda o final do endereço)
async function buscarDigimon(consulta, descricao) {

    numeroDaBusca++;

    const minhaBusca = numeroDaBusca;

    esconderCartao();
    mostrarMensagem("Buscando...");

    try {

        const resposta =
            await fetch(URL_DIGI_API + encodeURIComponent(consulta));

        if (minhaBusca !== numeroDaBusca) {
            return;
        }

        if (resposta.status === 404 || resposta.status === 400) {
            mostrarMensagem(
                "Nenhum Digimon encontrado com " + descricao + "."
            );
            return;
        }

        if (!resposta.ok) {
            mostrarMensagem(
                "A Digi-API não respondeu como esperado (código " +
                resposta.status + "). Tente novamente."
            );
            return;
        }

        const dados = await resposta.json();

        if (minhaBusca !== numeroDaBusca) {
            return;
        }

        if (!dados || dados.id === undefined || !dados.name) {
            mostrarMensagem(
                "Nenhum Digimon encontrado com " + descricao + "."
            );
            return;
        }

        mostrarMensagem("");
        atualizarCartao(dados);

    } catch (erro) {

        if (minhaBusca !== numeroDaBusca) {
            return;
        }

        mostrarMensagem(
            "Não foi possível acessar a Digi-API. " +
            "Verifique sua conexão e tente novamente."
        );
    }
}


// Entrada inválida: cancela buscas em andamento e avisa o usuário
function rejeitarEntrada(texto) {

    numeroDaBusca++;

    esconderCartao();
    mostrarMensagem(texto);
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
            "Isso parece um número. Para buscar por número, " +
            "use o campo de ID."
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
        rejeitarEntrada(
            "O ID deve ser um número inteiro, usando somente dígitos."
        );
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

    formNome.addEventListener("submit", function(evento) {
        evento.preventDefault();
        pesquisarPorNome();
    });

    formId.addEventListener("submit", function(evento) {
        evento.preventDefault();
        pesquisarPorId();
    });
}


// FAVORITOS

function adicionarFavorito(nome) {

    let favoritos =
        JSON.parse(localStorage.getItem("favoritos")) || [];

    if (!favoritos.includes(nome)) {

        favoritos.push(nome);

        localStorage.setItem(
            "favoritos",
            JSON.stringify(favoritos)
        );

        alert(nome + " foi adicionado aos favoritos!");

    } else {

        alert(nome + " já está nos favoritos!");

    }
}


// REMOVER FAVORITO

function removerFavorito(nome) {

    let favoritos =
        JSON.parse(localStorage.getItem("favoritos")) || [];

    favoritos = favoritos.filter(function(item) {
        return item !== nome;
    });

    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );

    mostrarFavoritos();
}


// MOSTRAR FAVORITOS

function mostrarFavoritos() {

    const lista =
        document.querySelector("#lista-favoritos");

    if (!lista) {
        return;
    }

    let favoritos =
        JSON.parse(localStorage.getItem("favoritos")) || [];

    lista.innerHTML = "";

    if (favoritos.length === 0) {

        lista.innerHTML =
            "<p>Você ainda não possui favoritos.</p>";

        return;
    }

    favoritos.forEach(function(nome) {

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

    const cards =
        document.querySelectorAll(".digimon");

    cards.forEach(function(card) {

        const tipoDigimon =
            card.dataset.tipo;

        if (
            tipo === "todos" ||
            tipoDigimon === tipo
        ) {

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

    const tema =
        localStorage.getItem("tema");

    if (tema === "escuro") {
        temaEscuro();
    } else {
        temaClaro();
    }
}


// ESTATÍSTICAS

function carregarEstatisticas() {

    const total =
        document.querySelector("#total");

    if (total) {
        total.textContent = digimons.length;
    }


    const favoritos =
        JSON.parse(localStorage.getItem("favoritos")) || [];


    const totalFavoritos =
        document.querySelector("#total-favoritos");

    if (totalFavoritos) {
        totalFavoritos.textContent =
            favoritos.length;
    }
}


// EXECUTAR AO ABRIR A PÁGINA

carregarTema();

mostrarFavoritos();

carregarEstatisticas();

iniciarPesquisa();
