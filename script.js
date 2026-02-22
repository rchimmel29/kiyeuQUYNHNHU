document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    
    // --- 1. QUẢN LÝ NHẠC (1:39 - 2:10) ---
    const startTime = 99; // 1:39
    const endTime = 130;  // 2:10

    function initAudio() {
        audio.currentTime = startTime;
        audio.play().then(() => musicControl.classList.add('playing'))
        .catch(() => console.log("Chờ tương tác để phát nhạc"));
        
        audio.addEventListener('timeupdate', function() {
            if (this.currentTime >= endTime) {
                this.currentTime = startTime; // Lặp lại đoạn nhạc
            }
        });
    }

    document.addEventListener('click', () => {
        if (audio.paused) initAudio();
    }, { once: true });

    musicControl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audio.paused) audio.play(); else audio.pause();
        musicControl.classList.toggle('playing');
    });

    // --- 2. HIỆU ỨNG MỞ CỬA ---
    const doors = document.querySelector('.door-wrap');
    if (doors) {
        setTimeout(() => {
            doors.classList.add('open');
            document.getElementById('invite-content').style.opacity = '1';
            setTimeout(() => doors.style.display = 'none', 1800);
        }, 500);
    }

// --- 3. HIỆU ỨNG TUYẾT RƠI (Gia tăng tỉ lệ màu xanh & Độ dày) ---
const canvas = document.getElementById('snowCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * -height,
            // Kích thước hạt từ 3px đến 7px
            radius: Math.random() * 4 + 3, 
            // Tốc độ rơi phù hợp nhạc lãng mạn (1.2 - 2.0)
            speedY: Math.random() * 0.4 + 1.2, 
            speedX: (Math.random() - 0.5) * 0.6, 
            swing: Math.random() * 0.03, 
            swingStep: 0,
            // Độ rõ nét cao hơn để nhìn rõ màu xanh
            opacity: Math.random() * 0.5 + 0.4 
        };
    }

    // Tăng số lượng lên 160 hạt để tạo cảm giác tuyết dày hơn
    for (let i = 0; i < 160; i++) {
        particles.push(createParticle());
    }

    function drawSnow() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            
            // TĂNG TỈ LỆ MÀU XANH: 
            // Tâm hạt là màu xanh ngọc nhạt, rìa là màu xanh trắng
            gradient.addColorStop(0, `rgba(178, 235, 242, ${p.opacity})`);   // Cyan Blue nhạt
            gradient.addColorStop(0.4, `rgba(224, 247, 250, ${p.opacity * 0.8})`); // Icy Blue
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);             // Mờ dần ra trắng trong suốt

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Hiệu ứng di chuyển
            p.swingStep += p.swing;
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.swingStep) * 0.5;

            if (p.y > height) {
                p.y = -20;
                p.x = Math.random() * width;
            }
        });
        requestAnimationFrame(drawSnow);
    }
    drawSnow();
}
    // --- 4. RENDER LỊCH ---
    renderCalendar();
});

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    let currentMonth = 2; // Tháng 3 (index bắt đầu từ 0)
    let currentYear = 2026;

    function displayCalendar(month, year) {
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        monthDisplay.textContent = `${monthNames[month]} / ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        let startOffset = firstDay === 0 ? 6 : firstDay - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let gridHtml = '';
        const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        weekdays.forEach(day => {
            gridHtml += `<div class="weekday">${day}</div>`;
        });

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

    prevMonthBtn.addEventListener('click', () => {
        if (currentMonth === 0) { currentMonth = 11; currentYear--; } 
        else { currentMonth--; }
        displayCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        if (currentMonth === 11) { currentMonth = 0; currentYear++; } 
        else { currentMonth++; }
        displayCalendar(currentMonth, currentYear);
    });
}