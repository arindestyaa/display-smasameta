document.addEventListener('DOMContentLoaded', function() {
    // Variabel dan state sistem
    let currentQueueNumber = 1;
    let selectedOperator = 1;
    let soundEnabled = true;
    let darkTheme = false;
    let callHistory = [];
    
    // Daftar operator (8 operator)
    const operators = [
        { id: 1, name: "Operator 1 - Pendaftaran" },
        { id: 2, name: "Operator 2 - Berkas" },
        { id: 3, name: "Operator 3 - Wawancara" },
        { id: 4, name: "Operator 4 - Tes Akademik" },
        { id: 5, name: "Operator 5 - Tes Psikologi" },
        { id: 6, name: "Operator 6 - Kesehatan" },
        { id: 7, name: "Operator 7 - Pembayaran" },
        { id: 8, name: "Operator 8 - Pengambilan Hasil" }
    ];
    
    // Elemen DOM
    const currentQueueNumberElement = document.getElementById('current-queue-number');
    const currentQueueOperatorElement = document.getElementById('current-queue-operator');
    const nextQueueNumberElement = document.getElementById('next-queue-number');
    const queueInputElement = document.getElementById('queue-input');
    const operatorSelectorElement = document.getElementById('operator-selector');
    const callQueueButton = document.getElementById('call-queue');
    const queuedNumberElement = document.getElementById('queued-number');
    const queuedOperatorElement = document.getElementById('queued-operator');
    const historyListElement = document.getElementById('history-list');
    const resetQueueButton = document.getElementById('reset-queue');
    const applyQueueButton = document.getElementById('apply-queue');
    const decrementQueueButton = document.getElementById('decrement-queue');
    const incrementQueueButton = document.getElementById('increment-queue');
    const soundToggleButton = document.getElementById('sound-toggle');
    const themeToggleButton = document.getElementById('theme-toggle');
    const currentDateElement = document.getElementById('current-date');
    const currentTimeElement = document.getElementById('current-time');
    const notificationElement = document.getElementById('notification');
    
    // Inisialisasi
    function init() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        renderOperators();
        updateQueueDisplay();
        updateQueuedInfo();
        renderHistory();
        
        // Load saved state from localStorage
        loadState();
        
        // Event listeners
        setupEventListeners();
        
        // Show welcome notification
        showNotification('Sistem antrian SPMB siap digunakan!');
    }
    
    // Update tanggal dan waktu
    function updateDateTime() {
        const now = new Date();
        
        // Format tanggal: Hari, DD-MM-YYYY
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        const dayName = days[now.getDay()];
        const date = now.getDate();
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();
        
        currentDateElement.textContent = `${dayName}, ${date} ${monthName} ${year}`;
        
        // Format waktu: HH:MM:SS
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Render daftar operator
    function renderOperators() {
        operatorSelectorElement.innerHTML = '';
        
        operators.forEach(operator => {
            const button = document.createElement('button');
            button.className = `operator-btn ${operator.id === selectedOperator ? 'active' : ''}`;
            button.textContent = operator.name;
            button.dataset.operatorId = operator.id;
            
            button.addEventListener('click', () => {
                selectOperator(operator.id);
            });
            
            operatorSelectorElement.appendChild(button);
        });
    }
    
    // Pilih operator
    function selectOperator(operatorId) {
        selectedOperator = operatorId;
        renderOperators();
        updateQueuedInfo();
    }
    
    // Update tampilan antrian
    function updateQueueDisplay() {
        const formattedNumber = currentQueueNumber.toString().padStart(3, '0');
        currentQueueNumberElement.textContent = formattedNumber;
        
        // Hitung nomor berikutnya
        const nextNumber = currentQueueNumber + 1;
        nextQueueNumberElement.textContent = nextNumber.toString().padStart(3, '0');
        
        // Tambah efek animasi
        currentQueueNumberElement.classList.add('pulse');
        setTimeout(() => {
            currentQueueNumberElement.classList.remove('pulse');
        }, 500);
        
        updateQueuedInfo();
    }
    
    // Update info antrian yang akan dipanggil
    function updateQueuedInfo() {
        const formattedNumber = currentQueueNumber.toString().padStart(3, '0');
        queuedNumberElement.textContent = formattedNumber;
        
        const selectedOperatorObj = operators.find(op => op.id === selectedOperator);
        queuedOperatorElement.textContent = selectedOperatorObj ? selectedOperatorObj.name : 'Operator tidak ditemukan';
    }
    
    // Panggil antrian
    function callQueue() {
        const formattedNumber = currentQueueNumber.toString().padStart(3, '0');
        const selectedOperatorObj = operators.find(op => op.id === selectedOperator);
        
        // Update tampilan antrian saat ini
        currentQueueNumberElement.textContent = formattedNumber;
        currentQueueOperatorElement.textContent = selectedOperatorObj.name;
        
        // Tambahkan ke riwayat
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        const historyItem = {
            number: formattedNumber,
            operator: selectedOperatorObj.name,
            time: timeString,
            timestamp: now.getTime()
        };
        
        callHistory.unshift(historyItem); // Tambahkan di awal array
        if (callHistory.length > 10) {
            callHistory = callHistory.slice(0, 10); // Batasi riwayat ke 10 item terbaru
        }
        
        renderHistory();
        
        // Panggil suara
        if (soundEnabled) {
            speakQueueNumber(formattedNumber, selectedOperatorObj.name);
        }
        
        // Auto increment untuk antrian berikutnya
        currentQueueNumber++;
        updateQueueDisplay();
        
        // Simpan state ke localStorage
        saveState();
        
        // Tampilkan notifikasi
        showNotification(`Antrian ${formattedNumber} berhasil dipanggil!`);
    }
    
    // Fungsi text-to-speech
    function speakQueueNumber(queueNumber, operatorName) {
        // Format nomor antrian dengan pemisah (contoh: 012 menjadi "nol satu dua")
        const numberDigits = queueNumber.split('');
        const digitNames = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
        
        let numberSpoken = '';
        numberDigits.forEach(digit => {
            numberSpoken += digitNames[parseInt(digit)] + ' ';
        });
        
        // Buat pesan suara
        const message = `Nomor antrian ${numberSpoken}. Silakan menuju ${operatorName}.`;
        
        // Gunakan Web Speech API
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance();
            speech.text = message;
            speech.lang = 'id-ID';
            speech.rate = 1.0;
            speech.pitch = 1.0;
            speech.volume = 1.0;
            
            // Pilih suara wanita jika tersedia
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.lang.includes('id') && voice.name.toLowerCase().includes('female')
            );
            
            if (femaleVoice) {
                speech.voice = femaleVoice;
            }
            
            speechSynthesis.speak(speech);
        } else {
            console.log('Text-to-speech tidak didukung di browser ini');
            // Fallback: Gunakan audio jika tersedia
        }
    }
    
    // Render riwayat panggilan
    function renderHistory() {
        historyListElement.innerHTML = '';
        
        if (callHistory.length === 0) {
            historyListElement.innerHTML = '<p class="empty-history">Belum ada riwayat panggilan</p>';
            return;
        }
        
        callHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-number">${item.number}</div>
                    <div class="history-operator">${item.operator}</div>
                </div>
                <div class="history-time">${item.time}</div>
            `;
            
            historyListElement.appendChild(historyItem);
        });
    }
    
    // Reset antrian ke 001
    function resetQueue() {
        currentQueueNumber = 1;
        updateQueueDisplay();
        showNotification('Nomor antrian telah direset ke 001');
        saveState();
    }
    
    // Terapkan nomor antrian manual
    function applyQueueNumber() {
        const newNumber = parseInt(queueInputElement.value);
        
        if (isNaN(newNumber) || newNumber < 1 || newNumber > 999) {
            showNotification('Masukkan nomor antrian yang valid (1-999)', 'error');
            return;
        }
        
        currentQueueNumber = newNumber;
        updateQueueDisplay();
        showNotification(`Nomor antrian diatur ke ${newNumber.toString().padStart(3, '0')}`);
        saveState();
    }
    
    // Tampilkan notifikasi
    function showNotification(message, type = 'success') {
        notificationElement.querySelector('p').textContent = message;
        
        // Set warna berdasarkan jenis notifikasi
        if (type === 'error') {
            notificationElement.style.backgroundColor = '#e74c3c';
        } else {
            notificationElement.style.backgroundColor = '#27ae60';
        }
        
        notificationElement.classList.add('show');
        
        // Sembunyikan notifikasi setelah 3 detik
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    }
    
    // Toggle suara
    function toggleSound() {
        soundEnabled = !soundEnabled;
        const icon = soundToggleButton.querySelector('i');
        const text = soundToggleButton.querySelector('span') || document.createElement('span');
        
        if (soundEnabled) {
            icon.className = 'fas fa-volume-up';
            text.textContent = 'Suara: Aktif';
            showNotification('Suara panggilan diaktifkan');
        } else {
            icon.className = 'fas fa-volume-mute';
            text.textContent = 'Suara: Nonaktif';
            showNotification('Suara panggilan dinonaktifkan');
        }
        
        if (!soundToggleButton.contains(text)) {
            soundToggleButton.appendChild(text);
        }
        
        saveState();
    }
    
    // Toggle tema gelap/terang
    function toggleTheme() {
        darkTheme = !darkTheme;
        const icon = themeToggleButton.querySelector('i');
        const text = themeToggleButton.querySelector('span') || document.createElement('span');
        
        if (darkTheme) {
            document.body.classList.add('dark-theme');
            icon.className = 'fas fa-sun';
            text.textContent = 'Mode Terang';
        } else {
            document.body.classList.remove('dark-theme');
            icon.className = 'fas fa-moon';
            text.textContent = 'Mode Gelap';
        }
        
        if (!themeToggleButton.contains(text)) {
            themeToggleButton.appendChild(text);
        }
        
        saveState();
    }
    
    // Simpan state ke localStorage
    function saveState() {
        const state = {
            currentQueueNumber,
            selectedOperator,
            soundEnabled,
            darkTheme,
            callHistory
        };
        
        localStorage.setItem('queueSystemState', JSON.stringify(state));
    }
    
    // Load state dari localStorage
    function loadState() {
        const savedState = localStorage.getItem('queueSystemState');
        
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                currentQueueNumber = state.currentQueueNumber || 1;
                selectedOperator = state.selectedOperator || 1;
                soundEnabled = state.soundEnabled !== undefined ? state.soundEnabled : true;
                darkTheme = state.darkTheme || false;
                callHistory = state.callHistory || [];
                
                // Terapkan tema
                if (darkTheme) {
                    document.body.classList.add('dark-theme');
                    const icon = themeToggleButton.querySelector('i');
                    const text = themeToggleButton.querySelector('span') || document.createElement('span');
                    icon.className = 'fas fa-sun';
                    text.textContent = 'Mode Terang';
                    if (!themeToggleButton.contains(text)) {
                        themeToggleButton.appendChild(text);
                    }
                }
                
                // Terapkan pengaturan suara
                const icon = soundToggleButton.querySelector('i');
                const text = soundToggleButton.querySelector('span') || document.createElement('span');
                
                if (soundEnabled) {
                    icon.className = 'fas fa-volume-up';
                    text.textContent = 'Suara: Aktif';
                } else {
                    icon.className = 'fas fa-volume-mute';
                    text.textContent = 'Suara: Nonaktif';
                }
                
                if (!soundToggleButton.contains(text)) {
                    soundToggleButton.appendChild(text);
                }
                
                // Update tampilan
                queueInputElement.value = currentQueueNumber;
                renderOperators();
                updateQueueDisplay();
                renderHistory();
                
            } catch (e) {
                console.error('Error loading saved state:', e);
            }
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        callQueueButton.addEventListener('click', callQueue);
        resetQueueButton.addEventListener('click', resetQueue);
        applyQueueButton.addEventListener('click', applyQueueNumber);
        soundToggleButton.addEventListener('click', toggleSound);
        themeToggleButton.addEventListener('click', toggleTheme);
        
        // Tombol increment/decrement nomor antrian
        decrementQueueButton.addEventListener('click', () => {
            let value = parseInt(queueInputElement.value);
            if (value > 1) {
                queueInputElement.value = value - 1;
            }
        });
        
        incrementQueueButton.addEventListener('click', () => {
            let value = parseInt(queueInputElement.value);
            if (value < 999) {
                queueInputElement.value = value + 1;
            }
        });
        
        // Validasi input nomor antrian
        queueInputElement.addEventListener('change', () => {
            let value = parseInt(queueInputElement.value);
            
            if (isNaN(value) || value < 1) {
                queueInputElement.value = 1;
            } else if (value > 999) {
                queueInputElement.value = 999;
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter untuk panggil antrian
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                callQueue();
            }
            
            // Ctrl + R untuk reset antrian
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                resetQueue();
            }
            
            // Ctrl + S untuk toggle suara
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                toggleSound();
            }
            
            // Ctrl + T untuk toggle tema
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
    
    // Inisialisasi aplikasi
    init();
});