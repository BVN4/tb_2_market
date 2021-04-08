module.exports = async ctx => {
  send(ctx, 'Privacy', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [
        [{text : '◀ BACK'}]
      ]
    }
  });
};
