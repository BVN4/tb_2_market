module.exports = async ctx => {
  send(ctx, 'Это бот...', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [
        [{text : '◀ BACK'}]
      ]
    }
  });
};
