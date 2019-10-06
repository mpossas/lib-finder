import './style.css';

const ajax = new XMLHttpRequest();
// Registrar service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('Registro do ServiceWorker bem sucedido com escopo: ', registration.scope);
    }, function(err) {
      console.log('Registro do ServiceWorker falhou: ', err);
    });
  });
}

// Busca bibliotecas de acordo com o que o usuario digitar
function buscarPacotes(pacote) {
  // Desconsiderar letras maiusculas, minusculas e acentos na pesquisa
  pacote = removerAcentuacao(pacote.toLowerCase());

  ajax.open('GET', `https://api.cdnjs.com/libraries?search=${pacote}&output=human`, true);
  ajax.send();

  loading();
  // Aguardar pelo retorno da requisicao
  ajax.onreadystatechange = () => {
    // Verificar se o status e um "OK"
    if (ajax.readyState == 4 && ajax.status == 200) {
      const data = ajax.responseText;
      // Converter a resposta em Json
      const pacotes = JSON.parse(data.substring(data.indexOf('['), data.indexOf(']') + 1));
      listarPacotes(pacotes);
    }
  }
}

// Lista todos as bibliotecas encontrados
function listarPacotes(pacotes) {
  const content = document.getElementById('content');
  content.innerHTML = '';

  const lista = document.createElement('ul');
  lista.setAttribute('class', 'list-group');

  let item;
  // Adiciona um item na lista para cada biblioteca encontrada
  for (let i = 0; i < pacotes.length; i++) {
    item = document.createElement('li');
    item.setAttribute('id', i);
    
    const itemClass = 'list-group-item d-flex justify-content-between align-items-center list-group-item-action';
    // Adiciona estilos diferentes para itens pares e impares
    (i % 2 == 0) ?  
      item.setAttribute('class', `${itemClass} list-group-item-info`) : 
      item.setAttribute('class', `${itemClass} list-group-item-light`)
    
    item.setAttribute('onclick', 'buscarDetalhes(this.id)');
    item.innerHTML = `${pacotes[i].name} <i class="fas fa-info-circle"></i>`;

    lista.appendChild(item);
  }
  content.appendChild(lista);
}

function buscarDetalhes(idPacote) {
  const pacote = document.getElementById(idPacote).innerText;
  ajax.open('GET', `https://api.cdnjs.com/libraries/${pacote}?fields=name,description,homepage,repository,version,license`);
  ajax.send();
  
  loading();
  // Aguardar pelo retorno da requisicao
  ajax.onreadystatechange = () => {
    // Verificar se o status e um "OK"
    if (ajax.readyState == 4 && ajax.status == 200) {
      const data = ajax.responseText;
      // Converter a resposta em Json
      const pacote = JSON.parse(data);
      exibirDetalhes(pacote);
    }
  }
}

function exibirDetalhes(pacote) {
  const content = document.getElementById('content');
  content.innerHTML = `
  <ul class="list-group list-group-flush">
    <li class="list-group-item">
      <h3>${pacote.name}</h3>
      <h6 class="text-muted">${pacote.description}</h6>
    </li>
    <li class="list-group-item">
      <p><strong>homepage:</strong> ${pacote.homepage}</p>
      <p><strong>repository:</strong> ${pacote.repository.url}</p>
      <p><strong>version:</strong> ${pacote.version} <strong>- license:</strong> ${pacote.license}</p>
    </li>
  </ul>
  `;
}

function loading() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="fa-2x">
      <i class="fas fa-spinner fa-spin"></i>
    </div>`;
}

function removerAcentuacao(texto) {																   
  texto = texto.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
  texto = texto.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
  texto = texto.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
  texto = texto.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
  texto = texto.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
  texto = texto.replace(new RegExp('[Ç]','gi'), 'c');
  return texto;				 
}

window.buscarPacotes = buscarPacotes;
window.buscarDetalhes = buscarDetalhes;