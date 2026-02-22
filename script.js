document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    const overlay = document.getElementById('click-overlay');
    const doors = document.querySelector('.door-wrap');
    
    // --- 1. CẤU HÌNH NHẠC ---
    const startTime = 99; // Bắt đầu từ 1:39
    const endTime = 130;  // Kết thúc tại 2:10

    function playMusic() {
        if (audio.paused) {
            audio.currentTime = startTime;
            // Thêm playsinline và gọi play() qua tương tác người dùng để chạy trên Mobile
            audio.play().then(() => {
                musicControl.classList.add('playing');
            }).catch(err => {
                console.log("Trình duyệt chặn tự động phát, chờ tương tác...");
            });
        }
    }

    // Lặp đoạn nhạc theo cấu hình
    audio.addEventListener('timeupdate', function() {
        if (this.currentTime >= endTime) {
            this.currentTime = startTime;
            audio.play();
        }
    });

    // Nút điều khiển nhạc thủ công
    musicControl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audio.paused) {
            if (audio.currentTime < startTime || audio.currentTime >= endTime) {
                audio.currentTime = startTime;
            }
            audio.play();
            musicControl.classList.add('playing');
        } else {
            audio.pause();
            musicControl.classList.remove('playing');
        }
    });

    // --- 2. LOGIC MỞ THƯ & PHÁT NHẠC ---
    let touchStartY = 0;
    const swipeThreshold = 20;

    function handleOpenLetter() {
        if (!overlay || overlay.style.display === 'none') return;

        // PHÁT NHẠC NGAY KHI NGƯỜI DÙNG CHẠM VÀO OVERLAY
        playMusic();

        // Hiệu ứng mờ dần và ẩn Overlay
        overlay.style.opacity = '0';
        setTimeout(() => { 
            overlay.style.display = 'none'; 
        }, 500);

        // Hiệu ứng mở cánh cửa
        if (doors) {
            doors.classList.add('open');
            const content = document.getElementById('invite-content');
            if (content) content.style.opacity = '1';
            setTimeout(() => { 
                doors.style.display = 'none'; 
            }, 1800);
        }

        removeOpenListeners();
    }

    // --- XỬ LÝ SỰ KIỆN CHO MOBILE & PC ---
    const onOverlayTouchStart = (e) => { 
        touchStartY = e.touches[0].clientY; 
    };

    const onOverlayTouchEnd = (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        // Nếu là nhấn (click) hoặc trượt (swipe) đều tính là mở thư
        if (Math.abs(touchEndY - touchStartY) > swipeThreshold || e.type === 'touchend') {
            handleOpenLetter();
        }
    };

    function removeOpenListeners() {
        overlay.removeEventListener('click', handleOpenLetter);
        overlay.removeEventListener('touchstart', onOverlayTouchStart);
        overlay.removeEventListener('touchend', onOverlayTouchEnd);
    }

    // Lắng nghe sự kiện trên lớp phủ
    overlay.addEventListener('click', handleOpenLetter);
    overlay.addEventListener('touchstart', onOverlayTouchStart, {passive: true});
    overlay.addEventListener('touchend', onOverlayTouchEnd);

    // --- 3. HIỆU ỨNG TUYẾT RƠI ---
    const canvas = document.getElementById('snowCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];

        function resizeCanvas() {
            width = window.innerWidth; 
            height = window.innerHeight;
            canvas.width = width; 
            canvas.height = height;
            // Giảm mật độ tuyết trên điện thoại để tránh giật lag
            const density = Math.floor((width * height) / (width < 480 ? 15000 : 10000)); 
            particles = [];
            for (let i = 0; i < density; i++) particles.push(createParticle(true));
        }

        function createParticle(initial = false) {
            return {
                x: Math.random() * width,
                y: initial ? Math.random() * height : -20,
                radius: Math.random() * 2 + 1.5,
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
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
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

    renderCalendar();
});

// --- 4. RENDER LỊCH ---
function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (!monthDisplay || !calendarGrid) return;

    let currentMonth = 2; // Tháng 3 (JS tính từ 0)
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

    // Xử lý sự kiện nút bấm lịch (dùng e.stopPropagation để không kích hoạt mở thư nhầm)
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
