let filmes = [];
let generosMap = {}; // mapa genre_id -> nome do género
let generoSelecionado = "todos";

// carregar filmes da tmdb
async function carregarFilmes() {
	try {
		const resposta = await fetch("/filmes/tmdb/populares");
		filmes = await resposta.json();

		// buscar géneros da base de dados
		await carregarGeneros();

		// construir lista de géneros a partir dos filmes carregados
		construirGeneros(filmes);

		ordenarEExibir(filmes);
	} catch (err) {
		console.error("erro ao carregar filmes:", err);
	}
}

// carregar géneros reais da base de dados
async function carregarGeneros() {
	try {
		const res = await fetch("/filmes/tmdb/generos")
		const generos = await res.json();
		generosMap = {};
		generos.forEach(g => generosMap[g.id] = g.name);
	} catch (err) {
		console.error("erro ao carregar géneros:", err);
	}
}

// construir lista de géneros únicos no select
function construirGeneros(lista) {
	const select = document.getElementById("genreSelect");
	if (!select) return;

	// limpar opções anteriores
	select.innerHTML = `<option value="todos">Todos</option>`;

	// adicionar géneros únicos que aparecem nos filmes
	const idsFilmes = new Set();
	lista.forEach(f => f.genre_ids?.forEach(id => idsFilmes.add(id)));

	idsFilmes.forEach(id => {
		const option = document.createElement("option");
		option.value = id;
		option.textContent = generosMap[id] || `Género ${id}`;
		select.appendChild(option);
	});

	// listener para filtro
	select.addEventListener("change", (e) => {
		generoSelecionado = e.target.value;
		filtrarEExibir();
	});
}

// filtrar filmes por género e ordenar
function filtrarEExibir() {
	let listaFiltrada = [...filmes];

	if (generoSelecionado !== "todos") {
		listaFiltrada = listaFiltrada.filter(f => f.genre_ids?.includes(Number(generoSelecionado)));
	}

	ordenarEExibir(listaFiltrada);
}

// ordenar filmes por título
function ordenarEExibir(lista) {
	const ordenados = [...lista].sort((a, b) =>
		a.title.localeCompare(b.title, "pt", { sensitivity: "base" })
	);
	renderizarFilmes(ordenados);
}

// renderizar filmes no html
function renderizarFilmes(lista) {
	const container = document.getElementById("filmesContainer");
	container.innerHTML = "";

	lista.forEach(filme => {
		const card = document.createElement("div");
		card.className = "movie-card";

		const posterUrl = filme.poster_path
			? `https://image.tmdb.org/t/p/w300${filme.poster_path}`
			: "https://via.placeholder.com/300x450?text=Sem+Imagem";

		card.innerHTML = `
            <img src="${posterUrl}" alt="${filme.title}">
            <div class="movie-info">
                <h4>${filme.title}</h4>
                <p>${filme.release_date ? filme.release_date.slice(0, 4) : "n/a"}</p>
            </div>
        `;

		card.addEventListener("click", () => {
			window.location.href = `detalhes.html?id=${filme.id}&tipo=filme`;
		});

		container.appendChild(card);
	});
}

// pesquisa em tempo real
document.getElementById("searchInput").addEventListener("input", (e) => {
	const termo = e.target.value.toLowerCase().trim();

	let listaFiltrada = filmes.filter(f =>
		f.title.toLowerCase().includes(termo)
	);

	if (generoSelecionado !== "todos") {
		listaFiltrada = listaFiltrada.filter(f => f.genre_ids?.includes(Number(generoSelecionado)));
	}

	ordenarEExibir(listaFiltrada);
});

// inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", carregarFilmes);
