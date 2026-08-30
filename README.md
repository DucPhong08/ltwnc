## 1. Tổng quan thiết kế bộ Type

Bài tập yêu cầu thiết kế hệ thống kiểu dữ liệu cho module Quản lý đơn hàng với 4 thực thể cốt lõi (`Customer`, `Product`, `OrderItem`, `Order`). Thiết kế được tổ chức chặt chẽ, tối ưu cho việc mở rộng và tái sử dụng code trong thực tế.

---

## 2. Chi tiết thực thể & Lý do lựa chọn thiết kế

### 2.1. String Enums (Định danh trạng thái)

- **`OrderStatus`**: Quản lý vòng đời đơn hàng (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **`PaymentStatus`**: Trạng thái thanh toán (`UNPAID`, `PAID`, `REFUNDED`).
- **`CustomerTier`**: Phân hạng khách hàng để tính ưu đãi (`BRONZE`, `SILVER`, `GOLD`, `PLATINUM`).

> **Lý do lựa chọn String Enum:**  
> String Enum giúp dữ liệu khi serialize ra JSON gửi qua API hoặc ghi log hệ thống hiển thị dạng chuỗi rõ nghĩa (ví dụ `"status": "PROCESSING"` thay vì dạng số `1`), giúp quá trình đọc log và debug giữa Frontend - Backend dễ dàng hơn.

---

### 2.2. Core Interfaces (4 Thực thể chính)

1. **`Customer`**: Lưu thông tin cá nhân, liên lạc và hạng thành viên của người mua hàng.
2. **`Product`**: Lưu thông tin sản phẩm, giá bán, số lượng tồn kho và trạng thái khả dụng.
3. **`OrderItem`**: Lưu thông tin chi tiết từng mặt hàng trong đơn.
   - **Thiết kế Snapshot:** Lưu thêm `productName` và `unitPrice` tại thời điểm mua. Điều này đảm bảo lịch sử đơn hàng luôn chính xác tuyệt đối ngay cả khi thông tin sản phẩm gốc bị thay đổi tên hoặc giá về sau.
4. **`Order<TMetadata>`**: Thực thể trung tâm của đơn hàng.
   - **Generic TMetadata:** Mặc định là `unknown` (thay vì dùng `any`) giúp đính kèm linh hoạt các thông tin mở rộng (như đối tác vận chuyển, mã vận đơn, ghi chú) mà không phải sửa đổi cấu trúc interface chính.
   - **customerSnapshot:** Dùng `Pick<Customer, ...>` để lưu các thông tin liên lạc cốt lõi lúc mua.

---

### 2.3. Generics (Tái sử dụng & Bao bọc dữ liệu)

- **`ApiResponse<T>`**: Cấu trúc trả về chuẩn hóa cho tất cả các endpoint API (`success`, `message`, `data: T`, `timestamp`).
- **`PaginatedResult<T>`**: Cấu trúc bao bọc cho danh sách phân trang (phù hợp với các bảng danh sách đơn hàng, danh sách sản phẩm).

---

### 2.4. Utility Types (Tạo DTOs & Tái sử dụng)

- **`Omit`**:
  - `CreateCustomerDTO = Omit<Customer, 'id' | 'createdAt'>` (Loại bỏ các trường do hệ thống tự sinh).
  - `CreateOrderDTO<TMetadata> = Omit<Order<TMetadata>, ...>` (DTO gửi từ Frontend khi tạo đơn mới).
- **`Partial`**:
  - `UpdateProductDTO = Partial<Omit<Product, 'id'>>` (Cho phép cập nhật lẻ từng trường sản phẩm ngoại trừ `id`).
- **`Pick`**:
  - `OrderSummary = Pick<Order<unknown>, ...>` (Kiểu dữ liệu rút gọn tối ưu băng thông khi hiển thị danh sách đơn hàng/Dashboard).
- **`Readonly`**:
  - `ReadonlyOrder<TMetadata> = Readonly<Order<TMetadata>>` (Đảm bảo tính bất biến của đơn hàng sau khi chốt).
- **`Extract` & `Record`**:
  - `TerminalOrderStatus = Extract<OrderStatus, ...>` (Lọc tập hợp các trạng thái kết thúc).
  - `ALLOWED_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]>` (Sơ đồ State Machine quy định luồng chuyển trạng thái hợp lệ).
