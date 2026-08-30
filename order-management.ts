/**
 * BÀI TẬP VỀ NHÀ: THIẾT KẾ TYPE TYPESCRIPT CHO MODULE "QUẢN LÝ ĐƠN HÀNG"
 * Môn: Lập trình Web nâng cao | Buổi 1: TypeScript nâng cao cho ứng dụng lớn
 * Học viện Công nghệ Bưu chính Viễn thông (PTIT)
 */

// 1. ENUMS - ĐỊNH DANH TRẠNG THÁI VÀ PHÂN LOẠI

/**
 * Enum quản lý trạng thái của đơn hàng trong quy trình xử lý.
 * Thiết kế bằng String Enum giúp ghi log, serialize/deserialize dễ đọc và debug.
 */
export enum OrderStatus {
  PENDING = 'PENDING',         // Chờ xác nhận
  PROCESSING = 'PROCESSING',   // Đang đóng gói / xử lý
  SHIPPED = 'SHIPPED',         // Đang vận chuyển
  DELIVERED = 'DELIVERED',     // Đã giao hàng thành công
  CANCELLED = 'CANCELLED',     // Đã hủy đơn
}

/**
 * Enum quản lý trạng thái thanh toán của đơn hàng.
 */
export enum PaymentStatus {
  UNPAID = 'UNPAID',       // Chưa thanh toán
  PAID = 'PAID',           // Đã thanh toán thành công
  REFUNDED = 'REFUNDED',   // Đã hoàn tiền
}

/**
 * Enum phân hạng khách hàng để áp dụng các chính sách chiết khấu/khuyến mãi.
 */
export enum CustomerTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

// 2. CORE INTERFACES - 4 THỰC THỂ CHÍNH

/**
 * 1. Customer (Khách hàng)
 * Đại diện cho thông tin người mua hàng trong hệ thống.
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tier: CustomerTier;
  createdAt: Date;
}

/**
 * 2. Product (Sản phẩm)
 * Đại diện cho hàng hóa có sẵn trong kho.
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  isAvailable: boolean;
}

/**
 * 3. OrderItem (Chi tiết mục sản phẩm trong đơn hàng)
 * Đại diện cho từng dòng sản phẩm được mua trong đơn.
 * 
 * DESIGN NOTE:
 * - Lưu `productId` để liên kết với thực thể Product.
 * - Lưu `unitPrice` và `productName` tại thời điểm mua (Snapshot) để nếu sản phẩm gốc
 *   bị thay đổi giá/tên về sau thì lịch sử đơn hàng vẫn chính xác.
 */
export interface OrderItem {
  productId: string;
  productName: string; // Snapshot tên sản phẩm
  unitPrice: number;   // Snapshot đơn giá lúc đặt mua
  quantity: number;
  discount: number;    // Số tiền giảm giá cho mặt hàng này (nếu có)
}

/**
 * 4. Order (Đơn hàng)
 * Thực thể trung tâm quản lý toàn bộ thông tin đơn hàng.
 * 
 * DESIGN NOTE:
 * - Áp dụng Generic `TMetadata` để cho phép mở rộng dữ liệu tùy biến (ví dụ: thông tin giao hàng đặc thù, mã giảm giá, tracking ID...) mà không làm thay đổi interface gốc.
 * - `customerSnapshot` sử dụng Utility Type `Pick` để lưu các thông tin liên lạc quan trọng tại thời điểm mua.
 */
export interface Order<TMetadata = any> {
  id: string;
  code: string;
  customerId: string;
  customerSnapshot: Pick<Customer, 'id' | 'name' | 'email' | 'phone'>;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingAddress: string;
  metadata?: TMetadata; // Generic mở rộng cho dữ liệu bổ sung
  createdAt: Date;
  updatedAt: Date;
}

// 3. GENERICS - TÁI SỬ DỤNG VÀ BAO BỌC DỮ LIỆU

/**
 * Generic Interface bao bọc phản hồi API (ApiResponse<T>)
 * Giúp tái sử dụng chuẩn hóa dữ liệu trả về cho mọi API trong module (Order, Product, Customer...).
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Generic Interface bao bọc kết quả phân trang (PaginatedResult<T>)
 * Dùng cho các danh sách danh mục như danh sách đơn hàng, danh sách sản phẩm.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 4. UTILITY TYPES - TÁI SỬ DỤNG VÀ ĐỊNH NGHĨA DTO (DATA TRANSFER OBJECTS)

/**
 * Utility Type 1: `Omit`
 * Tạo DTO khi thêm mới Khách hàng. Loại bỏ `id` và `createdAt` vì hệ thống sẽ tự sinh các trường này.
 */
export type CreateCustomerDTO = Omit<Customer, 'id' | 'createdAt'>;

/**
 * Utility Type 2: `Partial` & `Omit`
 * Tạo DTO khi cập nhật sản phẩm.
 * - Loại bỏ `id` (không cho phép sửa id).
 * - Dùng `Partial` để tất cả các trường còn lại trở thành optional (chỉ truyền những trường cần sửa).
 */
export type UpdateProductDTO = Partial<Omit<Product, 'id'>>;

/**
 * Utility Type 3: `Omit`
 * Tạo DTO khi tạo đơn hàng mới từ Frontend.
 * Loại bỏ các trường hệ thống tính toán/sinh ra như `id`, `code`, `totalAmount`, `createdAt`, `updatedAt`, `customerSnapshot`.
 */
export type CreateOrderDTO<TMetadata = any> = Omit<
  Order<TMetadata>,
  'id' | 'code' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'customerSnapshot'
>;

/**
 * Utility Type 4: `Pick`
 * Kiểu dữ liệu rút gọn dùng để hiển thị danh sách đơn hàng trên trang danh sách hoặc Dashboard.
 * Chỉ chọn các thông tin cần thiết nhất để tối ưu dung lượng truyền tải.
 */
export type OrderSummary = Pick<
  Order<any>,
  'id' | 'code' | 'status' | 'paymentStatus' | 'totalAmount' | 'createdAt'
>;

/**
 * Utility Type 5: `Readonly`
 * Đảm bảo dữ liệu đơn hàng khi đã chốt/hoàn tất không thể bị thay đổi giá trị thuộc tính trực tiếp (Immutability).
 */
export type ReadonlyOrder<TMetadata = any> = Readonly<Order<TMetadata>>;

// 5. ADVANCED TYPE GUARDS & STATE MACHINE (CHUYỂN ĐỔI TRẠNG THÁI NÂNG CAO)

/**
 * Định nghĩa sơ đồ chuyển đổi trạng thái hợp lệ cho Đơn hàng (State Machine Map).
 * Map mỗi trạng thái hiện tại với danh sách các trạng thái tiếp theo hợp lệ.
 */
export const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],  // Trạng thái kết thúc, không thể chuyển tiếp
  [OrderStatus.CANCELLED]: [],  // Trạng thái kết thúc, không thể chuyển tiếp
};

/**
 * Utility Type: Lấy các trạng thái kết thúc (Terminal States) sử dụng `Extract`
 */
export type TerminalOrderStatus = Extract<OrderStatus, OrderStatus.DELIVERED | OrderStatus.CANCELLED>;

/**
 * Type Guard: Kiểm tra xem đơn hàng đã ở trạng thái kết thúc (DELIVERED hoặc CANCELLED) hay chưa.
 */
export function isOrderInTerminalState<T = any>(order: Order<T>): boolean {
  return order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
}

/**
 * Helper: Kiểm tra tính hợp lệ khi chuyển đổi từ currentStatus sang nextStatus.
 */
export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  const allowedNextStatuses = ALLOWED_ORDER_STATUS_TRANSITIONS[currentStatus];
  return allowedNextStatuses.includes(nextStatus);
}

// 6. DEMO VÀ KIỂM TRA ĐỘ CHÍNH XÁC CỦA TYPE (EXAMPLE USAGE)

// Ví dụ 1: Khởi tạo sản phẩm mẫu
const sampleProduct: Product = {
  id: 'prod-001',
  sku: 'LAPTOP-MACBOOK-M3',
  name: 'MacBook Pro 14 inch M3',
  price: 45000000,
  stock: 10,
  category: 'Electronics',
  isAvailable: true,
};

// Ví dụ 2: Khởi tạo DTO cập nhật sản phẩm (Partial & Omit)
const updateProductPayload: UpdateProductDTO = {
  price: 43500000,
  stock: 8,
};

// Ví dụ 3: Đơn hàng với Metadata mở rộng qua Generic
interface ShippingExpressMetadata {
  courierName: string;
  trackingNumber: string;
  estimatedDeliveryDate: string;
}

const sampleOrder: Order<ShippingExpressMetadata> = {
  id: 'ord-1001',
  code: 'ORD-20260830-01',
  customerId: 'cust-01',
  customerSnapshot: {
    id: 'cust-01',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
  },
  items: [
    {
      productId: sampleProduct.id,
      productName: sampleProduct.name,
      unitPrice: sampleProduct.price,
      quantity: 1,
      discount: 1000000,
    },
  ],
  status: OrderStatus.PROCESSING,
  paymentStatus: PaymentStatus.PAID,
  totalAmount: 44000000,
  shippingAddress: '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
  metadata: {
    courierName: 'Giao Hàng Nhanh',
    trackingNumber: 'GHN-889911',
    estimatedDeliveryDate: '2026-09-01',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Ví dụ 4: Khai báo Phản hồi API dạng Generic
const orderApiResponse: ApiResponse<Order<ShippingExpressMetadata>> = {
  success: true,
  message: 'Lấy thông tin đơn hàng thành công',
  data: sampleOrder,
  timestamp: new Date().toISOString(),
};

// Ví dụ 5: Kiểm tra tính hợp lệ chuyển đổi trạng thái đơn hàng (Polish Feature)
const isValidTransition = canTransitionOrderStatus(sampleOrder.status, OrderStatus.SHIPPED); // true
const isTerminal = isOrderInTerminalState(sampleOrder); // false
