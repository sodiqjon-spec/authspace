AUTHS PACE — ISHGA TUSHIRISH (Windows / VS Code)

1) ZIP faylni oching.
2) AuthSpace papkasini VS Code orqali oching.
3) Papka ichida .env.example faylidan nusxa oling va nusxasini .env deb nomlang.
   Muhim: fayl nomi aynan .env bo‘lsin, .env.txt emas.
4) .env faylini ochib quyidagilarni o‘zgartiring:
   ADMIN_PASSWORD=OzingizTanlaganKuchliParol
   SESSION_SECRET=uzun-va-tasodifiy-maxfiy-kalit
   PORT=3000
5) VS Code terminalini oching (Terminal > New Terminal).
6) Quyidagilarni bajaring:
   npm install
   npm start
7) Sayt:        http://localhost:3000
   Admin panel: http://localhost:3000/admin.html
8) Admin panelga .env ichidagi ADMIN_PASSWORD qiymatini kiriting.

ESLATMA:
- Server ishlayotgan terminalni yopmang. To‘xtatish uchun Ctrl+C.
- Har qayta ishga tushirganda faqat npm start yozish kifoya.
- Ro‘yxatdan o‘tgan foydalanuvchi ma’lumotlari data/users.json faylida saqlanadi.
- Admin panel faqat username va ro‘yxatdan o‘tgan vaqtni ko‘rsatadi.
- Parol hech qachon admin panelga yuborilmaydi; bazada bcrypt xesh saqlanadi.
- Bu o‘quv/demo loyiha. Internetga ommaviy joylashdan oldin production sessiya saqlash,
  HTTPS, rate limiting, CSRF himoyasi va xavfsiz cookie sozlamalarini qo‘shish kerak.
