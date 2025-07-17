const axios = require("axios");
const { getMenu } = require("../utils/menuCache");

async function chatWithGPT(message) {
  const menu = await getMenu();

  const menuText = menu
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

  const systemPrompt = `
You are a helpful order-taking assistant for a restaurant.

ONLY suggest or accept items that are listed in the menu below.
If a customer asks for something that is NOT in the menu, clearly reply: "Sorry, we don't have that item currently."

Here is the restaurant menu:
${menuText}

Only use this menu to take orders or answer item questions.
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: message },
      ],
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}

module.exports = { chatWithGPT };
