module.exports = async (ctx, type) => {
  let user = db.query('SELECT * FROM main.users WHERE id = ?', [ctx.chat.id]);

  const date = new Date().toString().slice(0,21);

  if(!user.length){
    if(!ctx.message) return;
    user = { first_name : ctx.message.from.first_name };
    db.query('INSERT INTO main.users (id, first_name, last_name, username, language_code, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
      ctx.message.from.id,
      ctx.message.from.first_name ? ctx.message.from.first_name : '',
      ctx.message.from.last_name ? ctx.message.from.last_name : '',
      ctx.message.from.username ? ctx.message.from.username : '',
      ctx.message.from.language_code ? ctx.message.from.language_code : '',
      date
    ]);
  }else user = user[0];

  let text = !type ? 'Home'
    : 'Welcome, ' + user.first_name + '!\n' +
      'To use the bot, use the buttons\n' +
      date + '\n' + '@LidlOfferteItalia';

  let keyboard = [
    [{text : '🌐 SHOP NEARBY', request_location : true}, {text : '📄 FLYEL'}],
    [{text : '📃 SHOPS'}, {text : '🔧 SETTING'}]
  ];

  if(user.admin) keyboard.push([{text : '⭐ ADMIN'}]);

  ctx.reply(text, {
    reply_markup : {
      resize_keyboard : true,
      keyboard : keyboard
    }
  });
};
