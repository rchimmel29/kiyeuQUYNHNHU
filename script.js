// ==========================================================================
// 1. QUẢN LÝ NHẠC NỀN & BIỂU TƯỢNG SÓNG
// ==========================================================================
const musicControl = document.getElementById('music-control');
const audio = document.getElementById('myAudio');

function toggleMusic() {
    if (audio.paused) {
        audio.play();
        musicControl.classList.add('playing');
    } else {
        audio.pause();
        musicControl.classList.remove('playing');
    }
}

// Bật/tắt nhạc khi bấm vào nút điều khiển
if (musicControl) {
    musicControl.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện lan ra ngoài document
        toggleMusic();
    });
}

// Chức năng bật nhạc khi click bất kỳ đâu lần đầu (để lách luật chặn autoplay của trình duyệt)
const playOnFirstClick = () => {
    if (audio.paused) {
        audio.play().then(() => {
            musicControl.classList.add('playing');
        }).catch(e => console.log('Chờ tương tác người dùng để phát nhạc'));
    }
    document.removeEventListener('click', playOnFirstClick);
};
document.addEventListener('click', playOnFirstClick);


document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================================
    // 2. HIỆU ỨNG MỞ CỬA
    // ==========================================================================
    const doors = document.querySelector('.door-wrap');
    const inviteContent = document.getElementById('invite-content');

    if (doors) {
        setTimeout(() => {
            doors.classList.add('open');
            if (inviteContent) {
                inviteContent.style.opacity = '1';
            }
            setTimeout(() => {
                doors.style.display = 'none';
            }, 1800);
        }, 100);
    } else if (inviteContent) {
        inviteContent.style.opacity = '1';
    }

    // ==========================================================================
    // 3. XỬ LÝ XEM TRƯỚC LỜI CHÚC (Đã sửa lỗi)
    // ==========================================================================
    const inputRelation = document.getElementById('relation'); // Ô nhập lời chúc
    const messagePreview = document.getElementById('message-preview'); // Ô hiện xem trước

    if (inputRelation && messagePreview) {
        inputRelation.addEventListener('input', function() {
            messagePreview.value = this.value;
        });
    }

    // ==========================================================================
    // 4. XỬ LÝ FORM RSVP (GỬI DỮ LIỆU)
    // ==========================================================================
    const form = document.getElementById('rsvp-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const alertBox = document.getElementById('rsvp-alert');
            if (alertBox) {
                alertBox.style.display = 'block';
                alertBox.innerText = '⏳ Đang gửi lời chúc...';
                alertBox.className = 'alert alert-info';
            }

            const formData = new FormData(this);
            const rawData = {
                name: this.name.value,
                message: this.relation.value,
                join: this.join.value
            };

            try {
                // Gửi đến Google Sheets
                const googlePromise = fetch('https://script.google.com/macros/s/AKfycbwMrIhxVDcMlIMfVpa1-y_S7d7BoSRqXVEPemLqj8sdE-AJV5jeoUYKBnHfWZRZ6liNEg/exec', {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(rawData)
                });

                // Gửi đến hệ thống TNT
                formData.append('action', 'guest-send-message');
                const tntPromise = fetch('https://thiep.kyyeutnt.vn/ajaxs/client/invite.php', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .catch(() => ({ msg: '✅ Đã gửi thành công!' }));

                const [googleResult, tntResult] = await Promise.allSettled([googlePromise, tntPromise]);

                let successMsg = '💖 Cảm ơn bạn, lời chúc đã được gửi!';
                if (tntResult.status === 'fulfilled' && tntResult.value?.msg) {
                    successMsg = tntResult.value.msg;
                }

                if (alertBox) {
                    alertBox.innerText = successMsg;
                    alertBox.className = 'alert alert-success';
                }

                // Reset form sau khi gửi
                this.reset();
                if (messagePreview) messagePreview.value = '';
                
            } catch (error) {
                console.error('Lỗi:', error);
                if (alertBox) {
                    alertBox.innerText = '🎉 Gửi thành công!';
                    alertBox.className = 'alert alert-success';
                }
            }
        });
    }

    // ==========================================================================
    // 5. QUẢN LÝ LỊCH (CALENDAR)
    // ==========================================================================
    const calendarGrid = document.getElementById('calendarGrid');
    const monthDisplay = document.getElementById('monthDisplay');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    let currentDate = new Date(2026, 2, 1); // Bắt đầu tại tháng 3/2026
    const targetDate = { day: 7, month: 2, year: 2026 }; // Ngày kỷ yếu: 07/03/2026

    function renderCalendar() {
        if (!calendarGrid || !monthDisplay) return;
        calendarGrid.innerHTML = '';

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthDisplay.innerText = `Tháng ${month + 1} / ${year}`;

        const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        weekdays.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'weekday';
            cell.innerText = day;
            calendarGrid.appendChild(cell);
        });

        const firstDay = new Date(year, month, 1).getDay();
        let emptyCells = (firstDay === 0) ? 6 : firstDay - 1;

        for (let i = 0; i < emptyCells; i++) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            calendarGrid.appendChild(empty);
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let d = 1; d <= daysInMonth; d++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day';
            dayCell.innerText = d;

            // Đánh dấu ngày đặc biệt
            if (d === targetDate.day && month === targetDate.month && year === targetDate.year) {
                dayCell.classList.add('save-the-date');
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    renderCalendar();
});