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
            // Nhảy đến đúng đoạn 99s trước khi phát
            audio.currentTime = startTime;
            
            audio.play()
                .then(() => {
                    musicControl.classList.add('playing');
                })
                .catch(err => {
                    console.log("Trình duyệt yêu cầu tương tác thêm để phát nhạc.");
                });
        }
    }

    /**
     * 2. LẶP ĐOẠN NHẠC (Loop từ 99s đến 130s)
     */
    audio.addEventListener('timeupdate', function() {
        if (this.currentTime >= endTime) {
            this.currentTime = startTime;
            audio.play(); 
        }
    });

    /**
     * 3. XỬ LÝ MỞ THƯ (KHÔNG PHÁT NHẠC)
     */
    if (overlay) {
        const openLetter = (e) => {
            if (e.cancelable) e.preventDefault();

            // Chỉ làm hiệu ứng mở thư, tuyệt đối không gọi lệnh play nhạc ở đây
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

            // Gỡ bỏ sự kiện mở thư
            overlay.removeEventListener('click', openLetter);
            overlay.removeEventListener('touchstart', openLetter);

            // QUAN TRỌNG: Sau khi mở thư xong, mới bắt đầu lắng nghe sự kiện "nhấn đâu cũng phát nhạc"
            setTimeout(() => {
                window.addEventListener('click', triggerMusicOnce);
                window.addEventListener('touchstart', triggerMusicOnce);
            }, 1000); // Đợi 1s cho cửa mở xong rồi mới cho phép click phát nhạc
        };

        overlay.addEventListener('click', openLetter);
        overlay.addEventListener('touchstart', openLetter, { passive: false });
    }

    /**
     * 4. HÀM KÍCH HOẠT NHẠC KHI NHẤN MÀN HÌNH (Sau khi cửa mở)
     */
    const triggerMusicOnce = () => {
        playMusicAtTarget();
        
        // Sau khi đã phát nhạc lần đầu, gỡ bỏ lắng nghe này để không bị reset nhạc mỗi lần click
        window.removeEventListener('click', triggerMusicOnce);
        window.removeEventListener('touchstart', triggerMusicOnce);
    };

    /**
     * 5. NÚT ĐIỀU KHIỂN NHẠC GÓC DƯỚI (Duy trì để bật/tắt thủ công)
     */
    musicControl.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện nhảy ngược lên window
        if (audio.paused) {
            playMusicAtTarget();
        } else {
            audio.pause();
            musicControl.classList.remove('playing');
        }
    });

    /**
     * 6. HIỆU ỨNG TUYẾT RƠI (Giữ nguyên từ bản gốc)
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
     * 7. LỊCH THÁNG 3/2026
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
