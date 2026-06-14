import telebot
from telebot import types
import sqlite3
import subprocess
import os
import urllib.parse
from datetime import datetime

TOKEN = "8633244755:AAFtlF1vkG5sIS_vfvgcTPDifA1odeMW1EY"
bot = telebot.TeleBot(TOKEN)

def db_query(query, params=(), fetch=False):
    conn = sqlite3.connect('database/engine_specs.db')
    cursor = conn.cursor()
    cursor.execute(query, params)
    res = cursor.fetchall() if fetch else None
    conn.commit()
    conn.close()
    return res

# --- MENUS ---
def menu_principal():
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    markup.add('🆕 Nova OS', '⚙️ Produção', '💰 Orçamentos', '📊 Status Geral', '📱 Falar com Cliente')
    return markup

@bot.message_handler(commands=['start', 'menu'])
def start(message):
    bot.send_message(message.chat.id, "🏢 **TECHMOTOR ERP v4.3**\nSistema de Gestão e Produção Online", reply_markup=menu_principal(), parse_mode='Markdown')

# --- GESTÃO DE OS ---
@bot.message_handler(func=lambda m: m.text == '🆕 Nova OS')
def nova_os(message):
    msg = bot.reply_to(message, "📝 Digite: Cliente - Motor - Contato\n(Ex: Joao - Cummins 6CT - 1199999999)")
    bot.register_next_step_handler(msg, salvar_os)

def salvar_os(message):
    try:
        p = message.text.split('-')
        db_query("INSERT INTO ordens_servico (cliente_nome, motor_modelo, cliente_contato, status) VALUES (?, ?, ?, ?)", (p[0].strip(), p[1].strip(), p[2].strip(), 'Aguardando'))
        bot.reply_to(message, "✅ OS Criada com Sucesso!")
    except:
        bot.reply_to(message, "❌ Erro! Use o formato: Cliente - Motor - Contato")

# --- PRODUÇÃO ---
@bot.message_handler(func=lambda m: m.text == '⚙️ Produção')
def menu_producao(message):
    markup = types.InlineKeyboardMarkup(row_width=2)
    for s in ['Lavagem', 'Usinagem', 'Montagem']:
        markup.add(types.InlineKeyboardButton(s, callback_data=f"setor_{s}"))
    bot.send_message(message.chat.id, "🛠 **Selecione o Setor:**", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith('setor_'))
def acao_prod(call):
    setor = call.data.split('_')[1]
    markup = types.InlineKeyboardMarkup()
    markup.add(types.InlineKeyboardButton("▶️ Iniciar", callback_data=f"iniciar_{setor}"),
               types.InlineKeyboardButton("⏹️ Finalizar", callback_data=f"finalizar_{setor}"))
    bot.edit_message_text(f"Setor: {setor}", call.message.chat.id, call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith(('iniciar_', 'finalizar_')))
def reg_prod(call):
    acao, setor = call.data.split('_')
    msg = bot.send_message(call.message.chat.id, f"🔢 ID da OS para {acao} em {setor}:")
    bot.register_next_step_handler(msg, salvar_producao, acao, setor)

def salvar_producao(message, acao, setor):
    os_id = message.text
    agora = datetime.now().strftime('%d/%m %H:%M')
    if acao == 'iniciar':
        db_query("INSERT INTO producao (os_id, setor, operador, inicio) VALUES (?, ?, ?, ?)", (os_id, setor, message.from_user.first_name, agora))
        db_query("UPDATE ordens_servico SET status = ? WHERE id = ?", (f"Em {setor}", os_id))
        bot.reply_to(message, f"✅ OS #{os_id} iniciada em {setor}")
    else:
        db_query("UPDATE producao SET fim = ?, status = 'FIM' WHERE os_id = ? AND setor = ? AND fim IS NULL", (agora, os_id, setor))
        bot.reply_to(message, f"🏁 OS #{os_id} finalizada em {setor}")

# --- FINANCEIRO E CLIENTE ---
@bot.message_handler(func=lambda m: m.text == '💰 Orçamentos')
def menu_orc(message):
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    markup.add('➕ Add Item', '📄 Gerar Orçamento PDF', '🔙 Sair')
    bot.send_message(message.chat.id, "💰 Financeiro", reply_markup=markup)

@bot.message_handler(func=lambda m: m.text == '➕ Add Item')
def add_item_msg(message):
    msg = bot.reply_to(message, "Digite: ID_OS - Descricao - Valor\n(Ex: 1 - Bronzinas - 350.00)")
    bot.register_next_step_handler(msg, salvar_item)

def salvar_item(message):
    try:
        p = message.text.split('-')
        db_query("INSERT INTO itens_orcamento (os_id, descricao, valor, tipo) VALUES (?, ?, ?, 'Geral')", (p[0].strip(), p[1].strip(), float(p[2].strip())))
        bot.reply_to(message, "✅ Item salvo!")
    except: bot.reply_to(message, "❌ Erro no formato!")

@bot.message_handler(func=lambda m: m.text == '📱 Falar com Cliente')
def falar_cliente(message):
    msg = bot.reply_to(message, "🔢 ID da OS para contato:")
    bot.register_next_step_handler(msg, link_whatsapp)

def link_whatsapp(message):
    os_id = message.text
    d = db_query("SELECT cliente_nome, cliente_contato, motor_modelo FROM ordens_servico WHERE id=?", (os_id,), fetch=True)
    if d:
        nome, fone, motor = d[0]
        fone_limpo = "".join(filter(str.isdigit, fone))
        if not fone_limpo.startswith('55'): fone_limpo = '55' + fone_limpo
        txt = urllib.parse.quote(f"Olá {nome}! O motor {motor} (OS #{os_id}) já está em processo na TechMotor.")
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("🟢 Abrir WhatsApp", url=f"https://wa.me/{fone_limpo}?text={txt}"))
        bot.send_message(message.chat.id, f"Link para OS #{os_id}:", reply_markup=markup)
    else: bot.reply_to(message, "❌ OS não encontrada.")

@bot.message_handler(func=lambda m: m.text == '📊 Status Geral')
def status(message):
    dados = db_query("SELECT id, cliente_nome, status FROM ordens_servico", fetch=True)
    txt = "📊 **PRODUÇÃO ATUAL:**\n"
    for d in dados: txt += f"OS #{d[0]} | {d[1]} | `{d[2]}`\n"
    bot.send_message(message.chat.id, txt or "Nenhuma OS aberta.", parse_mode='Markdown')

bot.infinity_polling()
