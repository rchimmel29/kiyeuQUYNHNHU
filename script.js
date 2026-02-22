document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    const clickOverlay = document.getElementById('click-overlay');
    const doors = document.querySelector('.door-wrap');
    const content = document.getElementById('invite-content');

    const startTime = 99; // 1:39
    const endTime = 130;  // 2:10

    // 1. XỬ LÝ SỰ KIỆN CHẠM ĐỂ MỞ CỬA & PHÁT NHẠC
    function startEverything(e) {
        // Phát nhạc trước để qua mặt bộ lọc trình duyệt
        audio.play().then(() => {
            audio.currentTime = startTime;
            musicControl.classList.add('playing');
        }).catch(err => {
            console.log("Chờ tương tác thêm để phát nhạc");
            // Sửa lỗi iPhone kén nhạc bằng cách thử lại
            audio.muted = false;
            audio.play();
        });

        // Hiệu ứng biến mất lớp phủ và mở cửa
        if (clickOverlay) clickOverlay.classList.add('fade-out');

        setTimeout(() => {
            if (doors) {
                doors.classList.add('open');
                if (content) content.style.opacity = '1';
                setTimeout(() => { doors.style.display = 'none'; }, 2000);
            }
        }, 300);

        clickOverlay.removeEventListener('click', startEverything);
        clickOverlay.removeEventListener('touchstart', startEverything);
    }

    if (clickOverlay) {
        clickOverlay.addEventListener('click', startEverything);
        clickOverlay.addEventListener('touchstart', startEverything, { passive: true });
    }

    // Vòng lặp nhạc
    audio.addEventListener('timeupdate', function() {
        if (this.currentTime >= endTime) {
            this.currentTime = startTime;
        }
    });

    // Nút loa thủ công
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

    // 2. HIỆU ỨNG TUYẾT RƠI (Đã sửa lỗi hiển thị)
    function initSnow() {
        const canvas = document.getElementById('snowCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            
            // Tạo lại hạt khi resize
            particles = [];
            const density = Math.floor((width * height) / 10000);
            for (let i = 0; i < density; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 1,
                    speedY: Math.random() * 1 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "white";
            particles.forEach(p => {
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > height) {
                    p.y = -10;
                    p.x = Math.random() * width;
                }
            });
            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        resize();
        draw();
    }

    // 3. RENDER LỊCH
    function renderCalendar() {
        const monthDisplay = document.getElementById('monthDisplay');
        const calendarGrid = document.getElementById('calendarGrid');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        
        if (!monthDisplay || !calendarGrid) return;
        
        let currentMonth = 2; // Tháng 3 (index từ 0)
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
                        const prevDay = daysInPrevMonth - startOffset + col + 1;
                        gridHtml += `<div class="day other-month">${prevDay}</div>`;
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

    // Kích hoạt lịch và tuyết
    renderCalendar();
    initSnow();
});
