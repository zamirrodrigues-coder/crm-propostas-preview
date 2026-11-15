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
    painel: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    alerta: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
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
      '<div class="modal-acoes">' + (op.obrigatorio ? '' : '<button type="button" class="btn btn-leve" data-cancelar>' + esc(op.fechar || 'Cancelar') + '</button>') +
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
  function esconderSenhas() { document.querySelectorAll('#entrada .olho').forEach(function (b) { verSenha(b, false); }); }
  esconderSenhas();

  // ---------- entrada e estrutura ----------
  // a área de entrada tem três formulários: Entrar, Esqueceu Sua Senha? e Crie Sua Nova Senha (pelo link do e-mail)
  var FORM_ENTRADA = { entrar: ['#entrada-form', '#entrada-email'], esqueci: ['#esqueci-form', '#esqueci-email'], redefinir: ['#redefinir-form', '#redefinir-nova'] };
  function telaEntrada(qual) {
    Object.keys(FORM_ENTRADA).forEach(function (k) { $(FORM_ENTRADA[k][0]).hidden = k !== qual; });
    document.querySelectorAll('#entrada .entrada-erro').forEach(function (e) { e.textContent = ''; });
    if (qual !== 'entrar') $('#entrada-recado').hidden = true;
    if (qual === 'esqueci') { $('#esqueci-recado').hidden = true; $('#esqueci-email').value = $('#entrada-email').value; }
    esconderSenhas();
    setTimeout(function () { $(FORM_ENTRADA[qual][1]).focus(); }, 30);
  }
  function mostrarEntrada() {
    $('#app').hidden = true;
    $('#entrada').hidden = false;
    $('#usuario-menu').hidden = true;
    document.querySelectorAll('.camada').forEach(function (c) { c.remove(); });
    telaEntrada('entrar');
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-entrada]');
    if (!b) return;
    if (tokenRedefinir && b.getAttribute('data-entrada') === 'entrar') { tokenRedefinir = ''; history.replaceState(null, '', location.pathname); }
    telaEntrada(b.getAttribute('data-entrada'));
  });
  $('#esqueci-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('#esqueci-btn'), erro = $('#esqueci-erro'), email = $('#esqueci-email').value.trim();
    erro.textContent = '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { erro.textContent = 'Informe um e-mail válido.'; return; }
    btn.disabled = true;
    api('POST', '/esqueci', { email: email })
      .then(function () { $('#esqueci-recado').hidden = false; })
      .catch(function (e) { erro.textContent = e.message; })
      .then(function () { btn.disabled = false; });
  });
  // o código do link vem depois do # (não vai para o servidor nem fica em registro de acesso)
  var tokenRedefinir = (location.hash.match(/^#\/redefinir\/([a-f0-9]{64})$/) || [])[1] || '';
  $('#redefinir-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('#redefinir-btn'), erro = $('#redefinir-erro'), nova = $('#redefinir-nova').value;
    erro.textContent = '';
    if (nova !== $('#redefinir-repete').value) { erro.textContent = 'As duas senhas não são iguais.'; return; }
    btn.disabled = true;
    api('POST', '/redefinir', { token: tokenRedefinir, nova: nova })
      .then(function () {
        tokenRedefinir = '';
        history.replaceState(null, '', location.pathname);
        $('#redefinir-nova').value = ''; $('#redefinir-repete').value = '';
        telaEntrada('entrar');
        $('#entrada-recado').textContent = 'Senha criada. Entre com a nova senha.';
        $('#entrada-recado').hidden = false;
      })
      .catch(function (e) { erro.textContent = e.message; })
      .then(function () { btn.disabled = false; });
  });
  $('#entrada-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('#entrada-btn'), erro = $('#entrada-erro');
    btn.disabled = true; erro.textContent = ''; $('#entrada-recado').hidden = true;
    api('POST', '/entrar', { email: $('#entrada-email').value, senha: $('#entrada-senha').value })
      .then(function () { $('#entrada-senha').value = ''; iniciar(); })
      .catch(function (e) { erro.textContent = e.message; })
      .then(function () { btn.disabled = false; });
  });

  var TELAS = {
    painel: { titulo: 'Painel', desc: 'Quanto você tem a receber, a receita projetada e os negócios em andamento.', icone: 'painel' },
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
    estado.volta = id;
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
      '<div class="valor-card"><span>' + (o.valor_mensal || o.valor_unica ? (o.valor_mensal ? '<b>' + esc(moeda.format(o.valor_mensal)) + '/mês</b>' : '') + (o.valor_unica ? (o.valor_mensal ? ' + ' : '<b>') + esc(moeda.format(o.valor_unica)) + ' única' + (o.valor_mensal ? '' : '</b>') : '') : '<i>Sem valor</i>') + '</span>' +
        '<span class="fecha-card">' + icone('relogio', 'icone-p') + (o.prev_fechamento ? esc(NOMES_MES[+o.prev_fechamento.slice(5, 7) - 1].slice(0, 3) + '/' + o.prev_fechamento.slice(0, 4)) : '<i>Sem data</i>') + '</span></div>' +
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
      // no celular as etapas ficam uma embaixo da outra, abertas; cada uma recolhe e expande (no computador, colunas)
      estado.recolhidas = estado.recolhidas || {};
      var colunas = estado.ordem.map(function (e) {
        var daEtapa = vis.filter(function (o) { return o.etapa === e; });
        var cls = e === 'ganho' ? ' fim-ganho' : e === 'perdido' ? ' fim-perdido' : e === 'futuro' ? ' lado-futuro' : e === 'frio' ? ' lado-frio' : '';
        var fechada = !!estado.recolhidas[e];
        // valor dos negócios da etapa: mensalidade recorrente somada e receita única somada (mesmo critério do Painel)
        var vm = daEtapa.reduce(function (s, o) { return s + (o.valor_mensal || 0); }, 0), vu = daEtapa.reduce(function (s, o) { return s + (o.valor_unica || 0); }, 0);
        var valorEtapa = '<span class="valor-etapa">' + (vm || vu ? (vm ? '<b>' + esc(moeda.format(vm)) + '/mês</b>' : '') + (vu ? '<small>' + (vm ? '+ ' : '') + esc(moeda.format(vu)) + ' única</small>' : '') : '<small>Sem valor</small>') + '</span>';
        return '<div class="coluna' + cls + (fechada ? ' recolhida' : '') + '" data-etapa="' + e + '"><div class="coluna-cab" data-alternar="' + e + '" tabindex="0" aria-expanded="' + !fechada + '"><h4>' + esc(estado.etapas[e]) + '</h4><span class="qtd">' + daEtapa.length.toLocaleString('pt-BR') + '</span>' + valorEtapa + icone('chevron', 'seta-etapa') + '</div>' +
          '<div class="coluna-cartoes">' + (daEtapa.map(cartao).join('') || '<div class="vazio vazio-coluna">Nenhuma Oportunidade</div>') + '</div></div>';
      }).join('');
      var manter = document.activeElement && document.activeElement.id === 'funil-busca';
      raiz.innerHTML = '<div class="barra-filtros"><label class="pilula pilula-busca">' + icone('busca') +
        '<input type="search" id="funil-busca" placeholder="Buscar por empresa, contato ou cidade" aria-label="Buscar por empresa, contato ou cidade" value="' + esc(estado.busca) + '"></label>' +
        (estado.busca ? '<button type="button" class="limpar" id="funil-limpar">Limpar</button>' : '') +
        '<span class="dica-arrastar filtro-conta">' + vis.length.toLocaleString('pt-BR') + (vis.length === 1 ? ' oportunidade' : ' oportunidades') + '</span></div>' +
        '<div class="funil-acoes"><button type="button" class="btn btn-p" data-funil="expandir">Expandir Todos</button><button type="button" class="btn btn-p" data-funil="recolher">Recolher Todos</button></div>' +
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
    // recolher e expandir etapas (só no celular; no computador as colunas ficam sempre abertas)
    var celular = function () { return window.matchMedia('(max-width: 767px)').matches; };
    var marcar = function (col, fechada) {
      var e = col.getAttribute('data-etapa');
      if (fechada) estado.recolhidas[e] = true; else delete estado.recolhidas[e];
      col.classList.toggle('recolhida', fechada);
      $('.coluna-cab', col).setAttribute('aria-expanded', String(!fechada));
    };
    raiz.querySelectorAll('[data-alternar]').forEach(function (cab) {
      var col = cab.closest('.coluna');
      var alterna = function () { if (celular()) marcar(col, !col.classList.contains('recolhida')); };
      cab.addEventListener('click', alterna);
      cab.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alterna(); } });
    });
    raiz.querySelectorAll('[data-funil]').forEach(function (b) {
      b.addEventListener('click', function () {
        var fechar = b.getAttribute('data-funil') === 'recolher';
        raiz.querySelectorAll('.coluna').forEach(function (col) { marcar(col, fechar); });
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
      .then(function (o) {
        aviso(o.empresa.nome + ' foi para ' + estado.etapas[o.etapa] + '.');
        // fechou: registra o contrato para a receita entrar como Garantida no Painel
        if (o.etapa === 'ganho' && !(o.contratos || []).length) registrarContrato(o, depois);
      })
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
            corpo: '<div class="modelos">' + opcoes + '</div>' +
              '<label class="campo campo-fecha-proposta"><span>Previsão de Fechamento</span><input type="month" name="fechamento" min="' + mesAtual() + '" value="' + esc((o.prev_fechamento || '').slice(0, 7)) + '" required><small>Obrigatória: mês e ano em que o negócio deve fechar.</small></label>',
            enviar: function (c) {
              var modelo = ($('input[name=modelo]:checked', c) || {}).value, fechamento = valor(c, 'fechamento');
              if (!fechamento) return Promise.reject(new Error('Informe a previsão de fechamento (mês e ano).'));
              return api('POST', '/oportunidades/' + o.id + '/propostas/gerar', { modelo: modelo, fechamento: fechamento }).then(function (r) {
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
    // contratos e vendas do cliente (entram como Garantida no Painel)
    if (e) ops += '<div class="campo-grupo">Contratos e Vendas</div>' + (e.contratos && e.contratos.length ? '<div class="contratos-lista">' + e.contratos.map(function (x) { return itemContrato(x, false); }).join('') + '</div>' : '<p class="op-nada">Nenhum contrato ainda.</p>') +
      '<div class="op-card-btns"><button type="button" class="btn btn-p" data-novo-contrato>' + icone('mais', 'icone-p') + 'Novo Contrato</button><button type="button" class="btn btn-p" data-lancar-venda>' + icone('mais', 'icone-p') + 'Lançar Venda</button></div>';
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
    if (e) {
      var aEmpresa = { id: e.id, nome: e.nome };
      $('[data-novo-contrato]', camada).addEventListener('click', function () { camada.remove(); formContrato({ empresa: aEmpresa }, depois); });
      $('[data-lancar-venda]', camada).addEventListener('click', function () { camada.remove(); formVenda(aEmpresa, depois); });
      camada.querySelectorAll('[data-contrato]').forEach(function (el) {
        el.addEventListener('click', function () { camada.remove(); abrirContrato(e.contratos.filter(function (x) { return String(x.id) === el.getAttribute('data-contrato'); })[0], depois); });
      });
    }
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
        '<div class="op-card op-etapa-card"><h3>Etapa</h3><label class="campo"><span>Mudar para</span><select id="op-etapa-sel" class="op-select">' +
        estado.ordem.map(function (x) { return '<option value="' + x + '"' + (x === o.etapa ? ' selected' : '') + '>' + esc(estado.etapas[x]) + '</option>'; }).join('') + '</select></label>' +
        (o.etapa === 'ganho' || o.etapa === 'perdido' ? '' :
          '<label class="campo campo-sem-margem"><span>Previsão de Fechamento</span><input type="month" id="op-fechamento" class="op-select" min="' + mesAtual() + '" value="' + esc((o.prev_fechamento || '').slice(0, 7)) + '">' +
          (o.prev_fechamento ? '' : '<small>Informe o mês para o negócio entrar na previsão do Painel.</small>') + '</label>') + '</div>' +
        '<div class="op-card"><h3>Histórico</h3><div class="linha-tempo op-tempo">' + (hist || '<div class="op-nada">Sem registros.</div>') + '</div></div>' +
        '</div><div class="op-lado">' +
        cardValores(o, linha) +

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
      $('#op-voltar', camada).addEventListener('click', function () { location.hash = '#/' + (estado.volta === 'painel' ? 'painel' : 'funil'); });
      var editar = function () { formEmpresa(e, function () { telaOportunidade(id); }); };
      $('#op-editar', camada).addEventListener('click', editar);
      var add = $('#op-add-contato', camada);
      if (add) add.addEventListener('click', editar);
      var re = function () { telaOportunidade(id); };
      camada.querySelectorAll('[data-etapa]').forEach(function (b) {
        b.addEventListener('click', function () { if (b.getAttribute('data-etapa') !== o.etapa) mover(id, b.getAttribute('data-etapa'), re); });
      });
      $('#op-etapa-sel', camada).addEventListener('change', function (ev) { mover(id, ev.target.value, re); });
      var fecha = $('#op-fechamento', camada);
      if (fecha) fecha.addEventListener('change', function () {
        if (!fecha.value) return;
        api('PUT', '/oportunidades/' + id + '/fechamento', { mes: fecha.value })
          .then(function () { aviso('Previsão de fechamento: ' + nomeMes(fecha.value) + '.'); })
          .catch(function (er) { aviso(er.message, true); })
          .then(re);
      });
      cardPropostas(o, $('#op-propostas', camada), re);
      ligarValores(o, camada, re);
    }).catch(function (er) {
      aviso(er.message, true);
      if (er.http === 404) location.hash = '#/funil';
    });
  }

  // ---------- Receita: valores previstos, contratos, Lançar Venda e Painel (Fase 1) ----------
  // Toda conta mora no servidor (/painel); aqui só se mostra e se envia. Larguras de barra vão por el.style
  // (a política de segurança do CRM não aceita estilo dentro do HTML).
  var NOMES_MES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  function real(v) { return moeda.format(v || 0); }
  function mesDe(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function mesAtual() { return mesDe(new Date()); }
  function mesSeguinte(m) { var a = +m.slice(0, 4), b = +m.slice(5, 7) + 1; if (b > 12) { b = 1; a++; } return a + '-' + String(b).padStart(2, '0'); }
  function nomeMes(m) { return m ? NOMES_MES[+m.slice(5, 7) - 1] + ' de ' + m.slice(0, 4) : ''; }
  function plural(n, um, varios) { return n.toLocaleString('pt-BR') + ' ' + (n === 1 ? um : varios); }
  function valor(c, n) { var el = $('[name=' + n + ']', c); return el ? el.value.trim() : ''; }
  function radio(c, n) { return ($('input[name=' + n + ']:checked', c) || {}).value; }
  function campoValor(nome, rotulo, v, ajuda) {
    return '<label class="campo"><span>' + esc(rotulo) + '</span><input type="number" name="' + nome + '" min="0" step="1" inputmode="numeric" value="' + (v || v === 0 ? esc(String(v)) : '') + '">' + (ajuda ? '<small>' + esc(ajuda) + '</small>' : '') + '</label>';
  }
  function escolhaTipo(nome, atual, opcoes) {
    return '<div class="escolha-tipo">' + opcoes.map(function (o) {
      return '<label><input type="radio" name="' + nome + '" value="' + o[0] + '"' + (o[0] === atual ? ' checked' : '') + '>' + esc(o[1]) + '</label>';
    }).join('') + '</div>';
  }
  // campos que só valem para projeto com prazo
  function ligarTipo(camada) {
    var ajusta = function () { camada.querySelectorAll('[data-so-projeto]').forEach(function (el) { el.hidden = radio(camada, 'tipo') !== 'projeto'; }); };
    camada.addEventListener('change', ajusta); ajusta();
  }
  function resumoContrato(c) {
    if (c.origem === 'venda') return 'Venda: ' + c.quantidade + ' × ' + real(c.valor_unitario) + (c.mensal ? ' por mês, desde ' + nomeMes(c.inicio) : ', em ' + nomeMes(c.unica_mes));
    var p = [];
    if (c.mensal) p.push((c.meses ? 'Projeto de ' + c.meses + ' meses' : 'Recorrente') + ' desde ' + nomeMes(c.inicio) + (c.desconto_pct && c.desconto_meses ? ', ' + c.desconto_pct + '% nos ' + c.desconto_meses + ' primeiros' : ''));
    if (c.unica) p.push(real(c.unica) + ' de receita única em ' + nomeMes(c.unica_mes) + (c.unica_parcelas > 1 ? ' (' + c.unica_parcelas + 'x)' : ''));
    return p.join(' · ');
  }
  function itemContrato(c, comEmpresa) {
    return '<div class="contrato-item" data-contrato="' + c.id + '" tabindex="0"><div class="txt"><strong>' + esc(comEmpresa ? c.empresa : c.descricao) + '</strong><small>' +
      esc((comEmpresa ? c.descricao + ' · ' : '') + resumoContrato(c)) + '</small></div><div class="val">' +
      (c.mensal ? real(c.mensal) + '<small>' + (c.meses ? 'por mês, com prazo' : 'por mês') + '</small>' : real(c.unica) + '<small>única</small>') + '</div></div>';
  }

  // valores previstos da oportunidade (usados no Painel, ponderados pela chance da etapa)
  function cardValores(o, linha) {
    var c = '<div class="op-card op-valores"><h3>Valores e Previsão</h3><div class="op-linhas">' +
      linha('documento', 'Mensalidade', o.prev_mensal ? esc(real(o.prev_mensal)) + '<small>' + (o.prev_tipo === 'projeto' ? 'Projeto de ' + o.prev_meses + ' meses' : 'Recorrente') + '</small>' : '') +
      linha('documento', 'Receita Única', o.prev_unica ? esc(real(o.prev_unica)) : '') +
      linha('relogio', 'Fechamento', o.prev_fechamento ? esc(nomeMes(o.prev_fechamento.slice(0, 7))) : '') +
      '</div><div class="op-card-btns"><button type="button" class="btn btn-p" id="op-valores">' + icone('editar', 'icone-p') + 'Editar Valores</button></div></div>';
    if (o.etapa === 'ganho') {
      c += '<div class="op-card"><h3>Contrato</h3>' + (o.contratos.length
        ? '<div class="contratos-lista">' + o.contratos.map(function (x) { return itemContrato(x, false); }).join('') + '</div>'
        : '<p class="op-nada">O negócio fechou. Registre o contrato para a receita entrar como garantida no Painel.</p><button type="button" class="btn btn-primario btn-bloco" id="op-registrar">Registrar Contrato</button>') + '</div>';
    }
    return c;
  }
  function ligarValores(o, camada, re) {
    $('#op-valores', camada).addEventListener('click', function () { formPrevisao(o, re); });
    var reg = $('#op-registrar', camada);
    if (reg) reg.addEventListener('click', function () { registrarContrato(o, re); });
    camada.querySelectorAll('.op-valores ~ .op-card [data-contrato]').forEach(function (el) {
      el.addEventListener('click', function () { abrirContrato(o.contratos.filter(function (x) { return String(x.id) === el.getAttribute('data-contrato'); })[0], re); });
    });
  }
  function formPrevisao(o, depois) {
    var projeto = o.prev_tipo === 'projeto';
    var camada = modal({
      titulo: 'Valores e Previsão', subtitulo: 'Usados no Painel. A chance da etapa pondera estes valores.', botao: 'Salvar',
      corpo: '<div class="campo-grupo">Mensalidade</div>' + escolhaTipo('tipo', projeto ? 'projeto' : 'recorrente', [['recorrente', 'Recorrente'], ['projeto', 'Projeto com Prazo']]) +
        '<div class="duas">' + campoValor('mensal', 'Mensalidade Prevista (R$)', o.prev_mensal) +
        '<label class="campo" data-so-projeto><span>Por Quantos Meses</span><input type="number" name="meses" min="1" max="120" inputmode="numeric" value="' + (o.prev_meses || '') + '"></label></div>' +
        '<div class="campo-grupo">Receita Única e Fechamento</div>' +
        '<div class="duas">' + campoValor('unica', 'Receita Única Prevista (R$)', o.prev_unica, 'Implantação ou valor cobrado uma vez.') +
        '<label class="campo"><span>Previsão de Fechamento</span><input type="month" name="fechamento" min="' + mesAtual() + '" value="' + esc((o.prev_fechamento || '').slice(0, 7)) + '"></label></div>',
      enviar: function (c) {
        return api('PUT', '/oportunidades/' + o.id + '/previsao', { tipo: radio(c, 'tipo'), mensal: valor(c, 'mensal'), meses: valor(c, 'meses'), unica: valor(c, 'unica'), fechamento: valor(c, 'fechamento') })
          .then(function () { aviso('Valores salvos. O Painel já considera.'); depois(); });
      }
    });
    ligarTipo(camada);
  }

  // contrato: registrar no Ganho (com a sugestão da assinatura ou da previsão), cadastrar cliente que já paga, editar
  function registrarContrato(o, depois) {
    api('GET', '/oportunidades/' + o.id + '/contrato-sugerido').then(function (s) { formContrato({ oportunidade: o, sugestao: s }, depois); })
      .catch(function (e) { aviso(e.message, true); });
  }
  function abrirContrato(c, depois) {
    if (!c) return;
    if (c.origem !== 'venda') return formContrato({ contrato: c }, depois);
    modal({
      titulo: 'Venda Lançada', subtitulo: c.empresa + ': ' + c.descricao, botao: 'Cancelar Esta Venda', fechar: 'Voltar',
      corpo: '<p class="op-nada">' + esc(resumoContrato(c)) + '. Total de ' + esc(real(c.mensal || c.unica)) + (c.mensal ? ' por mês' : '') + '.</p>' +
        '<p class="op-nada">Venda lançada não se edita. Se algo mudou, cancele e lance de novo.</p>',
      enviar: function () { return api('POST', '/contratos/' + c.id + '/cancelar', {}).then(function () { aviso('Venda cancelada. Saiu do Painel.'); depois(); }); }
    });
  }
  function formContrato(op, depois) {
    var c = op.contrato || op.sugestao || {};
    var novo = !op.contrato;
    var escolher = novo && !op.oportunidade && !op.empresa;
    var nome = op.contrato ? op.contrato.empresa : op.oportunidade ? op.oportunidade.empresa.nome : op.empresa ? op.empresa.nome : '';
    var sub = op.contrato ? 'As mudanças valem no Painel na hora.'
      : op.oportunidade ? (c.origem === 'assinatura' ? 'Valores da assinatura do cliente. Confira e salve.' : 'Valores previstos na oportunidade. Confira e salve.')
      : 'Para um cliente que já paga. Entra como garantida no Painel.';
    var abrir = function (lista) {
      var corpo = (escolher
        ? '<label class="campo"><span>Cliente</span><input type="text" name="cliente" list="lista-clientes-c" autocomplete="off" required placeholder="Comece a digitar o nome"></label><datalist id="lista-clientes-c">' +
          lista.map(function (e) { return '<option value="' + esc(e.nome) + '">'; }).join('') + '</datalist>'
        : '<div class="campo-grupo">' + esc(nome) + '</div>') +
        campo('descricao', 'O Que Foi Contratado', c.descricao || '', 'text', 'maxlength="120" required placeholder="Ex.: Plataforma com a Joice"') +
        '<div class="campo-grupo">Mensalidade</div>' + escolhaTipo('tipo', c.tipo === 'projeto' ? 'projeto' : 'recorrente', [['recorrente', 'Recorrente'], ['projeto', 'Projeto com Prazo']]) +
        '<div class="duas">' + campoValor('mensal', 'Mensalidade (R$)', c.mensal || '') +
        '<label class="campo"><span>Início da Cobrança</span><input type="month" name="inicio" value="' + esc(c.inicio || mesSeguinte(mesAtual())) + '"></label></div>' +
        '<label class="campo" data-so-projeto><span>Por Quantos Meses</span><input type="number" name="meses" min="1" max="120" inputmode="numeric" value="' + (c.meses || '') + '"></label>' +
        '<div class="duas"><label class="campo"><span>Desconto Temporário (%)</span><input type="number" name="desconto_pct" min="0" max="100" inputmode="numeric" value="' + (c.desconto_pct || '') + '"></label>' +
        '<label class="campo"><span>Nos Primeiros Meses</span><input type="number" name="desconto_meses" min="0" max="60" inputmode="numeric" value="' + (c.desconto_meses || '') + '"><small>O desconto não reduz o MRR.</small></label></div>' +
        '<div class="campo-grupo">Receita Única</div>' +
        '<div class="tres">' + campoValor('unica', 'Valor (R$)', c.unica || '') +
        '<label class="campo"><span>Mês</span><input type="month" name="unica_mes" value="' + esc(c.unica_mes || mesAtual()) + '"></label>' +
        '<label class="campo"><span>Parcelas</span><input type="number" name="unica_parcelas" min="1" max="36" inputmode="numeric" value="' + (c.unica_parcelas || 1) + '"></label></div>' +
        (op.contrato ? '<button type="button" class="btn-texto-perigo" data-cancelar-contrato>Cancelar Este Contrato</button>' : '');
      var camada = modal({
        titulo: novo ? (op.oportunidade ? 'Registrar Contrato' : 'Novo Contrato') : 'Editar Contrato', subtitulo: sub, botao: 'Salvar Contrato', classe: 'largo', corpo: corpo,
        enviar: function (m) {
          var d = { descricao: valor(m, 'descricao'), tipo: radio(m, 'tipo'), mensal: valor(m, 'mensal'), inicio: valor(m, 'inicio'), meses: valor(m, 'meses'),
            desconto_pct: valor(m, 'desconto_pct'), desconto_meses: valor(m, 'desconto_meses'), unica: valor(m, 'unica'), unica_mes: valor(m, 'unica_mes'), unica_parcelas: valor(m, 'unica_parcelas') };
          if (op.oportunidade) d.oportunidade_id = op.oportunidade.id;
          else if (op.empresa) d.empresa_id = op.empresa.id;
          else if (escolher) {
            var alvo = valor(m, 'cliente').toLowerCase(), e = lista.filter(function (x) { return x.nome.toLowerCase() === alvo; })[0];
            if (!e) return Promise.reject(new Error('Escolha um cliente cadastrado. Para um cliente novo, cadastre a empresa em Empresas.'));
            d.empresa_id = e.id;
          }
          return api(novo ? 'POST' : 'PUT', novo ? '/contratos' : '/contratos/' + op.contrato.id, d).then(function () { aviso('Contrato salvo. Já entra no Painel.'); depois(); });
        }
      });
      ligarTipo(camada);
      var cx = $('[data-cancelar-contrato]', camada);
      if (cx) cx.addEventListener('click', function () {
        if (!window.confirm('Cancelar este contrato? Ele sai do Painel.')) return;
        api('POST', '/contratos/' + op.contrato.id + '/cancelar', {}).then(function () { camada.remove(); aviso('Contrato cancelado. Saiu do Painel.'); depois(); })
          .catch(function (e) { aviso(e.message, true); });
      });
    };
    if (escolher) api('GET', '/empresas').then(abrir).catch(function (e) { aviso(e.message, true); }); else abrir([]);
  }

  // Lançar Venda: venda a quem já é cliente, sem proposta; entra como garantida no mês escolhido (o próximo, por padrão)
  function formVenda(empresa, depois) {
    var abrir = function (lista) {
      var camada = modal({
        titulo: 'Lançar Venda', subtitulo: 'Venda a quem já é cliente, sem proposta. Entra como garantida no Painel.', botao: 'Lançar Venda',
        corpo: (empresa ? '<div class="campo-grupo">' + esc(empresa.nome) + '</div>'
          : '<label class="campo"><span>Cliente</span><input type="text" name="cliente" list="lista-clientes-v" autocomplete="off" required placeholder="Comece a digitar o nome"></label><datalist id="lista-clientes-v">' +
            lista.map(function (e) { return '<option value="' + esc(e.nome) + '">'; }).join('') + '</datalist>') +
          campo('descricao', 'O Que Foi Vendido', '', 'text', 'maxlength="120" required placeholder="Ex.: Landing Page"') +
          escolhaTipo('tipo', 'unica', [['unica', 'Venda Única'], ['recorrente', 'Recorrente']]) +
          '<div class="tres"><label class="campo"><span>Quantidade</span><input type="number" name="quantidade" min="1" max="9999" inputmode="numeric" value="1"></label>' +
          campoValor('valor_unitario', 'Valor de Cada (R$)', '') +
          '<label class="campo campo-total"><span>Total</span><input type="text" name="total" readonly value=""></label></div>' +
          '<label class="campo"><span data-rot-mes>Mês de Faturamento</span><input type="month" name="mes" value="' + mesSeguinte(mesAtual()) + '"><small data-dica-mes></small></label>',
        enviar: function (c) {
          var id = empresa ? empresa.id : null;
          if (!id) {
            var alvo = valor(c, 'cliente').toLowerCase(), e = lista.filter(function (x) { return x.nome.toLowerCase() === alvo; })[0];
            if (!e) return Promise.reject(new Error('Escolha um cliente cadastrado. Para um cliente novo, cadastre a empresa em Empresas.'));
            id = e.id;
          }
          return api('POST', '/vendas', { empresa_id: id, descricao: valor(c, 'descricao'), tipo: radio(c, 'tipo'), quantidade: valor(c, 'quantidade'), valor_unitario: valor(c, 'valor_unitario'), mes: valor(c, 'mes') })
            .then(function (r) {
              aviso(r.mensal ? 'Venda recorrente de ' + real(r.mensal) + ' por mês a partir de ' + nomeMes(r.inicio) + '.' : 'Venda de ' + real(r.unica) + ' lançada para ' + nomeMes(r.unica_mes) + '.');
              depois();
            });
        }
      });
      var atualiza = function () {
        var q = parseInt(valor(camada, 'quantidade'), 10) || 0, u = parseInt(valor(camada, 'valor_unitario'), 10) || 0, rec = radio(camada, 'tipo') === 'recorrente';
        $('[name=total]', camada).value = q && u ? real(q * u) + (rec ? ' por mês' : '') : '';
        $('[data-rot-mes]', camada).textContent = rec ? 'A Partir de' : 'Mês de Faturamento';
        $('[data-dica-mes]', camada).textContent = rec ? 'Soma ao MRR a partir deste mês.' : 'Entra como receita única neste mês.';
      };
      camada.addEventListener('input', atualiza); camada.addEventListener('change', atualiza); atualiza();
    };
    if (empresa) abrir([]); else api('GET', '/empresas').then(abrir).catch(function (e) { aviso(e.message, true); });
  }

  // ---------- Painel ----------
  function kpi(titulo, valorTxt, sub) { return '<div class="kpi"><small>' + esc(titulo) + '</small><strong>' + esc(valorTxt) + '</strong><span>' + sub + '</span></div>'; }
  function telaPainel() {
    cabecalho('painel', '<button type="button" class="btn btn-primario" id="lancar-venda" aria-label="Lançar Venda">' + icone('mais', 'icone-p') + '<span class="btn-rot">Lançar Venda</span></button>');
    $('#lancar-venda').addEventListener('click', function () { formVenda(null, telaPainel); });
    var raiz = $('#tela');
    if (!raiz.querySelector('.painel')) raiz.innerHTML = '<div class="vazio">Carregando</div>';
    Promise.all([api('GET', '/painel'), api('GET', '/contratos')]).then(function (r) {
      if (estado.volta !== 'painel') return;
      desenharPainel(raiz, r[0], r[1]);
    }).catch(function (e) { raiz.innerHTML = '<div class="vazio">' + esc(e.message) + '</div>'; });
  }
  function desenharPainel(raiz, p, contratos) {
    estado.painel = p;
    if (estado.painelMes == null || estado.painelMes >= p.meses.length) estado.painelMes = 0;
    var m = p.meses, f = p.faturar, r = p.receita, a = p.andamento, d = p.desempenho;
    var de = m[0].nome.toLowerCase(), ate = m[m.length - 1].nome.toLowerCase();
    var maxEtapa = Math.max.apply(null, p.etapas.map(function (x) { return x.mrr; }).concat([1]));
    var selo = function (x) {
      var perigo = x.tipo === 'vence' || x.tipo === 'data_passou' || x.tipo === 'sem_contrato';
      return '<span class="selo ' + (perigo ? 'selo-perigo' : 'selo-alerta') + '">' + icone(x.tipo === 'vence' || x.tipo === 'data_passou' ? 'relogio' : 'alerta') + esc(x.selo) + '</span>';
    };
    var prevTot = p.previsao.reduce(function (s, x) { return [s[0] + x.qtd, s[1] + x.mrr_pond, s[2] + x.unica_pond]; }, [0, 0, 0]);
    raiz.innerHTML = '<div class="painel">' +
      '<section class="proj" aria-label="Projeção de Recebimento"><div class="proj-cab"><h3>Projeção de Recebimento</h3><p>' + esc(m[0].nome + ' a ' + m[m.length - 1].nome) + ': o que já é garantido e o que o funil projeta</p></div>' +
      '<div class="legenda proj-leg" aria-hidden="true"><span><i class="sw sw1"></i>Garantida (MRR e Fechadas)</span><span><i class="sw sw2"></i>Projetado Recorrente</span><span><i class="sw sw3"></i>Projetado Não Recorrente</span></div>' +
      '<div class="grafico" id="proj-grafico"></div><div class="proj-mes-cab" id="proj-mes-cab"></div><div class="proj-totais" id="proj-totais"></div></section>' +

      '<section class="secao"><h3>Quanto Tenho para Faturar</h3><p class="dica">Só o que já está contratado: mensalidades dos clientes, propostas fechadas e vendas lançadas.</p>' +
      '<div class="destaque"><div class="destaque-num"><small>A Faturar nos Próximos ' + m.length + ' Meses</small><strong>' + esc(real(f.total)) + '</strong><span>De ' + esc(de) + ' a ' + esc(ate) + ' · ' + esc(real(f.recorrente)) + ' recorrente e ' + esc(real(f.unica)) + ' única</span></div>' +
      '<div class="kpis kpis-3">' + kpi('A Faturar em ' + f.mes_atual.nome, real(f.mes_atual.total), esc(real(f.mes_atual.recorrente) + ' recorrente e ' + real(f.mes_atual.unica) + ' única')) +
      kpi('Clientes Ativos', String(f.clientes), esc(plural(f.clientes_recorrentes, 'recorrente', 'recorrentes') + (f.clientes_outros ? ' e ' + plural(f.clientes_outros, 'só com receita única', 'só com receita única') : ''))) +
      kpi('MRR Contratado', real(f.mrr), f.mrr_novo ? '<b>+ ' + esc(real(f.mrr_novo)) + '</b> novos em ' + esc(f.mes_atual.nome.toLowerCase()) : 'Nenhum novo em ' + esc(f.mes_atual.nome.toLowerCase())) + '</div></div></section>' +
      '<div class="cartao-p"><div class="cartao-cab-p"><h4>Clientes e Contratos</h4><button type="button" class="btn btn-p" id="novo-contrato">' + icone('mais', 'icone-p') + 'Novo Contrato</button></div>' +
      (contratos.length ? '<div class="contratos-lista">' + contratos.map(function (c) { return itemContrato(c, true); }).join('') + '</div>'
        : '<p class="vazio-p">Nenhum contrato ainda. Cadastre os clientes que já pagam para a garantida aparecer.</p>') + '</div>' +

      '<section class="secao"><h3>Quanto Terei de Receita</h3><p class="dica">O contratado somado à projeção do funil, ponderada pela chance de cada etapa.</p>' +
      '<div class="destaque"><div class="destaque-num destaque-2"><small>Receita nos Próximos ' + m.length + ' Meses</small><strong>' + esc(real(r.total)) + '</strong><span>' + esc(real(r.garantido)) + ' contratado + ' + esc(real(r.projetado)) + ' projeção do funil</span></div>' +
      '<div class="kpis kpis-3">' + kpi('Recorrente em ' + m.length + ' Meses', real(r.recorrente.total), esc(real(r.recorrente.contratado) + ' contratado + ' + real(r.recorrente.projetado) + ' projeção')) +
      kpi('Receita Única em ' + m.length + ' Meses', real(r.unica.total), esc(real(r.unica.contratado) + ' contratado + ' + real(r.unica.projetado) + ' projeção')) +
      kpi('MRR em ' + r.mrr_fim.mes, real(r.mrr_fim.valor), 'Hoje ' + esc(real(r.mrr_fim.hoje)) + ' · <b>+ ' + esc(real(r.mrr_fim.projetado)) + '</b> projetado') + '</div></div></section>' +

      '<section class="secao"><h3>Negócios em Andamento</h3><p class="dica">Oportunidades abertas. O valor ponderado multiplica cada negócio pela chance da etapa.</p><div class="kpis">' +
      kpi('Oportunidades Abertas', String(a.abertas), esc(plural(a.com_proposta, 'com proposta enviada', 'com proposta enviada'))) +
      kpi('MRR em Negociação', real(a.mrr), 'Ponderado: ' + esc(real(a.mrr_pond))) +
      kpi('Receita Única em Negociação', real(a.unica), 'Ponderado: ' + esc(real(a.unica_pond))) + '</div></section>' +

      '<div class="duas-col"><div class="cartao-p"><h4>Precisa de Atenção</h4>' + (p.atencao.length ? '<ul class="atencao">' + p.atencao.map(function (x) {
        return '<li data-op="' + x.oportunidade_id + '" tabindex="0"><div class="txt"><strong>' + esc(x.empresa) + '</strong><small>' + esc(x.texto) + '</small></div>' + selo(x) + '</li>';
      }).join('') + '</ul>' : '<p class="vazio-p">Nada pendente. Todos os negócios estão em dia.</p>') + '</div>' +
      '<div class="cartao-p"><h4>Por Etapa</h4>' + p.etapas.map(function (x) {
        return '<div class="etapa-linha"><span class="rot"><b>' + esc(x.nome) + '</b><small>' + esc(plural(x.qtd, 'negócio', 'negócios')) + ' · chance ' + x.chance + '%</small></span><span class="barra" data-w="' + Math.round(x.mrr / maxEtapa * 100) + '"></span>' +
          '<span class="val">' + esc(real(x.mrr)) + '<small>+ ' + esc(real(x.unica)) + ' única</small></span></div>';
      }).join('') + '<p class="mini">Barras: MRR em negociação por etapa</p></div></div>' +

      '<section class="secao"><h3>Previsão de Fechamento</h3><p class="dica">Pela data prevista de cada oportunidade. Valores ponderados pela chance da etapa.</p><div class="cartao-p">' +
      (p.previsao.length ? '<table class="tab"><thead><tr><th>Mês</th><th>Negócios</th><th>MRR</th><th>Única</th></tr></thead><tbody>' + p.previsao.map(function (x) {
        return '<tr><td>' + esc(x.nome) + '</td><td>' + x.qtd + '</td><td>' + esc(real(x.mrr_pond)) + '</td><td>' + esc(real(x.unica_pond)) + '</td></tr>';
      }).join('') + '<tr class="total"><td>Total</td><td>' + prevTot[0] + '</td><td>' + esc(real(prevTot[1])) + '</td><td>' + esc(real(prevTot[2])) + '</td></tr></tbody></table>'
        : '<p class="vazio-p">Nenhuma oportunidade aberta.</p>') + '</div></section>' +

      '<section class="secao"><h3>Desempenho Comercial</h3><p class="dica">Como o funil vem convertendo. Ajuda a calibrar as chances de cada etapa.</p><div class="kpis">' +
      kpi('Taxa de Conversão', d.conversao == null ? 'Sem Base' : d.conversao + '%', d.conversao == null ? 'Ainda não há proposta enviada' : esc(plural(d.ganhos, 'ganho', 'ganhos') + ' em ' + plural(d.propostas, 'proposta enviada', 'propostas enviadas'))) +
      kpi('Ciclo de Venda', d.ciclo_dias == null ? 'Sem Base' : plural(d.ciclo_dias, 'dia', 'dias'), d.ciclo_dias == null ? 'Nenhum negócio ganho ainda' : 'Da criação ao Ganho, em média') +
      kpi('Ticket Médio', d.ticket == null ? 'Sem Base' : real(d.ticket), d.ticket == null ? 'Nenhum cliente recorrente ainda' : 'MRR médio por cliente recorrente') + '</div></section>' +
      '</div>';

    raiz.querySelectorAll('[data-w]').forEach(function (el) { el.style.width = el.getAttribute('data-w') + '%'; });
    raiz.querySelectorAll('[data-op]').forEach(function (el) {
      var ir = function () { location.hash = '#/oportunidade/' + el.getAttribute('data-op'); };
      el.addEventListener('click', ir);
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') ir(); });
    });
    raiz.querySelectorAll('[data-contrato]').forEach(function (el) {
      var abrir = function () { abrirContrato(contratos.filter(function (x) { return String(x.id) === el.getAttribute('data-contrato'); })[0], telaPainel); };
      el.addEventListener('click', abrir);
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') abrir(); });
    });
    $('#novo-contrato', raiz).addEventListener('click', function () { formContrato({}, telaPainel); });
    desenharGrafico();
  }

  // gráfico da Projeção de Recebimento: barras empilhadas, total em cima, mês escolhido em destaque e selo no mês atual
  function desenharGrafico() {
    var g = $('#proj-grafico'), p = estado.painel;
    if (!g || !p) return;
    var M = p.meses, sel = estado.painelMes;
    var gar = function (x) { return x.mrr + x.fech; };
    var total = function (x) { return gar(x) + x.pr + x.pn; };
    var mil = function (v) { return (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil'; };
    var W = Math.max(280, g.clientWidth - 18), H = W < 500 ? 318 : 338, esq = 52, dir = 6, topo = 30, base = 54;
    var maior = Math.max.apply(null, M.map(total).concat([1000]));
    var bruto = maior / 4, mag = Math.pow(10, Math.floor(Math.log10(bruto)));
    var passo = [1, 2, 2.5, 5, 10].map(function (k) { return k * mag; }).filter(function (v) { return v >= bruto; })[0];
    var max = passo * Math.ceil(maior * 1.08 / passo);
    var larg = (W - esq - dir) / M.length, barra = Math.min(64, larg * .62);
    var y = function (v) { return topo + (H - topo - base) * (1 - v / max); };
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Projeção de recebimento mês a mês">' +
      '<defs><pattern id="listra" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#8fdcc0"/><rect width="3.5" height="8" fill="#1baf7a"/></pattern>' +
      '<pattern id="listra-c" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#c6eedf"/><rect width="3.5" height="8" fill="#76cfac"/></pattern></defs>';
    for (var t = 0; t <= max + 1; t += passo) {
      s += '<line x1="' + esq + '" x2="' + (W - dir) + '" y1="' + y(t) + '" y2="' + y(t) + '" stroke="' + (t === 0 ? '#cfd4da' : '#e3e5e8') + '" stroke-width="1"' + (t === 0 ? '' : ' stroke-dasharray="4 4"') + '/>' +
        '<text class="eixo" x="' + (esq - 10) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + (t === 0 ? '0' : mil(t)) + '</text>';
    }
    M.forEach(function (m, i) {
      var x = esq + i * larg + (larg - barra) / 2, ativo = i === sel;
      if (ativo) s += '<rect x="' + (esq + i * larg + 3) + '" y="' + (topo - 26) + '" width="' + (larg - 6) + '" height="' + (H - topo - base + 30) + '" rx="10" fill="#f3f5f6"/>';
      var partes = [[gar(m), ativo ? '#2a78d6' : '#7aa9e8'], [m.pr, ativo ? '#e34948' : '#ee8a89'], [m.pn, ativo ? 'url(#listra)' : 'url(#listra-c)']].filter(function (q) { return q[0] > 0; });
      var acum = 0;
      partes.forEach(function (q, k) {
        var y1 = y(acum + q[0]), h = y(acum) - y1, ultimo = k === partes.length - 1, hh = Math.max(0, h - (k > 0 ? 2 : 0)), rr = ultimo ? Math.min(4, hh) : 0;
        s += ultimo
          ? '<path d="M' + x + ' ' + (y1 + hh) + 'V' + (y1 + rr) + 'Q' + x + ' ' + y1 + ' ' + (x + rr) + ' ' + y1 + 'H' + (x + barra - rr) + 'Q' + (x + barra) + ' ' + y1 + ' ' + (x + barra) + ' ' + (y1 + rr) + 'V' + (y1 + hh) + 'Z" fill="' + q[1] + '"/>'
          : '<rect x="' + x + '" y="' + y1 + '" width="' + barra + '" height="' + hh + '" fill="' + q[1] + '"/>';
        acum += q[0];
      });
      s += '<text class="rot-total' + (ativo ? ' sel' : '') + '" x="' + (x + barra / 2) + '" y="' + (y(total(m)) - 8) + '" text-anchor="middle">' + mil(total(m)) + '</text>' +
        '<text class="eixo' + (ativo ? ' sel' : '') + '" x="' + (x + barra / 2) + '" y="' + (H - 30) + '" text-anchor="middle">' + m.nome.slice(0, 3) + '</text>' +
        (i === 0 ? '<rect x="' + (x + barra / 2 - 23) + '" y="' + (H - 21) + '" width="46" height="18" rx="9" fill="#246b60"/><text class="selo-atual" x="' + (x + barra / 2) + '" y="' + (H - 8) + '" text-anchor="middle">Atual</text>' : '') +
        '<rect class="alvo" data-i="' + i + '" x="' + (esq + i * larg) + '" y="0" width="' + larg + '" height="' + H + '" fill="transparent"><title>' + m.nome + ': ' + real(total(m)) + '</title></rect>';
    });
    g.innerHTML = s + '</svg>';
    g.querySelectorAll('.alvo').forEach(function (el) { el.addEventListener('click', function () { estado.painelMes = +el.getAttribute('data-i'); desenharGrafico(); }); });
    var x = M[sel];
    $('#proj-mes-cab').innerHTML = '<b>' + esc(x.nome + (sel === 0 ? ' (Atual)' : '') + ': ' + real(total(x)) + ' a receber') + '</b><small>Toque numa barra para ver outro mês</small>';
    $('#proj-totais').innerHTML =
      '<div><small><i class="sw sw1"></i>Garantida</small><strong>' + esc(real(gar(x))) + '</strong><span class="det">' + esc(real(x.mrr) + ' MRR + ' + real(x.fech) + ' fechadas') + '</span></div>' +
      '<div><small><i class="sw sw2"></i>Recorrente</small><strong>' + esc(real(x.pr)) + '</strong><span class="det">Projetado</span></div>' +
      '<div><small><i class="sw sw3"></i>Não Recorrente</small><strong>' + esc(real(x.pn)) + '</strong><span class="det">Projetado</span></div>';
  }
  var tmGrafico = null;
  window.addEventListener('resize', function () { clearTimeout(tmGrafico); tmGrafico = setTimeout(desenharGrafico, 150); });

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
      if (!$('#tela').innerHTML) telaPainel();
      return telaOportunidade(m[1]);
    }
    document.querySelectorAll('.op-camada').forEach(function (c) { c.remove(); });
    if (h === 'empresas') return telaEmpresas();
    if (h === 'propostas') return telaPropostas();
    if (h === 'funil') return telaFunil();
    if (h !== 'painel') { history.replaceState(null, '', '#/painel'); }
    telaPainel();
  }
  window.addEventListener('hashchange', function () {
    // link do e-mail aberto na mesma aba do CRM: a página não recarrega, então a troca do # leva à criação da senha
    var r = location.hash.match(/^#\/redefinir\/([a-f0-9]{64})$/);
    if (r) { tokenRedefinir = r[1]; $('#app').hidden = true; $('#entrada').hidden = false; telaEntrada('redefinir'); return; }
    if (!$('#app').hidden) rotear();
  });

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
  // aberto pelo link do e-mail: mostra direto a criação da senha nova, mesmo com uma sessão aberta
  if (tokenRedefinir) { $('#entrada').hidden = false; telaEntrada('redefinir'); } else iniciar();
  // app instalável no celular: o service worker guarda só a casca da tela (ver sw.js)
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/crm/sw.js', { scope: '/crm' }).catch(function () { /* sem app instalável, o CRM segue no navegador */ });
})();
