document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    const overlay = document.getElementById('click-overlay');
    const doors = document.querySelector('.door-wrap');
    
    // --- 1. CẤU HÌNH NHẠC (1:39 - 2:10) ---
    const startTime = 99; 
    const endTime = 130;  

    function playMusic() {
        if (audio.paused) {
            audio.currentTime = startTime;
            audio.play().then(() => {
                musicControl.classList.add('playing');
            }).catch(err => console.log("Chờ tương tác..."));
        }
    }

    audio.addEventListener('timeupdate', function() {
        if (this.currentTime >= endTime) {
            this.currentTime = startTime;
            audio.play();
        }
    });

    musicControl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audio.paused) {
            if (audio.currentTime < startTime || audio.currentTime >= endTime) audio.currentTime = startTime;
            audio.play();
            musicControl.classList.add('playing');
        } else {
            audio.pause();
            musicControl.classList.remove('playing');
        }
    });

    // --- 2. LOGIC NHẬN DIỆN NHẤN HOẶC TRƯỢT ---
    let startX = 0;
    let startY = 0;

    // Hàm kiểm tra xem có phải là thao tác (nhấn nhanh hoặc trượt)
    function isInteraction(e, moveStartX, moveStartY) {
        const moveEndX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const moveEndY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const distance = Math.sqrt(Math.pow(moveEndX - moveStartX, 2) + Math.pow(moveEndY - moveStartY, 2));
        return distance >= 0; // Chấp nhận mọi khoảng cách (nhấn = 0, trượt > 0)
    }

    // A. XỬ LÝ MỞ THƯ (Overlay)
    if (overlay) {
        const handleOverlayAction = (e) => {
            // Thực hiện hiệu ứng mở thư
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 500);

            if (doors) {
                doors.classList.add('open');
                const content = document.getElementById('invite-content');
                if (content) content.style.opacity = '1';
                setTimeout(() => { doors.style.display = 'none'; }, 1800);
            }

            // Gỡ bỏ sự kiện mở thư
            overlay.removeEventListener('click', handleOverlayAction);
            overlay.removeEventListener('touchend', handleOverlayAction);

            // Đợi cửa mở xong thì bắt đầu cho phép nhấn để phát nhạc
            setTimeout(enableMusicActivation, 600);
        };

        overlay.addEventListener('click', handleOverlayAction);
        overlay.addEventListener('touchend', handleOverlayAction);
    }

    // B. XỬ LÝ PHÁT NHẠC (Sau khi thư mở)
    function enableMusicActivation() {
        const handleMusicAction = () => {
            playMusic();
            // Chỉ cần nhạc phát 1 lần là gỡ bỏ sự kiện toàn màn hình
            window.removeEventListener('click', handleMusicAction);
            window.removeEventListener('touchend', handleMusicAction);
        };

        window.addEventListener('click', handleMusicAction);
        window.addEventListener('touchend', handleMusicAction);
    }

    // --- 3. HIỆU ỨNG TUYẾT RƠI (Giữ nguyên) ---
    const canvas = document.getElementById('snowCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        function resizeCanvas() {
            width = window.innerWidth; height = window.innerHeight;
            canvas.width = width; canvas.height = height;
            const density = Math.floor((width * height) / 10000); 
            particles = [];
            for (let i = 0; i < density; i++) particles.push(createParticle(true));
        }
        function createParticle(initial = false) {
            return {
                x: Math.random() * width,
                y: initial ? Math.random() * height : -20,
                radius: Math.random() * 2 + 2.5,
                speedY: Math.random() * 0.4 + 0.7, 
                speedX: (Math.random() - 0.5) * 0.3,
                swing: Math.random() * 0.02,
                swingStep: Math.random() * Math.PI,
                opacity: Math.random() * 0.2 + 0.65 
            };
        }
        function drawSnow() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.save();
                ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; 
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill(); ctx.restore();
                p.y += p.speedY; p.swingStep += p.swing;
                p.x += p.speedX + Math.sin(p.swingStep) * 0.4;
                if (p.y > height + 10) Object.assign(p, createParticle(false));
            });
            requestAnimationFrame(drawSnow);
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); drawSnow();
    }

    renderCalendar();
});

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    if (!monthDisplay || !calendarGrid) return;
    let currentMonth = 2; let currentYear = 2026;
    function displayCalendar(month, year) {
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        monthDisplay.textContent = `${monthNames[month]} / ${year}`;
        const firstDay = new Date(year, month, 1).getDay();
        let startOffset = (firstDay === 0) ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        let gridHtml = '';
        const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        weekdays.forEach(day => { gridHtml += `<div class="weekday">${day}</div>`; });
        let dayCounter = 1; let nextMonthDayCounter = 1;
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                if (row === 0 && col < startOffset) {
                    const prevMonthDay = daysInPrevMonth - startOffset + col + 1;
                    gridHtml += `<div class="day other-month">${prevMonthDay}</div>`;
                } else if (dayCounter <= daysInMonth) {
                    const isSaveDate = (dayCounter === 7 && month === 2 && year === 2026);
                    gridHtml += `<div class="day ${isSaveDate ? 'save-the-date' : ''}">${dayCounter}</div>`;
                    dayCounter++;
                } else {
                    gridHtml += `<div class="day other-month">${nextMonthDayCounter}</div>`;
                    nextMonthDayCounter++;
                }
            }
        }
        calendarGrid.innerHTML = gridHtml;
    }
    displayCalendar(currentMonth, currentYear);
    prevMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentMonth === 0) { currentMonth = 11; currentYear--; } else { currentMonth--; }
        displayCalendar(currentMonth, currentYear);
    });
    nextMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentMonth === 11) { currentMonth = 0; currentYear++; } else { currentMonth++; }
        displayCalendar(currentMonth, currentYear);
    });
}
