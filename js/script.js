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


// PESQUISA

function pesquisar() {

    const campo = document.querySelector("#pesquisa");

    if (!campo) {
        return;
    }

    const texto = campo.value.toLowerCase();

    const cards = document.querySelectorAll(".digimon");

    cards.forEach(function(card) {

        const nome = card.querySelector("h2").textContent.toLowerCase();

        if (nome.includes(texto)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

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