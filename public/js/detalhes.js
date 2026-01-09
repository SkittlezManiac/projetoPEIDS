// detalhes.js
// Lógica da página de detalhes de filmes/séries

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const tipo = params.get('tipo'); // "filme" | "serie"
const token = localStorage.getItem('token');

// Elementos da página
const titulo = document.getElementById('titulo');
const sinopse = document.getElementById('sinopse');
const infoBasica = document.getElementById('infoBasica');
const duracao = document.getElementById('duracao');
const ano = document.getElementById('ano');
const generos = document.getElementById('generos');
const diretor = document.getElementById('diretor');
const elenco = document.getElementById('elenco');

const listaReviews = document.getElementById('listaReviews');
const btnFavorito = document.getElementById('btnFavorito');
const btnEnviarReview = document.getElementById('btnEnviarReview');

// =========================
// VALIDAR PARÂMETROS
// =========================
if (!id || !tipo) {
	alert('Item inválido.');
	window.location.href = 'index.html';
}

// =========================
// CARREGAR DETALHES
// =========================
async function carregarDetalhes() {
	try {
		const res = await fetch(`/api/${tipo}s/${id}`);

		if (!res.ok) throw new Error('Erro ao carregar detalhes');

		const data = await res.json();

		titulo.innerText = data.nome;
		sinopse.innerText = data.sinopse;
		duracao.innerText = data.duracao + ' min';
		ano.innerText = data.ano;
		generos.innerText = data.generos.join(', ');
		diretor.innerText = data.diretor;
		elenco.innerText = data.elenco.join(', ');

		infoBasica.innerText = `${data.ano} | ${data.generos.join(' / ')}`;

		carregarReviews();

	} catch (err) {
		console.error(err);
		alert('Erro ao carregar detalhes do conteúdo.');
	}
}

// =========================
// FAVORITOS
// =========================
if (btnFavorito) {
	btnFavorito.addEventListener('click', async () => {
		if (!token) {
			alert('Tens de fazer login para adicionar aos favoritos.');
			return;
		}

		try {
			const res = await fetch('/api/favoritos', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
				body: JSON.stringify({ idItem: id, tipo })
			});

			if (!res.ok) throw new Error('Erro ao adicionar favorito');

			alert('Adicionado aos favoritos ⭐');

		} catch (err) {
			console.error(err);
			alert('Erro ao adicionar aos favoritos.');
		}
	});
}

// =========================
// REVIEWS
// =========================
async function carregarReviews() {
	try {
		const res = await fetch(`/api/reviews/${tipo}/${id}`);

		if (!res.ok) throw new Error('Erro ao carregar reviews');

		const reviews = await res.json();

		listaReviews.innerHTML = '';

		if (reviews.length === 0) {
			listaReviews.innerHTML = '<p>Ainda não existem reviews.</p>';
			return;
		}

		reviews.forEach(r => {
			const div = document.createElement('div');
			div.className = 'review-card';

			div.innerHTML = `
				<p><strong>${r.utilizador}</strong> - ${r.data}</p>
				<p>Classificação: ${r.classificacao} ⭐</p>
				<p>${r.critica}</p>
				<button class="btn-like" data-id="${r.id}">
					👍 Útil (${r.votos})
				</button>
			`;

			div.querySelector('button').addEventListener('click', () => {
				votarUtilidade(r.id);
			});

			listaReviews.appendChild(div);
		});

	} catch (err) {
		console.error(err);
		listaReviews.innerHTML = '<p>Erro ao carregar reviews.</p>';
	}
}

// =========================
// VOTO DE UTILIDADE
// =========================
async function votarUtilidade(idReview) {
	try {
		const res = await fetch('/api/reviews/voto/' + idReview, {
			method: 'POST'
		});

		if (!res.ok) throw new Error('Erro ao votar');

		carregarReviews();

	} catch (err) {
		console.error(err);
		alert('Erro ao votar utilidade.');
	}
}

// =========================
// ENVIAR REVIEW
// =========================
if (btnEnviarReview) {
	btnEnviarReview.addEventListener('click', async () => {
		if (!token) {
			alert('Tens de estar autenticado para escrever reviews.');
			return;
		}

		const texto = document.getElementById('textoReview').value;
		const classificacao = document.getElementById('classificacao').value;

		if (!texto) {
			alert('Escreve uma crítica.');
			return;
		}

		try {
			const res = await fetch('/api/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
				body: JSON.stringify({
					idItem: id,
					tipo,
					critica: texto,
					classificacao
				})
			});

			if (!res.ok) throw new Error('Erro ao enviar review');

			document.getElementById('textoReview').value = '';
			carregarReviews();

		} catch (err) {
			console.error(err);
			alert('Erro ao enviar review.');
		}
	});
}

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
	carregarDetalhes();
});
