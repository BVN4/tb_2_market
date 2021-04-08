module.exports = async ctx => {
  let text = '/settings — Settings\n' +
    '/help — Support\n' +
    '/about — About\n' +
    '/start — Home\n' +
    '/off — Disable bot subscription\n' +
    '/on — Enable bot subscription\n' +
    'Select the section below and get help.';

    send(ctx, text, {
      reply_markup : {
        resize_keyboard : true,
        keyboard : [
          [{text : '◀ BACK'}]
        ]
      }
    });
};
