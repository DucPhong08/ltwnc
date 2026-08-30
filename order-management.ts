// 1. ENUMS (Các trạng thái và phân loại)

// Trạng thái xử lý của đơn hàng
export enum OrderStatus {
  PENDING = "PENDING", // Chờ xác nhận
  PROCESSING = "PROCESSING", // Đang xử lý
  SHIPPED = "SHIPPED", // Đang giao hàng
  DELIVERED = "DELIVERED", // Đã giao hàng
  CANCELLED = "CANCELLED", // Đã hủy
}

// Trạng thái thanh toán của đơn hàng
export enum PaymentStatus {
  UNPAID = "UNPAID", // Chưa thanh toán
  PAID = "PAID", // Đã thanh toán
  REFUNDED = "REFUNDED", // Đã hoàn tiền
}

// Phân hạng khách hàng
export enum CustomerTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

// 2. INTERFACES (4 Thực thể chính)

// Thông tin khách hàng
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tier: CustomerTier;
  createdAt: Date;
}

// Thông tin sản phẩm
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  isAvailable: boolean;
}

// Chi tiết sản phẩm trong đơn hàng
// Giải thích: Lưu thêm unitPrice và productName lúc mua để tránh bị đổi giá/tên sản phẩm gốc về sau
export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

// Thông tin đơn hàng
// Giải thích: Dùng Generic TMetadata để đính kèm dữ liệu mở rộng nếu cần (như đơn vị vận chuyển, mã tracking...)
export interface Order<TMetadata = unknown> {
  id: string;
  code: string;
  customerId: string;
  customerSnapshot: Pick<Customer, "id" | "name" | "email" | "phone">;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingAddress: string;
  metadata?: TMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// 3. GENERICS (Bao bọc dữ liệu API)

// Cấu trúc phản hồi API chung
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Cấu trúc phân trang danh sách
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 4. UTILITY TYPES (Tạo các DTO)

// DTO tạo khách hàng mới (bỏ id và createdAt)
export type CreateCustomerDTO = Omit<Customer, "id" | "createdAt">;

// DTO cập nhật thông tin sản phẩm (bỏ id, các trường khác là tùy chọn)
export type UpdateProductDTO = Partial<Omit<Product, "id">>;

// DTO tạo đơn hàng mới từ giao diện
export type CreateOrderDTO<TMetadata = unknown> = Omit<
  Order<TMetadata>,
  "id" | "code" | "totalAmount" | "createdAt" | "updatedAt" | "customerSnapshot"
>;

// Kiểu hiển thị tóm tắt đơn hàng (cho danh sách/dashboard)
export type OrderSummary = Pick<
  Order<unknown>,
  "id" | "code" | "status" | "paymentStatus" | "totalAmount" | "createdAt"
>;

// Kiểu đơn hàng chỉ đọc (không cho sửa giá trị trực tiếp)
export type ReadonlyOrder<TMetadata = unknown> = Readonly<Order<TMetadata>>;

// 5. CHUYỂN TRẠNG THÁI ĐƠN HÀNG (STATE MACHINE & TYPE GUARDS)

// Quy định luồng chuyển trạng thái hợp lệ
export const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

// Các trạng thái đơn hàng đã kết thúc
export type TerminalOrderStatus = Extract<
  OrderStatus,
  OrderStatus.DELIVERED | OrderStatus.CANCELLED
>;

// Hàm kiểm tra đơn hàng đã hoàn tất/hủy chưa
export function isOrderInTerminalState<TMetadata = unknown>(
  order: Order<TMetadata>,
): boolean {
  return (
    order.status === OrderStatus.DELIVERED ||
    order.status === OrderStatus.CANCELLED
  );
}

// Hàm kiểm tra việc chuyển trạng thái có hợp lệ không
export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean {
  return ALLOWED_ORDER_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

// 6. CODE DÙNG THỬ (DEMO KHỞI TẠO DỮ LIỆU)

const sampleProduct: Product = {
  id: "prod-001",
  sku: "LAPTOP-MACBOOK-M3",
  name: "MacBook Pro 14 inch M3",
  price: 45000000,
  stock: 10,
  category: "Electronics",
  isAvailable: true,
};

const updateProductPayload: UpdateProductDTO = {
  price: 43500000,
  stock: 8,
};

interface ShippingExpressMetadata {
  courierName: string;
  trackingNumber: string;
  estimatedDeliveryDate: string;
}

const sampleOrder: Order<ShippingExpressMetadata> = {
  id: "ord-1001",
  code: "ORD-20260830-01",
  customerId: "cust-01",
  customerSnapshot: {
    id: "cust-01",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0987654321",
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
  shippingAddress: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
  metadata: {
    courierName: "Giao Hàng Nhanh",
    trackingNumber: "GHN-889911",
    estimatedDeliveryDate: "2026-09-01",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const orderApiResponse: ApiResponse<Order<ShippingExpressMetadata>> = {
  success: true,
  message: "Lấy thông tin đơn hàng thành công",
  data: sampleOrder,
  timestamp: new Date().toISOString(),
};

const isValidTransition = canTransitionOrderStatus(
  sampleOrder.status,
  OrderStatus.SHIPPED,
);
const isTerminal = isOrderInTerminalState(sampleOrder);
