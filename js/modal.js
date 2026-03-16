document.getElementById("formRastreio").addEventListener("submit", function(e) {
    e.preventDefault(); // Impede envio imediato

    // Mostrar o modal
    document.getElementById("modal").classList.remove("hidden");

    // Aguardar 7 segundos (7000ms), depois enviar
    setTimeout(() => {
        e.target.submit(); // Envia o formulário após a espera
    }, 7000);
});