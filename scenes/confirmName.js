const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('confirmName');

scene.sceneText = ctx => {
  ctx.reply('Your name is ' + ctx.session.name + '?', {
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
scene.hears('🔄 NO', ctx => ctx.scene.enter('name'));
scene.hears('✅ YES', ctx => {
  db.query('UPDATE main.users SET name = ? WHERE id = ?', [
    ctx.session.name,
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
