module.exports = async ctx => {
  send(ctx, 'http://www.bettercallmax.ru/', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [[{text : '◀ BACK'}]]
    }
  });
};
