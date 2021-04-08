const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('confirmAddress');

scene.sceneText = ctx => {
  ctx.reply('Your addres is ' + ctx.session.city + ', ' +
    ctx.session.address + '?', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : [
        [{text : '✅ YES'}, {text : '🔄 NO'}], [{text : '◀ CANCEL'}]
      ]
    }
  });
}
scene.sceneLeave = ctx => {
  ctx.scene.leave();
  commands.setting(ctx);
}
scene.enter(scene.sceneText);
scene.hears('🔄 NO', ctx => ctx.scene.enter('city'));
scene.hears('✅ YES', ctx => {
  db.query('UPDATE main.users SET city = ?, address = ? WHERE id = ?', [
    ctx.session.city,
    ctx.session.address,
    ctx.update.message.chat.id
  ]);
  send(ctx, 'Thanks', {
    reply_markup : {
      resize_keyboard : true,
      one_time_keyboard : true,
      keyboard : [
        [{text : '🏠 HOME'}, {text : '🔐 PRIVACY'}]
      ]
    }
  })
  ctx.scene.leave();
});
scene.hears('◀ CANCEL', scene.sceneLeave);
scene.start(scene.sceneLeave);
scene.on('message', scene.sceneText);

module.exports = scene;
