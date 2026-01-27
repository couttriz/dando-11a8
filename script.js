document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const body = document.body;
    
    // API CỦA LỚP 11A8
    const SHEETY_API_URL = 'https://api.sheety.co/34893d7427f698dba5ccbe2dea9e090e/11A8DặnDò/hướngDẫnNhậpLiệuGoogleSheets'; 

    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalDesc = document.getElementById('modal-description');
    const modalAccent = document.getElementById('modal-accent');

    // 1. Quản lý Dark Mode
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    function applyTheme(isDark) {
        if (isDark) {
            body.classList.add('dark');
            themeIcon.innerText = '☀️';
            themeText.innerText = 'Chế độ sáng';
        } else {
            body.classList.remove('dark');
            themeIcon.innerText = '🌙';
            themeText.innerText = 'Chế độ tối';
        }
    }

    applyTheme(localStorage.getItem('theme') === 'dark');

    toggleBtn.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme(isDark);
    });

    // 2. Lấy dữ liệu từ Google Sheets
    async function fetchEvents(info, successCallback, failureCallback) {
        try {
            const response = await fetch(SHEETY_API_URL);
            const data = await response.json();
            const key = Object.keys(data)[0]; 
            const rawEvents = data[key] || []; 

            const events = rawEvents.map(item => ({
                title: item.title,
                start: item.start,
                description: item.description,
                backgroundColor: item.color || '#4f46e5',
                allDay: true
            }));
            successCallback(events);
        } catch (error) {
            console.error("Lỗi tải lịch lớp 11A8:", error);
            successCallback([]);
        }
    }

    // 3. Khởi tạo Lịch (Đã bỏ chế độ Tuần)
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: window.innerWidth < 768 ? 'listMonth' : 'dayGridMonth',
        locale: 'vi',
        firstDay: 1,
        height: 'auto',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth' // Chỉ giữ lại Tháng và Danh sách
        },
        buttonText: {
            today: 'Hôm nay', month: 'Tháng', list: 'Danh sách'
        },
        events: fetchEvents,
        eventClick: (info) => {
            modalTitle.innerText = info.event.title;
            modalDate.innerText = info.event.start.toLocaleDateString('vi-VN', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });
            modalDesc.innerText = info.event.extendedProps.description || "Lớp phó học tập chưa ghi chú thêm.";
            modalAccent.style.backgroundColor = info.event.backgroundColor;
            modal.classList.remove('hidden');
        }
    });

    calendar.render();

    // 4. Đóng Modal
    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = closeModal;
    document.getElementById('btn-confirm').onclick = closeModal;
    
    // Tự động thay đổi view khi thay đổi kích thước màn hình
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) calendar.changeView('listMonth');
        else calendar.changeView('dayGridMonth');
    });
});