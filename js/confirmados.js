const form = document.getElementById("consultaForm");
const cpfInput = document.getElementById("cpf");
const resultado = document.getElementById("resultado");
const btnConsultar = document.getElementById("btnConsultar");


// =====================================================
// FORMATAÇÃO DO CPF
// =====================================================

cpfInput.addEventListener("input", function () {

    let cpf = this.value.replace(/\D/g, "");

    if (cpf.length > 11) {
        cpf = cpf.substring(0, 11);
    }

    cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    cpf = cpf.replace(
        /^(\d{3})\.(\d{3})\.(\d{3})(\d)/,
        "$1.$2.$3-$4"
    );

    this.value = cpf;
});


// =====================================================
// LIMPAR CPF
// =====================================================

function limparCPF(cpf) {

    return cpf.replace(/\D/g, "");

}


// =====================================================
// VALIDAÇÃO BÁSICA DO CPF
// =====================================================

function cpfValido(cpf) {

    cpf = limparCPF(cpf);

    if (cpf.length !== 11) {
        return false;
    }

    // CPFs com todos os números iguais são inválidos
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    return true;

}


// =====================================================
// GERAR SHA-256
// =====================================================

async function gerarHash(texto) {

    const encoder = new TextEncoder();

    const data = encoder.encode(texto);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

}


// =====================================================
// LER CSV
// =====================================================

async function carregarPagamentos() {

    const resposta = await fetch(
        "dados/pagamentos.csv?versao=" + Date.now()
    );

    if (!resposta.ok) {
        throw new Error(
            "Não foi possível acessar a base de pagamentos."
        );
    }

    const csv = await resposta.text();

    return csv;

}


// =====================================================
// TRANSFORMAR CSV EM REGISTROS
// =====================================================

function interpretarCSV(csv) {

    const linhas = csv
        .split(/\r?\n/)
        .map(linha => linha.trim())
        .filter(linha => linha.length > 0);

    if (linhas.length < 2) {
        return [];
    }

    const registros = [];

    for (let i = 1; i < linhas.length; i++) {

        const partes = linhas[i].split(",");

        const cpfHash = partes[0]
            ? partes[0].trim().toLowerCase()
            : "";

        const status = partes[1]
            ? partes[1].trim().toLowerCase()
            : "";

        const atualizadoEm = partes[2]
            ? partes[2].trim()
            : "";

        if (!cpfHash) {
            continue;
        }

        registros.push({
            cpfHash,
            status,
            atualizadoEm
        });

    }

    return registros;

}


// =====================================================
// TEXTO DO STATUS
// =====================================================

function normalizarStatus(status) {

    status = status
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (
        status === "confirmado" ||
        status === "pago"
    ) {
        return "confirmado";
    }

    if (
        status === "pendente" ||
        status === "aguardando"
    ) {
        return "pendente";
    }

    if (
        status === "analise" ||
        status === "em analise"
    ) {
        return "analise";
    }

    return "desconhecido";

}


// =====================================================
// EXIBIR RESULTADO
// =====================================================

function exibirResultado(
    tipo,
    icone,
    titulo,
    mensagem,
    data = ""
) {

    let classe = "alert-secondary";

    if (tipo === "success") {
        classe = "alert-success";
    }

    if (tipo === "warning") {
        classe = "alert-warning";
    }

    if (tipo === "danger") {
        classe = "alert-danger";
    }

    if (tipo === "info") {
        classe = "alert-info";
    }


    let dataHTML = "";

    if (data) {

        dataHTML = `
            <div class="small text-muted mt-3">
                <i class="bi bi-clock me-1"></i>
                Última atualização: ${data}
            </div>
        `;

    }


    resultado.innerHTML = `

        <div class="alert ${classe} text-center mb-0">

            <div class="fs-1 mb-2">
                <i class="bi ${icone}"></i>
            </div>

            <h3 class="h5 fw-bold">
                ${titulo}
            </h3>

            <p class="mb-0">
                ${mensagem}
            </p>

            ${dataHTML}

        </div>

    `;

}


// =====================================================
// CONSULTA
// =====================================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    const cpf = limparCPF(cpfInput.value);


    // Validação

    if (!cpfValido(cpf)) {

        exibirResultado(
            "warning",
            "bi-exclamation-triangle-fill",
            "CPF inválido",
            "Digite um CPF válido com 11 números."
        );

        return;

    }


    // Estado de carregamento

    btnConsultar.disabled = true;

    btnConsultar.innerHTML = `
        <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
        ></span>
        Consultando...
    `;


    resultado.innerHTML = "";


    try {

        // Gera o hash do CPF

        const cpfHash = await gerarHash(cpf);


        // Carrega CSV

        const csv = await carregarPagamentos();


        // Interpreta registros

        const registros = interpretarCSV(csv);


        // Procura CPF

        const registro = registros.find(
            item => item.cpfHash === cpfHash
        );


        // Não encontrado

        if (!registro) {

            exibirResultado(
                "warning",
                "bi-person-x-fill",
                "CPF não encontrado",
                "Não encontramos este CPF na lista de participantes."
            );

            return;

        }


        const status = normalizarStatus(
            registro.status
        );


        // CONFIRMADO

        if (status === "confirmado") {

            exibirResultado(
                "success",
                "bi-check-circle-fill",
                "Pagamento confirmado",
                "Seu pagamento foi localizado e está confirmado.",
                registro.atualizadoEm
            );

            return;

        }


        // PENDENTE

        if (status === "pendente") {

            exibirResultado(
                "warning",
                "bi-hourglass-split",
                "Pagamento pendente",
                "Seu pagamento ainda não foi confirmado pela organização.",
                registro.atualizadoEm
            );

            return;

        }


        // EM ANÁLISE

        if (status === "analise") {

            exibirResultado(
                "info",
                "bi-search",
                "Pagamento em análise",
                "Seu pagamento foi localizado e está em processo de conferência.",
                registro.atualizadoEm
            );

            return;

        }


        // STATUS DESCONHECIDO

        exibirResultado(
            "info",
            "bi-info-circle-fill",
            "Cadastro localizado",
            "Seu cadastro foi localizado, mas a situação do pagamento precisa ser verificada pela organização.",
            registro.atualizadoEm
        );


    } catch (erro) {

        console.error(erro);

        exibirResultado(
            "danger",
            "bi-x-circle-fill",
            "Erro na consulta",
            "Não foi possível consultar a situação do pagamento. Tente novamente mais tarde."
        );

    } finally {

        btnConsultar.disabled = false;

        btnConsultar.innerHTML = `
            <i class="bi bi-search me-2"></i>
            Consultar pagamento
        `;

    }

});
