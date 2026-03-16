<?php

$cpf = $_POST['cpf'] ?? null;

$cpf = preg_replace('/[^0-9]/', '', $cpf);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.mytrust.space/v1/cpf/" . $cpf);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Accept: application/json',
    'x-trust-key: sk_01jsyv6sy42ctxdv23aj17r89901jsyv6sy46dcfxzrfq2995t23',
    'Content-Type: application/json'
));

$resposta = curl_exec($ch);

curl_close($ch);

echo $resposta;

$dados = json_decode($resposta, true);

$nome = $dados['data']['DADOS_PESSOAIS']['NOME'] ?? '';
$nascimento = $dados['data']['DADOS_PESSOAIS']['DATA_NASCIMENTO'] ?? '';

echo $nome;

echo $nascimento;

header("Location: index.php?cpf=$cpf&nome=$nome&nascimento=$nascimento");

?>