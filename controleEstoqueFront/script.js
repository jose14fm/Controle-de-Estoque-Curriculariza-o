const CONFIG = {
    API_BASE: 'http://localhost:8080'
};

let APP_STATE = {
    token: null,
    usuario: null,
    tema: localStorage.getItem('tema') || 'light'
};

let IS_LOGGED_IN = false;

const DEFAULT_MOCK_DATA = {
    produtos: [
        { id: 1, nome: 'Notebook Dell Inspiron', codigo: 'NTB-DLL-001', descricao: 'Dell i5 8GB RAM SSD 256GB', valorUnidade: 2499.99, quantidadeEstoque: 15, estoqueMinimo: 5 },
        { id: 2, nome: 'Mouse Gamer RGB', codigo: 'MS-GMR-002', descricao: 'Mouse gamer 6400DPI', valorUnidade: 159.90, quantidadeEstoque: 32, estoqueMinimo: 10 }
    ],
    categorias: [
        { id: 1, nome: 'Eletrónicos' },
        { id: 2, nome: 'Informática' }
    ],
    movimentacoes: [
        { id: 1, tipo: 'ENTRADA', produtoId: 1, quantidade: 10, data: new Date().toLocaleDateString('pt-BR') },
        { id: 2, tipo: 'SAÍDA', produtoId: 2, quantidade: 5, data: new Date().toLocaleDateString('pt-BR') }
    ],
    logs: [
        { id: 1, nivel: 'INFO', mensagem: 'Sistema iniciado.', usuario: 'Sistema', data: new Date().toLocaleString('pt-BR') },
        { id: 2, nivel: 'SUCESSO', mensagem: 'Mock Data Carregado.', usuario: 'Sistema', data: new Date().toLocaleString('pt-BR') }
    ],
    usuarios: [
        { email: 'admin@stock.com', senha: '123', nome: 'Admin Master' }
    ]
};

let MOCK_DATA = {};

function saveMocks() {
    try {
        localStorage.setItem('stockMasterMocks', JSON.stringify(MOCK_DATA));
    } catch (e) {
        console.error("Erro ao salvar dados no localStorage:", e);
    }
}

function loadMocks() {
    try {
        const savedData = localStorage.getItem('stockMasterMocks');
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage, usando padrão:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_MOCK_DATA)); 
}


class GerenciadorTema {
    static inicializar() {
        const temaSalvo = localStorage.getItem('tema') || 'light';
        this.definirTema(temaSalvo);
        this.criarBotaoTema();
    }

    static definirTema(tema) {
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('tema', tema);
        APP_STATE.tema = tema;
        
        const botaoTema = document.querySelector('.theme-toggle');
        if (botaoTema) {
            botaoTema.innerHTML = tema === 'light' ? '🌙' : '☀️';
        }
    }

    static alternarTema() {
        const novoTema = APP_STATE.tema === 'light' ? 'dark' : 'light';
        this.definirTema(novoTema);
        this.mostrarMensagem(`Tema ${novoTema === 'dark' ? 'escuro' : 'claro'} ativado`, 'info');
    }

    static criarBotaoTema() {
        let botao = document.querySelector('.theme-toggle');
        
        if (!botao) {
            botao = document.createElement('button');
            botao.className = 'theme-toggle';
            botao.title = 'Alternar tema';
            botao.onclick = () => this.alternarTema();
            document.body.appendChild(botao);
        }
        
        botao.innerHTML = APP_STATE.tema === 'light' ? '🌙' : '☀️';
    }

    static mostrarMensagem(mensagem, tipo = 'info') {
        alert(`📢 ${mensagem}`);
    }
}

class ApiClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE;
    }

    async requisicao(endpoint, opcoes = {}) {
        try {
            const config = { method: opcoes.method || 'GET', headers: { 'Content-Type': 'application/json' }, mode: 'cors' };
            if (opcoes.body) { config.body = JSON.stringify(opcoes.body); }
            console.log(`🔗 ${config.method} ${this.baseURL}${endpoint}`);
            const resposta = await fetch(`${this.baseURL}${endpoint}`, config);
            if (resposta.ok) {
                const contentType = resposta.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) { return await resposta.json(); }
                return await resposta.text();
            }
            throw new Error(`HTTP ${resposta.status}`);
        } catch (erro) {
            console.error('❌ Erro real de API, usando mock:', erro);
            return await this.simularRequisicao(endpoint, opcoes);
        }
    }

    async simularRequisicao(endpoint, opcoes) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let result = null;

        switch (endpoint) {
            case '/logar':
                result = opcoes.body ? { token: 'token-simulado-success' } : null;
                break;
                
            case '/cadastroUsuario':
                result = opcoes.body ? { message: 'Usuário cadastrado com sucesso!' } : null;
                break;
                
            case '/produtos':
                if (opcoes.method === 'POST') {
                    const novoProduto = { id: MOCK_DATA.produtos.length + 1, ...opcoes.body, quantidadeEstoque: 0 };
                    MOCK_DATA.produtos.push(novoProduto); 
                    MOCK_DATA.logs.push({ id: MOCK_DATA.logs.length + 1, nivel: 'SUCESSO', mensagem: `Produto ID ${novoProduto.id} cadastrado.`, usuario: 'Usuário', data: new Date().toLocaleString('pt-BR') });
                    result = { message: 'Produto cadastrado com sucesso!', id: novoProduto.id };
                    saveMocks();
                } else {
                    result = MOCK_DATA.produtos;
                }
                break;
                
            case '/categorias':
                if (opcoes.method === 'POST') {
                    const novaCategoria = { id: MOCK_DATA.categorias.length + 1, ...opcoes.body };
                    MOCK_DATA.categorias.push(novaCategoria);
                    result = { message: 'Categoria criada com sucesso!', id: novaCategoria.id };
                    saveMocks();
                } else {
                    result = MOCK_DATA.categorias;
                }
                break;
                
            case '/movimentacao/entrada': { 
                const novaMovimentacao = { id: MOCK_DATA.movimentacoes.length + 1, tipo: 'ENTRADA', produtoId: opcoes.body.produto.id, quantidade: opcoes.body.quantidade, data: new Date().toLocaleDateString('pt-BR') };
                MOCK_DATA.movimentacoes.push(novaMovimentacao);
                MOCK_DATA.logs.push({ id: MOCK_DATA.logs.length + 1, nivel: 'INFO', mensagem: `Entrada de ${opcoes.body.quantidade} do produto ${opcoes.body.produto.id}.`, usuario: 'Usuário', data: new Date().toLocaleString('pt-BR') });
                result = 'Entrada registrada com sucesso!';
                saveMocks();
                break;
            }
                
            case '/movimentacao/saida': { 
                const novaMovimentacao = { id: MOCK_DATA.movimentacoes.length + 1, tipo: 'SAÍDA', produtoId: opcoes.body.produto.id, quantidade: opcoes.body.quantidade, data: new Date().toLocaleDateString('pt-BR') };
                MOCK_DATA.movimentacoes.push(novaMovimentacao);
                MOCK_DATA.logs.push({ id: MOCK_DATA.logs.length + 1, nivel: 'INFO', mensagem: `Saída de ${opcoes.body.quantidade} do produto ${opcoes.body.produto.id}.`, usuario: 'Usuário', data: new Date().toLocaleString('pt-BR') });
                result = 'Saída registrada com sucesso!';
                saveMocks();
                break;
            }
                
            case '/relatorios/estoque': result = MOCK_DATA.produtos; break;
            case '/relatorios/movimentacoes': result = MOCK_DATA.movimentacoes; break;
            case '/relatorios/logs': result = MOCK_DATA.logs; break;
                
            default:
                result = { message: 'Simulado: ' + endpoint };
        }
        
        return result;
    }

    async login(credenciais) { return await this.requisicao('/logar', { method: 'POST', body: credenciais }); }
    async cadastrarUsuario(usuario) { return await this.requisicao('/cadastroUsuario', { method: 'POST', body: usuario }); }
    async listarProdutos() { return await this.requisicao('/produtos'); }
    async cadastrarProduto(produto) { return await this.requisicao('/produtos', { method: 'POST', body: produto }); }
    async listarCategorias() { return await this.requisicao('/categorias'); }
    async cadastrarCategoria(categoria) { return await this.requisicao('/categorias', { method: 'POST', body: categoria }); }
    async registrarEntrada(movimentacao) { return await this.requisicao('/movimentacao/entrada', { method: 'POST', body: movimentacao }); }
    async registrarSaida(movimentacao) { return await this.requisicao('/movimentacao/saida', { method: 'POST', body: movimentacao }); }
    async obterRelatorioEstoque() { return await this.requisicao('/relatorios/estoque'); }
    async obterRelatorioMovimentacoes() { return await this.requisicao('/relatorios/movimentacoes'); }
    async obterRelatorioLogs() { return await this.requisicao('/relatorios/logs'); }
}

const api = new ApiClient();

class GerenciadorUI {
    static mostrarMensagem(mensagem, tipo = 'info') {
        alert(`📢 ${mensagem}`);
    }

    static atualizarTabela(dados, containerId, colunas) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!dados || dados.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Nenhum dado encontrado</p></div>';
            return;
        }

        let html = `<div class="table-container"><table class="table"><thead><tr>${colunas.map(col => `<th>${col.titulo}</th>`).join('')}</tr></thead><tbody>`;
        dados.forEach(item => {
            html += '<tr>';
            colunas.forEach(col => {
                const valor = col.acessor ? col.acessor(item) : item[col.chave];
                const display = col.chave === 'valorUnidade' ? `R$ ${(parseFloat(valor) || 0).toFixed(2)}` : (valor || '-');
                html += `<td>${display}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    static limparFormulario(cardId) {
        const form = document.querySelector(`#${cardId} form`); 
        if (form) form.reset();
    }
}

function toggleAccess(isLoggedIn, showTabId = 'produtos-tab') {
    IS_LOGGED_IN = isLoggedIn;
    const protectedTabIds = ['tab-produtos', 'tab-categorias', 'tab-movimentacao', 'tab-relatorios'];
    
    protectedTabIds.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.disabled = !isLoggedIn;
        }
    });

    if (isLoggedIn) {
        SistemaEstoque.abrirTab(showTabId, true);
    } else {
        SistemaEstoque.abrirTab('login-tab', true);
    }
}

class SistemaEstoque {
    static inicializar() {
        toggleAccess(false, 'login-tab'); 
    }

    static abrirTab(tabId, isSystemCall = false) {
        if (!IS_LOGGED_IN && tabId !== 'login-tab' && !isSystemCall) {
            GerenciadorUI.mostrarMensagem('🚫 Acesso negado. Faça login primeiro.', 'error');
            return;
        }
        
        document.querySelectorAll('.tab-content').forEach(aba => { aba.classList.remove('active'); aba.style.display = 'none'; });
        document.querySelectorAll('.nav-tab').forEach(tab => { tab.classList.remove('active'); });
        
        const abaAlvo = document.getElementById(tabId);
        if (abaAlvo) { abaAlvo.style.display = 'block'; abaAlvo.classList.add('active'); }
        
        const tabBotao = document.getElementById(`tab-${tabId}`); 
        if (tabBotao) { tabBotao.classList.add('active'); }
        this.carregarDadosAba(tabId);
    }

    static carregarDadosAba(tabId) {
        switch (tabId) {
            case 'produtos-tab': this.carregarProdutos(true); break;
            case 'categorias-tab': this.carregarCategorias(true); break;
        }
    }

    static async carregarProdutos(init = false) {
        try {
            const produtos = await api.listarProdutos();
            const colunas = [{ titulo: 'ID', chave: 'id' }, { titulo: 'Nome', chave: 'nome' }, { titulo: 'Código', chave: 'codigo' }, { titulo: 'Valor', chave: 'valorUnidade' }, { titulo: 'Estoque', chave: 'quantidadeEstoque' }];
            GerenciadorUI.atualizarTabela(produtos, 'listaProdutos', colunas);
            if (!init) GerenciadorUI.mostrarMensagem('📦 Produtos carregados!', 'info');
        } catch (erro) { console.error('Erro ao carregar produtos:', erro); }
    }
    static async carregarCategorias(init = false) {
        try {
            const categorias = await api.listarCategorias();
            const colunas = [{ titulo: 'ID', chave: 'id' }, { titulo: 'Nome', chave: 'nome' }];
            GerenciadorUI.atualizarTabela(categorias, 'listaCategorias', colunas);
            if (!init) GerenciadorUI.mostrarMensagem('📁 Categorias carregadas!', 'info');
        } catch (erro) { console.error('Erro ao carregar categorias:', erro); }
    }
    static async cadastrarProduto() {
        const nome = document.getElementById('prodNome')?.value;
        const codigo = document.getElementById('prodCodigo')?.value;
        if (!nome || !codigo) { GerenciadorUI.mostrarMensagem('Preencha nome e código!', 'error'); return; }
        try {
            await api.cadastrarProduto({ nome, codigo, descricao: document.getElementById('prodDescricao')?.value || '', valorUnidade: parseFloat(document.getElementById('prodValor')?.value || 0), estoqueMinimo: parseInt(document.getElementById('prodEstoqueMin')?.value || 0) });
            GerenciadorUI.mostrarMensagem('Produto cadastrado!', 'success');
            GerenciadorUI.limparFormulario('produtoForm');
            await this.carregarProdutos(true);
        } catch (erro) { GerenciadorUI.mostrarMensagem('Erro ao cadastrar produto', 'error'); }
    }
    static async cadastrarCategoria() {
        const nome = document.getElementById('catNome')?.value;
        if (!nome) { GerenciadorUI.mostrarMensagem('Preencha o nome!', 'error'); return; }
        try {
            await api.cadastrarCategoria({ nome });
            GerenciadorUI.mostrarMensagem('Categoria criada!', 'success');
            GerenciadorUI.limparFormulario('categoriaForm');
            await this.carregarCategorias(true);
        } catch (erro) { GerenciadorUI.mostrarMensagem('Erro ao criar categoria', 'error'); }
    }
    static async registrarEntrada() {
        const produtoId = document.getElementById('entradaProdutoId')?.value;
        const quantidade = document.getElementById('entradaQuantidade')?.value;
        if (!produtoId || !quantidade) { GerenciadorUI.mostrarMensagem('Preencha ID e quantidade!', 'error'); return; }
        try {
            await api.registrarEntrada({ produto: { id: parseInt(produtoId) }, quantidade: parseInt(quantidade) });
            GerenciadorUI.mostrarMensagem('Entrada registrada!', 'success');
            GerenciadorUI.limparFormulario('entradaForm');
        } catch (erro) { GerenciadorUI.mostrarMensagem('Erro ao registrar entrada', 'error'); }
    }
    static async registrarSaida() {
        const produtoId = document.getElementById('saidaProdutoId')?.value;
        const quantidade = document.getElementById('saidaQuantidade')?.value;
        if (!produtoId || !quantidade) { GerenciadorUI.mostrarMensagem('Preencha ID e quantidade!', 'error'); return; }
        try {
            await api.registrarSaida({ produto: { id: parseInt(produtoId) }, quantidade: parseInt(quantidade) });
            GerenciadorUI.mostrarMensagem('Saída registrada!', 'success');
            GerenciadorUI.limparFormulario('saidaForm');
        } catch (erro) { GerenciadorUI.mostrarMensagem('Erro ao registrar saída', 'error'); }
    }
    static async gerarRelatorioEstoque() {
        try {
            const estoque = await api.obterRelatorioEstoque();
            const colunas = [{ titulo: 'ID', chave: 'id' }, { titulo: 'Nome', chave: 'nome' }, { titulo: 'Estoque', chave: 'quantidadeEstoque' }, { titulo: 'Valor', chave: 'valorUnidade' }];
            GerenciadorUI.atualizarTabela(estoque, 'relatorioEstoque', colunas);
            GerenciadorUI.mostrarMensagem('Relatório de Estoque gerado!', 'success');
        } catch (erro) { GerenciadorUI.mostrarMensagem('Erro ao gerar relatório de estoque', 'error'); }
    }
    static async gerarRelatorioMovimentacoes() {
        try {
            const movimentacoes = await api.obterRelatorioMovimentacoes();
            const colunas = [{ titulo: 'ID', chave: 'id' }, { titulo: 'Tipo', chave: 'tipo' }, { titulo: 'Produto ID', chave: 'produtoId' }, { titulo: 'Quantidade', chave: 'quantidade' }, { titulo: 'Data', chave: 'data' }];
            GerenciadorUI.atualizarTabela(movimentacoes, 'relatorioMovimentacoes', colunas);
            GerenciadorUI.mostrarMensagem('Relatório de Movimentações gerado!', 'success');
        } catch (erro) { GerenciadorUI.mostrarMensagem('Erro ao gerar relatório de movimentações', 'error'); }
    }
    static async gerarRelatorioLogs() {
        try {
            const logs = await api.obterRelatorioLogs();
            const colunas = [{ titulo: 'ID', chave: 'id' }, { titulo: 'Nível', chave: 'nivel' }, { titulo: 'Mensagem', chave: 'mensagem' }, { titulo: 'Usuário', chave: 'usuario' }, { titulo: 'Data', chave: 'data' }];
            GerenciadorUI.atualizarTabela(logs, 'relatorioLogs', colunas);
            GerenciadorUI.mostrarMensagem('Relatório de Logs gerado!', 'success');
        } catch (erro) { GerenciadorUI.mostrarMensagem('Erro ao gerar relatório de logs', 'error'); }
    }
}

async function fazerLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const senha = document.getElementById('loginSenha')?.value;
    
    if (!email || !senha) {
        GerenciadorUI.mostrarMensagem('Preencha email e senha!', 'error');
        return false;
    }
    
    const user = MOCK_DATA.usuarios.find(u => u.email === email && u.senha === senha);

    if (user) { 
        await api.login({ email, senha }); 
        
        toggleAccess(true, 'produtos-tab');
        GerenciadorUI.mostrarMensagem(`✅ Bem-vindo(a), ${user.nome}!`, 'success');
        GerenciadorUI.limparFormulario('loginCard'); 
    } else {
        GerenciadorUI.mostrarMensagem('❌ Credenciais inválidas. Verifique e-mail/senha ou cadastre-se.', 'error');
    }
    return false;
}

async function cadastrarUsuario() {
    const nome = document.getElementById('cadNome')?.value;
    const email = document.getElementById('cadEmail')?.value;
    const senha = document.getElementById('cadSenha')?.value;
    
    if (!nome || !email || !senha) {
        GerenciadorUI.mostrarMensagem('Preencha todos os campos!', 'error');
        return false;
    }

    const userExists = MOCK_DATA.usuarios.some(user => user.email === email);
    if (userExists) {
        GerenciadorUI.mostrarMensagem('❌ Este e-mail já está cadastrado. Faça login.', 'error');
        return false;
    }

    MOCK_DATA.usuarios.push({ nome, email, senha });
    saveMocks(); 
    
    const resposta = await api.cadastrarUsuario({ nome, email, senha });

    if (resposta && resposta.message) { 
        toggleAccess(true, 'produtos-tab');
        GerenciadorUI.mostrarMensagem(`✨ Usuário ${nome} cadastrado! Acesso liberado.`, 'success');
        GerenciadorUI.limparFormulario('cadastroCard'); 
    } else {
        GerenciadorUI.mostrarMensagem('❌ Erro no cadastro (Simulação).', 'error');
    }
    return false;
}

window.abrirTab = SistemaEstoque.abrirTab.bind(SistemaEstoque);
window.fazerLogin = fazerLogin;
window.cadastrarUsuario = cadastrarUsuario;
window.carregarProdutos = SistemaEstoque.carregarProdutos.bind(SistemaEstoque);
window.carregarCategorias = SistemaEstoque.carregarCategorias.bind(SistemaEstoque);
window.cadastrarProduto = SistemaEstoque.cadastrarProduto.bind(SistemaEstoque);
window.cadastrarCategoria = SistemaEstoque.cadastrarCategoria.bind(SistemaEstoque);
window.registrarEntrada = SistemaEstoque.registrarEntrada.bind(SistemaEstoque);
window.registrarSaida = SistemaEstoque.registrarSaida.bind(SistemaEstoque);
window.gerarRelatorioEstoque = SistemaEstoque.gerarRelatorioEstoque.bind(SistemaEstoque);
window.gerarRelatorioLogs = SistemaEstoque.gerarRelatorioLogs.bind(SistemaEstoque);
window.gerarRelatorioMovimentacoes = SistemaEstoque.gerarRelatorioMovimentacoes.bind(SistemaEstoque);
window.alternarTema = GerenciadorTema.alternarTema.bind(GerenciadorTema);

document.addEventListener('DOMContentLoaded', function() {
    MOCK_DATA = loadMocks(); 

    GerenciadorTema.inicializar();
    SistemaEstoque.inicializar();
});

window.liberarTudo = function() {
    toggleAccess(true, 'produtos-tab');
    GerenciadorUI.mostrarMensagem('🔓 ACESSO TOTAL LIBERADO!', 'info');
};