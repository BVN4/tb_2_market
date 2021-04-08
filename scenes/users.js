const { Scenes } = require('telegraf');

const scene = new Scenes.BaseScene('users');

scene.sceneText = ctx => {
  delete ctx.session.user;
  const users = db.query('SELECT * FROM users');

  let keyboard = [];
  for(let i = 0; i < users.length; i++){
    let name = users[i].first_name;
    if(users[i].username) name += ' @' + users[i].username;
    if(users[i].admin == 1) name += ' - moder';
    if(users[i].admin == 2) name += ' - admin';
    keyboard.push([{text : name, callback_data : users[i].id}]);
  }

  send(ctx, 'Select user from the list:', {
    reply_markup : {
      resize_keyboard : true,
      inline_keyboard : keyboard
    }
  });
};

scene.sceneLeave = ctx => {
  delete ctx.session.user;
  ctx.scene.leave();
  commands.home(ctx);
}

scene.enter(scene.sceneText);
scene.start(scene.sceneLeave);
scene.action('back', scene.sceneText);
scene.action('moderator', async ctx => {
  db.query('UPDATE users SET admin = 1 WHERE id = ?', [ctx.session.user.id]);
  send(ctx, 'The user has become moderator!\nNow he can add new shops', {
    reply_markup : {
      resize_keyboard : true,
      inline_keyboard : [[
        {text : '◀ BACK', callback_data : ctx.session.user.id}
      ]]
    }
  });
});
scene.action('un_moderator', async ctx => {
  db.query('UPDATE users SET admin = 0 WHERE id = ?', [ctx.session.user.id]);
  send(ctx, 'User is no longer moderator!', {
    reply_markup : {
      resize_keyboard : true,
      inline_keyboard : [[
        {text : '◀ BACK', callback_data : ctx.session.user.id}
      ]]
    }
  });
});
scene.action('location', async ctx => {
  await ctx.deleteMessage();
  await ctx.replyWithLocation(ctx.session.user.latitude,
    ctx.session.user.longitude, {
    reply_markup : {
      resize_keyboard : true,
      inline_keyboard : [
        [{text : '◀ BACK', callback_data : ctx.session.user.id}]
      ]
    }
  });
});
scene.action(/.+/, async ctx => {
  let user = db.query('SELECT * FROM users WHERE id = ?', [ctx.match[0]]);
  if(!user.length) return scene.sceneLeave(ctx);

  user = user[0];

  ctx.session.user = user;

  let text = user.first_name;
  if(user.last_name) text += ' ' + user.last_name;
  if(user.username) text += ' @' + user.username;
  if(user.name) text += '\nCustom name: "' + user.name + '"';
  if(user.phone) text += '\nPhone: +' + user.phone;
  if(user.city) text += '\nAddress: ' + user.city + ', ' +
    user.address;

  let keyboard = [{text : '◀ BACK', callback_data : 'back'}];

  if(!user.admin)
    keyboard.push({text : '✔ SET MODERATOR', callback_data : 'moderator'});
  if(user.admin == 1){
    text += '\n - moderator';
    keyboard.push({text : '❌ UNSET MODERATOR', callback_data : 'un_moderator'});
  }
  if(user.admin == 2) text += '\n - administrator';

  if(user.latitude && user.longitude)
    keyboard.push({text : '🌐 GET LOCATION', callback_data : 'location'});

  send(ctx, text, {
    reply_markup : {
      resize_keyboard : true,
      inline_keyboard : [keyboard]
    }
  });

});
scene.on('message', scene.sceneLeave);

module.exports = scene;
