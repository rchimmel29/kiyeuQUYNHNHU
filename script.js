document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    
    // --- 1. QUẢN LÝ NHẠC (1:39 - 2:10) ---
    const startTime = 99; 
    const endTime = 130;  

    function initAudio() {
        if (audio.paused) {
            audio.currentTime = startTime;
            audio.play().then(() => {
                musicControl.classList.add('playing');
            }).catch(err => console.log("Chờ tương tác..."));
        }
    }

    // Kích hoạt khi chạm bất kỳ đâu
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    audio.addEventListener('timeupdate', function() {
        if (this.currentTime >= endTime) {
            this.currentTime = startTime;
        }
    });

    musicControl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audio.paused) {
            audio.play();
            musicControl.classList.add('playing');
        } else {
            audio.pause();
            musicControl.classList.remove('playing');
        }
    });

    // --- 2. HIỆU ỨNG MỞ CỬA ---
    const doors = document.querySelector('.door-wrap');
    if (doors) {
        setTimeout(() => {
            doors.classList.add('open');
            const content = document.getElementById('invite-content');
            if (content) content.style.opacity = '1';
            setTimeout(() => doors.style.display = 'none', 1800);
        }, 500);
    }

    // --- 3. HIỆU ỨNG TUYẾT TRẮNG (ĐỘ ĐẬM VỪA PHẢI) ---
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
            for (let i = 0; i < density; i++) {
                particles.push(createParticle(true));
            }
        }

        function createParticle(initial = false) {
            return {
                x: Math.random() * width,
                y: initial ? Math.random() * height : -20,
                radius: Math.random() * 2 + 2.5, // Kích thước vừa vặn
                speedY: Math.random() * 0.4 + 0.7, 
                speedX: (Math.random() - 0.5) * 0.3,
                swing: Math.random() * 0.02,
                swingStep: Math.random() * Math.PI,
                // ĐỘ ĐẬM VỪA PHẢI: Tăng từ 0.4 lên 0.65
                opacity: Math.random() * 0.2 + 0.65 
            };
        }

        function drawSnow() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                ctx.save();
                
                // BÓNG ĐỔ VỪA PHẢI: Đủ để thấy trên nền trắng nhưng không bị đen hạt
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; 
                
                ctx.beginPath();
                // Vẽ hạt trắng với độ trong suốt vừa phải
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();

                p.y += p.speedY;
                p.swingStep += p.swing;
                p.x += p.speedX + Math.sin(p.swingStep) * 0.4;

                if (p.y > height + 10) {
                    Object.assign(p, createParticle(false));
                }
            });
            requestAnimationFrame(drawSnow);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        drawSnow();
    }

    renderCalendar();
});

// Hàm renderCalendar (Giữ nguyên phần cũ)
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
    prevMonthBtn.addEventListener('click', () => {
        if (currentMonth === 0) { currentMonth = 11; currentYear--; } else { currentMonth--; }
        displayCalendar(currentMonth, currentYear);
    });
    nextMonthBtn.addEventListener('click', () => {
        if (currentMonth === 11) { currentMonth = 0; currentYear++; } else { currentMonth++; }
        displayCalendar(currentMonth, currentYear);
    });
}
