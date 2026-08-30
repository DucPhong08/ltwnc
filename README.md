# BÀI TẬP VỀ NHÀ: THIẾT KẾ TYPE TYPESCRIPT MODULE "QUẢN LÝ ĐƠN HÀNG"

> **Môn học:** Lập trình Web nâng cao  
> **Buổi 1:** TypeScript nâng cao cho ứng dụng lớn  
> **Đơn vị:** Học viện Công nghệ Bưu chính Viễn thông (PTIT)

---

## 📌 1. Giới thiệu

Hệ thống type TypeScript cho module **"Quản lý đơn hàng"** được thiết kế nhằm đáp ứng đầy đủ tính chính xác về mặt dữ liệu, tính mở rộng linh hoạt, đồng thời tuân thủ nghiêm ngặt các nguyên tắc tổ chức mã nguồn tiên tiến trong các ứng dụng thực tế.

File mã nguồn chính: [`order-management.ts`](./order-management.ts)

---

## 📐 2. Cấu trúc và Thiết kế Type

### 2.1. Enum (Định danh trạng thái & phân loại)

- **`OrderStatus`**: Đại diện cho vòng đời đơn hàng (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **`PaymentStatus`**: Quản lý trạng thái thanh toán (`UNPAID`, `PAID`, `REFUNDED`).
- **`CustomerTier`**: Phân hạng khách hàng (`BRONZE`, `SILVER`, `GOLD`, `PLATINUM`).

> 💡 **Giải thích thiết kế:**  
> Sử dụng **String Enum** giúp việc ghi log, serialize/deserialize qua API JSON diễn ra rõ ràng, hỗ trợ việc debug dễ dàng hơn so với Numeric Enum mặc định.

---

### 2.2. Core Interfaces (4 Thực thể chính)

1. **`Customer`**: Thông tin người mua hàng (id, tên, email, phone, địa chỉ, hạng khách hàng, ngày tạo).
2. **`Product`**: Thông tin hàng hóa (id, SKU, tên, giá, số lượng tồn kho, danh mục, trạng thái khả dụng).
3. **`OrderItem`**: Thông tin chi tiết mặt hàng được đặt mua trong đơn.
   - _Snapshot Pattern:_ Lưu trữ `productName` và `unitPrice` tại thời điểm mua. Đảm bảo lịch sử đơn hàng giữ nguyên giá trị ngay cả khi thông tin sản phẩm gốc trong bảng `Product` thay đổi về sau.
4. **`Order<TMetadata>`**: Thực thể trung tâm quản lý đơn hàng.
   - Tích hợp `customerSnapshot` bằng `Pick<Customer, ...>` để bảo toàn thông tin khách hàng tại thời điểm đặt.
   - Áp dụng **Generic `TMetadata`** cho phép đính kèm các thông tin tùy biến (ví dụ: đơn vị vận chuyển, mã vận đơn, thông tin quà tặng...) mà không phải sửa đổi interface chính.

---

### 2.3. Generics (Tái sử dụng & Bao bọc dữ liệu)

- **`ApiResponse<T>`**: Chuẩn hóa cấu trúc phản hồi API (`success`, `message`, `data: T`, `timestamp`).
- **`PaginatedResult<T>`**: Chuẩn hóa dữ liệu trả về cho các danh sách có phân trang (danh sách đơn hàng, danh sách sản phẩm...).

---

### 2.4. Utility Types (Định nghĩa DTO & Tái sử dụng)

- **`Omit`**:
  - `CreateCustomerDTO = Omit<Customer, 'id' | 'createdAt'>` (Loại bỏ các trường do hệ thống tự sinh).
  - `CreateOrderDTO = Omit<Order, ...>` (Loại bỏ các thuộc tính tính toán động hoặc tự động tạo trên server).
- **`Partial`**:
  - `UpdateProductDTO = Partial<Omit<Product, 'id'>>` (Cho phép cập nhật từng trường lẻ của sản phẩm ngoại trừ `id`).
- **`Pick`**:
  - `OrderSummary = Pick<Order, 'id' | 'code' | 'status' | 'paymentStatus' | 'totalAmount' | 'createdAt'>` (Rút gọn thuộc tính để hiển thị danh sách hoặc Dashboard tối ưu băng thông).
- **`Extract`**:
  - `TerminalOrderStatus = Extract<OrderStatus, OrderStatus.DELIVERED | OrderStatus.CANCELLED>` (Lọc ra tập hợp các trạng thái kết thúc của đơn hàng).
- **`Readonly`**:
  - `ReadonlyOrder = Readonly<Order>` (Đảm bảo dữ liệu đơn hàng bất biến khi đã chốt xử lý).
- **`Record`**:
  - `ALLOWED_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]>` (State Machine map quy định luồng chuyển trạng thái hợp lệ).

---

## 🛠️ 3. Tiêu chí Đánh giá & Kiểm tra

- [x] Đầy đủ type cho 4 thực thể (`Order`, `OrderItem`, `Product`, `Customer`) đúng quan hệ dữ liệu.
- [x] Sử dụng Generic hợp lý (`Order<TMetadata>`, `ApiResponse<T>`, `PaginatedResult<T>`).
- [x] Áp dụng đúng các Utility Type (`Omit`, `Pick`, `Partial`, `Extract`, `Readonly`, `Record`).
- [x] Cấu trúc State Machine & Type Guard kiểm tra luồng chuyển trạng thái đơn hàng (`canTransitionOrderStatus`, `isOrderInTerminalState`).
- [x] Comment giải thích rõ ràng chi tiết cho từng lựa chọn thiết kế.
