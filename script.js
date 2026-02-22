document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    const overlay = document.getElementById('click-overlay');
    const doors = document.querySelector('.door-wrap');
    
    // Cấu hình đoạn nhạc (giây)
    const startTime = 99; // 1:39
    const endTime = 130;  // 2:10

    /**
     * 1. HÀM PHÁT NHẠC CHUẨN XÁC
     */
    function playMusicAtTarget() {
        if (audio.paused) {
            // Nhảy đến đúng đoạn 99s nếu chưa bắt đầu hoặc lệch khung
            if (audio.currentTime < startTime || audio.currentTime >= endTime) {
                audio.currentTime = startTime;
            }
            audio.play()
                .then(() => {
                    musicControl.classList.add('playing');
                })
                .catch(err => console.log("Chờ tương tác thực tế..."));
        }
    }

    /**
     * 2. LẶP ĐOẠN NHẠC
     */
    audio.addEventListener('timeupdate', function() {
        if (this.currentTime >= endTime) {
            this.currentTime = startTime;
            audio.play(); 
        }
    });

    /**
     * 3. TÍNH NĂNG "NHẤN BẤT CỨ ĐÂU - CHỈ 1 LẦN" (TOÀN MÀN HÌNH)
     * Tính năng này bao phủ toàn bộ màn hình kể cả khi cửa đã mở.
     */
    const triggerInitialAction = (e) => {
        // A. Phát nhạc
        playMusicAtTarget();

        // B. Nếu thư chưa mở thì mở thư (xử lý overlay)
        if (overlay && overlay.style.display !== 'none') {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);

            if (doors) {
                doors.classList.add('open');
                const content = document.getElementById('invite-content');
                if (content) content.style.opacity = '1';
                setTimeout(() => doors.style.display = 'none', 1800);
            }
        }

        // C. Quan trọng: Gỡ bỏ sự kiện này để không làm phiền người dùng nữa
        window.removeEventListener('click', triggerInitialAction);
        window.removeEventListener('touchstart', triggerInitialAction);
    };

    // Đăng ký sự kiện lên WINDOW để chiếm quyền toàn màn hình
    window.addEventListener('click', triggerInitialAction);
    window.addEventListener('touchstart', triggerInitialAction, { passive: false });

    /**
     * 4. NÚT ĐIỀU KHIỂN NHẠC GÓC DƯỚI (Dùng sau khi đã kích hoạt lần đầu)
     */
    musicControl.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện kích hoạt ngược lên window
        if (audio.paused) {
            playMusicAtTarget();
        } else {
            audio.pause();
            musicControl.classList.remove('playing');
        }
    });

    /**
     * 5. HIỆU ỨNG TUYẾT RƠI (Giữ nguyên của bạn)
     */
    const canvas = document.getElementById('snowCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
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
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; 
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                p.y += p.speedY;
                p.swingStep += p.swing;
                p.x += p.speedX + Math.sin(p.swingStep) * 0.4;
                if (p.y > height + 10) Object.assign(p, createParticle(false));
            });
            requestAnimationFrame(drawSnow);
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        drawSnow();
    }

    /**
     * 6. LỊCH THÁNG 3/2026
     */
    renderCalendar();
});

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (!monthDisplay || !calendarGrid) return;
    
    let currentMonth = 2; // Tháng 3
    let currentYear = 2026;

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
        
        let dayCounter = 1; 
        let nextMonthDayCounter = 1;
        
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
