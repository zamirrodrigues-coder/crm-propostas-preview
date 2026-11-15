/* CRM de Propostas: tela (Funil, Empresas e página da Oportunidade). Toda regra mora no servidor;
   aqui só se pede, mostra e avisa. Navegação por endereço: #/funil, #/empresas, #/oportunidade/12. */
(function () {
  'use strict';

  var estado = { eu: null, etapas: {}, ordem: [], busca: '', buscaEmpresas: '' };
  var $ = function (s, r) { return (r || document).querySelector(s); };

  // ---------- peças comuns ----------
  function esc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  var ICONES = {
    funil: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
    empresas: '<path d="M4 20V6l7-3v17M11 9h9v11M7 8h.01M7 12h.01M7 16h.01M15 13h2M15 17h2"/><path d="M2.5 20h19"/>',
    busca: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    voltar: '<path d="M15 18l-6-6 6-6"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    xis: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    whatsapp: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3A8.5 8.5 0 1 1 20.5 11.6z"/><path d="M9.2 8.4c.2-.4.5-.4.8-.4h.4l1 2.2-.8 1c.5 1 1.3 1.8 2.3 2.3l1-.8 2.2 1v.4c0 .3 0 .6-.4.8-1.6.9-4.2-.3-5.6-1.7S8.3 10 9.2 8.4z"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/>',
    local: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    pessoa: '<circle cx="12" cy="7" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5"/>',
    documento: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    abrir: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    editar: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    compartilhar: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    olho: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    olhoRiscado: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.1 6.1A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.9-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'
  };
  function icone(n, cls) { return '<svg class="icone ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONES[n] || '') + '</svg>'; }

  function sigla(nome) {
    var p = String(nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, ' ').split(' ').filter(Boolean);
    return ((p[0] || '?')[0] + (p.length > 1 ? p[1][0] : (p[0] || '')[1] || '')).toUpperCase();
  }
  function dataHora(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  function haQuanto(iso) {
    var dias = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (dias <= 0) return 'Hoje';
    if (dias === 1) return '1 Dia';
    return dias.toLocaleString('pt-BR') + ' Dias';
  }
  function telefone(d) {
    if (!d) return '';
    var n = d.replace(/^55(?=\d{10,11}$)/, '');
    if (n.length === 11) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
    if (n.length === 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
    return d;
  }
  function cnpj(d) { return d && d.length === 14 ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : (d || ''); }
  function linkSite(s) { return /^https?:\/\//i.test(s) ? s : 'https://' + s; }

  var timerAviso = null;
  function aviso(msg, erro) {
    var el = document.getElementById('aviso');
    if (!el) { el = document.createElement('div'); el.id = 'aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.className = 'aviso-flutuante' + (erro ? ' erro' : '');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(function () { el.hidden = true; }, 3400);
  }

  function modal(op) {
    var camada = document.createElement('div');
    camada.className = 'camada centro';
    camada.innerHTML = '<div class="modal ' + (op.classe || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(op.titulo) + '">' +
      '<div class="modal-cab"><h3>' + esc(op.titulo) + '</h3>' + (op.subtitulo ? '<p>' + esc(op.subtitulo) + '</p>' : '') + '</div>' +
      '<form class="modal-form" novalidate><div class="modal-corpo">' + op.corpo + '<p class="entrada-erro" data-erro role="alert"></p></div>' +
      '<div class="modal-acoes">' + (op.obrigatorio ? '' : '<button type="button" class="btn btn-leve" data-cancelar>Cancelar</button>') +
      '<button type="submit" class="btn btn-primario">' + esc(op.botao) + '</button></div></form></div>';
    function fechar() { camada.remove(); document.removeEventListener('keydown', tecla); }
    function tecla(ev) { if (ev.key === 'Escape' && !op.obrigatorio) fechar(); }
    camada.addEventListener('mousedown', function (ev) { if (ev.target === camada && !op.obrigatorio) fechar(); });
    if (!op.obrigatorio) $('[data-cancelar]', camada).addEventListener('click', fechar);
    $('form', camada).addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = $('button[type=submit]', camada), erro = $('[data-erro]', camada);
      btn.disabled = true; erro.textContent = '';
      Promise.resolve(op.enviar(camada)).then(function () { fechar(); })
        .catch(function (e) { erro.textContent = e.message; btn.disabled = false; });
    });
    document.addEventListener('keydown', tecla);
    document.body.appendChild(camada);
    var primeiro = $('input, select, textarea', camada);
    if (primeiro) setTimeout(function () { primeiro.focus(); }, 30);
    return camada;
  }

  // ---------- conversa com o servidor ----------
  function api(metodo, rota, corpo) {
    var op = { method: metodo, credentials: 'same-origin', headers: { 'X-CRM': '1' } };
    if (corpo !== undefined) { op.headers['Content-Type'] = 'application/json'; op.body = JSON.stringify(corpo); }
    return fetch('/crm/api' + rota, op).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && rota !== '/entrar' && rota !== '/trocar-senha') { mostrarEntrada(); }
        if (r.status === 403 && j.erro && j.erro.codigo === 'trocar_senha') { trocarSenha(true); }
        if (!r.ok) { var e = new Error((j.erro && j.erro.mensagem) || 'Algo falhou. Tente de novo.'); e.dados = j.erro || {}; e.http = r.status; throw e; }
        return j.dados;
      });
    }, function () { throw new Error('Sem conexão com o servidor.'); });
  }

  // ---------- senha com o olho (entrada e troca de senha) ----------
  var OLHO_BTN = '<button type="button" class="olho" aria-label="Mostrar Senha" title="Mostrar Senha">' + icone('olho') + '</button>';
  function verSenha(btn, ver) {
    btn.previousElementSibling.type = ver ? 'text' : 'password';
    btn.innerHTML = icone(ver ? 'olhoRiscado' : 'olho');
    btn.setAttribute('aria-label', ver ? 'Esconder Senha' : 'Mostrar Senha');
    btn.title = btn.getAttribute('aria-label');
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('.olho');
    if (b) { ev.preventDefault(); verSenha(b, b.previousElementSibling.type === 'password'); }
  });
  verSenha($('#entrada .olho'), false);

  // ---------- entrada e estrutura ----------
  function mostrarEntrada() {
    $('#app').hidden = true;
    $('#entrada').hidden = false;
    $('#usuario-menu').hidden = true;
    verSenha($('#entrada .olho'), false);
    document.querySelectorAll('.camada').forEach(function (c) { c.remove(); });
    setTimeout(function () { $('#entrada-email').focus(); }, 30);
  }
  $('#entrada-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('#entrada-btn'), erro = $('#entrada-erro');
    btn.disabled = true; erro.textContent = '';
    api('POST', '/entrar', { email: $('#entrada-email').value, senha: $('#entrada-senha').value })
      .then(function () { $('#entrada-senha').value = ''; iniciar(); })
      .catch(function (e) { erro.textContent = e.message; })
      .then(function () { btn.disabled = false; });
  });

  var TELAS = {
    funil: { titulo: 'Funil', desc: 'Oportunidades por etapa. Arraste o cartão para mudar a etapa.', icone: 'funil' },
    propostas: { titulo: 'Propostas', desc: 'Uma linha por proposta de cliente. As versões ficam dentro de cada proposta.', icone: 'documento' },
    empresas: { titulo: 'Empresas', desc: 'Cadastro das empresas e dos contatos.', icone: 'empresas' }
  };
  function menu(atual) {
    var h = Object.keys(TELAS).map(function (id) {
      return '<button type="button" data-ir="' + id + '" class="' + (id === atual ? 'ativo' : '') + '"' + (id === atual ? ' aria-current="page"' : '') + '>' + icone(TELAS[id].icone) + '<span class="rot">' + esc(TELAS[id].titulo) + '</span></button>';
    }).join('');
    $('#nav').innerHTML = h;
    $('#nav-baixo').innerHTML = h;
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-ir]');
    if (b) location.hash = '#/' + b.getAttribute('data-ir');
  });
  var pino = $('#nav-pino');
  function aplicarPino(fixo) { $('#app').classList.toggle('nav-fixo', fixo); pino.setAttribute('aria-pressed', fixo ? 'true' : 'false'); }
  pino.addEventListener('click', function () {
    var fixo = !$('#app').classList.contains('nav-fixo');
    aplicarPino(fixo);
    try { localStorage.setItem('crm-nav-fixo', fixo ? '1' : '0'); } catch (e) { /* sem armazenamento, só não lembra */ }
  });
  try { aplicarPino(localStorage.getItem('crm-nav-fixo') === '1'); } catch (e) { /* idem */ }

  $('#usuario-btn').addEventListener('click', function (ev) {
    ev.stopPropagation();
    var m = $('#usuario-menu'), r = ev.currentTarget.getBoundingClientRect();
    m.hidden = !m.hidden;
    m.style.top = (r.bottom + 6) + 'px';
    m.style.right = (window.innerWidth - r.right) + 'px';
  });
  document.addEventListener('click', function (ev) { if (!ev.target.closest('#usuario-menu')) $('#usuario-menu').hidden = true; });
  // troca de senha: obrigatória enquanto a senha for provisória; depois, pelo menu da conta
  var trocandoSenha = false;
  function trocarSenha(obrigatorio) {
    if (trocandoSenha) return;
    trocandoSenha = true;
    $('#usuario-menu').hidden = true;
    var camada = modal({
      titulo: obrigatorio ? 'Crie a Sua Senha' : 'Trocar Senha', botao: 'Salvar Senha', obrigatorio: obrigatorio,
      subtitulo: obrigatorio ? 'Este é o primeiro acesso, com senha provisória. Escolha a sua senha para continuar.' : 'Depois de trocar, as outras sessões abertas são encerradas.',
      corpo: '<label class="campo"><span>' + (obrigatorio ? 'Senha Provisória' : 'Senha Atual') + '</span><span class="senha"><input type="password" name="atual" autocomplete="current-password" required>' + OLHO_BTN + '</span></label>' +
        '<label class="campo"><span>Nova Senha</span><span class="senha"><input type="password" name="nova" autocomplete="new-password" minlength="6" required>' + OLHO_BTN + '</span><small>Pelo menos 6 caracteres.</small></label>' +
        '<label class="campo"><span>Repita a Nova Senha</span><span class="senha"><input type="password" name="repete" autocomplete="new-password" required>' + OLHO_BTN + '</span></label>',
      enviar: function (c) {
        var nova = $('[name=nova]', c).value;
        if (nova !== $('[name=repete]', c).value) return Promise.reject(new Error('As duas senhas novas não são iguais.'));
        return api('POST', '/trocar-senha', { atual: $('[name=atual]', c).value, nova: nova }).then(function () {
          aviso('Senha trocada.');
          if (obrigatorio) iniciar();
        });
      }
    });
    var obs = new MutationObserver(function () { if (!camada.isConnected) { trocandoSenha = false; obs.disconnect(); } });
    obs.observe(document.body, { childList: true });
  }
  $('#acao-trocar-senha').addEventListener('click', function () { trocarSenha(false); });

  $('#acao-sair').addEventListener('click', function () {
    api('POST', '/sair', {}).catch(function () { }).then(mostrarEntrada);
  });

  function cabecalho(id, acoes) {
    var t = TELAS[id];
    $('#titulo-tela').textContent = t.titulo;
    $('#desc-tela').textContent = t.desc;
    $('#icone-tela').innerHTML = icone(t.icone);
    $('#topo-acoes').innerHTML = acoes || '';
    document.title = t.titulo + ' | CRM de Propostas';
    menu(id);
  }

  // ---------- Funil ----------
  var TRILHA = ['em_contato', 'proposta_enviada', 'ganho'];
  var LATERAIS = { futuro: 'chip-alerta', frio: 'chip-frio', perdido: 'chip-perigo' };
  function cartao(o) {
    var outras = estado.ordem.filter(function (e) { return e !== o.etapa; });
    var contato = [o.contato_nome, o.contato_cargo].filter(Boolean).join(', ');
    var local = [o.cidade, o.segmento].filter(Boolean).join(' · ');
    return '<div class="card" draggable="true" data-id="' + o.id + '" tabindex="0">' +
      '<div class="linha1"><span class="nome-c">' + esc(o.empresa) + '</span></div>' +
      (contato ? '<div class="contato-c">' + esc(contato) + '</div>' : '') +
      (local ? '<div class="assunto">' + esc(local) + '</div>' : '') +
      '<div class="rodape-c"><span class="acao">Oportunidade ' + o.id + '</span><span class="tempo" title="Tempo na etapa">' + icone('relogio', 'icone-p') + ' ' + esc(haQuanto(o.etapa_em)) + '</span></div>' +
      '<div class="mover-mobile"><select data-mover="' + o.id + '" aria-label="Mover para"><option value="">Mover para...</option>' +
      outras.map(function (e) { return '<option value="' + e + '">' + esc(estado.etapas[e]) + '</option>'; }).join('') + '</select></div></div>';
  }

  function telaFunil() {
    cabecalho('funil', '<button type="button" class="btn btn-primario" id="nova-op" aria-label="Nova Oportunidade">' + icone('mais', 'icone-p') + '<span class="btn-rot">Nova Oportunidade</span></button>');
    $('#nova-op').addEventListener('click', novaOportunidade);
    var raiz = $('#tela');
    raiz.innerHTML = '<div class="vazio">Carregando</div>';
    api('GET', '/oportunidades').then(function (lista) {
      var b = estado.busca.toLowerCase();
      var vis = lista.filter(function (o) { return !b || (o.empresa + ' ' + (o.contato_nome || '') + ' ' + (o.cidade || '')).toLowerCase().indexOf(b) >= 0; });
      // no celular o Funil mostra uma etapa por vez, escolhida nas abas (no computador as abas não aparecem)
      if (!estado.etapas[estado.etapaCel]) estado.etapaCel = estado.ordem[0];
      var abas = '';
      var colunas = estado.ordem.map(function (e) {
        var daEtapa = vis.filter(function (o) { return o.etapa === e; });
        var cls = e === 'ganho' ? ' fim-ganho' : e === 'perdido' ? ' fim-perdido' : e === 'futuro' ? ' lado-futuro' : e === 'frio' ? ' lado-frio' : '';
        abas += '<button type="button" role="tab" data-aba="' + e + '" aria-selected="' + (e === estado.etapaCel) + '">' + esc(estado.etapas[e]) + '<span class="qtd">' + daEtapa.length.toLocaleString('pt-BR') + '</span></button>';
        return '<div class="coluna' + cls + (e === estado.etapaCel ? ' na-aba' : '') + '" data-etapa="' + e + '"><div class="coluna-cab"><h4>' + esc(estado.etapas[e]) + '</h4><span class="qtd">' + daEtapa.length.toLocaleString('pt-BR') + '</span></div>' +
          '<div class="coluna-cartoes">' + (daEtapa.map(cartao).join('') || '<div class="vazio vazio-coluna">Nenhuma Oportunidade</div>') + '</div></div>';
      }).join('');
      var manter = document.activeElement && document.activeElement.id === 'funil-busca';
      raiz.innerHTML = '<div class="barra-filtros"><label class="pilula pilula-busca">' + icone('busca') +
        '<input type="search" id="funil-busca" placeholder="Buscar por empresa, contato ou cidade" aria-label="Buscar por empresa, contato ou cidade" value="' + esc(estado.busca) + '"></label>' +
        (estado.busca ? '<button type="button" class="limpar" id="funil-limpar">Limpar</button>' : '') +
        '<span class="dica-arrastar filtro-conta">' + vis.length.toLocaleString('pt-BR') + (vis.length === 1 ? ' oportunidade' : ' oportunidades') + '</span></div>' +
        '<div class="funil-abas" role="tablist" aria-label="Etapas do Funil">' + abas + '</div>' +
        '<div class="quadro">' + colunas + '</div>';
      ligarFunil(raiz, manter);
    }).catch(function (e) { raiz.innerHTML = '<div class="vazio">' + esc(e.message) + '</div>'; });
  }

  function ligarFunil(raiz, manter) {
    var busca = $('#funil-busca', raiz);
    if (manter) { busca.focus(); busca.setSelectionRange(busca.value.length, busca.value.length); }
    var t = null;
    busca.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { estado.busca = busca.value; telaFunil(); }, 200); });
    var limpar = $('#funil-limpar', raiz);
    if (limpar) limpar.addEventListener('click', function () { estado.busca = ''; telaFunil(); });
    var abaAtiva = raiz.querySelector('.funil-abas [aria-selected="true"]');
    if (abaAtiva) abaAtiva.scrollIntoView({ block: 'nearest', inline: 'center' });
    raiz.querySelectorAll('[data-aba]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.etapaCel = b.getAttribute('data-aba');
        raiz.querySelectorAll('[data-aba]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        raiz.querySelectorAll('.coluna').forEach(function (c) { c.classList.toggle('na-aba', c.getAttribute('data-etapa') === estado.etapaCel); });
        b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
    });
    raiz.querySelectorAll('.card').forEach(function (el) {
      el.addEventListener('click', function (ev) { if (!ev.target.closest('select')) location.hash = '#/oportunidade/' + el.getAttribute('data-id'); });
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && ev.target === el) location.hash = '#/oportunidade/' + el.getAttribute('data-id'); });
      el.addEventListener('dragstart', function (ev) { ev.dataTransfer.setData('text/plain', el.getAttribute('data-id')); ev.dataTransfer.effectAllowed = 'move'; el.classList.add('arrastando'); });
      el.addEventListener('dragend', function () { el.classList.remove('arrastando'); });
    });
    raiz.querySelectorAll('[data-mover]').forEach(function (s) {
      s.addEventListener('click', function (ev) { ev.stopPropagation(); });
      s.addEventListener('change', function () { if (s.value) mover(s.getAttribute('data-mover'), s.value, telaFunil); });
    });
    raiz.querySelectorAll('.coluna').forEach(function (col) {
      col.addEventListener('dragover', function (ev) { ev.preventDefault(); col.classList.add('alvo'); });
      col.addEventListener('dragleave', function (ev) { if (!col.contains(ev.relatedTarget)) col.classList.remove('alvo'); });
      col.addEventListener('drop', function (ev) {
        ev.preventDefault(); col.classList.remove('alvo');
        var id = ev.dataTransfer.getData('text/plain'), card = raiz.querySelector('.card[data-id="' + id + '"]');
        if (id && card && card.closest('.coluna') !== col) mover(id, col.getAttribute('data-etapa'), telaFunil);
      });
    });
  }

  function mover(id, etapa, depois) {
    return api('POST', '/oportunidades/' + id + '/etapa', { etapa: etapa })
      .then(function (o) { aviso(o.empresa.nome + ' foi para ' + estado.etapas[o.etapa] + '.'); })
      .catch(function (e) { aviso(e.message, true); })
      .then(depois);
  }

  function novaOportunidade() {
    api('GET', '/empresas').then(function (lista) {
      var opcoes = lista.map(function (e) { return '<option value="' + esc(e.nome) + '">'; }).join('');
      modal({
        titulo: 'Nova Oportunidade', subtitulo: 'Basta o nome da empresa. Se ela ainda não existir, o cadastro é criado junto.', botao: 'Criar Oportunidade',
        corpo: '<label class="campo"><span>Nome da Empresa</span><input type="text" name="empresa" maxlength="160" list="lista-empresas" autocomplete="off" required>' +
          '<small>Comece a digitar para escolher uma empresa já cadastrada.</small></label><datalist id="lista-empresas">' + opcoes + '</datalist>',
        enviar: function (c) {
          return api('POST', '/oportunidades', { empresa_nome: $('[name=empresa]', c).value }).then(function (o) {
            var em = estado.etapas[o.etapa];
            aviso(o.empresa_criada ? 'Empresa ' + o.empresa.nome + ' cadastrada e oportunidade criada em ' + em + '.' : 'Oportunidade criada em ' + em + ' para ' + o.empresa.nome + '.');
            telaFunil();
          });
        }
      });
    }).catch(function (e) { aviso(e.message, true); });
  }

  // ---------- Propostas ----------
  var moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var SITUACAO = { em_aberto: ['Em Aberto', 'chip-neutro'], assinada: ['Assinada', 'chip-ok'], vencida: ['Vencida', 'chip-perigo'] };
  // em produção o CRM fica em infratecno.com.br e o cliente recebe o link pelo endereço próprio das propostas;
  // na bancada local o link segue o próprio endereço
  var ORIGEM_PUBLICA = /(^|\.)infratecno\.com\.br$/.test(location.hostname) ? 'https://propostas.infratecno.com.br' : location.origin;
  function linkPublico(codigo) { return ORIGEM_PUBLICA + '/p/' + codigo; }
  // versões = revisões publicadas; o link principal é o que o cliente recebe e sempre mostra a versão atual
  function nomeVersao(l, p) {
    var rev = l.codigo.slice(p.codigo.length).replace(/^-/, '');
    return rev ? 'Revisão ' + rev.replace(/^rev/i, '') : 'Versão Única';
  }
  function versoes(p) {
    var principal = p.links.filter(function (l) { return l.principal; })[0];
    var revs = p.links.filter(function (l) { return !l.principal; });
    if (!revs.length && principal) revs = [principal];
    var atual = revs.filter(function (l) { return principal && l.versao === principal.versao; })[0] || revs[revs.length - 1];
    return { principal: principal, lista: revs, atual: atual };
  }
  function copiar(texto) {
    // tenta a área de transferência moderna; se o navegador recusar, cai no método antigo
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto).catch(function () { return copiarAntigo(texto); });
    return copiarAntigo(texto);
  }
  function copiarAntigo(texto) {
    return new Promise(function (ok, falha) {
      var t = document.createElement('textarea');
      t.value = texto; t.setAttribute('readonly', ''); t.className = 'fora-da-tela';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? ok() : falha(); } catch (e) { falha(e); }
      t.remove();
    });
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-copiar]');
    if (!b) return;
    copiar(b.getAttribute('data-copiar')).then(function () { aviso('Link copiado.'); }, function () { aviso('Não foi possível copiar. Selecione o link e copie.', true); });
  });
  // no celular, Compartilhar abre a lista do aparelho (WhatsApp, e-mail) já com o link; no computador o botão não aparece
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-compartilhar]');
    if (!b) return;
    navigator.share({ title: b.getAttribute('data-titulo') || 'Proposta Comercial', url: b.getAttribute('data-compartilhar') })
      .catch(function (e) { if (e && e.name !== 'AbortError') aviso('Não foi possível compartilhar. Use Copiar Link.', true); });
  });
  function botoesLink(url, titulo, semCompartilhar) {
    return (navigator.share && !semCompartilhar ? '<button type="button" class="btn btn-p btn-primario so-celular" data-compartilhar="' + esc(url) + '" data-titulo="' + esc(titulo || '') + '">' + icone('compartilhar', 'icone-p') + 'Compartilhar</button>' : '') +
      '<a class="btn btn-p" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + icone('abrir', 'icone-p') + 'Ver Como o Cliente</a>' +
      '<button type="button" class="btn btn-p" data-copiar="' + esc(url) + '">' + icone('copiar', 'icone-p') + 'Copiar Link</button>';
  }
  function chipSituacao(p) {
    var s = SITUACAO[p.situacao] || [p.situacao, 'chip-neutro'];
    return '<span class="chip ' + s[1] + '">' + esc(s[0]) + '</span>';
  }
  function validade(p) { return p.valida_ate ? new Date(p.valida_ate).toLocaleDateString('pt-BR') : 'Sem Validade'; }

  // lista: uma linha por proposta de cliente; as versões ficam dentro da proposta
  function telaPropostas() {
    cabecalho('propostas');
    var raiz = $('#tela');
    raiz.innerHTML = '<div class="vazio">Carregando</div>';
    api('GET', '/propostas').then(function (lista) {
      var linhas = lista.map(function (p) {
        var v = versoes(p), n = v.lista.length;
        return '<tr class="clicavel" data-proposta="' + esc(p.codigo) + '" tabindex="0"><td><strong>' + esc(p.cliente) + '</strong><small>' + (p.numero ? esc(p.numero) + ' · ' : '') + esc(p.titulo || p.codigo) + '</small></td>' +
          '<td>' + n.toLocaleString('pt-BR') + (n === 1 ? ' Versão' : ' Versões') + (v.atual ? '<small>Atual: ' + esc(nomeVersao(v.atual, p)) + '</small>' : '') + '</td>' +
          '<td class="some-celular">' + (p.oportunidade ? esc(p.oportunidade.empresa) + '<small>' + esc(estado.etapas[p.oportunidade.etapa] || '') + '</small>' : '<span class="op-nada">Sem Vínculo</span>') + '</td>' +
          '<td class="some-celular">' + esc(validade(p)) + '</td><td>' + chipSituacao(p) + '</td></tr>';
      }).join('');
      raiz.innerHTML = '<div class="barra-filtros"><span class="filtro-conta">' + lista.length.toLocaleString('pt-BR') + (lista.length === 1 ? ' proposta' : ' propostas') + '</span></div>' +
        (lista.length ? '<div class="tabela-cartao tabela-rolagem"><table class="tabela"><thead><tr><th>Cliente</th><th>Versões</th><th class="some-celular">Oportunidade</th><th class="some-celular">Válida até</th><th>Situação</th></tr></thead><tbody>' + linhas + '</tbody></table></div>'
          : '<div class="vazio">Nenhuma proposta publicada.</div>');
      raiz.querySelectorAll('[data-proposta]').forEach(function (tr) {
        var abrir = function () { location.hash = '#/proposta/' + tr.getAttribute('data-proposta'); };
        tr.addEventListener('click', abrir);
        tr.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') abrir(); });
      });
    }).catch(function (e) { raiz.innerHTML = '<div class="vazio">' + esc(e.message) + '</div>'; });
  }

  // página da proposta: link do cliente, versões e assinatura
  function telaProposta(codigo) {
    var antiga = $('.op-camada');
    api('GET', '/propostas').then(function (lista) {
      var p = lista.filter(function (x) { return x.codigo === codigo; })[0];
      if (!p) { aviso('Proposta não encontrada.', true); location.hash = '#/propostas'; return; }
      if (antiga) antiga.remove();
      var v = versoes(p), a = p.assinatura;
      var assinadaEm = a ? v.lista.filter(function (l) { return l.versao === a.versao; })[0] : null;
      var camada = document.createElement('div');
      camada.className = 'op-camada';
      camada.setAttribute('role', 'region');
      camada.setAttribute('aria-label', 'Proposta de ' + p.cliente);
      camada.innerHTML = '<div class="op-cab">' +
        '<button type="button" class="op-voltar" id="pr-voltar" aria-label="Voltar às Propostas" title="Voltar às Propostas">' + icone('voltar') + '</button>' +
        '<span class="op-sigla" aria-hidden="true">' + esc(sigla(p.cliente)) + '</span>' +
        '<div class="op-id"><div class="op-nome"><h1>' + esc(p.cliente) + '</h1>' + chipSituacao(p) + '</div>' +
        '<div class="op-sub">' + esc(p.titulo || p.codigo) + '<span class="sep">·</span>' + (p.situacao === 'vencida' ? 'Venceu em ' : 'Válida até ') + esc(validade(p)) + '</div></div></div>' +
        '<div class="op-corpo"><div class="op-geral"><div class="op-principal">' +
        '<div class="op-card"><h3>Versões</h3><div class="proposta-links">' + v.lista.slice().reverse().map(function (l) {
          var url = linkPublico(l.codigo);
          return '<div class="proposta-link"><div class="proposta-link-txt"><strong>' + esc(nomeVersao(l, p)) +
            (l === v.atual ? ' <span class="chip chip-ok">Atual</span>' : '') + (assinadaEm === l ? ' <span class="chip chip-ok">Assinada</span>' : '') +
            '</strong><small>' + esc(url) + '</small></div>' + botoesLink(url, p.titulo, l !== v.atual) + '</div>';
        }).join('') + '</div></div>' +
        '</div><div class="op-lado">' +
        (v.principal ? '<div class="op-card"><h3>Link do Cliente</h3><p class="op-nada">É o link que o cliente recebe. Sempre mostra a versão atual' + (v.atual ? ' (' + esc(nomeVersao(v.atual, p)) + ')' : '') + '.</p>' +
          '<div class="proposta-link"><div class="proposta-link-txt"><small>' + esc(linkPublico(v.principal.codigo)) + '</small></div>' + botoesLink(linkPublico(v.principal.codigo), p.titulo) + '</div></div>' : '') +
        '<div class="op-card"><h3>Oportunidade</h3>' + (p.oportunidade ? '<a class="op-link" href="#/oportunidade/' + p.oportunidade.id + '">' + esc(p.oportunidade.empresa) + ', Oportunidade ' + p.oportunidade.id + '</a>' +
          '<div class="op-nada">Etapa: ' + esc(estado.etapas[p.oportunidade.etapa] || '') + '</div>' : '<div class="op-nada">Sem vínculo. Vincule pela página da oportunidade.</div>') + '</div>' +
        '<div class="op-card"><h3>Assinatura</h3>' + (a ? '<div class="op-linhas">' +
          '<div class="op-linha">' + icone('pessoa') + '<span class="rot">Assinada por</span><span class="val">' + esc(a.nome) + '<small>' + esc(dataHora(a.quando)) + '</small></span></div>' +
          '<div class="op-linha">' + icone('documento') + '<span class="rot">Valor</span><span class="val">' + esc(moeda.format(a.mensal)) + ' por mês<small>' + esc(moeda.format(a.implantacao)) + ' de implantação</small></span></div>' +
          (a.plano ? '<div class="op-linha">' + icone('check') + '<span class="rot">Plano</span><span class="val">' + esc(a.plano) + '</span></div>' : '') + '</div>'
          : '<div class="op-nada">Ainda não assinada.</div>') + '</div>' +
        '</div></div></div>';
      $('#app').appendChild(camada);
      menu('propostas');
      document.title = 'Proposta ' + p.cliente + ' | CRM de Propostas';
      $('#pr-voltar', camada).addEventListener('click', function () { location.hash = '#/propostas'; });
    }).catch(function (e) { aviso(e.message, true); });
  }

  // card Propostas da oportunidade: as geradas aqui (Gerar, Editar, Prévia, Publicar, Nova Revisão) e as fixas vinculadas
  var MOLDE = null;
  function molde() { return MOLDE ? Promise.resolve(MOLDE) : api('GET', '/molde').then(function (m) { MOLDE = m; return m; }); }
  var ROT_GERADA = { rascunho: ['Rascunho', 'chip-alerta'], publicada: ['Publicada', 'chip-neutro'], assinada: ['Assinada', 'chip-ok'], cancelada: ['Cancelada', 'chip-perigo'] };
  function dataCurta(ymdOuIso) { if (!ymdOuIso) return ''; var d = /^\d{4}-\d{2}-\d{2}$/.test(ymdOuIso) ? new Date(ymdOuIso + 'T12:00:00') : new Date(ymdOuIso); return d.toLocaleDateString('pt-BR'); }

  function situacaoGerada(p) {
    if (p.status === 'cancelada' || p.status === 'assinada') return p.status;
    return p.revisoes.some(function (r) { return r.status === 'publicada'; }) ? 'publicada' : 'rascunho';
  }

  function blocoGerada(p, o) {
    var st = situacaoGerada(p), rot = ROT_GERADA[st];
    var rasc = p.revisoes.filter(function (r) { return r.status === 'rascunho'; })[0];
    var pub = p.revisoes.filter(function (r) { return r.status === 'publicada'; })[0];
    var url = linkPublico(p.codigo);
    var revs = p.revisoes.slice().reverse().map(function (r) {
      return 'Revisão ' + String(r.revisao).padStart(2, '0') + (r.status === 'publicada' ? ' publicada em ' + dataCurta(r.publicada_em) : ' em rascunho');
    }).join(' · ');
    var acoes = '';
    if (p.status === 'ativa' && rasc) {
      acoes += '<button type="button" class="btn btn-p" data-editar="' + rasc.id + '">' + icone('editar', 'icone-p') + 'Editar</button>' +
        '<a class="btn btn-p" href="/crm/previa/' + rasc.id + '" target="_blank" rel="noopener">' + icone('abrir', 'icone-p') + 'Ver Prévia</a>' +
        '<button type="button" class="btn btn-p btn-primario" data-publicar="' + rasc.id + '" data-rev="' + rasc.revisao + '">Publicar</button>';
    }
    if (pub && p.status !== 'cancelada') acoes += botoesLink(url);
    if (p.status === 'ativa' && pub && !rasc) acoes += '<button type="button" class="btn btn-p" data-nova-revisao="' + p.id + '">' + icone('mais', 'icone-p') + 'Nova Revisão</button>';
    return '<div class="gerada"><div class="gerada-cab"><strong>' + esc(p.numero) + '</strong><span class="chip ' + rot[1] + '">' + esc(rot[0]) + '</span>' +
      (pub && p.status !== 'cancelada' ? '<a class="op-link" href="#/proposta/' + esc(p.codigo) + '">Abrir</a>' : '') + '</div>' +
      '<small class="gerada-revs">' + esc((p.revisoes[0] && p.revisoes[0].modelo === 'programa') ? 'Programa IA no Comercial' : 'WhatsApp + Joice') + ' · ' + esc(revs) + '</small>' +
      (p.assinatura ? '<small class="gerada-ass">Assinada por ' + esc(p.assinatura.nome) + ' em ' + esc(dataHora(p.assinatura.quando)) + ' · ' + esc(moeda.format(p.assinatura.mensal)) + ' por mês</small>' : '') +
      (p.status === 'cancelada' ? '<small class="gerada-ass">Cancelada quando a oportunidade foi para Perdido. O link saiu do ar.</small>' : '') +
      (acoes ? '<div class="gerada-acoes">' + acoes + '</div>' : '') + '</div>';
  }

  function cardPropostas(o, alvo, depois) {
    Promise.all([api('GET', '/propostas'), api('GET', '/oportunidades/' + o.id + '/propostas-geradas')]).then(function (res) {
      var lista = res[0], geradas = res[1];
      var minhas = lista.filter(function (p) { return o.propostas.indexOf(p.codigo) >= 0; });
      var livres = lista.filter(function (p) { return !p.oportunidade; });
      alvo.innerHTML = (o.etapa !== 'perdido' ? '<button type="button" class="btn btn-primario btn-bloco" id="op-gerar">' + icone('mais', 'icone-p') + 'Gerar Proposta</button>' : '') +
        geradas.map(function (p) { return blocoGerada(p, o); }).join('') +
        (minhas.length ? '<div class="proposta-links">' + minhas.map(function (p) {
          return '<div class="proposta-link"><div class="proposta-link-txt"><a class="op-link" href="#/proposta/' + esc(p.codigo) + '">' + esc(p.cliente) + '</a>' +
            '<small>' + chipSituacao(p) + ' Válida até ' + esc(validade(p)) + '</small></div>' +
            '<button type="button" class="btn btn-p btn-leve" data-desvincular="' + esc(p.codigo) + '">Desvincular</button></div>';
        }).join('') + '</div>' : '') +
        (!geradas.length && !minhas.length ? '<div class="op-nada">Nenhuma proposta ainda.</div>' : '') +
        (livres.length ? '<label class="campo campo-sem-margem campo-vincular"><span>Vincular Proposta Já Enviada</span><select class="op-select" id="op-vincular"><option value="">Escolha uma proposta...</option>' +
          livres.map(function (p) { return '<option value="' + esc(p.codigo) + '">' + esc(p.cliente) + '</option>'; }).join('') + '</select></label>' : '');
      var gerar = $('#op-gerar', alvo);
      if (gerar) gerar.addEventListener('click', function () {
        molde().then(function (m) {
          var opcoes = Object.keys(m.modelos).map(function (k, i) {
            return '<label class="modelo-op"><input type="radio" name="modelo" value="' + k + '"' + (i === 0 ? ' checked' : '') + '><span><b>' + esc(m.modelos[k]) + '</b><small>' +
              (k === 'programa' ? 'Consultoria em 6 meses: valor, entregas mês a mês e mensalidade no final.' : 'Plataforma de atendimento com a Joice: o cliente monta o plano e a faixa de conversas.') + '</small></span></label>';
          }).join('');
          modal({
            titulo: 'Gerar Proposta', subtitulo: 'Escolha o modelo. O rascunho já vem com os dados da empresa e do contato.', botao: 'Gerar Rascunho',
            corpo: '<div class="modelos">' + opcoes + '</div>',
            enviar: function (c) {
              var modelo = ($('input[name=modelo]:checked', c) || {}).value;
              return api('POST', '/oportunidades/' + o.id + '/propostas/gerar', { modelo: modelo }).then(function (r) {
                aviso('Proposta ' + r.numero + ' criada em rascunho.');
                setTimeout(function () { editarRevisao(r, depois); }, 50);
              });
            }
          });
        }).catch(function (e) { aviso(e.message, true); });
      });
      alvo.querySelectorAll('[data-editar]').forEach(function (b) {
        b.addEventListener('click', function () { api('GET', '/revisoes/' + b.getAttribute('data-editar')).then(function (r) { editarRevisao(r, depois); }).catch(function (e) { aviso(e.message, true); }); });
      });
      alvo.querySelectorAll('[data-publicar]').forEach(function (b) {
        b.addEventListener('click', function () {
          modal({
            titulo: 'Publicar Proposta', botao: 'Publicar',
            subtitulo: 'Depois de publicar, a Revisão ' + String(b.getAttribute('data-rev')).padStart(2, '0') + ' fica congelada e o link passa a abrir para o cliente. Para mudar algo depois, crie uma nova revisão.',
            corpo: '<p class="op-nada">Confira a prévia antes, se ainda não conferiu.</p>',
            enviar: function () {
              return api('POST', '/revisoes/' + b.getAttribute('data-publicar') + '/publicar', {}).then(function () { aviso('Proposta publicada. O link já abre para o cliente.'); depois(); });
            }
          });
        });
      });
      alvo.querySelectorAll('[data-nova-revisao]').forEach(function (b) {
        b.addEventListener('click', function () {
          api('POST', '/propostas-geradas/' + b.getAttribute('data-nova-revisao') + '/nova-revisao', {}).then(function (r) {
            aviso('Revisão ' + String(r.revisao).padStart(2, '0') + ' criada em rascunho.');
            editarRevisao(r, depois);
          }).catch(function (e) { aviso(e.message, true); });
        });
      });
      var sel = $('#op-vincular', alvo);
      if (sel) sel.addEventListener('change', function () {
        if (!sel.value) return;
        api('POST', '/oportunidades/' + o.id + '/propostas', { codigo: sel.value })
          .then(function () { aviso('Proposta vinculada.'); }).catch(function (e) { aviso(e.message, true); }).then(depois);
      });
      alvo.querySelectorAll('[data-desvincular]').forEach(function (b) {
        b.addEventListener('click', function () {
          api('POST', '/oportunidades/' + o.id + '/propostas/desvincular', { codigo: b.getAttribute('data-desvincular') })
            .then(function () { aviso('Proposta desvinculada.'); }).catch(function (e) { aviso(e.message, true); }).then(depois);
        });
      });
    }).catch(function (e) { alvo.innerHTML = '<div class="op-nada">' + esc(e.message) + '</div>'; });
  }

  // editor do rascunho: só os campos que mudam por proposta; os textos do molde são fixos
  function editarRevisao(r, depois) {
    if ((r.dados.modelo || 'joice') === 'programa') return editarPrograma(r, depois);
    molde().then(function (m) {
      var d = r.dados, linha = function (arr, i) { return (arr && arr[i]) || ''; };
      var segs = Object.keys(m.segmentos).map(function (k) { return '<option value="' + k + '"' + (k === d.segmento ? ' selected' : '') + '>' + esc(m.segmentos[k]) + '</option>'; }).join('');
      var planos = Object.keys(m.planos).map(function (k) {
        var v = d.precos.planos[k];
        return '<tr><td>' + esc(m.planos[k].nome) + '</td><td><input type="number" min="0" step="1" name="pm_' + k + '" value="' + v.mensal + '" aria-label="Mensal de ' + esc(m.planos[k].nome) + '"></td>' +
          '<td><input type="number" min="0" step="1" name="pi_' + k + '" value="' + v.impl + '" aria-label="Implantação de ' + esc(m.planos[k].nome) + '"></td></tr>';
      }).join('');
      var faixas = Object.keys(m.faixas).map(function (k) {
        return '<tr><td>' + esc(m.faixas[k].nome) + '</td><td><input type="number" min="0" step="1" name="fx_' + k + '" value="' + d.precos.faixas[k] + '" aria-label="Valor de ' + esc(m.faixas[k].nome) + '"></td><td></td></tr>';
      }).join('');
      var corpo = '<div class="campo-grupo">Cliente</div>' +
        '<div class="duas">' + campo('cliente', 'Nome do Cliente', d.cliente, 'text', 'maxlength="160" required') + campo('cidade', 'Cidade', d.cidade, 'text', 'maxlength="120"') + '</div>' +
        '<label class="campo"><span>Linhas do Quadro Para</span><input type="text" name="para0" maxlength="120" value="' + esc(linha(d.para, 0)) + '" placeholder="Endereço">' +
        '<input type="text" name="para1" maxlength="120" value="' + esc(linha(d.para, 1)) + '" placeholder="Cidade/UF"><input type="text" name="para2" maxlength="120" value="' + esc(linha(d.para, 2)) + '" placeholder="Registro ou site"></label>' +
        '<div class="campo-grupo">Contato</div>' +
        '<div class="duas">' + campo('contato', 'Aos Cuidados de', d.contato, 'text', 'maxlength="120"') + campo('saudacao', 'Saudação (Primeiro Nome)', d.saudacao, 'text', 'maxlength="40"') + '</div>' +
        '<label class="campo"><span>Linhas do Contato</span><input type="text" name="cl0" maxlength="120" value="' + esc(linha(d.contato_linhas, 0)) + '" placeholder="Cargo">' +
        '<input type="text" name="cl1" maxlength="120" value="' + esc(linha(d.contato_linhas, 1)) + '" placeholder="WhatsApp"><input type="text" name="cl2" maxlength="120" value="' + esc(linha(d.contato_linhas, 2)) + '" placeholder="E-mail"></label>' +
        '<div class="campo-grupo">Exemplo e Datas</div>' +
        '<div class="duas"><label class="campo"><span>Segmento do Exemplo</span><select name="segmento">' + segs + '</select></label>' +
        campo('especialista', 'Quem Atende no Exemplo', d.especialista, 'text', 'maxlength="60" placeholder="Ex.: O Dr. Marcus (só em Advocacia)"') + '</div>' +
        '<div class="duas">' + campo('emissao', 'Emissão', d.emissao, 'date', 'required') + campo('valida_ate', 'Válida até', d.valida_ate, 'date', 'required') + '</div>' +
        '<div class="campo-grupo">Valores em Reais</div>' +
        '<table class="tabela tabela-valores"><thead><tr><th>Plano</th><th>Mensal</th><th>Implantação</th></tr></thead><tbody>' + planos + '</tbody>' +
        '<thead><tr><th>Faixa da Joice</th><th>Mensal</th><th></th></tr></thead><tbody>' + faixas + '</tbody></table>' +
        '<p class="op-nada">Os textos da proposta são fixos. Aqui mudam só os dados do cliente, as datas e os valores.</p>';
      modal({
        titulo: 'Editar ' + r.numero + ', Revisão ' + String(r.revisao).padStart(2, '0'), subtitulo: 'Rascunho. O cliente só vê depois de Publicar.', botao: 'Salvar Rascunho', classe: 'largo',
        corpo: corpo,
        enviar: function (c) {
          var v = function (n) { return $('[name=' + n + ']', c).value; };
          var num = function (n) { var x = v(n).trim(); return /^\d+$/.test(x) ? parseInt(x, 10) : x; };
          var precos = { planos: {}, faixas: {} };
          Object.keys(m.planos).forEach(function (k) { precos.planos[k] = { mensal: num('pm_' + k), impl: num('pi_' + k) }; });
          Object.keys(m.faixas).forEach(function (k) { precos.faixas[k] = num('fx_' + k); });
          var dados = { modelo: 'joice', segmento: v('segmento'), cliente: v('cliente'), cidade: v('cidade'), para: [v('para0'), v('para1'), v('para2')],
            contato: v('contato'), contato_linhas: [v('cl0'), v('cl1'), v('cl2')], saudacao: v('saudacao'), especialista: v('especialista'),
            emissao: v('emissao'), valida_ate: v('valida_ate'), precos: precos };
          return api('PUT', '/revisoes/' + r.id, { dados: dados }).then(function () { aviso('Rascunho salvo. Use Ver Prévia para conferir.'); depois(); });
        }
      });
    }).catch(function (e) { aviso(e.message, true); });
  }

  // editor do Programa IA no Comercial: o texto do programa é fixo; mudam cliente, contexto, quem apresenta, mensalidade e datas
  function editarPrograma(r, depois) {
    molde().then(function (m) {
      var d = r.dados, linha = function (arr, i) { return (arr && arr[i]) || ''; };
      var corpo = '<div class="campo-grupo">Cliente</div>' +
        '<div class="duas">' + campo('cliente', 'Nome do Cliente', d.cliente, 'text', 'maxlength="160" required') + campo('cidade', 'Cidade', d.cidade, 'text', 'maxlength="120"') + '</div>' +
        '<label class="campo"><span>Linhas do Quadro Para</span><input type="text" name="para0" maxlength="120" value="' + esc(linha(d.para, 0)) + '" placeholder="Endereço ou segmento">' +
        '<input type="text" name="para1" maxlength="120" value="' + esc(linha(d.para, 1)) + '" placeholder="Cidade/UF"><input type="text" name="para2" maxlength="120" value="' + esc(linha(d.para, 2)) + '" placeholder="Site ou registro"></label>' +
        '<label class="campo"><span>Contexto do Cliente (O Que Muda)</span><textarea name="contexto" maxlength="1200" rows="4">' + esc(d.contexto || '') + '</textarea><small>Abre a proposta, antes das entregas. Escreva a situação do cliente e o que o programa resolve.</small></label>' +
        '<div class="campo-grupo">Contato e Apresentação</div>' +
        '<div class="duas">' + campo('contato', 'Aos Cuidados de', d.contato, 'text', 'maxlength="120"') + campo('saudacao', 'Saudação (Primeiro Nome)', d.saudacao, 'text', 'maxlength="40"') + '</div>' +
        '<label class="campo"><span>Linhas do Contato</span><input type="text" name="cl0" maxlength="120" value="' + esc(linha(d.contato_linhas, 0)) + '" placeholder="Cargo">' +
        '<input type="text" name="cl1" maxlength="120" value="' + esc(linha(d.contato_linhas, 1)) + '" placeholder="WhatsApp"><input type="text" name="cl2" maxlength="120" value="' + esc(linha(d.contato_linhas, 2)) + '" placeholder="E-mail"></label>' +
        campo('apresentada', 'Apresentada por', d.apresentada, 'text', 'maxlength="80" placeholder="Ex.: Facto Consultoria"') +
        '<div class="campo-grupo">Investimento e Datas</div>' +
        '<div class="duas">' + campo('mensalidade', 'Mensalidade em Reais (' + m.meses + ' Meses)', String(d.mensalidade), 'number', 'min="1" step="1" required') +
        '<label class="campo"><span>Total do Programa</span><input type="text" name="total" readonly value=""></label></div>' +
        '<div class="duas">' + campo('emissao', 'Emissão', d.emissao, 'date', 'required') + campo('valida_ate', 'Válida até', d.valida_ate, 'date', 'required') + '</div>' +
        '<p class="op-nada">O texto do programa é fixo: valor, entregas mês a mês, governança, equipe e, no final, o investimento.</p>';
      var camada = modal({
        titulo: 'Editar ' + r.numero + ', Revisão ' + String(r.revisao).padStart(2, '0'), subtitulo: 'Programa IA no Comercial, em rascunho. O cliente só vê depois de Publicar.', botao: 'Salvar Rascunho', classe: 'largo',
        corpo: corpo,
        enviar: function (c) {
          var v = function (n) { return $('[name=' + n + ']', c).value; };
          var mens = v('mensalidade').trim();
          var dados = { modelo: 'programa', cliente: v('cliente'), cidade: v('cidade'), para: [v('para0'), v('para1'), v('para2')], contexto: v('contexto'),
            contato: v('contato'), contato_linhas: [v('cl0'), v('cl1'), v('cl2')], saudacao: v('saudacao'), apresentada: v('apresentada'),
            mensalidade: /^\d+$/.test(mens) ? parseInt(mens, 10) : mens, emissao: v('emissao'), valida_ate: v('valida_ate') };
          return api('PUT', '/revisoes/' + r.id, { dados: dados }).then(function () { aviso('Rascunho salvo. Use Ver Prévia para conferir.'); depois(); });
        }
      });
      var mensal = $('[name=mensalidade]', camada), total = $('[name=total]', camada);
      var atualiza = function () { var x = parseInt(mensal.value, 10); total.value = x > 0 ? moeda.format(x * m.meses) : ''; };
      mensal.addEventListener('input', atualiza); atualiza();
    }).catch(function (e) { aviso(e.message, true); });
  }

  // ---------- Empresas ----------
  function telaEmpresas() {
    cabecalho('empresas', '<button type="button" class="btn btn-primario" id="nova-empresa" aria-label="Nova Empresa">' + icone('mais', 'icone-p') + '<span class="btn-rot">Nova Empresa</span></button>');
    $('#nova-empresa').addEventListener('click', function () { formEmpresa(null, telaEmpresas); });
    var raiz = $('#tela');
    if (!raiz.querySelector('#empresas-busca')) raiz.innerHTML = '<div class="vazio">Carregando</div>';
    api('GET', '/empresas?busca=' + encodeURIComponent(estado.buscaEmpresas)).then(function (lista) {
      var manter = document.activeElement && document.activeElement.id === 'empresas-busca';
      var linhas = lista.map(function (e) {
        return '<tr class="clicavel" data-empresa="' + e.id + '" tabindex="0"><td><strong>' + esc(e.nome) + '</strong>' + (e.segmento ? '<small>' + esc(e.segmento) + '</small>' : '') + '</td>' +
          '<td class="some-celular">' + esc(e.cidade || '') + '</td>' +
          '<td class="some-celular">' + esc(e.contato_nome || '') + (e.contato_whatsapp ? '<small>' + esc(telefone(e.contato_whatsapp)) + '</small>' : '') + '</td>' +
          '<td class="num">' + e.abertas.toLocaleString('pt-BR') + '</td></tr>';
      }).join('');
      raiz.innerHTML = '<div class="barra-filtros"><label class="pilula pilula-busca">' + icone('busca') +
        '<input type="search" id="empresas-busca" placeholder="Buscar por nome, CNPJ ou contato" aria-label="Buscar por nome, CNPJ ou contato" value="' + esc(estado.buscaEmpresas) + '"></label>' +
        '<span class="filtro-conta">' + lista.length.toLocaleString('pt-BR') + (lista.length === 1 ? ' empresa' : ' empresas') + '</span></div>' +
        (lista.length ? '<div class="tabela-cartao tabela-rolagem"><table class="tabela"><thead><tr><th>Empresa</th><th class="some-celular">Cidade</th><th class="some-celular">Contato</th><th class="num">Em Aberto</th></tr></thead><tbody>' + linhas + '</tbody></table></div>'
          : '<div class="vazio">' + (estado.buscaEmpresas ? 'Nenhuma empresa encontrada.' : 'Nenhuma empresa cadastrada.') + '</div>');
      var busca = $('#empresas-busca', raiz), t = null;
      if (manter) { busca.focus(); busca.setSelectionRange(busca.value.length, busca.value.length); }
      busca.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { estado.buscaEmpresas = busca.value; telaEmpresas(); }, 250); });
      raiz.querySelectorAll('[data-empresa]').forEach(function (tr) {
        var abrir = function () { api('GET', '/empresas/' + tr.getAttribute('data-empresa')).then(function (e) { formEmpresa(e, telaEmpresas); }).catch(function (er) { aviso(er.message, true); }); };
        tr.addEventListener('click', abrir);
        tr.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') abrir(); });
      });
    }).catch(function (e) { raiz.innerHTML = '<div class="vazio">' + esc(e.message) + '</div>'; });
  }

  function campo(nome, rotulo, valor, tipo, extra) {
    return '<label class="campo"><span>' + esc(rotulo) + '</span><input type="' + (tipo || 'text') + '" name="' + nome + '" value="' + esc(valor || '') + '" ' + (extra || '') + '></label>';
  }

  function formEmpresa(e, depois) {
    var c = (e && e.contato) || {};
    var ops = e && e.oportunidades && e.oportunidades.length ? '<div class="campo-grupo">Oportunidades</div><div class="lista-ops">' + e.oportunidades.map(function (o) {
      return '<a href="#/oportunidade/' + o.id + '" class="chip chip-neutro" data-fechar>Oportunidade ' + o.id + ' · ' + esc(estado.etapas[o.etapa]) + '</a>';
    }).join('') + '</div>' : '';
    var camada = modal({
      titulo: e ? 'Editar Empresa' : 'Nova Empresa', subtitulo: 'Só o nome é obrigatório.', botao: e ? 'Salvar' : 'Cadastrar Empresa', classe: 'largo',
      corpo: '<div class="campo-grupo">Empresa</div>' + campo('nome', 'Nome', e && e.nome, 'text', 'maxlength="160" required') +
        '<div class="duas">' + campo('cnpj', 'CNPJ', e && cnpj(e.cnpj), 'text', 'inputmode="numeric" maxlength="20"') + campo('cidade', 'Cidade', e && e.cidade, 'text', 'maxlength="120"') + '</div>' +
        '<div class="duas">' + campo('segmento', 'Segmento', e && e.segmento, 'text', 'maxlength="120"') + campo('site', 'Site', e && e.site, 'text', 'maxlength="200" inputmode="url"') + '</div>' +
        '<label class="campo"><span>Observação</span><textarea name="observacao" maxlength="2000">' + esc((e && e.observacao) || '') + '</textarea></label>' +
        '<div class="campo-grupo">Contato</div><div class="duas">' + campo('c_nome', 'Nome do Contato', c.nome, 'text', 'maxlength="120"') + campo('c_cargo', 'Cargo', c.cargo, 'text', 'maxlength="120"') + '</div>' +
        '<div class="duas">' + campo('c_whatsapp', 'WhatsApp', telefone(c.whatsapp), 'tel', 'maxlength="25"') + campo('c_email', 'E-mail', c.email, 'email', 'maxlength="160"') + '</div>' + ops,
      enviar: function (m) {
        var v = function (n) { return $('[name=' + n + ']', m).value; };
        var corpo = { nome: v('nome'), cnpj: v('cnpj'), cidade: v('cidade'), segmento: v('segmento'), site: v('site'), observacao: v('observacao'),
          contato: { nome: v('c_nome'), cargo: v('c_cargo'), whatsapp: v('c_whatsapp'), email: v('c_email') } };
        return api(e ? 'PUT' : 'POST', e ? '/empresas/' + e.id : '/empresas', corpo).then(function (r) {
          aviso(e ? 'Empresa ' + r.nome + ' salva.' : 'Empresa ' + r.nome + ' cadastrada.');
          depois();
        });
      }
    });
    camada.querySelectorAll('[data-fechar]').forEach(function (a) { a.addEventListener('click', function () { camada.remove(); }); });
  }

  // ---------- Oportunidade ----------
  function telaOportunidade(id) {
    var antiga = $('.op-camada');
    api('GET', '/oportunidades/' + id).then(function (o) {
      if (antiga) antiga.remove();
      var e = o.empresa, c = e.contato || {};
      // trilha = caminho principal; Futuro, Frio e Perdido são situações à parte (selo e faixa)
      var trilha = TRILHA.filter(function (x) { return estado.etapas[x]; });
      var lateral = LATERAIS[o.etapa];
      var pos = trilha.indexOf(o.etapa);
      var etapas = trilha.map(function (x, i) {
        var cls = lateral ? '' : i < pos ? 'feita' : i === pos ? 'atual' : '';
        return '<li class="' + cls + '"><button type="button" class="op-etapa" data-etapa="' + x + '"' + (x === o.etapa ? ' aria-current="step"' : '') + '><span class="bola">' + (cls === 'feita' ? icone('check', 'icone-p') : i + 1) + '</span>' +
          '<span class="txt"><b>' + esc(estado.etapas[x]) + '</b>' + (x === o.etapa ? '<small>' + esc(haQuanto(o.etapa_em) === 'Hoje' ? 'Desde Hoje' : 'Há ' + haQuanto(o.etapa_em)) + '</small>' : '') + '</span></button></li>';
      }).join('');
      var hist = o.historico.map(function (h) {
        var txt = h.de_etapa ? 'De ' + esc(estado.etapas[h.de_etapa]) + ' para <b>' + esc(estado.etapas[h.para_etapa]) + '</b>' : 'Oportunidade criada em <b>' + esc(estado.etapas[h.para_etapa]) + '</b>';
        return '<div class="evento"><span class="ponto ' + (h.para_etapa === 'perdido' ? 'perda' : 'etapa') + '">' + icone(h.para_etapa === 'perdido' ? 'xis' : 'seta', 'icone-p') + '</span>' +
          '<div><div class="txt">' + txt + '</div><div class="quando">' + esc(dataHora(h.criado_em)) + (h.origem === 'sistema' ? ' <span class="por">pela assinatura do cliente</span>' : h.por ? ' <span class="por">por ' + esc(h.por) + '</span>' : '') + '</div></div></div>';
      }).join('');
      var linha = function (ic, rot, val) { return '<div class="op-linha">' + icone(ic) + '<span class="rot">' + esc(rot) + '</span><span class="val">' + (val || '<span class="op-nada">Não Informado</span>') + '</span></div>'; };
      var sub = [e.cidade, e.segmento].filter(Boolean).map(esc).join('<span class="sep">·</span>');
      var camada = document.createElement('div');
      camada.className = 'op-camada';
      camada.setAttribute('role', 'region');
      camada.setAttribute('aria-label', 'Oportunidade de ' + e.nome);
      camada.innerHTML = '<div class="op-cab">' +
        '<button type="button" class="op-voltar" id="op-voltar" aria-label="Voltar ao Funil" title="Voltar ao Funil">' + icone('voltar') + '</button>' +
        '<span class="op-sigla" aria-hidden="true">' + esc(sigla(e.nome)) + '</span>' +
        '<div class="op-id"><div class="op-nome"><h1>' + esc(e.nome) + '</h1>' + (o.etapa === 'ganho' ? '<span class="chip chip-ok">Ganho</span>' : lateral ? '<span class="chip ' + lateral + '">' + esc(estado.etapas[o.etapa]) + '</span>' : '') + '</div>' +
        '<div class="op-sub">Oportunidade <b>' + o.id + '</b><span class="sep">·</span>criada em ' + esc(new Date(o.criado_em).toLocaleDateString('pt-BR')) + (sub ? '<span class="sep">·</span>' + sub : '') + '</div></div>' +
        '<button type="button" class="btn" id="op-editar" aria-label="Editar Empresa">' + icone('editar', 'icone-p') + '<span class="btn-rot">Editar Empresa</span></button>' +
        '<ol class="op-etapas">' + etapas + '</ol>' +
        '<div class="op-etapa-atual">Etapa: <b>' + esc(estado.etapas[o.etapa]) + '</b>, ' + esc(haQuanto(o.etapa_em) === 'Hoje' ? 'desde hoje' : 'há ' + haQuanto(o.etapa_em).toLowerCase()) + '</div>' +
        (lateral ? '<div class="op-perdida"><span class="chip ' + lateral + '">Marcada como ' + esc(estado.etapas[o.etapa]) + ' ' + esc(dataHora(o.etapa_em)) + '</span></div>' : '') +
        '</div>' +
        '<div class="op-corpo"><div class="op-geral"><div class="op-principal">' +
        '<div class="op-card"><h3>Dados da Empresa</h3><div class="op-linhas">' +
        linha('documento', 'CNPJ', esc(cnpj(e.cnpj))) + linha('local', 'Cidade', esc(e.cidade || '')) + linha('empresas', 'Segmento', esc(e.segmento || '')) +
        linha('site', 'Site', e.site ? '<a href="' + esc(linkSite(e.site)) + '" target="_blank" rel="noopener noreferrer">' + esc(e.site) + '</a>' : '') +
        '</div>' + (e.observacao ? '<p class="op-obs">' + esc(e.observacao) + '</p>' : '') + '</div>' +
        '<div class="op-card"><h3>Histórico</h3><div class="linha-tempo op-tempo">' + (hist || '<div class="op-nada">Sem registros.</div>') + '</div></div>' +
        '</div><div class="op-lado">' +
        '<div class="op-card"><h3>Etapa</h3><label class="campo campo-sem-margem"><span>Mudar para</span><select id="op-etapa-sel" class="op-select">' +
        estado.ordem.map(function (x) { return '<option value="' + x + '"' + (x === o.etapa ? ' selected' : '') + '>' + esc(estado.etapas[x]) + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="op-card"><h3>Propostas</h3><div id="op-propostas"><div class="op-nada">Carregando</div></div></div>' +
        '<div class="op-card"><h3>Contato</h3>' + (c.nome || c.whatsapp || c.email ?
          '<div class="op-pessoa"><span class="avatar avatar-g avatar-contato">' + esc(sigla(c.nome || e.nome)) + '</span><div><strong>' + esc(c.nome || 'Sem Nome') + '</strong>' + (c.cargo ? '<div class="op-sub op-sub-cargo">' + esc(c.cargo) + '</div>' : '') + '</div></div>' +
          '<ul class="op-dados">' + (c.whatsapp ? '<li>' + icone('whatsapp') + '<span><a href="https://wa.me/' + esc(c.whatsapp.length <= 11 ? '55' + c.whatsapp : c.whatsapp) + '" target="_blank" rel="noopener noreferrer">' + esc(telefone(c.whatsapp)) + '</a><small>WhatsApp</small></span></li>' : '') +
          (c.email ? '<li>' + icone('email') + '<span><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a><small>E-mail</small></span></li>' : '') + '</ul>'
          : '<div class="op-nada">Nenhum contato cadastrado.</div><button type="button" class="op-link" id="op-add-contato">Adicionar Contato</button>') + '</div>' +
        '</div></div></div>';
      $('#app').appendChild(camada);
      menu('funil');
      document.title = e.nome + ' | CRM de Propostas';
      $('#op-voltar', camada).addEventListener('click', function () { location.hash = '#/funil'; });
      var editar = function () { formEmpresa(e, function () { telaOportunidade(id); }); };
      $('#op-editar', camada).addEventListener('click', editar);
      var add = $('#op-add-contato', camada);
      if (add) add.addEventListener('click', editar);
      var re = function () { telaOportunidade(id); };
      camada.querySelectorAll('[data-etapa]').forEach(function (b) {
        b.addEventListener('click', function () { if (b.getAttribute('data-etapa') !== o.etapa) mover(id, b.getAttribute('data-etapa'), re); });
      });
      $('#op-etapa-sel', camada).addEventListener('change', function (ev) { mover(id, ev.target.value, re); });
      cardPropostas(o, $('#op-propostas', camada), re);
    }).catch(function (er) {
      aviso(er.message, true);
      if (er.http === 404) location.hash = '#/funil';
    });
  }

  // ---------- navegação ----------
  function rotear() {
    var h = location.hash.replace(/^#\/?/, '');
    var mp = h.match(/^proposta\/([a-z0-9-]{6,40})$/);
    if (mp) {
      if (!$('#tela').innerHTML) telaPropostas();
      return telaProposta(mp[1]);
    }
    var m = h.match(/^oportunidade\/(\d+)$/);
    if (m) {
      if (!$('#tela').innerHTML) telaFunil();
      return telaOportunidade(m[1]);
    }
    document.querySelectorAll('.op-camada').forEach(function (c) { c.remove(); });
    if (h === 'empresas') return telaEmpresas();
    if (h === 'propostas') return telaPropostas();
    if (h !== 'funil') { history.replaceState(null, '', '#/funil'); }
    telaFunil();
  }
  window.addEventListener('hashchange', function () { if (!$('#app').hidden) rotear(); });

  function iniciar() {
    api('GET', '/eu').then(function (eu) {
      estado.eu = eu;
      estado.etapas = eu.etapas;
      estado.ordem = Object.keys(eu.etapas);
      $('#usuario-btn').innerHTML = '<span class="avatar">' + esc(sigla(eu.nome)) + '</span>' + icone('chevron');
      $('#usuario-btn').setAttribute('aria-label', 'Conta de ' + eu.nome);
      $('#menu-nome').textContent = eu.nome;
      $('#menu-email').textContent = eu.email;
      $('.esc-txt strong').textContent = eu.nome;
      $('#entrada').hidden = true;
      $('#app').hidden = false;
      $('#tela').innerHTML = '';
      if (eu.trocar_senha) { trocarSenha(true); return; }
      rotear();
    }).catch(function (e) { if (e.http !== 401) aviso(e.message, true); mostrarEntrada(); });
  }
  iniciar();
  // app instalável no celular: o service worker guarda só a casca da tela (ver sw.js)
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/crm/sw.js', { scope: '/crm' }).catch(function () { /* sem app instalável, o CRM segue no navegador */ });
})();
