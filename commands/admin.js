module.exports = async ctx => {
  const admin = is_admin(ctx);

  if(!admin) return commands.home(ctx);

  let keyboard = [[{text : '🏪 ADD SHOP'}]];

  if(admin == 2){
    // keyboard[0].push({text : '📄 ADD FLYEL'});
    keyboard[0].push({text : '👥 USERS'});
  }

  send(ctx, 'Admin panel', {
    reply_markup : {
      resize_keyboard : true,
      keyboard : keyboard
    }
  });
};
