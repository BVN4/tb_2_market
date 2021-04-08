module.exports = async ctx => {

  // Удалите этот код, когда функция вновь должна быть доступной
  return send(ctx, 'Oops! This section is temporarily unavailable', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [[{text : '◀ BACK'}]]
    }
  });

  send(ctx, 'Personal data', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [
        [{text : '✏ NAME'}, {text : '✏ ADDRESS'}],
        [{text : '✏ SEND CONTACT'}, {text : '◀ BACK'}]
      ]
    }
  });
};
