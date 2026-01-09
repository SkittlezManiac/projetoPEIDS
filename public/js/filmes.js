let filmes = [];

// Carregar filmes da API TMDB via Express
async function carregarFilmes() {
	try {
		const resposta = await fetch("/tmdb/populares");
		filmes = await resposta.json();

		ordenarEExibir(filmes);
	} catch (err) {
		console.error("Erro ao carregar filmes:", err);
	}
}

// Ordenar filmes por título
function ordenarEExibir(lista) {
	const ordenados = [...lista].sort((a, b) =>
		a.title.localeCompare(b.title, "pt", { sensitivity: "base" })
	);

	renderizarFilmes(ordenados);
}

// Renderizar filmes no HTML usando mesma estrutura que index.html
function renderizarFilmes(lista) {
	const container = document.getElementById("filmesContainer");
	container.innerHTML = "";

	lista.forEach(filme => {
		const card = document.createElement("div");
		card.className = "movie-card"; // <- usa .movie-card

		const posterUrl = filme.poster_path
			? `https://image.tmdb.org/t/p/w300${filme.poster_path}`
			: "https://via.placeholder.com/300x450?text=Sem+Imagem";

		card.innerHTML = `
			<img src="${posterUrl}" alt="${filme.title}">
			<div class="movie-info">
				<h4>${filme.title}</h4>
				<p>${filme.release_date ? filme.release_date.slice(0, 4) : "N/A"}</p>
			</div>
		`;

		container.appendChild(card);
	});
}

// Pesquisa em tempo real
document.getElementById("searchInput").addEventListener("input", (e) => {
	const termo = e.target.value.toLowerCase().trim();

	if (termo === "") {
		ordenarEExibir(filmes);
		return;
	}

	const filtrados = filmes.filter(f =>
		f.title.toLowerCase().includes(termo)
	);

	ordenarEExibir(filtrados);
});

// Inicializar
carregarFilmes();
