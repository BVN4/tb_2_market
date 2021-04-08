module.exports = async ctx => {
  send(ctx, 'Settings', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [
        [{text : '✏ PERSONAL DATA'}, {text : '🔐 PRIVACY'}],
        [{text : '✉ NEWS'}, {text : '📖 ABOUT'}],
        [{text : '❓ HELP'}, {text : '◀ BACK'}]
      ]
    }
  });
};
