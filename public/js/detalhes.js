const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const tipo = params.get('tipo'); // "filme" | "serie"
const token = localStorage.getItem('token');

// elementos do html
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

// validar parâmetros
if (!id || !tipo) {
	alert('item inválido.');
	window.location.href = 'index.html';
}

// carregar detalhes do filme/serie
async function carregarDetalhes() {
	try {
		const res = await fetch(`/${tipo}s/${id}`);

		if (!res.ok) throw new Error('erro ao carregar detalhes');

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
		alert('erro ao carregar detalhes do conteúdo.');
	}
}

// adicionar aos favoritos
if (btnFavorito) {
	btnFavorito.addEventListener('click', async () => {
		if (!token) {
			alert('tens de fazer login para adicionar aos favoritos.');
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

			if (!res.ok) throw new Error('erro ao adicionar favorito');

			alert('adicionado aos favoritos ⭐');

		} catch (err) {
			console.error(err);
			alert('erro ao adicionar aos favoritos.');
		}
	});
}

// carregar reviews
async function carregarReviews() {
	try {
		const res = await fetch(`/reviews/${tipo}/${id}`);
		if (!res.ok) throw new Error('erro ao carregar reviews');

		const reviews = await res.json();

		listaReviews.innerHTML = '';

		if (reviews.length === 0) {
			listaReviews.innerHTML = '<p>ainda não existem reviews.</p>';
			return;
		}

		reviews.forEach(r => {
			const div = document.createElement('div'); F
			div.className = 'review-card';

			div.innerHTML = `
	<p><strong>${r.nome_utilizador}</strong> - ${r.data_review}</p>
	<p>classificação: ${r.classificacao} ⭐</p>
	<p>${r.critica}</p>
	<button class="btn-like" data-id="${r.id}">
		👍 útil (${r.votos_utilidade})
	</button>
`;
			div.querySelector('button').addEventListener('click', () => {
				votarUtilidade(r.id);
			});

			listaReviews.appendChild(div);
		});

	} catch (err) {
		console.error(err);
		listaReviews.innerHTML = '<p>erro ao carregar reviews.</p>';
	}
}

// votar utilidade de review
async function votarUtilidade(idReview) {
	try {
		const res = await fetch(`/reviews/${idReview}/voto`, {
			method: 'PUT'
		});

		if (!res.ok) throw new Error('erro ao votar');

		carregarReviews();

	} catch (err) {
		console.error(err);
		alert('erro ao votar utilidade.');
	}
}

// enviar review
if (btnEnviarReview) {
	btnEnviarReview.addEventListener('click', async () => {

		const texto = document.getElementById('textoReview').value;
		const classificacao = document.getElementById('classificacao').value;

		if (!texto) {
			alert('escreve uma crítica.');
			return;
		}

		try {
			const res = await fetch('/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					idItem: id,
					tipo,
					critica: texto,
					classificacao
				})
			});

			if (!res.ok) throw new Error('erro ao enviar review');

			document.getElementById('textoReview').value = '';
			carregarReviews();

		} catch (err) {
			console.error(err);
			alert('erro ao enviar review.');
		}
	});
}

// inicializar página
document.addEventListener('DOMContentLoaded', () => {
	carregarDetalhes();
});
