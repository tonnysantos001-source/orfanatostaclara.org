document.addEventListener('DOMContentLoaded', () => {
  // ============ PIX Modal Elements ============
  const modal = document.getElementById('pix-modal');
  const modalBackdrop = modal?.querySelector('.modal-backdrop');
  const modalClose = document.getElementById('modal-close');
  const modalQrcode = document.getElementById('modal-qrcode');
  const modalPixText = document.getElementById('modal-pix-text');
  const modalBtnCopy = document.getElementById('modal-btn-copy');
  const modalStatus = document.getElementById('modal-status');
  const modalAmount = document.getElementById('modal-amount');
  const modalTimer = document.getElementById('modal-timer');
  const modalSuccess = document.getElementById('modal-success');

  let timerInterval = null;
  let copyTimeout = null;

  function startCountdown(start, timeout) {
    stopCountdown();
    const update = () => {
      const remaining = Math.max(0, timeout - (Date.now() - start));
      const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
      const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
      if (modalTimer) modalTimer.textContent = `${mm}:${ss}`;
      if (remaining <= 0) {
        stopCountdown();
        if (modalStatus) {
          modalStatus.textContent = 'Expirado';
          modalStatus.classList.remove('blink');
        }
      }
    };
    update();
    timerInterval = setInterval(update, 1000);
  }

  function stopCountdown() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function log(...args) {
    console.log('[PagFlex]', ...args);
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    if (modalSuccess) modalSuccess.classList.add('hidden');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
    stopCountdown();
    setTimeout(() => {
      if (modalQrcode) modalQrcode.innerHTML = '';
    }, 300);
  }

  // Close PIX modal handlers
  if (modalClose) {
    modalClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('show')) {
      closeModal();
    }
  });

  // Copy to clipboard
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      log('Pix copiado');
      return true;
    } catch (e) {
      log('Falha ao copiar', e?.message || e);
      return false;
    }
  }

  if (modalBtnCopy) {
    modalBtnCopy.addEventListener('click', async () => {
      const originalHtml = modalBtnCopy.innerHTML;
      const ok = await copyToClipboard(modalPixText.value);
      if (ok) {
        if (copyTimeout) {
          clearTimeout(copyTimeout);
          copyTimeout = null;
        }
        modalBtnCopy.innerHTML = `
          <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>COPIADO!</span>
        `;
        copyTimeout = setTimeout(() => {
          modalBtnCopy.innerHTML = originalHtml;
          copyTimeout = null;
        }, 3000);
      }
    });
  }

  // ============ Donation Modal ============
  const donationModal = document.getElementById('donation-modal');
  const donationModalBackdrop = donationModal?.querySelector('.modal-backdrop');
  const donationModalClose = document.getElementById('donation-modal-close');
  const donationAmountBtns = document.querySelectorAll('.donation-amount-btn');
  const donationRange = document.getElementById('donation-range');
  const rangeDisplay = document.getElementById('range-display');
  const continueToPix = document.getElementById('continue-to-pix');

  let selectedAmount = 30;

  function openDonationModal() {
    if (!donationModal) return;
    donationModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeDonationModal() {
    if (!donationModal) return;
    donationModal.classList.remove('show');
    document.body.style.overflow = '';
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function updateRangeDisplay(value) {
    if (rangeDisplay) {
      rangeDisplay.textContent = formatCurrency(Number(value));
    }
  }

  function selectAmount(amount) {
    selectedAmount = amount;
    if (donationRange) {
      donationRange.value = amount;
    }
    updateRangeDisplay(amount);
    donationAmountBtns.forEach(btn => {
      if (Number(btn.dataset.value) === amount) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  // Connect all .btn-donate buttons to open donation modal
  const donateButtons = document.querySelectorAll('.btn-donate');
  donateButtons.forEach(btn => {
    // Skip the "continue to pix" button
    if (btn.id === 'continue-to-pix') return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDonationModal();
    });
  });

  // Close donation modal
  if (donationModalClose) {
    donationModalClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeDonationModal();
    });
  }

  if (donationModalBackdrop) {
    donationModalBackdrop.addEventListener('click', closeDonationModal);
  }

  // Amount button clicks
  donationAmountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = Number(btn.dataset.value);
      selectAmount(amount);
    });
  });

  // Range slider
  if (donationRange) {
    donationRange.addEventListener('input', (e) => {
      const value = Number(e.target.value);
      selectedAmount = value;
      updateRangeDisplay(value);
      donationAmountBtns.forEach(btn => btn.classList.remove('selected'));
    });
  }

  // Continue to PIX - Generate and show QR code
  if (continueToPix) {
    continueToPix.addEventListener('click', async () => {
      closeDonationModal();

      const amount_cents = Math.round(selectedAmount * 100);

      openModal();
      if (modalQrcode) modalQrcode.innerHTML = '';
      if (modalPixText) modalPixText.value = '';
      if (modalStatus) {
        modalStatus.textContent = 'Gerando PIX...';
        modalStatus.classList.add('blink');
      }
      log('Gerando PIX', amount_cents);

      try {
        const resp = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount_cents })
        });
        const body = await resp.json();

        if (!body.ok) throw body;

        const { id, pixCode, pixSvg } = body.data || {};
        if (!id || !pixCode) throw new Error('Resposta inválida do servidor');

        if (modalPixText) modalPixText.value = pixCode;
        if (modalAmount) {
          modalAmount.textContent = (amount_cents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
        }

        if (pixSvg && typeof pixSvg === 'string' && pixSvg.trim().length > 0) {
          if (modalQrcode) modalQrcode.innerHTML = pixSvg;
        } else {
          if (modalQrcode) modalQrcode.textContent = 'QR não disponível';
        }

        if (modalStatus) {
          modalStatus.textContent = 'Aguardando pagamento';
          modalStatus.classList.add('blink');
        }
        log('QR gerado, polling', id);

        // Start countdown and polling
        const start = Date.now();
        const timeout = 30 * 60 * 1000; // 30 minutes
        startCountdown(start, timeout);
        let done = false;

        const poll = async () => {
          if (done) return;
          if (Date.now() - start > timeout) {
            if (modalStatus) {
              modalStatus.textContent = 'Expirado';
              modalStatus.classList.remove('blink');
            }
            log('Tempo esgotado');
            stopCountdown();
            return;
          }

          try {
            const sresp = await fetch(`/api/status?txid=${encodeURIComponent(id)}`);
            const sbody = await sresp.json();
            log('status', sbody);

            const status = sbody?.status || sbody?.state || sbody?.data?.status;
            if (status && String(status).toLowerCase() === 'paid') {
              done = true;
              if (modalStatus) {
                modalStatus.textContent = 'Pago!';
                modalStatus.classList.remove('blink');
              }
              if (modalSuccess) modalSuccess.classList.remove('hidden');
              log('Pagamento confirmado');
              stopCountdown();
              setTimeout(() => closeModal(), 3000);
              return;
            }
          } catch (err) {
            log('Erro polling', err?.message || err);
          }

          setTimeout(poll, 2500);
        };

        poll();
      } catch (err) {
        if (modalStatus) {
          modalStatus.textContent = 'Erro ao gerar PIX';
          modalStatus.classList.remove('blink');
        }
        log('Erro', err?.error ? JSON.stringify(err.error) : (err?.message || err));
      }
    });
  }

  // Escape key to close donation modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && donationModal?.classList.contains('show')) {
      closeDonationModal();
    }
  });

  log('Inicializado');
});
