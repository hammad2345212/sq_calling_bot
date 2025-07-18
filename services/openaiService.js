const axios = require("axios");
const { OPENAI_API_KEY } = require("../config/openai");
const { getMenu } = require("./menuService");

function formatMenuForChat(menu) {
  return menu
    .map(
      (cat) =>
        `Category: ${cat.name}\n` +
        cat.items
          .map(
            (item) =>
              `- ${item.name} (${item.price}): ${
                item.description || "No description"
              }`
          )
          .join("\n")
    )
    .join("\n\n");
}

function formatMenuForVoice(menu) {
  return menu
    .map(
      (cat) =>
        `${cat.name}: ` +
        cat.items.map((item) => `${item.name} for ${item.price}`).join(", ")
    )
    .join(". ");
}

function extractItemsAndTotal(message, menu) {
  const lowerMsg = message.toLowerCase();
  const orderedItems = [];

  menu.forEach((cat) => {
    cat.items.forEach((item) => {
      const lowerName = item.name.toLowerCase();
      if (lowerMsg.includes(lowerName)) {
        const priceValue = parseFloat(item.price.replace(/[^0-9.]/g, ""));
        orderedItems.push({ name: item.name, price: priceValue });
      }
    });
  });

  const total = orderedItems.reduce((sum, item) => sum + item.price, 0);
  return { orderedItems, total };
}

async function askChatGPT(message) {
  const menu = await getMenu();
  const menuText = formatMenuForChat(menu);
  const { orderedItems, total } = extractItemsAndTotal(message, menu);

  const systemPrompt = `
You are an AI assistant that takes food orders from a restaurant menu.

Menu:
${menuText}

Instructions:
- Only accept items listed in the menu.
- If a user mentions an unavailable item, say: "Sorry, we don't have that item."
- At the end, confirm what they ordered and give the total price.
`;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const gptReply = res.data.choices[0].message.content.trim();

  const summary =
    orderedItems.length > 0
      ? `\n\nYou've ordered:\n${orderedItems
          .map((i) => `- ${i.name} ($${i.price.toFixed(2)})`)
          .join("\n")}\nTotal: $${total.toFixed(2)}`
      : "\n\nYou haven't selected any available items from the menu.";

  return gptReply + summary;
}

async function askVoiceGPT(message) {
  const menu = await getMenu();
  const menuText = formatMenuForVoice(menu);
  const { orderedItems, total } = extractItemsAndTotal(message, menu);

  const systemPrompt = `
You are a voice assistant for a restaurant.

Available items:
${menuText}

Instructions:
- ONLY accept orders from this menu.
- If any item is not available, respond: "Sorry, we don't have that item."
- Then summarize the valid order and give the total.
Keep the response short and natural for voice.
`;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const gptReply = res.data.choices[0].message.content.trim();

  // Determine intent
  let intent = "other";
  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes("menu") ||
    lowerMsg.includes("what do you have") ||
    lowerMsg.includes("available") ||
    lowerMsg.includes("options") ||
    lowerMsg.includes("show me") ||
    gptReply.toLowerCase().includes("we have")
  ) {
    intent = "menu";
  } else if (orderedItems.length > 0) {
    intent = "order";
  }

  const summary =
    intent === "order"
      ? ` You've ordered: ${orderedItems
          .map((i) => `${i.name} for $${i.price.toFixed(2)}`)
          .join(", ")}. Total is $${total.toFixed(2)}.`
      : "";

  return {
    reply: gptReply + summary,
    intent,
  };
}

module.exports = {
  askChatGPT,
  askVoiceGPT,
};
