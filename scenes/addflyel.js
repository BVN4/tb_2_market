const { Scenes } = require('telegraf');
const axios = require('axios');
const fs = require('fs');

const scene = new Scenes.BaseScene('addflyel');

scene.sceneText = ctx => ctx.reply('Please send PDF', {
  reply_markup : {
    resize_keyboard : true,
    keyboard : [[{text : '🏠 HOME'}]]
  }
});
scene.sceneLeave = ctx => {
  ctx.scene.leave();
  commands.home(ctx);
}

scene.enter(scene.sceneText);
scene.hears('🏠 HOME', scene.sceneLeave);
scene.start(scene.sceneLeave);
scene.on('message', async ctx => {
  if(!ctx.update.message.document) return scene.sceneText(ctx);
  if(ctx.update.message.document.mime_type != 'application/pdf')
    return scene.sceneText(ctx);

  const id = ctx.update.message.document.file_id;
  await ctx.telegram.getFileLink(id).then(url => {
    axios({ url : url.href, responseType: 'stream' }).then(response => {
      response.data.pipe(fs.createWriteStream('./flyel.pdf'))
        .on('finish', () => ctx.reply('Loading is complete!', {
          reply_markup : {
            resize_keyboard : true,
            keyboard : [[{text : '🏠 HOME'}]]
          }
        })).on('error', console.log);
    });
  });

});

module.exports = scene;
