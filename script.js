document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const body = document.body;
    
    // 1. CẤU HÌNH LIÊN KẾT GOOGLE SHEETS CỦA LỚP 11A8
    const SPREADSHEET_ID = '1jMDwbpxaBKvsK7z27s9n6x6ghpLwB9q9AJT4dcF7m1Y';
    const SHEET_NAME = 'hướng dẫn nhập liệu Google Sheets'; 
    const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}&tqx=out:json`;

    // Các phần tử Modal (Hộp thoại trung tâm)
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalDesc = document.getElementById('modal-description');
    const modalAccent = document.getElementById('modal-accent');

    // 2. LOGIC ĐIỀU KHIỂN CHẾ ĐỘ TỐI (DARK MODE)
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

    // Khôi phục trạng thái Dark Mode từ bộ nhớ máy
    applyTheme(localStorage.getItem('theme') === 'dark');

    toggleBtn.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme(isDark);
    });

    // 3. HÀM LẤY DỮ LIỆU TRỰC TIẾP TỪ GOOGLE SHEETS (GVIZ API)
    async function fetchEventsFromSheets(info, successCallback, failureCallback) {
        try {
            const response = await fetch(GVIZ_URL);
            const text = await response.text();
            
            // Cắt bỏ phần dư thừa của Google (JSONP wrapper) để lấy JSON chuẩn
            const jsonText = text.substring(47).slice(0, -2);
            const data = JSON.parse(jsonText);
            
            // Ánh xạ dữ liệu từ cột Google Sheets sang định dạng của Lịch
            // Cột 0: Title | Cột 1: Start | Cột 2: Description | Cột 3: Color
            const events = data.table.rows.map(row => {
                const cells = row.c;
                return {
                    title: cells[0] ? cells[0].v : 'Sự kiện không tên',
                    start: cells[1] ? formatGoogleDate(cells[1].v) : '',
                    description: cells[2] ? cells[2].v : '',
                    backgroundColor: cells[3] ? cells[3].v : '#4f46e5',
                    allDay: true
                };
            });

            successCallback(events);
        } catch (error) {
            console.error("Lỗi đồng bộ dữ liệu lớp 11A8:", error);
            successCallback([]); 
        }
    }

    // Hàm phụ trợ xử lý định dạng ngày đặc thự của Google (Date(2026,0,28))
    function formatGoogleDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return dateStr;
        if (dateStr.startsWith('Date')) {
            const parts = dateStr.match(/\d+/g);
            // Tháng trong Google Sheets bắt đầu từ 0 (Tháng 1 = 0)
            return `${parts[0]}-${(parseInt(parts[1]) + 1).toString().padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        return dateStr;
    }

    // 4. KHỞI TẠO VÀ CẤU HÌNH LỊCH (FULLCALENDAR)
    const calendar = new FullCalendar.Calendar(calendarEl, {
        // Tự động chuyển sang Danh sách trên điện thoại (< 768px)
        initialView: window.innerWidth < 768 ? 'listMonth' : 'dayGridMonth',
        locale: 'vi',
        firstDay: 1, // Thứ 2 là đầu tuần
        height: 'auto',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth' 
        },
        buttonText: {
            today: 'Hôm nay', month: 'Tháng', list: 'Danh sách'
        },

        // Kết nối hàm lấy dữ liệu từ Google Sheets
        events: fetchEventsFromSheets,

        // Xử lý khi học sinh click vào một sự kiện
        eventClick: function(info) {
            modalTitle.innerText = info.event.title;
            modalDate.innerText = info.event.start.toLocaleDateString('vi-VN', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });
            modalDesc.innerText = info.event.extendedProps.description || "Lớp phó học tập chưa có ghi chú thêm.";
            modalAccent.style.backgroundColor = info.event.backgroundColor;
            
            // Hiển thị Modal
            modal.classList.remove('hidden');
        },

        // Tự động cập nhật giao diện khi xoay màn hình hoặc thay đổi kích thước
        windowResize: function() {
            if (window.innerWidth < 768) {
                calendar.changeView('listMonth');
            } else {
                calendar.changeView('dayGridMonth');
            }
        }
    });

    calendar.render();

    // 5. CÁC HÀM ĐÓNG MODAL
    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = closeModal;
    document.getElementById('btn-confirm').onclick = closeModal;

    // Đóng bằng phím Esc cho tiện
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});