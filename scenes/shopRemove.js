const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('shopRemove');

scene.sceneText = ctx => {
  ctx.reply('<b>Are you sure you want to delete the shop?</b>\nThis action cannot be reversed.\nAfter deleting, a backup copy of the shop data go to this chat', {
    parse_mode : 'html',
    reply_markup : {
      resize_keyboard : true,
      one_time_keyboard : true,
      keyboard : [
        [{text : '✅ YES'}, {text : '❎ NO'}]
      ]
    }
  });
}
scene.sceneLeave = ctx => {
  ctx.scene.leave();
  commands.home(ctx);
}
scene.enter(scene.sceneText);
scene.hears('❎ NO', scene.sceneLeave);
scene.hears('✅ YES', ctx => {
  const shops = db.query('SELECT * FROM shops WHERE id = ?',
    [ctx.session.shopUpdate]);
  if(!shops.length) return scene.sceneLeave();
  const shop = shops[0];

  db.query('DELETE FROM shops WHERE id = ?',
    [ctx.session.shopUpdate]);

  const fields = ['mon','tue','wed','thu','fri','sat','sun','holiday'];
  for(let i = 0; i < fields.length; i++)
    if(shop[fields[i]] != '0') shop[fields[i]] = JSON.parse(shop[fields[i]]);

  ctx.reply('Shop deleted\n<pre><code>' + JSON.stringify(shop, null, 2) + '</code></pre>', {
    parse_mode : 'html',
  });

  ctx.scene.leave();
});
scene.on('message', scene.sceneText);

module.exports = scene;
