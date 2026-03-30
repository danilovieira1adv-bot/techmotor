import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

const token = process.env.TELEGRAM_BOT_TOKEN;
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL,
});

let bot: TelegramBot | null = null;

export function startTelegramBot() {
  if (!token) {
    console.log("⚠️ TELEGRAM_BOT_TOKEN não configurado — bot desabilitado");
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  console.log("🤖 Bot Telegram iniciado!");

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot!.sendMessage(chatId, 
      "🔧 *Bem-vindo ao TechMotor!*\n\n" +
      "Sou o assistente técnico da retífica. Posso te ajudar com:\n\n" +
      "• Dúvidas técnicas sobre motores diesel\n" +
      "• Status das suas ordens de serviço\n" +
      "• Especificações técnicas\n\n" +
      "Digite sua pergunta ou use os comandos:\n" +
      "/status - Ver suas OS\n" +
      "/ajuda - Ver todos os comandos",
      { parse_mode: "Markdown" }
    );
  });

  bot.onText(/\/ajuda/, (msg) => {
    const chatId = msg.chat.id;
    bot!.sendMessage(chatId,
      "📋 *Comandos disponíveis:*\n\n" +
      "/start - Iniciar conversa\n" +
      "/status - Ver ordens de serviço\n" +
      "/ajuda - Ver esta mensagem\n\n" +
      "💬 Ou simplesmente digite sua dúvida técnica sobre motores diesel!",
      { parse_mode: "Markdown" }
    );
  });

  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    bot!.sendMessage(chatId,
      "🔍 *Suas Ordens de Serviço:*\n\n" +
      "Para consultar suas OS, entre em contato com a retífica informando seu nome.\n\n" +
      "📞 Sistema TechMotor",
      { parse_mode: "Markdown" }
    );
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith("/")) return;

    try {
      await bot!.sendChatAction(chatId, "typing");

      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Você é um especialista técnico em retífica de motores diesel da empresa TechMotor. Responda de forma clara, objetiva e técnica. Use emojis para tornar a resposta mais amigável. Sempre em português brasileiro."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 500,
      });

      const reply = response.choices[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";
      await bot!.sendMessage(chatId, reply, { parse_mode: "Markdown" });

    } catch (error: any) {
      console.error("Erro no bot Telegram:", error.message);
      await bot!.sendMessage(chatId, "⚠️ Erro ao processar sua mensagem. Tente novamente.");
    }
  });

  bot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error.message);
  });
}

export function sendTelegramNotification(chatId: number, message: string) {
  if (!bot) return;
  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
}
