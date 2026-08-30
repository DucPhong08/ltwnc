## 1. Tóm tắt thiết kế

### Các thực thể chính (`interface`)

1. **`Customer`**: Lưu thông tin khách hàng và hạng thành viên (`CustomerTier`).
2. **`Product`**: Quản lý thông tin sản phẩm và tồn kho.
3. **`OrderItem`**: Chi tiết từng món trong đơn. Em có lưu thêm `productName` và `unitPrice` lúc mua để nếu sau này sản phẩm gốc bị đổi tên/giá thì đơn hàng cũ vẫn giữ nguyên thông tin.
4. **`Order<TMetadata>`**: Quản lý thông tin đơn hàng. Em dùng Generic `TMetadata` để sau này mở rộng đính kèm thông tin vận chuyển, mã giảm giá... mà không cần sửa `Order`.

### Trạng thái và Phân loại (`enum`)

- **`OrderStatus`**: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- **`PaymentStatus`**: `UNPAID`, `PAID`, `REFUNDED`
- **`CustomerTier`**: `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`

### Generic tái sử dụng

- **`ApiResponse<T>`**: Cấu trúc trả về API chuẩn.
- **`PaginatedResult<T>`**: Phân trang danh sách.

### Utility Types

- **`Omit`**: Tạo `CreateCustomerDTO` (bỏ `id`, `createdAt`) và `CreateOrderDTO`.
- **`Partial`**: Tạo `UpdateProductDTO` để cập nhật từng trường lẻ của sản phẩm.
- **`Pick`**: Tạo `OrderSummary` lấy các trường cần thiết hiển thị danh sách đơn hàng.
- **`Readonly`**: Đảm bảo dữ liệu đơn hàng không bị thay đổi trực tiếp.
- **`Extract` & `Record`**: Tạo type trạng thái kết thúc `TerminalOrderStatus` và bảng quy định luồng chuyển trạng thái `ALLOWED_ORDER_STATUS_TRANSITIONS`.
