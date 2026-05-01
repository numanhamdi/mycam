const io = require("socket.io")(3000, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User Connected: " + socket.id);

  // عندما يدخل أي طرف (كاميرا أو فيور) إلى الغرفة
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // إرسال تنبيه للكاميرا الموجودة في الغرفة بأن هناك طرف جديد دخل
    // هذا سيجعل الكاميرا تبدأ بإرسال الـ Offer فوراً
    socket.to(roomId).emit("viewer-joined");
  });

  // طلب العرض يدوياً (زيادة تأكيد)
  socket.on("request-offer", (roomId) => {
    console.log(`Offer requested for room: ${roomId}`);
    socket.to(roomId).emit("viewer-joined");
  });

  // تمرير الـ Offer من الكاميرا إلى الفيور
  socket.on("offer", (data) => {
    console.log(`Sending offer to room: ${data.roomId}`);
    socket.to(data.roomId).emit("offer", data.offer);
  });

  // تمرير الـ Answer من الفيور إلى الكاميرا
  socket.on("answer", (data) => {
    console.log(`Sending answer to room: ${data.roomId}`);
    socket.to(data.roomId).emit("answer", data.answer);
  });

  // تمرير الـ ICE Candidates بين الطرفين
  socket.on("candidate", (data) => {
    socket.to(data.roomId).emit("candidate", data.candidate);
  });

  // تمرير الأوامر (فلاش، تبديل كاميرا)
  socket.on("command", (data) => {
    console.log(`Command received: ${data.command} for room: ${data.roomId}`);
    socket.to(data.roomId).emit("command", { command: data.command });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected: " + socket.id);
  });
});

console.log("Signaling server running on port 3000...");
