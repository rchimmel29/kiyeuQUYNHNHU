document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    
    // --- 1. QUẢN LÝ NHẠC (Đoạn cao trào 1:39 - 2:10) ---
    const startTime = 99; // Giây thứ 99 (1:39)
    const endTime = 130;  // Giây thứ 130 (2:10)

    function initAudio() {
        // Kiểm tra nếu nhạc đã sẵn sàng để tránh lỗi nhảy giây về 0 trên thiết bị lạ
        const playMusic = () => {
            audio.currentTime = startTime;
            audio.play().then(() => {
                musicControl.classList.add('playing');
            }).catch(err => console.log("Yêu cầu tương tác người dùng để phát nhạc"));
        };

        if (audio.readyState >= 3) {
            playMusic();
        } else {
            audio.addEventListener('canplaythrough', playMusic, { once: true });
        }
        
        // Lặp đoạn nhạc cố định
        audio.addEventListener('timeupdate', function() {
            if (this.currentTime >= endTime) {
                this.currentTime = startTime;
            }
        });
    }

    // Kích hoạt khi người dùng chạm vào trang lần đầu
    document.addEventListener('click', () => {
        if (audio.paused) initAudio();
    }, { once: true });

    // Nút điều khiển nhạc thủ công
    musicControl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audio.paused) {
            if (audio.currentTime < startTime) audio.currentTime = startTime;
            audio.play();
        } else {
            audio.pause();
        }
        musicControl.classList.toggle('playing');
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

    // --- 3. HIỆU ỨNG TUYẾT RƠI THÍCH ỨNG (ADAPTIVE SNOW) ---
    const canvas = document.getElementById('snowCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            
            // Tỷ lệ thưa hơn: 1 hạt cho mỗi 12,000 pixel vuông diện tích
            // Giúp điện thoại không bị quá dày gây rối mắt
            const density = Math.floor((width * height) / 12000); 
            particles = [];
            for (let i = 0; i < density; i++) {
                particles.push(createParticle(true)); // true để khởi tạo ngẫu nhiên toàn màn hình
            }
        }

        function createParticle(initial = false) {
            return {
                x: Math.random() * width,
                y: initial ? Math.random() * height : -20, // Lúc đầu rải đều, sau đó chỉ rơi từ đỉnh
                radius: Math.random() * 3 + 3, // Kích thước hạt từ 3px - 6px (nhìn rõ hơn)
                speedY: Math.random() * 0.7 + 0.8, // Tốc độ rơi chậm, lãng mạn
                speedX: (Math.random() - 0.5) * 0.4,
                swing: Math.random() * 0.02,
                swingStep: Math.random() * Math.PI, // Ngẫu nhiên pha dao động
                opacity: Math.random() * 0.4 + 0.4 // Độ rõ nét vừa phải
            };
        }

        function drawSnow() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                // Đổ màu Gradient gia tăng sắc xanh (Icy Blue)
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                gradient.addColorStop(0, `rgba(178, 235, 242, ${p.opacity})`);   // Xanh Cyan nhạt ở tâm
                gradient.addColorStop(0.5, `rgba(224, 247, 250, ${p.opacity * 0.7})`); // Xanh trắng ở giữa
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);             // Trong suốt ở rìa

                ctx.beginPath();
                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                // Cập nhật vị trí
                p.y += p.speedY;
                p.swingStep += p.swing;
                p.x += p.speedX + Math.sin(p.swingStep) * 0.5;

                // Reset khi rơi hết màn hình
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

    // --- 4. RENDER LỊCH ---
    renderCalendar();
});

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (!monthDisplay || !calendarGrid) return;

    let currentMonth = 2; // Tháng 3 (index 0-11)
    let currentYear = 2026;

    function displayCalendar(month, year) {
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
                          "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        monthDisplay.textContent = `${monthNames[month]} / ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        let startOffset = (firstDay === 0) ? 6 : firstDay - 1; // Bắt đầu từ Thứ 2

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
                    // Đánh dấu ngày 7/3/2026
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
