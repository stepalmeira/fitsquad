'use strict';

const grade = document.getElementById('documentos-grid');
const erro = document.getElementById('doc-erro');
const visualizador = document.getElementById('visualizador-pdf');
const pdfFrame = document.getElementById('pdf-frame');
const pdfTitulo = document.getElementById('pdf-titulo');
const pdfDownload = document.getElementById('pdf-download');
const pdfFechar = document.getElementById('pdf-fechar');

let documentos = [];

function criar(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto) e.textContent = texto;
  return e;
}

function abrirPdf(documento) {
  pdfTitulo.textContent = documento.titulo;
  pdfDownload.href = documento.arquivo;
  pdfFrame.src = `${documento.arquivo}#view=FitH`;
  visualizador.showModal();
}

function fecharPdf() {
  visualizador.close();
}

function renderizar() {
  const resultado = documentos;
  grade.replaceChildren();
  if (!resultado.length) {
    grade.append(criar('p', 'vazio', 'Nenhum documento encontrado.'));
    return;
  }

  resultado.forEach((d) => {
    const cartao = criar('article', 'documento-card');
    cartao.append(
      criar('span', 'doc-categoria', d.categoria),
      criar('h2', 'doc-titulo', d.titulo),
      criar('p', 'doc-descricao', d.descricao),
    );

    const rodape = criar('div', 'doc-acoes');
    if (d.arquivo && /^documentos\/[\wÀ-ÿ(). -]+\.pdf$/i.test(d.arquivo)) {
      const ver = criar('button', 'doc-botao primario', 'Visualizar');
      ver.type = 'button';
      ver.addEventListener('click', () => abrirPdf(d));

      const baixar = criar('a', 'doc-botao', 'Baixar ↓');
      baixar.href = d.arquivo;
      baixar.download = '';

      rodape.append(
        ver,
        baixar,
        criar('span', 'doc-meta', `PDF${d.tamanho ? ' · ' + d.tamanho : ''}`),
      );
    } else {
      rodape.append(criar('span', 'em-breve', 'Em preparação'));
    }

    cartao.append(rodape);
    grade.append(cartao);
  });
}

fetch('documentos.json', { cache: 'no-store' })
  .then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then((d) => {
    if (!Array.isArray(d)) throw new Error('Catálogo inválido');
    documentos = d;
    renderizar();
  })
  .catch(() => {
    grade.replaceChildren();
    erro.hidden = false;
    erro.textContent = 'Não foi possível carregar o catálogo. Abra o site via servidor HTTP (GitHub Pages ou Live Server) e confira documentos.json.';
  });

pdfFechar.addEventListener('click', fecharPdf);
visualizador.addEventListener('click', (e) => {
  if (e.target === visualizador) fecharPdf();
});
visualizador.addEventListener('close', () => {
  pdfFrame.src = 'about:blank';
});
