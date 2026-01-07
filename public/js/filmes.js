async function carregarFilmes() {
			const resposta = await fetch('/api/filmes');
			const dados = await resposta.json();
			document.getElementById('output').innerText =
				JSON.stringify(dados, null, 2);
		}