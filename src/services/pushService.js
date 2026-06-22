const User = require("../models/User");


const sendPush = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId).select("expoPushToken").lean();
    if (!user?.expoPushToken) return;

    const message = {
      to: user.expoPushToken,
      sound: "default",
      title,
      body,
      data,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (err) {
    console.error("[PushService] Error:", err.message);
  }
};


const sendPushBulk = async (userIds, title, body, data = {}) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      expoPushToken: { $ne: null },
    })
      .select("expoPushToken")
      .lean();

    if (users.length === 0) return;

    const messages = users.map((u) => ({
      to: u.expoPushToken,
      sound: "default",
      title,
      body,
      data,
    }));

    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      });
    }
  } catch (err) {
    console.error("[PushService] Bulk error:", err.message);
  }
};

module.exports = { sendPush, sendPushBulk };
