const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('contact');

scene.sceneText = ctx => ctx.reply('Please share your phone number', {
  reply_markup : {
    resize_keyboard : true,
    keyboard : [
      [{text : '◀ CANCEL'}, {text : '📱 SEND', request_contact : true}]
    ]
  }
});
scene.sceneLeave = ctx => {
  ctx.scene.leave();
  commands.setting(ctx);
}

scene.enter(scene.sceneText);
scene.hears('◀ CANCEL', scene.sceneLeave);
scene.start(scene.sceneLeave);
scene.on('message', ctx => {
  if(!ctx.update.message.contact) return scene.sceneText(ctx);

  db.query('UPDATE main.users SET phone = ? WHERE id = ?', [
    ctx.update.message.contact.phone_number,
    ctx.update.message.contact.user_id
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

module.exports = scene;
