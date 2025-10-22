# Auth Persistence Implementation

## Tổng quan

Hệ thống đã được cải thiện để lưu trữ trạng thái đăng nhập một cách bền vững, đảm bảo người dùng chỉ bị đăng xuất khi họ chủ động đăng xuất.

## Các tính năng đã thêm

### 1. AsyncStorage Integration

- **Lưu trữ thông tin người dùng**: Tất cả thông tin người dùng được lưu vào AsyncStorage
- **Lưu trữ trạng thái đăng nhập**: Trạng thái đăng nhập được lưu trữ để khôi phục nhanh
- **Tự động đồng bộ**: Dữ liệu được đồng bộ giữa Firebase và AsyncStorage

### 2. Cải thiện User Experience

- **Khôi phục nhanh**: Khi mở app, thông tin người dùng được tải ngay từ AsyncStorage
- **Không bị đăng xuất bất ngờ**: Trạng thái đăng nhập được duy trì ngay cả khi đóng app
- **Đồng bộ real-time**: Dữ liệu được cập nhật real-time từ Firebase

### 3. Các hàm helper mới

```typescript
// Lưu thông tin người dùng vào storage
saveUserToStorage(user: User)

// Xóa thông tin người dùng khỏi storage
removeUserFromStorage()

// Lấy thông tin người dùng từ storage
getUserFromStorage(): Promise<User | null>

// Kiểm tra trạng thái đăng nhập từ storage
getAuthStateFromStorage(): Promise<boolean>
```

## Cách hoạt động

### 1. Khi đăng nhập

1. Firebase xác thực thành công
2. Lấy thông tin người dùng từ Firestore
3. Lưu thông tin vào AsyncStorage
4. Cập nhật trạng thái online

### 2. Khi mở app

1. Kiểm tra AsyncStorage trước
2. Nếu có dữ liệu, hiển thị ngay (UX tốt hơn)
3. Firebase kiểm tra và đồng bộ dữ liệu
4. Cập nhật AsyncStorage nếu cần

### 3. Khi đăng xuất

1. Cập nhật trạng thái offline trong Firestore
2. Xóa dữ liệu khỏi AsyncStorage
3. Đăng xuất khỏi Firebase

## Lợi ích

### ✅ Trải nghiệm người dùng tốt hơn

- Không cần đăng nhập lại mỗi khi mở app
- Tải thông tin người dùng ngay lập tức
- Không bị đăng xuất bất ngờ

### ✅ Độ tin cậy cao

- Dữ liệu được lưu trữ cục bộ
- Hoạt động ngay cả khi mất kết nối internet
- Đồng bộ tự động khi có kết nối

### ✅ Bảo mật

- Chỉ lưu trữ thông tin cần thiết
- Tự động xóa khi đăng xuất
- Sử dụng AsyncStorage an toàn

## Testing

Chạy script test để kiểm tra persistence:

```bash
node scripts/testAuthPersistence.js
```

## Lưu ý

- AsyncStorage có giới hạn dung lượng, nhưng đủ cho thông tin người dùng
- Dữ liệu được mã hóa tự động bởi AsyncStorage
- Chỉ hoạt động trên thiết bị thật, không hoạt động trên simulator web
