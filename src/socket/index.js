// const { verifyAccessToken } = require('../utils/jwt');

// const setupSocket = (io) => {
//     io.on("connection", (socket) => {
//         try {
//             const token = socket.handshake.auth?.token;

//             if (!token) {
//                 socket.emit("auth-error", { message: "Access token is required." });
//                 return socket.disconnect(true);
//             }

//             const decoded = verifyAccessToken(token);

//             if (!decoded?.id) {
//                 socket.emit("auth-error", { message: "Invalid token: user ID not found." });
//                 return socket.disconnect(true);
//             }

//             const user_id = decoded.id;

//             // Store user_id on socket 
//             socket.data.user_id = user_id;

//             // Join user's personal room
//             socket.join(`user-${user_id}`);

//             socket.on("join-chat", ({ chat_id }) => {
//                 socket.join(chat_id);
//             });

//             socket.on("leave-chat", ({ chat_id }) => {
//                 socket.leave(chat_id);
//             });


//         } catch (err) {
//             socket.emit("auth-error", { message: "Authentication failed." });

//             return socket.disconnect(true);
//         }
//     });
// }


// module.exports = setupSocket;



const setupSocket = (io) => {
    io.use((socket, next) => {
        try {
            // Manually parse cookies from handshake headers
            const rawCookies = socket.handshake.headers.cookie;
            const cookies = {};
            if (rawCookies) {
                rawCookies.split(";").forEach((cookie) => {
                    const [key, value] = cookie.split("=").map((c) => c.trim());
                    cookies[key] = decodeURIComponent(value);
                });
            }

            const token = cookies.accessToken;
            if (!token) return next(new Error("Access token is required."));

            const decoded = verifyAccessToken(token);
            if (!decoded?.id) return next(new Error("Invalid token"));

            socket.data.user_id = decoded.id;
            next();
        } catch (err) {
            next(new Error("Authentication failed."));
        }
    });

    io.on("connection", (socket) => {
        const user_id = socket.data.user_id;

        socket.join(`user-${user_id}`);

        socket.on("join-chat", ({ chat_id }) => socket.join(chat_id));
        socket.on("leave-chat", ({ chat_id }) => socket.leave(chat_id));

    });
};
module.exports = setupSocket;