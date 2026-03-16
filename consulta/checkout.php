<?php
$visitantes_data = "../dados/visitantes.json";
function contar_checkout($visitantes_data) {
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
            "checkout" => 0 // Inicializa como número para contagem
        ];
    }
    
    // Garante que a chave "checkout" existe no array e é um número
    if (!isset($dados["checkout"]) || !is_numeric($dados["checkout"])) {
        $dados["checkout"] = 0;
    }
    
    // Incrementa o contador de checkout para cada acesso
    $dados["checkout"] += 1;
    
    // Tenta salvar os dados atualizados no arquivo JSON
    $result = @file_put_contents($visitantes_data, json_encode($dados, JSON_PRETTY_PRINT));
    if ($result === false) {
        $error .= "Erro ao salvar o arquivo JSON. Verifique as permissões de escrita. ";
    }
    
    // Para depuração, descomente a linha abaixo para ver os erros
    // echo "Debug: " . $error;
}

// Executa a contagem de checkout
contar_checkout($visitantes_data);

$url = file_get_contents("../dados/url.txt");

// Redireciona para outra página (substitua 'https://example.com' pelo destino desejado)
header("Location: " . $url);
exit(); // Garante que o script pare após o redirecionamento
?>
