document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('myAudio');
    const musicControl = document.getElementById('music-control');
    const clickOverlay = document.getElementById('click-overlay');
    const doors = document.querySelector('.door-wrap');
    const content = document.getElementById('invite-content');

    // Cấu hình thời gian nhạc (1:39 - 2:10)
    const startTime = 99; 
    const endTime = 130;  

    // Hàm kích hoạt nhạc TỨC THÌ
    function startEverything(e) {
        // 1. Phải chạy nhạc ngay giây đầu tiên của sự kiện touch/click
        audio.currentTime = startTime;
        var playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicControl.classList.add('playing');
            }).catch(error => {
                console.log("Phát nhạc bị chặn hoặc file chưa tải kịp:", error);
            });
        }

        // 2. Xử lý giao diện (cho chạy sau một chút để không chiếm tài nguyên của nhạc)
        if (clickOverlay) {
            clickOverlay.classList.add('fade-out');
        }

        setTimeout(() => {
            if (doors) {
                doors.classList.add('open');
                if (content) content.style.opacity = '1';
                setTimeout(() => {
                    doors.style.display = 'none';
                }, 2000);
            }
        }, 400);

        // Gỡ bỏ sự kiện để tránh xung đột
        clickOverlay.removeEventListener('click', startEverything);
        clickOverlay.removeEventListener('touchstart', startEverything);
    }

    // Lắng nghe đồng thời cả 2 để phủ mọi thiết bị
    if (clickOverlay) {
        clickOverlay.addEventListener('click', startEverything);
        clickOverlay.addEventListener('touchstart', startEverything, { passive: true });
    }

    // Quản lý vòng lặp (Loop)
    audio.addEventListener('timeupdate', function() {
        if (this.currentTime >= endTime) {
            this.currentTime = startTime;
        }
    });

    // Nút tắt/mở nhạc thủ công bên trong
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

    // --- Giữ nguyên các hàm renderCalendar và Snow bên dưới ---
    renderCalendar();
    initSnowEffect(); // Giả định bạn gom code tuyết vào hàm này hoặc để chạy tự do
});

function initSnowEffect() {
    const canvas = document.getElementById('snowCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        particles = [];
        const density = Math.floor((width * height) / 10000);
        for (let i = 0; i < density; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 2.5,
                speedY: Math.random() * 0.4 + 0.7,
                speedX: (Math.random() - 0.5) * 0.3,
                swing: Math.random() * 0.02,
                swingStep: Math.random() * Math.PI,
                opacity: Math.random() * 0.2 + 0.65
            });
        }
    }

    function drawSnow() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.swingStep) * 0.4;
            p.swingStep += p.swing;
            if (p.y > height) p.y = -10;
        });
        requestAnimationFrame(drawSnow);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawSnow();
}
