# 📱 Siêu Thị Điện Thoại

Website bán điện thoại với đầy đủ tính năng mua sắm và ước tính giá sản phẩm dựa trên thông số kỹ thuật.

## 🛠️ Công Nghệ Sử Dụng

Website được xây dựng bằng **Next.js** (framework của React) với **TypeScript** để đảm bảo code chạy ổn định và dễ bảo trì. Giao diện được thiết kế bằng **Tailwind CSS** để responsive trên mọi thiết bị, từ điện thoại đến máy tính.

Các component UI được xây dựng dựa trên **Radix UI** - một thư viện component chất lượng cao, giúp website có giao diện đẹp và trải nghiệm người dùng tốt. Quản lý state (giỏ hàng, đơn hàng) sử dụng **Zustand** - một thư viện nhẹ và dễ sử dụng.

Form được xử lý bằng **React Hook Form** kết hợp với **Zod** để validate dữ liệu đầu vào một cách chính xác. Icon sử dụng **Lucide React** - bộ icon đẹp và đầy đủ.

## ✨ Tính Năng Hiện Có

### 🏠 Trang Chủ
- Hiển thị sản phẩm nổi bật, sản phẩm mới, sản phẩm được đánh giá cao
- Tìm kiếm sản phẩm theo tên hoặc thương hiệu
- Lọc sản phẩm theo thương hiệu
- Hiển thị các phân khúc: giá rẻ, tầm trung, cao cấp, flagship

### 🛍️ Mua Sắm
- **Danh sách sản phẩm**: Xem tất cả điện thoại với đầy đủ thông tin, giá cả, hình ảnh
- **Chi tiết sản phẩm**: 
  - Xem thông số kỹ thuật đầy đủ (RAM, ROM, camera, pin, màn hình...)
  - Chọn phiên bản và màu sắc
  - Thêm vào giỏ hàng
  - Xem sản phẩm tương tự có giá gần bằng
- **So sánh sản phẩm**: So sánh thông số giữa 2-3 điện thoại để đưa ra quyết định tốt nhất
- **Giỏ hàng**: Quản lý sản phẩm đã chọn, cập nhật số lượng, xóa sản phẩm
- **Thanh toán**: Điền thông tin giao hàng và hoàn tất đơn hàng

### 💰 Ước Tính Giá
- Nhập thông số kỹ thuật (ROM, RAM, chip, thương hiệu, camera, pin, màn hình)
- Nhận kết quả ước tính giá ngay lập tức
- Hiển thị giá bằng VND và USD
- Xem các sản phẩm tương tự có trong cửa hàng với giá gần bằng

### 👤 Tài Khoản
- **Đăng ký / Đăng nhập**: Tạo tài khoản để quản lý đơn hàng
- **Hồ sơ**: Xem và cập nhật thông tin cá nhân
- **Đơn hàng**: Xem lịch sử đơn hàng và chi tiết từng đơn
- **Yêu thích**: Lưu sản phẩm yêu thích để xem lại sau

### 🔧 Quản Trị (Admin)
- Quản lý sản phẩm: Thêm, sửa, xóa sản phẩm
- Quản lý đơn hàng: Xem và cập nhật trạng thái đơn hàng
- Quản lý người dùng: Xem danh sách người dùng

## 🎨 Giao Diện

Website có giao diện hiện đại, dễ sử dụng với:
- **Dark mode / Light mode**: Chuyển đổi giữa chế độ sáng và tối
- **Responsive**: Tự động điều chỉnh giao diện trên điện thoại, tablet, máy tính
- **Animation mượt mà**: Các hiệu ứng chuyển trang và tương tác mượt mà
- **UI components đẹp**: Button, card, form, dialog... được thiết kế nhất quán và đẹp mắt

## 📊 Dữ Liệu

Website hiện có khoảng 40+ sản phẩm điện thoại đa dạng từ các thương hiệu phổ biến như Apple, Samsung, Xiaomi, OPPO, Vivo, Realme... Các sản phẩm được phân loại theo phân khúc giá: giá rẻ, tầm trung, cao cấp, và flagship.

Tính năng ước tính giá sử dụng mô hình Machine Learning được huấn luyện trên dữ liệu thực tế từ thị trường, giúp đưa ra giá ước tính khá chính xác dựa trên thông số kỹ thuật.

---

**Website được phát triển với mục tiêu mang lại trải nghiệm mua sắm điện thoại tốt nhất cho người dùng.**
