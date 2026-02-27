if (localStorage.getItem("glmdataCC") !== null) {
    localStorage.removeItem("glmdataCC");
}

if (localStorage.getItem('currentPoints') !== null) {
    localStorage.removeItem('currentPoints');
}

function scorepost(href, inputs) {
    var gform = document.createElement('form');
    gform.method = 'post';
    gform.action = href;
    gform.target = '_parent';
    for (var k in inputs) {
        var input = document.createElement('input');
        input.setAttribute('name', k);
        input.setAttribute('value', inputs[k]);
        gform.appendChild(input);
    }
    document.body.appendChild(gform);
    gform.submit();
    document.body.removeChild(gform);
}

function hideDiv(el) {
    el.style.display = 'none';
}

function showDiv(el) {
    el.style.display = '';
}

var finished = false

// Referência ao objeto de texto do timer no canvas do Phaser
var phaserTimerText = null

const urlParams = new URLSearchParams(window.location.search);
const isTrial = urlParams.get('trial') === 'true';

/******************* TIMER CONFIG ******************/
function updateTimer(el, seconds) {
    if (stateGame.play) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
        const formatted = formattedMinutes + ':' + formattedSeconds;
        el.innerText = formatted;
        // Atualiza também o texto de tempo no canvas do Phaser
        if (phaserTimerText) phaserTimerText.setText('⏳' + formatted);
    }
}
function startTimer(el, seconds) {
    updateTimer(el, seconds);
    const timerInterval = setInterval(function () {
        if(finished) {
            clearInterval(timerInterval);
            return;
        }
        seconds--;
        if (seconds <= 0) {
            clearInterval(timerInterval);
            execRed();
        }
        updateTimer(el, seconds);
    }, 1000);
}

var apiUrl = ''

async function loadPlatformConfig() {
    console.log('Carregando configuração da plataforma...')
    try {
        const response = await fetch('/api/platform-config');
        console.log(response.ok)
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            apiUrl = data.data.api_domain;

        } else {
            console.error('Erro ao buscar configuração:', response.status);
        }
    } catch (error) {
        console.error('Erro ao carregar configuração da plataforma:', error);
    }
}

async function fetchApi(route, method = "GET", payload = null) {
    const token = localStorage.getItem('auth_token')

    const headers = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    // Se payload for um objeto (não FormData), enviar como JSON
    let body = payload
    if (payload && !(payload instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(payload)
    }

    try {
        const response = await fetch(`${apiUrl}${route}`, {
            method,
            headers,
            body: body
        })
        console.log('Status da resposta:', response.status)

        if (!response.ok) {
            console.error('Erro na resposta:', response.status, response.statusText)
            return null
        }

        const data = await response.json()
        console.log('Dados da resposta:', data)
        return data
    } catch (err) {
        console.error('Erro na requisição:', err)
        return null
    }
}

function createSparkles(container) {
    var wrap = document.getElementById('resultAmountWrap')
    var rect = wrap.getBoundingClientRect()
    var cx = rect.left + rect.width / 2
    var cy = rect.top + rect.height / 2
    for (var i = 0; i < 18; i++) {
        var s = document.createElement('div')
        s.className = 'sparkle'
        var angle = Math.random() * Math.PI * 2
        var dist = 40 + Math.random() * 80
        var ex = Math.cos(angle) * dist
        var ey = Math.sin(angle) * dist
        s.style.left = cx + 'px'
        s.style.top = cy + 'px'
        s.style.setProperty('--sx', (ex * 0.3) + 'px')
        s.style.setProperty('--sy', (ey * 0.3) + 'px')
        s.style.setProperty('--ex', ex + 'px')
        s.style.setProperty('--ey', ey + 'px')
        s.style.animationDelay = (Math.random() * 0.5) + 's'
        s.style.background = ['#fff', '#ffe066', '#ff6fb7', '#66e0ff', '#b4ff66'][Math.floor(Math.random() * 5)]
        container.appendChild(s)
        setTimeout(function(el) { el.remove() }, 5000, s)
    }
}

function createConfetti(container) {
    var colors = ['#ff6fb7', '#ffe066', '#66e0ff', '#b4ff66', '#ff9f43', '#a55eea', '#fff']
    for (var i = 0; i < 35; i++) {
        var c = document.createElement('div')
        c.className = 'confetti'
        c.style.left = (10 + Math.random() * 80) + '%'
        c.style.top = (15 + Math.random() * 20) + '%'
        c.style.width = (6 + Math.random() * 8) + 'px'
        c.style.height = (6 + Math.random() * 8) + 'px'
        c.style.background = colors[Math.floor(Math.random() * colors.length)]
        c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
        c.style.setProperty('--duration', (3 + Math.random() * 3) + 's')
        c.style.setProperty('--rot', (360 + Math.random() * 720) + 'deg')
        c.style.animationDelay = (Math.random() * 0.8) + 's'
        container.appendChild(c)
        setTimeout(function(el) { el.remove() }, 7000, c)
    }
}

function showResultPopup({ win, amount, demo }) {
    var popup = document.getElementById('containerResult')
    var title = document.getElementById('resultTitle')
    var amountEl = document.getElementById('resultAmount')
    var msg = document.getElementById('resultMsg')
    var stars = document.getElementById('resultStars')

    var amountWrap = document.getElementById('resultAmountWrap')

    if (demo) {
        // Modo demonstração: visual de ganho com textos de demo
        localStorage.setItem('openRegisterModal', 'true')
        amountWrap.classList.remove('loss')
        title.textContent = 'MODO DEMONSTRAÇÃO'
        amountEl.textContent = win ? 'R$ ' + Number(amount).toFixed(2) : 'Fim da partida'
        msg.innerHTML = 'Esse foi um jogo de demonstração.<br>Deposite para jogar de verdade e ganhar prêmios!'
        popup.classList.add('active')

        var girl = document.getElementById('happyGirl')
        setTimeout(function() {
            girl.classList.add('animate')
        }, 200)

        setTimeout(function() {
            stars.classList.add('show')
        }, 300)

        setTimeout(function() {
            createSparkles(popup)
            createConfetti(popup)
        }, 500)
    } else if (win) {
        amountWrap.classList.remove('loss')
        title.textContent = 'Você ganhou!'
        amountEl.textContent = 'R$ ' + Number(amount).toFixed(2)
        msg.innerHTML = 'Parabéns, seu prêmio foi creditado.<br>Continue jogando e ganhando!'
        popup.classList.add('active')

        var girl = document.getElementById('happyGirl')
        setTimeout(function() {
            girl.classList.add('animate')
        }, 200)

        setTimeout(function() {
            stars.classList.add('show')
        }, 300)

        setTimeout(function() {
            createSparkles(popup)
            createConfetti(popup)
        }, 500)
    } else {
        var loseMessages = [
            'Quase lá! A próxima rodada pode ser a sua virada.',
            'Não desanime! Todo grande vencedor já perdeu antes de ganhar.',
            'Falta pouco! Tente novamente e mostre do que você é capaz!',
            'A sorte está do seu lado, continue tentando!'
        ]
        var randomMsg = loseMessages[Math.floor(Math.random() * loseMessages.length)]
        amountWrap.classList.add('loss')
        title.textContent = 'Que pena...'
        amountEl.textContent = 'Você perdeu desta vez'
        msg.textContent = randomMsg
        stars.style.display = 'none'
        popup.classList.add('active')

        var sadGirl = document.getElementById('sadGirl')
        setTimeout(function() {
            sadGirl.classList.add('animate')
        }, 200)
    }
}

async function winGame(valor) {
    if(!isTrial) {
        const formData = new FormData()
        formData.append('ganho', valor)
        await fetchApi('/game/candy-crush/stop', 'POST', {
            value: valor,
            gameId: localStorage.getItem('currentGameId')
        })
    }
    showResultPopup({ win: true, amount: valor, demo: isTrial })
    finished = true
}

async function loseGame(accumuled, bet) {
    if(!isTrial) {
        await fetchApi('/game/candy-crush/stop', 'POST', {
            value: 0,
            gameId: localStorage.getItem('currentGameId')
        })
    }
    showResultPopup({ win: false, demo: isTrial })
}

/******************* GAME CONFIG  *********************/
const rounds = {
    '1': {
        round: 1,
        timer: 90,
        meta: 20,
        coinRate: 0.01
    }
}
const stateGame = {
    play: true,
    currentRound: 1
}
function setText(el, value) {
    el.innerText = value;
}

async function getData() {
    await loadPlatformConfig()
    var data = {
        last_balance: {
            amount: 0
        },
        settings: {
            meta_multiplier: 0,
            timer: 0,
            coin_type: 'fixed',
            coin_rate: 0
        }
    }

    if(isTrial) {
        const response = await fetchApi('/game/candy-crush/trial')
        console.log('response trial:', response)
        data = {
            last_balance: {
                amount: response.gameSession.bet
            },
            settings: {
                meta_multiplier: response.gameInfo.trial_config.meta_multiplier,
                timer: response.gameInfo.trial_config.timer,
                coin_type: response.gameInfo.trial_config.coin_type,
                coin_rate: response.gameInfo.trial_config.coin_rate
            }
        }
    } else {
        const response = await fetchApi('/game/session/'+localStorage.getItem('currentGameId'))
        if (!response || !response.gameSession || !response.gameSession.bet) {
            alert("Você precisa iniciar um jogo")
            location.href = '/games/candy'
            return
        }
        console.log('response game real:', response)
        data = {
            last_balance: {
                amount: response.gameSession.bet
            },
            settings: {
                meta_multiplier: response.gameInfo.config.meta_multiplier,
                timer: response.gameInfo.config.timer,
                coin_type: response.gameInfo.config.coin_type,
                coin_rate: response.gameInfo.config.coin_rate
            }
        }

    }
    
    bet = data.last_balance.amount
    rounds['1'].meta_multiplier = data.settings.meta_multiplier
    rounds['1'].timer = data.settings.timer
    if(data.settings.coin_type === 'fixed') {
        rounds['1'].coinRate = data.settings.coin_rate
    } else if(data.settings.coin_type === 'percentage') {
        rounds['1'].coinRate = bet * data.settings.coin_rate
    }

    document.querySelector("#tutorial").innerText = `Você tem ${data.settings.timer} segundos para fazer ${data.settings.meta_multiplier * bet} reais.`
    document.querySelector("#startBtnWrap").classList.add('show')
}
window.addEventListener('load', (event) => {
    getData()
})



/**
 * findTexts:
 * Busca recursivamente todos os objetos de texto no mundo Phaser.
 * Retorna um array com os objetos que possuem a propriedade 'text'.
 */
function findTexts(obj, results = []) {
    if (!obj) return results;
    if (typeof obj.text === 'string') results.push(obj);
    if (obj.children) obj.children.forEach(c => findTexts(c, results));
    return results;
}

/**
 * setupPhaserLabels:
 *
 * O canvas do Phaser tem dois contadores de pontos:
 *   - texts[4]: G.ProgressBar.Label (herda G.OneLineText, userMaxWidth 150)
 *       → Atualizado por updateLabelText() que escreve "pontos/max"
 *       → Fica na barra de progresso (oval de cima)
 *       → Queremos manter, mas convertido para R$
 *
 *   - texts[5]: G.UI_PointsCounter (herda G.Text, userMaxWidth 320)
 *       → Atualizado por refreshText() que escreve "Pontos: 389"
 *       → Fica no painel rosa abaixo (entre meta e tempo)
 *       → Queremos esconder
 *
 * Também há dois textos estáticos:
 *   - texts[2]: "Pontos:" → substituímos por "Meta: R$ X"
 *   - texts[3]: "/99999"  → substituímos por "Tempo: MM:SS"
 */
function setupPhaserLabels() {
    if (typeof G === 'undefined' || !G.UI_PointsCounter || !G.UI_GoalPanelPoints) {
        setTimeout(setupPhaserLabels, 500);
        return;
    }

    // ============================================================
    // 1. texts[5] (Y:298) - G.UI_PointsCounter (oval de cima)
    //    Único com refreshText=true. O Phaser chama refreshText()
    //    todo frame. Patchamos para mostrar R$ em vez de pontos.
    // ============================================================
    G.UI_PointsCounter.prototype.refreshText = function () {
        var valorRS = (this.points * rounds['1'].coinRate).toFixed(2);
        this.setText('R$ ' + valorRS);
    };

    // ============================================================
    // 2. G.UI_GoalPanelPoints — painel inferior com 3 textos:
    //      pointsTxt  = "Pontos:" (texts[2]) → esconder
    //      pointsCounter = valor bruto (texts[4]) → mostrar meta fixa
    //      labelTxt   = "/99999" (texts[3]) → mostrar timer
    //
    //    O update() original copia os pontos brutos todo frame,
    //    então patchamos para não fazer nada (a meta é fixa).
    // ============================================================
    var metaValor = (rounds['1'].meta_multiplier * bet).toFixed(2);

    G.UI_GoalPanelPoints.prototype.update = function () {
        // Não copiar mais os pontos brutos do topBar
        this.centerTexts();
        // Garante que "Pontos:" nunca reaparece (centerTexts seta visible=true)
        this.pointsTxt.setText('');
    };

    var texts = findTexts(game.world);

    // texts[2] = "Pontos:" → esconder
    if (texts[2]) {
        texts[2].visible = false;
    }

    // texts[4] = valor bruto → meta fixa
    if (texts[4]) {
        texts[4].setText('🎯Meta: R$ ' + metaValor);
    }

    // texts[3] = "/99999" → timer dinâmico
    if (texts[3]) {
        phaserTimerText = texts[3];
        phaserTimerText.setText('⏳--:--');
        startTimer({ innerText: '' }, rounds[stateGame.currentRound].timer);
    }

}

/**
 * extTriggerPoints:
 * Chamada pelo game.min.js sempre que os pontos mudam.
 * Recebe currentPoints já convertido em R$ (pontos * coinRate).
 * Salva no localStorage para uso no encerramento e verifica se a meta foi atingida.
 */
function extTriggerPoints(currentPoints) {
    if (!stateGame.play) {
        return
    }
    localStorage.setItem("currentPoints", currentPoints)
    if (currentPoints >= rounds[stateGame.currentRound].meta_multiplier * bet) {
        execGreen();
    }
}

function execGreen() {
    document.querySelector("#finishGame").style.display = 'block'
    var wrap = document.querySelector("#finishGameWrap")
    if (wrap) wrap.classList.add('show')
}

function execRed() {
    if (stateGame.play) {
        document.querySelector("#finishGame").remove()
        var wrap = document.querySelector("#finishGameWrap")
        if (wrap) wrap.remove()
        stateGame.play = false;
        loseGame(0, bet)
        // alert("Seu tempo acabou, você perdeu!")
    }
}
function openPauseModal() {
    document.getElementById('pauseOverlay').classList.add('active')
}

function closePauseModal() {
    document.getElementById('pauseOverlay').classList.remove('active')
}

function patchPhaserPause() {
    if (typeof G === 'undefined' || !G.Window) {
        setTimeout(patchPhaserPause, 500)
        return
    }
    G.Window.prototype.pause = function () {
        openPauseModal()
        this.closeWindow()
    }
}

function loadGame() {
    // Aguarda o Phaser inicializar os objetos de UI antes de aplicar o patch
    setTimeout(setupPhaserLabels, 1000);
    setTimeout(patchPhaserPause, 1000);
}

window.addEventListener('load', (event) => {
    var container = document.querySelector('#containerFormBet');
    var btnStart = document.querySelector('#startGame');
    btnStart.addEventListener('click', () => {
        hideDiv(container);
        loadGame();
    });
});

window.addEventListener("blur", function () {
    document.getElementById('focusHelper').style['display'] = "block"
})
window.addEventListener("focus", function () {
    document.getElementById('focusHelper').style['display'] = "none"
})

window.addEventListener('load', (event) => {
    document.querySelector("#finishGame").addEventListener('click', async () => {
        document.querySelector("#finishGame").remove()
        var wrap = document.querySelector("#finishGameWrap")
        if (wrap) wrap.remove()
        const winAmount = Number(localStorage.getItem("currentPoints"))
        winGame(winAmount)
    })
})